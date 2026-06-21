import React, { useState, useRef, useEffect } from 'react';
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
  {
    id: "prod-1",
    name: "Beras Cianjur Pandan Wangi 5kg",
    category: "Sembako",
    description: "Beras asli Cianjur, pulen, wangi pandan alami, tanpa pengawet atau pemutih kimia. Langsung dari petani binaan.",
    price: 78000,
    stock: 25,
    rt: "26",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400",
    discount: "Diskon 5%"
  },
  {
    id: "prod-2",
    name: "Minyak Goreng Sania 2L",
    category: "Sembako",
    description: "Minyak goreng kelapa sawit berkualitas tinggi, menghasilkan gorengan garing dan sehat. Kemasan pouch praktis.",
    price: 36500,
    stock: 40,
    rt: "26",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400",
    discount: ""
  },
  {
    id: "prod-3",
    name: "Set Keranjang Baju Lipat Aesthetic",
    category: "Rumah tangga",
    description: "Keranjang baju cucian serbaguna, bisa dilipat saat tidak digunakan. Bahan kanvas tebal tahan air bermotif minimalis.",
    price: 45000,
    stock: 12,
    rt: "25",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400",
    discount: ""
  },
  {
    id: "prod-4",
    name: "Nasi Goreng Spesial Pak RT 26",
    category: "Makanan & minuman",
    description: "Nasi goreng legenda dengan racikan bumbu rahasia Pak RT 26, dilengkapi telur mata sapi, suwiran ayam, acar dan kerupuk.",
    price: 18000,
    stock: 15,
    rt: "26",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400",
    discount: "Diskon 10%"
  },
  {
    id: "prod-5",
    name: "Servis AC Cuci Bersih Bergaransi",
    category: "Servis",
    description: "Jasa pembersihan AC indoor & outdoor oleh teknisi berpengalaman warga RT 26. Dingin maksimal, hemat listrik, garansi 30 hari.",
    price: 75000,
    stock: 5,
    rt: "26",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400",
    discount: ""
  },
  {
    id: "prod-6",
    name: "Laundry Kilat 6 Jam Cuci Setrika",
    category: "Laundry",
    description: "Layanan cuci kering setrika kilat selesai dalam 6 jam. Harum, rapi, higienis, menggunakan deterjen ramah kulit.",
    price: 12000,
    stock: 10,
    rt: "24",
    image: "https://images.unsplash.com/photo-1545173168-9f19072f1024?auto=format&fit=crop&q=80&w=400",
    discount: ""
  }
];

const RECENT_CHECKS = [
  {
    id: "prod-4",
    name: "Nasi Goreng Spesial Pak RT 26",
    label: "Kuliner",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-5",
    name: "Servis AC Cuci Bersih",
    label: "Jasa Servis",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "prod-1",
    name: "Beras Cianjur Pandan Wangi",
    label: "Sembako",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400"
  }
];

const BANNERS = [
  {
    title: "Voucher Spesial E-LAPAKITA",
    subtitle: "POTONGAN 50%",
    benefit: "Hingga Rp 20.000",
    promoCode: "HEMATBGT",
    image: "https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?auto=format&fit=crop&q=80&w=800",
    color: "from-emerald-600/90"
  },
  {
    title: "Subsidi Ongkir Warga RT 26",
    subtitle: "GRATIS ONGKIR",
    benefit: "Belanja Antar Tetangga",
    promoCode: "ONGKIRZERO",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800",
    color: "from-blue-600/90"
  },
  {
    title: "Cashback Koin Ekstra",
    subtitle: "CASHBACK 10%",
    benefit: "Koin Lapak +62",
    promoCode: "CASHBACK10",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800",
    color: "from-rose-600/90"
  }
];

