// app/shared/constants.js
// Single source of truth for all URLs and config — lives INSIDE app/ per project constraint.
// Member 1: update EXPO_PUBLIC_BACKEND_URL in .env when Railway deploys.
// Secrets come from .env via EXPO_PUBLIC_ prefix (Expo's env var system).

export const CONFIG = {
  // Member 1 updates .env EXPO_PUBLIC_BACKEND_URL when Railway deploys
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL ?? 'http://localhost:3000',

  // Vision APIs — loaded from .env, never hardcoded
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '',
  GEMINI_BACKUP_KEY: process.env.EXPO_PUBLIC_GEMINI_BACKUP_KEY ?? '',
  GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '',

  // Supabase — loaded from .env
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',

  // App config (non-secret, fine to keep here)
  APP_NAME: 'BaazarAI',
  STORE_BASE_URL: 'https://baazarai.app/store',

  // Storefront templates
  TEMPLATES: ['grid', 'list', 'dark'],

  // Product categories (use these exact strings everywhere)
  CATEGORIES: [
    'grocery',
    'beverage',
    'snack',
    'dairy',
    'personal_care',
    'household',
    'medicine',
    'other',
  ],
};
