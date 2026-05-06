import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Printer, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  Clock, 
  History, 
  Info, 
  Eye, 
  ChevronRight, 
  MoreVertical,
  Download,
  ShieldCheck,
  User,
  MapPin,
  Calendar
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import { ConfirmModal } from './ui/ConfirmModal';

interface SuratViewProps {
  suratData: any[];
  setSuratData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  tenantId: string;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SuratView({ 
  suratData, 
  setSuratData, 
  wargaData, 
  userRole, 
  currentUser, 
  getSetting, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  showNotification 
}: SuratViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'berjalan' | 'arsip'>('berjalan');
  const [showForm, setShowForm] = useState(false);
  const [editingSurat, setEditingSurat] = useState<any>(null);
  const [viewingSurat, setViewingSurat] = useState<any>(null);
  const [suratToDelete, setSuratToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);
  
  const isPengurus = userRole === 'Admin' || userRole === 'RW' || userRole === 'RT' || userRole === 'Bendahara' || currentUser?.isSuperAdmin;

  const filteredSurat = suratData.filter(s => {
    // Role based access
    if (!isPengurus && s.userId !== (currentUser.uid || currentUser.id_user)) return false;
    
    const matchesSearch = s.pemohon?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.jenis?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSubTab === 'berjalan') {
      return matchesSearch && (s.status === 'Draft' || s.status === 'Menunggu Persetujuan');
    } else {
      return matchesSearch && (s.status === 'Selesai' || s.status === 'Ditolak');
    }
  });

  const generateSuratPDF = (surat: any) => {
    const doc = new jsPDF();
    const settings = getSetting("KOP_SURAT") || {};
    
    // Kop Surat
    if (settings.logo_url) {
       // logic to add image would go here if needed, 
       // but for now let's use text based kop
    }
    
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(settings.nama_organisasi?.toUpperCase() || "RUKUN TETANGGA 04 / RUKUN WARGA 09", 105, 15, { align: 'center' });
    doc.text(settings.kelurahan?.toUpperCase() || "KELURAHAN KEBALEN - KECAMATAN BABELAN", 105, 22, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text(settings.alamat || "Sekretariat: Blok AM No. 12, Kebalen, Bekasi", 105, 28, { align: 'center' });
    doc.line(20, 32, 190, 32);
    doc.line(20, 33, 190, 33);

    // Nomor Surat
    doc.setFontSize(12);
    doc.setFont("times", "bold");
    doc.text(surat.jenis?.toUpperCase() || "SURAT PENGANTAR", 105, 45, { align: 'center' });
    doc.setFont("times", "normal");
    doc.text(`Nomor: ${surat.nomorSurat || '... / RT.04 / RW.09 / ' + new Date().getFullYear()}`, 105, 51, { align: 'center' });

    // Isi
    doc.setFontSize(11);
    doc.text("Yang bertanda tangan di bawah ini Ketua RT.04 / RW.09 Kelurahan Kebalen menerangkan bahwa:", 20, 65);
    
    const fields = [
      ["Nama Lengkap", surat.pemohon],
      ["NIK", surat.nik || "-"],
      ["Tempat, Tgl Lahir", surat.ttl || "-"],
      ["Alamat", surat.alamat || "-"],
      ["Keperluan", surat.keterangan || "Administrasi"],
    ];

    let currentY = 75;
    fields.forEach(f => {
      doc.text(f[0], 30, currentY);
      doc.text(": " + f[1], 70, currentY);
      currentY += 8;
    });

    const bodyText = `Orang tersebut di atas adalah benar warga kami yang bertempat tinggal di alamat tersebut di atas. Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.`;
    const splitText = doc.splitTextToSize(bodyText, 170);
    doc.text(splitText, 20, currentY + 10);

    // Tanda Tangan
    const footerY = 220;
    doc.text("Bekasi, " + new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }), 140, footerY);
    doc.text("Ketua RT. 04 / RW. 09", 140, footerY + 7);
    
    doc.text("( ____________________ )", 140, footerY + 40);

