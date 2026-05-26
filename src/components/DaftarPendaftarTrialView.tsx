import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Mail, Phone, Users, UserPlus, CheckCircle2, Trash2, X, Send, AlertTriangle, Loader2, FileText, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const EMAIL_TEMPLATES = [
  {
    id: 'welcome',
    name: 'Setup & Selamat Datang',
    subject: 'Selamat Datang di SmartRW - Langkah Awal Aktivasi Portal Anda 🚀',
    body: (name: string, email: string) => `Yth. Pengelola ${name},

Terima kasih telah melakukan registrasi versi Trial Mandiri di portal SmartRW App.

Akun Administrator Anda telah berhasil diaktifkan:
- Tenant Portal ID: ${name.toLowerCase().replace(/\s+/g, '-')}
- Email Login: ${email}
- Wilayah Integrasi: Seluruh RT dan RW Anggota

Langkah Selanjutnya:
1. Masuk ke halaman Dashboard SmartRW Anda.
2. Tambahkan data warga perdana Anda pada menu "Manage Warga".
3. Ajukan template KOP Surat RT/RW pada menu KOP & Template.

Silakan balas email ini jika Anda memiliki pertanyaan atau kendala selama masa uji coba 14 hari gratis ini.

Salam Hangat,
Arif Coach - SmartRW Support Team`
  },
  {
    id: 'demo',
    name: 'Undangan Demo Fitur',
    subject: 'Optimalkan Administrasi Kelurahan Anda dengan SmartRW (Demo Personal) 🎯',
    body: (name: string, email: string) => `Yth. Pengurus ${name},

Kami melihat Anda baru saja menguji coba portal SmartRW untuk mempermudah layanan warga secara digital.

Bagaimana impresi awal Anda? Kami ingin mengundang Anda dalam sesi Live Demo singkat (15 menit) lewat Google Meet untuk menunjukkan beberapa fitur unggulan:
- Integrasi Surat Pengantar Otomatis mandiri oleh Warga
- Rekomendasi Tarif Iuran Bulanan & HPP Finansial terintegrasi
- Mading Digital interaktif dari Kamera HP langsung

Beri tahu kami waktu luang Anda untuk menjadwalkan demo eksklusif ini!

Hormat Kami,
Tim Hubungan Komunitas - SmartRW`
  },
  {
    id: 'upgrade',
    name: 'Penawaran Upgrade Premium',
    subject: 'Masa Trial Segera Selesai - Lanjutkan Transformasi Digital SmartRW Premium 💎',
    body: (name: string, email: string) => `Yth. Ketua RW / Admin Pengelola ${name},

Masa uji coba gratis (Trial) portal SmartRW di wilayah Anda akan segera berakhir dalam waktu dekat.

Agar seluruh data warga, arsip surat menyurat, dan laporan keuangan kas tetap tersimpan aman tanpa gangguan, kami menawarkan opsi Upgrade Paket Pro / Enterprise dengan keunggulan:
- Kuota Warga Tanpa Batas (Unlimited)
- Akses penuh ke Fitur AI Mading & Analisis Keuangan Cerdas
- Prioritas Layanan Pelanggan 24/7

Hubungi WhatsApp Official kami untuk aktivasi kupon diskon 15% perdana Anda.

Terima Kasih,
SmartRW Enterprise Partnership`
  }
];

