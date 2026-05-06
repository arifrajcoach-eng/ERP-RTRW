import React, { useState, useRef, useMemo } from 'react';
import { 
  Users, Trash2, Edit2, Download, Printer, UserPlus, 
  MapPin, Phone, Info, Search, X, CheckCircle, AlertCircle, Eye, EyeOff, ClipboardList, Trash, ShieldCheck, LogOut, Menu, Lock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

interface WargaViewProps {
  wargaData: any[];
  currentTenant?: any;
  setWargaData: any;
  userRole: string;
  tenantId: string;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  handleFileUpload: any;
  showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void;
  currentUser: any;
}

const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  const parts = tglLahir.split('-');
  if (parts.length !== 3) return "-";
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function WargaView({ 
  wargaData, 
  currentTenant, 
  setWargaData, 
  userRole, 
  tenantId, 
  setIsLoadingDB, 
  handleFirestoreError, 
  handleFileUpload, 
  showNotification, 
  currentUser 
}: WargaViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isRTAdmin = currentUser?.role === 'RT';
  const myRT = currentUser?.rt || '01';
  const [filterRT, setFilterRT] = useState(isRTAdmin ? myRT : "Semua");
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaIds, setSelectedWargaIds] = useState<string[]>([]);
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredWargaData = useMemo(() => {
    const uniqueMap: Record<string, any> = {};
    wargaData.forEach(w => {
      const id = w.nik || w.docId || w.id || Math.random().toString();
      const existing = uniqueMap[id];
      if (!existing || (w.terverifikasi && !existing.terverifikasi)) {
        uniqueMap[id] = w;
      }
    });

    const uniqueWarga = Object.values(uniqueMap);
    return uniqueWarga.filter((w: any) => {
      const normalize = (val: string) => val ? val.toString().replace(/^0+/, '') : "";
      const filterRTNormalized = filterRT === "Semua" ? "Semua" : filterRT.replace(/^0+/, '');
      const filterRWNormalized = filterRW === "Semua" ? "Semua" : filterRW.replace(/^0+/, '');
      const matchRT = filterRT === "Semua" || normalize(w.rt || "") === filterRTNormalized;
      const matchRW = filterRW === "Semua" || normalize(w.rw || "") === filterRWNormalized;
      
      let matchUmur = true;
      if (filterKategoriUmur !== "Semua") {
        const ageResult = calculateAge(w.tglLahir);
        const age = typeof ageResult === 'number' ? ageResult : -1;
        if (age !== -1) {
          if (filterKategoriUmur === "Balita") matchUmur = age <= 5;
          else if (filterKategoriUmur === "Remaja") matchUmur = age >= 6 && age <= 17;
          else if (filterKategoriUmur === "Dewasa") matchUmur = age >= 18 && age < 60;
          else if (filterKategoriUmur === "Lansia") matchUmur = age >= 60;
        } else matchUmur = false;
      }
      
      const searchLower = searchQuery.toLowerCase();
      return matchRT && matchRW && matchUmur && (searchQuery === "" || 
        w.nama?.toLowerCase().includes(searchLower) ||
        w.nik?.toLowerCase().includes(searchLower) ||
        w.kk?.toLowerCase().includes(searchLower));
    });
  }, [wargaData, filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const displayedWarga = filteredWargaData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startEdit = (warga: any) => {
    setEditingWarga(warga);
    setShowEditForm(true);
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'data_warga', wargaToDelete.docId || wargaToDelete.nik));
      setWargaToDelete(null);
      showNotification("Data warga berhasil dihapus");
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/data_warga`);
    } finally {
      setIsDeletingWarga(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 uppercase">
            <Users className="w-8 h-8 text-brand-blue" />
            Data Warga {currentTenant?.name || ''}
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total: {filteredWargaData.length} Warga Terdaftar</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-blue/25">
          <UserPlus size={18} /> Tambah Warga
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Cari Nama / NIK..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none text-sm font-bold text-slate-600" />
            </div>
            <select value={filterRT} onChange={(e) => setFilterRT(e.target.value)} className="bg-slate-50 border-none rounded-2xl py-4 px-4 outline-none text-sm font-bold text-slate-600">
              <option value="Semua">RT: Semua</option>
              {Array.from({length: 10}, (_, i) => String(i+1).padStart(2, '0')).map(rt => <option key={rt} value={rt}>{`RT ${rt}`}</option>)}
            </select>
            <div className="flex items-center gap-2 md:col-span-2">
               <button className="flex-1 bg-indigo-50 text-indigo-600 h-full rounded-2xl font-black uppercase text-[10px] tracking-widest border border-indigo-100 flex items-center justify-center gap-2 py-4"> <Download size={14} /> Ekspor </button>
               <button className="flex-1 bg-emerald-50 text-emerald-600 h-full rounded-2xl font-black uppercase text-[10px] tracking-widest border border-emerald-100 flex items-center justify-center gap-2 py-4"> <Printer size={14} /> Cetak </button>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em]">Nama / NIK</th>
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em]">RT/RW</th>
                  <th className="py-5 px-4 font-black uppercase text-[10px] text-slate-400 tracking-[0.2em]">Status</th>
                  <th className="py-5 px-4 text-center font-black uppercase text-[10px] text-slate-400 tracking-[0.2em]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedWarga.map((w: any) => (
                  <tr key={w.docId || w.id} className="hover:bg-slate-50/50 group transition-all">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-brand-blue font-black shadow-inner overflow-hidden">
                            {w.foto ? <img src={w.foto} className="w-full h-full object-cover" /> : w.nama.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight leading-none mb-1">{w.nama}</p>
                            <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{w.nik}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                       <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-black font-mono">{w.rt}/{w.rw}</span>
                    </td>
                    <td className="py-5 px-4">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                         w.status === 'Warga Tetap' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                       }`}>
                         {w.status}
                       </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setViewWarga(w)} className="p-2 text-slate-400 hover:text-brand-blue bg-white shadow-sm border border-slate-100 rounded-xl transition-all"> <Eye size={16} /> </button>
                        <button onClick={() => startEdit(w)} className="p-2 text-slate-400 hover:text-brand-blue bg-white shadow-sm border border-slate-100 rounded-xl transition-all"> <Edit2 size={16} /> </button>
                        <button onClick={() => setWargaToDelete(w)} className="p-2 text-slate-400 hover:text-red-500 bg-white shadow-sm border border-slate-100 rounded-xl transition-all"> <Trash2 size={16} /> </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
