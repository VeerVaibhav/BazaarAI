# BaazarAI — Team Integration Instructions
> Give this file to your AI before starting. Every member follows this.
> This ensures all 3 projects compile, connect, and work together without conflicts.

---

## What We Are Building

BaazarAI is an AI-powered digital storefront generator for small kirana shops.
A shopkeeper records a video of their shelves. AI detects products, fetches real prices,
and auto-generates a live shareable storefront at baazarai.app/store/their-shop-name.

There are 3 separate projects built by 3 separate members that must work together:

```
Member 1 → /backend      Node.js + Express API (AI pipeline, scraping, database)
Member 2 → /app          React Native + Expo (Android app, AR scan, admin panel)
Member 3 → /web          Next.js (storefront pages, search, landing page)
```

All three live in the same GitHub repo. All three talk to the same Supabase database.
Member 2 and Member 3 both call Member 1's backend API.

---

## CRITICAL: Rules Every Member Must Follow

```
1. NEVER change the API contract (endpoint URLs, request body shape, response shape)
   If you need to change an API — tell the whole team first.

2. NEVER change the Supabase table names or column names
   Schema is locked. It lives in /supabase/schema.sql.

3. ALWAYS use the shared constants file for URLs and keys
   Never hardcode URLs anywhere except /shared/constants.js

4. ALWAYS handle API errors gracefully
   Never crash if the backend is slow or returns an error.

5. NEVER commit .env files
   .env is gitignored. Share keys via WhatsApp/Discord with the team.

6. ALWAYS test your piece against the real backend URL before saying it's done
   Don't assume — verify.

7. Branch names are fixed:
   member-1-backend / member-2-app / member-3-web
   PR into dev only. Never push directly to main.
```

---

## Shared Constants File

This file is the single source of truth for all URLs and config.
It lives at `/shared/constants.js` in the root of the repo.
Every project imports from here.

```javascript
// /shared/constants.js
// UPDATE THESE AS DEPLOYMENTS GO LIVE

export const CONFIG = {
  // Member 1 updates this when Railway deploys
  BACKEND_URL: 'http://localhost:3000',
  // 'https://baazarai-backend.railway.app'  ← replace when live

  // Supabase — same for everyone
  SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

  // App config
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
    'other'
  ]
}
```

---

## Supabase Schema (Locked — Do Not Modify)

```sql
create extension if not exists "uuid-ossp";

create table shops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,
  shop_name text not null,
  slug text unique not null,
  template text not null default 'grid'
    check (template in ('grid', 'list', 'dark')),
  location text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references shops(id) on delete cascade,
  name text not null,
  brand text,
  quantity text,
  category text,
  price text,
  specs text,
  image_url text,
  is_verified boolean default false,
  created_at timestamp with time zone default now()
);

create index on shops(slug);
create index on products(shop_id);
create index on products using gin(
  to_tsvector('english', name || ' ' || coalesce(brand, ''))
);
```

Run this once in your Supabase project SQL editor. Everyone shares the same project.

---

## API Contract (Locked — Member 1 Owns This, Others Consume It)

These are the exact endpoint signatures. Member 2 and Member 3 must use these exactly.

### POST /api/scan
```
REQUEST:
{
  frame: string,      // base64 JPEG, with or without data URI prefix
  shopId: string      // optional UUID, saves products to DB if provided
}

RESPONSE (200):
{
  success: true,
  count: number,
  products: [
    {
      name: string,
      brand: string,
      quantity: string,
      category: string
    }
  ]
}

RESPONSE (400):
{ success: false, error: "frame is required" }

RESPONSE (500):
{ success: false, error: string }
```

