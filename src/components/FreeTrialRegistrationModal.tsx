import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { X, User, Mail, Phone, Tag, ShieldCheck, Store } from 'lucide-react';

export function FreeTrialRegistrationModal({ onClose, showNotification, onSuccess }: any) {
  const [formData, setFormData] = useState({ 
    nama: '', 
    orgName: '',
    clientId: '',
    email: '', 
    hp: '', 
    rt: '01', 
    voucher: '' 
  });
  const [clientIdSuggestions, setClientIdSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const generateClientIdSuggestions = (val: string) => {
    if (!val) {
      setClientIdSuggestions([]);
      return;
    }
    // Deep cleaning: remove spaces, symbols, and convert to lowercase
    const base = val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
    if (!base) {
      setClientIdSuggestions([]);
      return;
    }
    
    // We strictly offer 3 branded options as requested
    const suggestions = [
      base,
      `${base}.id`,
      `${base}.rw`
    ];
    setClientIdSuggestions([...new Set(suggestions)]);
    if (!formData.clientId) {
      setFormData(prev => ({ ...prev, clientId: suggestions[0] }));
    }
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, orgName: val }));
    generateClientIdSuggestions(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.hp || !formData.orgName || !formData.clientId) {
      showNotification('Harap isi semua field wajib.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const tenantId = formData.clientId.toLowerCase();
      
      const newTenant = {
        id: tenantId,
        name: formData.orgName,
        status: 'TRIAL',
        plan: 'TRIAL',
        isActive: true,
        createdAt: new Date().toISOString(),
        adminEmail: formData.email.toLowerCase(),
        adminPhone: formData.hp,
        voucher: formData.voucher || '',
        rtTarget: 1,
        rwTarget: 26,
        registrationType: 'AUTOMATED_SELF_SERVICE',
        platformSource: 'SmartRW_WebApp',
        onboardingCompleted: false,
        lastAutoFollowUpAt: null,
        autoFollowedUpAfterTwoMonths: false,
        namaPIC: formData.nama,
        followUpStatus: 'NEW'
      };

      const finalUserId = `PRE_${formData.email.toLowerCase()}`;

      const newUser = {
        id_user: finalUserId,
        uid: null,
        nama: formData.nama,
        name: formData.nama,
        email: formData.email.toLowerCase(),
        phone: formData.hp,
        tenantId: tenantId,
        role: 'ADMIN',
        rt: formData.rt || '01',
        status: 'AKTIF',
        createdAt: new Date().toISOString(),
        isSuperAdmin: true,
        setupAssistantCompleted: false,
        lastOnline: new Date().toISOString()
      };

      const newSettings = {
        org_name: formData.orgName,
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
      
      // Attempt to send welcome message via backend
      try {
        await fetch('/api/messages/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            name: formData.nama,
            clientId: tenantId,
            phone: formData.hp
          })
        });
      } catch (err) {
        console.warn('Welcome message failed (non-critical):', err);
      }
      
      setIsSuccess(true);
      showNotification('Pendaftaran Berhasil!', 'success');
    } catch (err: any) {
      console.error('Registration Error:', err);
      showNotification(`Gagal: ${err.message || 'Terjadi kesalahan sistem.'}`, 'error');
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
            Akun Anda telah aktif dengan ID Klien: <span className="text-blue-600 font-bold">{formData.clientId}</span>. 
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Mulai Gratis</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Satu Akun, Seluruh Fitur</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Organisasi / Komplek</label>
            <div className="relative group">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required 
                type="text" 
                placeholder="Contoh: Green Residence"
                value={formData.orgName} 
                onChange={handleOrgNameChange} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih ID Klien (Url Akses)</label>
            <div className="flex flex-wrap gap-2">
              {clientIdSuggestions.length > 0 ? (
                clientIdSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setFormData({...formData, clientId: sug})}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${formData.clientId === sug ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`}
                  >
                    {sug}
                  </button>
                ))
              ) : (
                <div className="text-[10px] text-slate-400 font-bold italic px-1">Masukkan nama organisasi untuk melihat saran ID</div>
              )}
            </div>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required 
                type="text" 
                placeholder="Atau ketik ID manual..."
                value={formData.clientId} 
                onChange={e => setFormData({...formData, clientId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase">.dompet-warga</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Admin</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  type="text" 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value})} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Aktif</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp / No. HP</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                required 
                type="tel" 
                placeholder="08123456789"
                value={formData.hp} 
                onChange={e => setFormData({...formData, hp: e.target.value})} 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck size={16} />
                Daftar Sekarang
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
