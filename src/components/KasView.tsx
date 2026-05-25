import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Search,
  PlusCircle,
  Download,
  Upload,
  Printer,
  Edit,
  Trash2,
  Eye,
  Info,
  CheckCircle2,
  X,
  Image,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  TrendingUp,
  FileText,
  Sparkles,
  Loader2,
  Camera,
  MapPin,
} from "lucide-react";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import { ConfirmModal } from "./ui/ConfirmModal";
import { scanReceiptAI } from "../services/aiService";

interface KasViewProps {
  kasData: any[];
  setKasData: React.Dispatch<React.SetStateAction<any[]>>;
  iuranData: any[];
  setIuranData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData?: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  rtId?: string;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  handleFileUpload: (file: File, path: string) => Promise<string>;
  showNotification: (
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
  plan?: string;
}

export function KasView({
  kasData,
  setKasData,
  iuranData,
  setIuranData,
  wargaData = [],
  userRole,
  currentUser,
  getSetting,
  rtId,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  handleFileUpload,
  showNotification,
  plan,
}: KasViewProps) {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [strukUrl, setStrukUrl] = useState("");
  const [trxType, setTrxType] = useState<"Masuk" | "Keluar">("Masuk");
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Default values for scanned data
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    if (!showMasukForm) {
      setStrukUrl("");
      setScannedData(null);
    }
  }, [showMasukForm]);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const [years] = useState([2024, 2025, 2026, 2027]);
  const [kasToDelete, setKasToDelete] = useState<any>(null);
  const [editingKas, setEditingKas] = useState<any>(null);
  const [viewingKas, setViewingKas] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);
  const [isSavingKas, setIsSavingKas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check Plan Limit (STARTER/TRIAL gets 3 scans per month)
    const normalizedPlan = (plan || 'STARTER').toUpperCase();
    if (normalizedPlan.includes('TRIAL') || normalizedPlan.includes('STARTER')) {
      // Simple check: count how many transactions have 'AI Scan' in description or similar
      // Or just track it in local state for the session if we don't want to persist count yet
      // For a better UX, I'll just check kasData for this month
      const currentMonth = new Date().toLocaleString('id-ID', { month: 'short', year: 'numeric' });
      const aiScansThisMonth = kasData.filter(k => k.tanggal.includes(currentMonth) && (k.keterangan || '').includes('[AI Scan]')).length;
      
      if (aiScansThisMonth >= 3) {
        showNotification("Kuota AI Scan Paket Gratis habis (Maks 3/bln). Silakan Upgrade!", "error");
        return;
      }
    }

    console.log("File detected:", file.name, file.type, file.size);

    setIsScanning(true);
    showNotification("AI sedang memindai struk...", "info");

    try {
      // 1. Upload to Firebase first to get URL (and for storage)
      const url = await handleFileUpload(file, "kas_struk_ai");
      setStrukUrl(url);

      // 2. Convert to base64 for Gemini
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;

      // 3. Call Gemini via aiService
      const result = await scanReceiptAI(base64Data, file.type);

      // Add a tag to track AI Scans for limit enforcement
      result.keterangan = result.keterangan ? `${result.keterangan} [AI Scan]` : "[AI Scan]";
      setScannedData(result);
      setTrxType(result.tipe === "Masuk" ? "Masuk" : "Keluar");

      // Open form if not already
      setShowMasukForm(true);
      showNotification("Selesai! Periksa hasil pindaian AI.", "success");
    } catch (error) {
      console.error("Scanning Error details:", error);
      showNotification(`Gagal memindai struk dengan AI: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`, "error");
    } finally {
      setIsScanning(false);
      if (scanInputRef.current) scanInputRef.current.value = "";
    }
  };

  const handleImportFileKas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processImportedKasData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedKasData(results.data);
        },
        error: (error) => {
          console.error("CSV Import Error (Kas):", error);
          showNotification(
            "Gagal mengimpor data kas. Pastikan format CSV benar.",
            "error",
          );
        },
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedKasData = async (data: any[]) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newData = data.map((row: any, idx: number) => {
      const debit = parseInt(
        row["Debit"] || row["debit"] || row["Masuk"] || row["masuk"] || "0",
      );
      const kredit = parseInt(
        row["Kredit"] || row["kredit"] || row["Keluar"] || row["keluar"] || "0",
      );
      const tipe = debit > 0 ? "Masuk" : "Keluar";

      return {
        tenantId: tenantId,
        id: row["ID Transaksi"] || row["id"] || `TRX-IMP-${Date.now()}-${idx}`,
        tanggal: row["Tanggal"] || row["tanggal"] || formattedDate,
        tipe: row["Tipe"] || row["tipe"] || tipe,
        transaksi:
          row["Transaksi"] ||
          row["transaksi"] ||
          (debit > 0 ? "Pemasukan Lainnya" : "Pengeluaran Lainnya"),
        nama: row["Nama"] || row["nama"] || "Umum",
        keterangan: row["Keterangan"] || row["keterangan"] || "Import Data",
        debit: debit,
        kredit: kredit,
        strukUrl: "",
      };
    });

    if (newData.length > 0) {
      setIsLoadingDB(true);
      try {
        for (const item of newData) {
          await setDoc(doc(db, "kas", item.id), item);
        }
        setKasData((prev: any) => [...newData, ...prev]);
        showNotification(
          `Berhasil mengimpor ${newData.length} data transaksi kas.`,
          "success",
        );
      } catch (error: any) {
        console.error("Firebase Import Error (Kas):", error);
        handleFirestoreError(error, "create", "/kas/import");
        showNotification("Gagal sinkronisasi data kas ke Firebase.", "error");
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      showNotification(
        "Tidak ada data transaksi valid yang ditemukan.",
        "info",
      );
    }
  };

  const exportSingleTrxPDF = (trx: any) => {
    const doc = new jsPDF();
    const settings = getSetting("KOP_SURAT") || {};

    // Header
    doc.setFontSize(16);
    doc.text(settings.nama_organisasi || "SmartRW AI", 105, 20, {
      align: "center",
    });
    doc.setFontSize(10);
    doc.text(settings.alamat || "Laporan Transaksi", 105, 26, {
      align: "center",
    });
    doc.line(20, 32, 190, 32);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI TRANSAKSI", 105, 45, { align: "center" });

    // Data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const startY = 60;
    const lineH = 8;

    const data = [
      ["ID Transaksi", trx.id],
      ["Tanggal", trx.tanggal],
      ["Tipe", trx.tipe],
      ["Kategori", trx.transaksi],
      ["Nama", trx.nama],
      ["Keterangan", trx.keterangan],
      ["Nominal", formatRupiah(trx.debit || trx.kredit)],
    ];

    data.forEach((row, i) => {
      doc.text(row[0], 30, startY + i * lineH);
      doc.text(": " + row[1], 70, startY + i * lineH);
    });

    doc.line(
      20,
      startY + data.length * lineH + 5,
      190,
      startY + data.length * lineH + 5,
    );

    // Footer
    const footerY = 150;
    doc.text(
      "Dicetak pada: " + new Date().toLocaleString("id-ID"),
      20,
      footerY,
    );
    doc.text("Bendahara,", 150, footerY);
    doc.text("( ____________________ )", 150, footerY + 30);

    doc.save(`Bukti_${trx.id}.pdf`);
    showNotification("PDF Berhasil diunduh");
  };

  const handleDeleteKas = async () => {
    if (!kasToDelete) return;

    setIsDeletingKas(true);
    try {
      await deleteDoc(doc(db, "kas", kasToDelete.id));

      // Sync delete with Iuran if linked
      if (kasToDelete.iuranId) {
        await deleteDoc(doc(db, "iuran", kasToDelete.iuranId));
        setIuranData((prev: any[]) =>
          prev.filter((i) => i.id !== kasToDelete.iuranId),
        );
      }

      setKasData((prev: any[]) => prev.filter((t) => t.id !== kasToDelete.id));
      setKasToDelete(null);
      showNotification("Catatan kas berhasil dihapus.", "success");
    } catch (error: any) {
      handleFirestoreError(error, "delete", `/kas/${kasToDelete.id}`);
      showNotification("Gagal menghapus catatan kas.", "error");
      setKasToDelete(null);
    } finally {
      setIsDeletingKas(false);
    }
  };

  const handleSaveKas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingKas) return;
    setIsSavingKas(true);
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get("tanggal") as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newId = editingKas ? editingKas.id : `TRX-${Date.now()}`;
    let nominal = parseInt(
      (formData.get("nominal") as string).replace(/\D/g, "") || "0",
    );

    const transaksi = formData.get("transaksi") as string;
    const nama = formData.get("nama") as string;
    const keterangan = formData.get("keterangan") as string;

    const newTrx = {
      tenantId: tenantId,
      rt: currentUser?.rt || "01",
      id: newId,
      tanggal: editingKas ? editingKas.tanggal : formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: nama,
      alamat: (formData.get("alamat") as string) || "-",
      keterangan: keterangan,
      debit: trxType === "Masuk" ? nominal : 0,
      kredit: trxType === "Keluar" ? nominal : 0,
      strukUrl: strukUrl,
    };

    setIsLoadingDB(true);
    try {
      if (editingKas) {
        await updateDoc(doc(db, "kas", editingKas.id), newTrx);
        setKasData((prev: any[]) =>
          prev.map((t) => (t.id === editingKas.id ? newTrx : t)),
        );
        showNotification("Transaksi kas berhasil diperbarui", "success");
      } else {
        await setDoc(doc(db, "kas", newId), newTrx);
        setKasData((prev: any[]) => {
          if (prev.some(t => t.id === newId)) {
            return prev.map(t => t.id === newId ? newTrx : t);
          }
          return [newTrx, ...prev];
        });
        showNotification("Transaksi kas berhasil ditambahkan", "success");
      }
      setShowMasukForm(false);
      setEditingKas(null);
    } catch (error: any) {
      handleFirestoreError(
        error,
        editingKas ? "update" : "create",
        `/kas/${newId}`,
      );
      showNotification("Gagal menyimpan transaksi kas", "error");
    } finally {
      setIsLoadingDB(false);
      setIsSavingKas(false);
    }
  };

  const currentMonthTransactions = kasData.filter((t) => {
    const matchesYear = t.tanggal.includes(selectedYear);
    const monthStr = months[selectedMonth].substring(0, 3);
    const matchesMonth = t.tanggal.includes(monthStr);

    if (!matchesYear || !matchesMonth) return false;

    if (searchQuery.trim() === "") return true;

    const query = searchQuery.toLowerCase();
    return (
      t.transaksi?.toLowerCase().includes(query) ||
      t.nama?.toLowerCase().includes(query) ||
      t.keterangan?.toLowerCase().includes(query)
    );
  });

  const totalMasuk = currentMonthTransactions.reduce(
    (acc, t) => acc + (t.debit || 0),
    0,
  );
  const totalKeluar = currentMonthTransactions.reduce(
    (acc, t) => acc + (t.kredit || 0),
    0,
  );
  const saldo = totalMasuk - totalKeluar;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Ringkasan Kas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden relative group transition-all duration-300"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700"></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Pemasukan Bulan Ini
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-emerald-600/50 italic select-none">Rp</span>
              <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter font-elegant">
                {new Intl.NumberFormat('id-ID').format(totalMasuk)}
              </h3>
            </div>
            <div className="mt-8 flex items-center gap-2.5 text-[10px] font-black text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10 w-fit px-4 py-2.5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 uppercase tracking-widest shadow-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Total Dana Masuk</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none overflow-hidden relative group transition-all duration-300"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-all duration-700"></div>
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              Pengeluaran Bulan Ini
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-rose-600/50 italic select-none">Rp</span>
              <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter font-elegant">
                {new Intl.NumberFormat('id-ID').format(totalKeluar)}
              </h3>
            </div>
            <div className="mt-8 flex items-center gap-2.5 text-[10px] font-black text-rose-600 bg-rose-50/50 dark:bg-rose-500/10 w-fit px-4 py-2.5 rounded-2xl border border-rose-100/50 dark:border-rose-500/20 uppercase tracking-widest shadow-sm">
              <TrendingDown className="w-4 h-4" />
              <span>Biaya & Operasional</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-brand-blue via-indigo-600 to-indigo-900 p-8 rounded-3xl shadow-2xl shadow-brand-blue/30 overflow-hidden relative group transition-all duration-300 text-white border-2 border-white/10"
        >
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div className="flex flex-col relative z-10">
            <span className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
              Saldo Kas Berjalan
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-blue-200 italic select-none">Rp</span>
              <h3 className="text-4xl font-black tracking-tighter font-elegant drop-shadow-xl">
                {new Intl.NumberFormat('id-ID').format(saldo)}
              </h3>
            </div>
            <div className="mt-8 flex items-center gap-3 text-[11px] font-black text-brand-blue bg-white shadow-xl shadow-blue-900/30 w-fit px-5 py-3 rounded-2xl uppercase tracking-widest transition-transform group-hover:translate-x-1">
              <Wallet className="w-4 h-4" />
              <span>{months[selectedMonth].toUpperCase()} {selectedYear}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabel Kas */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/30 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-all">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 
              className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 tracking-tighter uppercase italic font-elegant"
              style={{ width: '238.68099999999998px' }}
            >
              <div className="w-2 h-8 bg-brand-blue rounded-full shadow-lg shadow-brand-blue/40"></div>
              Log Transaksi <span className="text-brand-blue font-black tracking-tighter" style={{ fontSize: '22px', height: '57.0069px' }}>Buku Kas</span>
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5 ml-6 leading-relaxed">Pencatatan alur keuangan digital secara sistematis</p>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            <div className="relative flex-1 xl:flex-none group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 w-full xl:w-64 transition-all shadow-sm placeholder:text-slate-300 dark:text-slate-200"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 lg:flex-none bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 shadow-sm transition-all appearance-none cursor-pointer"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex-1 lg:flex-none bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 shadow-sm transition-all appearance-none cursor-pointer"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <input type="file" ref={scanInputRef} className="hidden" accept="image/*,application/pdf" capture="environment" onChange={handleScanReceipt} />
              <button
                onClick={() => scanInputRef.current?.click()}
                disabled={isScanning}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 shadow-sm group disabled:opacity-50"
              >
                {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-brand-blue/10 transition-colors"><Camera className="w-3.5 h-3.5 text-brand-blue" /></div>}
                {isScanning ? "Memindai..." : "AI SCAN STRUK"}
              </button>
              
              <button
                onClick={() => { setTrxType("Masuk"); setShowMasukForm(true); }}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-gradient-to-tr from-brand-blue to-indigo-700 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] hover:shadow-2xl hover:shadow-brand-blue/20 active:scale-95 shadow-xl shadow-brand-blue/20 group"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                ENTRI KAS BARU
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] border-b border-slate-100">
                <th className="px-8 py-7">Log Waktu</th>
                <th className="px-8 py-7">Entitas</th>
                <th className="px-8 py-7">Kategori / Keterangan</th>
                <th className="px-8 py-7 text-right">Debit (+)</th>
                <th className="px-8 py-7 text-right">Kredit (-)</th>
                <th className="px-8 py-7 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 font-medium text-slate-600 dark:text-slate-300">
              {currentMonthTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white dark:border-slate-700 shadow-inner overflow-hidden">
                        <FileText className="w-10 h-10 text-slate-200 dark:text-slate-600" />
                      </div>
                      <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-[0.3em]">Nihil Transaksi</p>
                      <p className="text-slate-300 dark:text-slate-600 text-[10px] mt-2 italic font-bold">Belum ada aktivitas keuangan tercatat pada periode ini.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentMonthTransactions.map((trx: any, idx: number) => (
                  <motion.tr 
                    key={`kas-trx-${trx.id || idx}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                    className="hover:bg-brand-blue/[0.02] dark:hover:bg-brand-blue/[0.05] transition-all duration-300 group items-center"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${trx.tipe === 'Masuk' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'} transition-all duration-500`} />
                        <div>
                          <p className="text-[12px] font-black text-slate-800 dark:text-slate-100 group-hover:text-brand-blue transition-colors font-elegant">{trx.tanggal}</p>
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg mt-1 inline-block ${trx.tipe === 'Masuk' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'}`}>
                            {trx.tipe}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-800 dark:text-slate-100 tracking-tight text-sm group-hover:text-brand-blue transition-colors uppercase font-elegant leading-none">{trx.nama}</div>
                      <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        {trx.alamat || "UMUM"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-black text-brand-blue bg-brand-blue/5 dark:bg-brand-blue/10 px-4 py-1.5 rounded-2xl border border-brand-blue/10 text-[10px] inline-block mb-2 tracking-widest uppercase shadow-sm">{trx.transaksi}</div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 italic max-w-[200px] truncate" title={trx.keterangan}>{trx.keterangan || '-'}</div>
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-sm tabular-nums font-elegant ${trx.debit > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'}`}>
                      {trx.debit > 0 ? `+ ${new Intl.NumberFormat('id-ID').format(trx.debit)}` : "—"}
                    </td>
                    <td className={`px-8 py-6 text-right font-black text-sm tabular-nums font-elegant ${trx.kredit > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-700'}`}>
                      {trx.kredit > 0 ? `- ${new Intl.NumberFormat('id-ID').format(trx.kredit)}` : "—"}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 justify-end items-center transition-all">
                        <button onClick={() => setViewingKas(trx)} className="p-3 text-white bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20 transform hover:scale-110 active:scale-95 transition-all border border-white/10 outline-none"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingKas(trx); setTrxType(trx.tipe); setStrukUrl(trx.strukUrl || ""); setShowMasukForm(true); }} className="p-3 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-2xl hover:scale-110 active:scale-95 transition-all outline-none"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => setKasToDelete(trx)} className="p-3 text-rose-600 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white hover:scale-110 active:scale-95 transition-all outline-none"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showMasukForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[3rem] shadow-2xl border border-white overflow-hidden flex flex-col max-h-[95vh] relative"
            >
              <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4 tracking-tighter uppercase italic">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30">
                      <Wallet className="w-6 h-6" />
                    </div>
                    {editingKas ? "Ubah Transaksi Kas" : "Entri Kas Baru"}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2 ml-14">Rekonsiliasi Arus Keuangan Digital</p>
                </div>
                <button
                  onClick={() => {
                    setShowMasukForm(false);
                    setEditingKas(null);
                  }}
                  className="w-12 h-12 flex items-center justify-center bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form
                onSubmit={handleSaveKas}
                ref={formRef}
                className="p-10 overflow-y-auto space-y-8"
              >
                {scannedData && (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-pulse">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-loose">
                      AI Vision Smart Scan: Struk Berhasil Diproses
                    </span>
                  </div>
                )}

                <div className="p-1.5 bg-slate-100/50 rounded-2xl flex gap-1.5 border border-slate-200/50 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setTrxType("Masuk")}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${trxType === "Masuk" ? "bg-white text-emerald-600 shadow-lg border border-emerald-50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Pemasukan (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrxType("Keluar")}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${trxType === "Keluar" ? "bg-white text-rose-600 shadow-lg border border-rose-50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Pengeluaran (-)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Tanggal Log
                    </label>
                    <input
                      name="tanggal"
                      type="date"
                      defaultValue={
                        editingKas && editingKas.tanggal && !isNaN(new Date(editingKas.tanggal).getTime())
                          ? new Date(editingKas.tanggal).toISOString().split("T")[0]
                          : scannedData?.tanggal ||
                            new Date().toISOString().split("T")[0]
                      }
                      className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Nominal (IDR)
                    </label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                       <input
                        name="nominal"
                        type="text"
                        defaultValue={
                          editingKas
                            ? editingKas.debit || editingKas.kredit
                            : scannedData?.nominal || ""
                        }
                        placeholder="0"
                        className="w-full pl-12 pr-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Kategori & Jenis Transaksi
                  </label>
                  <input
                    name="transaksi"
                    type="text"
                    defaultValue={editingKas?.transaksi || scannedData?.transaksi || ""}
                    placeholder={
                      trxType === "Masuk"
                        ? "Misal: Iuran Warga, Donasi, dll"
                        : "Misal: Perbaikan Fasum, Listrik, dll"
                    }
                    className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Nama / Entitas
                    </label>
                    <input
                      name="nama"
                      type="text"
                      defaultValue={editingKas?.nama || scannedData?.nama || ""}
                      placeholder="Bpk. Budi / Toko Maju"
                      className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Blok / Alamat (Opsional)
                    </label>
                    <input
                      name="alamat"
                      type="text"
                      defaultValue={editingKas?.alamat || ""}
                      placeholder="Blok A No. 1"
                      className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Detail Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    defaultValue={editingKas?.keterangan || scannedData?.keterangan || ""}
                    rows={2}
                    placeholder="Penjelasan rincian penggunaan/sumber dana secara mendetail..."
                    className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-bold text-slate-600 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
                    <span>Lampiran Struk / Invoice</span>
                    <span className="text-[8px] text-blue-500">Maksimal 5MB</span>
                  </label>
                  <div className="flex gap-4 items-center">
                    {(strukUrl || editingKas?.strukUrl) ? (
                      <div className="relative w-24 h-24 rounded-2xl border-2 border-blue-100 overflow-hidden shrink-0 group">
                        <img
                          src={strukUrl || editingKas?.strukUrl}
                          className="w-full h-full object-cover"
                        />
                        <button type="button" onClick={() => setStrukUrl('')} className="absolute inset-0 bg-rose-600/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          id="kas-struk-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const url = await handleFileUpload(file, "kas_struk");
                                setStrukUrl(url);
                              } catch (err) {
                                showNotification("Gagal upload struk", "error");
                              }
                            }
                          }}
                        />
                        <button 
                           type="button" 
                           onClick={() => document.getElementById('kas-struk-upload')?.click()}
                           className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                        >
                           <Upload className="w-4 h-4" /> UNGGAH BUKTI FISIK
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    className={`flex-[2] py-5 text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 text-white flex items-center justify-center gap-3 ${trxType === "Masuk" ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/30" : "bg-gradient-to-r from-rose-500 to-red-700 shadow-rose-500/30"}`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingKas ? "SIMPAN PERUBAHAN" : `KONFIRMASI ${trxType.toUpperCase()}`}
                  </button>
                   <button
                    type="button"
                    onClick={() => {
                      setShowMasukForm(false);
                      setEditingKas(null);
                    }}
                    className="flex-1 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                  >
                    BATAL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingKas && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[110] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-white"
            >
              <div
                className={`p-8 ${viewingKas.tipe === "Masuk" ? "bg-gradient-to-br from-emerald-600 to-teal-700" : "bg-gradient-to-br from-rose-600 to-red-800"} text-white flex justify-between items-center relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Wallet className="w-4 h-4" /> 
                  </div>
                  Detail Rekonsiliasi Kas
                </h3>
                <button
                  onClick={() => setViewingKas(null)}
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all active:scale-90 relative z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="flex flex-col items-center mt-[-25px]">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">
                    Nominal Transaksi Digital
                  </div>
                  <div
                    className={`text-4xl font-black tracking-tighter ${viewingKas.tipe === "Masuk" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {formatRupiah(viewingKas.debit || viewingKas.kredit)}
                  </div>
                  <div className={`mt-4 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${viewingKas.tipe === 'Masuk' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    TRANSAKSI {viewingKas.tipe.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-10 bg-slate-50/50 p-8 rounded-2xl border border-slate-100 mt-[-38px]">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      ID Transaksi
                    </p>
                    <p className="text-xs font-black text-slate-800 family-mono break-all leading-tight">
                      {viewingKas.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Tanggal
                    </p>
                    <p className="text-xs font-black text-slate-800">
                      {viewingKas.tanggal}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Pihak Terkait
                    </p>
                    <p className="text-xs font-black text-slate-800 uppercase italic">
                      {viewingKas.nama}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Kategori
                    </p>
                    <p className="text-xs font-black text-blue-600">
                      {viewingKas.transaksi}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Keterangan Detail
                    </p>
                    <p className="text-xs font-bold text-slate-600 italic">
                      "{viewingKas.keterangan || "-"}"
                    </p>
                  </div>
                </div>

                {viewingKas.strukUrl && (
                  <div className="space-y-3 mt-[-32px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Lampiran Dokumen Keuangan
                    </p>
                    <div className="w-full aspect-[4/3] bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden group relative">
                      <img
                        src={viewingKas.strukUrl}
                        alt="Struk"
                        className="w-full h-full object-contain"
                      />
                      <a
                        href={viewingKas.strukUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                      >
                         <div className="bg-white text-blue-600 px-6 py-3 rounded-2xl text-[10px] font-black flex items-center gap-3 shadow-2xl">
                            <Eye className="w-5 h-5" /> LIHAT UKURAN PENUH
                         </div>
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => exportSingleTrxPDF(viewingKas)}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Printer className="w-5 h-5" /> CETAK BUKTI
                  </button>
                  <button
                    onClick={() => setViewingKas(null)}
                    className="flex-1 py-5 bg-white text-slate-400 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                  >
                    TUTUP
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {kasToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Catatan Kas"
            message={`Apakah Anda yakin ingin menghapus catatan "${kasToDelete?.transaksi}" oleh "${kasToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={handleDeleteKas}
            onCancel={() => setKasToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeletingKas}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