### POST /api/enrich
```
REQUEST:
{
  productName: string,   // e.g. "Maggi Masala Noodles"
  productId: string      // optional UUID, updates DB row if provided
}

RESPONSE (200):
{
  success: true,
  enriched: true,
  productId: string | null,
  data: {
    price: string | null,    // "₹14"
    unit: string | null,     // "70g"
    specs: string | null,    // "Contains wheat, masala flavour"
    source: string           // "JioMart"
  }
}

RESPONSE (200, not found):
{
  success: true,
  enriched: false,
  data: { price: null, unit: null, specs: null, source: null }
}
```

### POST /api/shop/create
```
REQUEST:
{
  owner_id: string,    // UUID from Supabase auth
  shop_name: string,   // "Ramesh Kirana"
  slug: string,        // "ramesh-kirana" (auto-generated on frontend)
  template: string,    // "grid" | "list" | "dark"
  location: string     // optional
}

RESPONSE (201):
{
  success: true,
  shop: { id, owner_id, shop_name, slug, template, location, is_published, created_at }
}

RESPONSE (409):
{ success: false, error: "Shop URL already taken. Try a different name." }
```

### GET /api/shop/:slug
```
RESPONSE (200):
{
  shop: { id, shop_name, slug, template, location, is_published },
  products: [
    { id, name, brand, quantity, category, price, specs, image_url }
    // only is_verified = true products returned here
  ]
}

RESPONSE (404):
{ success: false, error: "Shop not found" }
```

### GET /api/shop/:id/products
```
// Admin only — returns ALL products including unverified
RESPONSE (200):
{
  products: [
    { id, name, brand, quantity, category, price, specs, image_url, is_verified }
  ]
}
```

### POST /api/shop/:id/publish
```
REQUEST:
{ owner_id: string }

RESPONSE (200):
{
  success: true,
  url: "/store/ramesh-kirana"
}

RESPONSE (400):
{ success: false, error: "Add at least one product before publishing" }

RESPONSE (403):
{ success: false, error: "Unauthorized" }
```

### PUT /api/product/:id
```
REQUEST (send only fields you want to update):
{
  name?: string,
  brand?: string,
  quantity?: string,
  category?: string,
  price?: string,
  specs?: string,
  is_verified?: boolean
}

RESPONSE (200):
{ success: true, product: { ...updatedFields } }
```

### DELETE /api/product/:id
```
RESPONSE (200):
{ success: true }
```

### POST /api/product/bulk
```
REQUEST:
{
  shop_id: string,
  products: [{ name, brand, quantity, category }]
}

RESPONSE (200):
{ success: true, inserted: number }
```

---

## Member 1 — Backend Instructions

**Your folder:** `/backend`
**Your stack:** Node.js + Express + Supabase + Gemini API + Firecrawl API
**Your deploy target:** Railway

### Your Job
- Build and maintain all API endpoints listed above
- Integrate Gemini 1.5 Flash for vision (frame analysis) and text (spec extraction)
- Integrate Firecrawl for JioMart/BigBasket scraping
- Connect to shared Supabase instance
- Deploy to Railway and share the live URL with the team

### Folder Structure You Must Follow
```
backend/
├── src/
│   ├── routes/
│   │   ├── scan.js
│   │   ├── enrich.js
│   │   ├── shop.js
│   │   └── product.js
│   ├── services/
│   │   ├── gemini.js
│   │   ├── firecrawl.js
│   │   └── supabase.js
│   ├── middleware/
│   │   └── auth.js
│   └── index.js
├── .env
├── .env.example
├── railway.json
└── package.json
```

### Your .env Keys
```
PORT=3000
SUPABASE_URL=
SUPABASE_SERVICE_KEY=        ← service role key (not anon)
GEMINI_API_KEY=
FIRECRAWL_API_KEY=
```

### Non-Negotiable Requirements
- CORS must be enabled for ALL origins: `cors({ origin: '*' })`
- express.json limit must be `'20mb'` — frames are large base64 strings
- Every route wrapped in try/catch — never crash the server
- All responses are JSON — never return HTML errors
- Health check at GET / returns `{ status: 'ok', app: 'BaazarAI API' }`
- railway.json must exist for Railway to detect the project