export function DaftarPendaftarTrialView({ onAdd, showNotification, handleFirestoreError }: any) {
  const [registrants, setRegistrants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Email draft modal state
  const [selectedRegForEmail, setSelectedRegForEmail] = useState<any | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState('welcome');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Delete modal state
  const [selectedRegForDelete, setSelectedRegForDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'tenants'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const trialTenants = data.filter((t: any) => 
        t.id.startsWith('TRIAL_') || 
        t.status === 'TRIAL' || 
        t.plan === 'TRIAL' || 
        t.registrationType === 'AUTOMATED_SELF_SERVICE'
      );
      setRegistrants(trialTenants);
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      if (handleFirestoreError) {
        handleFirestoreError(error, 'list', 'tenants');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [handleFirestoreError]);

  // Handle template switch
  useEffect(() => {
    if (selectedRegForEmail) {
      const template = EMAIL_TEMPLATES.find(t => t.id === activeTemplateId);
      if (template) {
        setEmailSubject(template.subject);
        setEmailBody(template.body(selectedRegForEmail.name || '', selectedRegForEmail.adminEmail || ''));
      }
    }
  }, [activeTemplateId, selectedRegForEmail]);

  // Open email composer modal
  const handleOpenEmailModal = (reg: any) => {
    setSelectedRegForEmail(reg);
    setActiveTemplateId('welcome');
    const template = EMAIL_TEMPLATES.find(t => t.id === 'welcome');
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body(reg.name || '', reg.adminEmail || ''));
    }
  };

  // Submit & Simulate sending email follow up
  const handleSendEmailSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegForEmail) return;

    setIsSendingEmail(true);
    try {
      // Simulate API call to email gateway
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Attempt to auto update Firestore status to CONTACTED if it is currently NEW
      if (selectedRegForEmail.followUpStatus === 'NEW') {
        await updateDoc(doc(db, 'tenants', selectedRegForEmail.id), {
          followUpStatus: 'CONTACTED'
        });
      }

      if (showNotification) {
        showNotification(`Email berhasil diproses & dikirim ke ${selectedRegForEmail.adminEmail}`, 'success');
      }

      // Safe trigger native system mailto draft
      const mailtoUrl = `mailto:${selectedRegForEmail.adminEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;

      setSelectedRegForEmail(null);
    } catch (err: any) {
      console.error('Email sending error:', err);
      if (handleFirestoreError) {
        handleFirestoreError(err, 'update', `tenants/${selectedRegForEmail.id}`);
      } else if (showNotification) {
        showNotification('Gagal memproses pengiriman email!', 'error');
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Safe status update trigger (Follow up mark)
  const handleMarkAsContacted = async (id: string) => {
    try {
      await updateDoc(doc(db, 'tenants', id), {
        followUpStatus: 'CONTACTED'
      });
      if (showNotification) showNotification("Status tenant berhasil diupdate menjadi Followed Up!", "success");
    } catch (err: any) {
      console.error('Error updating status:', err);
      if (handleFirestoreError) {
        handleFirestoreError(err, 'update', `tenants/${id}`);
      }
    }
  };

  // Safe delete handler with UI Confirmation
  const handleConfirmDelete = async () => {
    if (!selectedRegForDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'tenants', selectedRegForDelete.id));
      if (showNotification) {
        showNotification(`Pendaftar "${selectedRegForDelete.name}" berhasil dihapus secara permanen!`, 'success');
      }
      setSelectedRegForDelete(null);
    } catch (err: any) {
      console.error('Error deleting tenant:', err);
      if (handleFirestoreError) {
        handleFirestoreError(err, 'delete', `tenants/${selectedRegForDelete.id}`);
      } else if (showNotification) {
        showNotification('Gagal menghapus tenant!', 'error');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" id="trial-tenants-view">
      {/* Header section styled to match professional dashboards */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Pendaftar Tenant Trial</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Kelola dan hubungi pendaftar sistem baru yang menggunakan mode 'Mulai Gratis'</p>
        </div>
        <button 
          id="btn-tambah-trial"
          onClick={onAdd}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer self-start"
        >
          <UserPlus size={14} />
          Tambah Trial Baru
        </button>
      </div>

      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat database tenant...</span>
        </div>
      ) : registrants.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-slate-400 opacity-50 mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak Ada Tenant Uji Coba</h3>
          <p className="text-xs text-slate-400 mt-1">Belum ada pendaftar trial atau semua pendaftar telah ditingkatkan ke paket premium.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="trial-tenants-table">
              <thead className="bg-slate-55 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="p-4 pl-6">Tenant Name</th>
                  <th className="p-4">Admin Info</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {registrants.map((reg) => (
                  <tr 
                    key={reg.id} 
                    id={`row-${reg.id}`}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all ${
                      reg.followUpStatus === 'NEW' 
                        ? 'bg-blue-50/25 dark:bg-blue-900/10' 
                        : ''
                    }`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">{reg.name}</div>
                      <div className="text-[9px] font-mono text-slate-400 mt-0.5">{reg.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Mail size={12} className="text-slate-400 shrink-0" />
                          <span>{reg.adminEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <Phone size={12} className="text-slate-400 shrink-0" />
                          <span>{reg.adminPhone || 'Belum diisi'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {reg.createdAt 
                        ? new Date(reg.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '-'
                      }
                    </td>
                    <td className="p-4">
                      {reg.followUpStatus === 'NEW' ? (
                        <div className="inline-flex items-center">
                          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[8px] font-black uppercase rounded-lg border border-red-200 dark:border-red-900/50 tracking-wide animate-pulse">
                            New Beta
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 text-[8px] font-black uppercase rounded-lg border border-slate-200 dark:border-slate-700/50 tracking-wide">
                            Followed Up
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex items-center justify-center gap-2">
                        {/* Custom Dialog Trigger for Send Email instead of raw mailto address */}
                        <button
                          id={`btn-email-${reg.id}`}
                          onClick={() => handleOpenEmailModal(reg)}
                          className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-105 active:scale-95 transition-all shadow-sm border border-blue-100 dark:border-blue-900/30 cursor-pointer"
                          title="Kirim Email Follow-Up"
                        >
                          <Mail size={14} />
                        </button>
                        
                        {/* WhatsApp External integration */}
                        {reg.adminPhone && (
                          <a
                            id={`btn-wa-${reg.id}`}
                            href={`https://wa.me/${reg.adminPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-110 active:scale-95 transition-all shadow-sm border border-emerald-100 dark:border-emerald-900/30 cursor-pointer flex items-center justify-center"
                            title="Buka WhatsApp Chat"
                          >
                            <Phone size={14} />
                          </a>
                        )}

                        {/* Quick Action to mark as followed up manually */}
                        {reg.followUpStatus === 'NEW' && (
                          <button 
                            id={`btn-contacted-${reg.id}`}
                            onClick={() => handleMarkAsContacted(reg.id)}
                            className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-105 active:scale-95 transition-all shadow-sm border border-indigo-100 dark:border-indigo-900/30 cursor-pointer"
                            title="Tandai Sudah Dihubungi"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {/* Safe dialog trigger for deleting instead of window.confirm */}
                        <button 
                          id={`btn-delete-${reg.id}`}
                          onClick={() => setSelectedRegForDelete(reg)}
                          className="p-2 bg-red-50 dark:bg-red-950/50 text-red-500 dark:text-red-450 rounded-xl hover:bg-red-105 hover:text-red-700 dark:hover:text-red-300 transition-all shadow-sm border border-red-100 dark:border-red-900/30 cursor-pointer"
                          title="Hapus Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDER MODALS UNDER ANIMATE PRESENCE TO ENSURE SMOOTH TRANSACTIONS */}
      <AnimatePresence>
        {/* Elegant modern email composer modal */}
        {selectedRegForEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop visual */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isSendingEmail) setSelectedRegForEmail(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col overflow-hidden max-h-[85vh] relative z-10"
              id="mading-email-composer-modal"
            >
              {/* Header */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Kirim Email Follow-Up</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Drafting korespondensi mandiri pendaftar trial baru</p>
                </div>
                <button 
                  onClick={() => setSelectedRegForEmail(null)}
                  disabled={isSendingEmail}
                  className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form container */}
              <form onSubmit={handleSendEmailSimulate} className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Send details info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Tenant Pemohon:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-bold text-sm">{selectedRegForEmail.name}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Penerima:</span>
                    <strong className="text-slate-700 dark:text-slate-200 font-semibold text-sm">{selectedRegForEmail.adminEmail}</strong>
                  </div>
                </div>

                {/* Quick Template Selector */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pilih Template Pesan:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {EMAIL_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setActiveTemplateId(tpl.id)}
                        className={`py-2 px-3 rounded-xl border text-left text-[11px] font-bold transition-all flex items-center justify-between group ${
                          activeTemplateId === tpl.id
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-900/50 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <span>{tpl.name}</span>
                        {activeTemplateId === tpl.id ? (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email Subject Input */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Subjek Email:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 dark:text-slate-100 transition-all"
                  />
                </div>

                {/* Email Body TextArea */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-sans">Isi Pesan Email:</label>
                  <textarea
                    rows={10}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-xs font-mono placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 dark:text-slate-100 leading-relaxed transition-all"
                  />
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedRegForEmail(null)}
                    disabled={isSendingEmail}
                    className="px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim & Tandai</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Elegant confirmation before delete */}
        {selectedRegForDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop visual */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isDeleting) setSelectedRegForDelete(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col items-center text-center relative z-10"
              id="confirm-delete-tenant-modal"
            >
              {/* Warning graphic */}
              <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/20">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Hapus Tenant Trial?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Anda akan menghapus record uji coba untuk <strong className="text-slate-700 dark:text-slate-200">"{selectedRegForDelete.name}"</strong> secara permanen. Pengguna tidak akan dapat mengakses portal ini lagi.
              </p>

              {/* Confirm Actions */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedRegForDelete(null)}
                  disabled={isDeleting}
                  className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <span>Ya, Hapus Permanen</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
