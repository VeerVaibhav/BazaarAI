"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Store, CheckCircle2, ChevronRight, Rocket, MapPin } from "lucide-react";

const templates = [
  {
    id: "grid",
    name: "Grid View",
    description: "Standard 3-column grid layout",
    color: "bg-blue-500",
  },
  {
    id: "list",
    name: "List View",
    description: "Detailed row-based layout",
    color: "bg-emerald-500",
  },
  {
    id: "dark",
    name: "Dark Mode",
    description: "Neon green & sleek dark theme",
    color: "bg-neutral-800",
  },
  {
    id: "quickmart",
    name: "QuickMart",
    description: "Clean app-like layout for daily needs",
    color: "bg-yellow-400",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState("grid");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleShopNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setShopName(val);
    setSlug(val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
  };

  const handleLaunch = () => {
    if (!shopName || !slug) return;
    setLoading(true);

    // Save shop data to localStorage
    const shopData = {
      id: Date.now().toString(),
      name: shopName,
      slug,
      template_id: template,
      phone_number: phone,
      location: address || "",
      products: [],
      created_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem("bazaarai_shops") || "[]");
    existing.push(shopData);
    localStorage.setItem("bazaarai_shops", JSON.stringify(existing));

    setTimeout(() => {
      router.push(`/store/${slug}`);
    }, 600);
  };

  const inputClass =
    "w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-extrabold text-blue-600">BazaarAI</span>
          <p className="text-sm text-neutral-500 mt-1">Set up your shop in seconds</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl p-8 border border-neutral-100 dark:border-neutral-800">

          {/* Progress Bar */}
          <div className="flex gap-2 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  step >= i ? "bg-blue-600" : "bg-neutral-200 dark:bg-neutral-800"
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1 — Phone */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white">Get Started</h2>
                  <p className="text-neutral-500">Enter your phone number to continue</p>
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="tel"
                    placeholder="+91 00000 00000"
                    className={inputClass}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => phone && setStep(2)}
                  disabled={!phone}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}

            {/* Step 2 — Shop Name */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white">Name Your Shop</h2>
                  <p className="text-neutral-500">What should customers call you?</p>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kirana Store"
                      className={inputClass}
                      value={shopName}
                      onChange={handleShopNameChange}
                      autoFocus
                    />
                  </div>
                  {slug && (
                    <div className="text-sm text-neutral-500 px-1 flex items-center gap-1">
                      URL: <span className="text-blue-600 font-semibold">bazaarai.com/store/{slug}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">Back</button>
                  <button
                    onClick={() => shopName && setStep(3)}
                    disabled={!shopName}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white py-4 rounded-xl font-bold transition-all"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Address (New) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white">Shop Address</h2>
                  <p className="text-neutral-500">Where can customers find you?</p>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-6 w-5 h-5 text-neutral-400" />
                  <textarea
                    placeholder="e.g. 123, Vijay Nagar, Indore, MP"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-base min-h-[120px] resize-none"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(2)} className="px-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">Back</button>
                  <button
                    onClick={() => address && setStep(4)}
                    disabled={!address}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 dark:disabled:bg-neutral-800 text-white py-4 rounded-xl font-bold transition-all"
                  >
                    Set Address
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4 — Template */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold dark:text-white">Choose a Look</h2>
                  <p className="text-neutral-500">Pick how your storefront looks</p>
                </div>
                <div className="grid gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplate(t.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        template === t.id ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-neutral-100 dark:border-neutral-800"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl ${t.color} flex-shrink-0`} />
                      <div className="flex-1">
                        <h4 className="font-bold dark:text-white">{t.name}</h4>
                        <p className="text-xs text-neutral-500">{t.description}</p>
                      </div>
                      {template === t.id && <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)} className="px-4 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">Back</button>
                  <button
                    onClick={handleLaunch}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "Launching..." : <>Launch Store <Rocket className="w-5 h-5" /></>}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
