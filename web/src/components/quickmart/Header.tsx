"use client";

import { Search, MapPin, ShoppingCart, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ storeName, tagline, address }: { storeName: string, tagline: string, address: string }) {
  return (
    <header className="bg-white dark:bg-dark-background transition-colors duration-300">
      {/* Top Header - Store Info */}
      <div className="px-4 py-4 border-b border-gray-50 dark:border-dark-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-black text-secondary dark:text-primary leading-none uppercase tracking-tighter transition-colors">
              {storeName}
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest">{tagline}</p>
          </div>
          <div className="flex gap-4">
            <User size={20} className="text-gray-600 dark:text-gray-300" />
            <div className="relative">
              <ShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                0
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <MapPin size={14} className="text-secondary dark:text-primary" />
          <span className="font-medium">{address}</span>
          <span className="text-secondary dark:text-primary font-bold ml-1">Change</span>
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-50 px-4 py-2 glass-effect border-b border-white/20 transition-all duration-300">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search for 'milk', 'bread' or 'mangoes'..."
            className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-sm border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
    </header>
  );
}
