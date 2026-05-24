import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Mail, Phone, Users, UserPlus, CheckCircle2, Trash2 } from 'lucide-react';

export function DaftarPendaftarTrialView({ onAdd }: any) {
  const [registrants, setRegistrants] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistrants(data.filter((t: any) => 
        t.id.startsWith('TRIAL_') || 
        t.status === 'TRIAL' || 
        t.plan === 'TRIAL' || 
        t.registrationType === 'AUTOMATED_SELF_SERVICE'
      ));
    });
    return () => unsubscribe();
  }, []);

  const handleMarkAsContacted = async (id: string) => {
    try {
      await updateDoc(doc(db, 'tenants', id), {
        followUpStatus: 'CONTACTED'
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus pendaftar "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'tenants', id));
    } catch (err) {
      console.error('Error deleting tenant:', err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Tenant Trial</h2>
          <p className="text-sm text-slate-500">Pendaftar yang menggunakan mode 'Mulai Gratis'</p>
        </div>
        <button 
          onClick={onAdd}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <UserPlus size={16} />
          Tambah Trial Baru
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-black tracking-widest">
            <tr>
              <th className="p-4">Tenant Name</th>
              <th className="p-4">Admin Info</th>
              <th className="p-4">Created At</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {registrants.map((reg) => (
              <tr key={reg.id} className={reg.followUpStatus === 'NEW' ? 'bg-blue-50/30' : ''}>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{reg.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{reg.id}</div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Mail size={12} className="text-slate-400" /> {reg.adminEmail}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                      <Phone size={12} className="text-slate-400" /> {reg.adminPhone}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-slate-500">
                  {new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4">
                  {reg.followUpStatus === 'NEW' ? (
                    <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[9px] font-black uppercase rounded-lg border border-rose-200">New Beta</span>
                  ) : (
                    <span className="px-2 py-1 bg-slate-100 text-slate-400 text-[9px] font-black uppercase rounded-lg border border-slate-200">Followed Up</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <a href={`mailto:${reg.adminEmail}`} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" title="Send Email"><Mail size={16} /></a>
                    <a href={`https://wa.me/${reg.adminPhone?.replace(/[^0-9]/g, '')}`} target="_blank" className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors" title="WhatsApp"><Phone size={16} /></a>
                    {reg.followUpStatus === 'NEW' && (
                      <button 
                        onClick={() => handleMarkAsContacted(reg.id)}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm"
                        title="Mark as Followed Up"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(reg.id, reg.name)}
                      className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
