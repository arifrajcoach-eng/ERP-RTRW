import React, { useState, useRef } from 'react';
import { 
  PlusCircle, FileText, Activity, CheckCircle, Edit, Trash2, MessageCircle, X, Archive, Download, Printer 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { generateSuratHTML } from '../utils/suratTemplates';

interface SuratViewProps {
  suratData: any[];
  setSuratData: any;
  wargaData?: any[];
  usersData?: any[];
  userRole: string;
  currentUser: any;
  getSetting: (k: string) => any;
  kopSettings: any;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  settings: any;
  handleFileUpload: any;
}

export default function SuratView({ 
  suratData, setSuratData, wargaData = [], usersData = [], 
  userRole, currentUser, getSetting, kopSettings, 
  tenantId, setIsLoadingDB, handleFirestoreError, 
  showNotification, settings, handleFileUpload 
}: SuratViewProps) {
  const [activeView, setActiveView] = useState<'manajemen' | 'arsip'>('manajemen');
  const [showSuratForm, setShowSuratForm] = useState(false);
  const [editingSurat, setEditingSurat] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState("-1");
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const toRoman = (num: number) => {
    const map: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in map) {
      while (num >= map[i]) {
        roman += i;
        num -= map[i];
      }
    }
    return roman;
  };

  const getAutoNomorSurat = (rt: string, rw: string) => {
    const year = new Date().getFullYear();
    const month = toRoman(new Date().getMonth() + 1);
    const lastCount = suratData.length + 1;
    const num = `${lastCount}`.padStart(3, '0');
    return `${num}/RT.${rt}/RW.${rw}/${month}/${year}`;
  };

  const getPejabat = (rt: string, rw: string) => {
    const kRT = usersData.find(u => u.role === 'RT' && u.rt === rt)?.nama || "";
    const kRW = usersData.find(u => u.role === 'RW')?.nama || "";
    return { ketuaRT: kRT, ketuaRW: kRW };
  };

  const handleSearchWarga = (term: string) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const results = wargaData.filter(w => 
        w.nama?.toLowerCase().includes(term.toLowerCase()) || 
        w.nik?.includes(term)
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const autoFillForm = (warga: any) => {
    if (!formRef.current) return;
    const form = formRef.current;
    
    const setVal = (name: string, val: any) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (el) el.value = val || "";
    };

    const { ketuaRT, ketuaRW } = getPejabat(warga.rt || "", warga.rw || "");
    const nomorOtomatis = getAutoNomorSurat(warga.rt || "000", warga.rw || "000");

    setVal('pemohon', warga.nama);
    setVal('nik', warga.nik);
    setVal('ttl', `${warga.tempatLahir || ''}, ${warga.tglLahir || ''}`);
    setVal('jk', warga.jk);
    setVal('agama', warga.agama || 'Islam');
    setVal('pekerjaan', warga.profesi);
    setVal('statusKawin', warga.kawin);
    setVal('alamat', `${warga.blok || ''}, RT ${warga.rt || ''} / RW ${warga.rw || ''}`);
    setVal('rt', warga.rt);
    setVal('rw', warga.rw);
    setVal('kelurahan', warga.kelurahan);
    setVal('kecamatan', warga.kecamatan);
    setVal('kota_kab', warga.kota_kab);
    setVal('kk', warga.kk);
    setVal('kewarganegaraan', warga.kewarganegaraan || 'WNI');
    setVal('nomor_surat', nomorOtomatis);
    setVal('ketua', ketuaRT);
    setVal('ketua_rw_nama', ketuaRW);
    
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSetujui = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Selesai", tenantId: tenantId });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Selesai" } : s));
      showNotification("Pengajuan surat telah disetujui.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleTolak = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Ditolak", tenantId: tenantId });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Ditolak" } : s));
      showNotification("Pengajuan surat telah ditolak.", 'info');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data pengajuan?")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'surat', id));
      setSuratData((prev: any[]) => prev.filter(s => s.id !== id));
      showNotification("Data berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleCetak = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const html = generateSuratHTML(surat, kopSettings, settings);
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const isEditing = !!editingSurat;
    const suratId = isEditing ? editingSurat.id : `SRT-${Date.now()}`;
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const nAuto = (suratData.length + 1).toString().padStart(3, '0');
    const newNomorSurat = `${nAuto}/RT.${formData.get('rt') || '00'}/RW.${formData.get('rw') || '00'}/${mm}/${yyyy}`;
    const { ketuaRT, ketuaRW } = getPejabat(formData.get('rt') as string || "", formData.get('rw') as string || "");

    const suratDataPayload = {
      tenantId: tenantId,
      id: suratId,
      tanggal: isEditing ? editingSurat.tanggal : formattedDate,
      rt_user: formData.get('rt') as string || "01",
      nama_rt: kopSettings.nama_rt || "Rukun Tetangga",
      ketua: formData.get('ketua') as string || ketuaRT,
      ketua_rw_nama: formData.get('ketua_rw_nama') as string || ketuaRW,
      jabatan_ttd: formData.get('jabatan_ttd') as string || "Ketua RT",
      show_logo: formData.get('show_logo') as string || "yes",
      nomor_surat: formData.get('nomor_surat') as string || newNomorSurat,
      pemohon: formData.get('pemohon') as string,
      nik: formData.get('nik') as string,
      kk: formData.get('kk') as string,
      ttl: formData.get('ttl') as string,
      jk: formData.get('jk') as string,
      kewarganegaraan: formData.get('kewarganegaraan') as string,
      pekerjaan: formData.get('pekerjaan') as string,
      agama: formData.get('agama') as string,
      statusKawin: formData.get('statusKawin') as string,
      alamat: formData.get('alamat') as string,
      rt: formData.get('rt') as string || '',
      rw: formData.get('rw') as string || '',
      kelurahan: formData.get('kelurahan') as string || '',
      kecamatan: formData.get('kecamatan') as string || '',
      keperluan: formData.get('keperluan') as string,
      jenisSurat: formData.get('jenisSurat') as string,
      status: isEditing ? editingSurat.status : "Diajukan"
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'surat', suratId), suratDataPayload);
      if (isEditing) {
        setSuratData((prev: any[]) => prev.map(s => s.id === suratId ? suratDataPayload : s));
      } else {
        setSuratData([suratDataPayload, ...suratData]);
      }
      showNotification("Data berhasil disimpan.", 'success');
      setShowSuratForm(false);
      setEditingSurat(null);
    } catch (error: any) {
      handleFirestoreError(error, isEditing ? 'update' : 'create', `/surat/${suratId}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const monthMap: Record<string, string> = {
    "Jan": "0", "Feb": "1", "Mar": "2", "Apr": "3", "May": "4", "Jun": "5",
    "Jul": "6", "Aug": "7", "Sep": "8", "Oct": "9", "Nov": "10", "Dec": "11"
  };

  const filteredSurat = suratData.filter(s => {
    if (activeView === 'manajemen') return s.status === 'Diajukan';
    const matchesYear = filterYear === "Semua" || s.tanggal.includes(filterYear);
    const monthStr = s.tanggal.split(' ')[1];
    const sMonthIdx = monthMap[monthStr];
    const matchesMonth = filterMonth === "-1" || sMonthIdx === filterMonth;
    return s.status === 'Selesai' && matchesYear && matchesMonth;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengajuan</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{suratData.length}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><FileText className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Belum Diproses</p>
            <p className="text-2xl font-black text-orange-600 tracking-tighter">{suratData.filter(s => s.status === 'Diajukan').length}</p>
          </div>
          <div className="bg-orange-50 p-2 rounded-xl text-orange-600"><Activity className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Selesai</p>
            <p className="text-2xl font-black text-green-600 tracking-tighter">{suratData.filter(s => s.status === 'Selesai').length}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-xl text-green-600"><CheckCircle className="w-6 h-6" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setActiveView('manajemen')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${activeView === 'manajemen' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Manajemen</button>
             <button onClick={() => setActiveView('arsip')} className={`px-4 py-1.5 rounded-lg text-xs font-bold ${activeView === 'arsip' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}>Arsip Digital</button>
          </div>
          <div className="flex gap-2">
            {userRole !== 'Viewer' && (
              <button onClick={() => setShowSuratForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md">
                <PlusCircle className="w-3.5 h-3.5" /> Buat Surat
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
               <tr>
                 <th className="px-6 py-3">Tanggal</th>
                 <th className="px-6 py-3">Pemohon</th>
                 <th className="px-6 py-3">Jenis Surat</th>
                 <th className="px-6 py-3">Status</th>
                 <th className="px-6 py-3 text-center">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredSurat.map(surat => (
                 <tr key={surat.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-xs">{surat.tanggal}</td>
                    <td className="px-6 py-4 font-bold">{surat.pemohon}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{surat.jenisSurat}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${surat.status === 'Selesai' ? 'border-green-200 bg-green-50 text-green-700' : surat.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                        {surat.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2 justify-center">
                         <button onClick={() => handleCetak(surat.id)} className="p-2 text-blue-600 border rounded-lg hover:bg-blue-50" title="Cetak"><Printer className="w-4 h-4" /></button>
                         {userRole !== 'Viewer' && (
                           <>
                             {surat.status === 'Diajukan' && (
                               <>
                                 <button onClick={() => handleSetujui(surat.id)} className="p-2 text-green-600 border rounded-lg hover:bg-green-50" title="Setujui"><CheckCircle className="w-4 h-4" /></button>
                                 <button onClick={() => handleTolak(surat.id)} className="p-2 text-red-600 border rounded-lg hover:bg-red-50" title="Tolak"><Trash2 className="w-4 h-4" /></button>
                               </>
                             )}
                             <button onClick={() => {
                               const message = `Halo ${surat.pemohon}, status pengajuan surat ${surat.jenisSurat} Anda: ${surat.status}.`;
                               window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                             }} className="p-2 text-green-500 border rounded-lg hover:bg-green-50"><MessageCircle className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(surat.id)} className="p-2 text-slate-400 border rounded-lg hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                           </>
                         )}
                       </div>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>

      {showSuratForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Form Pengajuan Surat</h3>
                <button onClick={() => { setShowSuratForm(false); setEditingSurat(null); }}><X className="w-4 h-4" /></button>
             </div>
             <div className="p-4 bg-blue-50 border-b flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Cari data warga (Nama/NIK)..." 
                  value={searchTerm}
                  onChange={(e) => handleSearchWarga(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-xl text-sm"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-28 left-4 right-4 bg-white border rounded-xl shadow-lg z-10 overflow-hidden">
                    {searchResults.map((w, idx) => (
                      <div key={idx} onClick={() => autoFillForm(w)} className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0 text-sm font-medium">
                        {w.nama} - {w.nik}
                      </div>
                    ))}
                  </div>
                )}
             </div>
             <form ref={formRef} onSubmit={handleAddSurat} className="p-6 overflow-y-auto space-y-4">
               {/* Simplified Form for space */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Pemohon</label>
                    <input name="pemohon" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">NIK</label>
                    <input name="nik" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Surat</label>
                    <select name="jenisSurat" className="w-full px-3 py-2 border rounded-lg text-sm">
                       <option value="Surat Keterangan Domisili">Domisili</option>
                       <option value="Surat Pengantar Kelurahan">Pengantar Kelurahan</option>
                       <option value="Surat Keterangan Usaha">Ketetangan Usaha</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Keperluan</label>
                    <input name="keperluan" required className="w-full px-3 py-2 border rounded-lg text-sm" />
                  </div>
               </div>
               {/* Hidden / Autofilled fields will be populated via autoFillForm */}
               <input type="hidden" name="rt" />
               <input type="hidden" name="rw" />
               <input type="hidden" name="ttl" />
               <input type="hidden" name="jk" />
               <input type="hidden" name="alamat" />

               <div className="flex justify-end gap-2 mt-6">
                  <button type="button" onClick={() => setShowSuratForm(false)} className="px-4 py-2 border rounded-lg">Batal</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Kirim Pengajuan</button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
