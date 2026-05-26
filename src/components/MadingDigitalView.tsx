import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Calendar, Edit3, X, ChevronRight, User, 
  Clock, Info, LayoutGrid, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';

interface MadingItem {
  id: string;
  tenantId: string;
  slot: number;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
  updatedBy: string;
}

interface MadingDigitalViewProps {
  currentUser: any;
  userRole: string; // "ADMIN", "BENDAHARA", "KADER", "SATPAM", "WARGA", etc.
  currentTenant: any;
  showNotification: (msg: string, type?: string) => void;
  handleFirestoreError: (err: any, op: string, path: string) => void;
}

// Preset gallery of beautiful, high-quality community-themed images
const IMAGE_PRESETS = [
  {
    category: "Gotong Royong / Kerja Bakti",
    url: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
    description: "Kegiatan gotong royong membersihkan selokan, menanam pohon, atau merapikan lingkungan bersama."
  },
  {
    category: "Posyandu & Kesehatan",
    url: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
    description: "Pemeriksaan kesehatan bayi/balita secara rutin, penyuluhan gizi, dan imunisasi berkala."
  },
  {
    category: "Rapat & Musyawarah",
    url: "https://images.unsplash.com/photo-1543185377-b75371ac2858?auto=format&fit=crop&q=80&w=800",
    description: "Pertemuan pengurus RT/RW dan warga untuk mendiskusikan anggaran belanja kas atau rencana kegiatan sosial."
  },
  {
    category: "Keamanan Ronda Siskamling",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=800",
    description: "Tim siskamling memantau keamanan komplek saat malam hari untuk kenyamanan istirahat warga."
  },
  {
    category: "Senam Pagi & Olahraga",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800",
    description: "Kegiatan senam sehat rukun warga di minggu pagi guna menjaga stamina jasmani dan silaturahmi."
  },
  {
    category: "HUT RI & Festival",
    url: "https://images.unsplash.com/photo-1472653423608-ee24d5d9992a?auto=format&fit=crop&q=80&w=800",
    description: "Perayaan kemerdekaan, perlombaan warga, panggung gembira, atau festival bazar kuliner lokal."
  },
  {
    category: "Pendidikan & Anak-Anak",
    url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    description: "Bimbingan belajar lingkungan, pojok baca mandiri karang taruna, atau kegiatan pembinaan bakat anak."
  },
  {
    category: "Bank Sampah",
    url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800",
    description: "Aksi pemilahan sampah organik dan anorganik untuk ditabung secara produktif."
  }
];

