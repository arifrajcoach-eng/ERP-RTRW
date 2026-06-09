import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { safeLocalStorage } from '../lib/safeStorage';
import { 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  Check, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Coins, 
  Building, 
  HelpCircle,
  AlertTriangle,
  Clock,
  Upload
} from 'lucide-react';
import { PLAN_CONFIG } from '../constants';

interface PaymentPageProps {
  tenantId?: string;
  isEmbedded?: boolean;
  onCloseEmbedded?: () => void;
  initialPlanId?: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  tenantId, 
  isEmbedded = false, 
  onCloseEmbedded, 
  initialPlanId 
}) => {
  // Try to load tenant ID from state, or fallback to saved localStorage if not provided via guard
  const activeTenantId = tenantId || (() => {
    try {
      const stored = safeLocalStorage.getItem('currentTenant');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || '';
      }
    } catch (e) {
      console.error(e);
    }
    return '';
  })();

  const [tenantName, setTenantName] = useState('Admin SmaRtRw');
  const [tenantEmail, setTenantEmail] = useState('');
  const [loadingTenant, setLoadingTenant] = useState(true);

  // Selected Plan state (defaulting to PRO)
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || 'pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [country, setCountry] = useState('Indonesia');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [useDiffBillingName, setUseDiffBillingName] = useState(false);
  const [billingName, setBillingName] = useState('');
  
  // Custom states for manual bank transfers
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'MANUAL_ATM' | 'QRIS' | 'M_BANKING'>('ONLINE');
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tenantData, setTenantData] = useState<any>(null);

  // Taxes / NPWP
  const [taxIdChoice, setTaxIdChoice] = useState('NPWP');
  const [taxIdValue, setTaxIdValue] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Transaction States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Tenant profile details upon load
  useEffect(() => {
    if (!activeTenantId) {
      setLoadingTenant(false);
      return;
    }

    const loadTenantDetails = async () => {
      try {
        const docRef = doc(db, 'tenants', activeTenantId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTenantName(data.name || data.id || 'Admin SmaRtRw');
          setFullName(data.name || '');
          setTenantEmail(data.email || 'admin@smartrw.ai');
          setTenantData(data);
        }
      } catch (err) {
        console.error("Failed to load tenant detail:", err);
      } finally {
        setLoadingTenant(false);
      }
    };

    loadTenantDetails();
  }, [activeTenantId]);

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const formatted: string[] = [];
    for (let i = 0; i < rawVal.length && i < 16; i += 4) {
      formatted.push(rawVal.substring(i, i + 4));
    }
    setCardNumber(formatted.join(' '));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = e.target.value.replace(/[^0-9]/g, '');
    if (cleanVal.length > 4) {
      cleanVal = cleanVal.substring(0, 4);
    }
    if (cleanVal.length > 2) {
      setExpiry(`${cleanVal.substring(0, 2)}/${cleanVal.substring(2, 4)}`);
    } else {
      setExpiry(cleanVal);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setCvc(cleanVal);
  };

  // NPWP formatter: 12.345.678.9-012.345
  const handleNpwpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cleanVal = e.target.value.replace(/[^0-9]/g, '').slice(0, 15);
    let fVal = '';
    
    // Formatting: 00.000.000.0-000.000
    if (cleanVal.length > 0) {
      fVal += cleanVal.substring(0, 2);
    }
    if (cleanVal.length > 2) {
      fVal += '.' + cleanVal.substring(2, 5);
    }
    if (cleanVal.length > 5) {
      fVal += '.' + cleanVal.substring(5, 8);
    }
    if (cleanVal.length > 8) {
      fVal += '.' + cleanVal.substring(8, 9);
    }
    if (cleanVal.length > 9) {
      fVal += '-' + cleanVal.substring(9, 12);
    }
    if (cleanVal.length > 12) {
      fVal += '.' + cleanVal.substring(12, 15);
    }
    
    setTaxIdValue(fVal || cleanVal);
  };

  // Determine active plan specifications
  const activePlanKey = Object.keys(PLAN_CONFIG).find(
    k => (PLAN_CONFIG as any)[k].id === selectedPlanId
  ) || 'PRO';
  
  const selectedPlanObj = (PLAN_CONFIG as any)[activePlanKey];
  const originalPrice = billingCycle === 'yearly' 
    ? selectedPlanObj.priceYearly 
    : selectedPlanObj.priceMonthly;

  const discountRate = billingCycle === 'yearly' ? 0.20 : 0; // 20% discount on yearly pre-calculated or shown
  const pricePaid = originalPrice;
  const pricePerMonth = billingCycle === 'yearly' ? Math.round((originalPrice / 12)) : originalPrice;
  
  // Standard IDR formatter
  const formattedIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Billing Date calculations (30 days or 365 days from today)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + (billingCycle === 'yearly' ? 365 : 30));
  const formattedNextBillingDate = nextBillingDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Simple card type detector
  const getCardType = () => {
    const raw = cardNumber.replace(/\s/g, '');
    if (raw.startsWith('4')) return 'VISA';
    if (raw.startsWith('5')) return 'MASTERCARD';
    if (raw.startsWith('3')) return 'JCB';
    return 'CREDIT_CARD';
  };

  // Handle Complete Subscription flow
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Validations
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap tidak boleh kosong');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg('Nomor kartu kredit tidak valid (harus 16 digit)');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg('Tanggal kedaluwarsa kartu salah (format MM/TT)');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Kode keamanan CVC tidak valid (harus 3-4 digit)');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Anda wajib menyetujui syarat penagihan dan kebijakan layanan');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!activeTenantId) {
        throw new Error("ID Tenant tidak ditemukan. Silakan masuk kembali.");
      }

      // Generate dates
      const today = new Date();
      const endSub = new Date();
      endSub.setDate(today.getDate() + (billingCycle === 'yearly' ? 365 : 30));

      const planSystemKey = selectedPlanObj.systemKey;
      let maxWargaLimit = 300;
      if (planSystemKey === 'PRO') maxWargaLimit = 1000;
      if (planSystemKey === 'PREMIUM') maxWargaLimit = 1000;
      if (planSystemKey === 'ENTERPRISE') maxWargaLimit = 20000;

      // 1. Write subscription record to Firebase
      await setDoc(doc(db, 'subscriptions', activeTenantId), {
        plan: selectedPlanId,
        status: 'Active',
        startDate: today.toISOString(),
        endDate: endSub.toISOString(),
        paymentDetails: {
          fullName,
          country,
          taxId: taxIdValue || null,
          cycle: billingCycle,
          pricePaid,
          cardNumberMasked: `**** **** **** ${cardNumber.slice(-4)}`
        }
      });

      // 2. Update parent tenant document with upgraded plan parameters
      await updateDoc(doc(db, 'tenants', activeTenantId), {
        status: planSystemKey,
        maxWarga: maxWargaLimit,
        billingCycle: billingCycle,
        subscriptionEndDate: endSub.toISOString()
      });

      // Success visual animation sequence
      setIsSuccess(true);
      
      // Automatic real-time page reload after 3 seconds to re-verify status
      setTimeout(() => {
        if (onCloseEmbedded) {
          onCloseEmbedded();
        } else {
          window.location.reload();
        }
      }, 3000);

    } catch (err: any) {
      console.error("Payment registration failure: ", err);
      setErrorMsg(err.message || 'Gagal memproses pembayaran. Periksa koneksi internet Anda atau coba lagi nanti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual bank transfer ATM proof submit
  const handleManualPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!senderName.trim()) {
      setErrorMsg('Nama pemilik rekening pengirim tidak boleh kosong');
      return;
    }
    if (!senderBank.trim()) {
      setErrorMsg('Nama bank pengirim tidak boleh kosong');
      return;
    }
    if (!paymentProofFileName) {
      setErrorMsg('Harap lampirkan/unggah foto bukti transfer ATM Anda');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!activeTenantId) {
        throw new Error("ID Tenant tidak ditemukan. Silakan masuk kembali.");
      }

      // Generate dates
      const today = new Date();
      const endSub = new Date();
      endSub.setDate(today.getDate() + (billingCycle === 'yearly' ? 365 : 30));

      const planSystemKey = selectedPlanObj.systemKey;
      let maxWargaLimit = 300;
      if (planSystemKey === 'PRO') maxWargaLimit = 1000;
      if (planSystemKey === 'PREMIUM') maxWargaLimit = 1000;
      if (planSystemKey === 'ENTERPRISE') maxWargaLimit = 20000;

      // 1. Write subscription record to Firebase as Inactive with Pending manual review details
      await setDoc(doc(db, 'subscriptions', activeTenantId), {
        plan: selectedPlanId,
        status: 'Inactive',
        startDate: today.toISOString(),
        endDate: endSub.toISOString(),
        paymentDetails: {
          fullName,
          country,
          cycle: billingCycle,
          pricePaid,
          paymentMethod: 'MANUAL_ATM',
          senderName,
          senderBank,
          status: 'PENDING_VERIFICATION'
        }
      });

      // 2. Update tenant document with upgraded plan status and pending manual verification meta fields
      await setDoc(doc(db, 'tenants', activeTenantId), {
        status: 'PENDING_PAYMENT_APPROVAL',
        plan: selectedPlanId,
        paymentStatus: 'PENDING_MANUAL_PROOF',
        isActive: false,
        paymentProofSenderName: senderName,
        paymentProofSenderBank: senderBank,
        paymentProofFileName: paymentProofFileName || 'bukti_transfer.jpg',
        paymentProofNote: `Transfer ATM dari ${senderName} via Bank ${senderBank}`,
        createdAt: today.toISOString()
      }, { merge: true });

      // Trigger local screen shift by refreshing local state
      const updatedSnap = await getDoc(doc(db, 'tenants', activeTenantId));
      if (updatedSnap.exists()) {
        setTenantData(updatedSnap.data());
      }

    } catch (err: any) {
      console.error("Gagal mengirim bukti manual:", err);
      setErrorMsg(err.message || 'Gagal mengirim bukti transfer. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`flex flex-col items-center justify-center ${isEmbedded ? 'py-12 bg-[#0d0d0d]' : 'min-h-screen bg-[#0d0d0d]'} text-white p-6`}>
        <div className="bg-[#161616] border border-emerald-950/40 p-10 rounded-[3rem] max-w-xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/5 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight leading-none">Pembayaran Berhasil!</h2>
            <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Paket {selectedPlanObj.name} Aktif</p>
          </div>

          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed font-semibold">
            Terima kasih! Pembayaran menggunakan kartu kredit berhasil diproses. 
            Tenant Anda telah resmi di-upgrade ke paket <strong>{selectedPlanObj.name}</strong> dengan akses penuh.
          </p>

          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-left max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Metode Pembayaran:</span>
              <span className="font-mono text-white">Credit Card (**** {cardNumber.slice(-4)})</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Siklus Penagihan:</span>
              <span className="text-white capitalize font-semibold">{billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan'}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Berlaku Hingga:</span>
              <span className="text-white font-semibold">{formattedNextBillingDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-4">
            <Coins className="w-4 h-4 animate-spin" />
            <span>Mengarahkan kembali & mengaktifkan penuh modul SmaRtRw...</span>
          </div>
        </div>
      </div>
    );
  }

  if (tenantData && tenantData.paymentStatus === 'PENDING_MANUAL_PROOF') {
    const pProofSender = tenantData.paymentProofSenderName || '-';
    const pProofBank = tenantData.paymentProofSenderBank || '-';
    const pProofFile = tenantData.paymentProofFileName || 'bukti_transfer.jpg';
    
    // Pre-filled WhatsApp message
    const waText = `Halo Admin SmaRtRw, mohon bantuan untuk memverifikasi Wilayah:
- ID Tenant: ${activeTenantId}
- Nama Wilayah: ${tenantName}
- Paket: ${tenantData.plan || 'PRO'}
- Transfer Atas Nama: ${pProofSender}
- Bank Pengirim: ${pProofBank}

Terima kasih! Saya sudah kirim bukti pembayaran via ATM.`;
    const waUrl = `https://wa.me/6287726741143?text=${encodeURIComponent(waText)}`;

    const handleCancelManualAndPayOnline = async () => {
      setIsSubmitting(true);
      try {
        await updateDoc(doc(db, 'tenants', activeTenantId), {
          paymentStatus: null,
          status: 'TRIAL'
        });
        
        setTenantData(prev => ({
          ...prev,
          paymentStatus: null,
          status: 'TRIAL'
        }));
        
        setPaymentMethod('ONLINE');
        setErrorMsg('');
      } catch (err: any) {
        console.error("Gagal mengganti metode pembayaran:", err);
        setErrorMsg("Gagal melakukan switch metode pembayaran. Silakan muat ulang.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0f0f10] border border-slate-900 rounded-[2.5rem] p-10 max-w-xl w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-500/5 animate-pulse">
            <Clock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight leading-none text-amber-500">Menunggu Verifikasi ATM</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Manual Bank Transfer Queue</p>
          </div>

          <div className="text-slate-350 text-xs text-left space-y-1.5 p-4 bg-slate-900/40 border border-slate-900 rounded-2xl">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>ID Tenant:</span>
              <span className="font-mono text-white font-bold">{activeTenantId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>Wilayah:</span>
              <span className="text-white font-bold">{tenantName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>Plan Diminta:</span>
              <span className="text-indigo-400 font-black uppercase text-[10px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{tenantData.plan || 'PRO'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span>Rekening Pengirim:</span>
              <span className="text-white font-bold">{pProofSender} ({pProofBank})</span>
            </div>
            <div className="flex justify-between">
              <span>Lampiran Bukti:</span>
              <span className="text-blue-400 font-mono text-[10px] block truncate max-w-[200px]">{pProofFile}</span>
            </div>
          </div>

          <div className="text-slate-400 text-xs leading-relaxed font-semibold">
            Tim keuangan SmaRtRw Pusat sedang memeriksa laporan bukti transfer ATM di atas. Akun kependudukan Anda akan aktif otomatis setelah disetujui Admin. 
            Biasanya proses ini memakan waktu beberapa menit hingga maksimal 1x24 jam.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <a 
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/10 hover:scale-[1.01] active:scale-99 transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer border border-emerald-550/20"
            >
              <span>Hubungi WA Admin</span>
            </a>
            
            <button 
              type="button"
              onClick={handleCancelManualAndPayOnline}
              disabled={isSubmitting}
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-black rounded-2xl shadow-xl transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 cursor-pointer border border-slate-800"
            >
              <span>Bayar Online Instan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isEmbedded ? '' : 'min-h-screen'} bg-[#0a0a0a] text-slate-100 flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Upper Navigation Rail */}
      {!isEmbedded && (
        <div className="border-b border-slate-900 bg-[#0d0d0d] px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <button 
            onClick={() => {
              if (onCloseEmbedded) {
                onCloseEmbedded();
              } else {
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Aplikasi</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Aplikasi Wilayah</p>
              <p className="text-xs font-black text-rose-400 tracking-tight mt-0.5">{tenantName}</p>
            </div>
          </div>
        </div>
      )}

      <div className={`${isEmbedded ? 'px-0 py-2' : 'max-w-6xl mx-auto px-4 md:px-8 py-10'} w-full flex-grow flex flex-col`}>
        
        {/* Banner Auto-Renew */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 mb-8">
          <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-amber-400">Pembaruan Berlangganan Otomatis Aktif:</span> Periode paket ini akan diperpanjang otomatis pada <span className="font-black text-white">{formattedNextBillingDate}</span>. Anda akan ditagih sebesar <span className="font-black text-white">{formattedIDR(pricePaid)}</span> (Termasuk PPN) pada tanggal tersebut.
          </div>
        </div>

        {/* main layout grid: summary at left (or top), billing checkout at right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Price Breakdown & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0f0f10] border border-slate-900 rounded-[2.5rem] p-8 space-y-6">
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#a3a3a3] mb-1">Rincian Paket Anda</p>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                  <span>SmaRtRw AI</span> 
                  <span className="text-xs px-2.5 py-1 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 rounded-full font-black uppercase tracking-widest">{selectedPlanObj.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">{selectedPlanObj.focus}</p>
              </div>

              {/* Billing Cycle Switcher */}
              <div className="p-1 bg-[#161617] rounded-xl flex border border-slate-900">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                    billingCycle === 'monthly' 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 text-center py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    billingCycle === 'yearly' 
                      ? 'bg-gradient-to-r from-[#d97706] to-[#b45309] text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Tahunan</span>
                  <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Hemat 20%</span>
                </button>
              </div>

              {/* Package Core Features list */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-2">Manfaat yang Didapat</p>
                <ul className="space-y-3">
                  {selectedPlanObj.features.map((feature: string) => (
                    <li key={feature} className="flex gap-2.5 text-xs text-slate-350 leading-relaxed font-medium">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fine Price Calculation Details */}
              <div className="pt-4 border-t border-slate-900 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Biaya Paket:</span>
                  <strong className="text-white font-medium">{formattedIDR(pricePaid / (1 + 0.11))}</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>PPN (11%):</span>
                  <strong className="text-white font-medium">{formattedIDR(pricePaid - (pricePaid / (1 + 0.11)))}</strong>
                </div>
                <div className="h-px bg-slate-900 my-2" />
                <div className="flex justify-between items-baseline text-white">
                  <span className="font-extrabold text-[#e5e5e5] uppercase tracking-widest text-[10px]">Total Tagihan:</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formattedIDR(pricePaid)}
                  </span>
                </div>
                <p className="text-right text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
                  Tagihan setara {formattedIDR(pricePerMonth)}/bulan
                </p>
              </div>
            </div>

            {/* Quality Standard badge matching Claude UI style */}
            <div className="bg-[#0f0f10]/40 border border-slate-900/50 p-6 rounded-3xl space-y-3">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider">Metode Aman Encrypted 256-bit</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Semua transaksi pembayaran diproses melalui gateway kartu kredit terenkripsi SSL 256-bit berstandar perbankan internasional PCI-DSS. Keamanan data dana iuran dan kependudukan RT/RW Anda terjamin sepenuhnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Premium Payment Form (Charcoal Dark UI) */}
          <div className="lg:col-span-7">
            <form onSubmit={paymentMethod === 'ONLINE' ? handlePaymentSubmit : handleManualPaymentSubmit} className="bg-[#0f0f10] border border-slate-900 rounded-[2.5rem] p-8 space-y-6">
              
              {/* Head Section */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-900">
                <div className="w-10 h-10 bg-indigo-500/10 text-brand-blue rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">Formulir Checkout & Pembayaran</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Pilih metode pembayaran dan masukkan data Anda</p>
                </div>
              </div>

              {/* Payment Type Selector tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#161617] p-1 rounded-xl border border-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('ONLINE');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'ONLINE'
                      ? 'bg-white text-slate-900 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Kartu Kredit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('QRIS');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'QRIS'
                      ? 'bg-amber-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  QRIS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('M_BANKING');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'M_BANKING'
                      ? 'bg-amber-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  M-Banking
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod('MANUAL_ATM');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-center text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    paymentMethod === 'MANUAL_ATM'
                      ? 'bg-amber-600 text-white shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Transfer ATM
                </button>
              </div>

              {/* Dynamic Selector Plan Slider directly within Checkout so they can play around, matching reference requests */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-300 mb-3 ml-1">Pilih Paket:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'flash', label: 'Flash' },
                    { id: 'pro', label: 'Pro (Rekomendasi)' },
                    { id: 'premium', label: 'Premium' },
                    { id: 'enterprise', label: 'Enterprise' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`py-2 px-1 text-center text-[10px] font-black uppercase tracking-tight rounded-xl border transition-all cursor-pointer ${
                        selectedPlanId === p.id
                          ? 'bg-white text-slate-900 border-white font-extrabold shadow-lg'
                          : 'bg-[#141415] text-slate-400 border-slate-900 hover:text-white hover:border-slate-800'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {paymentMethod === 'ONLINE' ? (
                /* ONLINE CREDIT CARD FORM INPUTS */
                <div className="space-y-4">
                  {/* Full name */}
                  <div>
                    <label htmlFor="fullName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nama Lengkap Pemegang Kartu</label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-bold"
                    />
                  </div>

                  {/* Country dropdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="country" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Negara atau Wilayah</label>
                      <div className="relative">
                        <select
                          id="country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-[#141415] border border-slate-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all font-bold appearance-none cursor-pointer"
                        >
                          <option value="Indonesia">🇮🇩 Indonesia</option>
                          <option value="Singapore">🇸🇬 Singapore</option>
                          <option value="Malaysia">🇲🇾 Malaysia</option>
                          <option value="Brunei">🇧🇳 Brunei Darussalam</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                          <Globe className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Alamat Baris 1 */}
                    <div>
                      <label htmlFor="alamat" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Baris Alamat 1</label>
                      <input
                        id="alamat"
                        type="text"
                        required
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="Contoh: Jl. Diponegoro RT 02/RW 03 Blok B"
                        className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-bold"
                      />
                    </div>
                  </div>

                  {/* Card Number */}
                  <div className="pt-2">
                    <label htmlFor="card_number" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">
                      Nomor Kartu (Visa, Mastercard, JCB, dsb...)
                    </label>
                    <div className="relative">
                      <input
                        id="card_number"
                        type="text"
                        required
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4000 1234 5678 9010"
                        className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl pl-12 pr-4 py-3.5 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-mono font-bold tracking-widest"
                      />
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <CreditCard className="w-5 h-5 text-slate-500" />
                      </div>
                      
                      <div className="absolute inset-y-0 right-4 flex items-center gap-1">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getCardType() === 'VISA' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-650'}`}>VISA</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getCardType() === 'MASTERCARD' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-650'}`}>MC</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${getCardType() === 'JCB' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-650'}`}>JCB</span>
                      </div>
                    </div>
                  </div>

                  {/* Expire and CVC */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="exp" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Tanggal Kedaluwarsa (MM/TT)</label>
                      <input
                        id="exp"
                        type="text"
                        required
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM / TT"
                        className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-mono font-bold text-center tracking-widest animate-pulse-once"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1 flex items-center justify-between">
                        <span>Kode Keamanan (CVC)</span>
                        <span title="3 atau 4 digit di belakang kartu Anda"><HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-help transition-colors" /></span>
                      </label>
                      <input
                        id="cvc"
                        type="password"
                        required
                        value={cvc}
                        onChange={handleCvcChange}
                        placeholder="•••"
                        className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-mono font-bold text-center tracking-widest"
                      />
                    </div>
                  </div>

                  {/* Use different billing name checkbox toggle */}
                  <div className="pt-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useDiffBillingName}
                        onChange={(e) => setUseDiffBillingName(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-400 font-bold hover:text-white transition-colors">Gunakan nama yang berbeda di faktur / invoice</span>
                    </label>
                  </div>

                  {useDiffBillingName && (
                    <div className="pt-1 animate-fade-in">
                      <label htmlFor="billingName" className="block text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2">Nama Faktur Khusus</label>
                      <input
                        id="billingName"
                        type="text"
                        value={billingName}
                        onChange={(e) => setBillingName(e.target.value)}
                        placeholder="Contoh: PT. Wilayah Maju Bersama"
                        className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none font-bold"
                      />
                    </div>
                  )}

                  {/* ID Pajak Bisnis / NPWP */}
                  <div className="pt-2 border-t border-slate-900/60">
                    <div className="mb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-350">ID Pajak Bisnis (Opsional)</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">Jika Anda memberikan ID pajak, nama pembayar di atas otomatis dikaitkan dengan nama bisnis wajib pajak Anda.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <select
                        value={taxIdChoice}
                        onChange={(e) => setTaxIdChoice(e.target.value)}
                        className="md:col-span-4 bg-[#141415] border border-slate-900 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue transition-all font-bold cursor-pointer"
                      >
                        <option value="NPWP">🇮🇩 ID Pajak NPWP</option>
                        <option value="EIN">🇺🇸 US EIN Number</option>
                        <option value="VAT">🇪🇺 EU VAT ID</option>
                      </select>

                      <input
                        type="text"
                        value={taxIdValue}
                        onChange={handleNpwpChange}
                        placeholder="12.345.678.9-012.345"
                        disabled={taxIdChoice !== 'NPWP'}
                        className="md:col-span-8 bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 disabled:opacity-40 font-mono font-bold tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Policy terms Agreement checkbox */}
                  <div className="pt-4 border-t border-slate-900/60">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 rounded text-emerald-600 bg-slate-900 border-slate-800 w-4 h-4 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-400 font-bold leading-relaxed hover:text-[#d1d5db] transition-colors select-none">
                        Anda menyatakan menyetujui bahwa <span className="text-white">SmaRtRw AI (atau mitra finansial berlisensi Kami)</span> berhak melakukan pemotongan dan penagihan berulang otomatis pada saldo kartu kredit milik Anda sesuai dengan rincian biaya {formattedIDR(pricePaid)} per bulan. Pembatalan masa berlangganan kapan pun bisa Anda lakukan secara langsung melalui bilah Setelan Akun Anda.
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                /* MANUAL TRANSFER FORM INPUTS */
                <div className="space-y-4">
                  
                  {/* Mandiri Transfer Guidelines */}
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-900 text-xs leading-relaxed space-y-2 pb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#a3a3a3]">Rekening Tujuan Pembayaran SmaRtRw:</p>
                    
                    <div className="flex justify-between font-semibold font-sans">
                      <span className="text-slate-405">Nama Bank:</span>
                      <span className="text-white font-black">Bank Mandiri</span>
                    </div>
                    
                    <div className="flex justify-between font-semibold font-sans">
                      <span className="text-slate-405">Nomor Rekening:</span>
                      <span className="text-emerald-400 font-mono font-bold tracking-wider text-sm select-all">127.00.1206116.2</span>
                    </div>

                    <div className="flex justify-between font-semibold font-sans">
                      <span className="text-slate-405">Atas Nama pemilik:</span>
                      <span className="text-white font-bold text-xs">Annisa Putri Handayani</span>
                    </div>
                    
                    <div className="h-px bg-slate-900 my-2" />
                    
                    <div className="flex justify-between items-baseline font-black text-amber-500">
                      <span className="text-[10px] uppercase tracking-widest">Total Nominal Transfer:</span>
                      <span className="text-sm">{formattedIDR(pricePaid)}</span>
                    </div>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label htmlFor="senderName" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nama Pemilik Rekening Pengirim (Sesuai ATM)</label>
                    <input
                      id="senderName"
                      type="text"
                      required={paymentMethod === 'MANUAL_ATM'}
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Contoh: Sukarno Hadi"
                      className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-bold"
                    />
                  </div>

                  {/* Sender Bank */}
                  <div>
                    <label htmlFor="senderBank" className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Nama Bank Pengirim</label>
                    <input
                      id="senderBank"
                      type="text"
                      required={paymentMethod === 'MANUAL_ATM'}
                      value={senderBank}
                      onChange={(e) => setSenderBank(e.target.value)}
                      placeholder="Contoh: Bank Central Asia (BCA) / Bank Mandiri"
                      className="w-full bg-[#141415] border border-slate-900 hover:border-slate-800 focus:border-brand-blue rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder:text-slate-600 font-bold"
                    />
                  </div>

                  {/* File Upload clicker */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Lampiran Bukti Transfer (Foto/Struk ATM)</label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf" 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentProofFileName(e.target.files[0].name);
                        }
                      }}
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#141415] border-2 border-dashed border-slate-900 hover:border-slate-800 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-900/10 transition-all"
                    >
                      <div className="w-10 h-10 bg-slate-900 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2 font-sans">
                        <Upload className="w-5 h-5 text-indigo-400" />
                      </div>
                      {paymentProofFileName ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-emerald-400">Berhasil Dilekatkan:</p>
                          <p className="text-xs font-mono text-white tracking-widest">{paymentProofFileName}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Klik lagi untuk mengubah berkas</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs text-slate-400 font-bold cursor-pointer">Pilih foto atau file bukti transfer ATM</p>
                          <p className="text-[10px] text-slate-600 cursor-pointer">Sistem otomatis me-link file untuk persetujuan admin</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Submit Checkout button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 mt-4 ${
                  paymentMethod === 'ONLINE' 
                    ? 'bg-white hover:bg-neutral-200 text-slate-900' 
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                } font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-black/5`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses Transaksi...</span>
                  </>
                ) : (
                  <>
                    {paymentMethod === 'ONLINE' ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-700 stroke-[3]" />
                        <span>Lanjutkan Pembayaran — Berlangganan</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-amber-600 stroke-[3]" />
                        <span>Kirim Bukti Transfer ke Admin</span>
                      </>
                    )}
                  </>
                )}
              </button>

            </form>
          </div>
          
        </div>

      </div>

    </div>
  );
};

export default PaymentPage;
