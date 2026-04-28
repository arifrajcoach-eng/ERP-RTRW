import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Baby, LayoutDashboard, Users, HeartPulse, Activity, Calendar, 
  PlusCircle, Search, Trash2, Edit, Printer, FileText, 
  MapPin, User, Stethoscope, Download, Upload, Info
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell 
} from 'recharts';

export default function PosyanduView({ 
  balitaData, ibuHamilData, posyanduKegiatanData, 
  pemeriksaanBalitaData, pemeriksaanPosbinduData, imunisasiData,
  wargaData, currentUser, tenantId, setIsLoadingDB, 
  handleFirestoreError, showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'balita' | 'ibuhamil' | 'kegiatan' | 'posbindu'>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const [showBalitaForm, setShowBalitaForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const formatTgl = (tgl: string) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calculateAgeMonths = (tglLahir: string) => {
    if (!tglLahir) return 0;
    const birth = new Date(tglLahir);
    const today = new Date();
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };

  const dashboardStats = {
    totalBalita: balitaData.length,
    totalIbuHamil: ibuHamilData.length,
    totalKegiatan: posyanduKegiatanData.length,
    stuntingCount: balitaData.filter((b: any) => b.statusStunting === 'Stunting').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-wrap gap-2">
         {[
           { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
           { id: 'balita', label: 'Monitor Balita', icon: Baby },
           { id: 'ibuhamil', label: 'Ibu Hamil', icon: HeartPulse },
           { id: 'posbindu', label: 'Posbindu', icon: Activity },
           { id: 'kegiatan', label: 'Agenda', icon: Calendar }
         ].map(tab => (
           <button 
             key={tab.id} 
             onClick={() => setActiveSubTab(tab.id as any)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 \${activeSubTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             <tab.icon className="w-4 h-4" /> {tab.label}
           </button>
         ))}
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Balita', val: dashboardStats.totalBalita, icon: Baby, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Ibu Hamil', val: dashboardStats.totalIbuHamil, icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Kasus Stunting', val: dashboardStats.stuntingCount, icon: Info, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Total Kegiatan', val: dashboardStats.totalKegiatan, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' }
              ].map(stat => (
                <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 group">
                   <div className={`w-12 h-12 \${stat.bg} \${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <stat.icon className="w-6 h-6" />
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                   <p className="text-3xl font-black text-slate-900 mt-2">{stat.val}</p>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Sebaran Status Gizi</h3>
                 <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={balitaData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="nama" hide />
                          <YAxis hide />
                          <Tooltip cursor={{fill: '#f8fafc'}} />
                          <Bar dataKey="beratBadan" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Kegiatan Mendatang</h3>
                 <div className="space-y-4">
                    {posyanduKegiatanData.slice(0, 3).map((k: any) => (
                      <div key={k.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between">
                         <div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{formatTgl(k.tanggal)}</p>
                            <p className="text-[11px] font-black text-slate-800 leading-tight mt-1">{k.lokasi}</p>
                         </div>
                         <div className="text-[8px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 uppercase tracking-widest">{k.status || 'Terjadwal'}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeSubTab === 'balita' && (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                 <input 
                   type="text" 
                   placeholder="Cari balita..." 
                   className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => { setEditingItem(null); setShowBalitaForm(true); }}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                <PlusCircle className="w-5 h-5" /> Data Balita
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {balitaData.filter((b: any) => b.nama.toLowerCase().includes(searchQuery.toLowerCase())).map((balita: any) => (
                <div key={balita.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl transition-all group overflow-hidden relative">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                         <Baby className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                         <p className="text-[11px] font-black text-slate-900 leading-tight">{balita.nama}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{calculateAgeMonths(balita.tglLahir)} Bulan</p>
                      </div>
                   </div>
                   <div className="space-y-3 mb-8">
                      <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-slate-400 uppercase tracking-widest">Orang Tua</span>
                         <span className="text-slate-800">{balita.namaOrangTua || '-'}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold">
                         <span className="text-slate-400 uppercase tracking-widest">Status Gizi</span>
                         <span className="text-emerald-600 font-black uppercase tracking-tighter">{balita.statusStunting || 'Normal'}</span>
                      </div>
                   </div>
                   <div className="flex gap-2 border-t border-slate-50 pt-6">
                      <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Lihat KMS</button>
                      <button onClick={() => deleteItem('balita', balita.id)} className="p-3 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
