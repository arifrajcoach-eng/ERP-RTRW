import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export const GuestBookFormPublic = ({ tenantId }: { tenantId: string }) => {
  const [formData, setFormData] = useState({ nama: '', nik: '', keperluan: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'buku_tamu'), {
        ...formData,
        tenantId,
        tanggal: new Date().toISOString(),
        status: 'TAMU'
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim data.');
    }
  };

  if (submitted) return <div className="p-8 text-center">Terima kasih, data telah tercatat.</div>;

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Buku Tamu Online - {tenantId}</h2>
      <input type="text" placeholder="Nama" required onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2 border rounded" />
      <input type="text" placeholder="NIK" required onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full p-2 border rounded" />
      <textarea placeholder="Keperluan" required onChange={e => setFormData({...formData, keperluan: e.target.value})} className="w-full p-2 border rounded" />
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">Kirim</button>
    </form>
  );
};