export default function MadingDigitalView({
  currentUser,
  userRole,
  currentTenant,
  showNotification,
  handleFirestoreError
}: MadingDigitalViewProps) {
  const [madingItems, setMadingItems] = useState<Record<number, MadingItem>>({});
  const [loading, setLoading] = useState(true);
  
  // Modals / Selection States
  const [selectedItem, setSelectedItem] = useState<MadingItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  
  // Custom Edit Fields
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const tId = currentTenant?.id || '';
  const isPengurus = userRole !== 'WARGA';

  // Default fallback values for slots 1 - 5 to ensure a always-beautiful initial UI
  const getFallbackItem = (slot: number): MadingItem => {
    const fallbacks: Record<number, { title: string; description: string; date: string; url: string }> = {
      1: {
        title: "Kerja Bakti Peduli Saluran Air",
        description: "Kegiatan gotong royong warga rukun tetangga membersihkan saluran air utama demi kenyamanan, kebersihan, dan pencegahan genangan menyambut pergantian cuaca bulanan rutin.",
        date: "Mei 2026",
        url: IMAGE_PRESETS[0].url
      },
      2: {
        title: "Posyandu Timbang Balita Rutin",
        description: "Layanan rutin Posyandu untuk imunisasi, pemantauan kenaikan tinggi & berat badan balita, serta penyuluhan gizi bagi ibu hamil.",
        date: "Mei 2026",
        url: IMAGE_PRESETS[1].url
      },
      3: {
        title: "Musyawarah & Rapat Koordinasi",
        description: "Koordinasi berkala pengurus RT dan seluruh warga guna evaluasi pemasukan uang kas bulanan dan pemeliharaan CCTV komplek.",
        date: "April 2026",
        url: IMAGE_PRESETS[2].url
      },
      4: {
        title: "Ronda Malam Siaga Lingkungan",
        description: "Peningkatan siskamling malam untuk mengantisipasi potensi pencurian dan memastikan laporan log tamu yang menginap melampaui pelaporan 24 jam.",
        date: "Mei 2026",
        url: IMAGE_PRESETS[3].url
      },
      5: {
        title: "Senam Sehat Rukun Warga",
        description: "Klub senam sehat bersama di pagi hari untuk peningkatkan imunitas jasmaniah dan mempererat tali silaturahim seluruh lapisan warga rukun tetangga.",
        date: "Mei 2026",
        url: IMAGE_PRESETS[4].url
      }
    };

    const fb = fallbacks[slot];
    return {
      id: `fallback-${slot}`,
      tenantId: tId,
      slot,
      title: fb.title,
      description: fb.description,
      date: fb.date,
      imageUrl: fb.url,
      updatedAt: new Date().toISOString(),
      updatedBy: "System Default"
    };
  };

  // 1. Fetch data in real-time, filtered by tenantId
  useEffect(() => {
    if (!tId) return;

    setLoading(true);
    // New Firestore query includes a filter for current owner's tenantId (enforces security rules)
    const q = query(collection(db, "mading"), where("tenantId", "==", tId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsMap: Record<number, MadingItem> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data() as MadingItem;
        if (data && data.slot >= 1 && data.slot <= 5) {
          itemsMap[data.slot] = data;
        }
      });

      // Fill missing slots with fallbacks
      for (let s = 1; s <= 5; s++) {
        if (!itemsMap[s]) {
          itemsMap[s] = getFallbackItem(s);
        }
      }

      setMadingItems(itemsMap);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "mading");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tId]);

  // Open Edit Dialog
  const handleOpenEdit = (slot: number) => {
    const item = madingItems[slot] || getFallbackItem(slot);
    setEditingSlot(slot);
    setEditTitle(item.title);
    setEditDate(item.date);
    setEditDescription(item.description);
    setEditImageUrl(item.imageUrl);
    setIsEditOpen(true);
  };

  // Submit Edit to Firestore
  const handleSaveMadingSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !tId) return;

    if (!editTitle.trim() || !editDate.trim() || !editDescription.trim() || !editImageUrl.trim()) {
      showNotification("Semua field mading wajib diisi!", "error");
      return;
    }

    setSaveLoading(true);
    const docId = `${tId}_slot_${editingSlot}`;
    const payload: MadingItem = {
      id: docId,
      tenantId: tId,
      slot: editingSlot,
      title: editTitle,
      date: editDate,
      description: editDescription,
      imageUrl: editImageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || currentUser?.email || "Pengurus RT"
    };

    try {
      await setDoc(doc(db, "mading", docId), payload);
      showNotification(`Mading Slot ${editingSlot} berhasil diperbarui!`, "success");
      setIsEditOpen(false);
    } catch (err: any) {
      handleFirestoreError(err, "write", `mading/${docId}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Retrieve item of slot
  const item1 = madingItems[1] || getFallbackItem(1);
  const item2 = madingItems[2] || getFallbackItem(2);
  const item3 = madingItems[3] || getFallbackItem(3);
  const item4 = madingItems[4] || getFallbackItem(4);
  const item5 = madingItems[5] || getFallbackItem(5);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[300px]" id="loading-mading">
        <RefreshCw className="w-8 h-8 text-brand-blue animate-spin mb-3" />
        <p className="text-xs font-black uppercase text-slate-400 tracking-wider">Memuat Mading Digital...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl transition-all" id="mading-digital-container">
      {/* Header section with clean visual flow */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl flex items-center justify-center text-brand-blue shadow-inner border border-indigo-100 dark:border-brand-blue/10">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-elegant uppercase flex items-center gap-2">
                Mading Digital Warga
                <span className="text-[9px] bg-brand-blue text-white px-2.5 py-1 rounded-full font-sans font-bold tracking-widest uppercase align-middle">KOLASE FOTO</span>
              </h2>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.25em] mt-1">Informasi & Kegiatan Bulanan Pengurus RT/RW</p>
            </div>
          </div>
        </div>
        
        {isPengurus && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-950/50 flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Mode Pengurus Aktif
            </span>
          </div>
        )}
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-6 -mt-3">
        Berikut adalah mading dokumentasi kegiatan rutin bulanan lingkungan. Klik gambar pada kolase di bawah untuk memperbesar detail berita, melacak riwayat kegiatan, atau memperbarui konten khusus pengurus.
      </p>

      {/* Modern Bento Grid 5-photo collage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-auto lg:h-[500px]" id="mading-grid-layout">
        
        {/* Slot 1: BIG Column - Left (Span 7 col, full rows) */}
        <div className="md:col-span-12 lg:col-span-7 h-[300px] lg:h-full relative group overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-md bg-slate-100 dark:bg-slate-850">
          <img 
            src={item1.imageUrl} 
            alt={item1.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform origin-center animate-fade-in"
            referrerPolicy="no-referrer"
          />
          {/* Glass Overlay bottom banner */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 sm:p-8 text-white flex flex-col justify-end h-2/3">
            <span className="text-[9px] bg-brand-blue text-white w-fit px-3 py-1 rounded-full font-black tracking-widest uppercase mb-2 shadow-md">
              🎯 SLOT 1 • {item1.date}
            </span>
            <h3 className="text-lg sm:text-2xl font-black font-elegant tracking-tight leading-tight">{item1.title}</h3>
            <p className="text-xs text-slate-200/90 font-medium line-clamp-2 mt-2 leading-relaxed">{item1.description}</p>
            
            <div className="mt-4 flex items-center justify-between gap-4">
              <button 
                onClick={() => setSelectedItem(item1)}
                className="text-[10px] font-black uppercase tracking-widest bg-white/20 hover:bg-white text-white hover:text-indigo-950 px-4 py-2 rounded-xl transition-all border border-white/25 hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                title="Baca Berita Lengkap"
              >
                <span>Baca Selengkapnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              
              {isPengurus && (
                <button 
                  onClick={() => handleOpenEdit(1)}
                  className="p-2.5 bg-white/20 hover:bg-amber-500 text-white rounded-xl transition-all border border-white/20 active:scale-95 hover:scale-105 cursor-pointer"
                  title="Edit Slot 1"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side group containing the other 4 slots (Slot 2, 3, 4, 5) - Spread in 5 cols */}
        <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-5 h-full">
          
          {/* Slot 2 */}
          <div className="h-[220px] lg:h-full relative group overflow-hidden rounded-[1.75rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col bg-slate-100 dark:bg-slate-850">
            <img 
              src={item2.imageUrl} 
              alt={item2.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 SLOT 2 • {item2.date}
              </span>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">{item2.title}</h4>
              
              <div className="mt-2.5 flex items-center justify-between gap-2 opacity-90">
                <button 
                  onClick={() => setSelectedItem(item2)}
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-0.5 cursor-pointer"
                  title="Baca Selengkapnya"
                >
                  <span>Detail</span>
                  <ChevronRight className="w-3" />
                </button>
                {isPengurus && (
                  <button 
                    onClick={() => handleOpenEdit(2)}
                    className="p-1.5 bg-white/20 hover:bg-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Edit Slot 2"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Slot 3 */}
          <div className="h-[220px] lg:h-full relative group overflow-hidden rounded-[1.75rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col bg-slate-100 dark:bg-slate-850">
            <img 
              src={item3.imageUrl} 
              alt={item3.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 SLOT 3 • {item3.date}
              </span>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">{item3.title}</h4>
              
              <div className="mt-2.5 flex items-center justify-between gap-2 opacity-90">
                <button 
                  onClick={() => setSelectedItem(item3)}
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Detail</span>
                  <ChevronRight className="w-3" />
                </button>
                {isPengurus && (
                  <button 
                    onClick={() => handleOpenEdit(3)}
                    className="p-1.5 bg-white/20 hover:bg-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Slot 4 */}
          <div className="h-[220px] lg:h-full relative group overflow-hidden rounded-[1.75rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col bg-slate-100 dark:bg-slate-850">
            <img 
              src={item4.imageUrl} 
              alt={item4.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 SLOT 4 • {item4.date}
              </span>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">{item4.title}</h4>
              
              <div className="mt-2.5 flex items-center justify-between gap-2 opacity-90">
                <button 
                  onClick={() => setSelectedItem(item4)}
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Detail</span>
                  <ChevronRight className="w-3" />
                </button>
                {isPengurus && (
                  <button 
                    onClick={() => handleOpenEdit(4)}
                    className="p-1.5 bg-white/20 hover:bg-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Slot 5 */}
          <div className="h-[220px] lg:h-full relative group overflow-hidden rounded-[1.75rem] border border-slate-100 dark:border-slate-800/80 shadow-sm flex flex-col bg-slate-100 dark:bg-slate-850">
            <img 
              src={item5.imageUrl} 
              alt={item5.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 SLOT 5 • {item5.date}
              </span>
              <h4 className="text-xs font-bold leading-snug line-clamp-2">{item5.title}</h4>
              
              <div className="mt-2.5 flex items-center justify-between gap-2 opacity-90">
                <button 
                  onClick={() => setSelectedItem(item5)}
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-200 hover:text-white flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Detail</span>
                  <ChevronRight className="w-3" />
                </button>
                {isPengurus && (
                  <button 
                    onClick={() => handleOpenEdit(5)}
                    className="p-1.5 bg-white/20 hover:bg-amber-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- DETAIL MODAL SHOWCASE --- */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="mading-detail-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col relative"
            >
              {/* Image top header */}
              <div className="h-64 sm:h-80 relative">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-5 right-5 p-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full transition-colors backdrop-blur-md"
                  id="close-detail-modal-btn"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 to-transparent p-6 flex items-end">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-black uppercase tracking-wider bg-brand-blue/90 text-white px-2.5 py-1 rounded-full w-fit">
                      Slot {selectedItem.slot}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight font-elegant">{selectedItem.title}</h3>
                  </div>
                </div>
              </div>

              {/* Contents & Metadata */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-4 border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-blue" />
                    <span>Periode: <b className="text-slate-700 dark:text-slate-300">{selectedItem.date}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-500" />
                    <span>Oleh: <b className="text-slate-700 dark:text-slate-300">{selectedItem.updatedBy}</b></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Update: <b className="text-slate-700 dark:text-slate-300">{new Date(selectedItem.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</b></span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black uppercase text-xs tracking-wider transition-colors hover:bg-slate-200 hover:dark:bg-slate-700"
                  >
                    Tutup Detail
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ADMIN EDIT MODAL --- */}
      <AnimatePresence>
        {isEditOpen && editingSlot && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto" id="mading-edit-modal">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Header title */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight font-elegant uppercase flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-brand-blue" />
                    Edit Mading Slot {editingSlot}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Edit konten mading digital bulanan rukun warga</p>
                </div>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form elements */}
              <form onSubmit={handleSaveMadingSlot} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Image Preview Window */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Preview Foto Terpilih</label>
                  <div className="h-44 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center group/review">
                    {editImageUrl ? (
                      <img 
                        src={editImageUrl} 
                        alt="Preview mading" 
                        className="w-full h-full object-cover" 
                        onError={() => showNotification("Format URL foto salah atau tidak bisa dimuat!", "error")}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="w-10 h-10 mx-auto opacity-50 mb-2 animate-bounce" />
                        <span className="text-xs font-bold uppercase tracking-wider">Silakan pilih preset atau masukkan URL foto</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preset Selector Grid */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Galeri Foto Preset Kegiatan Lingkungan (Klik untuk Pakai)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {IMAGE_PRESETS.map((p, idx) => {
                      const isSelected = editImageUrl === p.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEditImageUrl(p.url);
                            // Autofill description suggestion based on preset theme if empty
                            if (!editDescription.trim()) {
                              setEditDescription(p.description);
                            }
                          }}
                          className={`group/preset p-1 rounded-xl border text-left transition-all relative overflow-hidden h-16 ${
                            isSelected 
                              ? "border-brand-blue ring-2 ring-brand-blue/20 bg-brand-blue/5" 
                              : "border-slate-100 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40"
                          }`}
                        >
                          <img 
                            src={p.url} 
                            alt={p.category} 
                            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/preset:opacity-40 transition-opacity"
                            referrerPolicy="no-referrer"
                          />
                          <div className="relative z-10 w-full h-full flex flex-col justify-end p-2">
                            <span className="text-[8px] font-black uppercase text-slate-800 dark:text-slate-200 line-clamp-1 flex items-center gap-1 leading-none">
                              {isSelected && <Check className="w-2.5 h-2.5 text-brand-blue shrink-0" />}
                              {p.category.split(' ')[0]}
                            </span>
                            <span className="text-[6px] font-semibold text-slate-400 block truncate mt-0.5">{p.category}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Title Input */}
                  <div className="space-y-1.5Col">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Judul Kegiatan / Berita</label>
                    <input 
                      type="text" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Cth: Kerja Bakti Akbar 17-an"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-bold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-blue dark:focus:border-brand-blue focus:bg-white text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1.5Col">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest block">Bulan / Periode Kegiatan</label>
                    <input 
                      type="text" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      placeholder="Cth: Mei 2026 atau 15 Mei 2026"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-bold placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-blue dark:focus:border-brand-blue focus:bg-white text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                {/* Custom Photo URL Input */}
                <div className="space-y-1.5Col">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">ATAU Input Custom URL Web Foto (https://...)</label>
                  <input 
                    type="url" 
                    value={editImageUrl}
                    onChange={(e) => setEditImageUrl(e.target.value)}
                    placeholder="Masukkan url gambar dari hosting luar (Google Drive, ImgBB, Unsplash, dll)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                {/* Description Input */}
                <div className="space-y-1.5Col">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Deskripsi Kegiatan Lengkap</label>
                  <textarea 
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Berikan rangkuman deskripsi kegiatan apa yang dikerjakan, siapa saja warga yang ikut, dan himbauan/informasi yang relevan untuk dibaca seluruh warga di dashboard..."
                    rows={4}
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-blue dark:focus:border-brand-blue focus:bg-white text-slate-800 dark:text-slate-100"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-250 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={saveLoading}
                    className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold text-xs uppercase hover:bg-indigo-700 hover:shadow-lg hover:shadow-brand-blue/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {saveLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
