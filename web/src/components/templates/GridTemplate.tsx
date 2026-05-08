import { motion } from "framer-motion";

export default function GridTemplate({ store }: { store: any }) {
  return (
    <div className="bg-[#fdfdfd] min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-20 text-center">
          <span className="cinematic-text mb-4 block">Curated Selection</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight text-neutral-900">{store.name}</h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {store.products.map((product: any) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[4/5] overflow-hidden mb-6 bg-neutral-100">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale opacity-90" 
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
              <div className="space-y-1">
                <span className="cinematic-text text-[10px]">{product.category}</span>
                <h3 className="text-lg font-medium text-neutral-800 tracking-wide">{product.name}</h3>
                <p className="text-neutral-900 font-bold">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
