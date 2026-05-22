import React, { useState, useEffect } from 'react';
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
  LifeBuoy
} from 'lucide-react';
import { doc, setDoc, updateDoc, onSnapshot, query, where, collection } from 'firebase/firestore';
import { db } from '../firebase';
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

  const activeSubmission = verifikasiData.find(v => v.nik === wargaData.nik);
  const mySurat = suratData.filter(s => s.nik === wargaData.nik);

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
        rw: formData.rw || wargaData.rw || "05",
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

  const handleRequestSurat = async (jenis: string) => {
    setIsLoadingDB(true);
    try {
      const id = `SRT-${Date.now()}`;
      const payload = {
        id,
        tenantId,
        rt: wargaData.rt || '01',
        tanggal: new Date().toISOString(),
        jenis,
        pemohon: wargaData.nama,
        nik: wargaData.nik,
        alamat: wargaData.blok || wargaData.alamat || "-",
        ttl: `${wargaData.tempatLahir}, ${wargaData.tglLahir}`,
        status: 'Menunggu Persetujuan RT',
        keterangan: `Permohonan mandiri via aplikasi warga`,
        userId: wargaData.uid || wargaData.id_user || null,
        nomorSurat: getAutoNomorSurat(wargaData.rt || '01', wargaData.rw || '05')
      };
      await setDoc(doc(db, 'surat', id), payload);
      setSuratData((prev: any) => [payload, ...prev]);
      showNotification("Permohonan surat berhasil dikirim.", "success");
    } catch (err) {
      handleFirestoreError(err, 'create', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
       {/* Sidebar Citizen */}
       <div className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-8 pb-4 flex flex-col items-center text-center">
             <div className="relative mb-4">
                <div className="w-24 h-24 rounded-[2rem] bg-indigo-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                   {wargaData.ktpUrl || wargaData.foto ? (
                      <img src={wargaData.ktpUrl || wargaData.foto} className="w-full h-full object-cover" />
                   ) : (
                      <User className="w-10 h-10 text-indigo-300" />
                   )}
                </div>
                {wargaData.terverifikasi && (
                   <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                )}
             </div>
             <div className="mt-4 flex items-center justify-center gap-2">
                <h2 className="text-xl font-black text-slate-800 leading-tight uppercase tracking-tight">{wargaData.nama}</h2>
                {wargaData.terverifikasi ? (
                   <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Terverifikasi
                   </span>
                ) : (
                   <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Belum Verifikasi
                   </span>
                )}
             </div>
             <p className="text-xs font-bold text-slate-400 mt-1">NIK: {wargaData.nik}</p>
             
             <div className="mt-6 w-full space-y-2">
                <button onClick={() => setActiveCitizenTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCitizenTab === 'profil' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>
                   <User className="w-4 h-4" /> Profil Saya
                </button>
                <button onClick={() => setActiveCitizenTab('layanan')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeCitizenTab === 'layanan' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'}`}>
                   <LifeBuoy className="w-4 h-4" /> Layanan Mandiri
                </button>
             </div>
          </div>

          <div className="mt-auto p-8 border-t border-slate-100">
             <button onClick={() => setWargaAuth(null)} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all border border-red-50">
                Keluar Aplikasi
             </button>
          </div>
       </div>

       {/* Content Citizen */}
       <div className="flex-1 overflow-y-auto p-4 md:p-12">
          <AnimatePresence mode="wait">
             {activeCitizenTab === 'profil' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
                   <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Profil Warga</h1>
                        <p className="text-slate-500 font-medium">Data Anda yang terdaftar di Sistem Admin RT {wargaData.rt || '01'}.</p>
                      </div>
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm">
                         <Edit className="w-4 h-4" /> Perbarui Data
                      </button>
                   </div>

                   {activeSubmission && activeSubmission.status === 'Menunggu Persetujuan' && (
                      <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-start gap-4">
                         <div className="bg-amber-100 p-3 rounded-xl text-amber-600 shadow-inner">
                            <RefreshCw className="w-6 h-6 animate-spin-slow" />
                         </div>
                         <div>
                            <h4 className="font-black text-amber-800 uppercase tracking-tight">Menunggu Verifikasi</h4>
                            <p className="text-sm text-amber-600 mt-0.5 font-medium">Anda telah mengajukan pembaruan data pada {new Date(activeSubmission.submittedAt).toLocaleDateString()}. Mohon tunggu Admin memberikan persetujuan.</p>
                         </div>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-bold">
                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                         <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Informasi Dasar</h3>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                               <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nama Sesuai KTP</label>
                               <p className="text-slate-800">{wargaData.nama}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tempat Lahir</label>
                                  <p className="text-slate-800">{wargaData.tempatLahir || '-'}</p>
                               </div>
                               <div>
                                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tanggal Lahir</label>
                                  <p className="text-slate-800">{wargaData.tglLahir || '-'}</p>
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] text-slate-400 uppercase mb-1 block">Pekerjaan</label>
                               <p className="text-slate-800">{wargaData.profesi || '-'}</p>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                         <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2">Domisili & Kontak</h3>
                         <div className="grid grid-cols-1 gap-4">
                            <div>
                               <label className="text-[10px] text-slate-400 uppercase mb-1 block">Alamat / Blok</label>
                               <p className="text-slate-800">{wargaData.blok || wargaData.alamat || '-'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Rukun Tetangga</label>
                                  <p className="text-slate-800">RT {wargaData.rt || '-'}</p>
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nomor HP</label>
                                  <p className="text-slate-800">{wargaData.hp || '-'}</p>
                               </div>
                            </div>
                            <div>
                               <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nomor Kartu Keluarga</label>
                               <p className="text-slate-800">{wargaData.kk || '-'}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {activeCitizenTab === 'layanan' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-8">
                   <div>
                      <h1 className="text-3xl font-black text-slate-800 tracking-tight">Layanan Mandiri</h1>
                      <p className="text-slate-500 font-medium">Buat permohonan surat pengantar RT/RW secara instan.</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-bold">
                      {[
                         { id: 'ktp', name: 'Pengantar KTP/KK', icon: <UserPlus className="w-6 h-6" /> },
                         { id: 'domisili', name: 'Ket. Domisili', icon: <MapPin className="w-6 h-6" /> },
                         { id: 'skck', name: 'Pengantar SKCK', icon: <ShieldCheck className="w-6 h-6" /> },
                         { id: 'sktm', name: 'Suket. Tidak Mampu', icon: <FileText className="w-6 h-6" /> },
                         { id: 'usaha', name: 'Suket. Usaha', icon: <PlusCircle className="w-6 h-6" /> }
                      ].map(item => (
                         <button key={item.id} onClick={() => handleRequestSurat(item.name)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all text-left flex flex-col gap-6 group">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                               {item.icon}
                            </div>
                            <div>
                               <h4 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{item.name}</h4>
                               <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Buat Permohonan Baru</p>
                            </div>
                         </button>
                      ))}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>
       </div>

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
                               <option value="SD">SD</option>
                               <option value="SMP">SMP</option>
                               <option value="SMA">SMA</option>
                               <option value="S1">S1</option>
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
