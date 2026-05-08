import { motion } from "framer-motion";

export default function ListTemplate({ store }: { store: any }) {
  return (
    <div className="bg-white min-h-screen py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-24 border-b border-neutral-100 pb-12 flex justify-between items-end">
          <div>
            <span className="cinematic-text mb-2 block">The Collection</span>
            <h2 className="text-5xl font-light text-neutral-900 tracking-tighter">{store.name}</h2>
          </div>
          <span className="cinematic-text pb-2">{store.products.length} Items</span>
        </header>

        <div className="space-y-0">
          {store.products.map((product: any) => (
            <div 
              key={product.id} 
              className="flex items-center gap-12 py-10 border-b border-neutral-50 px-4 -mx-4"
            >
              <div className="w-40 h-40 overflow-hidden bg-neutral-100 flex-shrink-0">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale opacity-80" 
                />
              </div>
              <div className="flex-1 space-y-2">
                <span className="cinematic-text">{product.category}</span>
                <h3 className="text-2xl font-light tracking-tight text-neutral-800">{product.name}</h3>
                <p className="text-neutral-400 text-sm max-w-md">Refined quality and craftsmanship, sourced from the finest origins.</p>
              </div>
              <div className="text-right space-y-4">
                <p className="text-xl font-medium tracking-tighter text-neutral-900">{product.price}</p>
                <button className="cinematic-text border-b border-neutral-900 pb-1">
                  Inquire
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
