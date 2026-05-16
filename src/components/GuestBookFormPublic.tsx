import React, { useState, useRef, useCallback } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import Webcam from 'react-webcam';
import { Camera, X, CheckCircle2, User, Landmark, MessageSquare } from 'lucide-react';

export const GuestBookFormPublic = ({ tenantId }: { tenantId: string }) => {
  const [formData, setFormData] = useState({ nama: '', nik: '', asal: '', keperluan: '', tujuan: '' });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowWebcam(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'buku_tamu'), {
        ...formData,
        foto: capturedImage,
        tenantId,
        tanggal: new Date().toISOString(),
        status: 'TAMU'
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-sm w-full border border-slate-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Berhasil!</h2>
          <p className="text-slate-500 font-medium">Terima kasih, data kunjungan Anda telah tercatat. Silakan masuk dan hubungi pihak yang dituju.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-black tracking-tight uppercase">Buku Tamu Digital</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Tenant ID: {tenantId}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div className="relative group">
              {capturedImage ? (
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg relative bg-slate-100">
                  <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                  <button 
                    type="button" 
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowWebcam(true)}
                  className="w-32 h-32 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center px-4">Ambil Foto Wajah / KTP</span>
                </button>
              )}
            </div>
            {!capturedImage && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mt-2">* Foto Wajib diambil</p>}
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                required 
                value={formData.nama}
                onChange={e => setFormData({...formData, nama: e.target.value})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Asal / Instansi" 
                required 
                value={formData.asal}
                onChange={e => setFormData({...formData, asal: e.target.value})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rumah/Orang yang Dituju" 
                required 
                value={formData.tujuan}
                onChange={e => setFormData({...formData, tujuan: e.target.value})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 text-slate-400 w-4 h-4" />
              <textarea 
                placeholder="Keperluan (contoh: Mengantar Paket, Tamu Keluarga)" 
                required 
                rows={3}
                value={formData.keperluan}
                onChange={e => setFormData({...formData, keperluan: e.target.value})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !capturedImage}
            className={`w-full p-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${isSubmitting || !capturedImage ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Data Laporan'}
          </button>
        </form>
      </div>

      {showWebcam && (
        <div className="fixed inset-0 bg-slate-900/95 flex flex-col justify-center items-center z-[130] p-4">
          <div className="relative rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl max-w-sm w-full aspect-square bg-black">
            {/* @ts-ignore */}
            <Webcam 
              audio={false} 
              ref={webcamRef} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode: { ideal: "user" } }}
              forceScreenshotSourceSize={true}
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={() => setShowWebcam(false)} 
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white backdrop-blur-md"
            >
              <X size={24} />
            </button>
          </div>
          <div className="mt-8">
            <button 
              onClick={capture} 
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-blue-600 active:scale-90 transition-all"
            >
              <Camera className="w-8 h-8 text-blue-600" />
            </button>
          </div>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-6">Arahkan Kamera ke Wajah Anda</p>
        </div>
      )}
    </div>
  );
};
