import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

export function RTRegistrationForm({ onClose, onSave, showNotification, handleFirestoreError }: any) {
  const [formData, setFormData] = useState({ nama: '', email: '', rt: '01' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rtNumber = formData.rt.padStart(2, '0');
      const tenantId = `RW26_RT${rtNumber}`;
      const newUser = {
        nama: formData.nama,
        email: formData.email,
        tenantId,
        role: 'RT',
        status: 'AKTIF',
        isSuperAdmin: false,
        createdAt: new Date().toISOString()
      };
      
      // Use email as doc ID for simplicity in this example, or generate a unique ID
      await setDoc(doc(db, 'users', formData.email), newUser);
      
      showNotification('Pengurus RT berhasil didaftarkan!', 'success');
      onSave();
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, 'create', 'users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-800">Daftar Pengurus RT Baru</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Pengurus</label>
            <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nomor RT (01-10)</label>
            <select value={formData.rt} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500">
              {Array.from({length: 10}, (_, i) => String(i + 1).padStart(2, '0')).map(num => (
                <option key={num} value={num}>RT {num}</option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Daftarkan Pengurus'}
          </button>
        </form>
      </div>
    </div>
  );
}