const getPremiumStyle = (promoCode: string) => {
  const styles: Record<string, { bg: string; border: string; glow: string; textGlow: string; accent: string; labelGold: string }> = {
    HEMATBGT: {
      bg: "from-[#1a0e3a] via-[#3d1263] to-[#6b1580] text-white",
      border: "border-fuchsia-400/30 hover:border-fuchsia-400/60",
      glow: "hover:shadow-[0_20px_50px_rgba(107,21,128,0.35)]",
      textGlow: "text-fuchsia-200",
      accent: "text-amber-400",
      labelGold: "text-amber-300"
    },
    ONGKIRZERO: {
      bg: "from-[#631e05] via-[#ea580c] to-[#ca8a04] text-white",
      border: "border-amber-400/30 hover:border-amber-400/60",
      glow: "hover:shadow-[0_20px_50px_rgba(234,88,12,0.35)]",
      textGlow: "text-amber-200",
      accent: "text-amber-300",
      labelGold: "text-yellow-300"
    },
    CASHBACK10: {
      bg: "from-[#022a4a] via-[#0284c7] to-[#0ea5e9] text-white",
      border: "border-cyan-400/30 hover:border-sky-300/60",
      glow: "hover:shadow-[0_20px_50px_rgba(2,132,199,0.35)]",
      textGlow: "text-cyan-200",
      accent: "text-sky-300",
      labelGold: "text-[#38bdf8]"
    },
    MERDEKA82: {
      bg: "from-[#4c0519] via-[#9f1239] to-[#be123c] text-white",
      border: "border-rose-400/30 hover:border-red-400/60",
      glow: "hover:shadow-[0_20px_50px_rgba(159,18,57,0.35)]",
      textGlow: "text-rose-200",
      accent: "text-amber-400",
      labelGold: "text-yellow-300"
    },
    TAHUNBARU27: {
      bg: "from-[#09090b] via-[#1c1917] to-[#451a03] text-white",
      border: "border-amber-500/20 hover:border-amber-400/50",
      glow: "hover:shadow-[0_20px_50px_rgba(69,26,3,0.35)]",
      textGlow: "text-amber-200",
      accent: "text-amber-400",
      labelGold: "text-yellow-200"
    },
    GONGXIFACAI: {
      bg: "from-[#450a0a] via-[#b91c1c] to-[#ea580c] text-white",
      border: "border-amber-400/40 hover:border-amber-400/70",
      glow: "hover:shadow-[0_20px_50px_rgba(185,28,28,0.35)]",
      textGlow: "text-amber-300",
      accent: "text-yellow-300",
      labelGold: "text-[#fbbf24]"
    },
    HBDPAKRT26: {
      bg: "from-[#042f2c] via-[#0d9488] to-[#14b8a6] text-white",
      border: "border-teal-400/20 hover:border-teal-400/50",
      glow: "hover:shadow-[0_20px_50px_rgba(13,148,136,0.3)]",
      textGlow: "text-teal-200",
      accent: "text-teal-300",
      labelGold: "text-teal-100"
    },
    KEMBALIFITRI: {
      bg: "from-[#043324] via-[#059669] to-[#4ade80] text-white",
      border: "border-emerald-400/20 hover:border-emerald-400/50",
      glow: "hover:shadow-[0_20px_50px_rgba(5,150,105,0.3)]",
      textGlow: "text-emerald-200",
      accent: "text-amber-300",
      labelGold: "text-[#a7f3d0]"
    },
    LUCKY777: {
      bg: "from-[#11053b] via-[#4c1d95] to-[#db2777] text-white",
      border: "border-fuchsia-400/30 hover:border-fuchsia-300/50",
      glow: "hover:shadow-[0_20px_50px_rgba(76,29,149,0.35)]",
      textGlow: "text-purple-200",
      accent: "text-fuchsia-300",
      labelGold: "text-[#f0abfc]"
    }
  };
  return styles[promoCode] || {
    bg: "from-slate-900 via-slate-800 to-slate-950 text-white",
    border: "border-white/10 hover:border-white/30",
    glow: "hover:shadow-black/20",
    textGlow: "text-slate-300",
    accent: "text-amber-300",
    labelGold: "text-amber-200"
  };
};

