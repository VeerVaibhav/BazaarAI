import { createClient } from '@supabase/supabase-js';

// ─── Credentials ─────────────────────────────────────────────────────────────
// SAFE:  anon/public key — subject to Row Level Security. Fine in mobile apps.
// NEVER: service_role key — bypasses RLS. Server-side only. Never commit it.

const SUPABASE_URL = 'https://wflvvdfxvikgswexammw.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbHZ2ZGZ4dmlrZ3N3ZXhhbW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjg1NDgsImV4cCI6MjA5Mzc0NDU0OH0.' +
  'DpDdS3L0LxPDF64JNDoNWTWrM0Dw1weT_Jd5Y4ZVJcs';

// ─── Client ───────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,      // Keeps the user logged in between app launches
    autoRefreshToken: true,    // Silently refreshes the JWT before expiry
    detectSessionInUrl: false, // Not needed in React Native (no URL bar)
  },
});

// ─── Typed helpers (add more as your schema grows) ────────────────────────────

export type SupabaseClient = typeof supabase;
