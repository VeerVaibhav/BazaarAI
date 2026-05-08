// app/services/api.ts
// ALL backend API calls live here — per instructions(MUST READ).md.
// Screens import from this file. Never fetch directly from screens.

import { BACKEND_URL } from '../constants.js';

export const MOCK_MODE = true; // ← flip to false when backend is live

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SCAN_PRODUCTS = [
  { name: 'Coca-Cola 500ml', brand: 'Coca-Cola', quantity: '1', category: 'beverage' },
  { name: 'Pringles Original', brand: "Kellogg's", quantity: '1', category: 'snack' },
  { name: 'Oreo Biscuits', brand: 'Nabisco', quantity: '1', category: 'snack' },
  { name: 'Maggi Masala', brand: 'Nestlé', quantity: '2', category: 'grocery' },
  { name: 'Amul Butter', brand: 'Amul', quantity: '1', category: 'dairy' },
  { name: 'Dettol Soap', brand: 'Dettol', quantity: '3', category: 'personal_care' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanProduct {
  name: string;
  brand: string;
  quantity: string;   // text per schema
  category: string;
}

export interface ScanResponse {
  success: boolean;
  count: number;
  products: ScanProduct[];
  error?: string;
}

export interface EnrichData {
  price: string | null;
  unit: string | null;
  specs: string | null;
  source: string | null;
}

export interface EnrichResponse {
  success: boolean;
  enriched: boolean;
  productId: string | null;
  data: EnrichData;
}

export interface PublishResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface BulkResponse {
  success: boolean;
  inserted: number;
  error?: string;
}

export interface ShopCreateResponse {
  success: boolean;
  shop?: {
    id: string;
    owner_id: string;
    shop_name: string;
    slug: string;
    template: string;
    location?: string;
    is_published: boolean;
    created_at: string;
  };
  error?: string;
}

export interface ShopProductsResponse {
  products: Array<{
    id: string;
    name: string;
    brand: string;
    quantity: string;
    category: string;
    price: string;
    specs: string;
    image_url?: string;
    is_verified: boolean;
  }>;
}

// ─── POST /api/scan ───────────────────────────────────────────────────────────
// Per contract: field is `frame`, strip data URI prefix before sending.

export async function scanFrame(
  base64Frame: string,
  shopId: string | null = null,
): Promise<ScanResponse> {
  const cleanFrame = base64Frame.replace(/^data:image\/\w+;base64,/, '');

  if (MOCK_MODE) {
    await delay(600);
    if (Math.random() > 0.5) {
      const item = MOCK_SCAN_PRODUCTS[Math.floor(Math.random() * MOCK_SCAN_PRODUCTS.length)];
      return { success: true, count: 1, products: [item] };
    }
    return { success: true, count: 0, products: [] };
  }

  const res = await fetch(`${BACKEND_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frame: cleanFrame, shopId }),
  });
  return res.json();
}

// ─── POST /api/enrich ─────────────────────────────────────────────────────────
// Per contract: body is { productName, productId }.

export async function enrichProduct(
  productName: string,
  productId: string | null = null,
): Promise<EnrichResponse> {
  if (MOCK_MODE) {
    await delay(1200);
    return {
      success: true,
      enriched: true,
      productId,
      data: {
        price: `₹${(Math.random() * 200 + 10).toFixed(0)}`,
        unit: '100g',
        specs: 'AI-enriched product details (mock)',
        source: 'Mock',
      },
    };
  }

  const res = await fetch(`${BACKEND_URL}/api/enrich`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productName, productId }),
  });
  return res.json();
}

// ─── POST /api/shop/create ────────────────────────────────────────────────────

export async function createShop(params: {
  owner_id: string;
  shop_name: string;
  slug: string;
  template: string;
  location?: string;
}): Promise<ShopCreateResponse> {
  if (MOCK_MODE) {
    await delay(800);
    return {
      success: true,
      shop: {
        id: `mock-shop-${Date.now()}`,
        owner_id: params.owner_id,
        shop_name: params.shop_name,
        slug: params.slug,
        template: params.template,
        location: params.location,
        is_published: false,
        created_at: new Date().toISOString(),
      },
    };
  }

  const res = await fetch(`${BACKEND_URL}/api/shop/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

// ─── GET /api/shop/mine?owner_id=:id ─────────────────────────────────────────
// Called after login to detect if the user already has a shop.
// Returns null in mock mode → user always goes through shop setup when testing.

export async function getMyShop(ownerId: string): Promise<{ shop: import('../store/useStore').Shop } | null> {
  if (MOCK_MODE) {
    // Return null in mock mode so shop setup always runs
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/shop/mine?owner_id=${encodeURIComponent(ownerId)}`);
    const data = await res.json();
    if (data.success && data.shop) return { shop: data.shop };
    return null;
  } catch {
    return null;
  }
}

// ─── GET /api/shop/:id/products ───────────────────────────────────────────────
// Admin only — returns ALL products including unverified.

export async function getShopProducts(shopId: string): Promise<ShopProductsResponse> {
  if (MOCK_MODE) {
    await delay(600);
    return {
      products: MOCK_SCAN_PRODUCTS.slice(0, 3).map((p, i) => ({
        id: `mock-${i}`,
        ...p,
        price: '',
        specs: '',
        image_url: undefined,
        is_verified: false,
      })),
    };
  }

  const res = await fetch(`${BACKEND_URL}/api/shop/${shopId}/products`);
  return res.json();
}

// ─── POST /api/shop/:id/publish ───────────────────────────────────────────────
// Per contract: body is { owner_id }.

export async function publishShop(
  shopId: string,
  ownerId: string,
): Promise<PublishResponse> {
  if (MOCK_MODE) {
    await delay(1000);
    return { success: true, url: `/store/mock-shop` };
  }

  const res = await fetch(`${BACKEND_URL}/api/shop/${shopId}/publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ owner_id: ownerId }),
  });
  return res.json();
}

// ─── POST /api/product/bulk ───────────────────────────────────────────────────

export async function bulkSaveProducts(
  shopId: string,
  products: ScanProduct[],
): Promise<BulkResponse> {
  if (MOCK_MODE) {
    await delay(400);
    return { success: true, inserted: products.length };
  }

  const res = await fetch(`${BACKEND_URL}/api/product/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shop_id: shopId, products }),
  });
  return res.json();
}

// ─── PUT /api/product/:id ─────────────────────────────────────────────────────

export async function updateProduct(
  productId: string,
  fields: Partial<{
    name: string;
    brand: string;
    quantity: string;
    category: string;
    price: string;
    specs: string;
    is_verified: boolean;
  }>,
): Promise<{ success: boolean }> {
  if (MOCK_MODE) {
    await delay(150);
    return { success: true };
  }

  const res = await fetch(`${BACKEND_URL}/api/product/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  return res.json();
}

// ─── DELETE /api/product/:id ──────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<{ success: boolean }> {
  if (MOCK_MODE) {
    await delay(150);
    return { success: true };
  }

  const res = await fetch(`${BACKEND_URL}/api/product/${productId}`, {
    method: 'DELETE',
  });
  return res.json();
}
