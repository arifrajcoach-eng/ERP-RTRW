import React, { useState, useRef, useMemo } from "react";
import {
  ShoppingCart,
  Package,
  Plus,
  PlusCircle,
  Truck,
  CreditCard,
  History,
  Trash2,
  Edit,
  X,
  Search,
  ArrowRight,
  Monitor,
  LayoutGrid,
  Heart,
  Star,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Ban,
  Lock,
  Camera,
  MapPin,
  MinusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import BelanjaView from "./BelanjaView";
import { StyledButton } from "../StyledButton";

const AVAILABLE_VOUCHERS = [
  { code: "ONGKIR0", label: "Gratis Ongkir", desc: "Potongan ongkir s.d Rp 12.000", value: 12000, type: "shipping" },
  { code: "PASTIDISKON", label: "Diskon 11%", desc: "Diskon belanja maks Rp 55.000", value: 0.11, type: "discount" },
  { code: "FLASHSALE50", label: "Flash Sale 50%", desc: "Hanya untuk produk bertanda khusus", value: 0.5, type: "discount" },
];

export default function ETokoView({
  userRole,
  tenantId,
  products,
  orders,
  reviews,
  currentUser,
  wargaAuth,
  handleFirestoreError,
  handleFileUpload,
  showNotification,
  accessMode,
  setShowUpgradeModal,
  onBackToMain,
}: {
  userRole: string;
  tenantId: string;
  products: any[];
  orders: any[];
  reviews: any[];
  currentUser: any;
  wargaAuth: any;
  handleFirestoreError: any;
  handleFileUpload: (file: File, folder: string) => Promise<string>;
  showNotification: any;
  accessMode?: "LIHAT" | "READ" | "JUAL" | "PRIORITAS" | boolean;
  setShowUpgradeModal: any;
  onBackToMain?: () => void;
}) {
  const [view, setView] = useState<"buyer" | "seller">("buyer");
  const [activeTab, setActiveTab] = useState<"shop" | "orders">("shop");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedRT, setSelectedRT] = useState("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editProdFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER">("COD");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [targetOrderForReview, setTargetOrderForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeDetailTab, setActiveDetailTab] = useState<"detail" | "reviews">("detail");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Admin states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "Sembako",
    description: "",
    image: "",
  });

  const roleUpper = userRole?.toUpperCase() || "";
  const isAdmin =
    roleUpper === "ADMIN" ||
    roleUpper === "SUPER_ADMIN" ||
    roleUpper === "OWNER" ||
    roleUpper === "RW" ||
    roleUpper === "RT";

  const isWarga = roleUpper === "WARGA" || roleUpper === "USER";

  // Allow Warga to toggle to seller view too
  const canToggleView = (isAdmin || isWarga) && accessMode !== "READ";
  
  const isReadOnly = accessMode === "READ" || accessMode === "LIHAT";

  const categories = [
    "Semua",
    "Sembako",
    "Rumah tangga",
    "Makanan & minuman",
    "Fashion",
    "Elektronik",
    "ATK & lainnya",
    "🔧 Servis (AC, listrik, bangunan)",
    "🧺 Laundry & kebersihan",
    "🚚 Transport / kurir",
    "🎓 Les & jasa profesional",
  ];

  const rtOptions = [
    "Semua",
    ...Array.from(new Set(products.map((p) => p.rtId).filter(Boolean))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesRT = selectedRT === "Semua" || p.rtId === selectedRT;
    return matchesSearch && matchesCategory && matchesRT;
  });

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showNotification(`${product.name} ditambahkan ke keranjang`, "success");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Perhitungan Ongkir dan Promo Fungsional
  const standardShippingFee = cart.length > 0 ? 12000 : 0;
  const isFreeShipping = appliedPromo?.code === "ONGKIR0";
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.code === "PASTIDISKON") {
      const elevenPercent = Math.round(cartTotal * 0.11);
      discountAmount = Math.min(elevenPercent, 55000);
    } else if (appliedPromo.code === "FLASHSALE50") {
      discountAmount = Math.round(cartTotal * 0.5);
    }
  }

  const handleApplyPromoCode = (codeToApply: string) => {
    const formattedCode = codeToApply.trim().toUpperCase();
    const found = AVAILABLE_VOUCHERS.find((v) => v.code === formattedCode);
    if (found) {
      setAppliedPromo(found);
      setPromoCodeInput("");
      showNotification(`Voucher ${found.code} berhasil diterapkan!`, "success");
    } else {
      showNotification("Kode promo tidak valid atau kadaluarsa. Silakan cek syarat penggunaan.", "error");
    }
  };

  const finalTotal = Math.max(0, cartTotal + shippingFee - discountAmount);

  const handleCheckout = async () => {
    if (isReadOnly) {
      setShowUpgradeModal(true);
      return;
    }
    if (cart.length === 0) return;
    const voterId = wargaAuth?.nik || currentUser?.uid;
    if (!voterId) {
      showNotification("Silakan login untuk memesan", "error");
      return;
    }

    setIsLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      await setDoc(doc(db, "toko_orders", orderId), {
        id: orderId,
        tenantId,
        items: cart,
        subtotal: cartTotal,
        shippingFee: shippingFee,
        discount: discountAmount,
        total: finalTotal,
        promoApplied: appliedPromo?.code || null,
        customerName: wargaAuth?.nama || currentUser?.name || "Warga",
        customerId: voterId,
        phone: wargaAuth?.telepon || "-",
        address: wargaAuth?.alamat || "-",
        paymentMethod: paymentMethod,
        status: "PENDING",
        timestamp: new Date().toISOString(),
      });

      // Update stock 
      const batch = writeBatch(db);
      cart.forEach((item) => {
        const prodRef = doc(db, "toko_products", item.id);
        const original = products.find((p) => p.id === item.id);
        if (original) {
          batch.update(prodRef, {
            stock: Math.max(0, (original.stock || 0) - item.qty),
          });
        }
      });
      await batch.commit();

      setCart([]);
      setShowCart(false);
      setActiveTab("orders");
      showNotification("Pesanan berhasil dikirim!", "success");
    } catch (err) {
      handleFirestoreError(err, "create", "toko_orders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const id = editingProduct ? editingProduct.id : `PROD-${Date.now()}`;
      const sellerId = editingProduct?.sellerId || wargaAuth?.nik || currentUser?.email || currentUser?.uid || "unknown";
      await setDoc(
        doc(db, "toko_products", id),
        {
          ...productForm,
          id,
          tenantId,
          sellerId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setEditingProduct(null);
      setIsAddingProduct(false);
      setProductForm({
        name: "",
        price: 0,
        stock: 0,
        category: "Sembako",
        description: "",
        image: "",
      });
      showNotification("Produk berhasil disimpan", "success");
    } catch (err) {
      handleFirestoreError(err, "write", "toko_products");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteDoc(doc(db, "toko_products", id));
      showNotification("Produk dihapus", "success");
    } catch (err) {
      handleFirestoreError(err, "delete", "toko_products");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "toko_orders", orderId), { status });
      showNotification(
        `Pesanan ${status === "COMPLETED" ? "Selesai" : "Dibatalkan"}`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, "update", "toko_orders");
    }
  };

  const handleSaveReview = async () => {
    if (!reviewComment.trim() || !targetOrderForReview) return;
    setIsLoading(true);
    try {
      const reviewId = `REV-${targetOrderForReview.id}-${Date.now()}`;
      const firstItem = targetOrderForReview.items[0];
      await setDoc(doc(db, "toko_reviews", reviewId), {
        id: reviewId,
        orderId: targetOrderForReview.id,
        productId: firstItem.id,
        productName: firstItem.name,
        rating: reviewRating,
        comment: reviewComment,
        customerName: wargaAuth?.nama || currentUser?.name || "Warga",
        customerId: wargaAuth?.nik || currentUser?.uid,
        timestamp: new Date().toISOString(),
        tenantId,
      });

      await updateDoc(doc(db, "toko_orders", targetOrderForReview.id), {
        isReviewed: true,
      });

      showNotification("Ulasan berhasil dikirim!", "success");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewModal(false);
      setTargetOrderForReview(null);
    } catch (err) {
      handleFirestoreError(err, "create", "toko_reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const displayProducts = view === "seller" && isWarga 
    ? products.filter(p => p.sellerId === (wargaAuth?.nik || currentUser?.email || currentUser?.uid))
    : products;

  const displayOrders = view === "seller" && isWarga
    ? orders.filter(o => o.items.some((item: any) => {
        const prod = products.find(p => p.id === item.id);
        return prod?.sellerId === (wargaAuth?.nik || currentUser?.email || currentUser?.uid);
      }))
    : orders;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {isReadOnly && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Mode Pratinjau (Lihat Saja)</p>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
              Paket Trial memberikan akses penuh melihat lapak warga. Untuk fitur Jual-Beli (Checkout) & Pengelolaan Toko, silakan Aktivasi Premium.
            </p>
          </div>
          <button 
            onClick={() => setShowUpgradeModal(true)}
            className="ml-auto px-4 py-2 bg-amber-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-200 shrink-0"
          >
            Upgrade Paket
          </button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
            E-LAPAK26
          </h2>
          <p className="text-slate-500 font-medium">
            Beli kebutuhan harian lebih mudah & dukung UMKM warga
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {canToggleView && (
            <div className="bg-slate-900/[0.04] p-1 rounded-[22px] flex items-center border border-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] relative z-10 w-full sm:w-auto gap-1">
              {/* Buyer Mode Button */}
              <motion.button
                onClick={() => setView("buyer")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative px-5 py-2.5 rounded-[17px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-colors duration-300 select-none overflow-hidden outline-none ${
                  view === "buyer" 
                    ? "text-white" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {view === "buyer" && (
                  <motion.div
                    layoutId="activeModePill"
                    className="absolute inset-0 bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 shadow-[0_8px_20px_rgba(244,63,94,0.3)] border-t border-white/20"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{ borderRadius: "17px" }}
                  />
                )}
                
                <ShoppingCart className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                  view === "buyer" ? "scale-110 text-white" : "text-slate-400 group-hover:scale-110"
                }`} />
                <span className="relative z-10 font-sans">Pembeli</span>
                
                {view === "buyer" && (
                  <span className="relative z-10 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-100"></span>
                  </span>
                )}
              </motion.button>

              {/* Seller Mode Button */}
              <motion.button
                onClick={() => setView("seller")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative px-5 py-2.5 rounded-[17px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 transition-colors duration-300 select-none overflow-hidden outline-none ${
                  view === "seller" 
                    ? "text-white" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {view === "seller" && (
                  <motion.div
                    layoutId="activeModePill"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 shadow-[0_8px_20px_rgba(37,99,235,0.3)] border-t border-white/20"
                    transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    style={{ borderRadius: "17px" }}
                  />
                )}
                
                <Package className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                  view === "seller" ? "scale-110 text-white" : "text-slate-400 group-hover:scale-110"
                }`} />
                <span className="relative z-10 font-sans">Penjual</span>
                
                {view === "seller" && (
                  <span className="relative z-10 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-100"></span>
                  </span>
                )}
              </motion.button>
            </div>
          )}

          {view === "buyer" && (
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {view === "buyer" ? (
        <div className="space-y-8">
          {/* Navigation Tab */}
          <div className="flex border-b border-slate-200 gap-8">
            <button
              onClick={() => setActiveTab("shop")}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "shop" ? "text-brand-blue" : "text-slate-400"}`}
            >
              Belanja Umum
              {activeTab === "shop" && (
                <motion.div
                  layoutId="tokotab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "orders" ? "text-brand-blue" : "text-slate-400"}`}
            >
              Pesanan Saya
              {activeTab === "orders" && (
                <motion.div
                  layoutId="tokotab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                />
              )}
            </button>
          </div>

          {activeTab === "shop" && (
            <BelanjaView 
              products={products} 
              onAddToCart={addToCart}
              showNotification={showNotification}
              onBackToMain={() => {
                if (onBackToMain) onBackToMain();
              }}
              onProductSelect={(p) => {
                setSelectedProduct(p);
                setShowProductModal(true);
              }}
              currentUser={currentUser}
            />
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders
                .filter(
                  (o) => o.customerId === (wargaAuth?.nik || currentUser?.uid),
                )
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
                )
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-4 rounded-2xl ${order.status === "COMPLETED" ? "bg-green-50 text-green-600" : order.status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                      >
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">
                          {order.id}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(order.timestamp).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 px-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item: any) => (
                          <span
                            key={item.id}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg"
                          >
                            {item.qty}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-slate-800">
                        Rp {order.total?.toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${
                          order.status === "COMPLETED"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : order.status === "CANCELLED"
                              ? "text-red-600 border-red-200 bg-red-50"
                              : "text-blue-600 border-blue-200 bg-blue-50"
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.status === "COMPLETED" && !order.isReviewed && (
                        <button
                          onClick={() => {
                            setTargetOrderForReview(order);
                            setShowReviewModal(true);
                          }}
                          className="mt-2 block w-full px-3 py-1.5 bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all"
                        >
                          Beri Ulasan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Produk Anda</p>
               <h4 className="text-2xl font-black text-slate-800">{displayProducts.length}</h4>
             </div>
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pesanan Masuk</p>
                <h4 className="text-2xl font-black text-blue-600">{displayOrders.length}</h4>
             </div>
           </div>

           <div className="flex items-center justify-between">
             <h3 className="text-xl font-black text-slate-800">Daftar Produk Jualan</h3>
             <StyledButton 
               onClick={() => {
                 setEditingProduct(null);
                 setProductForm({ name:"", price:0, stock:0, category:"Sembako", description:"", image:"" });
                 setIsAddingProduct(true);
               }}
               label="Tambah Produk"
               colorType="pastelBlue"
             />
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {displayProducts.map(p => (
               <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                 <div className="h-40 bg-slate-100 relative">
                   <img src={p.image || "/placeholder-prod.png"} className="w-full h-full object-cover" alt={p.name} />
                   <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingProduct(p); setProductForm(p); setIsAddingProduct(true); }} className="p-2 bg-white rounded-xl text-blue-600 shadow-lg"><Edit className="w-4 h-4"/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 bg-white rounded-xl text-red-600 shadow-lg"><Trash2 className="w-4 h-4"/></button>
                   </div>
                 </div>
                 <div className="p-4">
                    <p className="text-[9px] font-black text-brand-blue uppercase">{p.category}</p>
                    <h5 className="font-black text-slate-800 text-sm line-clamp-1">{p.name}</h5>
                    <p className="text-blue-600 font-black text-sm mt-1">Rp {p.price.toLocaleString()}</p>
                    <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Stok: {p.stock}</span>
                       <span className="text-[10px] font-bold text-slate-400 capitalize">{p.rtId ? `RT ${p.rtId}` : ""}</span>
                    </div>
                 </div>
               </div>
             ))}
           </div>

           <h3 className="text-xl font-black text-slate-800 mt-12">Pesanan Masuk</h3>
           <div className="space-y-4">
              {displayOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h5 className="font-black text-slate-800">Order #{order.id.split("-")[1]}</h5>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Dari: {order.customerName}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${order.status === "COMPLETED" ? "bg-green-50 text-green-600 border-green-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-xs font-bold text-slate-600">
                         <span>{item.qty}x {item.name}</span>
                         <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-slate-400">
                       {order.phone} | {order.address}
                    </div>
                    {order.status === "PENDING" && isAdmin && (
                       <div className="flex gap-2">
                          <button onClick={() => updateOrderStatus(order.id, "CANCELLED")} className="px-4 py-2 bg-slate-100 text-slate-400 text-[9px] font-black uppercase rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">Tolak</button>
                          <button onClick={() => updateOrderStatus(order.id, "COMPLETED")} className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-emerald-700 transition-all">Selesaikan</button>
                       </div>
                    )}
                  </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
             <motion.div initial={{ opacity:0, scale: 0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale: 0.95 }} className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="p-8 bg-slate-50 border-b border-slate-100 shrink-0 flex items-center justify-between">
                   <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Keranjang Belanja</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Dukung UMKM Warga Wilayah</p>
                   </div>
                   <button onClick={() => setShowCart(false)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all group">
                      <X className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                   {cart.length === 0 ? (
                     <div className="py-20 text-center space-y-4">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                           <ShoppingCart className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold">Keranjang Anda masih kosong</p>
                        <StyledButton label="Mulai Belanja" onClick={() => setShowCart(false)} />
                     </div>
                   ) : (
                     cart.map(item => (
                       <div key={item.id} className="flex items-center gap-6 p-4 bg-slate-50 rounded-[1.5rem] group">
                          <div className="w-20 h-20 rounded-2xl bg-white overflow-hidden shadow-sm flex-shrink-0">
                             <img src={item.image || "/placeholder-prod.png"} className="w-full h-full object-cover" alt={item.name} />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-black text-slate-800">{item.name}</h4>
                             <p className="text-sm font-black text-blue-600">Rp {item.price.toLocaleString()}</p>
                             <div className="flex items-center gap-3 mt-3">
                                <button onClick={() => updateCartQty(item.id, -1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-all"><MinusCircle className="w-4 h-4 text-slate-400"/></button>
                                <span className="text-sm font-black w-6 text-center">{item.qty}</span>
                                <button onClick={() => updateCartQty(item.id, 1)} className="p-2 bg-white rounded-xl shadow-sm hover:bg-blue-50 transition-all"><PlusCircle className="w-4 h-4 text-slate-400"/></button>
                             </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5"/></button>
                       </div>
                     ))
                   )}
                </div>

                {cart.length > 0 && (
                   <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6 shrink-0">
                      {/* Promo Section */}
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input 
                             type="text" 
                             placeholder="Punya kode promo?"
                             className="flex-1 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-100 outline-none"
                             value={promoCodeInput}
                             onChange={(e) => setPromoCodeInput(e.target.value)}
                          />
                          <button 
                             onClick={() => handleApplyPromoCode(promoCodeInput)}
                             className="px-6 bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100"
                          >
                             Terapkan
                          </button>
                        </div>
                        
                        {appliedPromo && (
                          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl animate-in fade-in zoom-in">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Voucher: {appliedPromo.code}</span>
                            </div>
                            <button onClick={() => setAppliedPromo(null)} className="text-emerald-400 hover:text-emerald-700"><X className="w-4 h-4"/></button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Subtotal</span>
                           <span>Rp {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Ongkos Kirim</span>
                           <span>{shippingFee === 0 ? "Gratis!" : `Rp ${shippingFee.toLocaleString()}`}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-xs font-bold text-emerald-600 uppercase tracking-widest">
                             <span>Potongan Promo</span>
                             <span>- Rp {discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xl font-black text-slate-800 pt-2 border-t border-slate-200">
                           <span>Total Pembayaran</span>
                           <span>Rp {finalTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3">
                         <div className="flex-1 bg-white p-1 rounded-2xl flex border border-slate-200">
                            <button onClick={() => setPaymentMethod("COD")} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === "COD" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"}`}>COD</button>
                            <button onClick={() => setPaymentMethod("TRANSFER")} className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${paymentMethod === "TRANSFER" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400"}`}>Transfer</button>
                         </div>
                         <button 
                           onClick={handleCheckout}
                           disabled={isLoading}
                           className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
                         >
                            {isLoading ? "Memproses..." : "Buat Pesanan Sekarang"}
                         </button>
                      </div>
                   </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
         {showProductModal && selectedProduct && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/40">
              <motion.div initial={{ opacity:0, y: 100 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y: 100 }} className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                 <div className="md:w-1/2 p-4">
                    <div className="w-full h-full bg-slate-50 rounded-[2.5rem] overflow-hidden relative group">
                       <img src={selectedProduct.image || "/placeholder-prod.png"} className="w-full h-full object-cover" alt="Detail" />
                       <button onClick={() => setShowProductModal(false)} className="absolute top-6 left-6 p-3 bg-white/80 backdrop-blur rounded-2xl shadow-xl md:hidden"><X className="w-5 h-5"/></button>
                    </div>
                 </div>
                 <div className="flex-1 p-8 md:p-12 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selectedProduct.category}</span>
                          <h3 className="text-3xl font-black text-slate-800 tracking-tight mt-2">{selectedProduct.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                             <MapPin className="w-3.5 h-3.5 text-slate-400" />
                             <p className="text-xs font-bold text-slate-400">Tersedia di RT {selectedProduct.rtId}</p>
                          </div>
                       </div>
                       <button onClick={() => setShowProductModal(false)} className="hidden md:block p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="flex border-b border-slate-100 gap-8 mb-6">
                       <button onClick={() => setActiveDetailTab("detail")} className={`pb-4 text-xs font-black uppercase tracking-widest relative ${activeDetailTab === "detail" ? "text-brand-blue" : "text-slate-400"}`}>Detail
                          {activeDetailTab === "detail" && <motion.div layoutId="detailtab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                       </button>
                       <button onClick={() => setActiveDetailTab("reviews")} className={`pb-4 text-xs font-black uppercase tracking-widest relative ${activeDetailTab === "reviews" ? "text-brand-blue" : "text-slate-400"}`}>Ulasan ({reviews.filter(r => r.productId === selectedProduct.id).length})
                          {activeDetailTab === "reviews" && <motion.div layoutId="detailtab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
                       </button>
                    </div>

                    <div className="flex-1 mb-8">
                       {activeDetailTab === "detail" ? (
                          <div className="space-y-6">
                             <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harga Terbaik</p>
                                <p className="text-3xl font-black text-brand-blue tracking-tighter">Rp {selectedProduct.price.toLocaleString()}</p>
                             </div>
                             <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Deskripsi Produk</p>
                                <p className="text-slate-600 leading-relaxed">{selectedProduct.description || "Tidak ada deskripsi rinci untuk produk ini."}</p>
                             </div>
                             <div className="flex items-center gap-8 py-4 border-y border-slate-50">
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Stok</p>
                                   <p className="text-sm font-black">{selectedProduct.stock} Unit</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Kondisi</p>
                                   <p className="text-sm font-black">Baru / UMKM</p>
                                </div>
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-4">
                             {reviews.filter(r => r.productId === selectedProduct.id).length > 0 ? (
                               reviews.filter(r => r.productId === selectedProduct.id).map(rev => (
                                 <div key={rev.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2">
                                       <span className="font-black text-sm text-slate-800">{rev.customerName}</span>
                                       <div className="flex gap-0.5 text-amber-400">
                                          {Array.from({length: 5}).map((_, i) => (
                                            <Star key={i} className="w-3 h-3" fill={i < rev.rating ? "currentColor" : "none"} />
                                          ))}
                                       </div>
                                    </div>
                                    <p className="text-slate-600 text-xs italic">"{rev.comment}"</p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-2">{new Date(rev.timestamp).toLocaleDateString()}</p>
                                 </div>
                               ))
                             ) : (
                               <div className="py-12 text-center">
                                  <Star className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                  <p className="text-slate-400 font-bold text-sm">Belum ada ulasan untuk produk ini</p>
                               </div>
                             )}
                          </div>
                       )}
                    </div>

                    <StyledButton 
                       label={cart.some(i => i.id === selectedProduct.id) ? "Ditambahkan ✓" : "Tambahkan ke Keranjang"}
                       onClick={() => addToCart(selectedProduct)}
                       colorType="pastelBlue"
                       className="py-5 text-sm"
                       disabled={selectedProduct.stock <= 0}
                    />
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Adding Product Overlay (Seller) */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-slate-900/60">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingProduct ? "Edit Produk" : "Posting Produk Baru"}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ayo kembangkan UMKM wilayah kita</p>
                 </div>
                 <button onClick={() => setIsAddingProduct(false)} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-slate-100 transition-all"><X className="w-5 h-5 text-slate-400"/></button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-8 pb-12 overflow-y-auto max-h-[70vh] scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Produk</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                        value={productForm.name}
                        onChange={e => setProductForm({...productForm, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga (Rp)</label>
                         <input 
                            type="number" 
                            required 
                            className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                            value={productForm.price}
                            onChange={e => setProductForm({...productForm, price: parseInt(e.target.value) || 0})}
                         />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stok</label>
                          <input 
                             type="number" 
                             required 
                             className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                             value={productForm.stock}
                             onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value) || 0})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                       <select 
                          className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                          value={productForm.category}
                          onChange={e => setProductForm({...productForm, category: e.target.value})}
                       >
                          {categories.filter(c => c !== "Semua").map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gambar Produk</label>
                       <div 
                          onClick={() => editProdFileInputRef.current?.click()}
                          className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all overflow-hidden group"
                       >
                          {productForm.image ? (
                             <img src={productForm.image} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                             <>
                                <Camera className="w-8 h-8 text-slate-300 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Klik untuk Upload</span>
                             </>
                          )}
                       </div>
                       <input 
                         type="file" 
                         ref={editProdFileInputRef} 
                         className="hidden" 
                         accept="image/*"
                         onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                               const url = await handleFileUpload(file, "toko_products");
                               setProductForm({...productForm, image: url});
                            }
                         }}
                       />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Produk</label>
                     <textarea 
                        rows={3} 
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none resize-none"
                        placeholder="Ceritakan Detail Produk Anda kepada Pembeli..."
                        value={productForm.description}
                        onChange={e => setProductForm({...productForm, description: e.target.value})}
                     />
                  </div>

                  <div className="md:col-span-2 pt-6 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200"
                    >
                      {isLoading ? "Menyimpan..." : (editingProduct ? "Simpan Perubahan" : "Posting Produk")}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && targetOrderForReview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 z-[130]"
            >
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Beri Ulasan</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Produk: {targetOrderForReview.items?.[0]?.name || "Produk"}</p>
              
              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`w-8 h-8 ${s <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`} />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold resize-none mb-8 text-sm"
                placeholder="Ceritakan pengalaman belanja Anda..."
              />

              <div className="flex gap-4">
                <button onClick={() => setShowReviewModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Batal</button>
                <button 
                  onClick={handleSaveReview}
                  className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200 animate-pulse hover:animate-none"
                >
                  Kirim Ulasan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
