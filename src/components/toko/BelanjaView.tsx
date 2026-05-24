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
  CheckCircle2
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
    <div className="bg-[#f8fafc] min-h-screen pb-24 animate-in fade-in duration-700">
      {/* Lapak 26 Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-8 pb-14 rounded-b-[3rem] shadow-lg shadow-emerald-900/10 mb-[-2rem] relative z-20">
         <div className="flex justify-between items-start mb-6">
            <div>
               <h1 className="text-3xl font-black italic tracking-tighter mb-1 font-elegant">LAPAK 26</h1>
               <p className="text-xs font-bold text-emerald-100/80 uppercase tracking-[0.2em]">Pusat Niaga & UMKM Warga</p>
            </div>
            <div className="flex gap-4">
              <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors">
                <MessageCircle size={20} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">8</div>
              </div>
              <div className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors">
                <ShoppingCart size={20} />
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur border-none rounded-2xl text-slate-800 text-sm font-bold shadow-xl shadow-black/10 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-100 text-emerald-600 rounded-xl">
               <Filter size={16} />
            </div>
         </div>
      </div>

      <div className="max-w-screen-xl mx-auto space-y-8 p-4 pt-10">
        
        {/* Banner Section */}
        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-sm relative group">
          <img 
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200" 
            alt="Promotion Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent flex flex-col justify-center p-8 text-white">
            <h2 className="text-2xl font-black italic tracking-tighter mb-2">Hemat di Tiap Transaksi</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">11x Diskon</span>
              <span className="text-sm font-bold opacity-80 pl-2 border-l border-white/30">s.d. Rp55rb</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
               <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Kode Promo:</span>
               <div className="px-4 py-1.5 bg-white text-slate-900 rounded-md text-xs font-black tracking-wider">PASTIDISKON</div>
            </div>
          </div>
          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-6 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="bg-white rounded-2xl p-2 flex items-center gap-2 border border-slate-100 overflow-x-auto no-scrollbar">
          {QUICK_LINKS.map((link) => (
            <button key={link.label} className="flex-1 min-w-[140px] flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap border-r border-slate-50 last:border-none">
              <div className={`${link.bg} p-2 rounded-lg`}>
                <link.icon className={`w-5 h-5 ${link.color}`} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{link.label}</span>
            </button>
          ))}
          <div className="px-4 flex items-center gap-2 text-emerald-600">
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
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {RECENT_CHECKS.map((item) => (
              <div key={item.id} className="min-w-[140px] bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="h-28 bg-slate-100 overflow-hidden relative">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">Baru</div>
                </div>
                <div className="p-3">
                  <h4 className="text-[11px] font-black text-slate-800 truncate mb-1">{item.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feed Headers & Tabs */}
        <div className="sticky top-[68px] z-40 bg-slate-50 pt-4 pb-2">
            <div className="flex items-center gap-3 mb-4 px-2">
               <h2 className="text-xl font-black text-slate-800 font-elegant">For User897949</h2>
               <div className="bg-indigo-600 text-white px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                  <div className="bg-white rounded-full p-0.5">
                    <CheckCircle2 size={10} className="text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Mall</span>
               </div>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
              <button className="text-emerald-600 font-black border-b-2 border-emerald-600 pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant">Untuk Kamu</button>
              <button className="text-slate-400 font-bold pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant">Belanja Mall</button>
              <button className="text-slate-400 font-bold pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant">Elektronik</button>
              <button className="text-slate-400 font-bold pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant">Hiburan</button>
              <button className="text-slate-400 font-bold pb-2 whitespace-nowrap text-sm tracking-tight px-1 uppercase font-elegant">Top Up</button>
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
                    <h3 className="text-sm font-black text-slate-800 line-clamp-2 leading-tight uppercase font-elegant">
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
                  <button 
                    onClick={() => console.log('Buy', product.id)}
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
             <button 
               onClick={() => setActiveCategory("Semua")}
               className="mt-6 text-emerald-600 font-black text-sm uppercase tracking-widest hover:underline"
             >
               Lihat Semua Produk
             </button>
          </div>
        )}
      </div>

      {/* Simplified Mobile Bottom Nav (Visual Reference) */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-100 flex items-center justify-around py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
         <div className="flex flex-col items-center gap-1 group text-emerald-600">
            <LayoutGrid size={22} className="group-active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Home</span>
         </div>
         <div className="flex flex-col items-center gap-1 group text-slate-400">
            <Bell size={22} className="group-active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Inbox</span>
         </div>
         <div className="flex flex-col items-center gap-1 group text-slate-400">
            <Package size={22} className="group-active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Transaksi</span>
         </div>
         <div className="flex flex-col items-center gap-1 group text-slate-400">
            <Store size={22} className="group-active:scale-95 transition-transform" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Toko Saya</span>
         </div>
         <div className="flex flex-col items-center gap-1 group text-slate-400">
            <Users className="w-5.5 h-5.5" />
            <span className="text-[9px] font-black uppercase tracking-tighter">Akun</span>
         </div>
      </div>
    </div>
  );
}
