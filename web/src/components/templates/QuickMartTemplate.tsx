"use client";

import { useState, useEffect } from "react";
import Header from "@/components/quickmart/Header";
import CategoryBar from "@/components/quickmart/CategoryBar";
import ProductCard from "@/components/quickmart/ProductCard";
import SkeletonCard from "@/components/quickmart/SkeletonCard";
import WhatsAppButton from "@/components/quickmart/WhatsAppButton";
import Footer from "@/components/quickmart/Footer";
import { LayoutGrid, List, Moon, Sun, ChevronRight, ShoppingCart } from "lucide-react";

export default function QuickMartTemplate({ store }: { store: any }) {
  // Extract categories dynamically from products
  const uniqueCategories = Array.from(new Set(store.products.map((p: any) => p.category)));
  const categories = [
    { id: "all", name: "All Items", icon: "" },
    ...uniqueCategories.map((c: any, i) => ({ id: String(i + 1), name: c, icon: "" }))
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const formattedProducts = store.products.map((p: any) => ({
    ...p,
    price: parseInt(p.price.replace(/\D/g, "")) || 0, // Convert string price to number for QuickMart ProductCard
    originalPrice: parseInt(p.price.replace(/\D/g, "")) + 50 || 0,
    isPopular: true
  }));

  const filteredProducts = formattedProducts.filter((p: any) => 
    (selectedCategory === "all" || p.category === categories.find(c => c.id === selectedCategory)?.name) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const popularProducts = formattedProducts.slice(0, 4); // First 4 as popular

  const storeInfo = {
    name: store.name,
    tagline: "Your daily needs, delivered fast.",
    address: store.location || "Local Shop",
    whatsapp: "+910000000000",
    timing: "8:00 AM - 10:00 PM"
  };

  return (
    <main className={`min-h-screen bg-[#FDFDFD] dark:bg-[#0D0D0D] max-w-md mx-auto relative shadow-2xl transition-colors duration-700 ${isDark ? "dark" : ""}`}>
      <div className="transition-all duration-700">
        <Header 
          storeName={storeInfo.name} 
          tagline={storeInfo.tagline} 
          address={storeInfo.address} 
        />

        {/* View Controls - Glassmorphism */}
        <div className="sticky top-[52px] z-40 glass-effect px-4 py-2 border-b border-white/10 flex items-center justify-between transition-all duration-300">
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl backdrop-blur-md">
            <button 
              onClick={() => setViewType("grid")}
              className={`p-1.5 rounded-lg transition-all duration-500 ${viewType === "grid" ? "bg-white dark:bg-white/10 shadow-lg text-secondary" : "text-gray-400"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewType("list")}
              className={`p-1.5 rounded-lg transition-all duration-500 ${viewType === "list" ? "bg-white dark:bg-white/10 shadow-lg text-secondary" : "text-gray-400"}`}
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 dark:text-yellow-400 transition-all duration-500"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <CategoryBar 
          categories={categories} 
          selectedId={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Popular Near You - Horizontal Scroll Section */}
        <section className="mt-6">
          <div className="px-4 flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-[0.1em] dark:text-gray-100">Popular Near You</h2>
            <button className="text-secondary text-xs font-bold flex items-center gap-0.5 hover:gap-1 transition-all">
              EXPLORE <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 hide-scrollbar snap-x">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="min-w-[160px]">
                  <SkeletonCard />
                </div>
              ))
            ) : (
              popularProducts.map((product: any, index: number) => (
                <div 
                  key={product.id} 
                  className="min-w-[160px] snap-center"
                >
                  <ProductCard product={product} viewType="grid" />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Promo Banner - Static */}
        <div className="px-4 mt-6">
          <div className="bg-gradient-to-br from-primary/30 to-primary/5 dark:from-primary/20 dark:to-transparent rounded-3xl p-6 border border-primary/20 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h3 className="text-lg font-black text-secondary dark:text-primary uppercase leading-none mb-1 tracking-tight">Mega Savings</h3>
              <p className="text-[10px] font-bold text-secondary/70 dark:text-primary/80 uppercase tracking-widest">Freshness delivered in 10 mins</p>
            </div>
            <div className="text-secondary dark:text-primary relative z-10">
              <div>
                <ShoppingCart size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Essentials Grid - Static */}
        <section className="mt-10 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.1em] dark:text-gray-100">
              {categories.find(c => c.id === selectedCategory)?.name || "All Products"}
            </h2>
            {viewType === "grid" && (
              <span className="text-[10px] text-gray-400 font-bold uppercase">Scroll Right →</span>
            )}
          </div>
          
          <div className={`${
            viewType === "grid" 
              ? "flex overflow-x-auto gap-4 pb-8 hide-scrollbar snap-x" 
              : "grid grid-cols-1 gap-4 pb-10"
          }`}>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className={viewType === "grid" ? "min-w-[140px]" : "w-full"}>
                  <SkeletonCard />
                </div>
              ))
            ) : (
              <>
                {filteredProducts.map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className={viewType === "grid" ? "min-w-[140px] snap-center" : "w-full"}
                  >
                    <ProductCard product={product} viewType={viewType} />
                  </div>
                ))}
              </>
            )}
          </div>
          
          {!isLoading && filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-400 font-medium italic">No matches found for your search...</p>
            </div>
          )}
        </section>

        <Footer 
          storeName={storeInfo.name}
          address={storeInfo.address}
          timing={storeInfo.timing}
          phone={storeInfo.whatsapp}
        />
      </div>

      <WhatsAppButton phone={storeInfo.whatsapp} />
      
      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-40 max-w-md mx-auto">
        <div className="flex flex-col items-center gap-1 text-secondary">
          <div className="w-1 h-1 rounded-full bg-secondary mb-1"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-[10px] font-bold uppercase tracking-widest">Categories</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
        </div>
      </div>
    </main>
  );
}
