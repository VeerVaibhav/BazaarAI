"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Camera, 
  X, 
  Loader2, 
  ArrowLeft,
  Store,
  MapPin,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: string;
  brand: string;
  category: string;
  image_url: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  location: string;
  template_id: string;
  products: Product[];
}

export default function ManageStore() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [shop, setShop] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    image_url: ""
  });

  useEffect(() => {
    const shops: StoreData[] = JSON.parse(localStorage.getItem("bazaarai_shops") || "[]");
    const found = shops.find((s) => s.slug === slug);
    
    if (found) {
      setShop(found);
      setTempAddress(found.location);
    } else {
      const demoShop = {
        id: "demo-" + slug,
        name: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        slug: slug,
        location: "",
        template_id: "grid",
        products: []
      };
      setShop(demoShop);
      setTempAddress(demoShop.location);
    }
    setLoading(false);
  }, [slug]);

  const saveToLocal = (updatedShop: StoreData) => {
    const shops: StoreData[] = JSON.parse(localStorage.getItem("bazaarai_shops") || "[]");
    const index = shops.findIndex(s => s.slug === slug);
    if (index > -1) shops[index] = updatedShop;
    else shops.push(updatedShop);
    localStorage.setItem("bazaarai_shops", JSON.stringify(shops));
    setShop(updatedShop);
  };

  const handleUpdateAddress = () => {
    if (!shop) return;
    saveToLocal({ ...shop, location: tempAddress });
    setIsEditingAddress(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !shop) return;
    const product: Product = {
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9),
      image_url: newProduct.image_url || "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400"
    };
    saveToLocal({ ...shop, products: [...shop.products, product] });
    setAddingProduct(false);
    setNewProduct({ name: "", price: "", brand: "", category: "", image_url: "" });
  };

  const handleDeleteProduct = (id: string) => {
    if (!shop) return;
    saveToLocal({ ...shop, products: shop.products.filter(p => p.id !== id) });
  };

  const simulateAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setNewProduct({
        name: "Premium Coffee Beans 250g",
        price: "₹450",
        brand: "Blue Tokai",
        category: "Beverages",
        image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400"
      });
      setIsScanning(false);
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push(`/store/${slug}`)} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 dark:text-white" /></button>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Manage {shop?.name}</h1>
              <p className="text-neutral-500">Edit shop details and inventory.</p>
            </div>
          </div>
          <button onClick={() => setAddingProduct(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"><Plus className="w-5 h-5" /> Add Product</button>
        </div>

        {/* Shop Settings */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <MapPin className="w-5 h-5 text-blue-600" />
               <h3 className="font-bold dark:text-white">Shop Address</h3>
            </div>
            {!isEditingAddress ? (
              <button onClick={() => setIsEditingAddress(true)} className="text-sm text-blue-600 font-bold hover:underline">Edit</button>
            ) : (
              <button onClick={handleUpdateAddress} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-blue-700 transition-colors"><Save className="w-4 h-4" /> Save</button>
            )}
          </div>
          {isEditingAddress ? (
            <textarea 
              className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm min-h-[100px] resize-none"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              autoFocus
            />
          ) : (
            <p className="text-neutral-500 text-sm px-1">{shop?.location}</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="text-neutral-400 text-[10px] uppercase font-black tracking-widest mb-1">Products</div>
            <div className="text-2xl font-black dark:text-white">{shop?.products.length || 0}</div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
            <div className="text-neutral-400 text-[10px] uppercase font-black tracking-widest mb-1">Status</div>
            <div className="text-2xl font-black text-green-500">Live</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold dark:text-white">Product Inventory</h2>
          {shop?.products.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800"><ShoppingBag className="w-12 h-12 text-neutral-200 mx-auto mb-4" /><p className="text-neutral-500 font-medium">Your inventory is empty</p></div>
          ) : (
            <div className="grid gap-3">
              {shop?.products.map((p) => (
                <div key={p.id} className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between group shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"><img src={p.image_url} alt="" className="w-full h-full object-cover" /></div>
                    <div>
                      <h4 className="font-bold dark:text-white">{p.name}</h4>
                      <div className="flex items-center gap-2"><span className="text-blue-600 font-black">{p.price}</span><span className="text-neutral-300">•</span><span className="text-xs text-neutral-500">{p.category}</span></div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(p.id)} className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {addingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddingProduct(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 relative z-10">
              <div className="p-8 pb-4 flex items-center justify-between"><h3 className="text-2xl font-bold dark:text-white">New Product</h3><button onClick={() => setAddingProduct(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"><X className="w-6 h-6 text-neutral-400" /></button></div>
              <div className="p-8 pt-4 space-y-6">
                <button onClick={simulateAIScan} disabled={isScanning} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 p-1 rounded-2xl group active:scale-[0.98] transition-all disabled:opacity-70">
                  <div className="bg-white dark:bg-neutral-900 rounded-[0.9rem] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Camera className="w-5 h-5 text-blue-600" /></div><div className="text-left"><p className="text-sm font-bold dark:text-white">AI Inventory Scan</p><p className="text-xs text-neutral-500">Auto-fill product details from photo</p></div></div>
                    <div className="text-blue-600 font-bold text-xs">{isScanning ? "Scanning..." : "Try AI →"}</div>
                  </div>
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2"><label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Product Name</label><input type="text" placeholder="e.g. Basmati Rice 1kg" className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Price</label><input type="text" placeholder="₹0.00" className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Brand</label><input type="text" placeholder="e.g. Tata" className="w-full px-5 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} /></div>
                </div>
              </div>
              <div className="p-8 pt-0"><button onClick={handleAddProduct} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all">Save to Inventory</button></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