const THEMATIC_VOUCHERS = [
  {
    title: "Voucher Spesial E-LAPAKITA",
    subtitle: "POTONGAN 50%",
    benefit: "Hingga Rp 20.000",
    promoCode: "HEMATBGT",
    badge: "🔥 DISKON UTAMA",
    tagline: "BELANJA SUPER HEMAT",
    bg: "from-emerald-500 to-teal-600 text-white",
    desc: "Voucher hemat andalan seluruh warga untuk belanja sembako dan kuliner.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=400", // Fashion
    displayBrand: "🏷️ FASHION WEEK",
    displayTitle: "UNTUNG KAMIS",
    displayTag: "Pasti Ori!",
    displayTagBg: "bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/30"
  },
  {
    title: "Subsidi Ongkir Warga RT 26",
    subtitle: "GRATIS ONGKIR",
    benefit: "Belanja Antar Tetangga",
    promoCode: "ONGKIRZERO",
    badge: "🚚 BEBAS ONGKIR",
    tagline: "ONGKIR RP 0",
    bg: "from-blue-500 to-cyan-600 text-white",
    desc: "Belanja hemat tanpa pusing ongkir khusus pengiriman antar warga RT/RW.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400", // Food & Beverage
    displayBrand: "🍔 FOOD & BEVERAGE",
    displayTitle: "KULINER MANIA",
    displayTag: "Bebas Ongkir!",
    displayTagBg: "bg-amber-500/30 text-amber-200 border-amber-400/30"
  },
  {
    title: "Cashback Koin Ekstra",
    subtitle: "CASHBACK 10%",
    benefit: "Koin Lapak +62",
    promoCode: "CASHBACK10",
    badge: "🪙 COIN BONUS",
    tagline: "UNTUNG LIPAT GANDA",
    bg: "from-rose-500 to-pink-600 text-white",
    desc: "Dapatkan cashback koin untuk transaksi berikutnya di merchant mana saja.",
    image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=400", // Perkakas
    displayBrand: "🛠️ UTILITY & TOOLS",
    displayTitle: "SUPER BRAND",
    displayTag: "Sangat Berfungsi!",
    displayTagBg: "bg-sky-500/30 text-sky-200 border-sky-400/30"
  },
  {
    title: "Gebyar Hari Kemerdekaan",
    subtitle: "DISKON 17%",
    benefit: "Hingga Rp 45.000",
    promoCode: "MERDEKA82",
    badge: "🇮🇩 HUT RI 82",
    tagline: "NKRI HARGA DISKON",
    bg: "from-red-600 to-rose-500 text-white",
    desc: "Voucher spesial menyambut Hari Kemerdekaan Republik Indonesia Ke-82.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400", // Aksesoris
    displayBrand: "👑 PREMIUM ACCESSORY",
    displayTitle: "HUT MERDEKA",
    displayTag: "Cinta NKRI!",
    displayTagBg: "bg-rose-500/30 text-rose-200 border-rose-400/30"
  },
  {
    title: "Tahun Baru Gemilang",
    subtitle: "CASHBACK 27%",
    benefit: "Hingga Rp 50.000",
    promoCode: "TAHUNBARU27",
    badge: "🎆 NEW YEAR 2027",
    tagline: "SAMBUT AWAL YANG BARU",
    bg: "from-amber-600 to-slate-800 text-white",
    desc: "Mulai lembaran baru tahun 2027 dengan belanja hemat penuh sukacita.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400", // Hp & Tablet
    displayBrand: "📱 GADGET & PHONE",
    displayTitle: "MEGA DEALS",
    displayTag: "Terbaru & Canggih!",
    displayTagBg: "bg-amber-500/30 text-amber-200 border-amber-400/30"
  },
  {
    title: "Angpao Hoki Imlek",
    subtitle: "POTONGAN RP 88K",
    benefit: "Min. Belanja Rp 150rb",
    promoCode: "GONGXIFACAI",
    badge: "🧧 IMLEK HOKI",
    tagline: "GONG XI FA CAI",
    bg: "from-rose-600 to-amber-500 text-white",
    desc: "Menyambut Imlek dengan keberuntungan berlimpah di Lapak Warga.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400", // Tas, sepatu
    displayBrand: "👞 SHOES & BAGS",
    displayTitle: "ANGPAO HOKI",
    displayTag: "Pasti Beruntung!",
    displayTagBg: "bg-red-500/30 text-red-200 border-red-400/30"
  },
  {
    title: "Ulang Tahun Pak RT 26",
    subtitle: "DISKON RP 26K",
    benefit: "Tanpa Minimal Belanja",
    promoCode: "HBDPAKRT26",
    badge: "🎂 ULTAL RT 26",
    tagline: "TRAKTIRAN KEPALA WILAYAH",
    bg: "from-emerald-600 to-teal-500 text-white",
    desc: "Tumpeng dan diskon dari Pak RT untuk seluruh warga tercinta!",
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=400", // Berenang Wisata
    displayBrand: "🌊 POOL & HOLIDAYS",
    displayTitle: "WISATA CERIA",
    displayTag: "HBD Pak RT!",
    displayTagBg: "bg-teal-500/30 text-teal-200 border-teal-400/30"
  },
  {
    title: "Berkah Lebaran Fitri",
    subtitle: "POTONGAN RP 50K",
    benefit: "Sembako & Hampers Silaturahmi",
    promoCode: "KEMBALIFITRI",
    badge: "🌙 LEBARAN BERKAH",
    tagline: "MINAL AIDIN WAL FAIZIN",
    bg: "from-emerald-700 to-yellow-600 text-white",
    desc: "Saling berbagi hampers dan sajian nikmat lebaran antar tetangga.",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=400", // Hampers/Muslim Architectural vibe
    displayBrand: "🌙 BARAKAH HARIAN",
    displayTitle: "LEBARAN FITRI",
    displayTag: "Pasti Berfaedah!",
    displayTagBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/30"
  },
  {
    title: "Kembar Cantik 777 (27-07-27)",
    subtitle: "DISKON RP 77.000",
    benefit: "Berlaku Khusus 27 Juli 2027",
    promoCode: "LUCKY777",
    badge: "🎰 HARI KEMBAR 777",
    tagline: "TRIPLE SEVEN LUCKY DAY",
    bg: "from-violet-600 to-fuchsia-700 text-white",
    desc: "Momen langka tanggal 27, bulan 7, tahun 2027. Diskon paling heboh!",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400", // Gems / luxury
    displayBrand: "💎 LUXURY GEMS",
    displayTitle: "LUCKY 777",
    displayTag: "Sangat Terbatas!",
    displayTagBg: "bg-fuchsia-500/30 text-fuchsia-200 border-fuchsia-400/30"
  },
  {
    title: "Program Pa RW",
    subtitle: "TEBUS MURAH",
    benefit: "Tebus Murah JSM (Jumat Sabtu Minggu)",
    promoCode: "PA_RW_JSM",
    badge: "👨‍💼 PROGRAM PAK RW",
    tagline: "MURAH MERIAH JSM",
    bg: "from-blue-700 to-indigo-800 text-white",
    desc: "Program spesial Pak RW untuk kebutuhan warga tiap akhir pekan.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400",
    displayBrand: "📢 PROGRAM PAK RW",
    displayTitle: "TEBUS MURAH JSM",
    displayTag: "Sangat Hemat!",
    displayTagBg: "bg-blue-500/30 text-blue-200 border-blue-400/30"
  }
];

