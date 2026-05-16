import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { addDoc, collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Calendar, Clock, CheckCircle2, AlertCircle, Building2, Check, X, Printer } from 'lucide-react';

export function BookingView({ currentUser, showNotification, handleFirestoreError, settings, bookingsData }: any) {
  const [namaFasilitas, setNamaFasilitas] = useState('Aula RW');
  const [tanggal, setTanggal] = useState('');
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter bookings for regular users to only show their own, unless they are pengurus
  const isAtLeastPengurus = ['ADMIN', 'SUPER_ADMIN', 'RW', 'RT', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser?.role);
  
  const myBookings = isAtLeastPengurus 
    ? bookingsData 
    : bookingsData.filter((b: any) => b.userId === (currentUser.uid || currentUser.id_user));

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid || currentUser.id_user
      });
      showNotification(`Booking berhasil ${newStatus === 'APPROVED' ? 'disetujui' : 'ditolak'}!`, 'success');
    } catch (e) {
      handleFirestoreError(e, 'update', `bookings/${bookingId}`);
    }
  };

  const handlePrintBooking = (b: any) => {
    const kop = settings?.KOP_SURAT || {};
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Bukti Peminjaman Fasilitas - ${b.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              @page { margin: 1.5cm; }
              body { background: white; }
            }
          </style>
        </head>
        <body class="p-8 font-sans">
          <div class="max-w-2xl mx-auto border p-10 rounded-xl bg-white shadow-sm">
            <div class="flex items-center border-b-2 border-black pb-4 mb-6">
               ${kop.logo_url ? `<img src="${kop.logo_url}" class="w-16 h-16 object-contain mr-4" />` : ''}
               <div class="flex-1 text-center">
                 <h1 class="text-xl font-bold uppercase">RUKUN TETANGGA ${currentUser.rt || kop.rt || '...'} / RUKUN WARGA ${currentUser.rw || kop.rw || '...'}</h1>
                 <p class="text-sm font-bold uppercase">Kelurahan ${kop.kelurahan || '...'} - Kecamatan ${kop.kecamatan || '...'}</p>
                 <p class="text-[10px] mt-1 italic">${kop.alamat || ''}</p>
               </div>
            </div>

            <div class="text-center mb-8">
              <h2 class="text-lg font-bold underline uppercase">SURAT IZIN PEMAKAIAN FASILITAS / INVENTARIS</h2>
              <p class="text-xs font-mono mt-1">Nomor Booking: ${b.id}</p>
            </div>

            <p class="mb-6 leading-relaxed">
              Diterangkan bahwa permohonan peminjaman fasilitas/inventaris berikut telah <strong>DISETUJUI</strong> oleh Pengurus:
            </p>

            <div class="space-y-4 text-sm leading-relaxed mb-10">
              <div class="grid grid-cols-[180px_10px_1fr] gap-2">
                <span class="font-bold">Fasilitas / Barang</span><span>:</span><span>${b.namaFasilitas}</span>
                <span class="font-bold">Tanggal Pemakaian</span><span>:</span><span>${new Date(b.tanggal).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})}</span>
                <span class="font-bold">Nama Peminjam</span><span>:</span><span>${b.namaWarga}</span>
                <span class="font-bold">Keperluan</span><span>:</span><span>${b.keperluan}</span>
              </div>
            </div>

            <div class="bg-blue-50 border border-blue-200 p-4 rounded-xl text-xs text-blue-800 leading-relaxed italic mb-10">
              Catatan: Mohon menjaga kebersihan dan kelestarian fasilitas/barang yang dipinjam. Kerusakan yang diakibatkan oleh kelalaian pemakaian menjadi tanggung jawab peminjam.
            </div>
            
            <div class="flex justify-between items-start mt-12">
               <div class="text-center w-48">
                 <p class="mb-20 text-xs">Peminjam / Pemohon,</p>
                 <p class="font-bold underline text-sm">( ${b.namaWarga} )</p>
               </div>
               <div class="text-center w-64">
                 <p class="mb-2 text-xs">Mengesahkan,</p>
                 <p class="mb-16 text-xs">Ketua RT/RW, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                 <p class="font-bold underline text-sm">( _________________________ )</p>
                 <p class="text-[10px] uppercase tracking-widest mt-1">Stempel & TTD Basah</p>
               </div>
            </div>
            
            <div class="mt-16 text-[8px] text-slate-400 text-center border-t pt-4">
              Dokumen ini dicetak otomatis melalui Layanan SmartRW dan sah secara hukum sebagai izin internal pemakaian fasilitas warga.
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => { window.print(); window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

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
          <Building2 className="w-5 h-5 text-[#52abcb]" />
          Booking Fasilitas & Inventaris
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Pilih Fasilitas / Inventaris</label>
              <select 
                value={namaFasilitas} 
                onChange={(e) => setNamaFasilitas(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#52abcb] outline-none"
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
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-[#52abcb] outline-none"
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
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#52abcb] outline-none"
              required
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-[#0cbb97] text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:opacity-90 shadow-lg shadow-emerald-100 transition-all active:scale-[0.98]">
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
            <div key={b.id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all hover:shadow-md border-l-4 border-l-[#52abcb]">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] font-black text-[#0184bb] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">{b.namaFasilitas}</span>
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
                {(b.status === 'APPROVED' || b.status === 'Disetujui') && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); handlePrintBooking(b); }}
                     className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
                     title="Cetak Izin Pemakaian"
                   >
                     <Printer className="w-3 h-3" />
                     Cetak
                   </button>
                )}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-slate-600 italic">"{b.keperluan}"</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">
                    Oleh: {b.namaWarga} • Diajukan: {new Date(b.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {isAtLeastPengurus && b.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleUpdateStatus(b.id, 'REJECTED')}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Tolak"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(b.id, 'APPROVED')}
                      className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                      title="Setujui"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
