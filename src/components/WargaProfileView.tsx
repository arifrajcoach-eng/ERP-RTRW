import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  UserPlus, 
  Edit, 
  RefreshCw, 
  FileText, 
  PlusCircle, 
  Download, 
  Printer, 
  Info, 
  CheckCircle, 
  X,
  Smartphone,
  Calendar,
  Shield,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  ArrowLeftRight,
  Baby,
  Heart,
  Scissors,
  Music,
  CreditCard,
  Home,
  Hammer,
  Gavel,
  GraduationCap,
  Briefcase,
  Flame,
  Globe,
  Trash2
} from 'lucide-react';
import { doc, setDoc, updateDoc, onSnapshot, query, where, collection, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { jsPDF } from 'jspdf';
import { MapPicker } from './MapPicker';

interface WargaProfileViewProps {
  wargaData: any;
  verifikasiData: any[];
  suratData?: any[];
  setSuratData: React.Dispatch<React.SetStateAction<any[]>>;
  setWargaAuth: any;
  tenantId: string;
  isLoadingDB: boolean;
  setIsLoadingDB: any;
  handleFileUpload: any;
  showNotification: any;
  handleFirestoreError: any;
  kopSettings: any;
  getSetting: any;
  usersData: any[];
  generateSuratHTML: any;
  settings: any;
}

export function WargaProfileView({ 
  wargaData, 
  verifikasiData, 
  suratData = [], 
  setSuratData, 
  setWargaAuth, 
  tenantId, 
  isLoadingDB, 
  setIsLoadingDB, 
  handleFileUpload, 
  showNotification, 
  handleFirestoreError, 
  kopSettings, 
  getSetting, 
  usersData, 
  generateSuratHTML, 
  settings 
}: WargaProfileViewProps) {
  const [activeCitizenTab, setActiveCitizenTab] = useState<'profil' | 'layanan' | 'riwayat'>('profil');
  const [uploadPct, setUploadPct] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(wargaData || {});
  const [sosHistory, setSosHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isProfileCalibrating, setIsProfileCalibrating] = useState(false);
  const [profileLat, setProfileLat] = useState<string>(wargaData?.latitude?.toString() || "");
  const [profileLng, setProfileLng] = useState<string>(wargaData?.longitude?.toString() || "");

  // Update profile coordinates when wargaData changes
  useEffect(() => {
    if (wargaData) {
      setProfileLat(wargaData.latitude?.toString() || "");
      setProfileLng(wargaData.longitude?.toString() || "");
      setFormData(wargaData);
    }
  }, [wargaData]);
  
  useEffect(() => {
    if (activeCitizenTab === 'riwayat' && tenantId) {
      setLoadingHistory(true);
      const qHistory = query(
        collection(db, 'emergency_logs'),
        where('tenantId', '==', tenantId)
      );
      
      const unsubscribe = onSnapshot(qHistory, (snapshot) => {
        const logs: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (
             data.userId === wargaData.id || 
             (wargaData.hp && data.userPhone === wargaData.hp) ||
             (wargaData.telepon && data.userPhone === wargaData.telepon) ||
             (wargaData.nama && data.userName === wargaData.nama)
          ) {
             logs.push({ id: doc.id, ...data });
          }
        });
        
        logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setSosHistory(logs);
        setLoadingHistory(false);
      }, (err) => {
        console.error("Error fetching SOS history:", err);
        setLoadingHistory(false);
      });
      
      return () => unsubscribe();
    }
  }, [activeCitizenTab, tenantId, wargaData]);

  const [files, setFiles] = useState<{ktp?: File, kk?: File}>({});
  const [uploading, setUploading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!wargaData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-blue rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-bold uppercase tracking-widest">Sinkronisasi Data Profil...</p>
      </div>
    );
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollToValue = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollContainerRef.current.scrollTo({ left: scrollToValue, behavior: 'smooth' });
    }
  };

  // States for E-Administrasi
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedLetterName, setSelectedLetterName] = useState<string | null>(null);
  const [formKeperluan, setFormKeperluan] = useState<string>("");
  const [formJenisKtpKk, setFormJenisKtpKk] = useState<string>("Surat pengantar pembuatan KTP");
  const [formNamaUsaha, setFormNamaUsaha] = useState<string>("");
  const [formJenisUsaha, setFormJenisUsaha] = useState<string>("");
  const [formAlamatUsaha, setFormAlamatUsaha] = useState<string>("");

  const [suratToDelete, setSuratToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleCloseModal = () => {
    setIsEditing(false);
    setFormData({});
    setFiles({});
  };

  const handleDeleteSurat = async () => {
    if (!suratToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'surat', suratToDelete.id));
      if (typeof setSuratData === 'function') {
        setSuratData((prev: any[]) => prev.filter((s: any) => s.id !== suratToDelete.id));
      }
      showNotification('Surat pengantar berhasil dihapus.', 'success');
      setSuratToDelete(null);
    } catch (err: any) {
      console.error("[WargaProfileView] Error deleting surat", err);
      handleFirestoreError(err, 'delete', 'surat');
    } finally {
      setIsDeleting(false);
    }
  };

  const activeSubmission = React.useMemo(() => {
    const matched = verifikasiData.filter(v => v.nik === wargaData.nik || (v.authUid && v.authUid === wargaData.authUid));
    if (matched.length === 0) return null;
    
    // 1. Prioritize pending submission
    const pending = matched.find(v => v.status === 'Menunggu Persetujuan');
    if (pending) return pending;
    
    // 2. Sort other submissions by submittedAt descending to return the newest one
    return [...matched].sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))[0];
  }, [verifikasiData, wargaData]);

  const currentData = activeSubmission || wargaData;
  const familyNiks = wargaData.listWargaInKK?.map((m: any) => m.nik).filter(Boolean) || [];
  const mySurat = suratData.filter(s => s.nik === wargaData.nik || (s.nik && familyNiks.includes(s.nik)));

  const getAutoNomorSurat = (rt: string, rw: string) => {
    const year = new Date().getFullYear();
    const lastCount = suratData.length + 1;
    const num = `${lastCount}`.padStart(3, '0');
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const month = romanMonths[new Date().getMonth()];
    return `${num}/RT.${rt}/RW.${rw}/${month}/${year}`;
  };

  const handleUpdateMandiri = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let ktpUrl = formData.ktpUrl || currentData.ktpUrl || "";
      let kkUrl = formData.kkUrl || currentData.kkUrl || "";

      if (files.ktp) {
        ktpUrl = await handleFileUpload(files.ktp, 'verifikasi_ktp');
      }
      if (files.kk) {
        kkUrl = await handleFileUpload(files.kk, 'verifikasi_kk');
      }

      const submissionId = `VERIF-${wargaData.nik}-${Date.now()}`;
      const payload = {
        id: submissionId,
        tenantId,
        nik: wargaData.nik,
        authUid: auth.currentUser?.uid || wargaData.authUid || "",
        nama: formData.nama !== undefined ? formData.nama : (currentData.nama || ""),
        kk: formData.kk !== undefined ? formData.kk : (currentData.kk || ""),
        hp: formData.hp !== undefined ? formData.hp : (currentData.hp || ""),
        blok: formData.blok !== undefined ? formData.blok : (currentData.blok || ""),
        alamat: formData.alamat !== undefined ? formData.alamat : (currentData.alamat || ""),
        rt: formData.rt !== undefined ? formData.rt : (currentData.rt || "01"),
        rw: formData.rw !== undefined ? formData.rw : (currentData.rw || "26"),
        agama: formData.agama !== undefined ? formData.agama : (currentData.agama || "Islam"),
        jk: formData.jk !== undefined ? formData.jk : (currentData.jk || ""),
        tempatLahir: formData.tempatLahir !== undefined ? formData.tempatLahir : (currentData.tempatLahir || ""),
        tglLahir: formData.tglLahir !== undefined ? formData.tglLahir : (currentData.tglLahir || ""),
        profesi: formData.profesi !== undefined ? formData.profesi : (currentData.profesi || ""),
        pendidikanTerakhir: formData.pendidikanTerakhir !== undefined ? formData.pendidikanTerakhir : (currentData.pendidikanTerakhir || ""),
        kawin: formData.kawin !== undefined ? formData.kawin : (currentData.kawin || ""),
        posisi: formData.posisi !== undefined ? formData.posisi : (currentData.posisi || ""),
        kewarganegaraan: formData.kewarganegaraan !== undefined ? formData.kewarganegaraan : (currentData.kewarganegaraan || "WNI"),
        email: formData.email !== undefined ? formData.email : (currentData.email || ""),
        kelurahan: formData.kelurahan !== undefined ? formData.kelurahan : (currentData.kelurahan || ""),
        kecamatan: formData.kecamatan !== undefined ? formData.kecamatan : (currentData.kecamatan || ""),
        kabupaten: formData.kabupaten !== undefined ? formData.kabupaten : (currentData.kabupaten || ""),
        ktpUrl,
        kkUrl,
        submittedAt: new Date().toISOString(),
        status: 'Menunggu Persetujuan'
      };

      await setDoc(doc(db, 'verifikasi_warga', submissionId), payload);
      showNotification("Pengajuan pembaruan data berhasil dikirim. Menunggu verifikasi admin.", "success");
      setFormData({});
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, 'create', 'verifikasi_warga');
      showNotification("Gagal mengirim pengajuan.", "error");
    } finally {
      setUploading(false);
    }
  };

  const generateMySuratPDF = (item: any) => {
    if (!wargaData?.terverifikasi) {
        showNotification('Surat tidak dapat dicetak: Identitas belum terverifikasi oleh Admin.', 'error');
        return;
    }
    
    const hasKopSettings = kopSettings && Object.keys(kopSettings).length > 0;
    const kop = hasKopSettings ? kopSettings : (getSetting("KOP_SURAT") || {});
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification("Gagal membuka jendela cetak. Pastikan popup tidak diblokir.", "error");
      return;
    }

    const mappedSurat = {
      ...item,
      jenisSurat: item.jenis,
      nomor_surat: item.nomorSurat || item.nomor_surat,
      jk: item.jenisKelamin || item.jk || wargaData.jk || wargaData.jenisKelamin || "-",
      pekerjaan: item.pekerjaan || wargaData.profesi || "-",
      statusKawin: item.statusKawin || wargaData.kawin || wargaData.statusKawin || "-",
      keperluan: item.keterangan || item.keperluan || "-",
    };

    const content = generateSuratHTML(mappedSurat, kop, settings);
    printWindow.document.write(content);
    printWindow.document.close();
    showNotification("Pratinjau cetak terbuka di tab baru", "info");
  };

  const handleRequestSurat = (jenisId: string, name: string) => {
    setSelectedLetter(jenisId);
    setSelectedLetterName(name);
    setFormKeperluan("");
    setFormJenisKtpKk("Surat pengantar pembuatan KTP");
    setFormNamaUsaha("");
    setFormJenisUsaha("");
    setFormAlamatUsaha(wargaData.blok || wargaData.alamat || "");
  };

  const handleFormSubmitSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingDB(true);
    try {
      const id = `SRT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const nowStr = new Date().toISOString();
      
      let selectedJenisSurat = selectedLetterName || "Surat Pengantar";
      let finalKeterangan = formKeperluan;

      if (selectedLetter === 'ktp') {
        selectedJenisSurat = formJenisKtpKk;
      } else if (selectedLetter === 'usaha') {
        selectedJenisSurat = "Surat keterangan usaha (SKU)";
        finalKeterangan = `Nama Usaha: ${formNamaUsaha}, Jenis Sektor: ${formJenisUsaha}, Alamat Usaha: ${formAlamatUsaha}. Keperluan: ${formKeperluan}`;
      }

      const normalizeRtVal = (rtVal: any): string => {
        const rtStr = (rtVal || "").toString();
        const match = rtStr.match(/rt\s*(\d+)/i) || rtStr.match(/\d+/);
        const num = match ? match[1] || match[0] : rtStr;
        return num ? num.replace(/^0+/, "").padStart(2, "0") : "01";
      };
      const normalizeRwVal = (rwVal: any): string => {
        const rwStr = (rwVal || "").toString();
        const match = rwStr.match(/rw\s*(\d+)/i) || rwStr.match(/\d+/);
        const num = match ? match[1] || match[0] : rwStr;
        return num ? num.replace(/^0+/, "").padStart(2, "0") : "26";
      };

      const rtNorm = normalizeRtVal(wargaData.rt);
      const rwNorm = normalizeRwVal(wargaData.rw);

      const payload = {
        id,
        tenantId,
        rt: rtNorm,
        rw: rwNorm,
        tanggal: nowStr,
        createdAt: nowStr,
        jenis: selectedJenisSurat,
        pemohon: wargaData.nama,
        nik: wargaData.nik,
        kk: wargaData.kk || "",
        alamat: wargaData.blok || wargaData.alamat || "-",
        kelurahan: wargaData.kelurahan || "",
        kecamatan: wargaData.kecamatan || "",
        kota: wargaData.kabupaten || "",
        phone: wargaData.hp || "",
        email: wargaData.email || "",
        tempatLahir: wargaData.tempatLahir || "",
        tglLahir: wargaData.tglLahir || "",
        ttl: `${wargaData.tempatLahir}, ${wargaData.tglLahir}`,
        agama: wargaData.agama || "",
        jenisKelamin: wargaData.jk || wargaData.jenisKelamin || "",
        kewarganegaraan: wargaData.kewarganegaraan || "WNI",
        pendidikan: wargaData.pendidikanTerakhir || "",
        pekerjaan: wargaData.profesi || "",
        statusKawin: wargaData.kawin || wargaData.statusKawin || "",
        posisiKeluarga: wargaData.posisi || "",
        status: 'Menunggu Persetujuan RT',
        keterangan: finalKeterangan,
        userId: wargaData.authUid || auth.currentUser?.uid || wargaData.uid || wargaData.id_user || null,
        authUid: wargaData.authUid || auth.currentUser?.uid || wargaData.uid || wargaData.id_user || null,
        nomorSurat: getAutoNomorSurat(rtNorm, rwNorm)
      };

      await setDoc(doc(db, 'surat', id), payload);
      setSuratData((prev: any) => [payload, ...prev]);
      showNotification("Permohonan surat berhasil dikirim.", "success");
      setSelectedLetter(null);
    } catch (err) {
      handleFirestoreError(err, 'create', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
       {/* Sidebar Citizen */}
      <div className="w-full md:w-96 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-48 h-48 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-blue/10 transition-colors"></div>
         
         <div className="p-10 pb-6 flex flex-col items-center text-center relative z-10">
            <div className="relative mb-8 group/avatar">
               <div className="w-32 h-32 rounded-[3.5rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-700 group-hover/avatar:scale-105 group-hover/avatar:rotate-3">
                  {currentData.ktpUrl || currentData.foto ? (
                     <img src={currentData.ktpUrl || currentData.foto} className="w-full h-full object-cover" />
                  ) : (
                     <User className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                  )}
               </div>
               {wargaData.terverifikasi && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl"
                  >
                     <ShieldCheck className="w-5 h-5" />
                  </motion.div>
               )}
            </div>
            
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight uppercase tracking-tight font-elegant drop-shadow-sm">{wargaData.nama}</h2>
               <div className="flex flex-wrap items-center justify-center gap-3">
                  {wargaData.terverifikasi ? (
                     <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> Identity Verified
                     </span>
                  ) : (
                     <span className="bg-amber-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending Approval
                     </span>
                  )}
               </div>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-mono mt-4">NIK: {wargaData.nik}</p>
            </div>
            
            <div className="mt-12 w-full space-y-3 pb-8 border-b border-slate-100 dark:border-slate-800">
               {[
                 { id: 'profil', label: 'Dashboard Utama', icon: User, gradient: 'from-brand-blue to-indigo-600' },
                 { id: 'layanan', label: 'E-Administrasi', icon: FileText, gradient: 'from-purple-600 to-pink-600' },
                 { id: 'riwayat', label: 'Riwayat Aktivitas', icon: Clock, gradient: 'from-amber-500 to-orange-600' }
               ].map((item) => (
                <motion.button 
                   key={item.id}
                   whileHover={{ x: 5, scale: 1.01 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => setActiveCitizenTab(item.id as any)} 
                   className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 relative overflow-hidden ${
                     activeCitizenTab === item.id 
                       ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl` 
                       : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                   }`}
                >
                   <item.icon className="w-5 h-5" /> 
                   {item.label}
                </motion.button>
               ))}
            </div>
         </div>

         <div className="mt-auto p-10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setWargaAuth(null)} 
              className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all border border-rose-100 dark:border-rose-500/20 shadow-lg shadow-rose-200/20 dark:shadow-none"
            >
               Keluar Sesi
            </motion.button>
         </div>
      </div>

       {/* Content Citizen */}
       <div className="flex-1 overflow-y-auto p-4 md:p-12">
          <AnimatePresence mode="wait">
              {activeCitizenTab === 'profil' && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                       <div>
                         <h1 className="text-[2.5rem] font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-elegant leading-none">Dashboard Personal</h1>
                         <div className="flex items-center gap-2 mt-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue"></div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Profil Terdaftar di Node: {wargaData.rt || '01'}</p>
                         </div>
                       </div>
                       <motion.button 
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                             setFormData(currentData);
                             setIsEditing(true);
                          }}
                          className="flex items-center gap-4 px-8 py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] text-white hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 group"
                       >
                          <Edit className="w-5 h-5 group-hover:rotate-12 transition-transform" /> 
                          Pembaruan Berkas
                       </motion.button>
                    </div>
 
                    <AnimatePresence>
                      {activeSubmission && activeSubmission.status === 'Menunggu Persetujuan' && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-8 rounded-[3.5rem] flex items-start gap-6 shadow-2xl shadow-amber-200/20 dark:shadow-none"
                         >
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl text-amber-500 shadow-xl shrink-0">
                               <RefreshCw className="w-8 h-8 animate-spin-slow" />
                            </div>
                            <div>
                               <h4 className="font-black text-amber-800 dark:text-amber-400 uppercase tracking-tight text-xl">Sinkronisasi Dalam Antrean</h4>
                               <p className="text-sm text-amber-600/80 dark:text-amber-500 font-bold mt-1 leading-relaxed">Pengajuan revisi profil Anda ({new Date(activeSubmission.submittedAt).toLocaleDateString()}) sedang dalam proses verifikasi otoritas RT/RW. Beberapa fitur mungkin terbatas sementara.</p>
                            </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-bold">
                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-100 dark:border-slate-700/50 shadow-2xl shadow-slate-200/30 dark:shadow-none space-y-8 relative overflow-hidden group"
                       >
                          <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="w-12 h-12 bg-brand-blue/10 rounded-2xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-brand-blue" />
                             </div>
                             <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.3em]">Data Otentikasi</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-8 relative z-10">
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap Sesuai KTP</label>
                                <p className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight font-elegant">{wargaData.nama}</p>
                             </div>
                             <div className="grid grid-cols-2 gap-8">
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tempat Lahir</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase">{wargaData.tempatLahir || '-'}</p>
                                </div>
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tanggal Lahir</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{wargaData.tglLahir || '-'}</p>
                                </div>
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Pekerjaan / Bidang Usaha</label>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{wargaData.profesi || '-'}</p>
                             </div>
                          </div>
                       </motion.div>
 
                       <motion.div 
                         whileHover={{ y: -5 }}
                         className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[4rem] border border-slate-100 dark:border-slate-700/50 shadow-2xl shadow-slate-200/30 dark:shadow-none space-y-8 relative overflow-hidden group"
                       >
                          <div className="absolute -right-8 -top-8 w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-pink-500" />
                             </div>
                             <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.3em]">Geospasial & Kontak</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-8 relative z-10">
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Alamat / ID Blok</label>
                                <p className="text-lg font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{wargaData.blok || wargaData.alamat || '-'}</p>
                             </div>
                             <div className="grid grid-cols-3 gap-8">
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rukun Tetangga (RT)</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300">RT {wargaData.rt || '-'}</p>
                                </div>
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Rukun Warga (RW)</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300">RW {wargaData.rw || '-'}</p>
                                </div>
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">GSM Protocol</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300 tabular-nums">{wargaData.hp || '-'}</p>
                                </div>
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Identification Number (KK)</label>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-300 font-mono tracking-widest">{wargaData.kk || '-'}</p>
                              </div>
                              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Koordinat Rumah (GPS SOS)</label>
                                 {wargaData.latitude && wargaData.longitude ? (
                                    <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                       {parseFloat(wargaData.latitude).toFixed(6)}, {parseFloat(wargaData.longitude).toFixed(6)}
                                    </p>
                                 ) : (
                                    <p className="text-xs font-bold text-rose-500 flex items-center gap-1 uppercase italic tracking-wide">
                                       <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                       Lokasi Belum Dikalibrasi (Geser Pin Peta)
                                    </p>
                                 )}
                                 <button
                                    type="button"
                                    onClick={() => setIsProfileCalibrating(true)}
                                    className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-450 border border-slate-200 dark:border-slate-750 rounded-xl text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all"
                                 >
                                    <MapPin className="w-3.5 h-3.5" />
                                    {wargaData.latitude ? "Atur Ulang Lokasi" : "Kalibrasi Lokasi"}
                                 </button>
                             </div>
                          </div>
                       </motion.div>
                    </div>
                 </motion.div>
              )}

             {activeCitizenTab === 'layanan' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-12">
                   <div>
                      <h1 className="text-[2.5rem] font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-elegant leading-none">E-Administrasi</h1>
                      <p className="text-slate-500 font-bold mt-4 max-w-lg leading-relaxed">Pilih jenis persuratan yang Anda butuhkan. Sistem akan memproses data Anda secara otomatis ke otoritas RT/RW.</p>
                   </div>

                    <div className="relative group/scroll">
                      {/* Navigation Buttons */}
                      <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-20 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 pointer-events-none">
                         <motion.button 
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                           onClick={() => scroll('left')}
                           className="w-12 h-12 bg-white dark:bg-slate-800 shadow-2xl rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 pointer-events-auto hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                         >
                            <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                         </motion.button>
                      </div>
                      
                      <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-20 opacity-0 group-hover/scroll:opacity-100 transition-all duration-300 pointer-events-none">
                         <motion.button 
                           whileHover={{ scale: 1.1 }}
                           whileTap={{ scale: 0.9 }}
                           onClick={() => scroll('right')}
                           className="w-12 h-12 bg-white dark:bg-slate-800 shadow-2xl rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 pointer-events-auto hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                         >
                            <ChevronRight className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                         </motion.button>
                      </div>

                      <div ref={scrollContainerRef} className="flex overflow-x-auto pb-10 gap-6 snap-x no-scrollbar scroll-smooth px-4 -mx-4">
                        {[
                           { id: 'ktp', name: 'PENGANTAR KTP/KK', icon: UserPlus, color: 'bg-blue-50 text-blue-600' },
                           { id: 'domisili', name: 'KET. DOMISILI', icon: MapPin, color: 'bg-rose-50 text-rose-600' },
                           { id: 'skck', name: 'PENGANTAR SKCK', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-600' },
                           { id: 'sktm', name: 'SUKET. TIDAK MAMPU', icon: FileText, color: 'bg-amber-50 text-amber-600' },
                           { id: 'usaha', name: 'SUKET. USAHA', icon: PlusCircle, color: 'bg-indigo-50 text-indigo-600' },
                           { id: 'pindah', name: 'PENGANTAR PINDAH', icon: ArrowLeftRight, color: 'bg-cyan-50 text-cyan-600' },
                           { id: 'kelahiran', name: 'AKTA KELAHIRAN', icon: Baby, color: 'bg-pink-50 text-pink-600' },
                           { id: 'kematian', name: 'AKTA KEMATIAN', icon: Flame, color: 'bg-slate-100 text-slate-600' },
                           { id: 'nikah', name: 'PENGANTAR NIKAH', icon: Heart, color: 'bg-red-50 text-red-500' },
                           { id: 'cerai', name: 'SURAT CERAI', icon: Scissors, color: 'bg-gray-100 text-gray-500' },
                           { id: 'keramaian', name: 'IZIN KERAMAIAN', icon: Music, color: 'bg-violet-50 text-violet-600' },
                           { id: 'npwp', name: 'PENGANTAR NPWP', icon: CreditCard, color: 'bg-blue-50 text-blue-700' },
                           { id: 'domisiliusaha', name: 'DOMISILI USAHA', icon: Globe, color: 'bg-teal-50 text-teal-600' },
                           { id: 'penghasilan', name: 'SUKET. PENGHASILAN', icon: CreditCard, color: 'bg-green-50 text-green-600' },
                           { id: 'properti', name: 'SURAT KEPEMILIKAN', icon: Home, color: 'bg-orange-50 text-orange-600' },
                           { id: 'imb', name: 'PENGANTAR IMB', icon: Hammer, color: 'bg-yellow-50 text-yellow-700' },
                           { id: 'renovasi', name: 'IZIN RENOVASI', icon: Hammer, color: 'bg-stone-100 text-stone-600' },
                           { id: 'sengketa', name: 'TIDAK SENGKETA', icon: Gavel, color: 'bg-red-50 text-red-700' },
                           { id: 'beasiswa', name: 'KET. BEASISWA', icon: GraduationCap, color: 'bg-sky-50 text-sky-600' },
                           { id: 'sekolah', name: 'KETERANGAN SEKOLAH', icon: GraduationCap, color: 'bg-blue-50 text-blue-500' },
                           { id: 'magang', name: 'KET. MAGANG/KERJA', icon: Briefcase, color: 'bg-emerald-50 text-emerald-700' }
                        ].map(item => (
                           <motion.button 
                             key={item.id} 
                             whileHover={{ y: -8, scale: 1.02 }}
                             whileTap={{ scale: 0.98 }}
                             onClick={() => handleRequestSurat(item.id, item.name)} 
                             className="flex-shrink-0 w-64 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border-2 border-white dark:border-slate-800 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] hover:shadow-2xl hover:border-brand-blue/10 transition-all text-center flex flex-col items-center gap-6 group relative overflow-hidden snap-center"
                           >
                              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 shadow-sm group-hover:rotate-6 ${item.color}`}>
                                 <item.icon className="w-8 h-8" />
                              </div>
                              <div className="relative z-10 flex flex-col items-center">
                                 <h4 className="font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight group-hover:text-brand-blue transition-colors text-[15px] leading-tight min-h-[44px] flex items-center text-center">{item.name}</h4>
                                 <p className="text-[10px] text-brand-blue mt-2 uppercase font-black tracking-widest opacity-80 group-hover:opacity-100 transition-all">Ajukan Surat</p>
                              </div>
                           </motion.button>
                        ))}
                      </div>
                      
                      {/* Scroll Hint */}
                      <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                         <span>Geser untuk kategori lainnya</span>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-100"></div>
                         </div>
                      </div>
                   </div>

                   {/* Riwayat Pengajuan Surat */}
                   <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                      <div>
                         <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant">Riwayat Pengajuan Surat Anda</h2>
                         <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-wider">Lacak status persetujuan surat pengantar mandiri secara live</p>
                      </div>

                      {mySurat.length === 0 ? (
                         <div className="p-12 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600">
                               <FileText className="w-8 h-8" />
                            </div>
                            <div>
                               <p className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tight text-sm">Belum ada permohonan surat</p>
                               <p className="text-xs text-slate-400 mt-1 dark:text-slate-500 font-medium">Surat yang Anda ajukan di atas akan muncul di sini.</p>
                            </div>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 gap-6">
                            {mySurat.map((item: any) => {
                               let statusColor = "bg-amber-50 text-amber-500 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                               if (item.status === 'Selesai') {
                                  statusColor = "bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                               } else if (item.status === 'Ditolak') {
                                  statusColor = "bg-rose-50 text-rose-500 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
                               } else if (item.status === 'Menunggu Persetujuan RW' || item.status === 'Menunggu Persetujuan') {
                                  statusColor = "bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
                               }
                               
                               return (
                                  <div 
                                     key={item.id}
                                     className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
                                  >
                                     <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                           <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusColor}`}>
                                              {item.status}
                                           </span>
                                           <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest font-mono">
                                              No: {item.nomorSurat || item.nomor_surat || "Belum ada nomor"}
                                           </span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">{item.jenis || item.jenisSurat || 'Surat Pengantar'}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                                           <div>
                                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tanggal:</span>{" "}
                                              <span className="font-extrabold text-slate-650 dark:text-slate-300">{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                           </div>
                                           {item.keterangan && (
                                              <div className="col-span-1 md:col-span-2 mt-2">
                                                 <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Keperluan/Keterangan:</span>
                                                 <p className="text-slate-600 dark:text-slate-300 font-bold text-sm bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl italic">
                                                    "{item.keterangan}"
                                                 </p>
                                              </div>
                                           )}
                                           {item.catatan && (
                                              <div className="col-span-1 md:col-span-2 mt-2">
                                                 <span className="text-rose-450 font-bold uppercase tracking-wider text-[10px] block mb-0.5">Catatan Penolakan/Otoritas:</span>
                                                 <p className="text-rose-600 dark:text-rose-400 font-bold text-sm bg-rose-50/40 dark:bg-rose-500/5 p-4 rounded-2xl italic border border-rose-100/50 dark:border-rose-500/10">
                                                    "{item.catatan}"
                                                 </p>
                                              </div>
                                           )}
                                        </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-3 shrink-0 flex-wrap md:flex-nowrap">
                                        {item.status === 'Selesai' && (
                                           <button
                                              onClick={() => generateMySuratPDF(item)}
                                              className="flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                                              title="Cetak Surat"
                                           >
                                              <Printer className="w-4 h-4" /> Cetak Surat
                                           </button>
                                        )}
                                        <button
                                           onClick={() => setSuratToDelete(item)}
                                           className="flex items-center justify-center gap-2 px-6 py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/40 border border-rose-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                                           title="Hapus Permohonan"
                                        >
                                           <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-450" /> Hapus
                                        </button>
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      )}
                   </div>
                </motion.div>
             )}
             {activeCitizenTab === 'riwayat' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-12">
                   <div>
                      <h1 className="text-[2.5rem] font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase font-elegant leading-none">Riwayat Aktivitas</h1>
                      <p className="text-slate-500 font-bold mt-4 max-w-lg leading-relaxed">Catatan riwayat sinyal darurat (SOS) dan aktivitas esensial lainnya yang terhubung dengan akun Anda.</p>
                   </div>
                   
                   <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[300px]">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                         </div>
                         <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Log Sinyal Darurat (SOS)</h3>
                      </div>
                      
                      {loadingHistory ? (
                         <div className="flex justify-center items-center h-48 opacity-50">
                            <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                         </div>
                      ) : sosHistory.length > 0 ? (
                         <div className="space-y-4">
                            {sosHistory.map((log) => (
                               <div key={log.id} className="p-5 border border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group hover:border-amber-200 dark:hover:border-amber-900/50 transition-all">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-3 h-3 rounded-full ${log.status === 'pending' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                     <div>
                                        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                                           {log.status === 'pending' ? 'Sos Aktif' : 'Telah Ditangani'}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{new Date(log.timestamp).toLocaleString('id-ID')}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     {log.status === 'resolved' && (
                                        <>
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ditangani Oleh</p>
                                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{log.resolvedBy || '-'}</p>
                                        </>
                                     )}
                                  </div>
                               </div>
                            ))}
                         </div>
                      ) : (
                         <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center mb-4">
                               <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Tidak ada riwayat SOS</p>
                            <p className="text-[10px] text-slate-500 font-bold mt-2 max-w-xs leading-relaxed">Kondisi aman, Anda belum pernah memicu sinyal darurat SOS melalui tombol panik.</p>
                         </div>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

        {/* Modal Konfirmasi Hapus Surat (Warga) */}
         <AnimatePresence>
            {suratToDelete && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div 
                     initial={{ opacity: 0 }} 
                     animate={{ opacity: 1 }} 
                     exit={{ opacity: 0 }} 
                     onClick={() => setSuratToDelete(null)} 
                     className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                  />
                  <motion.div 
                     initial={{ scale: 0.95, opacity: 0 }} 
                     animate={{ scale: 1, opacity: 1 }} 
                     exit={{ scale: 0.95, opacity: 0 }} 
                     className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-8 text-center"
                  >
                     <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Trash2 className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant mb-3">Hapus Permohonan Surat?</h3>
                     <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed mb-8">
                        Apakah Anda yakin ingin menghapus permohonan surat <strong>{suratToDelete ? (suratToDelete.jenis || suratToDelete.jenisSurat || 'Surat Pengantar') : 'Surat Pengantar'}</strong> ini? Tindakan ini tidak dapat dibatalkan dan data akan permanen terhapus dari sistem RT/RW.
                     </p>
                     <div className="flex gap-4">
                        <button
                           type="button"
                           onClick={() => setSuratToDelete(null)}
                           className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors font-extrabold"
                        >
                           Batal
                        </button>
                        <button
                           type="button"
                           disabled={isDeleting}
                           onClick={handleDeleteSurat}
                           className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 font-extrabold"
                        >
                           {isDeleting ? "Menghapus..." : "Ya, Hapus"}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

        {/* Modal Request Surat Baru */}
        <AnimatePresence>
           {selectedLetter && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLetter(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                 <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                       <div>
                          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant">Formulir Layanan Mandiri</h2>
                          <p className="text-xs text-brand-blue font-bold tracking-widest uppercase mt-1">Layanan: {selectedLetterName}</p>
                       </div>
                       <button onClick={() => setSelectedLetter(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 dark:text-slate-500"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleFormSubmitSurat} className="p-8 overflow-y-auto space-y-6">
                       
                       {/* Section: Validasi Data Otomatis */}
                       <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-150 dark:border-slate-800 space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Sertifikasi & Otentikasi Pemohon</label>
                          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                             <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Nama Pemohon</span>
                                <span className="uppercase">{wargaData.nama}</span>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">NIK</span>
                                <span className="font-mono">{wargaData.nik}</span>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">Alamat Sesuai KTP</span>
                                <span>{wargaData.blok || wargaData.alamat || "-"}</span>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">RT</span>
                                <span>RT {wargaData.rt || '01'}</span>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">RW</span>
                                <span>RW {wargaData.rw || '26'}</span>
                             </div>
                          </div>
                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Identifikasi warga sinkron dengan sistem rtrw secara live.</p>
                          </div>
                       </div>

                       {/* Section: Dynamic Input Fields */}
                       
                       {selectedLetter === 'ktp' && (
                          <div className="space-y-4">
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Jenis Surat Pengantar</label>
                                <select 
                                   value={formJenisKtpKk} 
                                   onChange={e => setFormJenisKtpKk(e.target.value)} 
                                   className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-slate-800 dark:text-slate-200"
                                >
                                   <option value="Surat pengantar pembuatan KTP">Surat pengantar pembuatan KTP</option>
                                   <option value="Surat pengantar pembuatan KK">Surat pengantar pembuatan KK</option>
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Tujuan / Alasan Pembuatan (Keperluan)</label>
                                <textarea 
                                   required
                                   value={formKeperluan}
                                   onChange={e => setFormKeperluan(e.target.value)}
                                   placeholder="Contoh: Keperluan cetak KTP baru karena hilang / baru menginjak usia 17 tahun" 
                                   className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px] text-slate-800 dark:text-slate-200"
                                />
                             </div>
                          </div>
                       )}

                       {selectedLetter === 'domisili' && (
                          <div>
                             <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Maksud / Keperluan Surat Keterangan Domisili</label>
                             <textarea 
                                required
                                value={formKeperluan}
                                onChange={e => setFormKeperluan(e.target.value)}
                                placeholder="Contoh: Persyaratan pembukaan rekening Bank Mandiri / Melamar pekerjaan di PT Astra" 
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px] text-slate-800 dark:text-slate-200"
                             />
                          </div>
                       )}

                       {selectedLetter === 'skck' && (
                          <div>
                             <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Keperluan Pembuatan SKCK</label>
                             <textarea 
                                required
                                value={formKeperluan}
                                onChange={e => setFormKeperluan(e.target.value)}
                                placeholder="Contoh: Keperluan melamar pekerjaan sebagai PNS / Melamar kerja swasta" 
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px] text-slate-800 dark:text-slate-200"
                             />
                          </div>
                       )}

                       {selectedLetter === 'sktm' && (
                          <div>
                             <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Keperluan Surat Keterangan Tidak Mampu (SKTM)</label>
                             <textarea 
                                required
                                value={formKeperluan}
                                onChange={e => setFormKeperluan(e.target.value)}
                                placeholder="Contoh: Keperluan beasiswa studi anak sekolah / Keringanan biaya rumah sakit" 
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px] text-slate-800 dark:text-slate-200"
                             />
                          </div>
                       )}

                       {selectedLetter === 'usaha' && (
                          <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Nama Usaha / Toko</label>
                                   <input 
                                      type="text" 
                                      required
                                      value={formNamaUsaha}
                                      onChange={e => setFormNamaUsaha(e.target.value)}
                                      placeholder="Contoh: Toko Kelontong Suka Maju" 
                                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-slate-800 dark:text-slate-200" 
                                   />
                                </div>
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Sektor / Jenis Usaha</label>
                                   <input 
                                      type="text" 
                                      required
                                      value={formJenisUsaha}
                                      onChange={e => setFormJenisUsaha(e.target.value)}
                                      placeholder="Contoh: Perdagangan Kelontong / Kedai Makanan" 
                                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-slate-800 dark:text-slate-200" 
                                   />
                                </div>
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Alamat Lokasi Tempat Usaha</label>
                                <input 
                                   type="text" 
                                   required
                                   value={formAlamatUsaha}
                                   onChange={e => setFormAlamatUsaha(e.target.value)}
                                   placeholder="Contoh: Ruko Katala Baru Blok K12 No 2" 
                                   className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none text-slate-800 dark:text-slate-200" 
                                />
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Keperluan Pembuatan SKU</label>
                                <textarea 
                                   required
                                   value={formKeperluan}
                                   onChange={e => setFormKeperluan(e.target.value)}
                                   placeholder="Contoh: Persyaratan pengajuan kredit usaha mikro (KUR) di Bank Mandiri" 
                                   className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-850 dark:border-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-brand-blue outline-none min-h-[100px] text-slate-800 dark:text-slate-200"
                                />
                             </div>
                          </div>
                       )}

                       <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4 shrink-0 font-bold">
                          <button type="button" onClick={() => setSelectedLetter(null)} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-450 hover:text-slate-700 dark:hover:text-slate-200 transition-all">Batal</button>
                          <button type="submit" disabled={isLoadingDB} className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/20 hover:bg-brand-blue-dark transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 font-black">
                             {isLoadingDB ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                             ) : (
                                <CheckCircle className="w-4 h-4" />
                             )}
                             Kirim Pengajuan Surat
                          </button>
                       </div>
                    </form>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

        {/* Modal Kalibrasi GPS Mandiri */}
        <AnimatePresence>
           {isProfileCalibrating && (
              <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileCalibrating(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                 <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    exit={{ scale: 0.95, opacity: 0 }} 
                    className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-6 border border-slate-100 dark:border-slate-850 flex flex-col gap-4 text-slate-800 dark:text-slate-100 animate-fade-in"
                 >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-rose-500 animate-pulse" />
                           </div>
                           <div>
                              <h3 className="text-base font-black text-slate-850 dark:text-white uppercase tracking-tight">Kalibrasi Lokasi Rumah</h3>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Penetapan koordinat untuk pengiriman SOS</p>
                           </div>
                        </div>
                        <button onClick={() => setIsProfileCalibrating(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer">
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     <div className="text-[11px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold uppercase tracking-wide bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
                        📌 **Sangat Penting**: Peta interaktif di bawah dapat disesuaikan secara manual. Geser pin merah/ketuk peta pada area rumah Anda yang sebenarnya agar Satpam / Petugas dapat mengetahui arah yang tepat jika terjadi darurat.
                     </div>

                     <div className="font-bold">
                        <MapPicker 
                           lat={parseFloat(profileLat) || -6.1843} 
                           lng={parseFloat(profileLng) || 106.7975} 
                           onChange={(newLat, newLng) => {
                             setProfileLat(newLat.toString());
                             setProfileLng(newLng.toString());
                           }}
                        />
                     </div>

                     <div className="flex gap-2 font-black mt-2">
                        <button
                           type="button"
                           onClick={async () => {
                             if (!profileLat || !profileLng) {
                               alert("Harap tentukan lokasi Anda pada peta terlebih dahulu!");
                               return;
                             }
                             const latVal = parseFloat(profileLat);
                             const lngVal = parseFloat(profileLng);

                             try {
                               // Save to local storage for instant access
                               localStorage.setItem("custom_sos_lat", profileLat.trim());
                               localStorage.setItem("custom_sos_lng", profileLng.trim());

                               // Update Doc in data_warga
                               const targetId = wargaData.docId || wargaData.id;
                               if (targetId) {
                                 await updateDoc(doc(db, "data_warga", targetId), {
                                   latitude: latVal,
                                   longitude: lngVal
                                 });
                               }

                               // Update Doc in user account
                               if (auth.currentUser?.uid) {
                                 await updateDoc(doc(db, "users", auth.currentUser.uid), {
                                   latitude: latVal,
                                   longitude: lngVal
                                 });
                               }

                               showNotification("Kalibrasi koordinat rumah berhasil disimpan!", "success");
                               setIsProfileCalibrating(false);
                             } catch (err) {
                               console.error("Failed to update calibrated profile GPS:", err);
                               alert("Gagal memperbarui koordinat. Pastikan koneksi atau izin server Anda aktif.");
                             }
                           }}
                           className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs uppercase tracking-wider text-center border-none cursor-pointer transition-colors font-bold"
                        >
                           Simpan Lokasi Rumah
                        </button>
                        <button
                           type="button"
                           onClick={() => setIsProfileCalibrating(false)}
                           className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-350 rounded-2xl text-xs uppercase tracking-wider text-center border-none cursor-pointer transition-colors font-bold"
                        >
                           Batal
                        </button>
                     </div>
                 </motion.div>
              </div>
           )}
        </AnimatePresence>

       {/* Modal Update Data Mandiri */}
       <AnimatePresence>
          {isEditing && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div 
                   initial={{ scale: 0.95, opacity: 0 }} 
                   animate={{ scale: 1, opacity: 1 }} 
                   exit={{ scale: 0.95, opacity: 0 }} 
                   className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-[2.5rem] rounded-none shadow-2xl overflow-hidden relative z-10 flex flex-col h-full sm:h-auto sm:max-h-[90vh] border border-slate-100 dark:border-slate-850"
                >
                    <div className="p-5 sm:p-8 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm border border-indigo-105 dark:border-indigo-900/40">
                             <UserPlus className="w-6 h-6" />
                          </div>
                          <div>
                             <h2 className="text-lg sm:text-xl font-black text-slate-850 dark:text-white uppercase tracking-tight leading-none">Sinkronisasi Data Mandiri</h2>
                             <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">Lengkapi data administrasi mandiri</p>
                          </div>
                       </div>
                       <button onClick={handleCloseModal} className="p-2.5 hover:bg-slate-105 dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                       </button>
                    </div>
                    <form onSubmit={handleUpdateMandiri} className="flex-1 flex flex-col min-h-0 h-full overflow-hidden bg-white dark:bg-slate-900">
                       <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-8 sm:space-y-10 custom-scrollbar pb-24">
                          <div className="p-5 sm:p-6 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/70 dark:border-indigo-900/40 rounded-3xl flex gap-4">
                             <div className="bg-white dark:bg-slate-800 p-2.5 h-11 w-11 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm flex items-center justify-center shrink-0 border border-indigo-50 dark:border-slate-705">
                                <Info className="w-5 h-5" />
                             </div>
                             <div className="flex-1 space-y-1">
                                <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">Informasi Sinkronisasi</h4>
                                <p className="text-[11px] font-bold text-indigo-700/80 dark:text-indigo-350 leading-relaxed uppercase tracking-wide">
                                   Data yang Anda ubah akan ditinjau oleh Admin (RT/RW) sebelum diperbarui di sistem utama. Lampirkan Foto KTP/KK untuk mempercepat proses verifikasi.
                                </p>
                             </div>
                          </div>

                          {/* 1. Identitas Utama */}
                          <div className="space-y-6">
                             <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                                <User className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Identitas Utama</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-bold text-slate-800 dark:text-slate-100">
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama Lengkap</label>
                                   <div className="relative">
                                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.nama || ''} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Nama Lengkap sesuai KTP" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nomor KK</label>
                                   <div className="relative">
                                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.kk || ''} onChange={e => setFormData({...formData, kk: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Nomor KK (16 digit)" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nomor HP / WhatsApp</label>
                                   <div className="relative">
                                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.hp || ''} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Nomor HP atau Whatsapp aktif" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email</label>
                                   <div className="relative">
                                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Alamat Email" />
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* 2. Alamat & Wilayah */}
                          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                                <MapPin className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Alamat & Wilayah</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-bold text-slate-800 dark:text-slate-100">
                                <div className="sm:col-span-2 space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Alamat / Blok (Eks: Blok A No 12)</label>
                                   <div className="relative">
                                      <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.blok || formData.alamat || ''} onChange={e => setFormData({...formData, blok: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Contoh: No. 12, RT 01 RW 02" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kelurahan</label>
                                   <div className="relative">
                                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.kelurahan || ''} onChange={e => setFormData({...formData, kelurahan: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kecamatan</label>
                                   <div className="relative">
                                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.kecamatan || ''} onChange={e => setFormData({...formData, kecamatan: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kabupaten / Kota</label>
                                   <div className="relative">
                                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.kabupaten || ''} onChange={e => setFormData({...formData, kabupaten: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kewarganegaraan (WNI/WNA)</label>
                                   <select value={formData.kewarganegaraan || 'WNI'} onChange={e => setFormData({...formData, kewarganegaraan: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none">
                                      <option value="WNI">WNI</option>
                                      <option value="WNA">WNA</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">RT</label>
                                   <div className="relative">
                                      <select value={formData.rt || '01'} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none appearance-none">
                                          {Array.from({length: 100}, (_, i) => String(i+1).padStart(2, '0')).map(rt => (
                                             <option key={rt} value={rt}>{`RT ${rt}`}</option>
                                          ))}
                                      </select>
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">RW</label>
                                   <div className="relative">
                                      <select value={formData.rw || '01'} onChange={e => setFormData({...formData, rw: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none appearance-none">
                                          {Array.from({length: 100}, (_, i) => String(i+1).padStart(2, '0')).map(rw => (
                                             <option key={rw} value={rw}>{`RW ${rw}`}</option>
                                          ))}
                                      </select>
                                   </div>
                                </div>
                             </div>
                          </div>

                          {/* 3. Profil Demografi & Sosial */}
                          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                                <Heart className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Profil Demografi & Sosial</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 font-bold text-slate-800 dark:text-slate-100">
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tempat Lahir</label>
                                   <div className="relative">
                                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.tempatLahir || ''} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tanggal Lahir</label>
                                   <div className="relative">
                                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="date" value={formData.tglLahir || ''} onChange={e => setFormData({...formData, tglLahir: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Agama</label>
                                   <select value={formData.agama || 'Islam'} onChange={e => setFormData({...formData, agama: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none">
                                      <option value="Islam">Islam</option>
                                      <option value="Kristen">Kristen</option>
                                      <option value="Katolik">Katolik</option>
                                      <option value="Hindu">Hindu</option>
                                      <option value="Buddha">Buddha</option>
                                      <option value="Konghucu">Konghucu</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hubungan dalam Keluarga</label>
                                   <select value={formData.posisi || ''} onChange={e => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none">
                                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                                      <option value="Suami">Suami</option>
                                      <option value="Istri">Istri</option>
                                      <option value="Anak">Anak</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Profesi/Pekerjaan</label>
                                   <div className="relative">
                                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
                                      <input type="text" value={formData.profesi || ''} onChange={e => setFormData({...formData, profesi: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none transition-all placeholder:font-medium placeholder:text-slate-400" placeholder="Pekerjaan saat ini" />
                                   </div>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pendidikan Terakhir</label>
                                   <select value={formData.pendidikanTerakhir || 'BELUM SEKOLAH'} onChange={e => setFormData({...formData, pendidikanTerakhir: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none">
                                      <option value="BELUM SEKOLAH">BELUM SEKOLAH</option>
                                      <option value="SD">SD</option>
                                      <option value="SMP">SMP</option>
                                      <option value="SMA">SMA</option>
                                      <option value="DIPLOMA 1">DIPLOMA 1</option>
                                      <option value="DIPLOMA 2">DIPLOMA 2</option>
                                      <option value="DIPLOMA 3">DIPLOMA 3</option>
                                      <option value="DIPLOMA 4">DIPLOMA 4</option>
                                      <option value="S1">S1</option>
                                      <option value="S2">S2</option>
                                      <option value="S3">S3</option>
                                   </select>
                                </div>
                                <div className="space-y-1.5">
                                   <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status Pernikahan</label>
                                   <select value={formData.kawin || 'Belum Kawin'} onChange={e => setFormData({...formData, kawin: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-550 outline-none">
                                      <option value="Belum Kawin">Belum Kawin</option>
                                      <option value="Kawin">Kawin</option>
                                   </select>
                                </div>
                             </div>
                          </div>

                          {/* 4. Dokumen Pendukung */}
                          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-4 text-indigo-600 dark:text-indigo-400 drop-shadow-sm">
                                <FileText className="w-5 h-5" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Dokumen Pendukung</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                             </div>

                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Foto KTP / Profil</span>
                                   <label className="block w-full cursor-pointer group">
                                      <div className="aspect-video bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center group-hover:border-indigo-400 dark:group-hover:border-indigo-600 group-hover:bg-indigo-50/20 dark:group-hover:bg-indigo-950/10 transition-all overflow-hidden relative shadow-sm">
                                         {files.ktp ? (
                                            <img src={URL.createObjectURL(files.ktp)} className="w-full h-full object-cover" />
                                         ) : currentData.ktpUrl || currentData.foto ? (
                                            <img src={currentData.ktpUrl || currentData.foto} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="flex flex-col items-center gap-2">
                                               <PlusCircle className="w-8 h-8 text-slate-300 dark:text-slate-650 group-hover:scale-110 transition-transform" />
                                               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Unggah Foto KTP</span>
                                            </div>
                                         )}
                                         <input type="file" className="hidden" accept="image/*" onChange={e => setFiles({...files, ktp: e.target.files?.[0]})} />
                                      </div>
                                   </label>
                                </div>
                                <div className="space-y-2">
                                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Foto Kartu Keluarga</span>
                                   <label className="block w-full cursor-pointer group">
                                      <div className="aspect-video bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center group-hover:border-indigo-400 dark:group-hover:border-indigo-600 group-hover:bg-indigo-50/20 dark:group-hover:bg-indigo-950/10 transition-all overflow-hidden relative shadow-sm">
                                         {files.kk ? (
                                            <img src={URL.createObjectURL(files.kk)} className="w-full h-full object-cover" />
                                         ) : currentData.kkUrl ? (
                                            <img src={currentData.kkUrl} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="flex flex-col items-center gap-2">
                                               <PlusCircle className="w-8 h-8 text-slate-300 dark:text-slate-650 group-hover:scale-110 transition-transform" />
                                               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Unggah Foto KK</span>
                                            </div>
                                         )}
                                         <input type="file" className="hidden" accept="image/*" onChange={e => setFiles({...files, kk: e.target.files?.[0]})} />
                                      </div>
                                   </label>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="px-5 sm:px-10 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 sticky bottom-0 z-20 flex flex-col gap-4">
                          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/50 dark:border-blue-900/25 rounded-2xl transition-all">
                             <div className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-105 dark:border-blue-900">
                                <ShieldCheck className="w-3.5 h-3.5" />
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Data yang anda masukkan dilindungi enkripsi SSL</span>
                          </div>
                          
                          <div className="flex gap-4">
                             <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all">Batalkan</button>
                             <button type="submit" disabled={uploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                                {uploading ? (
                                   <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                   <CheckCircle className="w-4 h-4" />
                                )}
                                Kirim Pengajuan
                             </button>
                          </div>
                       </div>
                    </form>
                </motion.div>
             </div>
          )}
       </AnimatePresence>
    </div>
  );
}
