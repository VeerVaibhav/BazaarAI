"use client";

import { motion } from "framer-motion";
import { Carrot, Apple, Egg, CookingPot as Bread, Cookie, CupSoda, Sparkles, Waves } from "lucide-react";

const iconMap: Record<string, any> = {
  carrot: Carrot,
  apple: Apple,
  egg: Egg,
  bread: Bread,
  cookie: Cookie,
  "cup-soda": CupSoda,
  sparkles: Sparkles,
  waves: Waves,
};

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryBarProps {
  categories: Category[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function CategoryBar({ categories, selectedId, onSelect }: CategoryBarProps) {
  return (
    <div className="flex overflow-x-auto gap-3 py-4 px-4 hide-scrollbar bg-white dark:bg-dark-background border-b border-gray-50 dark:border-dark-border transition-colors duration-300">
      {categories.map((cat) => {
        const IconComponent = iconMap[cat.icon];
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center min-w-[70px] transition-all ${
              selectedId === cat.id ? "scale-105" : "opacity-80"
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1.5 transition-colors ${
              selectedId === cat.id ? "bg-primary shadow-sm" : "bg-muted dark:bg-dark-muted"
            }`}>
              {IconComponent ? (
                <IconComponent 
                  size={24} 
                  className={selectedId === cat.id ? "text-secondary" : "text-gray-500"} 
                />
              ) : (
                <Carrot size={24} className="text-gray-300" />
              )}
            </div>
            <span className={`text-[11px] font-semibold whitespace-nowrap ${
              selectedId === cat.id ? "text-secondary dark:text-primary" : "text-gray-600 dark:text-gray-400"
            }`}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
