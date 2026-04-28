import React, { useState } from 'react';
import { 
  LogOut, User, CheckCircle, Activity, AlertCircle, PlusCircle, 
  History, Users, Edit, Upload, Printer, Calendar, AlertTriangle 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function WargaProfileView({ 
  wargaData, verifikasiData, suratData = [], setSuratData, setWargaAuth, 
  tenantId, setIsLoadingDB, handleFileUpload, showNotification, 
  handleFirestoreError, kopSettings, getSetting, usersData, 
  generateSuratHTML, settings 
}: { 
  wargaData: any, verifikasiData: any[], suratData?: any[], 
  setSuratData: any, setWargaAuth: any, tenantId: string, 
  setIsLoadingDB: any, handleFileUpload: any, showNotification: any, 
  handleFirestoreError: any, kopSettings: any, getSetting: any, 
  usersData: any[], generateSuratHTML: any, settings: any 
}) {
  const [activeCitizenTab, setActiveCitizenTab] = useState<'profil' | 'layanan' | 'riwayat'>('profil');
  const [uploadPct, setUploadPct] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(wargaData);
  const [files, setFiles] = useState<{ktp?: File, kk?: File}>({});
  const [uploading, setUploading] = useState(false);

  const activeSubmission = verifikasiData.find(v => v.nik === wargaData.nik);
  const mySurat = suratData.filter(s => s.nik === wargaData.nik);

  const handleAjukanSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoadingDB(true);
    try {
      const suratId = `SRT-\${Date.now()}`;
      const payload = {
        tenantId,
        id: suratId,
        tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        pemohon: wargaData.nama,
        nik: wargaData.nik,
        keperluan: fd.get('keperluan') as string,
        jenisSurat: fd.get('jenisSurat') as string,
        status: "Diajukan",
        rt: wargaData.rt,
        rw: wargaData.rw
      };
      await setDoc(doc(db, 'surat', suratId), payload);
      setSuratData([payload, ...suratData]);
      showNotification("Pengajuan surat berhasil dikirim!", "success");
      setActiveCitizenTab('riwayat');
    } catch (err) {
      handleFirestoreError(err, 'create', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleCetakSurat = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat || surat.status !== 'Selesai') return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateSuratHTML(surat, kopSettings, settings));
      printWindow.document.close();
    }
  };

  const handleSubmitPerbaikan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingDB(true);
    setUploading(true);
    try {
      const id = activeSubmission?.id || `VRF-\${Date.now()}`;
      const submission = {
        ...formData,
        id,
        tenantId,
        status: 'Menunggu Persetujuan',
        submittedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'verifikasi_warga', id), submission, { merge: true });
      showNotification("Pengajuan berhasil dikirim.", "success");
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, 'create', 'verifikasi');
    } finally {
      setIsLoadingDB(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-10 text-white relative">
           <button onClick={() => setWargaAuth(null)} className="absolute top-6 right-6 p-3 bg-white/20 rounded-2xl hover:bg-white/30 transition-all"><LogOut className="w-5 h-5" /></button>
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden shadow-2xl">
                 {wargaData.foto ? <img src={wargaData.foto} className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
              </div>
              <div className="space-y-1">
                 <h1 className="text-2xl font-black tracking-tight leading-none">{wargaData.nama}</h1>
                 <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">NIK: {wargaData.nik}</p>
                 <div className={`mt-3 inline-block px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest \${activeSubmission?.status === 'Disetujui' ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white border border-white/30'}`}>
                    {activeSubmission?.status || 'Warga Tetap'}
                 </div>
              </div>
           </div>
        </div>

        <div className="flex bg-slate-50 border-b border-slate-100 p-1">
           <button onClick={() => setActiveCitizenTab('profil')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all \${activeCitizenTab === 'profil' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}>Profil Saya</button>
           <button onClick={() => setActiveCitizenTab('layanan')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all \${activeCitizenTab === 'layanan' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}>Layanan RT</button>
           <button onClick={() => setActiveCitizenTab('riwayat')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all \${activeCitizenTab === 'riwayat' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400'}`}>Arsip Surat</button>
        </div>

        <div className="p-10">
           {activeCitizenTab === 'profil' && (
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Keluarga</p><p className="text-sm font-bold text-slate-800">{wargaData.posisi || '-'}</p></div>
                   <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kontak WA</p><p className="text-sm font-bold text-slate-800">{wargaData.hp || '-'}</p></div>
                   <div className="col-span-2"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat Domisili</p><p className="text-sm font-bold text-slate-800">RT {wargaData.rt} RW {wargaData.rw}, Blok {wargaData.blok || '-'}</p></div>
                </div>
                <div className="pt-8 border-t border-slate-50">
                   <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100 flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" /> Ajukan Perbaikan Data
                   </button>
                </div>
             </div>
           )}

           {activeCitizenTab === 'layanan' && (
             <form onSubmit={handleAjukanSurat} className="space-y-6">
                <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50 mb-8">
                   <h4 className="text-xs font-black text-blue-800 uppercase tracking-widest mb-1">Layanan Pengantar RT</h4>
                   <p className="text-[10px] text-blue-600 font-medium">Lengkapi keperluan di bawah ini, pengajuan Anda akan diteruskan ke Ketua RT untuk disetujui.</p>
                </div>
                <select name="jenisSurat" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-700">
                   <option value="SURAT PENGANTAR">SURAT PENGANTAR (UMUM)</option>
                   <option value="SURAT KETERANGAN DOMISILI">SK DOMISILI</option>
                   <option value="SURAT KETERANGAN USAHA">SK USAHA (SKU)</option>
                </select>
                <textarea name="keperluan" rows={4} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700" placeholder="Tuliskan keperluan lengkap..."></textarea>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200">Kirim Pengajuan</button>
             </form>
           )}

           {activeCitizenTab === 'riwayat' && (
             <div className="space-y-4">
                {mySurat.length > 0 ? mySurat.map(s => (
                  <div key={s.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{s.tanggal}</p>
                        <p className="text-[11px] font-black text-slate-800 leading-tight mt-1">{s.jenisSurat}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{s.status}</p>
                     </div>
                     {s.status === 'Selesai' && (
                       <button onClick={() => handleCetakSurat(s.id)} className="p-3 bg-white text-slate-900 border border-slate-200 rounded-xl hover:shadow-lg transition-all"><Printer className="w-4 h-4" /></button>
                     )}
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30">
                     <History className="w-12 h-12 mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Belum ada riwayat</p>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
