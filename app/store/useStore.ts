import { create } from 'zustand';

// ─── Domain Types ─────────────────────────────────────────────────────────────
// Mirrors the locked Supabase schema exactly.

export interface Shop {
  id: string;
  shop_name: string;
  slug: string;
  template: 'grid' | 'list' | 'dark';
  location?: string;
  is_published: boolean;
}

export interface Product {
  /** Stable local ID (makeId()). Separate from Supabase UUID after bulk save. */
  id: string;
  name: string;
  brand: string;
  quantity: string;   // text in DB schema
  category: string;   // one of CATEGORIES
  price: string;
  specs: string;
  /** Transient UI-only flag — never persisted to DB */
  isEnriching: boolean;
}

// ─── Store Shape ──────────────────────────────────────────────────────────────
// Matches the required shape from instructions(MUST READ).md exactly:
// { ownerId, shop: { id, shop_name, slug, template, is_published }, scannedProducts }

interface AppState {
  // Auth / session — set after onboarding
  ownerId: string | null;
  shop: Shop | null;

  // Product list: populated during scan, read by admin
  scannedProducts: Product[];

  // Auth setters
  setOwnerId: (id: string) => void;
  setShop: (shop: Shop) => void;
  clearSession: () => void;

  // Product actions
  setScannedProducts: (products: Product[]) => void;
  updateProductById: (id: string, updates: Partial<Omit<Product, 'id'>>) => void;
  addProduct: (product: Product) => void;
  removeProductById: (id: string) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useStore = create<AppState>((set) => ({
  ownerId: null,
  shop: null,
  scannedProducts: [],

  setOwnerId: (id) => set({ ownerId: id }),
  setShop: (shop) => set({ shop }),
  clearSession: () => set({ ownerId: null, shop: null, scannedProducts: [] }),

  setScannedProducts: (products) => set({ scannedProducts: products }),

  updateProductById: (id, updates) =>
    set((state) => ({
      scannedProducts: state.scannedProducts.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  addProduct: (product) =>
    set((state) => ({
      scannedProducts: [...state.scannedProducts, product],
    })),

  removeProductById: (id) =>
    set((state) => ({
      scannedProducts: state.scannedProducts.filter((p) => p.id !== id),
    })),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stable unique ID without external deps. */
export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