### When You Deploy
Update `/shared/constants.js` BACKEND_URL with your Railway URL.
Tell Member 2 and Member 3 immediately so they can test against it.

---

## Member 2 — Mobile App Instructions

**Your folder:** `/app`
**Your stack:** React Native + Expo + Expo Camera
**Your deploy target:** Expo EAS Build → Android APK

### Your Job
- Build the AR scan screen (camera + canvas overlay + frame extraction)
- Build the admin panel (product table, inline editing, enrich, publish)
- Build the onboarding screen (phone OTP, shop name, template picker)
- Call Member 1's backend API for all AI operations
- Use Supabase JS client for auth only

### Folder Structure You Must Follow
```
app/
├── screens/
│   ├── OnboardingScreen.js
│   ├── ScanScreen.js
│   └── AdminScreen.js
├── components/
│   ├── ProductRow.js       ← single editable row in admin table
│   ├── AROverlay.js        ← canvas overlay component
│   └── TemplateCard.js     ← template picker card
├── services/
│   ├── api.js              ← all backend API calls live here
│   └── supabase.js         ← auth only
├── store/
│   └── shopStore.js        ← global state (shop, owner_id, products)
├── constants.js            ← imports from /shared/constants.js
├── app.json
└── package.json
```

### Your .env / constants
```javascript
// app/constants.js
import { CONFIG } from '../shared/constants.js'
export const BACKEND_URL = CONFIG.BACKEND_URL
export const SUPABASE_URL = CONFIG.SUPABASE_URL
export const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY
```

### API Service Layer (Write All Calls Here)
```javascript
// app/services/api.js
import { BACKEND_URL } from '../constants'

export const scanFrame = async (base64Frame, shopId = null) => {
  const res = await fetch(`${BACKEND_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frame: base64Frame, shopId })
  })
  return res.json()
}

export const enrichProduct = async (productName, productId = null) => {
  const res = await fetch(`${BACKEND_URL}/api/enrich`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, productId })
  })
  return res.json()
}

export const publishShop = async (shopId, ownerId) => {
  const res = await fetch(`${BACKEND_URL}/api/shop/${shopId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner_id: ownerId })
  })
  return res.json()
}

export const updateProduct = async (productId, fields) => {
  const res = await fetch(`${BACKEND_URL}/api/product/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields)
  })
  return res.json()
}

export const deleteProduct = async (productId) => {
  const res = await fetch(`${BACKEND_URL}/api/product/${productId}`, {
    method: 'DELETE'
  })
  return res.json()
}

