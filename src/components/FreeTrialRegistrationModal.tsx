import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { X, User, Mail, Phone, Tag, ShieldCheck, Store, CreditCard, CheckCircle2 } from 'lucide-react';

export function FreeTrialRegistrationModal({ onClose, showNotification, onSuccess, initialPlan = 'TRIAL' }: any) {
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
  const [step, setStep] = useState(1); // 1: Info, 2: Payment (if paid), 3: Success
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // If user is already logged in, pre-fill email and name
    if (auth.currentUser && !auth.currentUser.isAnonymous) {
      setFormData(prev => ({
        ...prev,
        email: auth.currentUser?.email || '',
        nama: auth.currentUser?.displayName || ''
      }));
    }
  }, []);

  const generateClientIdSuggestions = (val: string) => {
    if (!val) {
      setClientIdSuggestions([]);
      return;
    }
    const base = val.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().substring(0, 15);
    if (!base) {
      setClientIdSuggestions([]);
      return;
    }
    const suggestions = [base, `${base}.id`, `${base}.rw`];
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

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.hp || !formData.orgName || !formData.clientId) {
      showNotification('Harap isi semua field wajib.', 'error');
      return;
    }
    if (initialPlan === 'TRIAL') {
      handleSubmit();
    } else {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let currentUser = auth.currentUser;
      
      // If not logged in or anonymous, prompt for Google Login as requested for "Direct Login"
      if (!currentUser || currentUser.isAnonymous) {
        showNotification('Melakukan Login Google untuk Aktivasi...', 'info');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
        
        // Update form data with real Google info if it changed
        setFormData(prev => ({
          ...prev,
          email: currentUser?.email || prev.email,
          nama: currentUser?.displayName || prev.nama
        }));
      }

      if (initialPlan !== 'TRIAL') {
        setIsProcessingPayment(true);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate payment delay
        setIsProcessingPayment(false);
      }

      const tenantId = formData.clientId.toLowerCase();
      const planStatus = initialPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE';
      const uid = currentUser!.uid;
      const email = currentUser!.email!;
      
      const newTenant = {
        id: tenantId,
        name: formData.orgName,
        status: planStatus,
        plan: initialPlan,
        isActive: true,
        createdAt: new Date().toISOString(),
        adminEmail: email.toLowerCase(),
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
        followUpStatus: 'NEW',
        paymentStatus: initialPlan === 'TRIAL' ? 'FREE' : 'PAID_AUTOMATED'
      };

      const newUser = {
        id_user: uid, // Use real UID in Firestore
        uid: uid,
        nama: formData.nama,
        name: formData.nama,
        email: email.toLowerCase(),
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
        ownerEmail: email.toLowerCase(),
        createdAt: new Date().toISOString()
      };

      const batchOp = writeBatch(db);
      batchOp.set(doc(db, 'tenants', tenantId), newTenant);
      batchOp.set(doc(db, 'users', uid), newUser); // Save with real UID
      batchOp.set(doc(db, 'settings', tenantId), newSettings);
      await batchOp.commit();
      sessionStorage.removeItem(`user_profile_${auth.currentUser?.uid}`);
      
      try {
        await fetch('/api/messages/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: formData.nama,
            clientId: tenantId,
            phone: formData.hp,
            plan: initialPlan
          })
        });
      } catch (err) {
        console.warn('Welcome message failed (non-critical):', err);
      }
      
      setIsSuccess(true);
      setStep(3);
      showNotification('Pendaftaran & Aktivasi Berhasil!', 'success');
      
      // Auto-jump to dashboard after 1.5 seconds or immediately
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(email);
        } else {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      console.error('Registration Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        showNotification('Pendaftaran dibatalkan (Login Google ditutup).', 'warning');
      } else if (err.code === 'auth/network-request-failed' || String(err.message || err).includes('network-request-failed')) {
        showNotification('BLOKIR IFRAME: Google Login diblokir karena dijalankan di dalam IFrame Preview. Silakan klik "Buka di Tab Baru" di pojok kanan atas preview Anda untuk aktivasi yang lancar.', 'error');
      } else {
        showNotification(`Gagal: ${err.message || 'Terjadi kesalahan sistem.'}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Aktivasi Berhasil!</h2>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            Paket <span className="text-indigo-600 font-bold">{initialPlan}</span> Anda telah aktif untuk ID: <span className="text-blue-600 font-bold">{formData.clientId}</span>. 
            Silakan masuk menggunakan email: <br/>
            <span className="text-blue-600 font-bold underline">{formData.email}</span>
          </p>
          <button 
            onClick={() => {
              if (onSuccess) onSuccess(formData.email);
              else onClose();
            }} 
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            Lanjut ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Pembayaran Online</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Simulasi Transaksi Otomatis</p>
            </div>
            <button onClick={() => setStep(1)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase">Paket Dipilih</span>
              <span className="text-xs font-black text-indigo-600 uppercase">{initialPlan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase">Total Tagihan</span>
              <span className="text-sm font-black text-slate-800 tracking-tight">Otomatis Terbayar</span>
            </div>
          </div>

          <div className="space-y-4">
             <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-emerald-500" size={24} />
                <p className="text-[10px] font-bold text-emerald-700 leading-tight">Sistem akan memproses aktivasi instan tanpa verifikasi manual.</p>
             </div>
             
             <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                   <button className="p-3 border-2 border-blue-600 bg-blue-50 rounded-xl flex flex-col items-center gap-1">
                      <CreditCard className="text-blue-600" size={16} />
                      <span className="text-[8px] font-black uppercase">Qris / Transfer</span>
                   </button>
                   <button className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex flex-col items-center gap-1 opacity-50 grayscale">
                      <Store className="text-slate-400" size={16} />
                      <span className="text-[8px] font-black uppercase">Gerai Retail</span>
                   </button>
                </div>
             </div>
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-8 disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isProcessingPayment ? "Memproses Pembayaran..." : "Mendaftarkan..."}</span>
              </div>
            ) : "Bayar & Aktifkan Sekarang"}
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
            <h2 className="text-xl font-black text-slate-900">{initialPlan === 'TRIAL' ? 'Mulai Gratis' : `Paket ${initialPlan}`}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self-Service Onboarding</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleProceedToPayment} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Organisasi / Komplek</label>
            <div className="relative group">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input required type="text" placeholder="Contoh: rt01_rw10_Green Residen" value={formData.orgName} onChange={handleOrgNameChange} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ID Klien (Url Akses)</label>
            <div className="flex flex-wrap gap-2">
              {clientIdSuggestions.map((sug) => (
                <button key={sug} type="button" onClick={() => setFormData({...formData, clientId: sug})} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border-2 ${formData.clientId === sug ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`}>{sug}</button>
              ))}
            </div>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input required type="text" placeholder="ID manual..." value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Info (Nama, Email, WA)</label>
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input required type="text" placeholder="Nama Lengkap" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input required type="email" placeholder="Email Aktif" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input required type="tel" placeholder="WhatsApp (Contoh: 0812...)" value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all mt-4 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2"
          >
            {initialPlan === 'TRIAL' ? <ShieldCheck size={16} /> : <CreditCard size={16} />}
            {initialPlan === 'TRIAL' ? "Daftar Sekarang" : "Lanjut ke Pembayaran"}
          </button>
        </form>
      </div>
    </div>
  );
}

