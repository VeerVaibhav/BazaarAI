const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (
  SUPABASE_URL &&
  SUPABASE_SERVICE_KEY &&
  /^https?:\/\//i.test(SUPABASE_URL)
) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
} else {
  console.warn(
    '⚠️  Supabase not configured — set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env. DB operations will be skipped.'
  );
}

module.exports = supabase;
