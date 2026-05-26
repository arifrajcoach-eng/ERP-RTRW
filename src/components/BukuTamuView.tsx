import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  Camera, 
  QrCode, 
  History, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  User, 
  MapPin, 
  Clock, 
  Calendar,
  AlertCircle,
  Cctv,
  Eye,
  Trash2,
  Edit,
  LogOut,
  Image,
  RefreshCw
} from 'lucide-react';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Webcam from 'react-webcam';

interface BukuTamuViewProps {
  tamuData: any[];
  setTamuData: React.Dispatch<React.SetStateAction<any[]>>;
  userRole: string;
  currentUser: any;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function BukuTamuView({ 
  tamuData, 
  setTamuData, 
  userRole, 
  currentUser, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  showNotification 
}: BukuTamuViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTamu, setSelectedTamu] = useState<any>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTamu = tamuData.filter(t => 
    t.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.tujuan?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowWebcam(false);
    }
  }, [webcamRef]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckOut = async (id: string) => {
    setIsLoadingDB(true);
    try {
      const wKeluar = new Date().toISOString();
      await updateDoc(doc(db, 'buku_tamu', id), {
        status: 'Check-out',
        waktuKeluar: wKeluar
      });
      setTamuData(prev => prev.map(t => t.id === id ? { ...t, status: 'Check-out', waktuKeluar: wKeluar } : t));
      showNotification('Tamu berhasil check-out', 'success');
    } catch (error) {
      handleFirestoreError(error, 'update', 'buku_tamu');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data kunjungan tamu ini?')) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'buku_tamu', id));
      setTamuData(prev => prev.filter(t => t.id !== id));
      showNotification('Data tamu berhasil dihapus', 'success');
    } catch (error) {
      handleFirestoreError(error, 'delete', 'buku_tamu');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSubmitTamu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (formMode === 'add') {
      const id = `TAMU-${Date.now()}`;
      
      const payload = {
        id,
        tenantId,
        rt: currentUser?.rt || '01',
        tanggal: new Date().toISOString(),
        waktuKeluar: null,
        nama: formData.get('nama'),
        asal: formData.get('asal'),
        tujuan: formData.get('tujuan'),
        keperluan: formData.get('keperluan'),
        catatan: formData.get('catatan') || '',
        foto: capturedImage,
        status: 'Check-in',
        petugas: currentUser?.nama || currentUser?.name || 'Sistem'
      };

      setIsLoadingDB(true);
      try {
        await setDoc(doc(db, 'buku_tamu', id), payload);
        setTamuData((prev: any) => [payload, ...prev]);
        showNotification('Tamu berhasil dicatat', 'success');
        setShowForm(false);
        setCapturedImage(null);
      } catch (err: any) {
        handleFirestoreError(err, 'create', 'buku_tamu');
      } finally {
        setIsLoadingDB(false);
      }
    } else if (formMode === 'edit' && selectedTamu) {
      const payload = {
        nama: formData.get('nama'),
        asal: formData.get('asal'),
        tujuan: formData.get('tujuan'),
        keperluan: formData.get('keperluan'),
        catatan: formData.get('catatan') || '',
        ...(capturedImage ? { foto: capturedImage } : {})
      };
      
      setIsLoadingDB(true);
      try {
        await updateDoc(doc(db, 'buku_tamu', selectedTamu.id), payload);
        setTamuData((prev: any) => prev.map((t: any) => t.id === selectedTamu.id ? { ...t, ...payload } : t));
        showNotification('Data tamu berhasil diupdate', 'success');
        setShowForm(false);
        setCapturedImage(null);
        setSelectedTamu(null);
      } catch (err: any) {
        handleFirestoreError(err, 'update', 'buku_tamu');
      } finally {
        setIsLoadingDB(false);
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* CCTV & Status Security */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-slate-900 rounded-[3.5rem] p-6 shadow-2xl relative overflow-hidden aspect-video lg:aspect-auto h-[400px] border-8 border-slate-800 group">
          <div className="absolute inset-0">
             {!showWebcam && (
               /* @ts-ignore */
               <Webcam audio={false} videoConstraints={{ facingMode: "environment" }} mirrored={false} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" />
             )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 pointer-events-none"></div>
          
          <div className="absolute top-8 left-8 flex items-center gap-4 bg-rose-600 text-white px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.3em] shadow-xl animate-pulse">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_white]"></div>
            Live Secure Feed
          </div>
          
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-end z-20">
             <div className="space-y-1.5 bg-slate-950/60 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] backdrop-blur-2xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3 text-emerald-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                   <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" /> Area Monitoring Aktif
                </div>
                <p className="text-white/40 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest">Sensors: Active | Logs: Stabil</p>
             </div>
             
             <motion.button 
               whileHover={{ scale: 1.02 }}
               whileTap={{ scale: 0.98 }}
               onClick={() => { setFormMode('add'); setCapturedImage(null); setSelectedTamu(null); setShowForm(true); }} 
               className="bg-white text-slate-900 px-6 py-4 sm:px-10 sm:py-5 rounded-2xl sm:rounded-[1.5rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 sm:gap-3 cursor-pointer z-20"
             >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Registrasi Tamu
             </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
           <motion.div 
             whileHover={{ y: -5 }}
             className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group cursor-pointer hover:border-brand-blue/30 transition-all" 
             onClick={() => setShowQR(true)}
           >
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                 <QrCode className="w-10 h-10" />
              </div>
              <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter text-lg">Self Check-in</h4>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-2 uppercase leading-relaxed tracking-widest max-w-[120px]">Scan QR Mandiri di Pos Penjagaan</p>
           </motion.div>
           
           <motion.div 
             whileHover={{ y: -5 }}
             className="bg-brand-blue dark:bg-slate-800 p-8 rounded-[3rem] shadow-2xl shadow-brand-blue/20 dark:shadow-none flex flex-col items-center text-center text-white transition-all overflow-hidden relative"
           >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl"></div>
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                 <History className="w-10 h-10" />
              </div>
              <h4 className="font-black uppercase tracking-tighter text-lg">Kunjungan 24j</h4>
              <p className="text-[10px] font-black text-blue-100 mt-2 uppercase leading-relaxed tracking-widest">Total {tamuData.length} Tamu Masuk Wilayah</p>
           </motion.div>
        </div>
      </div>

      <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-white/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 dark:bg-brand-blue text-white rounded-[1.5rem] shadow-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-2xl uppercase tracking-tighter font-elegant">Log Kunjungan</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Daftar riwayat tamu hari ini</p>
            </div>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari Identitas Tamu..." 
              className="pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 rounded-[2rem] text-[13px] font-bold w-full focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/20 outline-none text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-300 placeholder:italic"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] border-b border-slate-100 dark:border-slate-800 transition-colors">
                <th className="px-10 py-8">Kronologi Waktu</th>
                <th className="px-10 py-8">Profil Tamu</th>
                <th className="px-10 py-8">Asal / Instansi</th>
                <th className="px-10 py-8">Tujuan Kunjungan</th>
                <th className="px-10 py-8">Catatan</th>
                <th className="px-10 py-8 text-center">Status Keamanan</th>
                <th className="px-10 py-8 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredTamu.length === 0 && (
                <tr><td colSpan={7} className="px-10 py-24 text-center">
                  <div className="flex flex-col items-center opacity-30 text-slate-400">
                    <History className="w-16 h-16 mb-4" />
                    <p className="text-sm font-black uppercase tracking-widest italic">Nihil Laporan Tamu</p>
                  </div>
                </td></tr>
              )}
              {filteredTamu.map((tamu: any, idx: number) => (
                <motion.tr 
                  key={`tamu-row-${tamu.id || idx}-${idx}`} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-slate-50 dark:hover:bg-brand-blue/5 group transition-all"
                >
                  <td className="px-10 py-6">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-blue" />
                        {new Date(tamu.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex flex-col gap-1">
                        {tamu.waktuKeluar ? (
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                            Out: {new Date(tamu.waktuKeluar).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Staying
                          </div>
                        )}
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-3.5">{new Date(tamu.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-brand-blue font-black shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                        {tamu.foto ? <img src={tamu.foto} className="w-full h-full object-cover" /> : <span className="text-xl font-elegant">{tamu.nama?.substring(0,1).toUpperCase()}</span>}
                      </div>
                      <div>
                        <div className="font-black text-[15px] text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant leading-none">{tamu.nama}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Reg ID: {tamu.id?.substring(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                       {tamu.asal}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="font-black text-[13px] text-brand-blue uppercase tracking-tight leading-none mb-1.5">{tamu.tujuan}</div>
                    <div className="text-[10px] font-medium text-slate-400 italic max-w-[200px] truncate">"{tamu.keperluan}"</div>
                  </td>
                  <td className="px-10 py-6">
                     <p className="text-[10px] text-slate-500 max-w-[150px] truncate">{tamu.catatan || '-'}</p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    {tamu.status === 'Check-in' ? (
                      <span className="px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 border border-emerald-400 flex items-center justify-center gap-2 w-fit mx-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Check-in
                      </span>
                    ) : (
                      <span className="px-6 py-2 text-[10px] font-black rounded-full uppercase tracking-[0.2em] bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-2 w-fit mx-auto">
                        <LogOut className="w-3.5 h-3.5" />
                        Finish
                      </span>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-end gap-3 font-elegant">
                      {tamu.status === 'Check-in' && (
                         <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleCheckOut(tamu.id)} className="p-3 bg-amber-500 text-white rounded-xl shadow-lg shadow-amber-500/20" title="Check-out">
                            <LogOut className="w-5 h-5" />
                         </motion.button>
                      )}
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFormMode('view'); setSelectedTamu(tamu); setShowForm(true); }} className="p-3 bg-brand-blue text-white rounded-xl shadow-lg shadow-brand-blue/20" title="Review">
                         <Eye className="w-5 h-5" />
                      </motion.button>
                      {['SUPER_ADMIN', 'ADMIN', 'RW', 'RT'].includes(userRole) && (
                        <>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setFormMode('edit'); setSelectedTamu(tamu); setCapturedImage(tamu.foto || null); setShowForm(true); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20" title="Edit">
                             <Edit className="w-5 h-5" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(tamu.id)} className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-600/20" title="Delete">
                             <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[120] p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] mt-[102px]">
                <div className="h-[60px] pt-5 pb-5 px-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                      {formMode === 'view' ? <Eye className="w-4 h-4" /> : formMode === 'edit' ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    </div>
                    {formMode === 'view' ? 'Detail Kunjungan Tamu' : formMode === 'edit' ? 'Edit Kunjungan Tamu' : 'Registrasi Kunjungan Tamu'}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmitTamu} className="p-6 overflow-y-auto space-y-5">
                    <div className="flex flex-col items-center gap-4 w-full" style={{ height: '229.965px', marginBottom: '-15px' }}>
                       {capturedImage ? (
                         <div className="relative w-full h-full bg-black rounded-[2rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center group/img">
                            <img src={capturedImage} className="w-full h-full object-cover" />
                            {formMode !== 'view' && (
                              <button 
                                type="button" 
                                onClick={() => setCapturedImage(null)} 
                                className="absolute top-4 right-4 p-2 bg-red-600/90 text-white rounded-xl shadow-lg backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                         </div>
                       ) : (
                         formMode !== 'view' ? (
                           <div className="flex gap-4 w-full h-full">
                              <div className="flex-1 h-full bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer group" onClick={() => setShowWebcam(true)}>
                                <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Ambil Foto</span>
                              </div>
                              <div className="flex-1 h-full bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                <Image className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform text-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center px-2">Unggah Foto</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                              </div>
                           </div>
                         ) : (
                           <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 opacity-50">
                             <Image className="w-10 h-10 mb-2" />
                             <span className="text-[10px] font-black uppercase tracking-widest">Tanpa Foto</span>
                           </div>
                         )
                       )}
                    </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Tamu</label>
                        <input readOnly={formMode === 'view'} name="nama" defaultValue={selectedTamu?.nama || ''} required type="text" placeholder="Jhon Doe" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asal / Instansi</label>
                        <input readOnly={formMode === 'view'} name="asal" defaultValue={selectedTamu?.asal || ''} required type="text" placeholder="PT Ayoo Maju" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                      </div>
                   </div>

                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rumah / Orang yang Dituju</label>
                    <input readOnly={formMode === 'view'} name="tujuan" defaultValue={selectedTamu?.tujuan || ''} required type="text" placeholder="Bpk. Budi (Blok A No 12)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                   </div>

                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keperluan Kunjungan</label>
                    <textarea readOnly={formMode === 'view'} name="keperluan" defaultValue={selectedTamu?.keperluan || ''} rows={2} placeholder="Mengantar paket / Tamu keluarga..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                   </div>

                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Catatan Tamu</label>
                    <textarea readOnly={formMode === 'view'} name="catatan" defaultValue={selectedTamu?.catatan || ''} rows={2} placeholder="Catatan tambahan misalnya membawa koper abu-abu..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                   </div>

                   <div className="flex gap-2 pt-4">
                      {formMode === 'view' ? (
                        <button type="button" onClick={() => setShowForm(false)} className="w-full py-3 text-xs font-black bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-all shadow-xl shadow-slate-200 uppercase tracking-widest active:scale-95">Tutup</button>
                      ) : (
                        <>
                          <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">Batal</button>
                          <button type="submit" className="flex-[2] py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 uppercase tracking-widest active:scale-95">Simpan Data</button>
                        </>
                      )}
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWebcam && (
          <div className="fixed inset-0 bg-black z-[130] flex flex-col justify-between overflow-hidden">
             {/* Fullscreen Webcam Feed */}
             <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
                {/* @ts-ignore */}
                <Webcam 
                  audio={false} 
                  ref={webcamRef} 
                  screenshotFormat="image/jpeg" 
                  videoConstraints={{ facingMode }}
                  forceScreenshotSourceSize={true}
                  mirrored={facingMode === 'user'}
                  className="w-full h-full object-cover select-none bg-black" 
                />
             </div>

             {/* Immersive UI Overlay on top of camera stream */}
             <div className="relative z-10 flex flex-col justify-between h-full p-6 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none">
                {/* Header Actions Row */}
                <div className="flex items-center justify-between w-full pointer-events-auto">
                   <div className="flex items-center gap-3">
                      <button 
                         type="button"
                         onClick={toggleFacingMode} 
                         title="Balik Kamera" 
                         className="bg-white/10 hover:bg-white/25 border border-white/20 p-3 rounded-full text-white backdrop-blur-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      >
                         <RefreshCw className="w-5 h-5" />
                      </button>
                      <div className="px-3 py-1.5 bg-red-600/90 text-white rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 animate-pulse select-none border border-red-500/30">
                         <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                         Secure Camera Active
                      </div>
                   </div>
                   
                   <button 
                      type="button"
                      onClick={() => setShowWebcam(false)} 
                      className="bg-white/10 hover:bg-red-600/80 border border-white/20 p-3 rounded-full text-white backdrop-blur-xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                      title="Tutup Kamera"
                   >
                      <X className="w-5 h-5" />
                   </button>
                </div>

                {/* Bottom Trigger and Guide Row */}
                <div className="flex flex-col items-center gap-4 w-full pointer-events-auto mb-4">
                   <div className="bg-slate-950/65 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 text-center select-none shadow-xl max-w-xs transition-opacity">
                      <p className="text-white text-[10px] font-black uppercase tracking-wider block">Scan Wajah / KTP Tamu</p>
                      <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest block mt-0.5">Posisikan tegak lurus pada lensa</span>
                   </div>

                   <button 
                      type="button"
                      onClick={capture} 
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/25 ring-4 ring-white/30 border-4 border-blue-600 hover:scale-105 active:scale-90 transition-all cursor-pointer"
                   >
                      <div className="w-14 h-14 bg-white hover:bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                         <Camera className="w-7 h-7 text-blue-600 animate-pulse" />
                      </div>
                   </button>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[120] p-4" onClick={() => setShowQR(false)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center text-center max-w-sm" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6"><QrCode className="w-10 h-10" /></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Self Check-in QR</h3>
                <p className="text-xs font-medium text-slate-500 mb-8">Tempelkan QR ini di Pos Keamanan untuk mempermudah tamu melapor secara mandiri.</p>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner mb-8">
                   <QrCode className="w-48 h-48 text-slate-800" />
                </div>
                <button onClick={() => setShowQR(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">Selesai</button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
