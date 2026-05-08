import Link from "next/link";
import { Store, Camera, Zap, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center space-y-8">
        
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-neutral-900 dark:text-white">
            Your shop. Online. <span className="text-blue-600">In 30 seconds.</span>
          </h1>
          <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
            BazaarAI helps you create a stunning digital storefront effortlessly. Just point your camera at your shelves, and we do the rest.
          </p>
        </div>

        {/* CTA */}
        <div>
          <Link href="/onboarding" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-blue-600/20">
            List Your Shop Free
            <Zap className="w-5 h-5" />
          </Link>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
              <Camera className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">1. Scan</h3>
            <p className="text-neutral-500">Record a quick video of your products. Our AI identifies them instantly.</p>
          </div>
          
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-lg">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">2. Review</h3>
            <p className="text-neutral-500">We automatically fetch prices and details. You just verify and adjust.</p>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">3. Go Live</h3>
            <p className="text-neutral-500">Pick a template and launch your shareable store link instantly.</p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
