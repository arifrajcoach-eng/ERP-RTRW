import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Recycle, LayoutDashboard, PlusCircle, HandCoins, Users, Settings, 
  History, Eye, Search, Upload, FileText, FileSpreadsheet, 
  Trash2, Edit, MessageCircle, Wallet, TrendingUp, X, CheckCircle 
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BankSampahView({ 
  sampahKategoriData, sampahSetoranData, sampahTarikSaldoData, 
  wargaData, currentUser, tenantId, handleFirestoreError, showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'setoran' | 'tarik' | 'nasabah' | 'kategori' | 'nasabah_detail'>('dashboard');
  const [searchQuery, setSearchQuery] = useState("");
  const [showSetoranForm, setShowSetoranForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const stats = {
    totalSampah: sampahSetoranData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.berat) || 0), 0),
    totalTabungan: sampahSetoranData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.total) || 0), 0) - 
                   sampahTarikSaldoData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0),
    nasabahAktif: new Set(sampahSetoranData.map((s: any) => s.nasabahId)).size
  };

  return (
    <div className="space-y-6">
       <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'setoran', label: 'Setoran', icon: PlusCircle },
            { id: 'tarik', label: 'Tarik Saldo', icon: HandCoins },
            { id: 'nasabah', label: 'Nasabah', icon: Users },
            { id: 'kategori', label: 'Harga', icon: Settings }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 \${activeSubTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
       </div>

       {activeSubTab === 'dashboard' && (
         <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                     <Recycle className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sampah Terkumpul</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.totalSampah.toFixed(1)} <span className="text-sm">kg</span></p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Tabungan Warga</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">Rp {stats.totalTabungan.toLocaleString()}</p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                     <Users className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nasabah Aktif</p>
                  <p className="text-3xl font-black text-slate-900 mt-2">{stats.nasabahAktif}</p>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8">Setoran Terakhir</h3>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                     <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-widest">
                           <th className="px-6 py-4">Nasabah</th>
                           <th className="px-6 py-4">Kategori</th>
                           <th className="px-6 py-4">Berat</th>
                           <th className="px-6 py-4">Total</th>
                           <th className="px-6 py-4">Aksi</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {sampahSetoranData.slice(0, 5).map((s: any) => (
                           <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-black">{s.namaNasabah}</td>
                              <td className="px-6 py-4">{s.namaKategori}</td>
                              <td className="px-6 py-4 font-bold text-emerald-600">{s.berat} kg</td>
                              <td className="px-6 py-4 font-black">Rp {s.total.toLocaleString()}</td>
                              <td className="px-6 py-4">
                                 <button className="text-blue-600 hover:underline">Detail</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
       )}

       {/* Similar structure for other tabs... */}
    </div>
  );
}
