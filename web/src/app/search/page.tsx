"use client";

import { useState, useEffect } from "react";
import { Search as SearchIcon, MapPin, Store, ArrowRight, Filter, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface SearchResult {
  shopName: string;
  slug: string;
  distance: string;
  products: {
    name: string;
    price: string;
    brand: string;
  }[];
}

const DEMO_PRODUCTS = [
  { name: "Basmati Rice 5kg", price: "₹350", brand: "India Gate" },
  { name: "Amul Butter 500g", price: "₹280", brand: "Amul" },
  { name: "Toor Dal 1kg", price: "₹120", brand: "Tata Sampann" },
  { name: "Sunflower Oil 1L", price: "₹160", brand: "Fortune" },
  { name: "Whole Wheat Atta 10kg", price: "₹420", brand: "Aashirvaad" },
  { name: "Maggi Noodles × 12", price: "₹145", brand: "Nestle" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 1) {
        handleSearch();
      } else if (query.length === 0) {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = () => {
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // 1. Get shops from localStorage
      const localShops = JSON.parse(localStorage.getItem("bazaarai_shops") || "[]");
      
      // 2. Add some demo shops if none exist for a better search experience
      const allShops = localShops.length > 0 ? localShops : [
        { name: "Ramesh Kirana Store", slug: "ramesh-kirana", location: "Market Area" },
        { name: "City Supermarket", slug: "city-super", location: "Downtown" },
        { name: "Fresh & Fast", slug: "fresh-fast", location: "Main Road" }
      ];

      const q = query.toLowerCase();
      const groupedResults: SearchResult[] = [];

      allShops.forEach((shop: any) => {
        // Find products in this shop that match query (or just random ones for demo)
        const matchedProducts = DEMO_PRODUCTS.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.brand.toLowerCase().includes(q) ||
          shop.name.toLowerCase().includes(q)
        );

        if (matchedProducts.length > 0 || shop.name.toLowerCase().includes(q)) {
          groupedResults.push({
            shopName: shop.name,
            slug: shop.slug,
            distance: "0.5 km away",
            products: matchedProducts.length > 0 ? matchedProducts : DEMO_PRODUCTS.slice(0, 2)
          });
        }
      });

      setResults(groupedResults);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search products, brands, or shops..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:border-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {loading && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
              <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors">
                <Filter className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
            {query ? `Results for "${query}"` : "Discover Local Shops"}
          </h2>
          <div className="text-sm text-blue-600 font-medium cursor-pointer flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            Near You
          </div>
        </div>

        <div className="space-y-8">
          {results.length > 0 ? (
            results.map((result, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-4"
              >
                {/* Shop Header */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold dark:text-white leading-tight">{result.shopName}</h3>
                      <p className="text-xs text-neutral-500">{result.distance}</p>
                    </div>
                  </div>
                  <Link 
                    href={`/store/${result.slug}`}
                    className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
                  >
                    Visit Store <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Product List in Shop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.products.map((p, pIdx) => (
                    <div 
                      key={pIdx}
                      className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      <div>
                        <div className="text-xs text-neutral-500 mb-1">{p.brand}</div>
                        <h4 className="font-bold dark:text-white group-hover:text-blue-600 transition-colors">{p.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-blue-600">{p.price}</div>
                        <button className="text-[10px] uppercase font-black tracking-tighter bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-neutral-500 mt-2">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          ) : query.length > 1 && !loading ? (
            <div className="text-center py-20">
              <p className="text-neutral-500 text-lg">No results found for "{query}"</p>
              <p className="text-neutral-400 text-sm">Try searching for something else or browse nearby shops.</p>
            </div>
          ) : !query && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               {[1, 2].map(i => (
                 <div key={i} className="p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-center space-y-4 shadow-sm">
                   <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto">
                     <Store className="w-8 h-8 text-blue-600" />
                   </div>
                   <h3 className="font-bold text-lg dark:text-white">Shop {i === 1 ? "Nearby" : "Featured"}</h3>
                   <p className="text-neutral-500 text-sm">Discover amazing products from shops in your locality.</p>
                   <button className="text-blue-600 font-bold text-sm">Browse All →</button>
                 </div>
               ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