export const bulkSaveProducts = async (shopId, products) => {
  const res = await fetch(`${BACKEND_URL}/api/product/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop_id: shopId, products })
  })
  return res.json()
}
```

### Global State Shape (shopStore.js)
```javascript
// This is what you store globally after onboarding
// Both ScanScreen and AdminScreen read from here
{
  ownerId: string,        // Supabase user UUID
  shop: {
    id: string,
    shop_name: string,
    slug: string,
    template: string,
    is_published: boolean
  },
  scannedProducts: []     // populated during scan, passed to admin
}
```

### AR Scan Screen — Exact Behavior
```
1. Request camera permission on mount
2. Show rear camera feed full screen
3. Position a transparent canvas absolutely on top (same dimensions)
4. Every 2000ms:
   a. Extract frame from video as base64 JPEG quality 0.7
   b. Call scanFrame(base64, shopId)
   c. On response: draw green label boxes on canvas
   d. Merge new products into running deduplicated list
      (deduplicate by lowercased name)
5. Show product count badge at bottom: "14 products detected"
6. "Done Scanning" button:
   a. Call bulkSaveProducts(shopId, scannedProducts)
   b. Navigate to AdminScreen
7. Handle loading/error states — don't freeze UI
```

### Admin Screen — Exact Behavior
```
1. Fetch all products: GET /api/shop/:id/products
2. Display as scrollable table with columns:
   Name | Brand | Quantity | Category | Price | Specs | Actions
3. On mount, call enrichProduct() for each row that has no price
   - Show spinner in Price cell while enriching
   - Populate price + specs when response comes back
   - Run enrichment calls with concurrency limit of 3 (not all at once)
4. Every cell is tappable and inline-editable
5. Each row has: Edit | Delete buttons
6. "Add Product" button adds empty row at top
7. "Publish Store" button:
   a. Call publishShop(shopId, ownerId)
   b. On success: show modal with shareable URL
      "Your store is live at baazarai.app/store/{slug}"
   c. Include a copy button for the URL
```

### Non-Negotiable Requirements
- Never call backend more than once per 2 seconds from scan screen
- Always strip data URI prefix before sending base64 to backend
- Always handle null/undefined from API responses — enrich can return nulls
- Test on real Android device before marking done, not just simulator

---

## Member 3 — Web Instructions

**Your folder:** `/web`
**Your stack:** Next.js 14 (App Router) + Tailwind CSS + Supabase JS
**Your deploy target:** Vercel

### Your Job
- Build the public storefront pages (`/store/[slug]`)
- Build the buyer search page (`/search`)
- Build the landing page (`/`)
- Build the onboarding flow (`/onboarding`) for web users
- Read data directly from Supabase (no backend needed for reads)
- Write to backend API for shop creation only

### Folder Structure You Must Follow
```
web/
├── app/
│   ├── page.js                   ← landing page
│   ├── onboarding/
│   │   └── page.js
│   ├── store/
│   │   └── [slug]/
│   │       └── page.js           ← dynamic storefront
│   └── search/
│       └── page.js
├── components/
│   ├── templates/
│   │   ├── GridTemplate.jsx      ← template 1
│   │   ├── ListTemplate.jsx      ← template 2
│   │   └── DarkTemplate.jsx      ← template 3
│   ├── ProductCard.jsx
│   ├── SearchBar.jsx
│   └── TemplatePreview.jsx       ← used in onboarding picker
├── lib/
│   ├── supabase.js               ← Supabase client
│   └── api.js                    ← backend API calls
├── constants.js                  ← imports from /shared/constants.js
└── package.json
```

### Supabase Client Setup
```javascript
// web/lib/supabase.js
import { createClient } from '@supabase/supabase-js'
import { CONFIG } from '../../shared/constants.js'

export const supabase = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_ANON_KEY
)
```

### Storefront Page — /store/[slug]
```javascript
// Fetch shop + products directly from Supabase
// Do NOT call backend for this — read DB directly for performance

const { data: shop } = await supabase
  .from('shops')
  .select('*')
  .eq('slug', slug)
  .eq('is_published', true)
  .single()

const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('shop_id', shop.id)
  .eq('is_verified', true)

// Then conditionally render template:
if (shop.template === 'grid') return <GridTemplate shop={shop} products={products} />
if (shop.template === 'list') return <ListTemplate shop={shop} products={products} />
if (shop.template === 'dark') return <DarkTemplate shop={shop} products={products} />
```

### Search Page — /search
```javascript
// Full text search across products using Supabase
const { data } = await supabase
  .from('products')
  .select('*, shops(shop_name, slug, location)')
  .textSearch('name', query, { type: 'websearch' })
  .eq('is_verified', true)

// Results grouped by shop
// Each result shows: product name, price, shop name, shop location
// Tapping shop name → navigate to /store/[slug]
```

### Onboarding — /onboarding
```
Step 1: Phone number input → Supabase OTP auth
        Use: supabase.auth.signInWithOtp({ phone: '+91XXXXXXXXXX' })
        Then: supabase.auth.verifyOtp({ phone, token, type: 'sms' })

Step 2: Shop name input
        Auto-generate slug preview as they type:
        "Ramesh Kirana" → "ramesh-kirana"
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

Step 3: Template picker
        Show 3 cards with thumbnail previews
        User selects one

Step 4: On submit → POST to backend:
        fetch(`${BACKEND_URL}/api/shop/create`, {
          method: 'POST',
          body: JSON.stringify({ owner_id, shop_name, slug, template, location })
        })
        On success → show "Now download the app to scan your products"
        Display app download link (Expo EAS APK link from Member 2)
```

### Three Templates — What They Must Look Like

**GridTemplate** (template = 'grid')
- White background
- Shop name + location header
- 3-column product card grid
- Each card: image placeholder (gray box), product name, brand, price in green
- Responsive, works on mobile

**ListTemplate** (template = 'list')
- White/light gray background
- Full-width rows
- Each row: left image placeholder, right side has name + brand + quantity + specs + price
- More information density than grid

**DarkTemplate** (template = 'dark')
- Black/very dark background (#0a0a0a)
- Neon green accents (#00ff88)
- Same grid layout as GridTemplate
- Price in neon green
- Cards with dark gray border

### Non-Negotiable Requirements
- /store/[slug] must work server-side rendered (SSR) — use async server component
- If shop not found or not published: show 404 page with "This store is not available"
- Search must debounce input by 400ms before querying Supabase
- All three templates must accept identical props: `{ shop, products }`
  (so they are truly swappable with no conditional logic inside templates)
- Mobile responsive — storefront must look good on phone browser

---

## Integration Checklist (Run Before Saying Your Part Is Done)

### Member 1 Must Verify
- [ ] GET / returns 200 `{ status: 'ok' }`
- [ ] POST /api/scan with a real base64 image returns a products array
- [ ] POST /api/enrich with "Maggi" returns a price
- [ ] POST /api/shop/create creates a row in Supabase
- [ ] GET /api/shop/:slug returns shop + products
- [ ] POST /api/shop/:id/publish sets is_published = true in DB
- [ ] Railway URL is live and shared with team
- [ ] CORS works from localhost:3001 (Next.js) and Expo

### Member 2 Must Verify
- [ ] Camera opens on Android without crashing
- [ ] Frame extraction sends base64 to backend successfully
- [ ] Detected products appear as overlay labels on camera
- [ ] Admin panel loads products from backend
- [ ] Enrich populates prices in the table
- [ ] Inline editing works and saves via PUT /api/product/:id
- [ ] Publish button shows the shareable URL
- [ ] APK builds successfully via `eas build`

### Member 3 Must Verify
- [ ] /store/[slug] loads a real shop from Supabase
- [ ] All 3 templates render the same shop data correctly
- [ ] /search returns results for "Maggi"
- [ ] /onboarding creates a shop via backend API
- [ ] Slug auto-generation works correctly
- [ ] Deployed to Vercel with correct env vars
- [ ] SSR works — page loads without JS for buyers

---

## Communication Protocol

When Member 1 deploys to Railway:
→ Update `/shared/constants.js` BACKEND_URL immediately
→ Message team with the URL

When Member 3 deploys to Vercel:
→ Message team with the live storefront URL for testing

When anyone changes a shared interface (API shape, DB column, constant):
→ Tell the whole team BEFORE merging
→ Update this instructions.md accordingly

When something breaks during integration:
→ Check the browser/app network tab first
→ Check Railway logs second
→ Then ask the team

---

## Quick Reference

| What | Value |
|---|---|
| Project Name | BaazarAI |
| GitHub Repo | github.com/[your-org]/baazarai |
| Supabase Project | [shared project URL — fill in] |
| Backend (local) | http://localhost:3000 |
| Backend (live) | https://[railway URL — fill in when deployed] |
| Web (local) | http://localhost:3001 |
| Web (live) | https://baazarai.vercel.app |
| Main DB tables | shops, products |
| Template values | 'grid', 'list', 'dark' |
| Category values | grocery, beverage, snack, dairy, personal_care, household, medicine, other |
