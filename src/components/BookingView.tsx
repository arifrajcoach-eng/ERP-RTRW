import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Calendar, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export function BookingView({ currentUser, showNotification, handleFirestoreError }: any) {
  const [namaFasilitas, setNamaFasilitas] = useState('Aula RW');
  const [tanggal, setTanggal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    
    const isAtLeastPengurus = ['ADMIN', 'SUPER_ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser.role);
    const tId = currentUser.tenantId || 'RW26_SMART';
    
    let q;
    if (isAtLeastPengurus) {
       q = query(
        collection(db, 'bookings'),
        where('tenantId', '==', tId),
        orderBy('createdAt', 'desc')
      );
    } else {
       q = query(
        collection(db, 'bookings'),
        where('userId', '==', (currentUser.uid || currentUser.id_user || 'anonymous')),
        orderBy('createdAt', 'desc')
      );
    }

    let unsubscribeFallback: (() => void) | null = null;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyBookings(data);
    }, (err) => {
      if (err.message?.includes('index')) {
        console.warn('Booking index missing, using client-side sort');
        const fallbackQ = query(
          collection(db, 'bookings'),
          where('tenantId', '==', tId)
        );
        unsubscribeFallback = onSnapshot(fallbackQ, (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setMyBookings(data);
        });
      } else {
        handleFirestoreError(err, 'list', 'bookings');
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeFallback) unsubscribeFallback();
    };
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!currentUser) {
        showNotification('Sesi anda telah berakhir. Silakan login kembali.', 'error');
        return;
      }

      await addDoc(collection(db, 'bookings'), {
        tenantId: currentUser.tenantId || 'RW26_SMART',
        userId: currentUser.uid || currentUser.id_user || 'anonymous',
        namaWarga: currentUser.name || currentUser.nama || 'Warga',
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-green-600" />
          Booking Fasilitas & Inventaris
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pilih Fasilitas / Inventaris</label>
              <select 
                value={namaFasilitas} 
                onChange={(e) => setNamaFasilitas(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option>Aula RW</option>
                <option>Lapangan Olahraga</option>
                <option>Tenda Acara</option>
                <option>Kursi (Set)</option>
                <option>Sound System</option>
                <option>Proyektor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Tanggal Pemakaian</label>
              <input 
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Keperluan / Alasan Peminjaman</label>
            <input 
              type="text"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Contoh: Acara Silaturahmi Keluarga, Rapat Blok, dll."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-[0.98]">
            {isSubmitting ? 'Memproses...' : 'Kirim Permohonan Booking'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">
          {['ADMIN', 'SUPER_ADMIN', 'RW', 'RT'].includes(currentUser?.role) ? 'Daftar Peminjaman Wilayah' : 'Riwayat Peminjaman Saya'}
        </h3>
        <div className="space-y-4">
          {myBookings.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada riwayat peminjaman</p>
            </div>
          )}
          {myBookings.map((b) => (
            <div key={b.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all hover:shadow-md border-l-4 border-l-green-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md">{b.namaFasilitas}</span>
                  <p className="text-xs font-bold text-slate-800 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(b.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  b.status === 'APPROVED' || b.status === 'Disetujui' ? 'bg-green-100 text-green-700' :
                  b.status === 'REJECTED' || b.status === 'Ditolak' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {b.status === 'APPROVED' || b.status === 'Disetujui' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {b.status}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-600 italic">"{b.keperluan}"</p>
              <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Diajukan pada: {new Date(b.createdAt).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
