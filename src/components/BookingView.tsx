import React, { useState } from 'react';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

export function BookingView({ currentUser, showNotification, handleFirestoreError }: any) {
  const [namaFasilitas, setNamaFasilitas] = useState('Aula RW');
  const [tanggal, setTanggal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        tenantId: currentUser.tenantId || 'RW26_SMART',
        userId: currentUser.uid || 'anonymous',
        namaWarga: currentUser.name,
        namaFasilitas,
        tanggal,
        keperluan,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      showNotification('Booking berhasil dikirim!', 'success');
      setTanggal('');
      setKeperluan('');
    } catch (e) {
      handleFirestoreError(e, 'create', 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-4">Booking Fasilitas</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select 
            value={namaFasilitas} 
            onChange={(e) => setNamaFasilitas(e.target.value)}
            className="w-full p-3 border rounded-lg"
        >
            <option>Aula RW</option>
            <option>Lapangan Olahraga</option>
            <option>Tenda Acara</option>
            <option>Kursi</option>
        </select>
        <input 
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
        />
        <input 
            type="text"
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
            placeholder="Keperluan (misal: acara ultah)"
            className="w-full p-3 border rounded-lg"
            required
        />
        <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">
            {isSubmitting ? 'Memproses...' : 'Booking Fasilitas'}
        </button>
      </form>
    </div>
  );
}
