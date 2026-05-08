# 👻 Ghost Inventory — Backend API

AI-powered backend that lets small shopkeepers scan shelves via camera, auto-detect products, fetch real prices, and generate a live digital storefront.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env and fill in your keys
cp .env.example .env

# 3. Run in development mode
npm run dev

# 4. Run in production
npm start
```

## 🔑 Environment Variables

| Key                   | Description                        |
| --------------------- | ---------------------------------- |
| `PORT`                | Server port (default: 3000)        |
| `SUPABASE_URL`        | Your Supabase project URL          |
| `SUPABASE_SERVICE_KEY` | Supabase service role key          |
| `GEMINI_API_KEY`      | Google Gemini 1.5 Flash API key    |
| `FIRECRAWL_API_KEY`   | Firecrawl API key for web scraping |

## 🗄️ Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor to create the `shops` and `products` tables.

---

## 📡 API Endpoints

### Health Check

```
GET /
```

**Response:**
```json
{ "status": "ok", "app": "Ghost Inventory API" }
```

---

### 📷 Scan — Detect Products from Camera Frame

```
POST /api/scan
```

**Body:**
```json
{
  "frame": "base64_image_string_or_data_uri",
  "shopId": "uuid (optional — saves detected products to this shop)"
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "products": [
    { "name": "Parle-G Biscuits", "brand": "Parle", "quantity": "200g", "category": "snack" },
    { "name": "Amul Butter", "brand": "Amul", "quantity": "100g", "category": "dairy" },
    { "name": "Surf Excel", "brand": "HUL", "quantity": "1kg", "category": "household" }
  ]
}
```

> ⚡ Rate limited: 30 requests/minute per IP

---

### 💰 Enrich — Get Real Pricing for a Product

```
POST /api/enrich
```

**Body:**
```json
{
  "productName": "Parle-G Biscuits 200g",
  "productId": "uuid (optional — updates this product in DB)"
}
```

**Response:**
```json
{
  "success": true,
  "enriched": true,
  "productId": "uuid or null",
  "data": {
    "price": "₹10",
    "unit": "200g",
    "specs": "Glucose biscuits, India's most loved",
    "source": "JioMart"
  }
}
```

---

### 🏪 Shop — CRUD Operations

#### Create Shop

```
POST /api/shop/create
```

**Headers:** `x-owner-id: uuid` (or pass `owner_id` in body)

**Body:**
```json
{
  "owner_id": "uuid",
  "shop_name": "Sharma General Store",
  "slug": "sharma-store",
  "template": "grid",
  "location": "Delhi"
}
```

**Response (201):**
```json
{
  "success": true,
  "shop": { "id": "uuid", "slug": "sharma-store", ... }
}
```

#### Get Shop (Public Storefront)

```
GET /api/shop/:slug
```

**Response:**
```json
{
  "success": true,
  "shop": { ... },
  "products": [ /* only verified products */ ]
}
```

#### Publish Shop

```
POST /api/shop/:id/publish
```

**Headers:** `x-owner-id: uuid`

**Body:**
```json
{ "owner_id": "uuid" }
```

**Response:**
```json
{ "success": true, "url": "/store/sharma-store" }
```

#### Get All Products (Admin)

```
GET /api/shop/:id/products
```

**Response:**
```json
{
  "success": true,
  "products": [ /* all products including unverified */ ]
}
```

---

### 📦 Product — CRUD Operations

#### Update Product

```
PUT /api/product/:id
```

**Body (partial update):**
```json
{
  "price": "₹15",
  "is_verified": true
}
```

**Response:**
```json
{ "success": true, "product": { ... } }
```

#### Delete Product

```
DELETE /api/product/:id
```

**Response:**
```json
{ "success": true }
```

#### Bulk Insert Products

```
POST /api/product/bulk
```

**Body:**
```json
{
  "shop_id": "uuid",
  "products": [
    { "name": "Maggi Noodles", "brand": "Nestle", "quantity": "70g", "category": "grocery" },
    { "name": "Coca Cola", "brand": "Coca Cola", "quantity": "300ml", "category": "beverage" }
  ]
}
```

**Response:**
```json
{ "success": true, "inserted": 2 }
```

---

## 🚢 Deployment (Railway)

1. Push to GitHub
2. Connect repo in [Railway](https://railway.app)
3. Add all `.env` variables in Railway dashboard
4. Railway auto-detects `railway.json` and deploys

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── scan.js        # Camera frame → product detection
│   │   ├── enrich.js       # Product name → real pricing
│   │   ├── shop.js         # Shop CRUD + publish
│   │   └── product.js      # Product CRUD + bulk insert
│   ├── services/
│   │   ├── gemini.js       # Gemini 1.5 Flash (vision + text)
│   │   ├── firecrawl.js    # Web scraping (JioMart + BigBasket)
│   │   └── supabase.js     # Database client
│   ├── middleware/
│   │   └── auth.js         # Basic ownership check
│   └── index.js            # Express entry point
├── supabase/
│   └── schema.sql          # Database schema
├── .env.example
├── railway.json
├── package.json
└── README.md
```

## License

ISC
