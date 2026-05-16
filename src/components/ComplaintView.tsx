import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export function ComplaintView({ currentUser, showNotification, handleFirestoreError }: any) {
  const [jenisKeluhan, setJenisKeluhan] = useState('Kebersihan');
  const [deskripsi, setDeskripsi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    
    const q = query(
      collection(db, 'complaints'),
      where('tenantId', '==', currentUser.tenantId || 'RW26_SMART'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComplaints(data);
    }, (err) => {
      handleFirestoreError(err, 'list', 'complaints');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'complaints'), {
        tenantId: currentUser.tenantId || 'RW26_SMART',
        userId: currentUser.uid || 'anonymous',
        namaWarga: currentUser.name || currentUser.nama || 'Warga',
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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Lapor Keluhan
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kategori Keluhan</label>
              <select 
                value={jenisKeluhan} 
                onChange={(e) => setJenisKeluhan(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option>Kebersihan</option>
                <option>Keamanan</option>
                <option>Fasilitas</option>
                <option>Penerangan Jalan</option>
                <option>Saluran Air</option>
                <option>Lainnya</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Detail Keluhan</label>
            <textarea 
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Deskripsikan keluhan Anda secara detail agar dapat segera ditindaklanjuti..."
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]">
            {isSubmitting ? 'Mengirim...' : 'Kirim Keluhan'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4">Riwayat Keluhan</h3>
        <div className="space-y-4">
          {complaints.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Belum ada riwayat keluhan</p>
            </div>
          )}
          {complaints.map((c) => (
            <div key={c.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all hover:shadow-md border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{c.jenisKeluhan}</span>
                  <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  c.status === 'DONE' || c.status === 'Selesai' ? 'bg-green-100 text-green-700' :
                  c.status === 'PROCESS' || c.status === 'Diproses' ? 'bg-orange-100 text-orange-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {c.status === 'DONE' || c.status === 'Selesai' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {c.status}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{c.deskripsi}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
