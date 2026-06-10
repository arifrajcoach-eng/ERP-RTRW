import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { safeSessionStorage } from '../lib/safeStorage';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { X, User, Mail, Phone, Tag, ShieldCheck, Store, CreditCard, Check, CheckCircle2, Clock, Upload } from 'lucide-react';
import { PLAN_CONFIG } from '../constants';

export function FreeTrialRegistrationModal({ onClose, showNotification, onSuccess, initialPlan = 'TRIAL' }: any) {
  const [formData, setFormData] = useState({ 
    nama: '', 
    orgName: '',
    clientId: '',
    email: '', 
    hp: '', 
    rt: '01', 
    voucher: '',
    joiningDate: new Date().toISOString().split('T')[0]
  });
  const [clientIdSuggestions, setClientIdSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Payment (if paid), 3: Success
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Custom states for Manual ATM proof upload
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'MANUAL_ATM'>('ONLINE');
  const [duration, setDuration] = useState<number>(1);
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');

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
        // Removed simulated payment delay to ensure fast UI response
        setIsProcessingPayment(false);
      }

      const tenantId = formData.clientId.toLowerCase();
      
      let tenantActiveStatus = true;
      let planStatus = initialPlan === 'TRIAL' ? 'TRIAL' : 'ACTIVE';
      let payStatus = initialPlan === 'TRIAL' ? 'FREE' : 'PAID_AUTOMATED';
      
      if (initialPlan !== 'TRIAL' && paymentMethod === 'MANUAL_ATM') {
        tenantActiveStatus = false;
        planStatus = 'PENDING_PAYMENT_APPROVAL';
        payStatus = 'PENDING_MANUAL_PROOF';
      }

      const uid = currentUser!.uid;
      const email = currentUser!.email!;
      
      const newTenant = {
        id: tenantId,
        name: formData.orgName,
        status: planStatus,
        plan: initialPlan,
        isActive: tenantActiveStatus,
        createdAt: new Date().toISOString(),
        adminEmail: email.toLowerCase(),
        adminPhone: formData.hp,
        voucher: formData.voucher || '',
        rtTarget: 1,
        rwTarget: 26,
        registrationType: 'AUTOMATED_SELF_SERVICE',
        platformSource: 'SmaRtRw_WebApp',
        onboardingCompleted: false,
        lastAutoFollowUpAt: null,
        autoFollowedUpAfterTwoMonths: false,
        namaPIC: formData.nama,
        followUpStatus: 'NEW',
        paymentStatus: payStatus,
        joiningDate: formData.joiningDate,
        expiredAt: initialPlan === 'TRIAL' ? null : new Date(new Date().setMonth(new Date().getMonth() + duration)).toISOString(),
        // Manual ATM payment verification fields
        paymentProofSenderName: paymentMethod === 'MANUAL_ATM' ? senderName : null,
        paymentProofSenderBank: paymentMethod === 'MANUAL_ATM' ? senderBank : null,
        paymentProofFileName: paymentMethod === 'MANUAL_ATM' ? (paymentProofFileName || 'bukti_atm_transfer.jpg') : null,
        paymentProofNote: paymentMethod === 'MANUAL_ATM' ? `Transfer ATM dari ${senderName} via Bank ${senderBank}` : null
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
        status: tenantActiveStatus ? 'AKTIF' : 'PENDING_APPROVAL',
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
      
      // Write to subscriptions collection to keep SubscriptionGuard synchronized
      if (initialPlan !== 'TRIAL') {
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + duration);
        const planKey = String(initialPlan).toUpperCase();
        const planConfigObj = (PLAN_CONFIG as any)[planKey] || (PLAN_CONFIG as any)[Object.keys(PLAN_CONFIG).find(k => k.toLowerCase() === planKey.toLowerCase()) || 'PRO'];
        const priceAmount = planConfigObj ? planConfigObj.priceMonthly : 0;

        batchOp.set(doc(db, 'subscriptions', tenantId), {
          plan: initialPlan.toLowerCase(),
          status: paymentMethod === 'ONLINE' ? 'Active' : 'Inactive',
          startDate: new Date().toISOString(),
          endDate: nextBilling.toISOString(),
          paymentDetails: paymentMethod === 'ONLINE' ? {
            fullName: formData.nama,
            country: 'Indonesia',
            cycle: duration === 1 ? 'monthly' : duration === 3 ? 'quarterly' : 'yearly',
            pricePaid: priceAmount * duration,
            cardNumberMasked: '**** **** **** xxxx'
          } : {
            fullName: formData.nama,
            country: 'Indonesia',
            cycle: duration === 1 ? 'monthly' : duration === 3 ? 'quarterly' : 'yearly',
            paymentMethod: 'MANUAL_ATM',
            senderName,
            senderBank,
            status: 'PENDING_VERIFICATION'
          }
        });
      }

      await batchOp.commit();
      safeSessionStorage.removeItem(`user_profile_${auth.currentUser?.uid}`);
      
      try {
        // Fire and forget welcome message to prevent blocking the UI
        fetch('/api/messages/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: formData.nama,
            clientId: tenantId,
            phone: formData.hp,
            plan: initialPlan
          })
        }).catch(err => console.warn('Welcome message failed in background:', err));
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
    const isManualATM = initialPlan !== 'TRIAL' && paymentMethod === 'MANUAL_ATM';
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl flex flex-col items-center text-center">
          <div className={`w-20 h-20 ${isManualATM ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center mb-6 ${isManualATM ? 'animate-pulse' : 'animate-bounce'}`}>
            {isManualATM ? <Clock className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {isManualATM ? 'Pendaftaran Sukses!' : 'Aktivasi Berhasil!'}
          </h2>
          <div className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
            {isManualATM ? (
              <div className="space-y-4">
                <p>
                  Pendaftaran ID Klien <span className="text-blue-600 font-bold">{formData.clientId}</span> telah selesai dilakukan.
                </p>
                <div className="text-left text-xs bg-amber-50 text-amber-800 border border-amber-200/50 p-3 rounded-2xl leading-normal space-y-1.5 shadow-inner">
                  <span className="font-bold flex items-center gap-1">⚠️ MENUNGGU VERIFIKASI PUSAT</span>
                  <span>Bukti transfer Anda telah direkam. Akun Anda saat ini dinonaktifkan sementara dan fitur aplikasi akan otomatis terbuka setelah diverifikasi oleh Admin dalam waktu dekat.</span>
                </div>
              </div>
            ) : (
              <p>
                Paket <span className="text-indigo-600 font-bold">{initialPlan}</span> Anda telah aktif untuk ID: <span className="text-blue-600 font-bold">{formData.clientId}</span>. 
              </p>
            )}
            <p className="mt-4">
              Silakan masuk menggunakan email: <br/>
              <span className="text-blue-600 font-bold underline">{formData.email}</span>
            </p>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (onSuccess) onSuccess(formData.email);
              else onClose();
            }} 
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
          >
            {isManualATM ? 'Selesai & Tutup' : 'Lanjut ke Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    const isFormIncomplete = paymentMethod === 'MANUAL_ATM' && (!senderName || !senderBank || !paymentProofFileName);
    
    // Dynamically query price of selected plan
    const planKey = String(initialPlan).toUpperCase();
    const planConfigObj = (PLAN_CONFIG as any)[planKey] || (PLAN_CONFIG as any)[Object.keys(PLAN_CONFIG).find(k => k.toLowerCase() === planKey.toLowerCase()) || 'PRO'];
    const priceAmount = planConfigObj ? planConfigObj.priceMonthly : 0;
    
    const formatRupiah = (val: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto animate-fade-in">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-6 shadow-2xl my-8 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-none">Pembayaran Paket</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Lisensi SmaRtRw AI</p>
            </div>
            <button onClick={() => setStep(1)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all hover:bg-red-550 hover:rotate-90"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200/60 mb-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Paket Dipilih</span>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase">{initialPlan}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Durasi</span>
              <select 
                value={duration} 
                onChange={(e) => setDuration(Number(e.target.value))}
                className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg"
              >
                <option value={1}>1 Bulan</option>
                <option value={3}>3 Bulan</option>
                <option value={12}>12 Bulan</option>
              </select>
            </div>
            <div className="h-px bg-slate-200/65" />
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Tagihan</span>
              <span className="text-sm font-black text-slate-800 tracking-tight">
                {priceAmount === 0 ? 'GRATIS / TRIAL' : formatRupiah(priceAmount * duration)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
             {/* Payment Method Tabs */}
             <div className="grid grid-cols-2 gap-2 bg-slate-105 p-1.5 rounded-2xl">
               <button 
                 type="button"
                 onClick={() => setPaymentMethod('ONLINE')}
                 className={`py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all text-[10px] font-black uppercase lg:cursor-pointer ${paymentMethod === 'ONLINE' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
               >
                 <CreditCard className="w-3.5 h-3.5" />
                 <span>Online Auto</span>
               </button>
               <button 
                 type="button"
                 onClick={() => setPaymentMethod('MANUAL_ATM')}
                 className={`py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-all text-[10px] font-black uppercase lg:cursor-pointer ${paymentMethod === 'MANUAL_ATM' ? 'bg-[#c2410c] text-white shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
               >
                 <Upload className="w-3.5 h-3.5" />
                 <span>ATM / Transfer</span>
               </button>
             </div>

             {paymentMethod === 'ONLINE' ? (
               <div className="space-y-4 animate-fade-in">
                 <div className="p-4 bg-emerald-50 border border-emerald-100/80 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-[10px] font-bold text-emerald-800 leading-normal">Sistem akan memproses aktivasi instan otomatis secara real-time tanpa memerlukan verifikasi admin manual.</p>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                       <button type="button" className="p-3 border-2 border-blue-600 bg-blue-50 rounded-xl flex flex-col items-center gap-1.5">
                          <CreditCard className="text-blue-600" size={16} />
                          <span className="text-[8px] font-black uppercase">Qris / Transfer</span>
                       </button>
                       <button type="button" className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex flex-col items-center gap-1.5 opacity-50 grayscale">
                          <Store className="text-slate-400" size={16} />
                          <span className="text-[8px] font-black uppercase">Gerai Retail</span>
                       </button>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="space-y-3.5 p-4 bg-amber-50/50 border border-amber-200 rounded-3xl text-left scale-98 transition-all animate-fade-in">
                  <p className="text-[10px] font-black text-amber-800 uppercase tracking-wide">Panduan Transfer Bank / ATM:</p>
                  <p className="text-[10px] text-slate-600 leading-normal">
                    Silakan lakukan transfer ke rekening resmi SmaRtRw AI berikut:<br/>
                    <strong className="block text-xs font-black text-amber-650 font-mono bg-[#141415] border border-slate-900 px-3 py-2 rounded-xl mt-2 tracking-wider text-center border-dashed">MANDIRI 131-05-26052026-6</strong>
                    <div className="flex justify-between font-semibold font-sans mt-2 text-[10px] text-slate-500">
                      <span>Atas Nama pemilik:</span>
                      <span className="text-slate-850 font-bold">PT. SmaRtRw Solusi Indonesia</span>
                    </div>
                  </p>
                  
                  <div className="space-y-3.5 mt-2 pt-3 border-t border-amber-200/50">
                    <div>
                      <label className="block text-[8px] font-black uppercase text-slate-400 ml-1 mb-1">Nama Pemilik Rekening Pengirim (Sesuai ATM / M-Banking):</label>
                      <input 
                        required 
                        type="text" 
                        value={senderName} 
                        onChange={e => setSenderName(e.target.value)}
                        placeholder="Contoh: Sukarno Hadi"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase text-slate-400 ml-1 mb-1">Nama Bank Pengirim:</label>
                      <input 
                        required 
                        type="text" 
                        value={senderBank} 
                        onChange={e => setSenderBank(e.target.value)}
                        placeholder="Contoh: BCA, Mandiri, BRI, BNI"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase text-slate-400 ml-1 mb-1">Unggah Foto Bukti Transfer ATM:</label>
                      <div className="mt-1">
                        <div 
                          onClick={() => {
                            const simulatedName = `bukti_transfer_${Math.floor(1000 + Math.random() * 9000)}.jpg`;
                            setPaymentProofFileName(simulatedName);
                            showNotification('Simulasi bukti transfer berhasil dilekatkan!', 'info');
                          }}
                          className="w-full bg-white border-2 border-dashed border-slate-205 hover:border-amber-500 hover:bg-amber-50/10 rounded-2xl p-4 text-center cursor-pointer transition-all"
                        >
                          <div className="w-8 h-8 bg-slate-150 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-1.5">
                            <Upload className="w-4 h-4" />
                          </div>
                          {paymentProofFileName ? (
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Berhasil Dilekatkan:
                              </p>
                              <p className="text-xs font-mono text-slate-700 tracking-wider truncate px-2">{paymentProofFileName}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Klik lagi untuk simulasi ulang</p>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-[10px] text-slate-500 font-bold">Pilih foto atau file bukti transfer ATM</p>
                              <p className="text-[9px] text-slate-400 font-medium">Klik di sini untuk mengisi demo file otomatis</p>
                            </div>
                          )}
                          
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onClick={(e) => e.stopPropagation()}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) setPaymentProofFileName(file.name);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
             )}
          </div>

          <button 
            type="button"
            onClick={handleSubmit} 
            disabled={loading || isFormIncomplete}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/10 hover:scale-[1.01] active:scale-99 transition-all mt-6 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isProcessingPayment ? "Memproses..." : "Mendaftarkan..."}</span>
              </div>
            ) : (
              paymentMethod === 'ONLINE' ? 'Bayar & Aktifkan Sekarang' : 'Daftar & Kirim Bukti Pembayaran'
            )}
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
            <h2 className="text-xl font-black text-slate-900 capitalize">{initialPlan === 'TRIAL' ? 'Mulai Gratis' : `Paket ${String(initialPlan).toLowerCase()}`}</h2>
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

              <div className="space-y-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Bergabung</label>
                <div className="relative group">
                  <input required type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-700" />
                </div>
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