export default function BelanjaView({ 
  products = [], 
  onAddToCart,
  showNotification,
  onProductSelect,
  onBackToMain,
  currentUser,
  onAddProduct
}: { 
  products?: any[], 
  onAddToCart?: (p: any) => void,
  showNotification?: (msg: string, type?: "success" | "error" | "info" | "warning") => void,
  onProductSelect?: (p: any) => void,
  onBackToMain?: () => void,
  currentUser?: any,
  onAddProduct?: (product: any) => void
}) {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState("Untuk Kamu");
  const [activeMainTab, setActiveMainTab] = useState("Home");
  const [unreadChatsCount, setUnreadChatsCount] = useState(8);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(3);
  const [tokoSubTab, setTokoSubTab] = useState<"Main" | "TambahProduk" | "DaftarPesanan" | "Statistik" | "ManageProduk" | "Keuangan" | "Pengaturan">("Main");
  const [akunSubTab, setAkunSubTab] = useState<"Main" | "Alamat" | "Dompet" | "Bantuan" | "EditProfil" | "TambahAlamat" | "EditAlamat" | "LiveChat" | "EmailSupport">("Main");
  const [chatMessages, setChatMessages] = useState<Array<{ id: number; text: string; sender: 'user' | 'agent'; time: string }>>([
    { id: 1, text: "Halo Bapak/Ibu, saya Ratih dari Customer Support E-LAPAKITA (SmaRtRw AI). Ada yang bisa saya bantu terkait transaksi, pembelanjaan, atau detail saldo Anda?", sender: "agent", time: "Baru saja" }
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
    { id: 1, label: "Rumah", receiver: "Bapak/Ibu", phone: "+62 812-3456-7890", street: "Jl. Melati IV No. 12, Blok B/12, RT 026/004", district: "Kelurahan Pusat", city: "Jakarta Selatan", isMain: true },
    { id: 2, label: "Kantor", receiver: "Bapak/Ibu (Kerja)", phone: "+62 812-3456-7890", street: "Gedung Smart City, Lt. 5, Jl. Teknologi Modern No. 8", district: "Kelurahan Maju", city: "Jakarta Pusat", isMain: false }
  ]);
  const [newAddress, setNewAddress] = useState({ label: "", receiver: "", street: "" });
  const [editingAddress, setEditingAddress] = useState<{ id: number; label: string; receiver: string; phone: string; street: string; district: string; city: string; isMain: boolean } | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Profil Warga");
  const [profilePhone, setProfilePhone] = useState("+62 8xx-xxxx-xxxx");
  const [profileEmail, setProfileEmail] = useState("user@smartrw.ai");
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
  const voucherScrollRef = useRef<HTMLDivElement>(null);
  const [isVoucherDragging, setIsVoucherDragging] = useState(false);
  const [voucherStartX, setVoucherStartX] = useState(0);
  const [voucherScrollLeft, setVoucherScrollLeft] = useState(0);

  const voucherScrollRef2 = useRef<HTMLDivElement>(null);
  const [isVoucherDragging2, setIsVoucherDragging2] = useState(false);
  const [voucherStartX2, setVoucherStartX2] = useState(0);
  const [voucherScrollLeft2, setVoucherScrollLeft2] = useState(0);

  const voucherScrollRef3 = useRef<HTMLDivElement>(null);
  const [isVoucherDragging3, setIsVoucherDragging3] = useState(false);
  const [voucherStartX3, setVoucherStartX3] = useState(0);
  const [voucherScrollLeft3, setVoucherScrollLeft3] = useState(0);

  const onVoucherMouseDown3 = (e: React.MouseEvent) => {
    if (!voucherScrollRef3.current) return;
    setIsVoucherDragging3(true);
    setVoucherStartX3(e.pageX - voucherScrollRef3.current.offsetLeft);
    setVoucherScrollLeft3(voucherScrollRef3.current.scrollLeft);
  };

  const onVoucherMouseLeave3 = () => {
    setIsVoucherDragging3(false);
  };

  const onVoucherMouseUp3 = () => {
    setIsVoucherDragging3(false);
  };

  const onVoucherMouseMove3 = (e: React.MouseEvent) => {
    if (!isVoucherDragging3 || !voucherScrollRef3.current) return;
    e.preventDefault();
    const x = e.pageX - voucherScrollRef3.current.offsetLeft;
    const walk = (x - voucherStartX3) * 2; // Scroll speed
    voucherScrollRef3.current.scrollLeft = voucherScrollLeft3 - walk;
  };


  const onVoucherMouseDown2 = (e: React.MouseEvent) => {
    if (!voucherScrollRef2.current) return;
    setIsVoucherDragging2(true);
    setVoucherStartX2(e.pageX - voucherScrollRef2.current.offsetLeft);
    setVoucherScrollLeft2(voucherScrollRef2.current.scrollLeft);
  };

  const onVoucherMouseLeave2 = () => {
    setIsVoucherDragging2(false);
  };

  const onVoucherMouseUp2 = () => {
    setIsVoucherDragging2(false);
  };

  const onVoucherMouseMove2 = (e: React.MouseEvent) => {
    if (!isVoucherDragging2 || !voucherScrollRef2.current) return;
    e.preventDefault();
    const x = e.pageX - voucherScrollRef2.current.offsetLeft;
    const walk = (x - voucherStartX2) * 2; // Scroll speed
    voucherScrollRef2.current.scrollLeft = voucherScrollLeft2 - walk;
  };


  const onVoucherMouseDown = (e: React.MouseEvent) => {
    if (!voucherScrollRef.current) return;
    setIsVoucherDragging(true);
    setVoucherStartX(e.pageX - voucherScrollRef.current.offsetLeft);
    setVoucherScrollLeft(voucherScrollRef.current.scrollLeft);
  };

  const onVoucherMouseLeave = () => {
    setIsVoucherDragging(false);
  };

  const onVoucherMouseUp = () => {
    setIsVoucherDragging(false);
  };

  const onVoucherMouseMove = (e: React.MouseEvent) => {
    if (!isVoucherDragging || !voucherScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - voucherScrollRef.current.offsetLeft;
    const walk = (x - voucherStartX) * 2; // Scroll speed
    voucherScrollRef.current.scrollLeft = voucherScrollLeft - walk;
  };

  const [localOrders, setLocalOrders] = useState([1, 2, 3]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRT, setSelectedRT] = useState("Semua");
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
      let replyText = "Baik Bapak/Ibu, pesan Anda sudah kami terima. Pengurus lapak RT 26 akan segera mengecek dan menanggapi dalam waktu dekat.";
      const lowerText = text.toLowerCase();
      if (lowerText.includes("pesanan") || lowerText.includes("status") || lowerText.includes("sore")) {
        replyText = "Untuk melacak transaksi atau pesanan aktif Bapak, silakan periksa status pengiriman di tab 'Daftar Pesanan' di menu Toko / Lapak Anda.";
      } else if (lowerText.includes("iuran") || lowerText.includes("bayar")) {
        replyText = "Setiap iuran bulanan warga RT 26/RW 04 dapat langsung dibayarkan otomatis memotong saldo dompet digital E-LAPAKITA Anda.";
      } else if (lowerText.includes("saldo") || lowerText.includes("top-up") || lowerText.includes("gopay") || lowerText.includes("isi")) {
        replyText = "Anda dapat menambah saldo balance Anda secara instan dengan mengklik tombol 'Isi Saldo' di menu Dompet Aktif Anda.";
      } else if (lowerText.includes("halo") || lowerText.includes("pagi") || lowerText.includes("siang") || lowerText.includes("malam")) {
        replyText = "Halo juga Bapak/Ibu! Ada yang bisa tim admin bantu seputar layanan terpadu warga RT 26 pada hari ini?";
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
    const pRT = p.rt || (p.tenantId && p.tenantId.toLowerCase().includes("rt") 
       ? p.tenantId.toLowerCase().split("rt")[1]?.split("_")[0]?.replace(/[^0-9]/g, "") 
       : "");
    
    const matchesCategory = activeCategory === "Semua" || p.category === activeCategory;
    const matchesRT = selectedRT === "Semua" || p.rt === selectedRT || pRT === selectedRT;
    const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Additional feed filtering logic
    let matchesFeed = true;
    if (activeFeedTab === "Elektronik") {
      matchesFeed = p.category === "Elektronik";
    } else if (activeFeedTab === "Belanja Mall") {
      matchesFeed = p.discount !== undefined; // Assume mall products have discounts for demo
    }

    return matchesCategory && matchesRT && matchesSearch && matchesFeed;
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
      'Modul Utama': 'Mengalihkan ke Dashboard Modul Utama E-LAPAKITA...'
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
    setShowFilterModal(true);
  };

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.7;
      const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      ref.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 animate-in fade-in duration-700 overflow-x-hidden">
      {/* E-LAPAKITA Premium Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-8 pb-14 rounded-b-[3rem] shadow-lg shadow-emerald-900/10 mb-[-2rem] relative z-20">
         <div className="flex justify-between items-start mb-6">
            <div onClick={() => handleQuickLink("Home")} className="cursor-pointer hover:opacity-80 transition-opacity">
               <h1 className="text-3xl font-black italic tracking-tighter mb-1 font-elegant">E-LAPAKITA</h1>
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
            {/* Unified Promo Section - Horizontally Scrollable Hero Module */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-base">🎟️</span> Voucher & Kupon Spesial Warga
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Geser kanan-kiri untuk kupon eksklusif</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <button 
                      onClick={() => scrollContainer(voucherScrollRef, 'left')}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <button 
                      onClick={() => scrollContainer(voucherScrollRef, 'right')}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                    Semua Voucher Aktif
                  </span>
                </div>
              </div>

              <div 
                ref={voucherScrollRef}
                onMouseDown={onVoucherMouseDown}
                onMouseLeave={onVoucherMouseLeave}
                onMouseUp={onVoucherMouseUp}
                onMouseMove={onVoucherMouseMove}
                className={`flex gap-5 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar snap-x ${isVoucherDragging ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'}`}
              >
                {THEMATIC_VOUCHERS.map((voucher, idx) => {
                  const premium = getPremiumStyle(voucher.promoCode);
                  return (
                    <div 
                      key={idx} 
                      className={`snap-start min-w-[340px] md:min-w-[370px] h-[195px] rounded-[28px] bg-gradient-to-br ${premium.bg} ${premium.border} ${premium.glow} shadow-lg shadow-black/15 overflow-hidden shrink-0 relative flex flex-row items-stretch group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                    >
                      {/* Premium Thematic Illustration Background Image with mix-blend-overlay */}
                      {voucher.image && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10 opacity-15">
                          <img 
                            src={voucher.image} 
                            alt={voucher.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110" 
                          />
                        </div>
                      )}

                      {/* Interactive Glass Shine Sweeping Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-out z-30 pointer-events-none"></div>

                      {/* Luxurious Background Mesh Elements */}
                      <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none z-10"></div>
                      <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-black/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                      
                      {/* Premium Dynamic Glitter Star */}
                      <div className="absolute top-3.5 right-3.5 scale-75 opacity-25 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none z-20">
                        <Star size={16} className={`${premium.accent} fill-current animate-pulse`} />
                      </div>

                      {/* Ticket Perforation Notch Circles */}
                      <div className="absolute -top-3.5 right-[112px] w-7 h-7 rounded-full bg-[#f8fafc] z-30 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.06)] pointer-events-none"></div>
                      <div className="absolute -bottom-3.5 right-[112px] w-7 h-7 rounded-full bg-[#f8fafc] z-30 shadow-[inset_0_4px_6px_rgba(0,0,0,0.06)] pointer-events-none"></div>
                      
                      {/* Perforation Line */}
                      <div className="absolute top-4 bottom-4 right-[125px] border-r border-dashed border-white/20 z-30 pointer-events-none"></div>

                      {/* Floating Thematic Luxury Product Image / Mockup Item sitting on pedestal */}
                      {voucher.image && (
                        <div className="absolute right-[120px] bottom-1 select-none pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-112 group-hover:-translate-y-2.5 group-hover:rotate-6 z-25">
                          <div className="w-[85px] h-[105px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 backdrop-blur-sm relative bg-black/15">
                            <img 
                              src={voucher.image} 
                              alt={voucher.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
                            />
                            {/* Beautiful sweeping reflection inside product card */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none"></div>
                          </div>
                          {/* Top Tag */}
                          <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 font-black text-[7px] px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-300">
                            <span>⚡</span> WOW
                          </div>
                        </div>
                      )}

                      {/* Main Coupon Body Section */}
                      <div className="flex-1 p-5 pr-1 flex flex-col justify-between relative z-20 text-white text-left">
                        <div className="space-y-1">
                          {/* Upper brand pill row */}
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/30 backdrop-blur-md rounded-md border border-white/10">
                              {voucher.displayBrand}
                            </span>
                          </div>

                          {/* Massive bold heading text like UNTUNG KAMIS */}
                          <div className="pt-1.5">
                            <h4 className="text-[20px] md:text-[23px] font-extrabold tracking-tighter leading-none select-none text-white group-hover:translate-x-1 group-hover:brightness-110 transition-all duration-300 font-sans transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                              {voucher.displayTitle}
                            </h4>
                          </div>

                          {/* Middle Tokopedia style "Pasti Ori" / "Bebas Ongkir" badge */}
                          <div className="pt-1 flex">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black border uppercase tracking-wider backdrop-blur-md shadow-sm select-none ${voucher.displayTagBg}`}>
                              <span>✓</span> {voucher.displayTag}
                            </div>
                          </div>
                        </div>

                        {/* Lower description / benefit limitations */}
                        <div className="flex items-center gap-1 border-t border-white/10 pt-1.5 mt-2">
                          <span className="text-[7.5px] uppercase tracking-widest block opacity-70">BENEFIT:</span>
                          <span className={`text-[8.5px] font-black ${premium.accent}`}>{voucher.benefit}</span>
                        </div>
                      </div>

                      {/* Coupon Action Stub Section */}
                      <div className="w-[125px] flex flex-col justify-between items-center p-4 pl-3 relative z-20 bg-black/15 text-white text-center border-l border-white/5">
                        <div className="flex flex-col items-center justify-center my-auto">
                          <span className="text-[7.5px] font-extrabold uppercase tracking-widest block opacity-70 mb-0.5">PROMO</span>
                          <span className="text-[11px] font-black text-white leading-tight tracking-tighter uppercase whitespace-pre-wrap px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                            {voucher.subtitle}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromoCode(voucher.promoCode);
                            showNotification?.(`Kupon ${voucher.promoCode} Berhasil Diklaim!`, "success");
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-yellow-400 hover:to-amber-500 text-slate-950 rounded-xl transition-all duration-300 font-extrabold text-[9px] tracking-widest uppercase active:scale-95 shadow-lg shadow-black/15 flex flex-col items-center justify-center gap-0.5 hover:shadow-yellow-500/10 hover:-translate-y-0.5"
                        >
                          <span className="leading-none">KLAIM</span>
                          <span className="text-[7px] font-black tracking-normal opacity-90 block">
                            [{voucher.promoCode}]
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

        {/* Quick Links Row - Customized to fit premium design with no-wrap */}
        <div className="bg-white rounded-3xl p-2 flex items-center justify-between border border-slate-100 shadow-xl shadow-slate-200/50 relative z-30">
          <button 
            onClick={() => handleQuickLink("Bonus")}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-orange-50/50 transition-all group"
          >
            <div className="bg-orange-50 p-2 rounded-xl group-hover:scale-110 transition-transform text-orange-500">
              <Gift className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">BONUS</span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-100"></div>

          <button 
            onClick={() => handleQuickLink("GoPay & Coins")}
            className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-2xl hover:bg-blue-50/50 transition-all group"
          >
            <div className="bg-blue-50 p-2 rounded-xl group-hover:scale-110 transition-transform text-blue-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider">GOPAY & COINS</span>
          </button>

          <div className="h-6 w-[1px] bg-slate-100"></div>

          <div className="flex items-center gap-2 pr-1 pl-2">
            <button 
              onClick={() => handleQuickLink("Cek Kupon")}
              className="bg-rose-50 hover:bg-rose-100 text-rose-500 p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative shadow-sm"
              title="Cek Kupon"
            >
              <Tag className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleQuickLink("Modul Utama")}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative shadow-sm"
              title="Modul Utama"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
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

        {/* RT Filter Selector */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full shrink-0">
             <Filter className="w-3 h-3 text-emerald-600" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Filter RT:</span>
          </div>
          {["Semua", "24", "25", "26"].map((rt) => (
            <button
              key={rt}
              onClick={() => {
                setSelectedRT(rt);
                showNotification?.(`Menampilkan Lapak dari RT ${rt === "Semua" ? "Seluruh Wilayah" : rt}`, "info");
              }}
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                selectedRT === rt 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/30" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200"
              }`}
            >
              {rt === "Semua" ? "Semua RT" : `RT ${rt}`}
            </button>
          ))}
        </div>

        {/* Recent Checks Section */}
        {RECENT_CHECKS.length > 0 && (
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
            <div 
              ref={voucherScrollRef3}
              onMouseDown={onVoucherMouseDown3}
              onMouseLeave={onVoucherMouseLeave3}
              onMouseUp={onVoucherMouseUp3}
              onMouseMove={onVoucherMouseMove3}
              className={`flex gap-4 overflow-x-auto pb-4 no-scrollbar ${isVoucherDragging3 ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'}`}
            >
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
        )}

        {/* Feed Headers & Tabs */}
        {filteredProducts.length > 0 && (
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
        )}

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
          <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Store size={40} className="text-slate-200" />
             </div>
             <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">E-LAPAKITA Masih Kosong</h4>
             <p className="text-slate-500 text-sm max-w-sm px-6 leading-relaxed">
               {PRODUCTS.length === 0 
                 ? "Belum ada warga yang membuka lapak di sini. Jadilah yang pertama memajukan ekonomi lingkungan dengan membuka toko Anda!" 
                 : searchQuery 
                   ? `Tidak ada produk yang sesuai dengan pencarian "${searchQuery}" di kategori ini.`
                   : `Belum ada produk di kategori ${activeCategory}.`}
             </p>
             {searchQuery ? (
               <button 
                 onClick={() => setSearchQuery("")}
                 className="mt-8 px-6 py-3 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
               >
                 Hapus Pencarian
               </button>
             ) : PRODUCTS.length === 0 && (
               <button 
                 onClick={() => setActiveMainTab("Pendaftaran Toko")}
                 className="mt-8 px-8 py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 flex items-center gap-2"
               >
                 <Plus size={16} />
                 Buka Lapak Sekarang
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
            <p className="text-sm text-slate-500 font-medium mb-6 max-w-xs">Buka toko gratis dan mulai berjualan ke seluruh warga E-LAPAKITA.</p>
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
                    showNotification("Toko berhasil dibuat! Selamat datang di E-LAPAKITA.", "success");
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
                        rt: "26", // Default RT for new products added via UI in RT 26 context
                        image: productImage || 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=400',
                        discount: ""
                      };
                      if (onAddProduct) {
                         onAddProduct(productToAdd);
                      } else {
                         setLocalProducts([productToAdd, ...localProducts]);
                      }
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
                            <span className="text-slate-800">{id === 1 ? 'Warga' : id === 2 ? 'Budi' : 'Citra'} (Blok B/{id}2)</span>
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
                              subject: tpl.label + " - " + (currentUser?.name || "Bapak/Ibu"),
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
                  <h3 className="text-sm font-bold text-slate-500 uppercase">Koin E-LAPAKITA</h3>
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
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kupon & Voucher Saya</h2>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Aktif
              </span>
            </div>

            {/* All Vouchers unified inside Cek Kupon page in 1 scrollable place */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span>✨</span> Semua Voucher & Kupon Aktif (Geser)
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => scrollContainer(voucherScrollRef2, 'left')}
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                    </button>
                    <button 
                      onClick={() => scrollContainer(voucherScrollRef2, 'right')}
                      className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Geser Kanan-Kiri</span>
                </div>
              </div>

              <div 
                ref={voucherScrollRef2}
                onMouseDown={onVoucherMouseDown2}
                onMouseLeave={onVoucherMouseLeave2}
                onMouseUp={onVoucherMouseUp2}
                onMouseMove={onVoucherMouseMove2}
                className={`flex gap-5 overflow-x-auto pb-6 pt-2 px-2 no-scrollbar snap-x ${isVoucherDragging2 ? 'cursor-grabbing select-none scroll-auto' : 'cursor-grab scroll-smooth'}`}
              >
                {THEMATIC_VOUCHERS.map((voucher, idx) => {
                  const premium = getPremiumStyle(voucher.promoCode);
                  return (
                    <div 
                      key={idx} 
                      className={`snap-start min-w-[340px] md:min-w-[370px] h-[195px] rounded-[28px] bg-gradient-to-br ${premium.bg} ${premium.border} ${premium.glow} shadow-lg shadow-black/15 overflow-hidden shrink-0 relative flex flex-row items-stretch group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                    >
                      {/* Premium Thematic Illustration Background Image with mix-blend-overlay */}
                      {voucher.image && (
                        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10 opacity-15">
                          <img 
                            src={voucher.image} 
                            alt={voucher.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-110" 
                          />
                        </div>
                      )}

                      {/* Interactive Glass Shine Sweeping Reflection */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-out z-30 pointer-events-none"></div>

                      {/* Luxurious Background Mesh Elements */}
                      <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none z-10"></div>
                      <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-black/20 rounded-full blur-2xl pointer-events-none z-10"></div>
                      
                      {/* Premium Dynamic Glitter Star */}
                      <div className="absolute top-3.5 right-3.5 scale-75 opacity-25 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none z-20">
                        <Star size={16} className={`${premium.accent} fill-current animate-pulse`} />
                      </div>

                      {/* Ticket Perforation Notch Circles */}
                      <div className="absolute -top-3.5 right-[112px] w-7 h-7 rounded-full bg-[#f8fafc] z-30 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.06)] pointer-events-none"></div>
                      <div className="absolute -bottom-3.5 right-[112px] w-7 h-7 rounded-full bg-[#f8fafc] z-30 shadow-[inset_0_4px_6px_rgba(0,0,0,0.06)] pointer-events-none"></div>
                      
                      {/* Perforation Line */}
                      <div className="absolute top-4 bottom-4 right-[125px] border-r border-dashed border-white/20 z-30 pointer-events-none"></div>

                      {/* Floating Thematic Luxury Product Image / Mockup Item sitting on pedestal */}
                      {voucher.image && (
                        <div className="absolute right-[120px] bottom-1 select-none pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-112 group-hover:-translate-y-2.5 group-hover:rotate-6 z-25">
                          <div className="w-[85px] h-[105px] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 backdrop-blur-sm relative bg-black/15">
                            <img 
                              src={voucher.image} 
                              alt={voucher.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
                            />
                            {/* Beautiful sweeping reflection inside product card */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none"></div>
                          </div>
                          {/* Top Tag */}
                          <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 text-slate-950 font-black text-[7px] px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 border border-amber-300">
                            <span>⚡</span> WOW
                          </div>
                        </div>
                      )}

                      {/* Main Coupon Body Section */}
                      <div className="flex-1 p-5 pr-1 flex flex-col justify-between relative z-20 text-white text-left">
                        <div className="space-y-1">
                          {/* Upper brand pill row */}
                          <div className="flex items-center gap-2">
                            <span className="text-[7.5px] font-black uppercase tracking-widest px-2 py-0.5 bg-black/30 backdrop-blur-md rounded-md border border-white/10">
                              {voucher.displayBrand}
                            </span>
                          </div>

                          {/* Massive bold heading text like UNTUNG KAMIS */}
                          <div className="pt-1.5">
                            <h4 className="text-[20px] md:text-[23px] font-extrabold tracking-tighter leading-none select-none text-white group-hover:translate-x-1 group-hover:brightness-110 transition-all duration-300 font-sans transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                              {voucher.displayTitle}
                            </h4>
                          </div>

                          {/* Middle Tokopedia style "Pasti Ori" / "Bebas Ongkir" badge */}
                          <div className="pt-1 flex">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black border uppercase tracking-wider backdrop-blur-md shadow-sm select-none ${voucher.displayTagBg}`}>
                              <span>✓</span> {voucher.displayTag}
                            </div>
                          </div>
                        </div>

                        {/* Lower description / benefit limitations */}
                        <div className="flex items-center gap-1 border-t border-white/10 pt-1.5 mt-2">
                          <span className="text-[7.5px] uppercase tracking-widest block opacity-70">BENEFIT:</span>
                          <span className={`text-[8.5px] font-black ${premium.accent}`}>{voucher.benefit}</span>
                        </div>
                      </div>

                      {/* Coupon Action Stub Section */}
                      <div className="w-[125px] flex flex-col justify-between items-center p-4 pl-3 relative z-20 bg-black/15 text-white text-center border-l border-white/5">
                        <div className="flex flex-col items-center justify-center my-auto">
                          <span className="text-[7.5px] font-extrabold uppercase tracking-widest block opacity-70 mb-0.5">PROMO</span>
                          <span className="text-[11px] font-black text-white leading-tight tracking-tighter uppercase whitespace-pre-wrap px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                            {voucher.subtitle}
                          </span>
                        </div>

                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromoCode(voucher.promoCode);
                            showNotification?.(`Voucher ${voucher.promoCode} Berhasil Disalin!`, "success");
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-yellow-400 hover:to-amber-500 text-slate-950 rounded-xl transition-all duration-300 font-extrabold text-[9px] tracking-widest uppercase active:scale-95 shadow-lg shadow-black/15 flex flex-col items-center justify-center gap-0.5 hover:shadow-yellow-500/10 hover:-translate-y-0.5"
                        >
                          <span className="leading-none">SALIN</span>
                          <span className="text-[7px] font-black tracking-normal opacity-90 block">
                            [{voucher.promoCode}]
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <button 
              onClick={() => handleQuickLink("Home")}
              className="mt-6 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors mx-auto block max-w-[200px]"
            >
              Kembali Ke Beranda
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
                <p className="text-sm font-medium">Ya pak, beras premium 5kg ready. Bisa diantar sekarang. Langsung lewat E-LAPAKITA ya transaksinya pak biar gampang saya rekap.</p>
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
                  <h3 className="text-sm font-bold text-slate-800">Promo Khusus Warga RT 26</h3>
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
      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowFilterModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8"
            >
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6">Filter Produk</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategori</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-brand-blue/30"
                    value={activeCategory} 
                    onChange={(e) => setActiveCategory(e.target.value)}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200 mt-4 hover:bg-blue-600 transition-all"
                >
                  Terapkan Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
