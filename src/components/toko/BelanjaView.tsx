import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { 
  ShoppingCart, 
  Package, 
  Search, 
  Filter, 
  LayoutGrid, 
  ChevronRight, 
  Store, 
  Clock, 
  Zap, 
  Tag, 
  MessageCircle, 
  Bell, 
  Menu,
  Heart,
  Gift,
  Smartphone,
  Shirt,
  Utensils,
  Cpu,
  Wrench,
  Truck,
  GraduationCap,
  Users,
  CheckCircle2,
  Star,
  Wallet,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES = [
  { id: "Semua", label: "Semua", icon: LayoutGrid },
  { id: "Sembako", label: "Sembako", icon: Utensils },
  { id: "Rumah tangga", label: "Rumah Tangga", icon: Package },
  { id: "Makanan & minuman", label: "Kuliner", icon: Utensils },
  { id: "Fashion", label: "Fashion", icon: Shirt },
  { id: "Elektronik", label: "Elektronik", icon: Cpu },
  { id: "Servis", label: "Jasa Servis", icon: Wrench },
  { id: "Laundry", label: "Laundry", icon: Zap },
  { id: "Transport", label: "Kurir", icon: Truck },
  { id: "Pendidikan", label: "Kursus", icon: GraduationCap }
];

const QUICK_LINKS = [
  { label: 'Bonus', icon: Gift, color: 'text-orange-500', bg: 'bg-orange-50' },
  { label: 'GoPay & Coins', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Cek Kupon', icon: Tag, color: 'text-rose-500', bg: 'bg-rose-50' },
];

const PRODUCTS = [
  { id: '1', name: 'Beras Premium 5kg', category: 'Sembako', description: 'Beras pilihan kualitas super', price: 75000, stock: 45, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', discount: '5%' },
  { id: '2', name: 'Jasa Service AC', category: 'Servis', description: 'Cuci AC & Tambah Freon', price: 75000, stock: 10, image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?auto=format&fit=crop&q=80&w=400' },
  { id: '3', name: 'Sofa Minimalis', category: 'Rumah tangga', description: 'Sofa nyaman untuk ruang tamu', price: 2500000, stock: 2, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400' },
  { id: '4', name: 'T-Shirt Cotton Combed', category: 'Fashion', description: 'Kaos adem sedia berbagai warna', price: 85000, stock: 100, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', discount: '10%' },
  { id: '5', name: 'Powerbank 10000mAh', category: 'Elektronik', description: 'Fast charging dual port', price: 150000, stock: 25, image: 'https://images.unsplash.com/photo-1609592424109-dd03d6f16dcc?auto=format&fit=crop&q=80&w=400' },
];

const RECENT_CHECKS = [
  { id: 'rc1', name: 'Pembersih Saluran', label: '3/5/10M', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200', category: 'Rumah Tangga' },
  { id: 'rc2', name: 'Tamiya Green Jet', label: 'Vehicle Model', image: 'https://images.unsplash.com/photo-1532330393533-443990a51d10?auto=format&fit=crop&q=80&w=200', category: 'Mainan' },
  { id: 'rc3', name: 'Kawat Fleksibel', label: 'Pembersih Kerak', image: 'https://images.unsplash.com/photo-1595113316349-9fa49ed200d7?auto=format&fit=crop&q=80&w=200', category: 'Alat Tukang' },
  { id: 'rc4', name: 'RC Monster Truck', label: 'Mobil & Truk RC', image: 'https://images.unsplash.com/photo-1594731802114-035622550d5a?auto=format&fit=crop&q=80&w=200', category: 'Mainan' },
];

const BANNERS = [
  {
    id: 1,
    title: "Hemat di Tiap Transaksi",
    subtitle: "11x Diskon",
    benefit: "s.d. Rp55rb",
    promoCode: "PASTIDISKON",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
    color: "from-emerald-500/20"
  },
  {
    id: 2,
    title: "Flash Sale Spesial",
    subtitle: "Diskon 50%",
    benefit: "Hanya Hari Ini",
    promoCode: "FLASHSALE50",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1200",
    color: "from-rose-500/20"
  },
  {
    id: 3,
    title: "Gratis Ongkir RT 26",
    subtitle: "Belanja Puas",
    benefit: "Tanpa Minimal",
    promoCode: "ONGKIR0",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200",
    color: "from-blue-500/20"
  }
];

export default function BelanjaView({ 
  products = [], 
  onAddToCart,
  showNotification,
  onProductSelect,
  onBackToMain
}: { 
  products?: any[], 
  onAddToCart?: (p: any) => void,
  showNotification?: (msg: string, type?: "success" | "error" | "info" | "warning") => void,
  onProductSelect?: (p: any) => void,
  onBackToMain?: () => void
}) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeFeedTab, setActiveFeedTab] = useState("Untuk Kamu");
  const [activeMainTab, setActiveMainTab] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  const filteredProducts = (products.length > 0 ? products : PRODUCTS).filter(p => {
    const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Additional feed filtering logic
    let matchesFeed = true;
    if (activeFeedTab === "Elektronik") {
      matchesFeed = p.category === "Elektronik";
    } else if (activeFeedTab === "Belanja Mall") {
      matchesFeed = p.discount !== undefined; // Assume mall products have discounts for demo
    }

    return matchesCategory && matchesSearch && matchesFeed;
  });

  const handleQuickLink = (label: string) => {
    if (label === "Modul Utama") {
      if (onBackToMain) onBackToMain();
      return;
    }
    if (["Home", "Inbox", "Transaksi", "Toko Saya", "Akun", "GoPay & Coins", "Cek Kupon", "Bonus", "Pesan Chat", "Room Chat", "Notifikasi", "Pendaftaran Toko", "Toko Saya Aktif"].includes(label)) {
      setActiveMainTab(label);
      return;
    }
    const messages: Record<string, string> = {
      'Notifikasi': 'Memuat 5 notifikasi transaksi terbaru Anda.',
      'Modul Utama': 'Mengalihkan ke Dashboard Modul Utama Lapak 26...'
    };

    if (showNotification) {
      showNotification(messages[label] || `Fitur ${label} akan segera hadir!`, "info");
    }
  };

  const handlePromoCode = (code: string) => {
    if (showNotification) {
      showNotification(`Kode Promo ${code} berhasil disalin! Gunakan saat pembayaran.`, "success");
    }
    navigator.clipboard.writeText(code);
  };

  const handleRecentClick = (item: any) => {
    if (onProductSelect) {
      // Find matching product in list or simulate a detailed view
      const realProduct = (products.length > 0 ? products : PRODUCTS).find(p => p.id === item.id);
      if (realProduct) {
        onProductSelect(realProduct);
      } else {
        // Create a mock product based on the recent check item so it opens the detail view
        const mockProduct = {
          id: item.id,
          name: item.name,
          category: item.category || 'Lainnya',
          description: item.label,
          price: 50000, 
          stock: 5,
          image: item.image
        };
        onProductSelect(mockProduct);
      }
    } else {
      showNotification?.(`Menampilkan detail: ${item.name}. Produk tersedia di RT 26.`, "info");
    }
  };

  const handleFilterClick = () => {
    if (showNotification) {
      showNotification("Membuka filter kategori, harga, dan lokasi RT...", "info");
    }
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 animate-in fade-in duration-700 overflow-x-hidden">
      {/* Lapak 26 Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-8 pb-14 rounded-b-[3rem] shadow-lg shadow-emerald-900/10 mb-[-2rem] relative z-20">
         <div className="flex justify-between items-start mb-6">
            <div onClick={() => handleQuickLink("Home")} className="cursor-pointer hover:opacity-80 transition-opacity">
               <h1 className="text-3xl font-black italic tracking-tighter mb-1 font-elegant">LAPAK 26</h1>
               <p className="text-xs font-bold text-emerald-100/80 uppercase tracking-[0.2em]">Pusat Niaga & UMKM Warga</p>
            </div>
            <div className="flex gap-4">
              <div 
                onClick={() => handleQuickLink(activeMainTab === 'Toko Saya Aktif' ? 'Toko Saya Aktif' : 'Toko Saya')}
                className="hidden md:flex relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors cursor-pointer items-center justify-center gap-2"
              >
                <Store size={20} />
                <span className="text-xs font-bold hidden lg:block">Buka Toko</span>
              </div>
              <div 
                onClick={() => handleQuickLink("Pesan Chat")}
                className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <MessageCircle size={20} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">8</div>
              </div>
              <div 
                onClick={() => handleQuickLink("Notifikasi")}
                className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Bell size={20} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">3</div>
              </div>
            </div>
         </div>

         <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600/50 group-focus-within:text-emerald-500" />
            <input 
              type="text" 
              placeholder="Cari kebutuhan Anda di RT 26..."
              value={searchQuery}
              onFocus={() => {
                if (activeMainTab !== "Home") setActiveMainTab("Home");
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && showNotification?.("Mencari: " + searchQuery, "info")}
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur border-none rounded-2xl text-slate-800 text-sm font-bold shadow-xl shadow-black/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
            />
            <div 
              onClick={handleFilterClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-200"
            >
               <Filter size={16} />
            </div>
         </div>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-8 p-4 pt-10">
        
        {activeMainTab === "Home" && (
          <>
            {/* Banner Section - Swipeable */}
            <div className="relative group overflow-hidden rounded-3xl shadow-xl shadow-emerald-900/5">
          <div className="absolute inset-y-0 left-4 z-10 flex items-center">
            <button 
              onClick={prevBanner}
              className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            >
              <Menu size={16} className="rotate-90" />
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 z-10 flex items-center">
            <button 
              onClick={nextBanner}
              className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <motion.div 
            key={currentBanner}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full aspect-[21/9] relative cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) nextBanner();
              if (info.offset.x > 50) prevBanner();
            }}
          >
            <img 
              src={BANNERS[currentBanner].image} 
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${BANNERS[currentBanner].color} to-transparent flex flex-col justify-center p-8 text-white`}>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black italic tracking-tighter mb-2"
              >
                {BANNERS[currentBanner].title}
              </motion.h2>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-4xl font-black">{BANNERS[currentBanner].subtitle}</span>
                <span className="text-sm font-bold opacity-80 pl-2 border-l border-white/30">{BANNERS[currentBanner].benefit}</span>
              </motion.div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center gap-3"
              >
                 <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Kode Promo:</span>
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     handlePromoCode(BANNERS[currentBanner].promoCode);
                   }}
                   className="px-4 py-1.5 bg-white text-slate-900 rounded-md text-xs font-black tracking-wider hover:bg-emerald-50 transition-colors active:scale-95"
                 >
                   {BANNERS[currentBanner].promoCode}
                 </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {BANNERS.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`transition-all duration-300 ${currentBanner === i ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'} rounded-full`}
              />
            ))}
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="bg-white rounded-2xl p-2 flex items-center gap-2 border border-slate-100 overflow-x-auto no-scrollbar">
          {QUICK_LINKS.map((link) => (
            <button 
              key={link.label} 
              onClick={() => handleQuickLink(link.label)}
              className="flex-1 min-w-[140px] flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap border-r border-slate-50 last:border-none group"
            >
              <div className={`${link.bg} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{link.label}</span>
            </button>
          ))}
          <div 
            onClick={() => handleQuickLink("Modul Utama")}
            className="px-4 flex items-center gap-2 text-emerald-600 cursor-pointer hover:scale-110 transition-transform"
          >
             <div className="bg-emerald-50 p-2 rounded-lg">
                <LayoutGrid size={20} />
             </div>
          </div>
        </div>

        {/* Categories Circular Icons */}
        <div className="grid grid-cols-5 md:grid-cols-10 gap-y-6">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 ${activeCategory === cat.id ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white border-slate-100 group-hover:border-emerald-200 shadow-sm'}`}>
                <cat.icon className={`w-7 h-7 ${activeCategory === cat.id ? 'text-white' : 'text-slate-600 group-hover:text-emerald-500'}`} />
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight max-w-[60px] ${activeCategory === cat.id ? 'text-emerald-600' : 'text-slate-500'}`}>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Checks Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase font-elegant">Lanjut cek ini, yuk</h3>
            <button 
              onClick={() => showNotification?.("Melihat semua riwayat", "info")}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {RECENT_CHECKS.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleRecentClick(item)}
                className="min-w-[140px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer group"
              >
                <div className="h-28 bg-slate-100 overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shadow-sm">Baru</div>
                </div>
                <div className="p-3">
                  <h4 className="text-[11px] font-black text-slate-800 truncate mb-1 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Headers & Tabs */}
        <div className="sticky top-[68px] z-40 bg-slate-50/95 backdrop-blur-sm pt-4 pb-2">
            <div className="flex items-center gap-3 mb-4 px-2">
               <h2 className="text-xl font-black text-slate-800 font-elegant tracking-tight">For You</h2>
               <div className="bg-indigo-600 text-white px-2 py-1 rounded flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                  <div className="bg-white rounded-full p-0.5">
                    <CheckCircle2 size={10} className="text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Mall</span>
               </div>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
              {["Untuk Kamu", "Belanja Mall", "Elektronik", "Hiburan", "Top Up"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveFeedTab(tab)}
                  className={`pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant transition-all relative ${activeFeedTab === tab ? "text-emerald-600 font-black" : "text-slate-400 font-bold hover:text-slate-600"}`}
                >
                  {tab}
                  {activeFeedTab === tab && (
                    <motion.div 
                      layoutId="feedTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pt-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
                  <div 
                    className="cursor-pointer"
                    onClick={() => onProductSelect && onProductSelect(product)}
                  >
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=400'} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      {product.discount && (
                        <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">
                          {product.discount}
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm">
                         <Zap size={10} className="text-rose-500" />
                         <span className="text-[9px] font-black text-rose-600 uppercase">Flash Sale</span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight uppercase font-elegant group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-[10px] font-black text-rose-600">Rp</span>
                          <span className="text-lg font-black text-slate-900 tracking-tighter">
                            {new Intl.NumberFormat('id-ID').format(product.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-tighter">Gratis Ongkir</div>
                          <span className="text-[10px] font-bold text-slate-400">Jawa Barat</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onAddToCart && onAddToCart(product)}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Tambah
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <Package size={48} className="text-slate-200 mx-auto mb-4" />
             <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">Produk Tidak Ditemukan</h4>
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="mt-6 text-emerald-600 font-black text-sm uppercase tracking-widest hover:underline"
               >
                 Hapus Pencarian
               </button>
             )}
          </div>
        )}
        </>
        )}

        {activeMainTab === "Toko Saya" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Store size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Toko Anda Belum Aktif</h2>
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-xs">Buka toko gratis dan mulai berjualan ke seluruh warga Lapak 26.</p>
            <button 
              onClick={() => handleQuickLink("Pendaftaran Toko")}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-600/20 max-w-[250px] mx-auto"
            >
              Buka Toko Sekarang
            </button>
          </div>
        )}

        {activeMainTab === "Pendaftaran Toko" && (
          <div className="flex flex-col space-y-6 max-w-md mx-auto w-full pb-10">
            <div className="flex items-center gap-4 mb-2">
              <button onClick={() => handleQuickLink("Toko Saya")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-500 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors shrink-0">
                <ChevronRight className="rotate-180" size={20} />
              </button>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Buka Toko</h2>
                <p className="text-sm text-slate-500 font-medium">Lengkapi profil toko Anda</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Toko *</label>
                <input type="text" placeholder="Contoh: Toko Berkah Jaya" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Domain Toko *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-3 rounded-xl border-r-0 rounded-r-none">lapak26.id/</span>
                  <input type="text" placeholder="toko-berkah" className="w-full bg-slate-50 border border-slate-200 rounded-xl rounded-l-none px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all border-l-0" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kategori Toko</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                  <option>Sembako & Makanan</option>
                  <option>Jasa & Servis</option>
                  <option>Pakaian & Fashion</option>
                  <option>Kesehatan & Kecantikan</option>
                  <option>Pendidikan & Kursus</option>
                  <option>Lain-lain</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Alamat / Blok *</label>
                <textarea rows={3} placeholder="Contoh: Jl. Sudirman Blok A No. 15 (Patokan: Depan pos satpam)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
              </div>
              <button 
                onClick={() => {
                  if (showNotification) {
                    showNotification("Toko berhasil dibuat! Selamat datang di Lapak 26.", "success");
                  }
                  handleQuickLink("Toko Saya Aktif");
                }}
                className="w-full py-4 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
              >
                Simpan & Aktifkan Toko
              </button>
            </div>
          </div>
        )}

        {activeMainTab === "Toko Saya Aktif" && (
          <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner border border-emerald-200">
                  <Store size={32} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">Toko Berkah Jaya</h2>
                  <p className="text-sm text-emerald-600 font-bold mb-1">Online & Aktif</p>
                  <div className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider w-fit">
                    <Star size={10} className="fill-amber-400 text-amber-500" /> 4.9 (120 Ulasan)
                  </div>
                </div>
              </div>
              <button onClick={() => showNotification?.("Membagikan link toko", "info")} className="w-10 h-10 bg-slate-50 text-emerald-600 rounded-full flex items-center justify-center hover:bg-emerald-50 transition-colors">
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Package size={18} />
                  <span className="text-sm font-bold">Produk</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 tracking-tight">24</div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Item Tersedia</p>
                </div>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-500 mb-4">
                  <Wallet size={18} />
                  <span className="text-sm font-bold">Saldo</span>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-800 tracking-tight">1.2M</div>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Siap Tarik</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
              <div onClick={() => showNotification?.("Fitur Tambah Produk akan segera hadir!", "info")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Tambah Produk</h3>
                    <p className="text-xs text-slate-500 font-medium">Jual barang baru atau jasa</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
              <div onClick={() => showNotification?.("Semua pesanan diproses", "info")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Daftar Pesanan</h3>
                    <p className="text-xs text-slate-500 font-medium">Ada 3 pesanan baru masuk</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</div>
                  <ChevronRight size={18} className="text-slate-300" />
                </div>
              </div>
              <div onClick={() => showNotification?.("Fitur Statistik akan segera hadir!", "info")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Statistik Toko</h3>
                    <p className="text-xs text-slate-500 font-medium">Kunjungan dan performa produk</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300" />
              </div>
            </div>
            
            <button
               onClick={() => handleQuickLink("Toko Saya")}
               className="mx-auto block text-xs font-bold text-rose-500 uppercase tracking-widest mt-4 hover:opacity-80"
            >
               Nonaktifkan Toko (Demo)
            </button>
          </div>
        )}

        {activeMainTab === "Akun" && (
          <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-black shrink-0">
                <Users size={32} />
              </div>
              <div className="flex-1 w-full overflow-hidden">
                <h2 className="text-lg font-black text-slate-800 uppercase truncate">Profil Pengguna</h2>
                <p className="text-xs text-slate-500 font-bold truncate">Warga RT 26</p>
                <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                  <Star size={10} className="fill-amber-500" /> Member Silver
                </div>
              </div>
              <button 
                onClick={() => showNotification?.("Edit profil", "info")}
                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-colors shrink-0"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
              <div onClick={() => showNotification?.("Alamat Pengiriman", "info")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Package size={20} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Alamat Pengiriman</span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
              <div onClick={() => showNotification?.("Dompet & Cicilan", "info")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Wallet size={20} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Dompet & Pembayaran</span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
              <div onClick={() => showNotification?.("Pusat Bantuan", "info")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Pusat Bantuan</span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            </div>
          </div>
        )}

        {activeMainTab === "Transaksi" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Belum Terdapat Transaksi</h2>
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-xs">Lihat daftar pembelian, tagihan dan aktivitas e-lapak anda disini.</p>
            <button 
              onClick={() => handleQuickLink("Home")}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors max-w-[250px] mx-auto"
            >
              Mulai Belanja
            </button>
          </div>
        )}

        {activeMainTab === "Inbox" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Belum Ada Pesan Masuk</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xs">Pesan dari penjual, promo, dan notifikasi transaksi akan muncul di sini.</p>
          </div>
        )}

        {activeMainTab === "GoPay & Coins" && (
          <div className="flex flex-col space-y-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-6 shadow-xl shadow-blue-500/20 text-white flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold opacity-90 uppercase tracking-wider mb-1">Saldo GoPay</h2>
                <div className="text-3xl font-black tracking-tight">Rp 2.450.000</div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                  <Star size={24} className="fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase">Koin Lapak 26</h3>
                  <div className="text-xl font-black text-slate-800">4.500 Coins</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 font-bold rounded-xl text-sm transition-colors">
                Tukar Koin
              </button>
            </div>
            
            <button 
              onClick={() => handleQuickLink("Home")}
              className="mt-8 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mx-auto block max-w-[200px]"
            >
              Kembali
            </button>
          </div>
        )}

        {activeMainTab === "Cek Kupon" && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 px-2">Kupon Tersedia</h2>
            
            {[
              { title: "Diskon Hemat s/d 50%", desc: "Maks. potongan 20rb. Min. belanja 50rb.", code: "HEMATBGT" },
              { title: "Gratis Ongkir RT/RW", desc: "Berlaku untuk semua pembelian tetangga.", code: "ONGKIRZERO" },
              { title: "Cashback Koin 10%", desc: "Maks. 500 koin untuk transaksi berikutnya.", code: "CASHBACK10" },
            ].map((coupon, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center justify-between border-2 border-emerald-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-emerald-500 rounded-l-2xl"></div>
                <div className="pl-4">
                  <h3 className="text-lg font-bold text-slate-800">{coupon.title}</h3>
                  <p className="text-sm text-slate-500 mb-2">{coupon.desc}</p>
                  <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-bold tracking-widest uppercase">
                    {coupon.code}
                  </div>
                </div>
                <button 
                  onClick={() => showNotification?.("Kupon berhasil disalin!", "success")}
                  className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-100 transition-colors shrink-0"
                >
                  <Tag size={20} />
                </button>
              </div>
            ))}
            
            <button 
              onClick={() => handleQuickLink("Home")}
              className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mx-auto block max-w-[200px]"
            >
              Kembali
            </button>
          </div>
        )}

        {activeMainTab === "Bonus" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gift size={48} className="text-orange-400 mb-4" />
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Bonus Bulanan</h2>
            <p className="text-sm text-slate-500 font-medium max-w-xs mb-6">Bonus Anda sedang dikalkulasi. Cek kembali besok pagi untuk mendapatkan reward spesial.</p>
            <button 
              onClick={() => handleQuickLink("Home")}
              className="px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold rounded-xl transition-colors shadow-sm"
            >
              Kembali Belanja
            </button>
          </div>
        )}

        {activeMainTab === "Pesan Chat" && (
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2 px-2">Pesan Masuk</h2>
            
            <div onClick={() => handleQuickLink("Room Chat")} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0 relative">
                <Store size={20} />
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">Sembako Bu Tejo</h3>
                  <span className="text-[10px] text-slate-400 font-medium">10:45</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium text-slate-800 font-bold">Ya pak, beras premium 5kg ready. Bisa diantar sekarang.</p>
              </div>
              <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                8
              </div>
            </div>

            <div onClick={() => handleQuickLink("Room Chat")} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                <Store size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-bold text-slate-800 truncate">Jasa AC Pak Kumis</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Kemarin</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">Sama-sama, jangan lupa review bintang 5 nya ya.</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleQuickLink("Home")}
              className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mx-auto block max-w-[200px] text-center"
            >
              Kembali
            </button>
          </div>
        )}

        {activeMainTab === "Room Chat" && (
          <div className="flex flex-col h-[70vh] bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => handleQuickLink("Pesan Chat")} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold shrink-0 relative">
                    <Store size={18} />
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Sembako Bu Tejo</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Online</p>
                  </div>
                </div>
              </div>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
                <Menu size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col no-scrollbar bg-slate-50/50">
              <div className="text-center text-xs font-bold text-slate-400 my-2">Hari ini</div>
              
              <div className="self-end bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                <p className="text-sm font-medium">Bu, beras khusus yang 5kg stoknya masih ada? Saya butuh untuk arisan besok.</p>
                <span className="text-[10px] text-emerald-100/70 block mt-1 text-right font-bold">10:42 <CheckCircle2 size={12} className="inline ml-1" /></span>
              </div>

              <div className="self-start bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                <p className="text-sm font-medium">Ya pak, beras premium 5kg ready. Bisa diantar sekarang. Langsung lewat Lapak 26 ya transaksinya pak biar gampang saya rekap.</p>
                <span className="text-[10px] text-slate-400 block mt-1 font-bold">10:45</span>
              </div>
            </div>

            {/* Chat Input */}
            <div className="bg-white p-3 border-t border-slate-200 flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-colors shrink-0">
                <Heart size={20} />
              </button>
              <div className="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-slate-200">
                <input type="text" placeholder="Ketik pesan..." className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium py-3 text-slate-800 placeholder-slate-400" />
              </div>
              <button className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all shadow-md shrink-0">
                <MessageCircle size={20} className="fill-white" />
              </button>
            </div>
          </div>
        )}

        {activeMainTab === "Notifikasi" && (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Notifikasi</h2>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Tandai semua dibaca</button>
            </div>
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border-2 border-emerald-500/20 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500"></div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                <Package size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-slate-800">Pesanan Tiba</h3>
                  <span className="text-[10px] text-emerald-600 font-bold whitespace-nowrap ml-2">Baru saja</span>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">Pesanan Anda dari <span className="font-bold text-slate-800">Sembako Bu Tejo</span> telah tiba. Mohon periksa pesanan Anda dan selesaikan transaksi.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden opacity-75">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                <Tag size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-slate-800">Promo Khusus Warga RT 02</h3>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">2 Jam Lalu</span>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">Dapatkan diskon 50% untuk servis AC, khusus hari ini! Klaim sekarang sebelum kehabisan.</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden opacity-75">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                <Star size={18} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-slate-800">Koin Masuk</h3>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2">Kemarin</span>
                </div>
                <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1">Selamat! Anda mendapatkan Cashback koin sebesar 2.500 Coins dari transaksi sebelumnya.</p>
              </div>
            </div>

            <button 
              onClick={() => handleQuickLink("Home")}
              className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mx-auto block max-w-[200px] text-center"
            >
              Tutup
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav (Carousel) */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 flex items-center justify-start gap-6 px-6 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden overflow-x-auto no-scrollbar pb-[env(safe-area-inset-bottom,0.5rem)]">
         <div 
           onClick={() => handleQuickLink("Modul Utama")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors text-slate-400 hover:text-emerald-500`}
         >
            <LayoutGrid size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Modul</span>
         </div>
         <div 
           onClick={() => handleQuickLink("Home")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeMainTab === 'Home' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Store size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Belanja</span>
         </div>
         <div 
           onClick={() => handleQuickLink("Inbox")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${['Inbox', 'Room Chat', 'Pesan Chat', 'Notifikasi'].includes(activeMainTab) ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Bell size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Inbox</span>
         </div>
         <div 
           onClick={() => handleQuickLink("Transaksi")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeMainTab === 'Transaksi' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Package size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Pesanan</span>
         </div>
         <div 
           onClick={() => handleQuickLink("GoPay & Coins")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeMainTab === 'GoPay & Coins' ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
         >
            <Wallet size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">GoPay</span>
         </div>
         <div 
           onClick={() => handleQuickLink("Cek Kupon")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeMainTab === 'Cek Kupon' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Tag size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Kupon</span>
         </div>
         <div 
           onClick={() => handleQuickLink(activeMainTab === 'Toko Saya Aktif' ? 'Toko Saya Aktif' : 'Toko Saya')}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${['Toko Saya', 'Pendaftaran Toko', 'Toko Saya Aktif'].includes(activeMainTab) ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Store size={22} className="active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Toko Saya</span>
         </div>
         <div 
           onClick={() => handleQuickLink("Akun")}
           className={`flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeMainTab === 'Akun' ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
         >
            <Users className="w-5.5 h-5.5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Akun</span>
         </div>
      </div>
    </div>
  );
}
