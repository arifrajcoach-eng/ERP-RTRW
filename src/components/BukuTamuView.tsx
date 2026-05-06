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
  Cctv
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
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
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const webcamRef = useRef<Webcam>(null);

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

  const handleSubmitTamu = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `TAMU-${Date.now()}`;
    
    const payload = {
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: new Date().toISOString(),
      nama: formData.get('nama'),
      asal: formData.get('asal'),
      tujuan: formData.get('tujuan'),
      keperluan: formData.get('keperluan'),
      foto: capturedImage,
      status: 'Check-in',
      petugas: currentUser.nama || currentUser.name || 'Sistem'
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
  };

  return (
    <div className="space-y-6">
      {/* CCTV & Status Security */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden aspect-video lg:aspect-auto h-[300px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            Live Monitoring - Pos Keamanan
          </div>
          <div className="absolute top-4 right-4 text-white/50 flex gap-4 text-[10px] font-mono">
            <span>CH 01: MAIN GATE</span>
            <span>2026-05-06 14:02:31</span>
          </div>
          
          <div className="h-full flex items-center justify-center relative z-10">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto border border-white/20 backdrop-blur-md">
                   <Cctv className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-1">
                   <p className="text-white font-black text-xl tracking-tight">Kamera Monitor Aktif</p>
                   <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">Sistem Keamanan Terintegrasi</p>
                </div>
             </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
             <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase">
                   <ShieldCheck className="w-3 h-3" /> Area Steril & Aman
                </div>
                <p className="text-white/40 text-[9px] font-mono">Scanning face identifiers... OK</p>
             </div>
             <button onClick={() => setShowForm(true)} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                Registrasi Tamu
             </button>
          </div>
        </div>

        <div className="space-y-4">
           <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-blue-500 transition-all" onClick={() => setShowQR(true)}>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <QrCode className="w-8 h-8" />
              </div>
              <h4 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Mandiri QR</h4>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase leading-tight">Tamu Scan QR di Pos untuk Lapor Mandiri</p>
           </div>
           <div className="bg-emerald-600 p-6 rounded-[2rem] shadow-xl shadow-emerald-100 flex flex-col items-center text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                 <History className="w-8 h-8" />
              </div>
              <h4 className="font-black uppercase tracking-tighter text-sm">Log 24 Jam</h4>
              <p className="text-[10px] font-bold text-emerald-100 mt-1 uppercase leading-tight">Total {tamuData.length} Tamu Berkunjung Hari Ini</p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></span>
            Log Kunjungan Tamu
          </h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama / tujuan..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Waktu</th>
                <th className="px-5 py-4">Tamu</th>
                <th className="px-5 py-4">Asal / Instansi</th>
                <th className="px-5 py-4">Tujuan / Keperluan</th>
                <th className="px-5 py-4 text-center">Identitas</th>
                <th className="px-5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {filteredTamu.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 italic font-bold">Belum ada kunjungan tamu.</td></tr>
              )}
              {filteredTamu.map((tamu: any) => (
                <tr key={tamu.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-xs font-black text-slate-800">{new Date(tamu.tanggal).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{new Date(tamu.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'short'})}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-[10px]">
                        {tamu.nama?.substring(0,2).toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-800">{tamu.nama}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs font-bold">{tamu.asal}</td>
                  <td className="px-5 py-3">
                    <div className="font-bold text-blue-600 truncate max-w-[200px]">{tamu.tujuan}</div>
                    <div className="text-[10px] text-slate-400 italic">{tamu.keperluan}</div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {tamu.foto ? (
                      <button onClick={() => {}} className="p-1 px-2.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all uppercase">
                        Lihat Foto
                      </button>
                    ) : '-'}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest bg-blue-100 text-blue-700">
                      Check-in
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[120] p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-600 text-white rounded-xl"><PlusCircle className="w-4 h-4" /></div>
                    Registrasi Kunjungan Tamu
                  </h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSubmitTamu} className="p-6 overflow-y-auto space-y-5">
                   <div className="flex flex-col items-center gap-4">
                      {capturedImage ? (
                        <div className="relative w-40 h-40 bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                           <img src={capturedImage} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-md"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group" onClick={() => setShowWebcam(true)}>
                           <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Ambil Foto Identitas / Wajah</span>
                        </div>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Tamu</label>
                        <input name="nama" required type="text" placeholder="Jhon Doe" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Asal / Instansi</label>
                        <input name="asal" required type="text" placeholder="PT Ayoo Maju" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                      </div>
                   </div>

                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rumah / Orang yang Dituju</label>
                    <input name="tujuan" required type="text" placeholder="Bpk. Budi (Blok A No 12)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                   </div>

                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keperluan Kunjungan</label>
                    <textarea name="keperluan" rows={2} placeholder="Mengantar paket / Tamu keluarga..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                   </div>

                   <div className="flex gap-2 pt-4">
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">Batal</button>
                      <button type="submit" className="flex-[2] py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 uppercase tracking-widest active:scale-95">Simpan Data</button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showWebcam && (
          <div className="fixed inset-0 bg-slate-900/90 flex flex-col justify-center items-center z-[130] p-4">
             <div className="relative rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl max-w-lg w-full aspect-square md:aspect-video bg-black">
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
                <button onClick={() => setShowWebcam(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md transition-all"><X className="w-6 h-6" /></button>
             </div>
             <div className="mt-8 flex gap-6">
                <button onClick={capture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-white/20 border-4 border-blue-600 group active:scale-95 transition-all">
                   <div className="w-14 h-14 bg-white group-hover:bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-blue-600" />
                   </div>
                </button>
             </div>
             <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-6">Arahkan Kamera ke Wajah atau KTP Tamu</p>
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
