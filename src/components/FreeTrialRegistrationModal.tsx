import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { X, User, Mail, Phone, Tag } from 'lucide-react';

export function FreeTrialRegistrationModal({ onClose, showNotification }: any) {
  const [formData, setFormData] = useState({ nama: '', email: '', hp: '', rt: '01', voucher: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic for free trial:
      // Create user + tenant with 'TRIAL' plan, 'PENDING' status
      const tenantId = `TRIAL_${formData.nama.replace(/\s+/g, '_').toUpperCase()}_${Math.floor(Math.random() * 1000)}`;
      
      const newTenant = {
        id: tenantId,
        name: `Tenant ${formData.nama}`,
        status: 'BASIC', // Use BASIC for Starter plan access
        isActive: true, // Auto-active for direct access
        createdAt: new Date().toISOString(),
        adminEmail: formData.email,
        adminPhone: formData.hp,
        voucher: formData.voucher,
        rtTarget: 1,
        rwTarget: 26,
      };

      // Buat akun admin pre-registered menggunakan ID acak atau berbasis nomor HP
      const userId = `PRE_${formData.hp}_${Date.now()}`;
      const newUser = {
        id_user: userId,
        nama: formData.nama,
        email: formData.email,
        phone: formData.hp,
        tenantId: tenantId,
        role: 'ADMIN',
        rt: formData.rt,
        status: 'AKTIF',
        createdAt: new Date().toISOString()
      };

      const batchOp = writeBatch(db);
      batchOp.set(doc(db, 'tenants', tenantId), newTenant);
      batchOp.set(doc(db, 'users', userId), newUser);
      await batchOp.commit();
      
      showNotification('Pendaftaran Berhasil! Silakan masuk menggunakan Masuk Dengan Google (gunakan email yang sama).', 'success');
      onClose();
    } catch (err: any) {
      console.error(err);
      showNotification('Gagal melakukan pendaftaran.', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-4 disabled:opacity-50">
            {loading ? 'Memproses...' : 'Daftar Gratis'}
          </button>
        </form>
      </div>
    </div>
  );
}
