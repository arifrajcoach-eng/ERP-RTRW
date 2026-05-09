import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

export function ComplaintView({ currentUser, showNotification, handleFirestoreError }: any) {
  const [jenisKeluhan, setJenisKeluhan] = useState('Kebersihan');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        tenantId: currentUser.tenantId || 'RW26_SMART',
        userId: currentUser.uid || 'anonymous',
        namaWarga: currentUser.name,
        jenisKeluhan,
        deskripsi,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      showNotification('Keluhan berhasil dikirim!', 'success');
      setDeskripsi('');
    } catch (e) {
      handleFirestoreError(e, 'create', 'complaints');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-4">Lapor Keluhan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select 
            value={jenisKeluhan} 
            onChange={(e) => setJenisKeluhan(e.target.value)}
            className="w-full p-3 border rounded-lg"
        >
            <option>Kebersihan</option>
            <option>Keamanan</option>
            <option>Fasilitas</option>
            <option>Lainnya</option>
        </select>
        <textarea 
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsikan keluhan Anda..."
            className="w-full p-3 border rounded-lg"
            rows={4}
            required
        />
        <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">
            {isSubmitting ? 'Mengirim...' : 'Kirim Keluhan'}
        </button>
      </form>
    </div>
  );
}
