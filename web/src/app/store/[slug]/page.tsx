"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import GridTemplate from "@/components/templates/GridTemplate";
import ListTemplate from "@/components/templates/ListTemplate";
import DarkTemplate from "@/components/templates/DarkTemplate";
import QuickMartTemplate from "@/components/templates/QuickMartTemplate";
import { MapPin, ShoppingBag, ExternalLink, Share2, Search, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const getMockStore = (slug: string, forceTemplate?: string) => ({
  name: slug.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
  location: "Indore, Madhya Pradesh",
  template: forceTemplate || (slug.includes("dark") ? "dark" : slug.includes("quick") ? "quickmart" : "grid"),
  products: [
    { id: 1, name: "Premium Basmati Rice", price: "₹120/kg", category: "Grains", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300" },
    { id: 2, name: "Cold Pressed Coconut Oil", price: "₹250/500ml", category: "Oils", image: "https://images.unsplash.com/photo-1620912189865-1e8a33da4c59?auto=format&fit=crop&q=80&w=300" },
    { id: 3, name: "Organic Honey", price: "₹350/250g", category: "Sweeteners", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=300" },
    { id: 4, name: "Whole Wheat Flour", price: "₹65/kg", category: "Grains", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300" },
    { id: 5, name: "Handmade Soap", price: "₹45/unit", category: "Personal Care", image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&q=80&w=300" },
    { id: 6, name: "Spiced Tea Blend", price: "₹180/100g", category: "Beverages", image: "https://images.unsplash.com/photo-1544787210-2213d84ad96b?auto=format&fit=crop&q=80&w=300" },
  ]
});

// Implementation aligned with instructions.md (using Supabase later)
function StoreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const templateOverride = searchParams.get("template");
  
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    // In real app (aligned with instructions.md):
    // const { data: shop } = await supabase.from('shops').select('*').eq('slug', slug).eq('is_published', true).single();
    // const { data: products } = await supabase.from('products').select('*').eq('shop_id', shop.id).eq('is_verified', true);
    // setStore({ ...shop, products });
    
    // For now, use mock aligned with structure
    setStore(getMockStore(slug, templateOverride || undefined));
  }, [slug, templateOverride]);

  if (!store) return <div className="min-h-screen flex items-center justify-center">Loading Store...</div>;

  const isDark = store.template === "dark";

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDark ? "bg-black" : "bg-neutral-50"}`}>
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${isDark ? "bg-black/80 border-white/10" : "bg-white/80 border-neutral-200"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "bg-blue-600 shadow-lg shadow-blue-600/20"}`}>
              <ShoppingBag className={`w-5 h-5 ${isDark ? "text-black" : "text-white"}`} />
            </div>
            <h1 className={`font-black text-xl tracking-tight ${isDark ? "text-white" : "text-neutral-900"}`}>{store.name}</h1>
          </div>
          <div className="flex gap-2">
            <button className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-neutral-100 text-neutral-600"}`}>
              <Search className="w-5 h-5" />
            </button>
            <button className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-neutral-100 text-neutral-600"}`}>
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Store Information Bar */}
      <div className={`border-b ${isDark ? "bg-neutral-900/50 border-white/5" : "bg-white border-neutral-100"}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Live on BazaarAI
            </div>
            <h2 className={`text-3xl font-black ${isDark ? "text-white" : "text-neutral-900"}`}>{store.name}</h2>
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {store.location}</div>
              <div className="flex items-center gap-1"><Info className="w-4 h-4" /> 9:00 AM - 10:00 PM</div>
            </div>
          </div>
          <button className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 ${isDark ? "bg-green-500 text-black hover:bg-green-400" : "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20"}`}>
            Open in Maps <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Template */}
      <AnimatePresence mode="wait">
        <motion.div
          key={store.template}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
        >
          {store.template === "grid" && <GridTemplate store={store} />}
          {store.template === "list" && <ListTemplate store={store} />}
          {store.template === "dark" && <DarkTemplate store={store} />}
          {store.template === "quickmart" && <QuickMartTemplate store={store} />}
        </motion.div>
      </AnimatePresence>

      {/* Template Switcher (Debug/Demo) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-full shadow-2xl flex gap-2 z-[100]">
        {["grid", "list", "dark", "quickmart"].map((t) => (
          <button
            key={t}
            onClick={() => setStore({ ...store, template: t })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${store.template === t ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Storefront() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Store...</div>}>
      <StoreContent />
    </Suspense>
  );
}
