import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Search,
  PlusCircle,
  Download,
  Upload,
  Printer,
  FileDown,
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
  ChevronLeft,
  ChevronRight,
  QrCode,
  Store,
  ShieldCheck,
  FileUp,
} from "lucide-react";
import { doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { logAuditEvent } from "../services/auditLogService";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ConfirmModal } from "./ui/ConfirmModal";
import { scanReceiptAI } from "../services/aiService";
import { PLAN_FEATURES } from "../constants";

const INDONESIAN_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

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
  const [strukUrl, setStrukUrl] = useState("");
  const [trxType, setTrxType] = useState<"Masuk" | "Keluar">("Masuk");
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kasToDelete, setKasToDelete] = useState<any>(null);
  const [editingKas, setEditingKas] = useState<any>(null);
  const [viewingKas, setViewingKas] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);
  const [isSavingKas, setIsSavingKas] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Default values for scanned data
  const [scannedData, setScannedData] = useState<any>(null);

  const [selectedWargaId, setSelectedWargaId] = useState("");
  const [jenisPembayaran, setJenisPembayaran] = useState("Iuran RT");
  const [uploading, setUploading] = useState(false);

  // For simulation PG modal like IuranView.tsx
  const [showPgModal, setShowPgModal] = useState(false);
  const [pgStep, setPgStep] = useState(1);
  const [pgMethod, setPgMethod] = useState("");
  const [pgVirtualAccount, setPgVirtualAccount] = useState("");
  const [pgFormState, setPgFormState] = useState<any>(null);

  const sanitizeForFirestore = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => 
      value === undefined ? null : value
    ));
  };

  useEffect(() => {
    if (wargaData && wargaData.length > 0 && currentUser && showMasukForm && !editingKas) {
      const u = wargaData.find(w => w.nik === currentUser.nik || w.id === currentUser.id_user || w.id === currentUser.uid);
      if (u) {
        setSelectedWargaId(u.docId || u.id || u.nik);
      }
    }
  }, [wargaData, currentUser, showMasukForm, editingKas]);

  useEffect(() => {
    if (!showMasukForm) {
      setStrukUrl("");
      setScannedData(null);
      setSelectedWargaId("");
      setJenisPembayaran("Iuran RT");
    }
  }, [showMasukForm]);

  const months = [
    "Semua",
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
  const [selectedMonth, setSelectedMonth] = useState(0); // Default to "Semua"
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear, searchQuery]);

  const isPengurus = (userRole?.toLowerCase() === "admin" ||
                      userRole?.toLowerCase() === 'rw' || 
                      userRole?.toLowerCase() === 'rt' || 
                      userRole?.toLowerCase() === 'bendahara' || 
                      userRole?.toLowerCase() === 'super_admin' ||
                      userRole?.toLowerCase() === 'super admin' ||
                      currentUser?.isSuperAdmin);

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

    // Check Plan Limit (weekly limit for scan based on recommendations)
    const normalizedPlan = (plan || 'STARTER').toUpperCase();
    const baseKey = normalizedPlan.includes('TRIAL') || normalizedPlan.includes('STARTER') ? 'TRIAL' :
                    normalizedPlan.includes('FLASH') || normalizedPlan.includes('BASIC') ? 'BASIC' :
                    normalizedPlan.includes('PRO') ? 'PRO' :
                    normalizedPlan.includes('PREMIUM') ? 'PREMIUM' :
                    normalizedPlan.includes('ENTERPRISE') ? 'ENTERPRISE' : 'TRIAL';
    const planDetails = PLAN_FEATURES[baseKey] || PLAN_FEATURES.TRIAL;
    const isSuperUser = userRole?.toUpperCase() === 'SUPER_ADMIN' || userRole?.toUpperCase() === 'SUPER ADMIN' || currentUser?.isSuperAdmin;
    const scanLimit = isSuperUser ? 99999 : (planDetails.weeklyScanLimit || 1);

    const countScansLast7Days = () => {
      let count = 0;
      const nowMs = Date.now();
      const sevenDaysAgoMs = nowMs - 7 * 24 * 60 * 60 * 1000;
      
      kasData.forEach(k => {
        if ((k.keterangan || '').includes('[AI Scan]')) {
          let cleanDateStr = k.tanggal || '';
          const idMonths: Record<string, string> = {
            'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar', 'Apr': 'Apr', 'Mei': 'May', 'Jun': 'Jun',
            'Jul': 'Jul', 'Agt': 'Aug', 'Sep': 'Sep', 'Okt': 'Oct', 'Nov': 'Nov', 'Des': 'Dec'
          };
          Object.keys(idMonths).forEach(month => {
            cleanDateStr = cleanDateStr.replace(month, idMonths[month]);
          });
          
          const kasDate = new Date(cleanDateStr);
          if (!isNaN(kasDate.getTime()) && kasDate.getTime() >= sevenDaysAgoMs) {
            count++;
          }
        }
      });
      return count;
    };

    const aiScansLast7DaysCount = countScansLast7Days();
    if (aiScansLast7DaysCount >= scanLimit) {
      showNotification(`Aduh maaf sekali! Kuota AI Scan Struk Anda habis (${scanLimit}x / minggu). Silakan lakukan Upgrade Paket untuk menikmati scan instan tanpa batas!`, "error");
      return;
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
    const formattedDate = (() => {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = INDONESIAN_MONTHS[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    })();

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
    const tenantName = settings.nama_rt || settings.nama_organisasi || "SmaRtRw AI";
    const tagline = settings.tagline || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(tenantName.toUpperCase(), 105, 18, {
      align: "center",
    });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(tagline, 105, 23, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(settings.alamat || "Sekretariat RT/RW", 105, 28, {
      align: "center",
    });
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.line(20, 32, 190, 32);

    // Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI TRANSAKSI KEUANGAN", 105, 43, { align: "center" });

    // Data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const startY = 56;
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
      doc.setFont("helvetica", "bold");
      doc.text(row[0], 30, startY + i * lineH);
      doc.setFont("helvetica", "normal");
      doc.text(": " + row[1], 70, startY + i * lineH);
    });

    doc.line(
      20,
      startY + data.length * lineH + 5,
      190,
      startY + data.length * lineH + 5,
    );

    // Footer
    const footerY = 145;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(
      "Dicetak pada: " + new Date().toLocaleString("id-ID"),
      20,
      footerY,
    );
    doc.setFont("helvetica", "bold");
    doc.text("Bendahara,", 150, footerY);
    doc.text("( ____________________ )", 150, footerY + 30);

    // Closing neighborhood-harmony sharing invitation quote
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      footerY + 45,
      { align: "center" }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`${cleanTenantName}_${cleanTagline}_Bukti_${trx.id}.pdf`);
    showNotification("PDF Berhasil diunduh");
  };

  const handleExportAllPDF = () => {
    const doc = new jsPDF();
    const settings = getSetting("KOP_SURAT") || {};
    const tenantName = settings.nama_rt || settings.nama_organisasi || "SmaRtRw AI";

    doc.setFontSize(16);
    doc.text(`Laporan Kas ${tenantName}`, 14, 15);
    
    autoTable(doc, {
      head: [['Tanggal', 'Entitas', 'Kategori', 'Debit', 'Kredit']],
      body: currentMonthTransactions.map(t => [t.tanggal, t.nama, t.transaksi, formatRupiah(t.debit || 0), formatRupiah(t.kredit || 0)]),
      startY: 20
    });
    
    doc.save("Laporan_Kas.pdf");
    showNotification("PDF Laporan Berhasil diunduh");
  };

  const handleExportAllExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentMonthTransactions.map(t => ({
      Tanggal: t.tanggal,
      Entitas: t.nama,
      Kategori: t.transaksi,
      Debit: t.debit,
      Kredit: t.kredit,
      Keterangan: t.keterangan
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kas");
    XLSX.writeFile(wb, "Laporan_Kas.xlsx");
    showNotification("Excel Laporan Berhasil diunduh");
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

      await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "DELETE_KAS", "kas", `Menghapus transaksi: ${kasToDelete.keterangan}`, tenantId);

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

  const handleEditKas = (trx: any) => {
    setEditingKas(trx);
    setTrxType(trx.tipe);
    setStrukUrl(trx.strukUrl || "");
    
    // Find matching wargaId for the dropdown
    if (wargaData && wargaData.length > 0) {
      const matchingWarga = wargaData.find(w => 
        (trx.nik && w.nik === trx.nik) || 
        (trx.userId && (w.id === trx.userId || w.uid === trx.userId || w.docId === trx.userId)) ||
        (trx.nama?.toLowerCase() === w.nama?.toLowerCase())
      );
      if (matchingWarga) {
        setSelectedWargaId(matchingWarga.docId || matchingWarga.id || matchingWarga.nik);
      } else {
        setSelectedWargaId("");
      }
    } else {
      setSelectedWargaId("");
    }
    
    // Set Alokasi / Jenis select
    setJenisPembayaran(trx.transaksi || "Iuran RT");
    
    setShowMasukForm(true);
  };

  const handleOpenNewKas = () => {
    setEditingKas(null);
    setTrxType("Masuk");
    setStrukUrl("");
    setSelectedWargaId("");
    setJenisPembayaran("Iuran RT");
    setShowMasukForm(true);
  };

  const handleStartPg = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!formRef.current) {
      showNotification("Sistem Error: Form tidak ditemukan", "error");
      return;
    }
    
    const formData = new FormData(formRef.current);
    const nominalRaw = parseInt((formData.get('nominal') as string)?.replace(/\D/g, '') || "0");
    
    if (nominalRaw <= 0) {
      showNotification("Silakan masukkan nominal pembayaran", "error");
      return;
    }

    const wargaId = formData.get('wargaId') as string;
    const namaPenytorVal = formData.get('namaPenyetor') as string;
    const jenis = jenisPembayaran || "Iuran RT";
    const tanggal = formData.get('tanggal') as string;
    const keterangan = formData.get('keterangan') as string;
    
    if (isPengurus && !wargaId && !namaPenytorVal) {
      showNotification("Harap pilih warga atau isi nama penyetor", "error");
      return;
    }

    setPgFormState({
      tanggal,
      nominal: nominalRaw,
      jenis,
      keterangan,
      wargaId,
      namaPenyetor: namaPenytorVal
    });
    setPgStep(1);
    setPgMethod('');
    setShowPgModal(true);
  };

  const handlePgSuccess = async () => {
    const id = `IURAN-${Date.now()}`;
    const dateObj = (pgFormState.tanggal && !isNaN(new Date(pgFormState.tanggal).getTime())) ? new Date(pgFormState.tanggal) : new Date();
    
    let nik = (currentUser?.nik || currentUser?.uid || currentUser?.id_user || "-").toString();
    let nama = currentUser?.nama || currentUser?.name || "Warga";
    let alamat = "-";
    let targetUserId = currentUser?.uid || currentUser?.id_user || null;

    if (isPengurus && pgFormState.wargaId) {
      const selectedWarga = wargaData.find((w:any) => w.id === pgFormState.wargaId || w.docId === pgFormState.wargaId || w.nik === pgFormState.wargaId);
      if (selectedWarga) {
        nik = (selectedWarga.nik || "-").toString();
        nama = selectedWarga.nama || "Warga";
        alamat = selectedWarga.alamat || selectedWarga.blok || "-";
        targetUserId = selectedWarga.id || selectedWarga.uid || selectedWarga.id_user || null;
      }
    } else if (isPengurus && pgFormState.namaPenyetor) {
      nama = pgFormState.namaPenyetor;
      nik = "-";
    }

    const resolvedRtForPg = (() => {
      if (getSetting) {
        const settingsRt = getSetting("rt");
        if (settingsRt) return settingsRt.toString().replace(/^0+/, "").padStart(2, "0");
      }
      const matchRt = tenantId?.match(/rt\s*(\d+)/i);
      if (matchRt) return matchRt[1].padStart(2, "0");
      return (currentUser?.rt || "01").toString().replace(/^0+/, "").padStart(2, "0");
    })();

    const payload = sanitizeForFirestore({
      id,
      tenantId: tenantId || "MASTER",
      rt: resolvedRtForPg,
      tanggal: dateObj.toISOString(),
      jenis: pgFormState.jenis || "Iuran RT",
      nominal: pgFormState.nominal || 0,
      keterangan: pgFormState.keterangan || `Pembayaran ${pgFormState.jenis || 'Iuran'} (via ${pgMethod})`,
      nik: nik || "-",
      namaPenyetor: nama || "Warga",
      alamat: alamat || "-",
      buktiUrl: `PG-${pgMethod} Digital Receipt`,
      status: 'Lunas',
      userId: targetUserId || null,
      verifiedBy: 'Sistem',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => {
        if (prev.some((i: any) => i.id === id)) return prev;
        return [payload, ...prev];
      });
      
      const kasId = `TRX-${Date.now()}`;
      const formattedDateForPg = (() => {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = INDONESIAN_MONTHS[dateObj.getMonth()];
        const year = dateObj.getFullYear();
        return `${day} ${month} ${year}`;
      })();
      const kasPayload = {
        id: kasId,
        tenantId: tenantId || "MASTER",
        rt: payload.rt,
        tanggal: formattedDateForPg,
        tipe: 'Masuk',
        transaksi: payload.jenis,
        nama: payload.namaPenyetor,
        keterangan: payload.keterangan,
        debit: payload.nominal,
        kredit: 0,
        strukUrl: `Simulasi PG ${pgMethod}`,
        iuranId: id
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => {
        if (prev.some((k: any) => k.id === kasId)) return prev;
        return [kasPayload, ...prev];
      });
      
      await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "CREATE_IURAN_ONLINE", "iuran", `Iuran Online: RP ${payload.nominal} - ${payload.namaPenyetor}`, tenantId);
      
      showNotification('Pembayaran Online Berhasil!', 'success');
      setShowPgModal(false);
      setShowMasukForm(false);
      setStrukUrl('');
      setJenisPembayaran('Iuran RT');
    } catch (e: any) {
      handleFirestoreError(e, 'create', `iuran/${id}`);
      showNotification('Gagal mencatat pembayaran online', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveKas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSavingKas) return;
    
    // Check monthly transaction limits
    const currentMonthForTrx = `${INDONESIAN_MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`;
    const trxThisMonthCount = kasData.filter(k => k.tanggal && k.tanggal.includes(currentMonthForTrx)).length;

    const normalizedPlan = (plan || 'STARTER').toUpperCase();
    const baseKey = normalizedPlan.includes('TRIAL') || normalizedPlan.includes('STARTER') ? 'TRIAL' :
                    normalizedPlan.includes('FLASH') || normalizedPlan.includes('BASIC') ? 'BASIC' :
                    normalizedPlan.includes('PRO') ? 'PRO' :
                    normalizedPlan.includes('PREMIUM') ? 'PREMIUM' :
                    normalizedPlan.includes('ENTERPRISE') ? 'ENTERPRISE' : 'TRIAL';
    const planDetails = PLAN_FEATURES[baseKey] || PLAN_FEATURES.TRIAL;
    const isSuperUser = userRole?.toUpperCase() === 'SUPER_ADMIN' || userRole?.toUpperCase() === 'SUPER ADMIN' || currentUser?.isSuperAdmin;
    const trxLimit = isSuperUser ? 999999 : (planDetails.monthlyTrxLimit || 25);
    
    if (!editingKas && trxThisMonthCount >= trxLimit) {
      showNotification(`Gagal mencatat kas: Wilayah Anda telah mencapai batas kuota bulanan (${trxLimit} transaksi) untuk paket ${baseKey === 'TRIAL' ? 'STARTER' : baseKey}. Silakan lakukan upgrade paket untuk mencatat transaksi tanpa batasan! 😉✨`, "error");
      return;
    }

    setIsSavingKas(true);
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get("tanggal") as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = (() => {
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = INDONESIAN_MONTHS[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    })();

    const newId = editingKas ? editingKas.id : `TRX-${Date.now()}`;
    let nominal = parseInt(
      (formData.get("nominal") as string).replace(/\D/g, "") || "0",
    );

    let nik = "-";
    let nama = "";
    let alamat = "-";
    let targetUserId = null;

    if (isPengurus) {
      const selectedWargaIdFromForm = formData.get('wargaId') as string;
      const w = wargaData.find((item: any) => 
        (item.docId || item.id || item.nik) === selectedWargaIdFromForm
      );
      
      if (w) {
        nik = (w.nik || "-").toString();
        nama = w.nama || "Warga";
        alamat = w.alamat || "-";
        targetUserId = w.id || w.uid || w.id_user || null;
      } else {
        const manualNama = formData.get('namaPenyetor') as string;
        if (manualNama) {
          nama = manualNama;
        } else {
          nama = trxType === "Masuk" ? "Penyetor Luar Warga" : "Penerima Luar Warga";
        }
      }
    } else {
       nik = (currentUser?.nik || currentUser?.uid || currentUser?.id_user || "-").toString();
       nama = currentUser?.nama || currentUser?.name || "Warga";
       const foundCurrent = wargaData.find((w: any) => (w.nik === nik && nik !== "-") || (currentUser?.uid && w.id === currentUser.uid));
       if (foundCurrent) alamat = foundCurrent.alamat || "-";
       targetUserId = currentUser?.uid || currentUser?.id_user || null;
    }

    const transaksi = jenisPembayaran || "Iuran RT";
    const keterangan = formData.get("keterangan") as string;

    const resolvedRt = (() => {
      if (getSetting) {
        const settingsRt = getSetting("rt");
        if (settingsRt) return settingsRt.toString().replace(/^0+/, "").padStart(2, "0");
      }
      const matchRt = tenantId?.match(/rt\s*(\d+)/i);
      if (matchRt) return matchRt[1].padStart(2, "0");
      return (currentUser?.rt || "01").toString().replace(/^0+/, "").padStart(2, "0");
    })();

    const targetIuranId = editingKas?.iuranId || `IURAN-${newId.replace('TRX-', '')}`;
    const isIuran = trxType === "Masuk" && transaksi.toLowerCase().includes("iuran");

    const newTrx = {
      tenantId: tenantId,
      rt: resolvedRt,
      id: newId,
      tanggal: editingKas ? editingKas.tanggal : formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: nama,
      nik: nik,
      alamat: alamat,
      userId: targetUserId,
      keterangan: keterangan,
      debit: trxType === "Masuk" ? nominal : 0,
      kredit: trxType === "Keluar" ? nominal : 0,
      strukUrl: strukUrl,
      iuranId: isIuran ? targetIuranId : (editingKas?.iuranId || null)
    };

    setIsLoadingDB(true);
    try {
      console.log("Saving transaction to Firestore:", newTrx);
      if (isIuran) {
        const iuranPayload = sanitizeForFirestore({
          id: targetIuranId,
          tenantId: tenantId || "MASTER",
          rt: resolvedRt,
          tanggal: dateObj.toISOString(),
          jenis: transaksi,
          nominal: nominal,
          keterangan: keterangan || `Pembayaran ${transaksi}`,
          nik: nik,
          namaPenyetor: nama,
          alamat: alamat,
          buktiUrl: strukUrl,
          status: 'Lunas',
          userId: targetUserId,
          recordedBy: currentUser?.uid || currentUser?.id_user || 'System',
          updatedAt: new Date().toISOString()
        });

        await setDoc(doc(db, "iuran", targetIuranId), iuranPayload);
        
        // Update iuranData state
        setIuranData((prev: any[]) => {
          if (prev.some(i => i.id === targetIuranId)) {
            return prev.map(i => i.id === targetIuranId ? iuranPayload : i);
          }
          return [iuranPayload, ...prev];
        });
      } else if (editingKas?.iuranId) {
        // Delete previous related iuran if category becomes non-iuran
        try {
          await deleteDoc(doc(db, "iuran", editingKas.iuranId));
          setIuranData((prev: any[]) => prev.filter(i => i.id !== editingKas.iuranId));
        } catch (err) {
          console.warn("Failed to delete outdated iuran record:", err);
        }
      }

      if (editingKas) {
        await updateDoc(doc(db, "kas", editingKas.id), newTrx);
        setKasData((prev: any[]) =>
          prev.map((t) => (t.id === editingKas.id ? newTrx : t)),
        );
        showNotification("Transaksi kas berhasil diperbarui", "success");
        await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "UPDATE_KAS", "kas", `Edit transaksi: ${keterangan}`, tenantId);
      } else {
        await setDoc(doc(db, "kas", newId), newTrx);
        setKasData((prev: any[]) => {
          if (prev.some(t => t.id === newId)) {
            return prev.map(t => t.id === newId ? newTrx : t);
          }
          return [newTrx, ...prev];
        });
        showNotification("Transaksi kas berhasil ditambahkan", "success");
        await logAuditEvent(currentUser?.uid || "system", currentUser?.name || "Aplikasi", "CREATE_KAS", "kas", `Tambah transaksi: ${keterangan}`, tenantId);

        // Auto create RW equivalent if "Setoran Ke RW"
        if (transaksi === "Setoran Ke RW" && trxType === "Keluar") {
           const rwTenantId = (tenantId || "MASTER").replace(/rt\w*_/i, '').replace(/rt\d+/i, '').replace(/^_/, '');
           if (rwTenantId !== tenantId) {
             const rwNewId = `TRX-RW-${Date.now()}`;
             const rwNewTrx = {
                ...newTrx,
                id: rwNewId,
                tenantId: rwTenantId,
                tipe: "Masuk",
                transaksi: "Dana Masuk Dari RT",
                nama: `Pengurus RT ${resolvedRt}`,
                keterangan: `Menerima setoran iuran otomatis dari RT ${resolvedRt}`,
                debit: nominal,
                kredit: 0
             };
             await setDoc(doc(db, "kas", rwNewId), rwNewTrx);
             setKasData((prev: any[]) => [rwNewTrx, ...prev]);
           }
        }
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

  const currentMonthTransactions = useMemo(() => {
    return kasData.filter((t: any) => {
      if (!t.tanggal) return false;
      
      let tMonth = -1;
      let tYear = -1;
      
      if (t.tanggal.includes('-') || t.tanggal.includes('T')) {
        const dObj = new Date(t.tanggal);
        if (!isNaN(dObj.getTime())) {
          tMonth = dObj.getMonth();
          tYear = dObj.getFullYear();
        }
      } else {
        const parts = t.tanggal.split(/\s+/);
        if (parts.length >= 3) {
          const mLabel = parts[1];
          const idMonths = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
          const enMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const mIndexStr = idMonths.indexOf(mLabel);
          if (mIndexStr !== -1) {
            tMonth = mIndexStr;
          } else {
            const mIndexEn = enMonths.indexOf(mLabel);
            if (mIndexEn !== -1) tMonth = mIndexEn;
          }
          tYear = parseInt(parts[2]);
        }
      }
      
      // If selectedMonth is 0, it means "Semua"
      const matchesDate = (selectedMonth === 0) || (tMonth === (selectedMonth - 1) && tYear === selectedYear);
      if (!matchesDate) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          (t.nama || '').toLowerCase().includes(query) ||
          (t.keterangan || '').toLowerCase().includes(query) ||
          (t.transaksi || '').toLowerCase().includes(query) ||
          (t.nik || '').includes(query);
        return matchesSearch;
      }
      
      return true;
    });
  }, [kasData, selectedMonth, selectedYear, searchQuery]);

  const totalItems = currentMonthTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const displayedTransactions = currentMonthTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/30 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden relative transition-all h-[600px]">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 
              className="text-[19px] font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 tracking-tighter uppercase italic font-elegant"
              style={{ width: '238.68099999999998px' }}
            >
              <div className="w-2 h-8 bg-brand-blue rounded-full shadow-lg shadow-brand-blue/40"></div>
              <span className="text-brand-blue font-black tracking-tighter" style={{ fontSize: '22px', height: '57.0069px' }}>Buku Kas</span>
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
                className="pl-11 pr-5 py-3.5 bg-white dark:bg-slate-800 border-[2.11111px] border-[#e9038d] text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 w-full xl:w-64 transition-all shadow-sm placeholder:text-slate-300 dark:text-slate-200"
              />
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              {/* PDF and Excel buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportAllPDF}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-rose-400 via-pink-500 to-red-500 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-rose-400/30 transition-all duration-300"
                title="Export PDF"
              >
                <Printer className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportAllExcel}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-400/30 transition-all duration-300"
                title="Download Excel"
              >
                <FileDown className="w-4 h-4 text-white" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-300"
                title="Import Excel"
              >
                <FileUp className="w-4 h-4 text-white" />
              </motion.button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportFileKas}
              />

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="flex-1 lg:flex-none bg-gradient-to-tr from-indigo-100 via-white to-rose-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border border-indigo-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-lg shadow-indigo-100/50 dark:shadow-none transition-all appearance-none cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="flex-1 lg:flex-none bg-gradient-to-tr from-indigo-100 via-white to-rose-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 border border-indigo-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-lg shadow-indigo-100/50 dark:shadow-none transition-all appearance-none cursor-pointer hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              <input type="file" ref={scanInputRef} className="hidden" accept="image/*,application/pdf" capture="environment" onChange={handleScanReceipt} />
              
              <button
                onClick={() => scanInputRef.current?.click()}
                disabled={isScanning}
                className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-400/30 group disabled:opacity-50"
              >
                {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="p-1 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-brand-blue/10 transition-colors"><Camera className="w-3.5 h-3.5 text-brand-blue" /></div>}
                {isScanning ? "Memindai..." : "AI SCAN STRUK"}
              </button>
              
              {isPengurus && (
                <button
                  onClick={handleOpenNewKas}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.05] hover:shadow-2xl hover:shadow-blue-500/30 active:scale-95 shadow-xl shadow-blue-500/20 group"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> 
                  ENTRI KAS BARU
                </button>
              )}
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
                displayedTransactions.map((trx: any, idx: number) => (
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
                        <button onClick={() => setViewingKas(trx)} className="p-3 text-white bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 transform hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 outline-none"><Eye className="w-4 h-4" /></button>
                        {isPengurus && (
                          <>
                            <button onClick={() => handleEditKas(trx)} className="p-3 text-white bg-gradient-to-br from-indigo-400 to-blue-600 rounded-2xl shadow-lg shadow-indigo-500/20 transform hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 outline-none"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => setKasToDelete(trx)} className="p-3 text-white bg-gradient-to-br from-rose-400 to-red-600 rounded-2xl shadow-lg shadow-rose-500/20 transform hover:scale-110 active:scale-95 transition-all duration-300 border border-white/10 outline-none"><Trash2 className="w-4 h-4" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SHARED PAGINATION CONTROLS */}
        {totalItems > 0 && (
          <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="text-[10px] sm:text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Menampilkan {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, totalItems)} Dari {totalItems} Transaksi
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 whitespace-nowrap">
                  Batas Tampilan:
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 py-1 px-2.5 rounded-xl text-[11px] font-black text-slate-700 dark:text-slate-300 outline-none cursor-pointer hover:border-brand-blue/50 transition-all shadow-sm"
                >
                  <option value={10}>10 Baris</option>
                  <option value={20}>20 Baris</option>
                  <option value={50}>50 Baris</option>
                  <option value={100}>100 Baris</option>
                  <option value={999999}>Semua</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-[150px] sm:max-w-xs scrollbar-hide">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                    if (totalPages > 5 && Math.abs(pg - currentPage) > 1 && pg !== 1 && pg !== totalPages) {
                      return null;
                    }
                    return (
                      <button
                        key={`pg-btn-${pg}`}
                        onClick={() => setCurrentPage(pg)}
                        className={`w-9 h-9 shrink-0 rounded-xl text-[11px] font-black transition-all ${
                          currentPage === pg
                            ? "bg-gradient-to-tr from-brand-blue to-blue-600 text-white shadow-md shadow-brand-blue/25 scale-110"
                            : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
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
              <div className="px-10 pt-[50px] pb-[50px] h-[50px] border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
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
                className="p-10 overflow-y-auto space-y-8 flex-1"
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
                    onClick={() => { setTrxType("Masuk"); setJenisPembayaran("Iuran RT"); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${trxType === "Masuk" ? "bg-white text-emerald-600 shadow-lg border border-emerald-50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Pemasukan (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTrxType("Keluar"); setJenisPembayaran("Fasum"); }}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${trxType === "Keluar" ? "bg-white text-rose-600 shadow-lg border border-rose-50 scale-[1.02]" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    Pengeluaran (-)
                  </button>
                </div>

                {isPengurus && (
                  <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-4 shadow-inner">
                    <label className="block text-[10px] font-black text-blue-800 uppercase tracking-[0.3em] ml-1 mb-2">
                      {trxType === "Masuk" ? "Identitas Penyetor (Admin Otoritas)" : "Identitas Penerima (Admin Otoritas)"}
                    </label>
                    <select 
                      name="wargaId" 
                      value={selectedWargaId} 
                      onChange={(e) => setSelectedWargaId(e.target.value)}
                      className="w-full px-5 py-4 border border-blue-100 rounded-2xl text-sm font-black text-slate-700 bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    >
                      <option value="">-- Bukan warga terdaftar (User Umum) --</option>
                      {[...wargaData].sort((a: any, b: any) => (a.nama || '').localeCompare(b.nama || '')).map((w:any, index: number) => (
                        <option key={`w-kas-opt-${w.docId || w.id || w.nik || index}-${index}`} value={w.docId || w.id || w.nik}>
                          {w.nama} ({w.nik})
                        </option>
                      ))}
                    </select>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="namaPenyetor" 
                        defaultValue={editingKas?.nama || ""} 
                        placeholder={trxType === "Masuk" ? "Atau ketik manual nama penyetor luar warga..." : "Atau ketik manual nama penerima luar warga..."} 
                        className="w-full px-5 py-4 border border-blue-100 rounded-2xl text-sm font-bold text-slate-600 bg-white outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-300 transition-all shadow-sm" 
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Tanggal Transaksi
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
                      Nominal Pembayaran (IDR)
                    </label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">Rp</span>
                       <input
                        name="nominal"
                        type="text"
                        defaultValue={
                          editingKas
                            ? (editingKas.debit || editingKas.kredit)
                            : scannedData?.nominal || ""
                        }
                        placeholder="50.000"
                        className="w-full pl-12 pr-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Alokasi / Jenis Pembayaran
                  </label>
                  <select 
                    value={jenisPembayaran} 
                    onChange={(e) => setJenisPembayaran(e.target.value)} 
                    name="jenis" 
                    className="w-full px-5 py-4 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                  >
                    <option value="Iuran RT">Iuran RT</option>
                    <option value="Setoran Ke RW">Setoran Ke RW</option>
                    <option value="Iuran RW">Iuran RW</option>
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Iuran Sampah">Iuran Sampah</option>
                    <option value="Iuran 17 an">Iuran 17 an</option>
                    <option value="Iuran PBB">Iuran PBB</option>
                    <option value="Iuran Pembangunan/ Renovasi Balai">Iuran Pembangunan/ Renovasi Balai</option>
                    <option value="Iuran Pembangunan/ Renovasi Kantor">Iuran Pembangunan/ Renovasi Kantor</option>
                    <option value="Iuran Pembangunan/ Renovasi Pos Ronda">Iuran Pembangunan/ Renovasi Pos Ronda</option>
                    <option value="Iuran Fasum">Iuran Fasum</option>
                    <option value="Iuran Keamanan">Iuran Keamanan</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Sumbangan">Sumbangan</option>
                    <option value="Donasi Ke RW">Donasi Ke RW</option>
                    <option value="Donasi">Donasi</option>
                    <option value="Pembelian ATK">Pembelian ATK</option>
                    <option value="Pembelian Aset">Pembelian Aset</option>
                    <option value="Pembelian Elektronik">Pembelian Elektronik</option>
                    <option value="Pembelian Furniture">Pembelian Furniture</option>
                    <option value="Pembelian Alat Olahraga">Pembelian Alat Olahraga</option>
                    <option value="Pembayaran Wifi">Pembayaran Wifi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Catatan / Keterangan (Opsional)
                  </label>
                  <textarea
                    name="keterangan"
                    defaultValue={editingKas?.keterangan || scannedData?.keterangan || ""}
                    rows={2}
                    placeholder="Berikan detail tambahan jika diperlukan..."
                    className="w-full px-5 py-4 border border-slate-100 bg-slate-50/50 rounded-2xl text-sm font-bold text-slate-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex justify-between items-center">
                    <span>Lampiran Bukti / Struk Fisik</span>
                    <span className="text-blue-500 text-[8px] font-black">Maksimal 5MB</span>
                  </label>
                  {strukUrl ? (
                    <div className="relative w-full aspect-video bg-slate-50 rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-inner group">
                      <img src={strukUrl} alt="Bukti" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <button type="button" onClick={() => setStrukUrl('')} className="bg-white text-rose-600 px-6 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                           <Trash2 className="w-4 h-4" /> HAPUS FOTO
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploading(true);
                          try {
                            const url = await handleFileUpload(e.target.files[0], 'kas_struk');
                            if (url) setStrukUrl(url);
                          } catch (err) {
                            showNotification("Gagal upload bukti", "error");
                          }
                          setUploading(false);
                        }
                      }} />
                      <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 hover:bg-blue-50/50 hover:border-blue-300 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-4 bg-slate-50/30 outline-none group focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50 disabled:cursor-wait">
                        {uploading ? (
                          <div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                        ) : (
                          <>
                            <div className="p-4 bg-white rounded-2xl shadow-lg shadow-slate-100 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
                               <Upload className="w-8 h-8 text-blue-500" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Klik Untuk Unggah Dokumen</p>
                              <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP</p>
                            </div>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    {editingKas ? 'SIMPAN PERUBAHAN' : trxType === "Masuk" ? 'CATAT PEMBAYARAN TUNAI' : 'CATAT PENGELUARAN TUNAI'}
                  </button>
                  {!editingKas && trxType === "Masuk" ? (
                    <button 
                      type="button" 
                      onClick={handleStartPg} 
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-700 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <QrCode className="w-5 h-5" />
                      BAYAR ONLINE (QRIS/VA)
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { setShowMasukForm(false); setEditingKas(null); }}
                      className="flex-1 bg-white border border-slate-200 text-slate-500 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      BATAL
                    </button>
                  )}
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

              <div className="p-10 space-y-8 h-[340px] overflow-y-auto">
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
                    <FileDown className="w-5 h-5" /> UNDUH BUKTI (PDF)
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

      {/* Simulation Payment Gateway Modal */}
      <AnimatePresence>
        {showPgModal && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[120] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative"
            >
              <div className="bg-blue-600 p-6 flex flex-col items-center justify-center text-white relative">
                <button onClick={() => setShowPgModal(false)} className="absolute top-4 right-4 text-blue-200 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-black tracking-widest uppercase text-xs text-blue-200 mb-1">Simulasi Payment Gateway</h3>
                <div className="text-3xl font-black font-mono">
                  Rp {new Intl.NumberFormat('id-ID').format(pgFormState?.nominal || 0)}
                </div>
              </div>

              <div className="p-6 overflow-y-auto">
                {pgStep === 1 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Pilih Metode Pembayaran</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { setPgMethod('QRIS'); setPgVirtualAccount(''); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-700">QRIS</span>
                      </button>
                      <button onClick={() => { setPgMethod('VA BCA'); setPgVirtualAccount('014' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-700">VA BCA</span>
                      </button>
                      <button onClick={() => { setPgMethod('VA Mandiri'); setPgVirtualAccount('895' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-700">VA Mandiri</span>
                      </button>
                      <button onClick={() => { setPgMethod('Alfamart'); setPgVirtualAccount('ALF' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')); setPgStep(2); }} className="p-4 border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-500 group-hover:text-blue-600">
                          <Store className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-slate-700">Alfamart</span>
                      </button>
                    </div>
                  </div>
                )}

                {pgStep === 2 && (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{pgMethod}</p>
                      <p className="text-sm font-bold text-slate-800 mt-1">Selesaikan Pembayaran</p>
                    </div>

                    {pgMethod === 'QRIS' ? (
                      <div className="w-48 h-48 bg-slate-100 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center p-4">
                        <QrCode className="w-full h-full text-slate-800" />
                      </div>
                    ) : (
                      <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nomor Virtual Account</p>
                        <p className="text-2xl font-mono font-black text-blue-600 tracking-wider select-all">{pgVirtualAccount}</p>
                      </div>
                    )}

                    <div className="w-full pt-4 border-t border-slate-100">
                      <button onClick={handlePgSuccess} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
                        <CheckCircle2 className="w-5 h-5" /> Simulasi Bayar Sukses
                      </button>
                      <button onClick={() => setPgStep(1)} className="w-full mt-3 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        Kembali Pilih Metode
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="py-3 bg-slate-50 text-center border-t border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Powered by Tripay Simulation
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
