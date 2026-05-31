import React, { useState, useRef, useMemo } from "react";
import {
  Baby,
  Stethoscope,
  Activity,
  HeartPulse,
  Plus,
  PlusCircle,
  History,
  ClipboardList,
  Search,
  Upload,
  Download,
  Trash2,
  Edit,
  X,
  ChevronRight,
  User,
  Calendar,
  Settings,
  Scale,
  TrendingUp,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as XLSX from "xlsx";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface PosyanduViewProps {
  balitaData: any[];
  setBalitaData: React.Dispatch<React.SetStateAction<any[]>>;
  ibuHamilData: any[];
  setIbuHamilData: React.Dispatch<React.SetStateAction<any[]>>;
  posyanduKegiatanData: any[];
  setPosyanduKegiatanData: React.Dispatch<React.SetStateAction<any[]>>;
  posbinduKegiatanData: any[];
  setPosbinduKegiatanData: React.Dispatch<React.SetStateAction<any[]>>;
  pemeriksaanBalitaData: any[];
  setPemeriksaanBalitaData: React.Dispatch<React.SetStateAction<any[]>>;
  pemeriksaanPosbinduData: any[];
  setPemeriksaanPosbinduData: React.Dispatch<React.SetStateAction<any[]>>;
  imunisasiData: any[];
  setImunisasiData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData: any[];
  currentUser: any;
  tenantId: string;
  setIsLoadingDB: (loading: boolean) => void;
  handleFirestoreError: (err: any) => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function PosyanduView({
  balitaData,
  setBalitaData,
  ibuHamilData,
  setIbuHamilData,
  posyanduKegiatanData,
  setPosyanduKegiatanData,
  posbinduKegiatanData,
  setPosbinduKegiatanData,
  pemeriksaanBalitaData,
  setPemeriksaanBalitaData,
  pemeriksaanPosbinduData,
  setPemeriksaanPosbinduData,
  imunisasiData,
  setImunisasiData,
  wargaData,
  currentUser,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
}: PosyanduViewProps) {
  const roleUpper = currentUser?.role?.toUpperCase() || "";
  const isViewer = ["WARGA", "VIEWER", "TAMU"].includes(roleUpper);
  const isWarga = roleUpper === "WARGA";

  const filteredBalita = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (balitaData || []).filter(
        (b: any) =>
          b.nikOrangTua === currentUser.nik || b.nik === currentUser.nik,
      );
    }
    return balitaData || [];
  }, [balitaData, isWarga, currentUser?.nik]);

  const filteredIbuHamil = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (ibuHamilData || []).filter((i: any) => i.nik === currentUser.nik);
    }
    return ibuHamilData || [];
  }, [ibuHamilData, isWarga, currentUser?.nik]);

  const filteredPosbindu = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (pemeriksaanPosbinduData || []).filter(
        (p: any) => p.nik === currentUser.nik,
      );
    }
    return pemeriksaanPosbinduData || [];
  }, [pemeriksaanPosbinduData, isWarga, currentUser?.nik]);

  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "balita"
    | "ibuhamil"
    | "kegiatan"
    | "posbindu"
    | "timeline"
    | "ibuhamil_detail"
  >("dashboard");
  const [showBalitaForm, setShowBalitaForm] = useState(false);
  const [showIbuHamilForm, setShowIbuHamilForm] = useState(false);
  const [showKegiatanForm, setShowKegiatanForm] = useState(false);
  const [showPosbinduForm, setShowPosbinduForm] = useState(false);
  const [showPemeriksaanForm, setShowPemeriksaanForm] = useState(false);
  const [showImunisasiForm, setShowImunisasiForm] = useState(false);
  const [selectedBalita, setSelectedBalita] = useState<any>(null);
  const [selectedIbuHamil, setSelectedIbuHamil] = useState<any>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingPosbinduItem, setEditingPosbinduItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefIbuHamil = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of data as any[]) {
          const nik = row["NIK"] || row["nik"] || row["Nik"] || row["NIK Anak"];
          const nama = row["Nama"] || row["nama"] || row["Nama Anak"];

          if (nik && nama) {
            const id = `BAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newBalita = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglLahir:
                row["Tgl Lahir"] ||
                row["Tanggal Lahir"] ||
                row["tgl_lahir"] ||
                new Date().toISOString().split("T")[0],
              jenisKelamin:
                row["Jenis Kelamin"] ||
                row["L/P"] ||
                row["jenis_kelamin"] ||
                "L",
              namaIbu: row["Nama Ibu"] || row["nama_ibu"] || "",
              namaAyah: row["Nama Ayah"] || row["nama_ayah"] || "",
              rt: row["RT"] || row["rt"] || "01",
              rw: row["RW"] || row["rw"] || "01",
              bbLahir: parseFloat(row["BB Lahir"] || row["bb_lahir"] || "0"),
              pbLahir: parseFloat(row["PB Lahir"] || row["pb_lahir"] || "0"),
            };

            await setDoc(doc(db, "posyandu_balita", id), newBalita);
            successCount++;
          }
        }

        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data balita berhasil diimpor!`);
        } else {
          showNotification(
            "Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.",
            "error",
            );
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportIbuHamilExcel = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of data as any[]) {
          const nik = row["NIK"] || row["nik"] || row["NIK Ibu"];
          const nama = row["Nama"] || row["nama"] || row["Nama Ibu Hamil"];

          if (nik && nama) {
            const id = `HML-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newIbuHamil = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglHPL:
                row["Tgl HPL"] ||
                row["HPL"] ||
                row["tgl_hpl"] ||
                new Date().toISOString().split("T")[0],
              usiaKehamilan: parseFloat(
                row["Usia Hamil"] ||
                  row["Usia Kehamilan"] ||
                  row["usia_kehamilan"] ||
                  "0",
              ),
              riwayatKesehatan:
                row["Riwayat Kesehatan"] || row["Kesehatan"] || "",
              rt: row["RT"] || row["rt"] || "01",
              rw: row["RW"] || row["rw"] || "01",
            };

            await setDoc(doc(db, "ibu_hamil", id), newIbuHamil);
            successCount++;
          }
        }

        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data ibu hamil berhasil diimpor!`);
        } else {
          showNotification(
            "Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.",
            "error",
          );
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRefIbuHamil.current) fileInputRefIbuHamil.current.value = "";
  };

  const calculateAgeInMonths = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    return months;
  };

  const handleSaveBalita = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem ? editingItem.id : `BAL-${Date.now()}`;
    const data = {
      id,
      tenantId,
      nik: formData.get("nik") as string,
      nama: formData.get("nama") as string,
      tglLahir: formData.get("tglLahir") as string,
      jenisKelamin: formData.get("jenisKelamin") as string,
      namaIbu: formData.get("namaIibu") as string,
      namaAyah: formData.get("namaAyah") as string,
      nikOrangTua: formData.get("nikOrangTua") as string,
      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
      bbLahir: parseFloat(formData.get("bbLahir") as string) || 0,
      pbLahir: parseFloat(formData.get("pbLahir") as string) || 0,
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "posyandu_balita", id), data);
        showNotification("Data balita diperbarui!", "success");
      } else {
        await setDoc(doc(db, "posyandu_balita", id), data);
        showNotification("Data balita baru ditambahkan!", "success");
      }
      setShowBalitaForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleDeleteBalita = async (id: string) => {
    if (!window.confirm("Hapus data balita ini?")) return;
    try {
      await deleteDoc(doc(db, "posyandu_balita", id));
      showNotification("Data balita dihapus", "success");
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleSavePemeriksaan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `PEM-${Date.now()}`;
    const data = {
      id,
      tenantId,
      balitaId: selectedBalita.id,
      namaBalita: selectedBalita.nama,
      tanggal: formData.get("tanggal") as string,
      berat: parseFloat(formData.get("berat") as string),
      tinggi: parseFloat(formData.get("tinggi") as string),
      lingkarKepala: parseFloat(formData.get("lingkarKepala") as string),
      statusGizi: formData.get("statusGizi") as string,
      catatan: formData.get("catatan") as string,
      petugas: currentUser?.name || "Admin",
    };

    try {
      await setDoc(doc(db, "posyandu_pemeriksaan", id), data);
      showNotification("Hasil pemeriksaan dicatat!", "success");
      setShowPemeriksaanForm(false);
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleSaveImunisasi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `IMU-${Date.now()}`;
    const data = {
      id,
      tenantId,
      balitaId: selectedBalita.id,
      namaBalita: selectedBalita.nama,
      tanggal: formData.get("tanggal") as string,
      jenisVaksin: formData.get("jenisVaksin") as string,
      booster: formData.get("booster") === "on",
      catatan: formData.get("catatan") as string,
      petugas: currentUser?.name || "Admin",
    };

    try {
      await setDoc(doc(db, "posyandu_imunisasi", id), data);
      showNotification("Data imunisasi berhasil dicatat!", "success");
      setShowImunisasiForm(false);
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleSaveIbuHamil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem ? editingItem.id : `HML-${Date.now()}`;
    const data = {
      id,
      tenantId,
      nik: formData.get("nik") as string,
      nama: formData.get("nama") as string,
      tglHPL: formData.get("tglHPL") as string,
      usiaKehamilan: parseFloat(formData.get("usiaKehamilan") as string) || 0,
      riwayatKesehatan: formData.get("riwayatKesehatan") as string,
      rt: formData.get("rt") as string,
      rw: formData.get("rw") as string,
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "ibu_hamil", id), data);
        showNotification("Data Ibu Hamil diperbarui!", "success");
      } else {
        await setDoc(doc(db, "ibu_hamil", id), data);
        showNotification("Data Ibu Hamil baru ditambahkan!", "success");
      }
      setShowIbuHamilForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleDeleteIbuHamil = async (id: string) => {
    if (!window.confirm("Hapus data ibu hamil ini?")) return;
    try {
      await deleteDoc(doc(db, "ibu_hamil", id));
      showNotification("Data berhasil dihapus", "success");
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleSavePosbindu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingPosbinduItem ? editingPosbinduItem.id : `PBD-${Date.now()}`;
    const data = {
      id,
      tenantId,
      nik: formData.get("nik") as string,
      nama: formData.get("nama") as string,
      tanggal: formData.get("tanggal") as string,
      berat: parseFloat(formData.get("berat") as string) || 0,
      tinggi: parseFloat(formData.get("tinggi") as string) || 0,
      tensi: formData.get("tensi") as string,
      gulaDarah: parseFloat(formData.get("gulaDarah") as string) || 0,
      kolesterol: parseFloat(formData.get("kolesterol") as string) || 0,
      catatan: formData.get("catatan") as string,
      petugas: currentUser?.name || "Admin",
    };

    try {
      if (editingPosbinduItem) {
        await updateDoc(doc(db, "posbindu_pemeriksaan", id), data);
        showNotification("Pemeriksaan diperbarui!", "success");
      } else {
        await setDoc(doc(db, "posbindu_pemeriksaan", id), data);
        showNotification("Pemeriksaan berhasil dicatat!", "success");
      }
      setShowPosbinduForm(false);
      setEditingPosbinduItem(null);
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  const handleDeletePosbindu = async (id: string) => {
    if (!window.confirm("Hapus catatan pemeriksaan ini?")) return;
    try {
      await deleteDoc(doc(db, "posbindu_pemeriksaan", id));
      showNotification("Pemeriksaan berhasil dihapus", "success");
    } catch (err) {
      handleFirestoreError(err);
    }
  };

  return (
    <div className="space-y-6 container mx-auto px-4 pb-20">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl">
              <Baby className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 dark:text-white">
                Layanan Posyandu Digital
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Pemantauan tumbuh kembang balita dan kesehatan ibu hamil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
             {[
               { id: "dashboard", label: "Status", icon: LayoutDashboard },
               { id: "balita", label: "Balita", icon: Baby },
               { id: "ibuhamil", label: "Ibu Hamil", icon: User },
               { id: "posbindu", label: "Posbindu", icon: HeartPulse },
               { id: "timeline", label: "Riwayat", icon: History },
             ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      activeSubTab === tab.id
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-100"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                )
             })}
          </div>
        </div>

        {activeSubTab === "dashboard" && (
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <div className="p-5 bg-rose-50/50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/50">
                 <div className="flex items-center gap-2 mb-2">
                    <Baby className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Total Balita</span>
                 </div>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">{balitaData.length}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Terdata di Wilayah</p>
              </div>

              <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 rounded-3xl border border-blue-100 dark:border-blue-900/50">
                 <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Ibu Hamil</span>
                 </div>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">{ibuHamilData.length}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Dalam Pantauan</p>
              </div>

              <div className="p-5 bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl border border-amber-100 dark:border-amber-900/50">
                 <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pemeriksaan</span>
                 </div>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">{pemeriksaanBalitaData.filter(p => p.tanggal.startsWith(new Date().toISOString().slice(0, 7))).length}</p>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">Bulan Berjalan</p>
              </div>

              <div className="p-5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-3xl border border-indigo-100 dark:border-indigo-900/50">
                 <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Status Giz</span>
                 </div>
                 <p className="text-2xl font-black text-slate-800 dark:text-white">Sangat Baik</p>
                 <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">Aplikasi Insight ✓</p>
              </div>
           </div>
        )}
      </div>

      {activeSubTab === "balita" && (
         <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama balita atau NIK orang tua..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-rose-500/5 outline-none transition-all"
                  />
               </div>
               {!isViewer && (
                 <div className="flex items-center gap-2">
                    <button 
                       onClick={() => fileInputRef.current?.click()}
                       className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all"
                    >
                       <Upload className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls" onChange={handleImportExcel} />
                    <button 
                       onClick={() => {setEditingItem(null); setShowBalitaForm(true);}}
                       className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                       <PlusCircle className="w-4 h-4" />
                       Tambah Balita
                    </button>
                 </div>
               )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredBalita
                 .filter(b => b.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || b.nik?.includes(searchQuery))
                 .map((balita) => (
                   <motion.div 
                     layout
                     key={balita.id}
                     className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-100/30 transition-all"
                   >
                      <div className="p-6">
                         <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
                               <Baby className="w-6 h-6 text-rose-500" />
                            </div>
                            <div className="flex items-center gap-1">
                               {!isViewer && (
                                 <>
                                   <button onClick={() => {setEditingItem(balita); setShowBalitaForm(true);}} className="p-2 text-slate-300 hover:text-blue-500"><Edit className="w-4 h-4"/></button>
                                   <button onClick={() => handleDeleteBalita(balita.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                 </>
                               )}
                            </div>
                         </div>
                         <h3 className="text-base font-black text-slate-800 dark:text-white">{balita.nama}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIK: {balita.nik}</p>
                         
                         <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Umur</p>
                               <p className="text-xs font-black text-slate-700 dark:text-slate-300">{calculateAgeInMonths(balita.tglLahir)} Bulan</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 uppercase tracking-tighter font-black">
                               <p className="text-[9px] font-black text-slate-400 uppercase">Gender</p>
                               <p className="text-xs font-black text-slate-700 dark:text-slate-300">{balita.jenisKelamin === "L" ? "LAKI-LAKI" : "PEREMPUAN"}</p>
                            </div>
                         </div>

                         <div className="flex items-center gap-2 mt-6">
                            {!isViewer && (
                               <>
                                 <button 
                                   onClick={() => {setSelectedBalita(balita); setShowPemeriksaanForm(true);}}
                                   className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100"
                                 >
                                    Ukur
                                 </button>
                                 <button 
                                   onClick={() => {setSelectedBalita(balita); setShowImunisasiForm(true);}}
                                   className="flex-1 py-3 bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100"
                                 >
                                    Vaksin
                                 </button>
                               </>
                            )}
                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100">
                               <ChevronRight className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </motion.div>
               ))}
            </div>
         </div>
      )}

      {activeSubTab === "ibuhamil" && (
         <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama ibu hamil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
               </div>
               {!isViewer && (
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fileInputRefIbuHamil.current?.click()}
                      className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRefIbuHamil} className="hidden" accept=".xlsx,.xls" onChange={handleImportIbuHamilExcel} />
                    <button 
                       onClick={() => {setEditingItem(null); setShowIbuHamilForm(true);}}
                       className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                       <PlusCircle className="w-4 h-4" />
                       Tambah Ibu Hamil
                    </button>
                 </div>
               )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredIbuHamil
                 .filter(i => i.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || i.nik?.includes(searchQuery))
                 .map((ibu) => (
                   <motion.div 
                     layout
                     key={ibu.id}
                     className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-100/30 transition-all"
                   >
                     <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                           <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-500" />
                           </div>
                           <div className="flex items-center gap-1">
                              {!isViewer && (
                                <>
                                  <button onClick={() => {setEditingItem(ibu); setShowIbuHamilForm(true);}} className="p-2 text-slate-300 hover:text-blue-500"><Edit className="w-4 h-4"/></button>
                                  <button onClick={() => handleDeleteIbuHamil(ibu.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </>
                              )}
                           </div>
                        </div>
                        <h3 className="text-base font-black text-slate-800 dark:text-white">{ibu.nama}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIK: {ibu.nik}</p>

                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 outline-none">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Usia Kehamilan</p>
                               <p className="text-xs font-black text-slate-700 dark:text-slate-300">{ibu.usiaKehamilan} Minggu</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HPL Estimasi</p>
                               <p className="text-xs font-black text-slate-700 dark:text-slate-300">{new Date(ibu.tglHPL).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 rounded-2xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-50 dark:border-blue-800/50">
                           <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Riwayat Kesehatan</p>
                           <p className="text-[11px] font-medium text-slate-500 line-clamp-2 italic">{ibu.riwayatKesehatan || "Tidak ada riwayat kesehatan khusus"}</p>
                        </div>
                     </div>
                   </motion.div>
                ))}
            </div>
         </div>
      )}

      {activeSubTab === "posbindu" && (
         <div className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Cari nama atau NIK Lansia/Umum..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-brand-blue/5 transition-all outline-none"
                  />
               </div>
               {!isViewer && (
                 <button 
                    onClick={() => {setEditingPosbinduItem(null); setShowPosbinduForm(true);}}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl"
                 >
                    <PlusCircle className="w-4 h-4" />
                    Catat Pemeriksaan
                 </button>
               )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                     <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama (NIK)</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tensi</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gula Darah</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kolesterol</th>
                           <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                           {!isViewer && <th className="p-5"></th>}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {filteredPosbindu
                          .filter(p => p.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || p.nik?.includes(searchQuery))
                          .sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                          .map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                             <td className="p-5 text-xs font-bold text-slate-500">{new Date(p.tanggal).toLocaleDateString()}</td>
                             <td className="p-5">
                                <p className="text-xs font-black text-slate-800 dark:text-white">{p.nama}</p>
                                <p className="text-[9px] font-bold text-slate-400">{p.nik}</p>
                             </td>
                             <td className="p-5 font-mono text-xs font-black">{p.tensi || "-"}</td>
                             <td className="p-5 font-mono text-xs font-black text-amber-600">{p.gulaDarah || "-"} mg/dL</td>
                             <td className="p-5 font-mono text-xs font-black text-rose-600">{p.kolesterol || "-"} mg/dL</td>
                             <td className="p-5">
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase">Normal</span>
                             </td>
                             {!isViewer && (
                               <td className="p-5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                     <button onClick={() => {setEditingPosbinduItem(p); setShowPosbinduForm(true);}} className="p-2 text-slate-300 hover:text-blue-500"><Edit className="w-4 h-4" /></button>
                                     <button onClick={() => handleDeletePosbindu(p.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               </td>
                             )}
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      )}

      {/* TIMELINE RIWAYAT VIEW - Simplified for common list */}
      {activeSubTab === "timeline" && (
         <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-8 text-center">Linimasa Pemeriksaan Balita</h3>
               <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {pemeriksaanBalitaData
                    .sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
                    .slice(0, 10)
                    .map((p) => (
                    <div key={p.id} className="relative pl-12">
                       <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-4 border-rose-50 flex items-center justify-center z-10">
                          <div className="w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-50" />
                       </div>
                       <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-black text-slate-800 dark:text-white">{p.namaBalita}</p>
                             <p className="text-[10px] font-bold text-slate-400">{new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</p>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                             <span className="text-rose-500">BB {p.berat}Kg</span>
                             <span className="text-blue-500">TB {p.tinggi}Cm</span>
                             <span className="text-emerald-500">Gizi: {p.statusGizi}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* --- MODALS --- */}

      {/* Add Balita Modal */}
      <AnimatePresence>
        {showBalitaForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60 transition-opacity">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50/50 dark:bg-rose-900/10">
                   <h3 className="text-lg font-black text-rose-800 dark:text-rose-400">Data Balita</h3>
                   <button onClick={() => setShowBalitaForm(false)}><X className="w-5 h-5 text-rose-400"/></button>
                </div>
                <form onSubmit={handleSaveBalita} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">Nama Lengkap</label>
                      <input name="nama" defaultValue={editingItem?.nama} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">NIK (Jika Ada)</label>
                      <input name="nik" defaultValue={editingItem?.nik} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                      <input name="tglLahir" type="date" defaultValue={editingItem?.tglLahir} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                      <select name="jenisKelamin" defaultValue={editingItem?.jenisKelamin || "L"} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm">
                         <option value="L">Laki-Laki</option>
                         <option value="P">Perempuan</option>
                      </select>
                   </div>
                   <div className="space-y-1 shadow-sm">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ibu</label>
                      <input name="namaIbu" defaultValue={editingItem?.namaIbu} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ayah</label>
                      <input name="namaAyah" defaultValue={editingItem?.namaAyah} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK Orang Tua</label>
                      <input name="nikOrangTua" defaultValue={editingItem?.nikOrangTua} placeholder="Wajib untuk mapping akun warga" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">RT</label>
                        <input name="rt" defaultValue={editingItem?.rt || "01"} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">RW</label>
                        <input name="rw" defaultValue={editingItem?.rw || "26"} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                      </div>
                   </div>
                   <button type="submit" className="md:col-span-2 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100">{editingItem ? "Update Balita" : "Simpan Balita"}</button>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Pemeriksaan Modal */}
      <AnimatePresence>
        {showPemeriksaanForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-900/10">
                   <h3 className="text-base font-black text-rose-800 dark:text-rose-400">Ukur Tumbuh Kembang</h3>
                   <p className="text-[9px] font-bold text-rose-600 uppercase tracking-[0.2em] mt-1">Pasien: {selectedBalita?.nama}</p>
                </div>
                <form onSubmit={handleSavePemeriksaan} className="p-8 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 shadow-sm transition-all focus:outline-none">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                         <input name="tanggal" type="date" required defaultValue={new Date().toISOString().split("T")[0]} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                      </div>
                      <div className="space-y-1 relative">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Berat (Kg)</label>
                         <input name="berat" type="number" step="0.1" required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm font-sans focus:outline-none" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 shadow-sm">
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tinggi (Cm)</label>
                         <input name="tinggi" type="number" step="0.1" required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lk (Cm)</label>
                         <input name="lingkarKepala" type="number" step="0.1" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                      </div>
                   </div>
                   <div className="space-y-1 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Gizi</label>
                      <select name="statusGizi" className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm outline-none">
                         <option value="Sangat Baik">Sangat Baik</option>
                         <option value="Baik">Baik</option>
                         <option value="Kurang">Kurang</option>
                         <option value="Stunting">Stunting / Perlu Atensi</option>
                      </select>
                   </div>
                   <button type="submit" className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-6 shadow-lg shadow-rose-100">Simpan Pemeriksaan</button>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* POSBINDU MODAL */}
       <AnimatePresence>
        {showPosbinduForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-900/10 shadow-sm">
                   <h3 className="text-base font-black text-emerald-800 dark:text-emerald-400">Cek Kesehatan Umum/Lansia</h3>
                   <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-1">Input Data Pemeriksaan Berkala</p>
                </div>
                <form onSubmit={handleSavePosbindu} className="p-8 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-hide">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Warga</label>
                      <input name="nama" defaultValue={editingPosbinduItem?.nama} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="space-y-1 relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK</label>
                      <input name="nik" defaultValue={editingPosbinduItem?.nik} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">Tanggal</label>
                        <input name="tanggal" type="date" defaultValue={editingPosbinduItem?.tanggal || new Date().toISOString().split("T")[0]} required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">TD (Tensi)</label>
                        <input name="tensi" defaultValue={editingPosbinduItem?.tensi} placeholder="120/80" required className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 shadow-sm">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gula Darah</label>
                        <input name="gulaDarah" type="number" defaultValue={editingPosbinduItem?.gulaDarah} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm" />
                      </div>
                      <div className="space-y-1 focus:outline-none">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 shadow-sm">Kolesterol</label>
                        <input name="kolesterol" type="number" defaultValue={editingPosbinduItem?.kolesterol} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm shadow-sm" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 outline-none">Catatan Medis</label>
                      <textarea name="catatan" defaultValue={editingPosbinduItem?.catatan} rows={2} className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-sm resize-none scrollbar-hide" />
                   </div>
                   <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 shadow-lg shadow-emerald-100">{editingPosbinduItem ? "Update Data" : "Simpan Catatan"}</button>
                </form>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
