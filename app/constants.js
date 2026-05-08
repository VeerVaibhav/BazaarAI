// app/constants.js
// Per instructions: imports from app/shared/constants.js
// This file is the single bridge between the shared config and the app screens.

import { CONFIG } from './shared/constants.js';

export const BACKEND_URL = CONFIG.BACKEND_URL;
export const SUPABASE_URL = CONFIG.SUPABASE_URL;
export const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
export const STORE_BASE_URL = CONFIG.STORE_BASE_URL;
export const APP_NAME = CONFIG.APP_NAME;
export const CATEGORIES = CONFIG.CATEGORIES;
export const TEMPLATES = CONFIG.TEMPLATES;
export const GEMINI_API_KEY = CONFIG.GEMINI_API_KEY;
export const GEMINI_BACKUP_KEY = CONFIG.GEMINI_BACKUP_KEY;
export const GROQ_API_KEY = CONFIG.GROQ_API_KEY;

