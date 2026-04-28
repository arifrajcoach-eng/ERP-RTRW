import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, PlusCircle, Database, X, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, writeBatch, deleteDoc } from 'firebase/firestore';

export default function TenantsView({ 
  tenantsData, isLoadingDB, setIsLoadingDB, handleFirestoreError, showNotification 
}: { 
  tenantsData: any[], isLoadingDB: boolean, setIsLoadingDB: any, 
  handleFirestoreError: any, showNotification: any 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantId = formData.get('id') as string;
    const name = formData.get('name') as string;

    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      const tenant = {
        id: tenantId,
        name,
        adminEmail: formData.get('adminEmail') as string,
        status: formData.get('status') as string,
        createdAt: editingTenant?.createdAt || new Date().toISOString()
      };
      batch.set(doc(db, 'tenants', tenantId), tenant);
      await batch.commit();
      setShowAddForm(false);
      setEditingTenant(null);
      showNotification(`Tenant \${name} berhasil disimpan!`, "success");
    } catch (err) {
      showNotification("Gagal menyimpan tenant.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200">
               <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Lingkungan (Tenants)</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Kelola lisensi dan akses untuk berbagai komplek/lingkungan.</p>
            </div>
          </div>
          <button onClick={() => { setEditingTenant(null); setShowAddForm(true); }} className="px-8 py-5 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <PlusCircle className="w-4 h-4" /> Daftar Tenant
          </button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tenantsData.map((tenant) => (
            <div key={tenant.id} className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-100 flex items-start gap-8 group hover:border-blue-200 transition-all">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <Database className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
               </div>
               <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-lg font-black text-slate-900 leading-none">{tenant.name}</h4>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2 bg-blue-50 px-2 py-0.5 rounded inline-block">ID: {tenant.id}</p>
                     </div>
                     <span className={`px-3 py-1 text-[9px] font-black rounded-xl uppercase tracking-widest \${tenant.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {tenant.status}
                     </span>
                  </div>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
                     <p>{tenant.adminEmail || 'No Admin'}</p>
                     <div className="flex gap-4">
                        <button onClick={() => { setEditingTenant(tenant); setShowAddForm(true); }} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Edit</button>
                        <button onClick={async () => { if(confirm('Hapus tenant?')) { await deleteDoc(doc(db, 'tenants', tenant.id)); showNotification('Tenant dihapus', 'success'); } }} className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700">Hapus</button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>

       {showAddForm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowAddForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl p-10 overflow-hidden border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-8">{editingTenant ? 'Perbarui Tenant' : 'Tenant Baru'}</h3>
               <form onSubmit={handleSaveTenant} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">ID Tenant (Unik)</label>
                    <input name="id" defaultValue={editingTenant?.id} readOnly={!!editingTenant} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Organisasi / RT-RW</label>
                    <input name="name" defaultValue={editingTenant?.name} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Pengelola</label>
                      <input name="adminEmail" defaultValue={editingTenant?.adminEmail} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Paket Status</label>
                      <select name="status" defaultValue={editingTenant?.status || 'Active'} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700">
                         <option value="Active">Aktif / Berlangganan</option>
                         <option value="Trial">Masa Percobaan</option>
                         <option value="Suspended">Ditangguhkan</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200">Simpan Tenant</button>
               </form>
            </motion.div>
         </div>
       )}
    </div>
  );
}
