import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ShoppingCart, Package, Search, Filter, LayoutGrid, ChevronRight, Store, Clock, Zap, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  "Semua", "Sembako", "Rumah tangga", "Makanan & minuman", "Fashion", "Elektronik", "ATK & lainnya",
  "🔧 Servis (AC, listrik, bangunan)", "🧺 Laundry & kebersihan", "🚚 Transport / kurir", "🎓 Les & jasa profesional"
];

const PRODUCTS = [
  { id: '1', name: 'beras', category: 'Sembako', description: 'beras 5w5mw56', price: 1000000, stock: 1 },
  { id: '2', name: 'jasa rental massa', category: '🔧 Servis (AC, listrik, bangunan)', description: 'jasa rental massa cocok tuk demo', price: 12000, stock: 500 },
  { id: '3', name: 'Jual Rumah Tetangga', category: 'Rumah tangga', description: 'Jual Rumah Tetangga LT LB', price: 500000000, stock: 1 },
  { id: '4', name: 'banner', category: 'ATK & lainnya', description: 'banner banner semarakebalen 26', price: 26000000, stock: 26 },
  { id: '5', name: 'PLANGSUNG TUBUH', category: 'Fashion', description: 'Siapa cepat nanti tidak terlambat', price: 20000000, stock: 1000 },
];

export default function BelanjaView() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [viewType, setViewType] = useState<'pembeli' | 'penjual'>('pembeli');
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-10 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative overflow-hidden min-h-screen">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

      {/* Header & Branding Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-lg shadow-slate-900/20">V4.0 Prime</div>
             <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 shadow-sm animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Live Sync
             </div>
          </div>
          <h1 className="text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase font-elegant drop-shadow-sm flex flex-col md:flex-row md:items-baseline md:gap-4">
            <span className="not-italic">E-LAPAK</span>
            <span className="bg-gradient-to-br from-rose-500 to-pink-600 bg-clip-text text-transparent text-7xl leading-none ml-[6px] not-italic">26</span>
          </h1>
          <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] ml-1 max-w-sm leading-relaxed opacity-80 backdrop-blur-sm">
            Toko Digital Warga & Hub UMKM Lokal
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          {/* Switcher */}
          <div className="bg-white/50 dark:bg-slate-900/30 backdrop-blur-2xl p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 w-full sm:w-fit flex gap-2 shadow-xl shadow-slate-200/20 dark:shadow-none">
            {[
              { id: 'pembeli', label: 'Toko Warga', icon: Store, gradient: 'from-rose-500 to-pink-700', shadow: 'shadow-rose-500/30' },
              { id: 'penjual', label: 'Pesanan', icon: Clock, gradient: 'from-brand-blue to-indigo-700', shadow: 'shadow-blue-500/30' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewType(tab.id as any)}
                className={`flex-1 sm:flex-none px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden ${
                  viewType === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg ${tab.shadow} scale-105` 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon size={16} className={viewType === tab.id ? 'animate-bounce-slow' : ''} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-rose-500 transition-all duration-300" />
            <input 
              type="text" 
              placeholder="Cari Produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl border-2 border-slate-200 dark:border-slate-800 focus:border-rose-500/30 rounded-3xl text-[13px] font-black uppercase tracking-wider shadow-xl shadow-slate-200/20 dark:shadow-none focus:outline-none focus:ring-8 focus:ring-rose-500/5 transition-all placeholder:text-slate-400 placeholder:font-black placeholder:tracking-[0.2em]"
            />
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth px-2">
          {CATEGORIES.map((cat, i) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 border-2
                flex items-center gap-3 group/cat
                ${activeCategory === cat 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' 
                  : 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400'
                }
              `}
            >
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${activeCategory === cat ? 'bg-rose-500 scale-150 shadow-[0_0_10px_rgba(244,63,94,0.8)]' : 'bg-slate-300 dark:bg-slate-700 group-hover/cat:bg-rose-400'}`} />
              {cat}
            </button>
          ))}
        </div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Grid Header & Dashboard */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group/icon">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
              <LayoutGrid className="w-8 h-8 text-slate-900 dark:text-slate-100 group-hover/icon:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter uppercase font-elegant">
                Katalog <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">Eksklusif</span>
              </h3>
              <div className="flex items-center gap-3 mt-1.5">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black">U{i}</div>
                    ))}
                 </div>
                 <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.4em] leading-none">
                   {filteredProducts.length} UMKM Aktif
                 </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 shadow-sm transition-all">
                <Tag size={18} />
             </button>
             <button className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/30 shadow-sm transition-all">
                <Filter size={18} />
             </button>
             <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
             <div className="bg-rose-50 dark:bg-rose-500/10 px-6 py-4 rounded-2xl flex items-center gap-3 border border-rose-100 dark:border-rose-500/20">
                <Zap size={14} className="text-rose-600 animate-pulse" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Diskon RT Member</span>
             </div>
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  className="h-full"
                >
                  <ProductCard 
                    product={product} 
                    onAddToCart={() => console.log('Added', product.name)} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="p-10 bg-slate-50 dark:bg-slate-800 w-32 h-32 rounded-[3.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <Package className="w-14 h-14 text-slate-200 dark:text-slate-700" />
              </div>
              <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.3em] font-elegant mb-3">Persediaan Kosong</h4>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.5em] max-w-sm mx-auto leading-relaxed">
                Katalog saat ini tidak tersedia untuk kategori ini. Hubungi admin RT untuk bantuan.
              </p>
              <button 
                onClick={() => setActiveCategory("Semua")}
                className="mt-10 px-10 py-4.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-600 transition-colors shadow-2xl shadow-slate-900/20"
              >
                Reset Filter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (Cart) */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-12 right-12 w-20 h-20 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-900/40 flex items-center justify-center z-50 group border border-white/10"
      >
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-[11px] font-black border-4 border-[#fafafa] dark:border-slate-950">2</div>
        <ShoppingCart size={28} className="group-hover:animate-bounce-slow" />
      </motion.button>
    </div>
  );
}
