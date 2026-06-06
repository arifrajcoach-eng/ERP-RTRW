import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Calendar, Edit3, X, ChevronRight, User, 
  Clock, Info, LayoutGrid, Check, RefreshCw, Upload, Camera
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
  year?: number;
  month?: number;
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
  const [allMadingDocs, setAllMadingDocs] = useState<MadingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Default to current year and month (May 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(5);
  
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
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);

  // Live Camera API States
  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCameraActive(false);
  };

  // Start direct web camera stream
  const startLiveCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showNotification("Browser atau perangkat Anda tidak mendukung akses kamera secara langsung!", "error");
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: "environment" }, // prefer rear camera on HP/tablet
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      streamRef.current = stream;
      setIsLiveCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
      showNotification("Kamera langsung aktif! Arahkan ke objek lalu klik jepret.", "success");
    } catch (err: any) {
      console.error("Camera capture error:", err);
      showNotification("Gagal membuka kamera. Harap berikan izin akses kamera pada browser.", "error");
    }
  };

  // Capture current frame as compressed base64
  const captureLivePhoto = async () => {
    if (!videoRef.current || !streamRef.current) {
      showNotification("Kamera tidak aktif!", "error");
      return;
    }

    try {
      setIsUploadingLocal(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 800;
      canvas.height = video.videoHeight || 600;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawBase64 = canvas.toDataURL('image/jpeg', 0.85);
        const optimizedBase64 = await compressImage(rawBase64, 1000, 1000);
        setEditImageUrl(optimizedBase64);
        showNotification("Foto berhasil dijepret & tersimpan di preview!", "success");
      }
    } catch (err) {
      console.error("Capture photo error:", err);
      showNotification("Gagal memproses jepretan foto!", "error");
    } finally {
      setIsUploadingLocal(false);
      stopLiveCamera();
    }
  };

  const handleCloseEdit = () => {
    stopLiveCamera();
    setIsEditOpen(false);
  };

  const tId = currentTenant?.id || '';
  const isPengurus = userRole !== 'WARGA';

  // Default fallback values for slots 1 - 5 to ensure a always-beautiful initial UI
  const getFallbackItem = (slot: number, yr?: number, mo?: number): MadingItem => {
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
    let dateStr = fb.date;
    if (yr && mo) {
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      dateStr = `${monthNames[mo - 1]} ${yr}`;
    }

    return {
      id: `fallback-${slot}-${yr || 2026}-${mo || 5}`,
      tenantId: tId,
      slot,
      title: fb.title,
      description: fb.description,
      date: dateStr,
      imageUrl: fb.url,
      updatedAt: new Date().toISOString(),
      updatedBy: "System Default"
    };
  };

  // 1. Fetch data in real-time, filtered by tenantId (compliant with tenant security rules)
  useEffect(() => {
    if (!tId) return;

    setLoading(true);
    const q = query(collection(db, "mading"), where("tenantId", "==", tId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList: MadingItem[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as MadingItem;
        if (data) {
          itemsList.push({ ...data, id: doc.id });
        }
      });

      setAllMadingDocs(itemsList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list", "mading");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tId]);

  // Compute madingItems in-memory based on selectedYear and selectedMonth
  const madingItems = React.useMemo(() => {
    const itemsMap: Record<number, MadingItem> = {};
    
    // First, find exact fits for the chosen month and year
    allMadingDocs.forEach((item) => {
      const itemYear = item.year || (item.date && item.date.includes("2026") ? 2026 : undefined);
      // Try parsing month from item.date or its stored properties
      const itemMonth = item.month || (item.date && item.date.toLowerCase().includes("mei") ? 5 : undefined);
      
      const isExactMatch = itemYear === selectedYear && itemMonth === selectedMonth;
      const isLegacyMatch = !item.year && selectedYear === 2026 && selectedMonth === 5 && item.id === `${tId}_slot_${item.slot}`;

      if ((isExactMatch || isLegacyMatch) && item.slot >= 1 && item.slot <= 5) {
        const existing = itemsMap[item.slot];
        if (!existing) {
          itemsMap[item.slot] = item;
        } else {
          // If we already have an existing item for this slot, we need to compare priorities or recency
          const existingIsExact = (existing.year === selectedYear && existing.month === selectedMonth) ||
                                 (existing.year === undefined && existing.date && existing.date.includes("2026") && selectedYear === 2026 && existing.date.toLowerCase().includes("mei") && selectedMonth === 5);
          
          if (isExactMatch && !existingIsExact) {
            // Exact match trumps legacy match
            itemsMap[item.slot] = item;
          } else if ((isExactMatch && existingIsExact) || (isLegacyMatch && !existingIsExact)) {
            // If both are exact matches, or both are legacy matches, pick the newest one based on updatedAt
            const existingTime = new Date(existing.updatedAt || 0).getTime();
            const newTime = new Date(item.updatedAt || 0).getTime();
            if (newTime > existingTime) {
              itemsMap[item.slot] = item;
            }
          }
        }
      }
    });

    // Populate missing slots using fallbacks or generic entries
    for (let s = 1; s <= 5; s++) {
      if (!itemsMap[s]) {
        const legacyDoc = allMadingDocs.find(
          item => item.slot === s && (item.id === `${tId}_slot_${s}` || !item.year)
        );
        if (legacyDoc && selectedYear === 2026 && selectedMonth === 5) {
          itemsMap[s] = legacyDoc;
        } else {
          itemsMap[s] = getFallbackItem(s, selectedYear, selectedMonth);
        }
      }
    }

    return itemsMap;
  }, [allMadingDocs, selectedYear, selectedMonth, tId]);

  // Compress image helper using HTML Canvas
  const compressImage = (base64Str: string, maxWidth = 1000, maxHeight = 1000): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress with JPEG format & 0.7 quality to be lightweight (approx. 50KB to 120KB)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      showNotification("Ukuran foto terlalu besar (maksimal 15MB)!", "error");
      return;
    }

    setIsUploadingLocal(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const originalBase64 = event.target?.result as string;
      if (!originalBase64) {
        showNotification("Gagal membaca file foto!", "error");
        setIsUploadingLocal(false);
        return;
      }

      try {
        const compressedBase64 = await compressImage(originalBase64, 1000, 1000);
        setEditImageUrl(compressedBase64);
        showNotification("Foto berhasil diunggah langsung & dioptimalkan otomatis!", "success");
      } catch (err) {
        console.error("Error compressing image:", err);
        showNotification("Gagal memproses & kompresi foto!", "error");
      } finally {
        setIsUploadingLocal(false);
      }
    };

    reader.onerror = () => {
      showNotification("Terjadi kesalahan membaca file gambar!", "error");
      setIsUploadingLocal(false);
    };

    reader.readAsDataURL(file);
  };

  // Open Edit Dialog
  const handleOpenEdit = (slot: number) => {
    const item = madingItems[slot] || getFallbackItem(slot, selectedYear, selectedMonth);
    setEditingSlot(slot);
    setEditTitle(item.title);
    setEditDate(item.date);
    setEditDescription(item.description);
    setEditImageUrl(item.imageUrl);
    setIsEditOpen(true);
  };

  // Submit Edit to Firestore with year and month tags
  const handleSaveMadingSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !tId) return;

    if (!editTitle.trim() || !editDate.trim() || !editDescription.trim() || !editImageUrl.trim()) {
      showNotification("Semua field mading wajib diisi!", "error");
      return;
    }

    setSaveLoading(true);
    // Include selected year and month in doc ID to allow multi-month and multi-year archiving
    const docId = `${tId}_${selectedYear}_${selectedMonth}_slot_${editingSlot}`;
    const payload: MadingItem & { year: number; month: number } = {
      id: docId,
      tenantId: tId,
      slot: editingSlot,
      title: editTitle,
      date: editDate,
      description: editDescription,
      imageUrl: editImageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.name || currentUser?.email || "Pengurus RT",
      year: selectedYear,
      month: selectedMonth
    };

    try {
      await setDoc(doc(db, "mading", docId), payload);
      showNotification(`Mading Foto ${editingSlot} untuk ${editDate} berhasil diperbarui!`, "success");
      handleCloseEdit();
    } catch (err: any) {
      handleFirestoreError(err, "write", `mading/${docId}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Retrieve item of slot
  const item1 = madingItems[1] || getFallbackItem(1, selectedYear, selectedMonth);
  const item2 = madingItems[2] || getFallbackItem(2, selectedYear, selectedMonth);
  const item3 = madingItems[3] || getFallbackItem(3, selectedYear, selectedMonth);
  const item4 = madingItems[4] || getFallbackItem(4, selectedYear, selectedMonth);
  const item5 = madingItems[5] || getFallbackItem(5, selectedYear, selectedMonth);

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



      {/* --- MONTH & YEAR ARCHIVE SELECTORS --- */}
      <div className="mb-6 p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 rounded-[1.5rem] border border-slate-100 dark:border-slate-800/80 shadow-inner flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5" id="mading-archive-filter-bar">
        {/* Year Select Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-brand-blue border border-indigo-150 dark:border-brand-blue/10">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">ARSIP TAHUN</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-blue/45 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-100 pr-8 pl-3 py-1.5 outline-none focus:ring-4 ring-brand-blue/5 shadow-sm transition-all appearance-none cursor-pointer"
              style={{ backgroundPosition: "right 0.5rem center" }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 12 Months selection layout */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 md:pl-4 md:border-l border-slate-200 dark:border-slate-800">
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2 shrink-0">PILIH BULAN:</span>
          <div className="flex items-center gap-1.5 min-w-max py-0.5">
            {[
              { val: 1, label: "Jan" },
              { val: 2, label: "Feb" },
              { val: 3, label: "Mar" },
              { val: 4, label: "Apr" },
              { val: 5, label: "Mei" },
              { val: 6, label: "Jun" },
              { val: 7, label: "Jul" },
              { val: 8, label: "Ags" },
              { val: 9, label: "Sep" },
              { val: 10, label: "Okt" },
              { val: 11, label: "Nov" },
              { val: 12, label: "Des" }
            ].map((m) => {
              const isActive = selectedMonth === m.val;
              return (
                <button
                  key={m.val}
                  type="button"
                  onClick={() => setSelectedMonth(m.val)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white shadow-md shadow-brand-blue/25 scale-102"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200/50 dark:border-slate-700/60"
                  }`}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Bento Grid 5-photo collage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-auto lg:h-[500px]" id="mading-grid-layout">
        
        {/* Slot 1: BIG Column - Left (Span 7 col, full rows) */}
        <div className="md:col-span-12 lg:col-span-7 h-[300px] lg:h-full relative group overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800/80 shadow-md bg-slate-100 dark:bg-slate-850">
          <img 
            key={`${item1.id}-${item1.updatedAt}`}
            src={item1.imageUrl} 
            alt={item1.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform origin-center animate-fade-in"
            referrerPolicy="no-referrer"
          />
          {/* Glass Overlay bottom banner */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-6 sm:p-8 text-white flex flex-col justify-end h-2/3">
            <span className="text-[9px] bg-brand-blue text-white w-fit px-3 py-1 rounded-full font-black tracking-widest uppercase mb-2 shadow-md">
              🎯 FOTO 1 • {item1.date}
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
                  title="Edit Foto 1"
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
              key={`${item2.id}-${item2.updatedAt}`}
              src={item2.imageUrl} 
              alt={item2.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 FOTO 2 • {item2.date}
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
                    title="Edit Foto 2"
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
              key={`${item3.id}-${item3.updatedAt}`}
              src={item3.imageUrl} 
              alt={item3.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 FOTO 3 • {item3.date}
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
              key={`${item4.id}-${item4.updatedAt}`}
              src={item4.imageUrl} 
              alt={item4.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 FOTO 4 • {item4.date}
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
              key={`${item5.id}-${item5.updatedAt}`}
              src={item5.imageUrl} 
              alt={item5.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 duration-700 transition-transform"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 text-white flex flex-col justify-end h-3/4">
              <span className="text-[8px] bg-purple-600 text-white w-fit px-2 py-0.5 rounded-full font-black tracking-wider uppercase mb-1">
                📌 FOTO 5 • {item5.date}
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
                      Foto {selectedItem.slot}
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
              style={{ height: "616.631px", marginBottom: "-64px" }}
            >
              {/* Header title */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight font-elegant uppercase flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-brand-blue" />
                    Edit Mading Foto {editingSlot}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Edit konten mading digital bulanan rukun warga</p>
                </div>
                <button 
                  onClick={handleCloseEdit}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form elements */}
              <form onSubmit={handleSaveMadingSlot} className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Image Preview Window */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Preview Foto Terpilih</label>
                    <span className="text-[9px] font-black text-brand-blue dark:text-teal-400 uppercase tracking-wider">Mendukung Kamera HP/Tablet</span>
                  </div>
                  <div className="h-64 sm:h-80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden relative bg-black flex items-center justify-center group/review shadow-inner">
                    {isLiveCameraActive ? (
                      <div className="w-full h-full relative bg-black flex items-center justify-center">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-contain select-none bg-black"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-[8px] font-black text-white rounded-md tracking-wider animate-pulse uppercase">
                          ● KAMERA LIVE HP/TABLET AKTIF
                        </div>
                        <button
                          type="button"
                          onClick={stopLiveCamera}
                          className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-slate-905 text-white rounded-full transition-colors cursor-pointer"
                          title="Matikan Kamera"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : editImageUrl ? (
                      <img 
                        src={editImageUrl} 
                        alt="Preview mading" 
                        className="w-full h-full object-contain bg-black" 
                        onError={() => showNotification("Format URL foto salah atau tidak bisa dimuat!", "error")}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="text-center text-slate-400 p-4">
                        <ImageIcon className="w-10 h-10 mx-auto opacity-50 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider block">Silakan ambil kamera, unggah foto, atau pilih preset</span>
                      </div>
                    )}
                    {isUploadingLocal && (
                      <div className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-blue mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Membaca & Mengompresi Foto...</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Device/Tablet File Upload & Camera triggers */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="file"
                      id="mading-device-upload-input"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        stopLiveCamera();
                        const fileInput = document.getElementById('mading-device-upload-input') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.removeAttribute('capture');
                          fileInput.click();
                        }
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-brand-blue/10 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Pilih Foto dari HP / Tablet / PC</span>
                    </button>
                    
                    {isLiveCameraActive ? (
                      <button
                        type="button"
                        onClick={captureLivePhoto}
                        className="py-3 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-red-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Jepret Foto Sekarang (Snapshot)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startLiveCamera}
                        className="py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider shadow-md shadow-emerald-600/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ambil Kamera Langsung</span>
                      </button>
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
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">ATAU Input Custom URL Web / Lokasi Foto</label>
                  <input 
                    type="text" 
                    value={editImageUrl.startsWith('data:') ? 'Foto Terpilih dari Perangkat Anda (Format Base64 Terkompresi)' : editImageUrl}
                    onChange={(e) => {
                      if (!editImageUrl.startsWith('data:')) {
                        setEditImageUrl(e.target.value);
                      } else {
                        // If they modify the indicator string, clear it to allow pasting
                        setEditImageUrl(e.target.value === 'Foto Terpilih dari Perangkat Anda (Format Base64 Terkompresi)' ? editImageUrl : e.target.value);
                      }
                    }}
                    placeholder="Masukkan url gambar dari hosting luar (Google Drive, ImgBB, Unsplash, dll)"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-brand-blue focus:bg-white text-slate-800 dark:text-slate-100"
                  />
                  {editImageUrl.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => setEditImageUrl('')}
                      className="text-[9px] font-black uppercase text-rose-500 tracking-wider hover:underline"
                    >
                      Hapus Foto Unggahan
                    </button>
                  )}
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
                    onClick={handleCloseEdit}
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
