export default function Footer({ storeName, address, timing, phone }: { storeName: string, address: string, timing: string, phone: string }) {
  return (
    <footer className="bg-gray-50 dark:bg-dark-muted pt-10 pb-20 px-4 mt-12 border-t border-gray-100 dark:border-dark-border transition-colors">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-black text-secondary dark:text-primary uppercase tracking-tighter mb-4">{storeName}</h2>
        
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 uppercase text-xs tracking-widest">Address</h3>
            <p>{address}</p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 uppercase text-xs tracking-widest">Store Timings</h3>
            <p>{timing}</p>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 uppercase text-xs tracking-widest">Contact</h3>
            <p>{phone}</p>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Powered by BaazarAI
          </p>
        </div>
      </div>
    </footer>
  );
}
