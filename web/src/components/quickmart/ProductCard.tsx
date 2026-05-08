"use client";

import Image from "next/image";
import { Plus } from "lucide-react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand: string;
    quantity: string;
    price: number;
    originalPrice?: number;
    image: string;
  };
  viewType?: "grid" | "list";
}

export default function ProductCard({ product, viewType = "grid" }: ProductCardProps) {
  const isList = viewType === "list";

  return (
    <div 
      className={`product-card-base border rounded-[--radius-product] cinematic-shadow overflow-hidden transition-all duration-500 ${
        isList 
          ? "flex items-center p-4 gap-5 bg-white dark:bg-white/5 border-b-4 border-b-secondary/10" 
          : "flex flex-col p-3 h-full hover:border-primary/50 bg-white dark:bg-transparent"
      }`}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5 flex-shrink-0 transition-all duration-500 ${
        isList ? "w-28 h-28 shadow-inner" : "aspect-square mb-3"
      }`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className={`object-cover ${isList ? "p-1" : ""}`}
        />
        {product.originalPrice && !isList && (
          <div className="absolute top-2 left-2 glass-effect bg-secondary/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      
      {/* Content Section */}
      <div className={`flex flex-col flex-1 ${isList ? "h-full py-1" : ""}`}>
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{product.brand}</p>
          {isList && product.originalPrice && (
            <span className="bg-secondary/10 text-secondary text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              Save ₹{product.originalPrice - product.price}
            </span>
          )}
        </div>
        
        <h3 className={`${isList ? "text-base mb-2" : "text-[11px] mb-1"} font-black text-secondary dark:text-gray-100 line-clamp-2 leading-tight transition-colors`}>
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[10px] text-gray-400 font-medium bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
            {product.quantity}
          </p>
          {isList && <span className="text-[10px] text-gray-300">|</span>}
          {isList && <span className="text-[10px] text-secondary font-bold italic">In Stock</span>}
        </div>
        
        <div className={`flex items-center justify-between ${isList ? "mt-auto pt-2 border-t border-gray-100 dark:border-white/5" : "mt-auto"}`}>
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[9px] text-gray-400 line-through font-bold tracking-tighter">₹{product.originalPrice}</span>
            )}
            <span className={`${isList ? "text-lg" : "text-sm"} font-black text-secondary dark:text-primary tracking-tight`}>
              ₹{product.price}
            </span>
          </div>
          
          <button 
            className={`transition-all font-black flex items-center justify-center gap-2 shadow-lg ${
              isList 
                ? "bg-secondary text-white hover:bg-secondary/90 px-6 py-2.5 rounded-2xl text-xs" 
                : "bg-white dark:bg-white/10 border border-secondary/30 text-secondary dark:text-primary hover:bg-secondary hover:text-white px-4 py-1.5 rounded-xl text-[10px]"
            }`}
          >
            <Plus size={isList ? 18 : 14} strokeWidth={3} />
            {isList ? "ADD TO CART" : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}
