// app/services/gemini.ts
// Vision scanning service.
// PRIMARY:  Groq API  — meta-llama/llama-4-scout-17b-16e-instruct (fast)
// FALLBACK: Gemini API — gemini-3.1-flash-lite

import { GROQ_API_KEY, GEMINI_API_KEY, GEMINI_BACKUP_KEY } from '../constants.js';

// ─── Endpoints ────────────────────────────────────────────────────────────────

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

// ─── Retry config ─────────────────────────────────────────────────────────────

const RETRYABLE_CODES = new Set([429, 503]);
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 600;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Prompt ───────────────────────────────────────────────────────────────────

const SCAN_PROMPT = `You are a retail product scanner AI. Analyze this image of a store shelf or product.

Identify ALL clearly visible retail products. For each product return:
- name: full descriptive name with size/variant (e.g. "Coca-Cola 500ml", "Maggi 2-Minute Noodles Masala 70g")
- brand: brand name only
- quantity: how many units of this product are visible (as a string number, e.g. "3")
- category: exactly one of [grocery, beverage, snack, dairy, personal_care, household, medicine, other]

Rules:
1. Return ONLY a valid JSON array. No markdown, no explanation, no code fences.
2. If no products are visible or image is unclear, return exactly: []
3. Be specific with product names — include flavour, size, variant where visible.
4. Estimate quantity conservatively.

Example response:
[{"name":"Lay's Classic Salted 26g","brand":"Lay's","quantity":"4","category":"snack"},{"name":"Amul Taaza Toned Milk 1L","brand":"Amul","quantity":"2","category":"dairy"}]`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GeminiProduct {
  name: string;
  brand: string;
  quantity: string;
  category: string;
}

// ─── JSON parser (shared) ─────────────────────────────────────────────────────

function parseProducts(text: string): GeminiProduct[] {
  console.log('[Vision] Raw response text:', text.slice(0, 300));

  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) {
    console.warn('[Vision] No JSON array in response:', text.slice(0, 200));
    return [];
  }

  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) return [];

    const results = parsed
      .filter((item: any) => item && typeof item.name === 'string' && item.name.length > 0)
      .map((item: any) => ({
        name: String(item.name || '').trim(),
        brand: String(item.brand || '').trim(),
        quantity: String(item.quantity || '1').trim(),
        category: String(item.category || 'other').trim(),
      }));

    console.log(`[Vision] Parsed ${results.length} product(s):`, results.map((r) => r.name));
    return results;
  } catch (parseErr) {
    console.error('[Vision] JSON.parse failed:', parseErr, '| Raw:', match[0].slice(0, 200));
    return [];
  }
}

// ─── Groq single attempt ──────────────────────────────────────────────────────

async function attemptGroq(base64Image: string): Promise<GeminiProduct[]> {
  const res = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SCAN_PROMPT },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });

  console.log(`[Vision:Groq] HTTP ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Vision:Groq] Error body:`, errText.slice(0, 400));
    const err: any = new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? '[]';
  return parseProducts(text);
}

// ─── Gemini single attempt ────────────────────────────────────────────────────

async function attemptGemini(apiKey: string, base64Image: string): Promise<GeminiProduct[]> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SCAN_PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  console.log(`[Vision:Gemini] HTTP ${res.status} ${res.statusText}`);

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Vision:Gemini] Error body:`, errText.slice(0, 400));
    const err: any = new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  if (data?.promptFeedback?.blockReason) {
    console.warn('[Vision:Gemini] Blocked:', data.promptFeedback.blockReason);
    return [];
  }
  if (!data?.candidates?.length) {
    console.warn('[Vision:Gemini] No candidates:', JSON.stringify(data).slice(0, 200));
    return [];
  }

  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
  return parseProducts(text);
}

// ─── Retry wrapper ────────────────────────────────────────────────────────────

async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Vision:${label}] Attempt ${attempt}/${MAX_RETRIES}`);
      const result = await fn();
      console.log(`[Vision:${label}] ✓ Success on attempt ${attempt}`);
      return result;
    } catch (err: any) {
      const isRetryable = RETRYABLE_CODES.has(err?.status ?? 0);
      if (isRetryable && attempt < MAX_RETRIES) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        console.warn(`[Vision:${label}] ${err.status} retryable — waiting ${backoff}ms`);
        await sleep(backoff);
      } else {
        console.error(`[Vision:${label}] ✗ Failed after ${attempt} attempt(s):`, err?.message);
        throw err;
      }
    }
  }
  throw new Error(`[Vision:${label}] Exhausted ${MAX_RETRIES} retries`);
}

// ─── Public: scanFrameWithGemini ──────────────────────────────────────────────
// Chain: Groq (3 retries) → Gemini PRIMARY (3 retries) → Gemini BACKUP (3 retries) → []

export async function scanFrameWithGemini(
  base64Image: string,
): Promise<GeminiProduct[]> {
  const clean = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const payloadKB = Math.round((clean.length * 3) / 4 / 1024);
  console.log(`[Vision] Starting scan — payload ~${payloadKB} KB`);

  // ── 1. Groq (fastest) ──
  try {
    return await withRetry('Groq', () => attemptGroq(clean));
  } catch {
    console.warn('[Vision] Groq exhausted — falling back to Gemini PRIMARY');
  }

  // ── 2. Gemini PRIMARY ──
  try {
    return await withRetry('Gemini-P', () => attemptGemini(GEMINI_API_KEY, clean));
  } catch {
    console.warn('[Vision] Gemini PRIMARY exhausted — falling back to Gemini BACKUP');
  }

  // ── 3. Gemini BACKUP ──
  try {
    return await withRetry('Gemini-B', () => attemptGemini(GEMINI_BACKUP_KEY, clean));
  } catch {
    console.error('[Vision] All providers exhausted. No detection this frame.');
    return [];
  }
}
