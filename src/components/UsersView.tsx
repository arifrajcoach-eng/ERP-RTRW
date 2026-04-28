import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlusCircle, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export default function UsersView({ 
  usersData, setIsLoadingDB, handleFirestoreError, tenantId, showNotification 
}: { 
  usersData: any[], setIsLoadingDB: any, handleFirestoreError: any, 
  tenantId: string, showNotification: (m: string, t?: any) => void 
}) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id_user = editingUser ? editingUser.uid || editingUser.id_user : `USR-\${Date.now()}`;
    
    const userData = {
      id_user,
      nama: formData.get('nama') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as any,
      rt: formData.get('rt') as string,
      status: formData.get('status') as string,
      tenantId,
      created_at: editingUser?.created_at || new Date().toISOString()
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'users', id_user), userData);
      setShowForm(false);
      setEditingUser(null);
      showNotification(`Data pengguna berhasil \${editingUser ? 'diperbarui' : 'ditambahkan'}!`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, editingUser ? 'update' : 'create', `/users/\${id_user}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="flex justify-between items-start mb-10">
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Pengelola</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">Daftar akun admin, RT, RW, dan pengurus lingkungan.</p>
             </div>
             <button onClick={() => { setEditingUser(null); setShowForm(true); }} className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95">
                <PlusCircle className="w-4 h-4" /> Tambah User
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {usersData.map((user) => (
                <div key={user.uid || user.id_user} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-blue-200 transition-colors">
                         <span className="text-lg font-black text-blue-600">{(user.nama || user.username || 'U')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => { setEditingUser(user); setShowForm(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit className="w-4 h-4" /></button>
                         <button onClick={async () => { if(confirm('Hapus user ini?')) { await deleteDoc(doc(db, 'users', user.uid || user.id_user)); showNotification('User dihapus', 'success'); } }} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div>
                         <p className="text-[11px] font-black text-slate-900 leading-tight">{user.nama}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">@{user.username}</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase tracking-widest">{user.role}</span>
                         <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[8px] font-black rounded uppercase tracking-widest">RT {user.rt || '-'}</span>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {showForm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowForm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 overflow-hidden border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-8">{editingUser ? 'Edit Pengguna' : 'Pengguna Baru'}</h3>
               <form onSubmit={handleSaveUser} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nama Lengkap</label>
                    <input name="nama" defaultValue={editingUser?.nama} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                    <input name="username" defaultValue={editingUser?.username} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                      <select name="role" defaultValue={editingUser?.role || 'RT'} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700">
                         <option value="ADMIN">ADMIN</option>
                         <option value="RT">RT</option>
                         <option value="RW">RW</option>
                         <option value="BENDAHARA">BENDAHARA</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">RT</label>
                      <input name="rt" defaultValue={editingUser?.rt} required className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-[11px] font-bold text-slate-700 font-mono" />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200">Simpan Data</button>
               </form>
            </motion.div>
         </div>
       )}
    </div>
  );
}
