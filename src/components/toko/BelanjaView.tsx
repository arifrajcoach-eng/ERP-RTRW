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
  Plus,
  Mail,
  Send,
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
  const [unreadChatsCount, setUnreadChatsCount] = useState(8);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(3);
  const [tokoSubTab, setTokoSubTab] = useState<"Main" | "TambahProduk" | "DaftarPesanan" | "Statistik" | "ManageProduk" | "Keuangan" | "Pengaturan">("Main");
  const [akunSubTab, setAkunSubTab] = useState<"Main" | "Alamat" | "Dompet" | "Bantuan" | "EditProfil" | "TambahAlamat" | "EditAlamat" | "LiveChat" | "EmailSupport">("Main");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'agent'; time: string }>>([
    { id: 1, text: "Halo Bpk. Arif, saya Ratih dari Customer Support E-LAPAK26 (SmaRtRw AI). Ada yang bisa saya bantu terkait transaksi, pembelanjaan, atau detail saldo Anda?", sender: "agent", time: "Baru saja" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatIsTyping, setChatIsTyping] = useState(false);
  const [supportEmail, setSupportEmail] = useState({ subject: "", category: "Pertanyaan Umum", message: "" });
  const [walletBalance, setWalletBalance] = useState(2450000);
  const [selectedPaymentId, setSelectedPaymentId] = useState(1);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [helpForm, setHelpForm] = useState({ category: "", message: "" });
  const [localAddresses, setLocalAddresses] = useState([
    { id: 1, label: "Rumah", receiver: "Arif", phone: "+62 812-3456-7890", street: "Jl. Melati IV No. 12, Blok B/12, RT 026/004", district: "Kelurahan Pusat", city: "Jakarta Selatan", isMain: true },
    { id: 2, label: "Kantor", receiver: "Arif (Kerja)", phone: "+62 812-3456-7890", street: "Gedung Smart City, Lt. 5, Jl. Teknologi Modern No. 8", district: "Kelurahan Maju", city: "Jakarta Pusat", isMain: false }
  ]);
  const [newAddress, setNewAddress] = useState({ label: "", receiver: "", street: "" });
  const [editingAddress, setEditingAddress] = useState<{ id: number; label: string; receiver: string; phone: string; street: string; district: string; city: string; isMain: boolean } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Arif Rajcoach");
  const [profilePhone, setProfilePhone] = useState("+62 812-3456-7890");
  const [profileEmail, setProfileEmail] = useState("arif@smartrw.ai");
  const profileInputRef = React.useRef<HTMLInputElement>(null);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        showNotification?.("Foto profil berhasil diunggah!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const [localProducts, setLocalProducts] = useState(PRODUCTS);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "" });
  const [productImage, setProductImage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [localOrders, setLocalOrders] = useState([1, 2, 3]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  const handleSendChatMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = {
      id: Math.random(),
      text,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatIsTyping(true);

    setTimeout(() => {
      let replyText = "Baik Bpk. Arif, pesan Anda sudah kami terima. Pengurus lapak RT 26 akan segera mengecek dan menanggapi dalam waktu dekat.";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("pesanan") || lowerText.includes("status") || lowerText.includes("sore")) {
        replyText = "Untuk melacak transaksi atau pesanan aktif Bapak, silakan periksa status pengiriman di tab 'Daftar Pesanan' di menu Toko / Lapak Anda.";
      } else if (lowerText.includes("iuran") || lowerText.includes("bayar")) {
        replyText = "Setiap iuran bulanan warga RT 26/RW 04 dapat langsung dibayarkan otomatis memotong saldo dompet digital E-LAPAK26 Anda.";
      } else if (lowerText.includes("saldo") || lowerText.includes("top-up") || lowerText.includes("gopay") || lowerText.includes("isi")) {
        replyText = "Anda dapat menambah saldo balance Anda secara instan dengan mengklik tombol 'Isi Saldo' di menu Dompet Aktif Anda.";
      } else if (lowerText.includes("halo") || lowerText.includes("pagi") || lowerText.includes("siang") || lowerText.includes("malam")) {
        replyText = "Halo juga Bpk. Arif! Ada yang bisa tim admin bantu seputar layanan terpadu warga RT 26 pada hari ini?";
      }

      const agentMsg = {
        id: Math.random(),
        text: replyText,
        sender: 'agent' as const,
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMsg]);
      setChatIsTyping(false);
    }, 1500);
  };

  const filteredProducts = (products.length > 0 ? products : localProducts).filter(p => {
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
    if (label === "Pesan Chat" || label === "Room Chat") {
      setUnreadChatsCount(0);
    }
    if (label === "Notifikasi") {
      setUnreadNotifsCount(0);
    }
    if (["Home", "Inbox", "Transaksi", "Toko Saya", "Akun", "GoPay & Coins", "Cek Kupon", "Bonus", "Pesan Chat", "Room Chat", "Notifikasi", "Pendaftaran Toko", "Toko Saya Aktif"].includes(label)) {
      setActiveMainTab(label);
      if (label === "Toko Saya Aktif") setTokoSubTab("Main");
      if (label === "Akun") setAkunSubTab("Main");
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
      const realProduct = (products.length > 0 ? products : localProducts).find(p => p.id === item.id);
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
                {unreadChatsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {unreadChatsCount}
                  </div>
                )}
              </div>
              <div 
                onClick={() => handleQuickLink("Notifikasi")}
                className="relative p-2 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Bell size={20} />
                {unreadNotifsCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {unreadNotifsCount}
                  </div>
                )}
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
            {tokoSubTab === "Main" && (
              <>
                <div 
                  onClick={() => setTokoSubTab("Pengaturan")}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-inner border border-emerald-200 group-hover:scale-105 transition-transform">
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
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setTokoSubTab("ManageProduk")}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <Package size={18} className="group-hover:text-emerald-500" />
                      <span className="text-sm font-bold">Produk</span>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-800 tracking-tight">24</div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Item Tersedia</p>
                    </div>
                  </div>
                  <div 
                    onClick={() => setTokoSubTab("Keuangan")}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between cursor-pointer hover:border-emerald-200 transition-all group"
                  >
                    <div className="flex items-center gap-2 text-slate-500 mb-4">
                      <Wallet size={18} className="group-hover:text-emerald-500" />
                      <span className="text-sm font-bold">Saldo</span>
                    </div>
                    <div>
                      <div className="text-3xl font-black text-slate-800 tracking-tight">1.2M</div>
                      <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">Siap Tarik</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                  <div onClick={() => setTokoSubTab("TambahProduk")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
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
                  <div onClick={() => setTokoSubTab("DaftarPesanan")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">Daftar Pesanan</h3>
                        <p className="text-xs text-slate-500 font-medium">Ada {localOrders.length} pesanan baru masuk</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {localOrders.length > 0 && (
                        <div className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{localOrders.length}</div>
                      )}
                      <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  </div>
                  <div onClick={() => setTokoSubTab("Statistik")} className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
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
              </>
            )}

            {tokoSubTab === "TambahProduk" && (
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => {
                    setTokoSubTab("Main");
                    setNewProduct({ name: "", price: "", description: "" });
                    setProductImage(null);
                  }} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tambah Produk</h2>
                    <p className="text-xs text-slate-500 font-bold">Produk atau Jasa Baru</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setProductImage(url);
                      }
                    }}
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square w-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group mx-auto overflow-hidden relative"
                  >
                    {productImage ? (
                      <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Plus className="text-slate-300 group-hover:text-emerald-500" size={32} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600">Foto Produk</span>
                      </>
                    )}
                    {productImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="text-white rotate-45" size={24} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nama Produk *</label>
                      <input 
                        type="text" 
                        placeholder="Masukkan nama barang/jasa" 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Harga (Rp) *</label>
                      <input 
                        type="number" 
                        placeholder="Contoh: 50.000" 
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Deskripsi Singkat</label>
                      <textarea 
                        rows={3} 
                        placeholder="Ceritakan tentang produk Anda..." 
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    disabled={!newProduct.name || !newProduct.price}
                    onClick={() => {
                      const id = Math.random().toString(36).substr(2, 9);
                      const productToAdd = {
                        id,
                        name: newProduct.name,
                        price: Number(newProduct.price),
                        description: newProduct.description,
                        category: "Sembako", // Default category for new products in demo
                        stock: 10,
                        image: productImage || 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=400'
                      };
                      setLocalProducts([productToAdd, ...localProducts]);
                      showNotification?.("Produk berhasil ditambahkan!", "success");
                      setTokoSubTab("Main");
                      setNewProduct({ name: "", price: "", description: "" });
                      setProductImage(null);
                    }}
                    className={`w-full py-4 font-black rounded-2xl shadow-lg transition-all active:scale-[0.98] uppercase tracking-widest text-sm ${
                      !newProduct.name || !newProduct.price 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    }`}
                  >
                    Simpan Produk
                  </button>
                </div>
              </div>
            )}

            {tokoSubTab === "DaftarPesanan" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTokoSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Daftar Pesanan</h2>
                    <p className="text-xs text-slate-500 font-bold">{localOrders.length} Pesanan Menunggu Proses</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {localOrders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                      <Package size={48} className="text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada pesanan baru</p>
                    </div>
                  ) : (
                    localOrders.map((id) => (
                      <div key={id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                            <div>
                              <h4 className="text-sm font-black text-slate-800 uppercase">Pesanan #2024-0{id}</h4>
                              <p className="text-[10px] text-slate-400 font-bold">2 jam yang lalu</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-md tracking-wider">Baru</span>
                        </div>
                        <div className="py-2 border-y border-slate-50 space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Buyer:</span>
                            <span className="text-slate-800">{id === 1 ? 'Arif' : id === 2 ? 'Budi' : 'Citra'} (Blok B/{id}2)</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Total:</span>
                            <span className="text-emerald-600 font-black">Rp {85000 + id * 15000}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setLocalOrders(prev => prev.filter(item => item !== id));
                              showNotification?.("Pesanan ditolak", "warning");
                            }} 
                            className="flex-1 py-2 rounded-xl text-[10px] font-bold text-rose-500 border border-rose-100 hover:bg-rose-50 transition-colors uppercase tracking-widest"
                          >
                            Tolak
                          </button>
                          <button 
                            onClick={() => {
                              setLocalOrders(prev => prev.filter(item => item !== id));
                              showNotification?.("Pesanan dikonfirmasi!", "success");
                            }} 
                            className="flex-1 py-2 rounded-xl bg-emerald-600 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-700 transition-colors uppercase tracking-widest"
                          >
                            Proses
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tokoSubTab === "Statistik" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTokoSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Statistik Toko</h2>
                    <p className="text-xs text-slate-500 font-bold">Performa Minggu Ini</p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="h-40 flex items-end justify-between gap-2 px-2">
                    {[35, 60, 45, 80, 55, 90, 70].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-emerald-500 rounded-t-lg transition-all duration-1000" 
                          style={{ height: `${h}%` }}
                        ></div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Day {i+1}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pengunjung</p>
                      <p className="text-2xl font-black text-slate-800">1.240</p>
                      <p className="text-[10px] text-emerald-500 font-black">+12% vs mgg lalu</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Transaksi</p>
                      <p className="text-2xl font-black text-slate-800">342</p>
                      <p className="text-[10px] text-emerald-500 font-black">+8% vs mgg lalu</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">Produk Terlaris</h3>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-slate-300">#{i}</span>
                          <div className="w-8 h-8 bg-slate-50 rounded-lg"></div>
                          <span className="text-xs font-bold text-slate-700">Produk Kece Unggulan</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600">{100 - i * 15} Terjual</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tokoSubTab === "ManageProduk" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTokoSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kelola Produk</h2>
                    <p className="text-xs text-slate-500 font-bold">{localProducts.length} Produk Terdaftar</p>
                  </div>
                  <button 
                    onClick={() => setTokoSubTab("TambahProduk")}
                    className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                  {localProducts.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between border-b border-slate-50 last:border-none group hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 uppercase truncate max-w-[150px]">{p.name}</h4>
                          <p className="text-xs font-bold text-emerald-600">Rp {new Intl.NumberFormat('id-ID').format(p.price)}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Stok: {p.stock} • {p.discount ? `Promo: ${p.discount}` : 'Normal'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setLocalProducts(localProducts.filter(item => item.id !== p.id));
                            showNotification?.("Produk berhasil dihapus!", "success");
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Plus className="rotate-45" size={18} />
                        </button>
                        <button onClick={() => showNotification?.("Fitur edit produk", "info")} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                          <LayoutGrid size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tokoSubTab === "Keuangan" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTokoSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Keuangan</h2>
                    <p className="text-xs text-slate-500 font-bold">Ringkasan Saldo & Pencairan</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Total Saldo Tersedia</p>
                  <h3 className="text-4xl font-black mb-6 tracking-tighter">Rp 1.250.000</h3>
                  <button 
                    onClick={() => showNotification?.("Permintaan pencairan saldo dikirim!", "success")}
                    className="w-full py-4 bg-white text-emerald-700 font-black rounded-2xl hover:bg-emerald-50 transition-all active:scale-95 uppercase tracking-widest shadow-lg"
                  >
                    Tarik Saldo Ke Wallet
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">Riwayat Transaksi</h3>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start justify-between pb-4 border-b border-slate-50 last:border-none last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Plus size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 uppercase">Pesanan #2024-0{i}</p>
                            <p className="text-[10px] text-slate-400 font-bold">30 Mei 2026 • 12:45</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 tracking-tight">+Rp 45.000</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tokoSubTab === "Pengaturan" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setTokoSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pengaturan Toko</h2>
                    <p className="text-xs text-slate-500 font-bold">Kelola Identitas & Status</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center relative group cursor-pointer border-2 border-dashed border-emerald-300">
                      <Store size={40} />
                      <div className="absolute inset-0 bg-black/20 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="text-white" size={24} />
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Ubah Logo Toko</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Toko</label>
                       <input type="text" defaultValue="Toko Berkah Jaya" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deskripsi Singkat</label>
                       <textarea rows={2} defaultValue="Pusat sembako murah dan berkualitas di RT 26" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"></textarea>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-emerald-800 uppercase">Status Operasional</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Toko sedang terlihat oleh warga</p>
                      </div>
                      <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer shadow-inner">
                        <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      showNotification?.("Pengaturan berhasil disimpan!", "success");
                      setTokoSubTab("Main");
                    }}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeMainTab === "Akun" && (
          <div className="flex flex-col space-y-6">
            {akunSubTab === "Main" && (
              <>
                <div 
                  onClick={() => setAkunSubTab("EditProfil")}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-emerald-200 transition-all group"
                >
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-2xl font-black shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Users size={32} />
                    )}
                  </div>
                  <div className="flex-1 w-full overflow-hidden">
                    <h2 className="text-lg font-black text-slate-800 uppercase truncate">{profileName}</h2>
                    <p className="text-xs text-slate-500 font-bold truncate">Warga RT 26</p>
                    <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold">
                      <Star size={10} className="fill-amber-500" /> Member Silver
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                  <div onClick={() => setAkunSubTab("Alamat")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Package size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm font-bold text-slate-700">Alamat Pengiriman</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                  <div onClick={() => setAkunSubTab("Dompet")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <Wallet size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm font-bold text-slate-700">Dompet & Pembayaran</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                  <div onClick={() => setAkunSubTab("Bantuan")} className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="text-sm font-bold text-slate-700">Pusat Bantuan</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              </>
            )}

            {akunSubTab === "Alamat" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Alamat Pengiriman</h2>
                    <p className="text-xs text-slate-500 font-bold">Kelola alamat pengiriman anda</p>
                  </div>
                  <button 
                    onClick={() => {
                      setNewAddress({ label: "", receiver: "", street: "" });
                      setAkunSubTab("TambahAlamat");
                    }}
                    className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-90 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {localAddresses.map((addr) => (
                    <div key={addr.id} className={`bg-white rounded-[2rem] p-6 shadow-sm border-2 transition-all ${addr.isMain ? 'border-emerald-500' : 'border-slate-100 hover:border-emerald-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-black text-slate-800 uppercase">{addr.label} ({addr.receiver})</h3>
                        {addr.isMain && <span className="px-2 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-md tracking-wider">Utama</span>}
                      </div>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed mb-4">{addr.street}, {addr.district}, {addr.city}</p>
                      <div className="flex gap-2">
                        {!addr.isMain && (
                          <button 
                            onClick={() => {
                              setLocalAddresses(localAddresses.map(a => ({ ...a, isMain: a.id === addr.id })));
                              showNotification?.("Alamat utama berhasil diubah!", "success");
                            }}
                            className="flex-1 py-2 text-[10px] font-bold text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-50 transition-all uppercase tracking-widest"
                          >
                            Pilih Utama
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setEditingAddress(addr);
                            setAkunSubTab("EditAlamat");
                          }} 
                          className="flex-1 py-2 text-[10px] font-bold text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-all uppercase tracking-widest"
                        >
                          Ubah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {akunSubTab === "TambahAlamat" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Alamat")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tambah Alamat</h2>
                    <p className="text-xs text-slate-500 font-bold">Lengkapi detail lokasi anda</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Label Alamat (ex: Rumah, Kantor)</label>
                       <input 
                         type="text" 
                         value={newAddress.label}
                         onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                         placeholder="Contoh: Rumah" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Penerima</label>
                       <input 
                         type="text" 
                         value={newAddress.receiver}
                         onChange={(e) => setNewAddress({ ...newAddress, receiver: e.target.value })}
                         placeholder="Nama lengkap" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alamat Lengkap</label>
                       <textarea 
                         rows={3} 
                         value={newAddress.street}
                         onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                         placeholder="Nama jalan, nomor rumah, RT/RW, dsb" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                       ></textarea>
                    </div>
                  </div>

                  <button 
                    disabled={!newAddress.label || !newAddress.receiver || !newAddress.street}
                    onClick={() => {
                      const id = Math.random();
                      setLocalAddresses([...localAddresses, {
                        id,
                        label: newAddress.label,
                        receiver: newAddress.receiver,
                        phone: "+62 812-xxxx-xxxx",
                        street: newAddress.street,
                        district: "Kelurahan Pusat",
                        city: "Jakarta",
                        isMain: false
                      }]);
                      showNotification?.("Alamat berhasil ditambahkan!", "success");
                      setAkunSubTab("Alamat");
                    }}
                    className={`w-full py-5 font-black rounded-2xl transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs ${
                      !newAddress.label || !newAddress.receiver || !newAddress.street
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'
                    }`}
                  >
                    Simpan Alamat
                  </button>
                </div>
              </div>
            )}

            {akunSubTab === "EditAlamat" && editingAddress && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Alamat")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Ubah Alamat</h2>
                    <p className="text-xs text-slate-500 font-bold">Ubah detail lokasi pengiriman anda</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Label Alamat (ex: Rumah, Kantor)</label>
                       <input 
                         type="text" 
                         value={editingAddress.label}
                         onChange={(e) => setEditingAddress({ ...editingAddress, label: e.target.value })}
                         placeholder="Contoh: Rumah" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Penerima</label>
                       <input 
                         type="text" 
                         value={editingAddress.receiver}
                         onChange={(e) => setEditingAddress({ ...editingAddress, receiver: e.target.value })}
                         placeholder="Nama lengkap" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alamat Lengkap</label>
                       <textarea 
                         rows={3} 
                         value={editingAddress.street || ""}
                         onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                         placeholder="Nama jalan, nomor rumah, RT/RW, dsb" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                       ></textarea>
                    </div>
                  </div>

                  <button 
                    disabled={!editingAddress.label || !editingAddress.receiver || !editingAddress.street}
                    onClick={() => {
                      setLocalAddresses(localAddresses.map(addr => addr.id === editingAddress.id ? editingAddress : addr));
                      showNotification?.("Alamat berhasil diperbarui!", "success");
                      setAkunSubTab("Alamat");
                    }}
                    className={`w-full py-5 font-black rounded-2xl transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs ${
                      !editingAddress.label || !editingAddress.receiver || !editingAddress.street
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'
                    }`}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {akunSubTab === "Dompet" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Dompet & Bayar</h2>
                    <p className="text-xs text-slate-500 font-bold">Saldo & metode pembayaran</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-900/20 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">Saldo Gopay & Coins</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <h3 className="text-4xl font-black tracking-tighter">Rp {new Intl.NumberFormat('id-ID').format(walletBalance)}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setWalletBalance(walletBalance + 50000);
                        showNotification?.("Top up Rp 50.000 berhasil!", "success");
                      }} 
                      className="py-3 bg-white/20 backdrop-blur-md rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95 border border-white/20"
                    >
                      Isi Saldo
                    </button>
                    <button 
                      onClick={() => {
                        if (walletBalance >= 10000) {
                          setWalletBalance(walletBalance - 10000);
                          showNotification?.("Transfer Rp 10.000 berhasil!", "info");
                        } else {
                          showNotification?.("Saldo tidak cukup", "error");
                        }
                      }} 
                      className="py-3 bg-white text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg shadow-indigo-900/10"
                    >
                      Transfer
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">Metode Pembayaran</h3>
                  <div className="space-y-4">
                    <div 
                      onClick={() => setSelectedPaymentId(1)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${selectedPaymentId === 1 ? 'bg-emerald-50 border-2 border-emerald-500' : 'hover:bg-slate-50 border-2 border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-tighter italic">Bank</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Bank Mandiri</p>
                          <p className="text-[10px] text-slate-400 font-bold">**** **** 1234</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${selectedPaymentId === 1 ? 'border-emerald-500' : 'border-slate-200'}`}>
                        {selectedPaymentId === 1 && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                      </div>
                    </div>
                    <div 
                      onClick={() => setSelectedPaymentId(2)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${selectedPaymentId === 2 ? 'bg-rose-50 border-2 border-rose-500' : 'hover:bg-slate-50 border-2 border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-black text-xs uppercase tracking-tighter">Visa</div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Kartu Kredit</p>
                          <p className="text-[10px] text-slate-400 font-bold">**** **** 5678</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${selectedPaymentId === 2 ? 'border-rose-500' : 'border-slate-200'}`}>
                        {selectedPaymentId === 2 && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {akunSubTab === "Bantuan" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Pusat Bantuan</h2>
                    <p className="text-xs text-slate-500 font-bold">Siap membantu anda 24/7</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cari solusi atau FAQ..." 
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => {
                      showNotification?.("Menghubungkan ke Live Chat Support...", "success");
                      setAkunSubTab("LiveChat");
                    }} 
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-200 transition-all group"
                  >
                     <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageCircle size={24} />
                     </div>
                     <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Live Chat</span>
                  </div>
                  <div 
                    onClick={() => {
                      setAkunSubTab("EmailSupport");
                    }} 
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center gap-3 cursor-pointer hover:border-emerald-200 transition-all group"
                  >
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail size={24} />
                     </div>
                     <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Email Support</span>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">FAQ Populer</h3>
                  <div className="space-y-2">
                    {[
                      { q: "Bagaimana cara belanja?", a: "Pilih produk yang Anda inginkan, masukkan ke keranjang, lalu klik bayar. Gunakan saldo GoPay untuk transaksi instan!" },
                      { q: "Kenapa pesanan saya belum sampai?", a: "Lacak status pesanan di tab 'Transaksi'. Jika sudah lebih dari 24 jam belum diproses, silakan hubungi penjual via chat." },
                      { q: "Metode pembayaran apa saja?", a: "Kami mendukung GoPay, Coins, dan Transfer Bank Mandiri untuk saat ini." },
                      { q: "Cara mendaftar jadi penjual?", a: "Buka tab 'Akun' lalu pilih 'Pendaftaran Toko' untuk mulai berjualan produk Anda sendiri!" }
                    ].filter(item => item.q.toLowerCase().includes(faqSearch.toLowerCase())).map((faq, i) => (
                      <div key={i} className="border-b border-slate-50 last:border-none">
                        <div 
                          onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                          className="flex items-center justify-between py-4 cursor-pointer group"
                        >
                          <span className={`text-xs font-bold transition-colors ${expandedFaq === i ? 'text-emerald-600' : 'text-slate-600 group-hover:text-emerald-600'}`}>
                            {faq.q}
                          </span>
                          <ChevronRight size={14} className={`text-slate-300 transition-transform duration-300 ${expandedFaq === i ? 'rotate-90 text-emerald-500' : ''}`} />
                        </div>
                        <AnimatePresence>
                          {expandedFaq === i && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="text-[11px] text-slate-500 font-medium pb-4 leading-relaxed">
                                {faq.a}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kirim Pesan Langsung</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {["Pesanan", "Pembayaran", "Akun", "Lainnya"].map((cat) => (
                        <button 
                          key={cat}
                          onClick={() => setHelpForm({ ...helpForm, category: cat })}
                          className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${helpForm.category === cat ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      rows={3} 
                      value={helpForm.message}
                      onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
                      placeholder="Jelaskan detail kendala atau pertanyaan Anda..." 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none placeholder:text-slate-300"
                    ></textarea>
                    <button 
                      disabled={!helpForm.category || !helpForm.message}
                      onClick={() => {
                        showNotification?.("Laporan berhasil dikirim! Tim kami akan segera menghubungi Anda.", "success");
                        setHelpForm({ category: "", message: "" });
                      }}
                      className={`w-full py-4 font-black rounded-2xl transition-all active:scale-[0.95] uppercase tracking-widest text-[10px] ${!helpForm.category || !helpForm.message ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800'}`}
                    >
                      Kirim Bantuan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {akunSubTab === "LiveChat" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setAkunSubTab("Bantuan")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                      <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Live Chat</h2>
                      <p className="text-xs text-slate-500 font-bold">Terhubung langsung dengan Admin RT 26</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Online</span>
                  </div>
                </div>

                {/* Chat Box */}
                <div className="bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col h-[480px] shadow-sm relative">
                  <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-black rounded-2xl flex items-center justify-center text-xs shadow-inner">
                        RT26
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase">Kak Ratih</h4>
                        <p className="text-[9px] text-slate-400 font-bold">Layanan Warga & Lapak Mandiri</p>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-400">Respons rate: ~5 menit</span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm text-xs font-medium leading-relaxed ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                          <p>{msg.text}</p>
                          <span className={`text-[8px] block mt-1.5 font-bold uppercase tracking-wider ${msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    {chatIsTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 font-bold shadow-sm flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Ratih sedang mengetik</span>
                          <span className="flex gap-1">
                            <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Suggestions */}
                  <div className="p-3 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                    {[
                      "Bagaimana status pesanan saya?",
                      "Kapan iuran bulanan jatuh tempo?",
                      "Cara top-up saldo E-LAPAK?"
                    ].map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (chatIsTyping) return;
                          handleSendChatMessage(sug);
                        }}
                        className="inline-block px-3.5 py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 font-bold border border-slate-100 hover:border-emerald-200 rounded-full text-[9px] transition-all shrink-0 uppercase tracking-wider"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendChatMessage(chatInput);
                        }
                      }}
                      placeholder="Tulis pesan Anda disini..."
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendChatMessage(chatInput)}
                      disabled={!chatInput.trim() || chatIsTyping}
                      className={`p-3 rounded-2xl flex items-center justify-center transition-all ${!chatInput.trim() || chatIsTyping ? 'bg-slate-100 text-slate-300' : 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-95 hover:bg-emerald-700'}`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {akunSubTab === "EmailSupport" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Bantuan")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Email Support</h2>
                    <p className="text-xs text-slate-500 font-bold">Kirim tiket aduan resmi kepengurusan wilayah</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Pilih Template Masalah</h4>
                    <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none">
                      {[
                        { label: "Saran Lapak", sub: "Masukan usul fitur", cat: "Saran / Kritik" },
                        { label: "Aduan Saldo", sub: "Masalah top up saldo", cat: "Keuangan / Saldo" },
                        { label: "Kendala Akun", sub: "Masalah info pengiriman", cat: "Kendala Lapak / Produk" }
                      ].map((tpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSupportEmail({
                              category: tpl.cat,
                              subject: tpl.label + " - Bpk. Arif",
                              message: `Halo Pengurus RT 26,\n\nSaya ingin melaporkan/memberikan saran terkait hal ini:\n`
                            });
                            showNotification?.("Template diaktifkan", "info");
                          }}
                          className="p-3 bg-slate-50 hover:bg-emerald-50 text-left border border-slate-100 rounded-2xl flex flex-col gap-1 transition-all shrink-0 cursor-pointer hover:border-emerald-200"
                        >
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{tpl.label}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{tpl.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kategori Tiket</label>
                       <select 
                         value={supportEmail.category}
                         onChange={(e) => setSupportEmail({ ...supportEmail, category: e.target.value })}
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none"
                       >
                         <option value="Keuangan / Saldo">Keuangan / Saldo</option>
                         <option value="Kendala Lapak / Produk">Kendala Lapak / Produk</option>
                         <option value="Keamanan / Laporan">Keamanan / Laporan</option>
                         <option value="Saran / Kritik">Saran / Kritik</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subjek Tiket</label>
                       <input 
                         type="text" 
                         value={supportEmail.subject}
                         onChange={(e) => setSupportEmail({ ...supportEmail, subject: e.target.value })}
                         placeholder="Contoh: Masalah Top-Up E-Wallet" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pesan Detail Anda</label>
                       <textarea 
                         rows={4} 
                         value={supportEmail.message}
                         onChange={(e) => setSupportEmail({ ...supportEmail, message: e.target.value })}
                         placeholder="Jelaskan detail kendala Anda agar dapat kami tangani dengan cepat..." 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none resize-none"
                       ></textarea>
                    </div>
                  </div>

                  <button 
                    type="button"
                    disabled={!supportEmail.subject.trim() || !supportEmail.message.trim()}
                    onClick={() => {
                      showNotification?.("Tiket Email berhasil dikirimkan! ID Tiket: #RW26-" + Math.floor(1000 + Math.random() * 9000), "success");
                      setSupportEmail({ subject: "", category: "Keuangan / Saldo", message: "" });
                      setAkunSubTab("Bantuan");
                    }}
                    className={`w-full py-5 font-black rounded-2xl transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs ${
                      !supportEmail.subject.trim() || !supportEmail.message.trim()
                      ? 'bg-slate-100 text-slate-300'
                      : 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700'
                    }`}
                  >
                    Kirim Tiket Resmi
                  </button>
                </div>
              </div>
            )}

            {akunSubTab === "EditProfil" && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4">
                  <button onClick={() => setAkunSubTab("Main")} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-sm border border-slate-100 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Edit Profil</h2>
                    <p className="text-xs text-slate-500 font-bold">Perbarui informasi anda</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <input 
                      type="file" 
                      ref={profileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleProfilePhotoChange} 
                    />
                    <div 
                      onClick={() => profileInputRef.current?.click()}
                      className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center relative group cursor-pointer border-4 border-white shadow-lg overflow-hidden"
                    >
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Users size={48} />
                      )}
                      <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="text-white" size={24} />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] hover:underline"
                    >
                      Ganti Foto Profil
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nama Lengkap</label>
                       <input 
                         type="text" 
                         value={profileName} 
                         onChange={(e) => setProfileName(e.target.value)} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Nomor WhatsApp</label>
                       <input 
                         type="tel" 
                         value={profilePhone} 
                         onChange={(e) => setProfilePhone(e.target.value)} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</label>
                       <input 
                         type="email" 
                         value={profileEmail} 
                         onChange={(e) => setProfileEmail(e.target.value)} 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" 
                       />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      showNotification?.("Profil berhasil diperbarui!", "success");
                      setAkunSubTab("Main");
                    }}
                    className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}
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
              {unreadChatsCount > 0 && (
                <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  {unreadChatsCount}
                </div>
              )}
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
              <button 
                onClick={() => {
                  setUnreadNotifsCount(0);
                  if (showNotification) {
                    showNotification("Semua notifikasi telah ditandai dibaca.", "success");
                  }
                }}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Tandai semua dibaca
              </button>
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
