import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, PlusCircle, Search, Calendar, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function SampahView({ 
  sampahData, setIsLoadingDB, handleFirestoreError, tenantId, showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'requests' | 'payments'>('schedule');
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
       <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-slate-200/50 border border-slate-100 flex gap-2">
          {[
            { id: 'schedule', label: 'Jadwal Rutin', icon: Calendar },
            { id: 'requests', label: 'Permintaan Khusus', icon: Truck },
            { id: 'payments', label: 'Tagihan Iuran', icon: CheckCircle }
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

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
             <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 text-emerald-600">
                <Trash2 className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Armada</p>
                <p className="text-2xl font-black text-slate-900 mt-2">2 Unit</p>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 text-blue-600">
                <Truck className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Angkutan Hari Ini</p>
                <p className="text-2xl font-black text-slate-900 mt-2">RT 01, RT 02</p>
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6">
             <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 text-amber-600">
                <Clock className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Permintaan Antrian</p>
                <p className="text-2xl font-black text-slate-900 mt-2">5 Request</p>
             </div>
          </div>
       </div>

       <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="flex justify-between items-start mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Jadwal Pengangkutan Sampah</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Monitoring rutin kebersihan lingkungan warga.</p>
             </div>
             <button onClick={() => setShowAddForm(true)} className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-200">
                <PlusCircle className="w-4 h-4" /> Tambah Jadwal
             </button>
          </div>

          <div className="space-y-4">
             {['Senin', 'Rabu', 'Jumat'].map(day => (
               <div key={day} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-emerald-100">
                        <Calendar className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-800">{day}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pukul 08:00 - 10:00 WIB</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl uppercase tracking-widest">Aktif</span>
                     <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Search className="w-4 h-4" /></button>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}
