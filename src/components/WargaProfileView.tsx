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
  Globe
} from 'lucide-react';
import { doc, setDoc, updateDoc, onSnapshot, query, where, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { jsPDF } from 'jspdf';

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
  const [formData, setFormData] = useState<any>(wargaData);
  const [files, setFiles] = useState<{ktp?: File, kk?: File}>({});
  const [uploading, setUploading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const activeSubmission = verifikasiData.find(v => v.nik === wargaData.nik) || verifikasiData.find(v => v.authUid === wargaData.authUid);
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
      let ktpUrl = formData.ktpUrl || wargaData.ktpUrl || "";
      let kkUrl = formData.kkUrl || wargaData.kkUrl || "";

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
        nama: formData.nama || wargaData.nama,
        kk: formData.kk || wargaData.kk || "",
        hp: formData.hp || wargaData.hp || "",
        blok: formData.blok || wargaData.blok || "",
        alamat: formData.alamat || wargaData.alamat || "",
        rt: formData.rt || wargaData.rt || "01",
        rw: formData.rw || wargaData.rw || "26",
        agama: formData.agama || wargaData.agama || "Islam",
        jk: formData.jk || wargaData.jk || "",
        tempatLahir: formData.tempatLahir || wargaData.tempatLahir || "",
        tglLahir: formData.tglLahir || wargaData.tglLahir || "",
        profesi: formData.profesi || wargaData.profesi || "",
        pendidikanTerakhir: formData.pendidikanTerakhir || wargaData.pendidikanTerakhir || "",
        kawin: formData.kawin || wargaData.kawin || "",
        posisi: formData.posisi || wargaData.posisi || "",
        kewarganegaraan: formData.kewarganegaraan || wargaData.kewarganegaraan || "WNI",
        email: formData.email || wargaData.email || "",
        kelurahan: formData.kelurahan || wargaData.kelurahan || "",
        kecamatan: formData.kecamatan || wargaData.kecamatan || "",
        kabupaten: formData.kabupaten || wargaData.kabupaten || "",
        ktpUrl,
        kkUrl,
        submittedAt: new Date().toISOString(),
        status: 'Menunggu Persetujuan'
      };

      await setDoc(doc(db, 'verifikasi_warga', submissionId), payload);
      showNotification("Pengajuan pembaruan data berhasil dikirim. Menunggu verifikasi admin.", "success");
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
                  {wargaData.ktpUrl || wargaData.foto ? (
                     <img src={wargaData.ktpUrl || wargaData.foto} className="w-full h-full object-cover" />
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
                 { id: 'layanan', label: 'E-Administrasi', icon: FileText, gradient: 'from-purple-600 to-pink-600' }
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
                          onClick={() => setIsEditing(true)} 
                          className="flex items-center gap-4 px-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] text-slate-600 dark:text-slate-300 hover:border-brand-blue/30 hover:text-brand-blue hover:shadow-2xl hover:shadow-brand-blue/10 transition-all shadow-sm group"
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
                             <div className="grid grid-cols-2 gap-8">
                                <div>
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Node RW/RT</label>
                                   <p className="text-sm font-black text-slate-700 dark:text-slate-300">RT {wargaData.rt || '-'} / RW {wargaData.rw || '-'}</p>
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
                                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight">{item.jenis}</h3>
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
                                     
                                     <div className="flex items-center gap-3 shrink-0">
                                        {item.status === 'Selesai' && (
                                           <button
                                              onClick={() => generateMySuratPDF(item)}
                                              className="flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
                                              title="Cetak Surat"
                                           >
                                              <Printer className="w-4 h-4" /> Cetak Surat
                                           </button>
                                        )}
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

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
                                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase">RT / RW</span>
                                <span>RT {wargaData.rt || '01'} / RW {wargaData.rw || '26'}</span>
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

       {/* Modal Update Data Mandiri */}
       <AnimatePresence>
          {isEditing && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
                   <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Sinkronisasi Data Mandiri</h2>
                      <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                   </div>
                   <form onSubmit={handleUpdateMandiri} className="p-8 overflow-y-auto space-y-6">
                      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                         <div className="bg-white p-2 rounded-xl text-blue-600 shadow-sm shrink-0">
                            <Info className="w-6 h-6" />
                         </div>
                         <p className="text-xs font-bold text-blue-800 leading-relaxed uppercase tracking-wider">
                            Data yang Anda ubah akan ditinjau oleh Admin (RT/RW) sebelum diperbarui di sistem utama. Lampirkan Foto KTP/KK untuk mempercepat proses verifikasi.
                         </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Nama Lengkap</label>
                            <input type="text" defaultValue={wargaData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Nomor KK</label>
                            <input type="text" defaultValue={wargaData.kk} onChange={e => setFormData({...formData, kk: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Nomor HP</label>
                            <input type="text" defaultValue={wargaData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Email</label>
                            <input type="email" defaultValue={wargaData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div className="col-span-2">
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Alamat / Blok (Eks: Blok A No 12)</label>
                            <input type="text" defaultValue={wargaData.blok || wargaData.alamat} onChange={e => setFormData({...formData, blok: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Tempat Lahir</label>
                            <input type="text" defaultValue={wargaData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Tanggal Lahir</label>
                            <input type="date" defaultValue={wargaData.tglLahir} onChange={e => setFormData({...formData, tglLahir: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Agama</label>
                            <select defaultValue={wargaData.agama} onChange={e => setFormData({...formData, agama: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                               <option value="Islam">Islam</option>
                               <option value="Kristen">Kristen</option>
                               <option value="Katolik">Katolik</option>
                               <option value="Hindu">Hindu</option>
                               <option value="Buddha">Buddha</option>
                               <option value="Konghucu">Konghucu</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Posisi Dalam Keluarga</label>
                            <select defaultValue={wargaData.posisi} onChange={e => setFormData({...formData, posisi: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                               <option value="Kepala Keluarga">Kepala Keluarga</option>
                               <option value="Suami">Suami</option>
                               <option value="Istri">Istri</option>
                               <option value="Anak">Anak</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Profesi/Pekerjaan</label>
                            <input type="text" defaultValue={wargaData.profesi} onChange={e => setFormData({...formData, profesi: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Pendidikan Terakhir</label>
                            <select defaultValue={wargaData.pendidikanTerakhir} onChange={e => setFormData({...formData, pendidikanTerakhir: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
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
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Status Kawin</label>
                            <select defaultValue={wargaData.kawin} onChange={e => setFormData({...formData, kawin: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                               <option value="Belum Kawin">Belum Kawin</option>
                               <option value="Kawin">Kawin</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Kelurahan</label>
                            <input type="text" defaultValue={wargaData.kelurahan} onChange={e => setFormData({...formData, kelurahan: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Kecamatan</label>
                            <input type="text" defaultValue={wargaData.kecamatan} onChange={e => setFormData({...formData, kecamatan: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">Kabupaten/Kota</label>
                            <input type="text" defaultValue={wargaData.kabupaten} onChange={e => setFormData({...formData, kabupaten: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">WNI/WNA</label>
                            <select defaultValue={wargaData.kewarganegaraan} onChange={e => setFormData({...formData, kewarganegaraan: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
                               <option value="WNI">WNI</option>
                               <option value="WNA">WNA</option>
                            </select>
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">RT</label>
                            <input type="text" defaultValue={wargaData.rt} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                         <div>
                            <label className="text-[10px] text-slate-400 uppercase mb-1.5 block">RW</label>
                            <input type="text" defaultValue={wargaData.rw} onChange={e => setFormData({...formData, rw: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 font-black uppercase tracking-widest text-[10px]">
                         <div>
                            <p className="text-slate-400 mb-3">Foto KTP / Profil</p>
                            <label className="block w-full cursor-pointer group">
                               <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all overflow-hidden relative">
                                  {files.ktp ? <img src={URL.createObjectURL(files.ktp)} className="w-full h-full object-cover" /> : wargaData.ktpUrl || wargaData.foto ? <img src={wargaData.ktpUrl || wargaData.foto} className="w-full h-full object-cover" /> : <PlusCircle className="w-8 h-8 text-slate-300" />}
                                  <input type="file" className="hidden" accept="image/*" onChange={e => setFiles({...files, ktp: e.target.files?.[0]})} />
                               </div>
                            </label>
                         </div>
                         <div>
                            <p className="text-slate-400 mb-3">Foto Kartu Keluarga</p>
                            <label className="block w-full cursor-pointer group">
                               <div className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group-hover:border-indigo-400 group-hover:bg-indigo-50/30 transition-all overflow-hidden relative">
                                  {files.kk ? <img src={URL.createObjectURL(files.kk)} className="w-full h-full object-cover" /> : wargaData.kkUrl ? <img src={wargaData.kkUrl} className="w-full h-full object-cover" /> : <PlusCircle className="w-8 h-8 text-slate-300" />}
                                  <input type="file" className="hidden" accept="image/*" onChange={e => setFiles({...files, kk: e.target.files?.[0]})} />
                               </div>
                            </label>
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100 flex gap-4">
                         <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-all">Batalkan</button>
                         <button type="submit" disabled={uploading} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                            {uploading ? (
                               <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                               <CheckCircle className="w-4 h-4" />
                            )}
                            Kirim Pengajuan
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
