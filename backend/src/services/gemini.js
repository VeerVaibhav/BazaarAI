const axios = require('axios');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyze a camera frame and detect products on shelves.
 * @param {string} base64ImageString — raw base64 WITHOUT data URI prefix
 * @returns {Array} detected products
 */
async function analyzeFrame(base64ImageString) {
  try {
    const url = `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`;

    const { data } = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a product recognition AI. Look at this image of a shop shelf. 
Identify every distinct product you can see. 
Return ONLY a valid JSON array with no extra text, no markdown, no code fences. Format: 
[{"name": string, "brand": string, "quantity": string, "category": string}]
If no products visible, return empty array: []
Category must be one of: grocery, beverage, snack, dairy, personal_care, household, medicine, other`,
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64ImageString,
                },
              },
            ],
          },
        ],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim();

    return JSON.parse(text);
  } catch (err) {
    console.error('[gemini:analyzeFrame]', err.message);
    return [];
  }
}

/**
 * Extract structured product info from scraped markdown.
 * @param {string} scrapedMarkdown
 * @param {string} productName
 * @returns {Object} { price, unit, specs, source }
 */
async function extractProductInfo(scrapedMarkdown, productName) {
  try {
    const url = `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`;

    const { data } = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a product data extractor. 
Here is scraped content from an ecommerce site for "${productName}":

${scrapedMarkdown.slice(0, 3000)}

Extract the FIRST matching product only.
Return ONLY valid JSON, no markdown, no extra text:
{
  "price": "₹XX" or null if not found,
  "unit": "XXg or XXml or XX pack" or null,
  "specs": "brief description max 100 chars" or null,
  "source": "JioMart"
}`,
              },
            ],
          },
        ],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, '').trim();

    return JSON.parse(text);
  } catch (err) {
    console.error('[gemini:extractProductInfo]', err.message);
    return { price: null, unit: null, specs: null, source: 'JioMart' };
  }
}

module.exports = { analyzeFrame, extractProductInfo };
