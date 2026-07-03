import React, { useState, useRef } from "react";
import { 
  ShoppingCart, 
  Package, 
  Lock, 
  Edit, 
  Upload, 
  Camera, 
  X, 
  FileText, 
  Star, 
  ShoppingBag 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import BelanjaView from "./toko/BelanjaView";
import { StyledButton } from "./StyledButton";

const AVAILABLE_VOUCHERS = [
  { code: "ONGKIR0", label: "Gratis Ongkir", description: "Potongan ongkir s/d Rp 12.000", minPurchase: 50000 },
  { code: "PASTIDISKON", label: "Diskon 11%", description: "Potongan harga s/d Rp 55.000", minPurchase: 100000 },
  { code: "FLASHSALE50", label: "Flash Sale 50%", description: "Diskon 50% untuk semua item!", minPurchase: 0 },
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

      // Update stock (ideally via cloud function/batch, but here for demo)
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

  // Seller/Admin Actions
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
                           className="ml-3 text-[10px] font-black text-brand-blue uppercase underline tracking-widest"
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
           {/* Seller View */}
           <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div>
               <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Panel Toko Saya</h3>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Kelola stok dan pesanan warga</p>
             </div>
             <button
               onClick={() => {
                 setEditingProduct(null);
                 setIsAddingProduct(true);
               }}
               className="bg-brand-blue text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-blue-200"
             >
               <Edit className="w-4 h-4" /> Tambah Produk
             </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Stok Produk</h4>
               <div className="space-y-4">
                 {products.filter(p => p.sellerId === (wargaAuth?.nik || currentUser?.uid)).map(product => (
                   <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-4">
                        <img src={product.image} className="w-12 h-12 object-cover rounded-xl" />
                        <div>
                          <p className="font-black text-slate-700 text-sm">{product.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Stok: {product.stock}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           setEditingProduct(product);
                           setProductForm({
                             name: product.name,
                             price: product.price,
                             stock: product.stock,
                             category: product.category,
                             description: product.description,
                             image: product.image,
                           });
                           setIsAddingProduct(true);
                         }}
                         className="p-2 text-slate-400 hover:text-brand-blue"
                       >
                         <Edit className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => deleteProduct(product.id)}
                         className="p-2 text-slate-400 hover:text-red-500"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>

             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-400">Pesanan Masuk</h4>
               <div className="space-y-4">
                 {orders.filter((o: any) => o.items.some((item: any) => {
                   const p = products.find(prod => prod.id === item.id);
                   return p?.sellerId === (wargaAuth?.nik || currentUser?.uid);
                 })).map(order => (
                   <div key={order.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                     <div>
                       <p className="font-black text-slate-700 text-xs uppercase tracking-widest mb-1">{order.customerName}</p>
                       <p className="text-[10px] font-bold text-slate-400 italic mb-2">{order.items.map((i: any) => `${i.qty}x ${i.name}`).join(', ')}</p>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                         {order.status}
                       </span>
                     </div>
                     {order.status === 'PENDING' && (
                       <button 
                         onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                         className="bg-green-500 text-white p-2 rounded-xl"
                       >
                         <Package className="w-4 h-4" />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Cart Drawer Overlay */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tighter">KERANJANG</h3>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-50 rounded-xl">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <ShoppingCart className="w-20 h-20 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Keranjang Kosong</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <img src={item.image} className="w-20 h-20 object-cover rounded-2xl shadow-sm" />
                      <div className="flex-1">
                        <p className="font-black text-slate-800 text-sm leading-tight mb-1">{item.name}</p>
                        <p className="text-brand-blue font-black text-sm mb-3">Rp {item.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateCartQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all font-black text-xs">-</button>
                          <span className="font-black text-xs w-4 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all font-black text-xs">+</button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-auto text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-8 border-t border-slate-100 mt-8 space-y-4">
                  <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>Rp {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <span>Ongkir</span>
                    <span>{isFreeShipping ? "Gratis" : `Rp ${shippingFee.toLocaleString()}`}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-500 text-[10px] font-black uppercase tracking-widest">
                      <span>Potongan Voucher</span>
                      <span>- Rp {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-black text-slate-800 tracking-tighter">
                    <span>TOTAL</span>
                    <span>Rp {finalTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="KODE PROMO"
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl px-4 text-[10px] font-black uppercase placeholder:opacity-50 outline-none focus:border-brand-blue/30"
                    />
                    <button 
                      onClick={() => handleApplyPromoCode(promoCodeInput)}
                      className="bg-slate-800 text-white px-4 py-3 rounded-xl text-[10px] font-black hover:bg-slate-700 transition-all"
                    >
                      GUNAKAN
                    </button>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isLoading}
                    className="w-full bg-brand-blue text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                  >
                    {isLoading ? "MEMPROSES..." : "PESAN SEKARANG"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowProductModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]"
            >
              <div className="md:w-1/2 relative bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedProduct.image}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowProductModal(false)}
                  className="absolute top-6 left-6 p-3 bg-white/90 backdrop-blur shadow-xl rounded-2xl hover:bg-white transition-all group"
                >
                  <X className="w-5 h-5 text-slate-800 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div className="md:w-1/2 p-10 md:p-14 overflow-auto scrollbar-hide">
                <div className="flex border-b border-slate-100 mb-8 gap-8">
                  <button
                    onClick={() => setActiveDetailTab("detail")}
                    className={`pb-4 text-[10px] font-black tracking-widest uppercase transition-all relative ${activeDetailTab === "detail" ? "text-brand-blue" : "text-slate-400"}`}
                  >
                    Detail Produk
                    {activeDetailTab === "detail" && (
                      <motion.div
                        layoutId="detailtab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveDetailTab("reviews")}
                    className={`pb-4 text-[10px] font-black tracking-widest uppercase transition-all relative ${activeDetailTab === "reviews" ? "text-brand-blue" : "text-slate-400"}`}
                  >
                    Ulasan (
                    {
                      reviews.filter((r) => r.productId === selectedProduct.id)
                        .length
                    }
                    )
                    {activeDetailTab === "reviews" && (
                      <motion.div
                        layoutId="detailtab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                      />
                    )}
                  </button>
                </div>

                {activeDetailTab === "detail" ? (
                  <>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-xl font-black text-brand-blue">
                        Rp {selectedProduct.price.toLocaleString()}
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        Stok: {selectedProduct.stock}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                      {selectedProduct.description ||
                        "Kualitas terjamin untuk warga RW 26."}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          if (isReadOnly) {
                            setShowUpgradeModal(true);
                            return;
                          }
                          addToCart(selectedProduct);
                          setShowProductModal(false);
                        }}
                        className={`flex-1 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-xl ${isReadOnly ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
                      >
                        {isReadOnly ? "Hanya Bisa Dilihat (Trial)" : "Tambah Ke Keranjang"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                    {reviews.filter((r) => r.productId === selectedProduct.id)
                      .length === 0 ? (
                      <div className="py-14 text-center text-slate-300">
                        <ShoppingBag className="w-12 h-12 mx-auto opacity-10 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Belum ada ulasan
                        </p>
                      </div>
                    ) : (
                      reviews
                        .filter((r) => r.productId === selectedProduct.id)
                        .sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime(),
                        )
                        .map((rev) => (
                          <div
                            key={rev.id}
                            className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                {rev.customerName}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {rev.comment}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">
                              {new Date(rev.timestamp).toLocaleDateString(
                                "id-ID",
                                { month: "short", year: "numeric" },
                              )}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      {showReviewModal && targetOrderForReview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)} />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10"
          >
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Beri Ulasan</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Produk: {targetOrderForReview.items[0].name}</p>
            
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
              className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold resize-none mb-8"
              placeholder="Ceritakan pengalaman belanja Anda..."
            />

            <div className="flex gap-4">
              <button onClick={() => setShowReviewModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Batal</button>
              <button 
                onClick={handleSaveReview}
                className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-200"
              >
                Kirim Ulasan
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Adding Product via Seller UI uses the same Product Editor Modal logic */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAddingProduct(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 overflow-auto max-h-[90vh]"
          >
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                <Edit className="w-6 h-6" />
              </div>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h3>

            <form
              onSubmit={handleSaveProduct}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Nama Produk
                  </label>
                  <input
                    required
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    placeholder="Contoh: Beras Raja Lele"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Harga (Rp)
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Stok
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Kategori
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {categories
                      .filter((c) => c !== "Semua")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Foto Produk
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center group relative">
                      {productForm.image ? (
                        <>
                          {productForm.image.toLowerCase().endsWith(".pdf") ? (
                            <FileText className="w-8 h-8 text-brand-blue" />
                          ) : (
                            <img
                              src={productForm.image}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({ ...productForm, image: "" })
                            }
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <Camera className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsLoading(true);
                            try {
                              const url = await handleFileUpload(
                                file,
                                "toko_products",
                              );
                              setProductForm((prev) => ({
                                ...prev,
                                image: url,
                              }));
                              showNotification(
                                "Foto produk berhasil diupload",
                                "success",
                              );
                            } catch (err) {
                              console.error("Upload error in component:", err);
                            } finally {
                              setIsLoading(false);
                              if (e.target) e.target.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                            fileInputRef.current.click();
                          }
                        }}
                        className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/30 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          "Mengupload..."
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Pilih Foto Produk
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold resize-none"
                    placeholder="Tuliskan spesifikasi produk..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200"
                  >
                    {isLoading
                      ? "Menyimpan..."
                      : editingProduct
                        ? "Simpan Perubahan"
                        : "Posting Produk"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