    doc.save(`Surat_${surat.pemohon}_${Date.now()}.pdf`);
    showNotification("Dokumen Surat siap diunduh.", "success");
  };

  const handleSaveSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingSurat ? editingSurat.id : `SRT-${Date.now()}`;
    
    const type = formData.get('jenis') as string;
    const keterangan = formData.get('keterangan') as string;
    
    let pemohon = currentUser.nama || currentUser.name || "Warga";
    let nik = currentUser.nik || "-";
    let alamat = currentUser.alamat || "-";
    let ttl = currentUser.ttl || "-";

    if (isPengurus) {
       const selectedWargaId = formData.get('wargaId') as string;
       const w = wargaData.find((w:any) => w.id === selectedWargaId);
       if (w) {
          pemohon = w.nama;
          nik = w.nik || "-";
          alamat = w.alamat || w.blok || "-";
          ttl = `${w.tempatLahir}, ${w.tglLahir}`;
       }
    }

    const payload = {
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: new Date().toISOString(),
      jenis: type,
      pemohon,
      nik,
      alamat,
      ttl,
      status: isPengurus ? 'Selesai' : 'Menunggu Persetujuan',
      keterangan,
      userId: currentUser.uid || currentUser.id_user || null,
      nomorSurat: editingSurat?.nomorSurat || `${Math.floor(Math.random() * 999).toString().padStart(3, '0')}/RT.04/RW.09/${new Date().getFullYear()}`
    };

    setIsLoadingDB(true);
    try {
      if (editingSurat) {
        await updateDoc(doc(db, 'surat', id), payload);
        setSuratData((prev: any) => prev.map((s: any) => s.id === id ? payload : s));
        showNotification('Surat berhasil diperbarui', 'success');
      } else {
        await setDoc(doc(db, 'surat', id), payload);
        setSuratData((prev: any) => [payload, ...prev]);
        showNotification('Permohonan surat berhasil dikirim', 'success');
      }
      setShowForm(false);
      setEditingSurat(null);
    } catch (err: any) {
      handleFirestoreError(err, editingSurat ? 'update' : 'create', 'surat');
      showNotification('Gagal menyimpan surat', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleApproveSurat = async (s: any) => {
    if (!window.confirm("Approve permohonan surat ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', s.id), { status: 'Selesai', approvedAt: new Date().toISOString() });
      setSuratData((prev: any) => prev.map((item: any) => item.id === s.id ? { ...item, status: 'Selesai' } : item));
      showNotification('Surat disetujui', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleRejectSurat = async (s: any) => {
    if (!window.confirm("Tolak permohonan surat ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', s.id), { status: 'Ditolak' });
      setSuratData((prev: any) => prev.map((item: any) => item.id === s.id ? { ...item, status: 'Ditolak' } : item));
      showNotification('Surat ditolak', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteSurat = async () => {
    if (!suratToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'surat', suratToDelete.id));
      setSuratData((prev: any) => prev.filter((s: any) => s.id !== suratToDelete.id));
      showNotification('Catatan surat dihapus.', 'success');
      setSuratToDelete(null);
    } catch (err: any) {
      handleFirestoreError(err, 'delete', 'surat');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('berjalan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-black transition-all ${activeSubTab === 'berjalan' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Clock className="w-4 h-4" />
          <span className="uppercase">Sedang Berjalan</span>
        </button>
        <button
          onClick={() => setActiveSubTab('arsip')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-black transition-all ${activeSubTab === 'arsip' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <History className="w-4 h-4" />
          <span className="uppercase">Riwayat / Arsip</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <span className="p-2 bg-blue-100 text-blue-600 rounded-xl"><FileText className="w-5 h-5" /></span>
              Manajemen Surat Pengantar
            </h3>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
              Total: {filteredSurat.length} Dokumen
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari pemohon / jenis..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
              <PlusCircle className="w-4 h-4" /> 
              Buat Permohonan
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSurat.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
               <History className="w-12 h-12 mb-3 opacity-20" />
               <p className="font-bold">Tidak ada permohonan surat ditemukan.</p>
            </div>
          )}
          {filteredSurat.map((s) => (
            <motion.div 
              layout key={s.id} 
              className="group bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm hover:shadow-xl hover:border-blue-200 hover:ring-1 hover:ring-blue-100 transition-all cursor-pointer relative flex flex-col"
              onClick={() => setViewingSurat(s)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${s.status === 'Selesai' ? 'bg-green-50 text-green-600' : s.status === 'Ditolak' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                    {new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${s.status === 'Selesai' ? 'bg-green-100 text-green-700' : s.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                  {s.status}
                </span>
                <h4 className="font-black text-slate-800 mt-2 mb-1 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">{s.jenis}</h4>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span>{s.pemohon}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                 <div className="flex -space-x-1">
                    {isPengurus && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); s.status === 'Selesai' ? generateSuratPDF(s) : handleApproveSurat(s); }} 
                          className={`p-2 rounded-xl border border-slate-100 transition-all ${s.status === 'Selesai' ? 'bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                        >
                          {s.status === 'Selesai' ? <Printer className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        {s.status === 'Menunggu Persetujuan' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleRejectSurat(s); }}
                            className="p-2 ml-2 rounded-xl border border-slate-100 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                    {!isPengurus && s.status === 'Selesai' && (
                       <button 
                        onClick={(e) => { e.stopPropagation(); generateSuratPDF(s); }} 
                        className="p-2 rounded-xl bg-slate-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-slate-100 transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                 </div>
                 <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingSurat(s); setShowForm(true); }}
                      className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSuratToDelete(s); }}
                      className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[120] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-600 text-white rounded-xl"><FileText className="w-4 h-4" /></div>
                  {editingSurat ? 'Edit Permohonan Surat' : 'Buat Permohonan Surat Baru'}
                </h3>
                <button onClick={() => { setShowForm(false); setEditingSurat(null); }} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSaveSurat} ref={formRef} className="p-6 overflow-y-auto space-y-5">
                {isPengurus && (
                   <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                    <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest">Pilih Warga Pemohon</label>
                    <select name="wargaId" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">-- Manual/Luar Warga --</option>
                      {wargaData.map((w:any) => <option key={w.id} value={w.id} selected={editingSurat?.nik === w.nik}>{w.nama} ({w.nik})</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Jenis Surat / Keperluan</label>
                  <select name="jenis" defaultValue={editingSurat?.jenis || "Surat Pengantar KTP"} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                    <option value="Surat Pengantar KTP">Surat Pengantar KTP / KK</option>
                    <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                    <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu (SKTM)</option>
                    <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                    <option value="Surat Keterangan Usaha">Surat Keterangan Usaha (SKU)</option>
                    <option value="Lainnya">Keperluan Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keterangan / Alasan Tambahan</label>
                  <textarea name="keterangan" defaultValue={editingSurat?.keterangan || ""} rows={3} placeholder="Contoh: Mengantar anak sekolah, Melamar pekerjaan, dll..." className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                   <div className="flex items-center gap-2 text-blue-600 mb-2">
                     <Info className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Informasi Penting</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Permohonan akan diproses oleh Ketua RT/RW. Anda dapat mengunduh dokumen secara mandiri di menu "Arsip" setelah status berubah menjadi <span className="text-green-600 font-bold">"Selesai"</span>.</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={() => { setShowForm(false); setEditingSurat(null); }} className="flex-1 py-3 px-6 text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">Batal</button>
                  <button type="submit" className="flex-[2] py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 uppercase tracking-widest active:scale-95">
                    {editingSurat ? 'Simpan Perubahan' : 'Kirim Permohonan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingSurat && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative">
                <div className="p-6 pb-20">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <button onClick={() => setViewingSurat(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{viewingSurat.jenis}</h4>
                        <div className={`mt-2 inline-flex py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest ${viewingSurat.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {viewingSurat.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 pt-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><User className="w-4 h-4" /></div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Pemohon</p>
                               <p className="text-sm font-bold text-slate-700 mt-0.5">{viewingSurat.pemohon}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><MapPin className="w-4 h-4" /></div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Alamat</p>
                               <p className="text-sm font-bold text-slate-700 mt-0.5">{viewingSurat.alamat}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Calendar className="w-4 h-4" /></div>
                            <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Diajukan Pada</p>
                               <p className="text-sm font-bold text-slate-700 mt-0.5">{new Date(viewingSurat.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                            </div>
                         </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keperluan / Keterangan</p>
                         <p className="text-xs font-medium text-slate-600 italic">"{viewingSurat.keterangan || 'Tidak ada keterangan tambahan'}"</p>
                      </div>
                   </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                   {isPengurus && viewingSurat.status === 'Menunggu Persetujuan' && (
                     <>
                        <button onClick={() => { handleApproveSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-200">Setujui</button>
                        <button onClick={() => { handleRejectSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-200">Tolak</button>
                     </>
                   )}
                   {viewingSurat.status === 'Selesai' && (
                      <button onClick={() => generateSuratPDF(viewingSurat)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4" /> Cetak Dokumen PDF
                      </button>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {suratToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Catatan Surat"
            message={`Apakah Anda yakin ingin menghapus permohonan surat "${suratToDelete?.jenis}" milik "${suratToDelete?.pemohon}"?`}
            onConfirm={handleDeleteSurat}
            onCancel={() => setSuratToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
