import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Mail, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginView({ 
  setWargaAuth, wargaData, isLoadingDB 
}: { 
  setWargaAuth: any, wargaData: any[], isLoadingDB: boolean 
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'warga'>('admin');
  const [nik, setNik] = useState('');
  const [kodeKeluarga, setKodeKeluarga] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError("Email atau Password salah. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWargaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const cleanNik = nik.trim();
    const cleanKK = kodeKeluarga.trim();
    
    const found = wargaData.find(w => 
      String(w.nik).trim() === cleanNik && 
      (String(w.kk).trim() === cleanKK || String(w.hp).trim() === cleanKK)
    );

    if (found) {
      try {
        const userCredential = await signInAnonymously(auth);
        const uid = userCredential.user.uid;
        const vRef = doc(db, 'verifikasi_warga', found.id || found.nik);
        await setDoc(vRef, { 
          authUid: uid,
          nik: found.nik,
          nama: found.nama,
          status: 'Terhubung'
        }, { merge: true });
        
        setWargaAuth(found);
      } catch (err) {
        setError('Gagal menghubungkan ke sistem. Coba lagi.');
      }
    } else {
      setError('Data warga tidak ditemukan. Pastikan NIK dan No. KK/HP benar.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg bg-white rounded-[3rem] shadow-2xl shadow-blue-900/20 overflow-hidden border border-slate-100"
      >
        <div className="p-12 pb-8 text-center">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-200">
              <Lock className="w-10 h-10 text-white" />
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Smart RW 26</h1>
           <p className="text-slate-400 text-sm font-medium mt-2">Sistem Administrasi & Layanan Terpadu</p>
        </div>

        <div className="px-12 mb-8">
           <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1 border border-slate-100">
              <button onClick={() => setLoginMode('admin')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all \${loginMode === 'admin' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Admin / Petugas</button>
              <button onClick={() => setLoginMode('warga')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all \${loginMode === 'warga' ? 'bg-white shadow-lg text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>Warga Mandiri</button>
           </div>
        </div>

        <div className="px-12 pb-12">
           {error && (
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl mb-6 text-[11px] font-bold text-rose-600 text-center">
                {error}
             </motion.div>
           )}

           {loginMode === 'admin' ? (
             <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="relative group">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                   <input 
                     type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                     placeholder="Email Petugas"
                   />
                </div>
                <div className="relative group">
                   <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                   <input 
                     type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                     className="w-full pl-14 pr-14 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                     placeholder="Password"
                   />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                   </button>
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Mengautentikasi...' : 'Masuk Dashboard'} <ArrowRight className="w-4 h-4" />
                </button>
             </form>
           ) : (
             <form onSubmit={handleWargaLogin} className="space-y-5">
                <div className="relative group">
                   <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                   <input 
                     type="text" required value={nik} onChange={(e) => setNik(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 font-mono tracking-widest"
                     placeholder="NIK Sesuai KTP"
                   />
                </div>
                <div className="relative group">
                   <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                   <input 
                     type="password" required value={kodeKeluarga} onChange={(e) => setKodeKeluarga(e.target.value)}
                     className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20"
                     placeholder="No. KK / HP Terdaftar"
                   />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 flex items-center justify-center gap-3"
                >
                  {isLoading ? 'Memvalidasi...' : 'Masuk Profil Warga'} <ArrowRight className="w-4 h-4" />
                </button>
             </form>
           )}
        </div>
        
        <div className="px-12 py-8 bg-slate-50 text-center border-t border-slate-100">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Pemerintah Desa Sukajaya • RW 26<br/>Kabupaten Bekasi - Jawa Barat</p>
        </div>
      </motion.div>
    </div>
  );
}
