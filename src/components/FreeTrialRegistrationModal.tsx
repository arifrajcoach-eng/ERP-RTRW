import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { X, User, Mail, Phone, Tag, ShieldCheck } from 'lucide-react';

export function FreeTrialRegistrationModal({ onClose, showNotification, onSuccess }: any) {
  const [formData, setFormData] = useState({ nama: '', email: '', hp: '', rt: '01', voucher: '' });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.hp) {
      showNotification('Harap isi semua field wajib.', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Ensure we have a session (Signin Anonymously if needed for rules)
      console.log('Registration: auth.currentUser before check:', auth.currentUser?.uid);
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }
      console.log('Registration: auth.currentUser after check:', auth.currentUser?.uid);


      const tenantId = `TRIAL_${formData.nama.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
      
      const newTenant = {
        id: tenantId,
        name: `SaaS ${formData.nama}`,
        status: 'BASIC',
        isActive: true,
        createdAt: new Date().toISOString(),
        adminEmail: formData.email.toLowerCase(),
        adminPhone: formData.hp,
        voucher: formData.voucher || '',
        rtTarget: 1,
        rwTarget: 26,
      };

      // Use a PRE_ prefix with email to allow rule matching for guest registration
      // and linking when they log in with Google later
      const finalUserId = `PRE_${formData.email.toLowerCase()}`;

      const newUser = {
        id_user: finalUserId,
        uid: null, // Will be updated on first login
        nama: formData.nama,
        name: formData.nama,
        email: formData.email.toLowerCase(),
        phone: formData.hp,
        tenantId: tenantId,
        role: 'ADMIN',
        rt: formData.rt || '01',
        status: 'AKTIF',
        createdAt: new Date().toISOString()
      };

      const newSettings = {
        org_name: formData.nama,
        logo_url: '/logo_rw.png',
        theme: 'light',
        ownerEmail: formData.email.toLowerCase(),
        createdAt: new Date().toISOString()
      };

      const batchOp = writeBatch(db);
      batchOp.set(doc(db, 'tenants', tenantId), newTenant);
      batchOp.set(doc(db, 'users', finalUserId), newUser);
      batchOp.set(doc(db, 'settings', tenantId), newSettings);
      await batchOp.commit();
      
      setIsSuccess(true);
      showNotification('Pendaftaran Berhasil!', 'success');
    } catch (err: any) {
      console.error('Registration Error:', err);
      const isPermissionError = err?.code === 'permission-denied' || err?.message?.includes('permission');
      showNotification(
        isPermissionError 
          ? 'Gagal: Izin ditolak. Silakan hubungi admin.' 
          : `Gagal: ${err.message || 'Terjadi kesalahan sistem.'}`, 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Pendaftaran Berhasil!</h2>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            Akun Anda telah aktif di paket <span className="text-brand-pink font-bold">Starter (BASIC)</span>. 
            Silakan masuk menggunakan tombol <span className="font-bold text-slate-700">Masuk dengan Google</span> dengan email: <br/>
            <span className="text-blue-600 font-bold underline">{formData.email}</span>
          </p>
          <button 
            onClick={() => {
              if (onSuccess) {
                onSuccess(formData.email);
              } else {
                onClose();
              }
            }} 
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Mengerti, Lanjut Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black text-slate-800">Daftar Akun Gratis</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">No. HP</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input required type="tel" value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Kode Voucher (Opsional)</label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input type="text" value={formData.voucher} onChange={e => setFormData({...formData, voucher: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-brand-pink text-white font-black rounded-2xl shadow-xl shadow-brand-pink/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? 'Memproses...' : 'Daftar & Aktivasi Gratis'}
          </button>
        </form>
      </div>
    </div>
  );
}
