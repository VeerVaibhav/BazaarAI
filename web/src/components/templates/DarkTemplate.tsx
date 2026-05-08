import { motion } from "framer-motion";

export default function DarkTemplate({ store }: { store: any }) {
  return (
    <div className="bg-[#050505] min-h-screen py-20 px-6 text-white selection:bg-neutral-800">
      <div className="max-w-7xl mx-auto">
        {/* Cinematic Header */}
        <header className="mb-32 relative">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-neutral-800/20 rounded-full blur-[120px]" />
          <span className="cinematic-text text-neutral-600 mb-4 block">Limited Edition</span>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white opacity-90">{store.name}</h2>
          <div className="h-1 w-20 bg-neutral-800 mt-8" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-900 border border-neutral-900">
          {store.products.map((product: any) => (
            <div key={product.id} className="relative bg-[#080808] overflow-hidden aspect-[16/9]">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover opacity-30 grayscale" 
              />
              
              {/* Static Glass Overlay Content */}
              <div className="absolute inset-x-8 bottom-8 p-8 glass-light backdrop-blur-3xl border border-white/5 flex justify-between items-end">
                <div className="space-y-2">
                  <span className="cinematic-text text-neutral-800 text-[9px] font-bold">{product.category}</span>
                  <h3 className="text-2xl font-light tracking-tight text-black leading-none">{product.name}</h3>
                  <p className="text-sm text-neutral-600 font-medium">{product.price}</p>
                </div>
                <button className="bg-black text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cinematic Footer */}
        <footer className="mt-40 text-center border-t border-neutral-900 pt-20">
          <span className="cinematic-text opacity-30">© 2026 {store.name} — All Rights Reserved.</span>
        </footer>
      </div>
    </div>
  );
}
