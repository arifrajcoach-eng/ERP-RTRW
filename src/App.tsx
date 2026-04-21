import React, { useState, useRef, useEffect } from 'react';
import { Users, BookOpen, FileText, LayoutDashboard, CreditCard, PlusCircle, MinusCircle, Calendar, Search, Settings, Edit, Trash2, X, Download, Menu, Upload, LogOut, Lock, User, Printer, AlertTriangle, Eye, EyeOff, ChevronRight, Database } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc, onSnapshot, getDocFromServer, writeBatch } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from './firebase';

// --- INITIAL DUMMY DATA ---
const INITIAL_WARGA_DATA = [
  { nama: "Bpk. Ahmad Suhendar", nik: "3271012345670001", kk: "3271012345678881", rt: "01", rw: "05", blok: "A/01", status: "Warga Tetap", hp: "081234567890", posisi: "Ketua RT", profesi: "Guru", jk: "Laki-Laki", tglLahir: "1980-05-15", tglDaftar: "2024-01-10" },
  { nama: "Ibu Siti Aminah", nik: "3271012345670002", kk: "3271012345678882", rt: "01", rw: "05", blok: "A/02", status: "Warga Tetap", hp: "081234567891", posisi: "Ibu Rumah Tangga", profesi: "Ibu Rumah Tangga", jk: "Perempuan", tglLahir: "1983-08-20", tglDaftar: "2024-01-12" },
  { nama: "Bpk. Joko Anas", nik: "3271012345670003", kk: "3271012345678883", rt: "02", rw: "05", blok: "B/05", status: "Warga Tetap", hp: "081234567892", posisi: "Wiraswasta", profesi: "Pedagang", jk: "Laki-Laki", tglLahir: "1975-12-10", tglDaftar: "2024-01-15" },
  { nama: "Sdr. Bayu Pratama", nik: "3271012345670004", kk: "3271012345678884", rt: "03", rw: "05", blok: "C/10", status: "Kontrak", hp: "081234567893", posisi: "Karyawan Swasta", profesi: "Programmer", jk: "Laki-Laki", tglLahir: "1998-03-25", tglDaftar: "2024-03-20" },
  { nama: "Ibu Ratna Sari", nik: "3271012345670005", kk: "3271012345678883", rt: "02", rw: "05", blok: "B/05", status: "Warga Tetap", hp: "081234567894", posisi: "Istri", profesi: "Karyawan", jk: "Perempuan", tglLahir: "1978-02-14", tglDaftar: "2024-01-15" },
  { nama: "Bpk. Bambang Pamungkas", nik: "3271012345670006", kk: "3271012345678886", rt: "04", rw: "05", blok: "D/12", status: "Warga Tetap", hp: "081234567895", posisi: "PNS", profesi: "ASN", jk: "Laki-Laki", tglLahir: "1970-07-07", tglDaftar: "2024-02-10" },
  { nama: "Bpk. Agus Riyadi", nik: "3271012345670007", kk: "3271012345678887", rt: "01", rw: "05", blok: "A/15", status: "Warga Tetap", hp: "081234567896", posisi: "Buruh", profesi: "Buruh", jk: "Laki-Laki", tglLahir: "1985-11-30", tglDaftar: "2024-04-05" },
  { nama: "Ibu Lilis Suriani", nik: "3271012345670008", kk: "3271012345678887", rt: "01", rw: "05", blok: "A/15", status: "Warga Tetap", hp: "081234567897", posisi: "Istri", profesi: "Desainer", jk: "Perempuan", tglLahir: "1988-04-12", tglDaftar: "2024-04-05" },
];

const INITIAL_KAS_DATA = [
  { id: "TRX-001", tanggal: "20 Jan 2026", tipe: "Masuk", transaksi: "Kas Lingkungan", nama: "Warga", keterangan: "Saldo Awal Tahun", debit: 4500000, kredit: 0 },
  { id: "TRX-002", tanggal: "05 Feb 2026", tipe: "Keluar", transaksi: "Biaya Listrik", nama: "PLN", keterangan: "Lampu Jalan & Pos", debit: 0, kredit: 250000 },
  { id: "TRX-003", tanggal: "12 Feb 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "RT 01", keterangan: "Iuran Sampah Kolektif Feb", debit: 1200000, kredit: 0 },
  { id: "TRX-004", tanggal: "02 Mar 2026", tipe: "Keluar", transaksi: "Biaya Perbaikan", nama: "Toko Bangunan", keterangan: "Semen & Cat Pos Ronda", debit: 0, kredit: 450000 },
  { id: "TRX-005", tanggal: "15 Mar 2026", tipe: "Masuk", transaksi: "Donasi", nama: "Bpk. Bambang", keterangan: "Sumbangan Acara Bukber", debit: 1000000, kredit: 0 },
  { id: "TRX-006", tanggal: "02 Apr 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "Bpk. Joko", keterangan: "Iuran Keamanan Apr", debit: 50000, kredit: 0 },
  { id: "TRX-007", tanggal: "05 Apr 2026", tipe: "Keluar", transaksi: "Konsumsi", nama: "Warung Makan", keterangan: "Rapat Pengurus", debit: 0, kredit: 150000 },
  { id: "TRX-008", tanggal: "10 Apr 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "Ibu Siti", keterangan: "Iuran Kebersihan Apr", debit: 50000, kredit: 0 },
  { id: "TRX-009", tanggal: "15 Apr 2026", tipe: "Keluar", transaksi: "Operasional", nama: "Kurir", keterangan: "Kirim Berkas RW", debit: 0, kredit: 25000 },
  { id: "TRX-010", tanggal: "18 Apr 2026", tipe: "Masuk", transaksi: "Sumbangan", nama: "Hamba Allah", keterangan: "Kas Mesjid", debit: 500000, kredit: 0 },
  { id: "TRX-011", tanggal: "19 Apr 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "Bpk. Ahmad", keterangan: "Iuran Keamanan Apr", debit: 50000, kredit: 0 },
  { id: "TRX-012", tanggal: "20 Apr 2026", tipe: "Keluar", transaksi: "Kebersihan", nama: "Petugas Sampah", keterangan: "Gaji Petugas Apr", debit: 0, kredit: 750000 },
];

const INITIAL_SURAT_DATA = [
  { id: "SRT-1004", tanggal: "19 Apr 2026", pemohon: "Ibu Siti Aminah", jenis: "Surat Domisili", status: "Diajukan" },
  { id: "SRT-1003", tanggal: "17 Apr 2026", pemohon: "Bpk. Ahmad Suhendar", jenis: "Pengantar Kelurahan", status: "Selesai" },
  { id: "SRT-1002", tanggal: "16 Apr 2026", pemohon: "Sdr. Bayu Pratama", jenis: "Surat Keterangan Usaha", status: "Diajukan" },
  { id: "SRT-1001", tanggal: "10 Apr 2026", pemohon: "Bpk. Joko Anas", jenis: "Surat Domisili", status: "Selesai" },
];

const INITIAL_IURAN_DATA = [
  { id: "INV-2604-001", tanggal: "19 Apr 2026, 08:30", transaksi: "Iuran Keamanan", nama: "Bpk. Ahmad Suhendar", periode: "Apr 2026", nominal: 50000, status: "Lunas", keterangan: "-" },
  { id: "INV-2604-002", tanggal: "18 Apr 2026, 14:15", transaksi: "Iuran Kebersihan", nama: "Ibu Siti Aminah", periode: "Apr 2026", nominal: 50000, status: "Pending", keterangan: "Janji bayar akhir bulan" },
  { id: "INV-2604-003", tanggal: "02 Apr 2026, 09:10", transaksi: "Iuran Keamanan", nama: "Bpk. Joko Anas", periode: "Apr 2026", nominal: 50000, status: "Lunas", keterangan: "-" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, role: string, email?: string} | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // --- FIREBASE AUTH SYNC ---
  useEffect(() => {
    // 0. Validate Connection to Firestore (Critical Constraint)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Firestore connection failed. Please check your configuration.");
        }
      }
    };
    testConnection();

    // Ensure persistence
    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch additional user info/role from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as any);
          } else {
            // If No Firestore doc yet, use default based on email (for easy migration)
            let role = 'Viewer';
            let name = user.email?.split('@')[0] || 'User';
            
            const isAdminEmail = user.email === 'admin@rw26.com' || user.email === 'arifrajcoach@gmail.com';
            
            if (isAdminEmail) { role = 'Admin'; name = 'Bpk. Arif (Admin)'; }
            else if (user.email === 'operator@rw26.com') { role = 'Operator'; name = 'Petugas RT'; }
            
            const newUser = { name, role, email: user.email };
            // Auto-create the doc BEFORE setting state to avoid race condition with rules
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          if (error?.code !== 'permission-denied') {
            setCurrentUser({ name: user.email || 'User', role: 'Viewer' });
          } else {
            // Handle profile read denial explicitly
            setCurrentUser(null);
            setDbError("Profil Anda belum aktif atau tidak memiliki izin akses. Hubungi Admin.");
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // --- CENTRAL STATE WITH LOCALSTORAGE PERSISTENCE ---
  const [wargaData, setWargaData] = useState(() => {
    const saved = localStorage.getItem('rw26_wargaData');
    return saved ? JSON.parse(saved) : INITIAL_WARGA_DATA;
  });

  const [kasData, setKasData] = useState(() => {
    const saved = localStorage.getItem('rw26_kasData');
    return saved ? JSON.parse(saved) : INITIAL_KAS_DATA;
  });

  const [suratData, setSuratData] = useState(() => {
    const saved = localStorage.getItem('rw26_suratData');
    return saved ? JSON.parse(saved) : INITIAL_SURAT_DATA;
  });

  const [iuranData, setIuranData] = useState(() => {
    const saved = localStorage.getItem('rw26_iuranData');
    return saved ? JSON.parse(saved) : INITIAL_IURAN_DATA;
  });

  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // --- FIREBASE SYNC (REAL-TIME) ---
  useEffect(() => {
    if (!currentUser) {
      setIsLoadingDB(false);
      return;
    }

    setIsLoadingDB(true);
    let loadedSections = 0;
    const totalSections = 4;

    const onDataLoaded = () => {
      loadedSections++;
      if (loadedSections >= totalSections) {
        setIsLoadingDB(false);
      }
    };

    // 1. Warga Listener
    const unsubWarga = onSnapshot(collection(db, 'warga'), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setWargaData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'warga');
        onDataLoaded();
      }
    );

    // 2. Kas Listener
    const unsubKas = onSnapshot(collection(db, 'kas'), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setKasData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'kas');
        onDataLoaded();
      }
    );

    // 3. Surat Listener
    const unsubSurat = onSnapshot(collection(db, 'surat'), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setSuratData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'surat');
        onDataLoaded();
      }
    );

    // 4. Iuran Listener
    const unsubIuran = onSnapshot(collection(db, 'iuran'), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setIuranData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'iuran');
        onDataLoaded();
      }
    );

    return () => {
      unsubWarga();
      unsubKas();
      unsubSurat();
      unsubIuran();
    };
  }, [currentUser]);

  // Centralized Error Handler for Firestore
  const handleFirestoreError = (err: any, op: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write', path: string) => {
    if (err?.code === 'permission-denied') {
      const errorInfo = {
        error: "Missing or insufficient permissions",
        operationType: op,
        path: path,
        authInfo: {
          userId: auth.currentUser?.uid || 'anonymous',
          email: auth.currentUser?.email || '',
          emailVerified: auth.currentUser?.emailVerified || false,
          isAnonymous: auth.currentUser?.isAnonymous ?? true,
          providerInfo: auth.currentUser?.providerData.map(p => ({
            providerId: p.providerId,
            displayName: p.displayName || '',
            email: p.email || ''
          })) || []
        }
      };
      console.error("Firestore Security Error:", JSON.stringify(errorInfo, null, 2));
      alert(`Akses Ditolak: Peran anda mungkin belum terdaftar di database atau sesi anda habis. (${op} pada ${path}).`);
    } else {
      console.error(`Firestore ${op} error on ${path}:`, err);
    }
  };

  // Helper for uploading files to Firebase Storage
  const handleFileUpload = async (file: File, folder: string) => {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  };

  // Effect to sync data to localStorage (keep as secondary backup)
  useEffect(() => { localStorage.setItem('rw26_wargaData', JSON.stringify(wargaData)); }, [wargaData]);
  useEffect(() => { localStorage.setItem('rw26_kasData', JSON.stringify(kasData)); }, [kasData]);
  useEffect(() => { localStorage.setItem('rw26_suratData', JSON.stringify(suratData)); }, [suratData]);
  useEffect(() => { localStorage.setItem('rw26_iuranData', JSON.stringify(iuranData)); }, [iuranData]);

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium tracking-tight">Menyiapkan Sesi Keamanan...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans print:h-auto print:bg-white text-sm relative">
      {isLoadingDB && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sinkronisasi Database</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Mohon tunggu sebentar, sistem sedang memuat data dari Firebase...</p>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative z-50 md:z-auto w-72 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full print:hidden transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl md:shadow-none'}`}>
        <div className="p-6 border-b border-slate-100 flex-shrink-0 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
              <img src="/logo_rw26.png" alt="Logo RW 26" className="w-8 h-8" referrerPolicy="no-referrer" />
              RW 26 BERJUANG
            </h1>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Smart System by Nexapps</p>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-red-500 md:hidden bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'warga', label: 'Data Warga', icon: Users },
            { id: 'transaksi', label: 'Transaksi', icon: CreditCard },
            { id: 'surat', label: 'Surat Pengantar', icon: FileText },
            { id: 'kas', label: 'Laporan Kas', icon: BookOpen },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
          ].filter(item => {
            if (currentUser?.role === 'Viewer' && item.id === 'pengaturan') return false;
            if (currentUser?.role === 'Operator' && item.id === 'pengaturan') return false;
            return true;
          }).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false); // Close sidebar on mobile after selection
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-100 text-slate-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible w-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-2.5 -ml-2 text-slate-500 hover:text-blue-600 md:hidden bg-slate-50 rounded-xl transition-all active:scale-95 shadow-sm border border-slate-200/50"
             >
               <Menu className="w-6 h-6" />
             </button>
             <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded border border-slate-200 uppercase font-mono tracking-wider hidden sm:inline-block">
               GAS-DB-V4
             </span>
             <div className="flex items-center gap-1.5 bg-green-50 text-green-600 text-[10px] px-2 py-1 rounded border border-green-100 uppercase font-bold tracking-wider animate-pulse">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
               Live Sync Active
             </div>
             <h2 className="text-sm font-semibold text-slate-500 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">

             <div className="flex items-center space-x-2 md:space-x-3 pl-4 border-l border-slate-200">
               <div className="text-right hidden lg:block">
                 <p className="text-sm font-bold leading-none text-slate-800">{currentUser.name}</p>
                 <span className="text-[10px] uppercase font-bold text-blue-600 mt-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-block">{currentUser.role}</span>
               </div>
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-100 border border-blue-400">
                 {currentUser.name.charAt(0)}
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-1 md:ml-2"
                title="Keluar"
               >
                 <LogOut className="w-5 h-5" />
               </button>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-3 md:p-6 h-full overflow-auto print:overflow-visible print:h-auto print:p-0">
          {activeTab === 'dashboard' && <DashboardView kasData={kasData} wargaData={wargaData} suratData={suratData} iuranData={iuranData} userRole={currentUser.role} setActiveTab={setActiveTab} />}
          {activeTab === 'warga' && <WargaView wargaData={wargaData} setWargaData={setWargaData} userRole={currentUser.role} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} />}
          {activeTab === 'transaksi' && <IuranView iuranData={iuranData} setIuranData={setIuranData} kasData={kasData} setKasData={setKasData} wargaData={wargaData} userRole={currentUser.role} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} />}
          {activeTab === 'surat' && <SuratView suratData={suratData} setSuratData={setSuratData} wargaData={wargaData} userRole={currentUser.role} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} />}
          {activeTab === 'kas' && <KasView kasData={kasData} setKasData={setKasData} iuranData={iuranData} setIuranData={setIuranData} wargaData={wargaData} userRole={currentUser.role} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} />}
          {activeTab === 'pengaturan' && <PengaturanView />}
        </div>
      </main>
    </div>
  );
}

function DashboardView({ kasData, wargaData, suratData, iuranData, userRole, setActiveTab }: { kasData: any[], wargaData: any[], suratData: any[], iuranData: any[], userRole: string, setActiveTab: (tab: string) => void }) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  const [piePeriod, setPiePeriod] = useState('30days');

  const months = [
    { id: 'Jan', label: 'Jan' }, { id: 'Feb', label: 'Feb' }, { id: 'Mar', label: 'Mar' },
    { id: 'Apr', label: 'Apr' }, { id: 'Mei', label: 'Mei' }, { id: 'Jun', label: 'Jun' },
    { id: 'Jul', label: 'Jul' }, { id: 'Agu', label: 'Agu' }, { id: 'Sep', label: 'Sep' },
    { id: 'Okt', label: 'Okt' }, { id: 'Nov', label: 'Nov' }, { id: 'Des', label: 'Des' }
  ];

  // Helper formatting
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
  };

  // Stats calculation
  const totalWarga = wargaData.length;
  // Improved KK detection: based on the exact phrase the user requested
  const kepalaKeluarga = wargaData.filter(w => w.posisi === 'Suami (kepala Keluarga)').length;
  const saldoTotal = kasData.reduce((acc, curr) => acc + (curr.debit || 0) - (curr.kredit || 0), 0);
  const suratPending = suratData.filter(s => s.status === 'Diajukan').length;

  const calculateAge = (tglLahir: string) => {
    if (!tglLahir) return -1;
    // Handle both YYYY-MM-DD and DD-MM-YYYY formats if possible
    let birthDate: Date;
    if (tglLahir.includes('-')) {
      const parts = tglLahir.split('-');
      if (parts[0].length === 4) {
        birthDate = new Date(tglLahir);
      } else {
        birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    } else {
      birthDate = new Date(tglLahir);
    }
    
    if (isNaN(birthDate.getTime())) return -1;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const totalLansia = wargaData.filter(w => {
    const age = calculateAge(w.tglLahir);
    return age >= 60;
  }).length;
  const totalBalita = wargaData.filter(w => {
    const age = calculateAge(w.tglLahir);
    return age >= 0 && age <= 5;
  }).length;
  const totalAnak = wargaData.filter(w => {
    const age = calculateAge(w.tglLahir);
    return age >= 6 && age <= 12;
  }).length;
  const totalRemaja = wargaData.filter(w => {
    const age = calculateAge(w.tglLahir);
    return age >= 13 && age <= 18;
  }).length;
  const totalDewasa = wargaData.filter(w => {
    const age = calculateAge(w.tglLahir);
    return age > 18 && age < 60;
  }).length;
  
  const totalLaki = wargaData.filter(w => w.jk === 'Laki-Laki').length;
  const totalPerempuan = wargaData.filter(w => w.jk === 'Perempuan').length;

  
  // Arus Kas Setahun Data
  const dataYearly = months.map(m => {
    const trxInMonth = kasData.filter(trx => trx.tanggal.includes(m.id));
    return {
      name: m.id,
      masuk: trxInMonth.reduce((acc, curr) => acc + curr.debit, 0),
      keluar: trxInMonth.reduce((acc, curr) => acc + curr.kredit, 0)
    };
  });

  // Simplified monthly detail for 30 days chart
  const data30Days = [
    { name: '1-6', masuk: 1200000, keluar: 800000 },
    { name: '7-12', masuk: 2100000, keluar: 450000 },
    { name: '13-18', masuk: 1500000, keluar: 1200000 },
    { name: '19-24', masuk: 2800000, keluar: 900000 },
    { name: '25-30', masuk: 1950000, keluar: 540000 },
  ];

  // Frequency Stats for Activity Bar Chart
  const getActData = (period: string) => {
    const filteredIuran = period === 'yearly' ? iuranData : iuranData.filter(i => i.tanggal.includes('Apr'));
    const filteredSurat = period === 'yearly' ? suratData : suratData.filter(s => s.tanggal.includes('Apr'));
    const filteredKas = period === 'yearly' ? kasData : kasData.filter(k => k.tanggal.includes('Apr'));

    return [
      { name: 'Iuran Masuk', value: filteredIuran.length * 10 },
      { name: 'Surat Pengantar', value: filteredSurat.length * 8 },
      { name: 'Pengeluaran Kas', value: filteredKas.filter(k => k.tipe === 'Keluar').length * 12 },
      { name: 'Data Warga', value: wargaData.length * 2 },
    ];
  };

  const pieData30Days = getActData('30days');
  const pieDataYearly = getActData('yearly');

  // Merged Recent Activities
  const recentActivities = [
    ...kasData.map(k => ({ date: k.tanggal, title: k.transaksi, desc: `${k.nama}: ${k.keterangan}`, type: k.tipe === 'Masuk' ? 'in' : 'out', amount: k.debit || k.kredit })),
    ...suratData.map(s => ({ date: s.tanggal, title: `Surat: ${s.jenis}`, desc: `Pemohon: ${s.pemohon}`, type: 'doc', status: s.status })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('warga')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Data Warga</span>
        </button>
        <button 
          onClick={() => setActiveTab('transaksi')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Transaksi</span>
        </button>
        <button 
          onClick={() => setActiveTab('surat')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Surat Pengantar</span>
        </button>
        <button 
          onClick={() => setActiveTab('kas')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Laporan Kas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Warga</p>
          <p className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
            {totalWarga} <span className="text-[11px] font-normal text-slate-400">Kepala Keluarga: {kepalaKeluarga}</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Saldo Kas</p>
          <p className="text-2xl font-black text-green-600 flex items-baseline gap-2">
            Rp {formatRupiah(saldoTotal)} <span className="text-[11px] font-normal text-slate-400">+ Sinkron Otomatis</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Surat Pending</p>
          <p className="text-2xl font-black text-orange-500 flex items-baseline gap-2">
            {suratPending} <span className="text-[11px] font-normal text-slate-400">Pengajuan</span>
          </p>
        </div>
      </div>

      {/* Grafik Keuangan Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center">
                <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
                Grafik Arus Kas ({kasPeriod === 'yearly' ? 'Januari - Desember' : `Bulan ${kasPeriod}`})
              </h3>
              <button 
                onClick={() => setKasPeriod('yearly')}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all border ${kasPeriod === 'yearly' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
              >
                Setahun
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {months.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setKasPeriod(m.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    kasPeriod === m.id 
                    ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={kasPeriod === 'yearly' ? dataYearly : data30Days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`Rp ${new Intl.NumberFormat('id-ID').format(value)}`]}
                />
                <Area type="monotone" dataKey="masuk" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMasuk)" name="Pemasukan" />
                <Area type="monotone" dataKey="keluar" stroke="#ef4444" strokeWidth={3} fill="transparent" name="Pengeluaran" />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
          <div className="flex flex-col mb-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
              Demografi Warga
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Kepala Keluarga</p>
              <p className="text-xl font-black text-blue-600">{kepalaKeluarga}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Laki-Laki</p>
              <p className="text-xl font-black text-cyan-600">{totalLaki}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Perempuan</p>
              <p className="text-xl font-black text-rose-500">{totalPerempuan}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Balita (0-5)</p>
              <p className="text-xl font-black text-amber-500">{totalBalita}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Anak (6-12)</p>
              <p className="text-xl font-black text-lime-500">{totalAnak}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Remaja (13-18)</p>
              <p className="text-xl font-black text-violet-500">{totalRemaja}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dewasa (19-59)</p>
              <p className="text-xl font-black text-indigo-600">{totalDewasa}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lansia (60+)</p>
              <p className="text-xl font-black text-emerald-600">{totalLansia}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Aktivitas Terbaru Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          {recentActivities.map((act: any, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  act.type === 'in' ? 'bg-green-50 text-green-600' : 
                  act.type === 'out' ? 'bg-red-50 text-red-600' : 
                  act.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {act.type === 'in' ? <PlusCircle className="w-4 h-4" /> : 
                   act.type === 'out' ? <MinusCircle className="w-4 h-4" /> : 
                   act.type === 'doc' ? <FileText className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.title}</p>
                  <p className="text-[10px] text-slate-400">{act.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${
                  act.type === 'in' ? 'text-green-600' : 
                  act.type === 'out' ? 'text-red-600' : 
                  'text-slate-600'
                }`}>
                  {act.amount ? `Rp ${formatRupiah(act.amount)}` : (act.status || 'Aktif')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Hapus", 
  cancelText = "Batal", 
  type = "danger",
  isLoading = false
}: { 
  isOpen: boolean, 
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel: () => void, 
  confirmText?: string, 
  cancelText?: string, 
  type?: "danger" | "warning" | "info",
  isLoading?: boolean
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4 print:hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="p-8 text-center">
          <div className={`w-16 h-16 ${
            type === 'danger' ? 'bg-red-50 text-red-600' : 
            type === 'warning' ? 'bg-amber-50 text-amber-600' : 
            'bg-blue-50 text-blue-600'
          } rounded-full flex items-center justify-center mx-auto mb-4`}>
            {type === 'danger' ? <Trash2 className="w-8 h-8" /> : 
             type === 'warning' ? <AlertTriangle className="w-8 h-8" /> : 
             <PlusCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>
        <div className="flex border-t border-slate-100">
          <button 
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors border-r border-slate-100 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-4 text-sm font-bold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 
              type === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 
              'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Proses...</span>
              </>
            ) : confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function WargaView({ wargaData, setWargaData, userRole, setIsLoadingDB, handleFirestoreError, handleFileUpload }: { wargaData: any[], setWargaData: any, userRole: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRT, setFilterRT] = useState("Semua");
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);
  const itemsPerPage = 8; // Tampilkan 8 data per halaman agar rapi
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processImportedData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (error) => {
          console.error("CSV Merge Error:", error);
          alert("Gagal mengimpor data. Pastikan format CSV benar.");
        }
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedData = async (data: any[]) => {
    const newData = data.map((row: any) => ({
      nama: row['Nama Lengkap'] || row['nama'] || "",
      nik: row['NIK'] || row['nik'] || "",
      kk: row['No. KK'] || row['no_kk'] || row['kk'] || "",
      rt: row['RT'] || row['rt'] || "01",
      rw: row['RW'] || row['rw'] || "05",
      blok: row['Alamat'] || row['alamat'] || row['blok'] || "",
      status: row['Status Warga'] || row['status'] || "Warga Tetap",
      hp: row['No. HP'] || row['hp'] || "",
      posisi: row['Posisi dalam Keluarga'] || row['posisi'] || "",
      profesi: row['Profesi'] || row['profesi'] || "",
      jk: row['Jenis Kelamin'] || row['jk'] || "Laki-Laki",
      tglLahir: row['Tanggal Lahir'] || row['tgl_lahir'] || "",
      tempatLahir: row['Tempat Lahir'] || row['tempat_lahir'] || "",
      kawin: row['Status Kawin'] || row['kawin'] || "Belum Kawin",
      kewarganegaraan: row['Kewarganegaraan'] || row['kewarganegaraan'] || "WNI",
      tglDaftar: new Date().toISOString().split('T')[0]
    }));

    if (newData.length > 0) {
      try {
        // In Firestore, we set documents by their ID (NIK)
        for (const item of newData) {
          await setDoc(doc(db, 'warga', item.nik), item);
        }
        setWargaData((prev: any) => [...prev, ...newData]);
        alert(`Berhasil mengimpor ${newData.length} data warga.`);
      } catch (error: any) {
        console.error("Firebase Import Error:", error);
        alert("Gagal sinkronisasi data ke Firebase: " + error.message);
      }
    } else {
      alert("Tidak ada data valid yang ditemukan.");
    }
  };

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", posisi: "", profesi: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Auto-restrict NIK and KK to digits only, max 16 chars
    if (name === 'nik' || name === 'kk') {
      value = value.replace(/\D/g, ''); // Remove non-numeric characters
      if (value.length > 16) {
        value = value.slice(0, 16);
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nik && formData.nik.length !== 16) {
      alert("NIK harus terdiri dari tepat 16 digit angka.");
      return;
    }
    
    const newWarga = { ...formData, tglDaftar: new Date().toISOString().split('T')[0] };
    
    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'warga', newWarga.nik), newWarga);
      setShowAddForm(false);
      resetForm();
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/warga/${newWarga.nik}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nik && formData.nik.length !== 16) {
      alert("NIK harus terdiri dari tepat 16 digit angka.");
      return;
    }

    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'warga', editingWarga.nik), formData);
      setShowEditForm(false);
      setEditingWarga(null);
      resetForm();
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/warga/${editingWarga.nik}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'warga', wargaToDelete.nik));
      setWargaData((prev: any) => prev.filter((w: any) => w.nik !== wargaToDelete.nik));
      setWargaToDelete(null);
    } catch (error: any) {
      alert("Gagal menghapus di Firebase: " + error.message);
      setWargaToDelete(null);
    } finally {
      setIsDeletingWarga(false);
    }
  };

  const startEdit = (warga: any) => {
    setEditingWarga(warga);
    setFormData(warga);
    setShowEditForm(true);
  };

  const resetForm = () => {
    setFormData({
      nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", posisi: "", profesi: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI"
    });
  };

  // Membuat daftar opsi statis untuk RT (20) dan RW (50)
  const uniqueRTs = ["Semua", ...Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0'))];
  const uniqueRWs = ["Semua", ...Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0'))];

  // Terapkan filter pada data
  const filteredWargaData = wargaData.filter(w => {
    // Filter RT/RW
    const matchRT = filterRT === "Semua" || w.rt === filterRT;
    const matchRW = filterRW === "Semua" || w.rw === filterRW;
    
    // Filter Kategori Umur
    let matchUmur = true;
    if (filterKategoriUmur !== "Semua") {
      const calculateAge = (tglLahir: string) => {
        if (!tglLahir) return -1;
        const birthDate = new Date(tglLahir);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };
      
      const age = calculateAge(w.tglLahir);
      if (age !== -1) {
        if (filterKategoriUmur === "Balita") matchUmur = age <= 5;
        else if (filterKategoriUmur === "Remaja") matchUmur = age >= 6 && age <= 17;
        else if (filterKategoriUmur === "Dewasa") matchUmur = age >= 18 && age < 60;
        else if (filterKategoriUmur === "Lansia") matchUmur = age >= 60;
      } else {
        matchUmur = false; // Jika tgl_lahir kosong, abaikan dari filter umur kecuali "Semua"
      }
    }
    
    // Fiter Pencarian
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = searchQuery === "" || 
      w.nama.toLowerCase().includes(searchLower) ||
      w.nik.includes(searchQuery) ||
      w.kk.includes(searchQuery) ||
      w.hp.includes(searchQuery);

    return matchRT && matchRW && matchUmur && matchSearch;
  });

  const handleExportExcel = () => {
    const headers = [
      'Nama Lengkap', 'NIK', 'No. KK', 'Tempat Lahir', 'Tgl Lahir', 'Jenis Kelamin', 
      'Posisi dalam Keluarga', 'Profesi / Pekerjaan', 'Agama', 'Status Kawin', 'Kewarganegaraan', 
      'RT', 'RW', 'Alamat/Blok', 'Kelurahan', 'Kecamatan', 'Kota/Kabupaten', 'Status Warga', 'No. HP (WA)'
    ];
    const rows = filteredWargaData.map(w => 
      [
        `"${w.nama || ''}"`, `"${w.nik || ''}"`, `"${w.kk || ''}"`, `"${w.tempatLahir || ''}"`, `"${w.tglLahir || ''}"`, `"${w.jk || ''}"`,
        `"${w.posisi || ''}"`, `"${w.profesi || ''}"`, `"${w.agama || ''}"`, `"${w.kawin || ''}"`, `"${w.kewarganegaraan || ''}"`,
        `"${w.rt || ''}"`, `"${w.rw || ''}"`, `"${w.blok || ''}"`, `"${w.kelurahan || ''}"`, `"${w.kecamatan || ''}"`, `"${w.kota_kab || ''}"`, `"${w.status || ''}"`, `"${w.hp || ''}"`
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Warga_RW26.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Gunakan orientasi lanskap ('l') agar tabel yang lebar bisa muat
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Konfigurasi Judul PDF
    doc.setFontSize(16);
    doc.text("DATA WARGA LENGKAP RW 26 BERJUANG", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    // Konfigurasi Tabel Data Warga yang Lebih Lengkap
    const tableColumn = [
      "Nama Lengkap", "NIK / KK", "L/P", "Posisi", 
      "TTL & Agama", "Pekerjaan", "RT/RW", "Alamat Domisili", 
      "Status", "No HP"
    ];
    const tableRows: any[] = [];

    filteredWargaData.forEach(warga => {
      const ttl_agama = `${warga.tempatLahir || '-'}, ${warga.tglLahir || '-'}\n${warga.agama || '-'}`;
      const nik_kk = `${warga.nik || '-'}\n${warga.kk || '-'}`;
      const alamat_lengkap = `${warga.blok || '-'}\nKel: ${warga.kelurahan || '-'}, Kec: ${warga.kecamatan || '-'}\nKota: ${warga.kota_kab || '-'}`;
      
      const rowData = [
        warga.nama || "-",
        nik_kk,
        warga.jk === 'Laki-Laki' ? 'L' : (warga.jk === 'Perempuan' ? 'P' : '-'),
        warga.posisi || "-",
        ttl_agama,
        warga.profesi || "-",
        `${warga.rt || '-'}/${warga.rw || '-'}`,
        alamat_lengkap,
        warga.status || "-",
        warga.hp || "-"
      ];
      tableRows.push(rowData);
    });

    // Generate tabel menggunakan extension autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
      headStyles: { fillColor: [59, 130, 246], halign: 'center', valign: 'middle' }, // Warna biru
      columnStyles: {
        0: { cellWidth: 35 }, // Nama
        1: { cellWidth: 35 }, // NIK / KK
        2: { cellWidth: 8, halign: 'center' }, // L/P
        3: { cellWidth: 20 }, // Posisi
        4: { cellWidth: 30 }, // TTL & Agama
        5: { cellWidth: 25 }, // Pekerjaan
        6: { cellWidth: 12, halign: 'center' }, // RT/RW
        7: { cellWidth: 60 }, // Alamat
        8: { cellWidth: 20 }, // Status
        9: { cellWidth: 25 }  // No HP
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Warna slate-50
    });

    // Simpan dokumen PDF
    doc.save(`Data_Warga_Lengkap_RW26_${new Date().getTime()}.pdf`);
  };

  // Reset page when filter changes
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setCurrentPage(1); // Kembali ke halaman 1 saat filter/pencarian berubah
  };

  // Logika Pagination
  const totalPages = Math.ceil(filteredWargaData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative print:border-none print:shadow-none print:overflow-visible">
      <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:justify-between lg:items-center bg-white print:hidden gap-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Daftar Warga
        </h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Kolom Pencarian */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama/NIK/KK/HP..."
              value={searchQuery}
              onChange={handleFilterChange(setSearchQuery)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-48 transition-all"
            />
          </div>
          
            {/* Filter Dropdowns & Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Filter:</span>
              <select 
                value={filterRW}
                onChange={handleFilterChange(setFilterRW)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {uniqueRWs.map(rw => <option key={`rw-${rw}`} value={rw}>RW {rw === 'Semua' ? 'Semua' : rw}</option>)}
              </select>
              <select 
                value={filterRT}
                onChange={handleFilterChange(setFilterRT)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                {uniqueRTs.map(rt => <option key={`rt-${rt}`} value={rt}>RT {rt === 'Semua' ? 'Semua' : rt}</option>)}
              </select>
              <select 
                value={filterKategoriUmur}
                onChange={handleFilterChange(setFilterKategoriUmur)}
                className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="Semua">Semua Umur</option>
                <option value="Balita">Balita (0-5)</option>
                <option value="Remaja">Remaja (6-17)</option>
                <option value="Dewasa">Dewasa (18-59)</option>
                <option value="Lansia">Lansia ({'>'}= 60)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button onClick={handleExportPDF} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Download PDF">
                <Download className="w-3.5 h-3.5 text-red-500" />
                <span className="hidden xl:inline">PDF</span>
              </button>
              <button onClick={handleExportExcel} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm" title="Download Excel">
                <Download className="w-3.5 h-3.5 text-green-600" />
                <span className="hidden xl:inline">Excel</span>
              </button>
              {userRole !== 'Viewer' && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    title="Upload Data"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden xl:inline">Upload</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImportFile} 
                    accept=".csv, .xlsx, .xls" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => { resetForm(); setShowAddForm(true); }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Header Khusus Print */}
      <div className="hidden print:block p-4 mb-4 text-center border-b-2 border-slate-800">
        <h2 className="text-xl font-bold text-slate-900">DATA WARGA RW 26 BERJUANG</h2>
        <p className="text-sm text-slate-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <table className="w-full text-left text-sm print:text-xs">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider print:bg-white print:text-slate-800 print:border-b-2 print:border-slate-800">
            <tr>
              <th className="px-6 py-3 print:px-2">Foto</th>
              <th className="px-6 py-3 print:px-2">Nama Lengkap</th>
              <th className="px-6 py-3 print:px-2">Posisi dalam Keluarga</th>
              <th className="px-6 py-3 print:px-2">Profesi</th>
              <th className="px-6 py-3 print:px-2">NIK</th>
              <th className="px-6 py-3 print:px-2">No. KK</th>
              <th className="px-6 py-3 print:px-2 text-center">RT/RW</th>
              <th className="px-6 py-3 print:px-2">Alamat</th>
              <th className="px-6 py-3 text-center print:px-2">Status</th>
              <th className="px-6 py-3 print:px-2">No. HP</th>
              <th className="px-6 py-3 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
            {filteredWargaData.length > 0 ? filteredWargaData.map((warga, idx) => {
              // Sembunyikan baris jika bukan di halaman ini (kecuali jika sedang nge-print)
              const isVisible = idx >= startIndex && idx < endIndex;
              return (
              <tr key={idx} className={`${isVisible ? '' : 'hidden print:table-row'} hover:bg-slate-50 transition-colors print:break-inside-avoid`}>
                <td className="px-6 py-3 print:px-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {warga.ktpUrl ? (
                      <a href={warga.ktpUrl} target="_blank" rel="noopener noreferrer">
                        <img src={warga.ktpUrl} alt="KTP" className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" />
                      </a>
                    ) : (
                      <User className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 font-semibold text-slate-800 print:px-2">{warga.nama}</td>
                <td className="px-6 py-3 text-xs text-slate-500 font-medium print:px-2">{warga.posisi}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.profesi}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.nik}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.kk}</td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black text-center">{warga.rt}/{warga.rw}</td>
                <td className="px-6 py-3 text-xs print:px-2">{warga.blok}</td>
                <td className="px-6 py-3 text-center print:px-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${warga.status === 'Warga Tetap' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'} print:border-0 print:p-0 print:bg-transparent print:text-slate-800`}>
                    {warga.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black">{warga.hp}</td>
                {userRole !== 'Viewer' && (
                  <td className="px-6 py-3 text-right print:hidden">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => setViewWarga(warga)}
                        className="text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded transition-colors" title="Detail Profil"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => startEdit(warga)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition-colors" title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {userRole === 'Admin' && (
                        <button 
                          onClick={() => setWargaToDelete(warga)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition-colors" title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
              );
            }) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500 text-xs text-center font-medium">
                  Oops, data warga tidak ditemukan untuk filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50 print:hidden">
        <p>Menampilkan {filteredWargaData.length > 0 ? Math.min(startIndex + 1, filteredWargaData.length) : 0} - {Math.min(endIndex, filteredWargaData.length)} dari {filteredWargaData.length} warga</p>
        <div className="flex gap-2">
           <button 
             onClick={handlePrevPage}
             disabled={currentPage === 1}
             className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors" 
           >
             Sebelumnya
           </button>
           <button 
             onClick={handleNextPage}
             disabled={currentPage === totalPages}
             className="px-2.5 py-1 border border-slate-200 bg-white rounded hover:bg-slate-100 text-slate-600 font-medium disabled:opacity-50 transition-colors"
           >
             Selanjutnya
           </button>
        </div>
      </div>

      {/* Modal Tambah/Edit Warga */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{showAddForm ? 'Tambah Data Warga' : 'Edit Data Warga'}</h3>
              <button onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-4 space-y-4 overflow-y-auto" onSubmit={showAddForm ? handleAddSubmit : handleEditSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">NIK</label>
                  <input required name="nik" value={formData.nik} onChange={handleInputChange} type="text" minLength={16} maxLength={16} pattern="\d{16}" title="NIK harus 16 digit angka" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="16 digit NIK" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">No. KK</label>
                  <input required name="kk" value={formData.kk} onChange={handleInputChange} type="text" minLength={16} maxLength={16} pattern="\d{16}" title="No KK harus 16 digit angka" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="16 digit KK" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                <input required name="nama" value={formData.nama} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Sesuai KTP" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Profesi</label>
                <input required name="profesi" value={formData.profesi} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Pekerjaan saat ini" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tempat Lahir</label>
                  <input required name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Cth: Jakarta" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal Lahir</label>
                  <input required name="tglLahir" value={formData.tglLahir} onChange={handleInputChange} type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Kelamin</label>
                  <select required name="jk" value={formData.jk} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kewarganegaraan</label>
                  <select required name="kewarganegaraan" value={(formData as any).kewarganegaraan} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="WNI">WNI</option>
                    <option value="WNA">WNA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Kawin</label>
                  <select required name="kawin" value={formData.kawin} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer">
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Posisi dalam Keluarga</label>
                  <select required name="posisi" value={formData.posisi} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="" disabled>Pilih posisi...</option>
                    <option value="Suami (kepala Keluarga)">Suami (kepala Keluarga)</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Famili lain">Famili lain</option>
                    <option value="Lainya">Lainya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Warga</label>
                  <select required name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="Warga Tetap">Warga Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Kos">Kos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RT</label>
                  <select required name="rt" value={formData.rt} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono cursor-pointer">
                    {Array.from({ length: 20 }, (_, i) => String(i + 1).padStart(2, '0')).map(rt => (
                      <option key={`add-rt-${rt}`} value={rt}>{rt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">RW</label>
                  <select required name="rw" value={formData.rw} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono cursor-pointer">
                    {Array.from({ length: 50 }, (_, i) => String(i + 1).padStart(2, '0')).map(rw => (
                      <option key={`add-rw-${rw}`} value={rw}>{rw}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">No. HP (WA)</label>
                  <input required name="hp" value={formData.hp} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="08..." />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Jalur/Blok)</label>
                  <input required name="blok" value={formData.blok} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="A/01" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kelurahan</label>
                  <input required name="kelurahan" value={formData.kelurahan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Kel. Sukamaju" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kecamatan</label>
                  <input required name="kecamatan" value={formData.kecamatan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Kec. Sukajaya" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Kota / Kabupaten</label>
                <input required name="kota_kab" value={formData.kota_kab} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Kota Metropolitan" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Foto KTP (Opsional)</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(file, 'ktp');
                          setFormData(prev => ({ ...prev, ktpUrl: url }));
                        } catch (err) {
                          alert("Gagal mengunggah foto KTP.");
                        }
                      }
                    }} 
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {(formData as any).ktpUrl && (
                    <div className="mt-2 relative w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group">
                      <img src={(formData as any).ktpUrl} alt="KTP" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, ktpUrl: "" }))}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button type="button" onClick={() => { setShowAddForm(false); setShowEditForm(false); resetForm(); }} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  {showAddForm ? 'Simpan Data' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {viewWarga && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Detail Profil Warga
                </h3>
                <button onClick={() => setViewWarga(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {viewWarga.ktpUrl ? (
                      <img src={viewWarga.ktpUrl} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{viewWarga.nama}</h2>
                    <p className="text-sm text-slate-500 font-medium">{viewWarga.nik}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${viewWarga.status === 'Warga Tetap' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                      {viewWarga.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Nomor KK</p>
                    <p className="font-medium text-slate-800">{viewWarga.kk || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">No. HP (WA)</p>
                    <p className="font-medium text-slate-800">{viewWarga.hp || '-'}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tempat, Tanggal Lahir</p>
                    <p className="font-medium text-slate-800">{(viewWarga.tempatLahir && viewWarga.tglLahir) ? `${viewWarga.tempatLahir}, ${viewWarga.tglLahir}` : '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Jenis Kelamin</p>
                    <p className="font-medium text-slate-800">{viewWarga.jk || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Profesi / Pekerjaan</p>
                    <p className="font-medium text-slate-800">{viewWarga.profesi || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Posisi dalam Keluarga</p>
                    <p className="font-medium text-slate-800">{viewWarga.posisi || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Agama / Status Kawin</p>
                    <p className="font-medium text-slate-800">{(viewWarga.agama || '-') + ' / ' + (viewWarga.kawin || '-')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kewarganegaraan</p>
                    <p className="font-medium text-slate-800">{viewWarga.kewarganegaraan || '-'}</p>
                  </div>

                  <div className="col-span-2 pt-4 border-t border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Alamat Lengkap (Domisili)</p>
                    <p className="font-medium text-slate-800">
                      {viewWarga.blok ? `${viewWarga.blok}, ` : ''} 
                      RT {viewWarga.rt} / RW {viewWarga.rw} 
                      {viewWarga.kelurahan ? `, Kel. ${viewWarga.kelurahan}` : ''}
                      {viewWarga.kecamatan ? `, Kec. ${viewWarga.kecamatan}` : ''}
                      {viewWarga.kota_kab ? `, ${viewWarga.kota_kab}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {wargaToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Data Warga"
            message={`Apakah Anda yakin ingin menghapus data "${wargaToDelete?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={handleDeleteWarga}
            onCancel={() => setWargaToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeletingWarga}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IuranView({ iuranData, setIuranData, kasData, setKasData, wargaData = [], userRole, setIsLoadingDB, handleFirestoreError, handleFileUpload }: { iuranData: any[], setIuranData: any, kasData: any[], setKasData: any, wargaData?: any[], userRole: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrx, setEditingTrx] = useState<any>(null);
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [trxToDelete, setTrxToDelete] = useState<any>(null);
  const [isDeletingTrx, setIsDeletingTrx] = useState(false);
  const [strukUrl, setStrukUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... (reset states when form closes)
  useEffect(() => {
    if (!showAddForm) {
      setStrukUrl("");
    } else if (editingTrx) {
      setStrukUrl(editingTrx.strukUrl || "");
    }
  }, [showAddForm, editingTrx]);

  const handleDeleteTransaction = async () => {
    if (!trxToDelete) return;

    setIsDeletingTrx(true);
    try {
      await deleteDoc(doc(db, 'iuran', trxToDelete.id));
      setIuranData((prev: any[]) => prev.filter(t => t.id !== trxToDelete.id));
      setTrxToDelete(null);
      alert("Data berhasil dihapus dari sistem.");
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/iuran/${trxToDelete.id}`);
      setTrxToDelete(null);
    } finally {
      setIsDeletingTrx(false);
    }
  };

  const handlePrintKwitansi = (trx: any) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFontSize(20);
    doc.text("KWITANSI PEMBAYARAN", 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("RUKUN WARGA 26 BERJUANG", 105, 30, { align: 'center' });
    doc.line(10, 35, 200, 35);
    
    // Receipt No
    doc.setFontSize(10);
    doc.text(`No: ${trx.id}`, 180, 10);
    
    // Content
    doc.setFontSize(12);
    let y = 50;
    const drawRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`: ${value}`, 60, y);
      y += 10;
    };
    
    drawRow("Telah Terima Dari", trx.nama);
    drawRow("Untuk Pembayaran", trx.transaksi);
    drawRow("Periode", trx.periode);
    drawRow("Keterangan", trx.keterangan || '-');
    drawRow("Tanggal", trx.tanggal);
    
    // Amount
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.rect(20, y, 90, 15);
    doc.text(`Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(trx.nominal)},-`, 25, y + 10);
    
    // Footer (Signatures)
    y += 40;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("Penyetor", 40, y);
    doc.text("Penerima / Bendahara", 150, y, { align: 'center' });
    
    y += 30;
    doc.text(`( ${trx.nama} )`, 40, y);
    doc.text("( ..................... )", 150, y, { align: 'center' });
    
    doc.save(`Kwitansi_${trx.id}.pdf`);
  };

  const handleEditTransaction = (trx: any) => {
    setEditingTrx(trx);
    setTrxType(trx.tipe === 'Kredit' ? 'Keluar' : 'Masuk');
    setShowAddForm(true);
  };

  const handleImportFileIuran = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        processImportedIuranData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedIuranData(results.data);
        },
        error: (error) => {
          console.error("CSV Merge Error:", error);
          alert("Gagal mengimpor data. Pastikan format CSV benar.");
        }
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedIuranData = async (data: any[]) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedDateTime = formattedDate + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');

    const newData = data.map((row: any, idx: number) => ({
      id: row['ID Bayar'] || row['id'] || `INV-IMP-${Date.now()}-${idx}`,
      tanggal: row['Tanggal'] || row['tanggal'] || formattedDateTime,
      transaksi: row['Transaksi'] || row['transaksi'] || "Iuran Lainnya",
      nama: row['Nama'] || row['nama'] || "Umum",
      tipe: row['Tipe'] || row['tipe'] || "Debit",
      periode: row['Periode'] || row['periode'] || "Apr 2026",
      nominal: parseInt(row['Nominal'] || row['nominal'] || "0"),
      status: row['Status'] || row['status'] || "Lunas",
      keterangan: row['Keterangan'] || row['keterangan'] || "Import Data"
    }));

    if (newData.length > 0) {
      setIsLoadingDB(true);
      try {
        for (const item of newData) {
          await setDoc(doc(db, 'iuran', item.id), item);
        }
        setIuranData((prev: any) => [...newData, ...prev]);
        alert(`Berhasil mengimpor ${newData.length} data transaksi.`);
      } catch (error: any) {
        console.error("Firebase Import Error:", error);
        handleFirestoreError(error, 'create', '/iuran/import');
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      alert("Tidak ada data valid yang ditemukan.");
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedDateTime = formattedDate + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
    
    const nominalRaw = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const transaksi = formData.get('transaksi') as string;
    const nama = formData.get('nama') as string;
    const alamat = formData.get('alamat') as string || "-";
    const keterangan = formData.get('keterangan') as string || "-";
    const status = formData.get('status') as string;
    const periodeRaw = formData.get('periode') as string;
    const periodeDate = new Date(periodeRaw);
    const periode = periodeDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    // 1. Prepare Data
    const transactionId = editingTrx ? editingTrx.id : `INV-${dateObj.getFullYear().toString().slice(-2)}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${String(iuranData.length + 1).padStart(3, '0')}`;
    
    const newPayment = {
      id: transactionId,
      tanggal: editingTrx ? editingTrx.tanggal : formattedDateTime,
      transaksi: transaksi,
      nama: nama,
      alamat: alamat,
      tipe: trxType === 'Masuk' ? 'Debit' : 'Kredit',
      periode: periode,
      nominal: nominalRaw,
      status: status,
      keterangan: keterangan,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      if (editingTrx) {
        await updateDoc(doc(db, 'iuran', editingTrx.id), newPayment);
        setIuranData((prev: any[]) => prev.map(t => t.id === editingTrx.id ? newPayment : t));
        alert("Data berhasil diperbarui.");
      } else {
        await setDoc(doc(db, 'iuran', newPayment.id), newPayment);
        
        // Also record to Kas if NEW transaction
        const newKasEntry = {
          id: `TRX-${String(kasData.length + 1).padStart(3, '0')}`,
          tanggal: formattedDate,
          tipe: trxType,
          transaksi: transaksi,
          nama: nama,
          keterangan: keterangan,
          debit: trxType === 'Masuk' ? nominalRaw : 0,
          kredit: trxType === 'Keluar' ? nominalRaw : 0,
          strukUrl: strukUrl
        };
        await setDoc(doc(db, 'kas', newKasEntry.id), newKasEntry);
        
        setKasData([newKasEntry, ...kasData]);
        setIuranData([newPayment, ...iuranData]);
        alert("Data berhasil dicatat.");
      }
    } catch (error: any) {
      console.error("Firebase operation error:", error);
      handleFirestoreError(error, editingTrx ? 'update' : 'create', `/iuran/${editingTrx?.id || 'new'}`);
    } finally {
      setIsLoadingDB(false);
      setShowAddForm(false);
      setEditingTrx(null);
      setTrxType('Masuk');
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const handleExportExcelIuran = () => {
    const headers = ['ID Bayar', 'Tanggal Waktu', 'Transaksi', 'Nama', 'Debit/ Kredit', 'Nominal', 'Status', 'Keterangan'];
    const rows = iuranData.map(trx => 
      [trx.id, `"${trx.tanggal}"`, trx.transaksi, trx.nama, trx.tipe || (trx.periode ? 'Debit' : '-'), trx.nominal, trx.status, `"${trx.keterangan}"`].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Laporan_Catatan_Transaksi.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFIuran = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text("LAPORAN CATATAN RW 26", 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID Bayar", "Tanggal", "Transaksi", "Nama", "Debit/ Kredit", "Nominal", "Status"];
    const tableRows: any[] = [];

    iuranData.forEach(trx => {
      tableRows.push([
        trx.id,
        trx.tanggal.split(',')[0],
        trx.transaksi,
        trx.nama,
        trx.tipe || (trx.periode ? 'Debit' : '-'),
        formatRupiah(trx.nominal),
        trx.status
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // Add footer
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    doc.text("Demikian laporan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.", 14, finalY);
    doc.text("Diterbitkan oleh Bendahara.", 14, finalY + 7);

    doc.save(`Laporan_Transaksi_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Catatan Transaksi
        </h3>
        <div className="flex flex-wrap gap-2">
          {userRole !== 'Viewer' && (
            <>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFileIuran} 
                className="hidden" 
                accept=".csv, .xlsx, .xls" 
              />
              <button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                <Upload className="w-3.5 h-3.5 text-blue-600" /> <span className="sm:hidden lg:inline">Upload</span>
              </button>
              <button onClick={handleExportExcelIuran} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5 text-green-600" /> <span className="sm:hidden lg:inline">Excel</span>
              </button>
              <button onClick={handleExportPDFIuran} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm">
                <FileText className="w-3.5 h-3.5 text-red-500" /> <span className="sm:hidden lg:inline">PDF</span>
              </button>
              <button onClick={() => setShowAddForm(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95">
                <PlusCircle className="w-3.5 h-3.5" />
                Catat
              </button>
            </>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">ID Bayar</th>
              <th className="px-6 py-3">Tanggal Waktu</th>
              <th className="px-6 py-3">Transaksi</th>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3 text-right">Nominal</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {iuranData.map((trx, idx) => (
              <tr key={trx.id || `trx-${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{trx.id}</td>
                <td className="px-6 py-3 text-xs">{trx.tanggal}</td>
                <td className="px-6 py-3 text-xs font-semibold">{trx.transaksi}</td>
                <td className="px-6 py-3 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    {trx.nama}
                    {trx.strukUrl && (
                      <a href={trx.strukUrl} target="_blank" rel="noopener noreferrer" className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Lihat Bukti Struk">
                        <FileText className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-right font-mono text-xs font-medium text-slate-700">{formatRupiah(trx.nominal)}</td>
                <td className="px-6 py-3 text-center">
                   <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${trx.status === 'Lunas' ? 'border-green-200 bg-green-50 text-green-700' : 'border-orange-200 bg-orange-50 text-orange-700'}`}>
                     {trx.status}
                   </span>
                </td>
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                      <button 
                      onClick={() => handlePrintKwitansi(trx)}
                      className="p-2 text-red-500 hover:bg-red-50 border border-slate-100 rounded-lg transition-all shadow-sm active:scale-95"
                      title="PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    {(userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'operator') && (
                      <>
                        <button 
                          onClick={() => handleEditTransaction(trx)}
                          className="p-2 text-orange-600 hover:bg-orange-50 border border-slate-100 rounded-lg transition-all shadow-sm active:scale-95"
                          title="Edit Catatan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (trx.id) {
                              setTrxToDelete(trx);
                            } else {
                              alert("ID Transaksi tidak ditemukan, tidak bisa menghapus.");
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 border border-slate-100 rounded-lg transition-all shadow-sm active:scale-95 group"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal / Overlay Catat Pembayaran */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {editingTrx ? <Edit className="w-4 h-4 text-orange-600" /> : <CreditCard className="w-4 h-4 text-blue-600" />}
                {editingTrx ? 'Edit Transaksi' : 'Catat'}
              </h3>
              <button onClick={() => { setShowAddForm(false); setEditingTrx(null); setTrxType('Masuk'); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-5 overflow-y-auto space-y-4">
              {/* Tipe Transaksi Selector */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  type="button"
                  disabled={!!editingTrx}
                  onClick={() => setTrxType('Masuk')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${trxType === 'Masuk' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'} ${editingTrx ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pemasukan
                </button>
                <button 
                  type="button"
                  disabled={!!editingTrx}
                  onClick={() => setTrxType('Keluar')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${trxType === 'Keluar' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'} ${editingTrx ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Pengeluaran
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {trxType === 'Masuk' ? 'Jenis Pemasukan' : 'Jenis Pengeluaran'}
                  </label>
                  <select name="transaksi" defaultValue={editingTrx?.transaksi} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    {trxType === 'Masuk' ? (
                      <>
                        <option value="Iuran Rutin Warga">Iuran Rutin Warga</option>
                        <option value="Iuran Partisipasi Pembangunan">Iuran Partisipasi Pembangunan</option>
                        <option value="Dana Kelurahan/Pemerintah">Dana Kelurahan/Pemerintah</option>
                        <option value="Donasi & Bantuan Sosial">Donasi & Bantuan Sosial</option>
                        <option value="Sponsorship & Donatur">Sponsorship & Donatur</option>
                        <option value="Hasil Usaha RT/RW">Hasil Usaha RT/RW</option>
                        <option value="Lainnya">Lainnya...</option>
                      </>
                    ) : (
                      <>
                        <option value="Insentif">Insentif</option>
                        <option value="Pemeliharaan Lingkungan">Pemeliharaan Lingkungan</option>
                        <option value="Dana Sosial">Dana Sosial</option>
                        <option value="Kegiatan Warga">Kegiatan Warga</option>
                        <option value="Akomodasi & Konsumsi">Akomodasi & Konsumsi</option>
                        <option value="Gaji">Gaji</option>
                        <option value="Upah">Upah</option>
                        <option value="Perbaikan">Perbaikan</option>
                        <option value="Pembelian">Pembelian</option>
                        <option value="Pemasangan">Pemasangan</option>
                        <option value="Pembongkaran">Pembongkaran</option>
                        <option value="Bayar jasa">Bayar jasa</option>
                        <option value="Pergantian">Pergantian</option>
                        <option value="Lain-lain">Lain-lain...</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    {trxType === 'Masuk' ? 'Nama Penyetor' : 'Nama Penerima / Vendor'}
                  </label>
                  <input 
                    name="nama" 
                    defaultValue={editingTrx?.nama} 
                    required 
                    type="text" 
                    list="wargaListIuran" 
                    onChange={(e) => {
                      const warga = wargaData.find(w => w.nama === e.target.value);
                      if (warga && warga.blok) {
                        const alamatInput = document.getElementsByName('alamat')[0] as HTMLInputElement;
                        if (alamatInput) alamatInput.value = warga.blok;
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" 
                    placeholder={trxType === 'Masuk' ? 'Nama' : 'Toko / Nama Orang'} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal</label>
                  <input name="periode" required type="date" defaultValue={editingTrx?.periode ? new Date(editingTrx.periode).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                  <input name="nominal" required type="number" defaultValue={editingTrx?.nominal || "50000"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Pembayaran</label>
                <select name="status" defaultValue={editingTrx?.status} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-bold cursor-pointer">
                  <option value="Lunas">Lunas (Selesai)</option>
                  <option value="Pending">Pending (Cicilan/Menunggu)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Opsional)</label>
                <input name="alamat" defaultValue={editingTrx?.alamat} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Alamat penyetor / penerima" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan Tambahan / Catatan</label>
                <textarea name="keterangan" defaultValue={editingTrx?.keterangan} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Ada catatan khusus? (Opsional)"></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Bukti Struk/Kwitansi (Opsional)</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(file, 'struk');
                          setStrukUrl(url);
                        } catch (err) {
                          alert("Gagal mengunggah struk.");
                        }
                      }
                    }} 
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {strukUrl && (
                    <div className="mt-2 relative w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group">
                      <img src={strukUrl} alt="Struk" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setStrukUrl("")}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => { setShowAddForm(false); setEditingTrx(null); setTrxType('Masuk'); }} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all ${trxType === 'Masuk' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {editingTrx ? 'Perbarui Data' : `Simpan ${trxType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {trxToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Transaksi"
            message={`Apakah Anda yakin ingin menghapus catatan transaksi "${trxToDelete?.transaksi} - ${trxToDelete?.nama}"? Data akan dihapus secara permanen.`}
            onConfirm={handleDeleteTransaction}
            onCancel={() => setTrxToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeletingTrx}
          />
        )}
      </AnimatePresence>

      <datalist id="wargaListIuran">
        {wargaData.map((w, idx) => (
          <option key={idx} value={w.nama} />
        ))}
      </datalist>
    </div>
  );
}

function SuratView({ suratData, setSuratData, wargaData = [], userRole, setIsLoadingDB, handleFirestoreError }: { suratData: any[], setSuratData: any, wargaData?: any[], userRole: string, setIsLoadingDB: any, handleFirestoreError: any }) {
  const [showSuratForm, setShowSuratForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSearchWarga = (term: string) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = wargaData.filter(w => 
        w.nama.toLowerCase().includes(term.toLowerCase()) || 
        w.nik.includes(term)
      ).slice(0, 5);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const autoFillForm = (warga: any) => {
    if (!formRef.current) return;
    const form = formRef.current;
    
    // Helper to set value
    const setVal = (name: string, val: any) => {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (el) el.value = val || "";
    };

    setVal('pemohon', warga.nama);
    setVal('nik', warga.nik);
    setVal('ttl', `${warga.tempatLahir}, ${warga.tglLahir}`);
    setVal('jk', warga.jk);
    setVal('agama', warga.agama || 'Islam');
    setVal('pekerjaan', warga.profesi);
    setVal('statusKawin', warga.kawin);
    setVal('alamat', `${warga.blok}, RT ${warga.rt} / RW ${warga.rw}`);
    setVal('rt_rw', `${warga.rt} / ${warga.rw}`);
    setVal('kelurahan', warga.kelurahan);
    setVal('kecamatan', warga.kecamatan);
    setVal('kota_kab', warga.kota_kab);
    setVal('kk', warga.kk);
    setVal('kewarganegaraan', warga.kewarganegaraan || 'WNI');
    
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSetujui = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Selesai" });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Selesai" } : s));
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleTolak = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Ditolak" });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Ditolak" } : s));
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleCetak = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up blocker diizinkan.');
      return;
    }

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cetak Surat - ${surat.id}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; padding: 20px; line-height: 1.6; color: #000; }
            .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 30px; position: relative; }
            .header h1 { font-size: 20px; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .header h2 { font-size: 16px; margin: 5px 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .header p { font-size: 12px; margin: 2px 0; font-style: italic; }
            .title-box { text-align: center; margin-bottom: 30px; }
            .title { font-size: 18px; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin-bottom: 5px; }
            .nomor { font-size: 14px; margin-bottom: 30px; }
            .content { margin-top: 20px; text-align: justify; font-size: 14px; }
            .details { margin: 20px 0; border-collapse: collapse; width: 100%; font-size: 14px; }
            .details td { padding: 4px 0; vertical-align: top; }
            .details td:first-child { width: 180px; }
            .details td:nth-child(2) { width: 20px; text-align: center; }
            .footer { margin-top: 50px; display: flex; justify-content: flex-end; }
            .signature { text-align: center; min-width: 250px; }
            .signature-date { margin-bottom: 10px; }
            .signature-space { height: 80px; }
            @media print {
              body { padding: 0; margin: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Pemerintah Kota Metropolitan</h2>
            <h2>Kecamatan Sukajaya - Kelurahan Sukamaju</h2>
            <h1>RUKUN TETANGGA (RT) 01 / RUKUN WARGA (RW) 05</h1>
            <p>Alamat: Jl. Merdeka No. 26, Kel. Sukamaju, Kec. Sukajaya, Kota Metropolitan (40123)</p>
          </div>
          
          <div class="title-box">
            <div class="title">${surat.jenis}</div>
            <div class="nomor">Nomor: ${surat.id.substring(0, 10)} / RT.01 / ${new Date().getFullYear()}</div>
          </div>

          <div class="content">
            <p>Yang bertanda tangan di bawah ini selaku Ketua RT 01 / RW 05, Kelurahan Sukamaju, menerangkan dengan sebenarnya bahwa:</p>
            
            <table class="details">
              <tr>
                <td>Nama Lengkap</td>
                <td>:</td>
                <td><strong>${surat.pemohon}</strong></td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>:</td>
                <td>${surat.nik || '-'}</td>
              </tr>
              <tr>
                <td>No. KK</td>
                <td>:</td>
                <td>${surat.kk || '-'}</td>
              </tr>
              <tr>
                <td>Tempat, Tgl Lahir</td>
                <td>:</td>
                <td>${surat.ttl || '-'}</td>
              </tr>
              <tr>
                <td>Jenis Kelamin</td>
                <td>:</td>
                <td>${surat.jk || '-'}</td>
              </tr>
              <tr>
                <td>Agama</td>
                <td>:</td>
                <td>${surat.agama || '-'}</td>
              </tr>
              <tr>
                <td>Pekerjaan</td>
                <td>:</td>
                <td>${surat.pekerjaan || '-'}</td>
              </tr>
              <tr>
                <td>Status Perkawinan</td>
                <td>:</td>
                <td>${surat.statusKawin || '-'}</td>
              </tr>
              <tr>
                <td>Alamat KTP</td>
                <td>:</td>
                <td>${surat.alamat || '-'}</td>
              </tr>
              <tr>
                <td>Domisili (RT/RW)</td>
                <td>:</td>
                <td>RT ${surat.rt_rw?.split('/')[0] || '-'} / RW ${surat.rt_rw?.split('/')[1] || '-'}</td>
              </tr>
              <tr>
                <td>Kelurahan</td>
                <td>:</td>
                <td>${surat.kelurahan || '-'}</td>
              </tr>
              <tr>
                <td>Kecamatan</td>
                <td>:</td>
                <td>${surat.kecamatan || '-'}</td>
              </tr>
              <tr>
                <td>Keperluan</td>
                <td>:</td>
                <td>${surat.keperluan || '-'}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">Berdasarkan pemantauan kami, nama tersebut di atas benar adalah warga yang berdomisili di wilayah kami dan memiliki berkelakuan baik. Demikian surat keterangan ini kami buat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          <div class="footer">
            <div class="signature">
              <div class="signature-date">Metropolitan, ${surat.tanggal}</div>
              <p><strong>Ketua RT 01 / RW 05</strong></p>
              <div class="signature-space"></div>
              <p><strong>( ..................................... )</strong></p>
            </div>
          </div>
          
          <script>
            setTimeout(function() {
              window.print(); 
            }, 250);
            window.onafterprint = function() {
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nik = formData.get('nik') as string;
    
    if (nik && nik.length !== 16) {
      alert("NIK harus terdiri dari tepat 16 digit angka.");
      return;
    }

    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Auto Id (SRT-100X)
    const newId = `SRT-${Date.now()}`;
    
    const newSurat = {
      id: newId,
      tanggal: formattedDate,
      pemohon: formData.get('pemohon') as string,
      nik: formData.get('nik') as string,
      ttl: formData.get('ttl') as string,
      jk: formData.get('jk') as string,
      agama: formData.get('agama') as string,
      pekerjaan: formData.get('pekerjaan') as string,
      statusKawin: formData.get('statusKawin') as string,
      alamat: formData.get('alamat') as string,
      rt_rw: formData.get('rt_rw') as string,
      kelurahan: formData.get('kelurahan') as string,
      kecamatan: formData.get('kecamatan') as string,
      kota_kab: formData.get('kota_kab') as string,
      kewarganegaraan: formData.get('kewarganegaraan') as string,
      pendidikan: formData.get('pendidikan') as string,
      kk: formData.get('kk') as string,
      keperluan: formData.get('keperluan') as string,
      jenis: formData.get('jenis') as string,
      status: "Diajukan"
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'surat', newId), newSurat);
      setSuratData([newSurat, ...suratData]);
      setShowSuratForm(false);
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/surat/${newId}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const pendingCount = suratData.filter(s => s.status === 'Diajukan').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white gap-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Layanan Surat Pengantar
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {pendingCount > 0 ? (
            <span className="flex-1 sm:flex-none text-center bg-orange-50 text-orange-600 border border-orange-100 text-[10px] px-3 py-1.5 rounded font-bold tracking-wider uppercase">
              {pendingCount} Pending
            </span>
          ) : (
            <span className="flex-1 sm:flex-none text-center bg-green-50 text-green-600 border border-green-100 text-[10px] px-3 py-1.5 rounded font-bold tracking-wider uppercase">
              Tuntas
            </span>
          )}
          {userRole !== 'Viewer' && (
            <button onClick={() => setShowSuratForm(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95">
              <PlusCircle className="w-3.5 h-3.5" />
              Buat Surat
            </button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-3">ID Pengajuan</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Pemohon</th>
              <th className="px-6 py-3">Jenis Surat</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {suratData.length > 0 ? suratData.map((surat) => (
              <tr key={surat.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">{surat.id.substring(0, 10)}</td>
                <td className="px-6 py-3 text-xs">{surat.tanggal}</td>
                <td className="px-6 py-3 font-semibold text-slate-800">{surat.pemohon}</td>
                <td className="px-6 py-3 text-xs">{surat.jenis}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${
                    surat.status === 'Selesai' ? 'border-green-200 bg-green-50 text-green-700' : 
                    surat.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' :
                    'border-orange-200 bg-orange-50 text-orange-700'
                  }`}>
                    {surat.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right flex justify-end gap-2">
                  {userRole !== 'Viewer' && surat.status === 'Diajukan' && (
                    <>
                      <button onClick={() => handleSetujui(surat.id)} className="text-[10px] font-bold text-green-700 hover:bg-green-100 transition-colors cursor-pointer bg-green-50 px-3 py-1.5 rounded border border-green-200 flex items-center gap-1">
                        Setujui
                      </button>
                      <button onClick={() => handleTolak(surat.id)} className="text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer bg-red-50 px-3 py-1.5 rounded border border-red-200 flex items-center gap-1">
                        Tolak
                      </button>
                    </>
                  )}
                  {surat.status !== 'Diajukan' && (
                    <button onClick={() => handleCetak(surat.id)} disabled={surat.status === 'Ditolak'} className={`text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded border transition-colors ${surat.status === 'Selesai' ? 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50 cursor-pointer' : 'text-slate-400 bg-transparent border-transparent cursor-not-allowed hidden'}`}>
                      Cetak Surat
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <FileText className="w-10 h-10 opacity-20" />
                    <p className="text-xs font-medium">Belum ada pengajuan surat.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal / Overlay Pembuatan Surat */}
      {showSuratForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Buat Surat Pengantar
              </h3>
              <button onClick={() => setShowSuratForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 bg-blue-50/50 border-b border-slate-100 flex flex-col gap-2 relative">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Search className="w-3 h-3" />
                  Cari Data Warga (Auto-fill)
               </label>
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => handleSearchWarga(e.target.value)}
                 className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium" 
                 placeholder="Ketik Nama atau NIK warga..." 
               />
               {searchResults.length > 0 && (
                 <div className="absolute top-full left-4 right-4 bg-white border border-slate-200 shadow-xl rounded-b-xl z-20 overflow-hidden divide-y divide-slate-100 mt-[-1px]">
                   {searchResults.map((w) => (
                     <button
                       key={w.id}
                       type="button"
                       onClick={() => autoFillForm(w)}
                       className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between"
                     >
                       <div>
                         <p className="text-sm font-bold text-slate-800">{w.nama}</p>
                         <p className="text-[10px] text-slate-500 font-mono tracking-tighter">NIK: {w.nik} | KK: {w.kk}</p>
                       </div>
                       <ChevronRight className="w-4 h-4 text-slate-300" />
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <form ref={formRef} onSubmit={handleAddSurat} className="p-5 overflow-y-auto space-y-5">
              {/* Seksi 1: Identitas Pribadi */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  1. Identitas Pribadi
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap (Sesuai KTP)</label>
                  <input name="pemohon" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Nama Lengkap" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">NIK (16 Digit)</label>
                    <input name="nik" required type="text" minLength={16} maxLength={16} pattern="\d{16}" title="NIK harus 16 digit angka" onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0,16); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="NIK" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Tempat, Tgl Lahir</label>
                    <input name="ttl" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kota, DD-MM-YYYY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Kelamin</label>
                    <select name="jk" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Agama</label>
                    <select name="agama" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Pekerjaan</label>
                    <input name="pekerjaan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Pekerjaan" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Status Perkawinan</label>
                    <select name="statusKawin" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Seksi 2: Alamat Domisili */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  2. Alamat Domisili
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Alamat Lengkap (Jalan/Blok/No. Rumah)</label>
                  <input name="alamat" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Alamat Lengkap" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">RT / RW</label>
                    <input name="rt_rw" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="001 / 005" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kelurahan</label>
                    <input name="kelurahan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kelurahan" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kecamatan</label>
                    <input name="kecamatan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kecamatan" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kota / Kabupaten</label>
                    <input name="kota_kab" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kota / Kabupaten" />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Data Pendukung */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  3. Data Pendukung
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kewarganegaraan</label>
                    <select name="kewarganegaraan" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="WNI">WNI</option>
                      <option value="WNA">WNA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Pendidikan Terakhir</label>
                    <input name="pendidikan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="SMA / S1 / ..." />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor KK (Kartu Keluarga)</label>
                  <input name="kk" required type="text" minLength={16} maxLength={16} pattern="\d{16}" title="No KK harus 16 digit angka" onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0,16); }} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="16 digit Nomor KK" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Keperluan (Tujuan pembuatan surat)</label>
                  <textarea name="keperluan" required rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Cth: Mengurus perpanjangan KTP ..."></textarea>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Layanan Surat</label>
                  <select name="jenis" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold cursor-pointer">
                  <option value="Surat Pengantar KTP (Baru/Hilang/Rusak)">Surat Pengantar KTP (Baru/Hilang/Rusak)</option>
                  <option value="Surat Pengantar Kartu Keluarga (KK)">Surat Pengantar Kartu Keluarga (KK)</option>
                  <option value="Surat Pengantar Pindah/Datang Domisili">Surat Pengantar Pindah/Datang Domisili</option>
                  <option value="Surat Pengantar Akta Kelahiran">Surat Pengantar Akta Kelahiran</option>
                  <option value="Surat Pengantar Akta Kematian">Surat Pengantar Akta Kematian</option>
                  <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
                  <option value="Surat Keterangan Domisili Usaha (SKDU)">Surat Keterangan Domisili Usaha (SKDU)</option>
                  <option value="Surat Keterangan Domisili Perorangan">Surat Keterangan Domisili Perorangan</option>
                  <option value="Surat Pengantar Menikah (N1-N4)">Surat Pengantar Menikah (N1-N4)</option>
                  <option value="Surat Pengantar Laporan Kehilangan (Polisi)">Surat Pengantar Laporan Kehilangan (Polisi)</option>
                  <option value="Surat Pengantar SKCK">Surat Pengantar SKCK</option>
                  <option value="Surat Izin Keramaian/Hajatan">Surat Izin Keramaian/Hajatan</option>
                  <option value="Surat Pengantar IMB/PBG">Surat Pengantar IMB/PBG</option>
                  <option value="Surat Keterangan Beda Nama">Surat Keterangan Beda Nama</option>
                  <option value="Surat Pengantar Ahli Waris">Surat Pengantar Ahli Waris</option>
                </select>
              </div>
            </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSuratForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Ajukan Surat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function KasView({ kasData, setKasData, iuranData, setIuranData, wargaData = [], userRole, setIsLoadingDB, handleFirestoreError, handleFileUpload }: { kasData: any[], setKasData: any, iuranData: any[], setIuranData: any, wargaData?: any[], userRole: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any }) {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [strukUrl, setStrukUrl] = useState("");
  
  // ... (reset states when form closes)
  useEffect(() => {
    if (!showMasukForm) {
      setStrukUrl("");
    }
  }, [showMasukForm]);
  
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const [years, setYears] = useState([2024, 2025, 2026, 2027]);
  const [kasToDelete, setKasToDelete] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);

  const handleDeleteKas = async () => {
    if (!kasToDelete) return;
    
    setIsDeletingKas(true);
    try {
      await deleteDoc(doc(db, 'kas', kasToDelete.id));
      setKasData((prev: any[]) => prev.filter(t => t.id !== kasToDelete.id));
      setKasToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/kas/${kasToDelete.id}`);
      setKasToDelete(null);
    } finally {
      setIsDeletingKas(false);
    }
  };

  const handleAddPemasukan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newId = `TRX-${Date.now()}`;
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const tipe = formData.get('tipe') as string;
    
    const newTrx = {
      id: newId,
      tanggal: formattedDate,
      tipe: tipe,
      transaksi: formData.get('transaksi') as string,
      nama: formData.get('nama') as string,
      alamat: formData.get('alamat') as string || "-",
      keterangan: formData.get('keterangan') as string,
      debit: tipe === 'Masuk' ? nominal : 0,
      kredit: tipe === 'Keluar' ? nominal : 0,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'kas', newId), newTrx);

      // Sync with IuranData if applicable
      if (tipe === 'Masuk' && (formData.get('transaksi') === 'Iuran Warga')) {
        const formattedDateTime = formattedDate + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        const newIuran = {
          id: `INV-${Date.now()}-IUR`,
          tanggal: formattedDateTime,
          transaksi: formData.get('transaksi') as string,
          nama: formData.get('nama') as string,
          alamat: formData.get('alamat') as string || "-",
          periode: "Umum", // Default since it's from Kas view
          nominal: nominal,
          status: "Lunas",
          keterangan: formData.get('keterangan') as string || "-",
          strukUrl: strukUrl
        };
        
        await setDoc(doc(db, 'iuran', newIuran.id), newIuran);
        setIuranData([newIuran, ...iuranData]);
      }

      setKasData([newTrx, ...kasData]);
      setShowMasukForm(false);
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/kas/${newId}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(angka);
  };

  // Processing data with balance calculation
  let balance = 0;
  const allProcessedData = [...kasData].sort((a, b) => {
    const dateA = new Date(a.tanggal);
    const dateB = new Date(b.tanggal);
    return dateA.getTime() - dateB.getTime();
  }).map(trx => {
    balance = balance + trx.debit - trx.kredit;
    return { ...trx, saldoAkhir: balance };
  });

  // Filter based on selected month and year
  const filteredData = allProcessedData.filter(trx => {
    const date = new Date(trx.tanggal);
    const mMatch = selectedMonth === -1 || date.getMonth() === selectedMonth;
    return mMatch && date.getFullYear() === selectedYear;
  }).reverse();

  const totalPemasukan = filteredData.reduce((sum, trx) => sum + trx.debit, 0);
  const totalPengeluaran = filteredData.reduce((sum, trx) => sum + trx.kredit, 0);
  const saldoTotal = allProcessedData.length > 0 ? allProcessedData[allProcessedData.length - 1].saldoAkhir : 0;

  const handleExportExcelKas = () => {
    const headers = ['ID Transaksi', 'Tanggal', 'Tipe', 'Kategori Transaksi', 'Nama', 'Keterangan', 'Debit (Masuk)', 'Kredit (Keluar)', 'Saldo Akhir'];
    const rows = filteredData.map(trx => 
      [trx.id, trx.tanggal, trx.tipe, `"${trx.transaksi || ''}"`, `"${trx.nama || ''}"`, `"${trx.keterangan || ''}"`, trx.debit, trx.kredit, trx.saldoAkhir].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const monthName = selectedMonth === -1 ? 'Semua_Bulan' : months[selectedMonth];
    link.setAttribute("download", `Laporan_Kas_${monthName}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDFKas = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    const monthTitle = selectedMonth === -1 ? 'SEMUA BULAN' : months[selectedMonth].toUpperCase();
    doc.text(`LAPORAN KAS - ${monthTitle} ${selectedYear}`, 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, 14, 22);

    const tableColumn = ["ID Transaksi", "Tanggal", "Tipe", "Kategori", "Nama", "Keterangan", "Debit", "Kredit", "Saldo"];
    const tableRows: any[] = [];

    filteredData.forEach(trx => {
      tableRows.push([
        trx.id,
        trx.tanggal,
        trx.tipe,
        trx.transaksi || '-',
        trx.nama || '-',
        trx.keterangan || '-',
        formatRupiah(trx.debit),
        formatRupiah(trx.kredit),
        formatRupiah(trx.saldoAkhir)
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save(`Laporan_Kas_${selectedMonth === -1 ? 'Semua_Bulan' : months[selectedMonth]}_${selectedYear}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl shadow-lg shadow-green-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><PlusCircle className="w-16 h-16 text-white" /></div>
          <p className="text-[11px] text-green-50 font-bold uppercase tracking-wider mb-1 relative z-10">Pemasukan Bulan Ini</p>
          <p className="text-2xl font-black text-white relative z-10">Rp {formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-4 rounded-xl shadow-lg shadow-red-100 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><MinusCircle className="w-16 h-16 text-white" /></div>
          <p className="text-[11px] text-red-50 font-bold uppercase tracking-wider mb-1 relative z-10">Pengeluaran Bulan Ini</p>
          <p className="text-2xl font-black text-white relative z-10">Rp {formatRupiah(totalPengeluaran)}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-4 rounded-xl shadow-lg shadow-slate-200 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen className="w-16 h-16 text-white" /></div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1 relative z-10">Total Saldo Kas</p>
          <p className="text-2xl font-black text-white relative z-10">Rp {formatRupiah(saldoTotal)}</p>
        </div>
      </div>

      {/* Filter Bulan dan Tahun */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Periode Laporan</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="flex-1 md:flex-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 md:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            <option value={-1}>Semua Bulan</option>
            {months.map((month, idx) => (
              <option key={month} value={idx}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="flex-1 md:flex-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 md:py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="md:ml-auto w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase italic">
            {filteredData.length} transaksi di {selectedMonth === -1 ? `tahun ${selectedYear}` : `bulan ${months[selectedMonth]}`}
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={handleExportExcelKas} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5 text-green-600" /> EXCEL
            </button>
            <button onClick={handleExportPDFKas} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors shadow-sm">
              <Download className="w-3.5 h-3.5 text-red-500" /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <h3 className="text-sm font-bold text-slate-800 flex items-center">
            <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
            Riwayat Transaksi
          </h3>
          <div className="flex gap-2">
            {userRole !== 'Viewer' && (
              <>
                <button onClick={handleExportExcelKas} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <Download className="w-3.5 h-3.5 text-green-600" /> Excel
                </button>
                <button onClick={handleExportPDFKas} className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
                </button>
              </>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3">ID Transaksi</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Keterangan</th>
                <th className="px-6 py-3 text-right">Debit (Masuk)</th>
                <th className="px-6 py-3 text-right">Kredit (Keluar)</th>
                <th className="px-6 py-3 text-right bg-slate-50">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredData.length > 0 ? filteredData.map((trx) => (
                <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{trx.id}</td>
                  <td className="px-6 py-3 text-xs">{trx.tanggal}</td>
                  <td className="px-6 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{trx.transaksi}</div>
                      {trx.strukUrl && (
                        <a href={trx.strukUrl} target="_blank" rel="noopener noreferrer" className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Lihat Bukti Struk">
                          <FileText className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-slate-500 mt-0.5">{trx.nama && `${trx.nama} - ` }{trx.keterangan}</div>
                  </td>
                  <td className={`px-6 py-3 text-right font-mono text-xs ${trx.debit > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {trx.debit > 0 ? formatRupiah(trx.debit) : '0'}
                  </td>
                  <td className={`px-6 py-3 text-right font-mono text-xs ${trx.kredit > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {trx.kredit > 0 ? formatRupiah(trx.kredit) : '0'}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-xs font-bold bg-slate-50/50 text-slate-800">
                    {formatRupiah(trx.saldoAkhir)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-50">Tidak Ada Transaksi</p>
                    <p className="text-[10px]">Silakan pilih periode lain atau tambahkan data baru.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Overlay Catat Pemasukan */}
      {showMasukForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-600" />
                Catat
              </h3>
              <button onClick={() => setShowMasukForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPemasukan} className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal</label>
                  <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipe Transaksi</label>
                  <select name="tipe" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Masuk">Pemasukan (Masuk)</option>
                    <option value="Keluar">Pengeluaran (Keluar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Transaksi / Kategori</label>
                  <select name="transaksi" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <optgroup label="Pemasukan">
                      <option value="Iuran Rutin Warga">Iuran Rutin Warga</option>
                      <option value="Iuran Partisipasi Pembangunan">Iuran Partisipasi Pembangunan</option>
                      <option value="Dana Kelurahan/Pemerintah">Dana Kelurahan/Pemerintah</option>
                      <option value="Donasi & Bantuan Sosial">Donasi & Bantuan Sosial</option>
                      <option value="Sponsorship & Donatur">Sponsorship & Donatur</option>
                      <option value="Hasil Usaha RT/RW">Hasil Usaha RT/RW</option>
                    </optgroup>
                    <optgroup label="Pengeluaran">
                      <option value="Insentif">Insentif</option>
                      <option value="Pemeliharaan Lingkungan">Pemeliharaan Lingkungan</option>
                      <option value="Dana Sosial">Dana Sosial</option>
                      <option value="Kegiatan Warga">Kegiatan Warga</option>
                      <option value="Akomodasi & Konsumsi">Akomodasi & Konsumsi</option>
                      <option value="Gaji">Gaji</option>
                      <option value="Upah">Upah</option>
                      <option value="Perbaikan">Perbaikan</option>
                      <option value="Pembelian">Pembelian</option>
                      <option value="Pemasangan">Pemasangan</option>
                      <option value="Pembongkaran">Pembongkaran</option>
                      <option value="Bayar jasa">Bayar jasa</option>
                      <option value="Pergantian">Pergantian</option>
                    </optgroup>
                    <optgroup label="Lainnya">
                      <option value="Lainnya">Lainnya...</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Pemohon / Penyetor</label>
                  <input name="nama" type="text" list="wargaListKas" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Kel. Bpk. Agus" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Opsional)</label>
                <input name="alamat" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Alamat terkait transaksi" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan Tambahan</label>
                <input name="keterangan" required type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Pembayaran iuran / Biaya perbaikan" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                <input name="nominal" required type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="50000" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Bukti Struk/Kwitansi (Opsional)</label>
                <div className="flex flex-col gap-2">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(file, 'struk');
                          setStrukUrl(url);
                        } catch (err) {
                          alert("Gagal mengunggah struk.");
                        }
                      }
                    }} 
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {strukUrl && (
                    <div className="mt-2 relative w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden group">
                      <img src={strukUrl} alt="Struk" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setStrukUrl("")}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button type="button" onClick={() => setShowMasukForm(false)} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <datalist id="wargaListKas">
        {wargaData && wargaData.map((w, idx) => (
          <option key={idx} value={w.nama} />
        ))}
      </datalist>
    </div>
  );
}

function PengaturanView() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');

  const generateDummyData = async () => {
    setIsGenerating(true);
    setGenerateMsg('Mulai membuat data dummy...');
    
    try {
      const batch = writeBatch(db);

      // --- 1. DATA WARGA (20 Warga, 5 Kepala Keluarga) ---
      const keluargaData = [
        { kk: '3216061111111111', namaKK: 'Budi Santoso', istri: 'Siti Aminah', anak1: 'Budi Junior', anak2: 'Ayu Lestari', rt: '01', blok: 'Blok A No 1' },
        { kk: '3216062222222222', namaKK: 'Ahmad Dahlan', istri: 'Chairunnisa', anak1: 'Raka Pratama', anak2: 'Riki Hermawan', rt: '02', blok: 'Blok B No 12' },
        { kk: '3216063333333333', namaKK: 'Joko Widodo', istri: 'Iriana M', anak1: 'Gibran R', anak2: 'Kaesang P', rt: '03', blok: 'Blok C No 5' },
        { kk: '3216064444444444', namaKK: 'Prabowo S', istri: 'Titiek S', anak1: 'Didit H', anak2: 'Bobby N', rt: '01', blok: 'Blok A No 8' },
        { kk: '3216065555555555', namaKK: 'Susilo B Y', istri: 'Ani Y', anak1: 'Agus H', anak2: 'Ibas Y', rt: '04', blok: 'Blok D No 15' },
      ];

      let generatedWargas: any[] = [];
      let wIdx = 1;

      for (const kel of keluargaData) {
        const familyMembers = [
          { nama: kel.namaKK, posisi: 'Suami (Kepala Keluarga)', jk: 'Laki-Laki', ttl: `Jakarta, ${1970 + wIdx}-01-01` },
          { nama: kel.istri, posisi: 'Istri', jk: 'Perempuan', ttl: `Jakarta, ${1973 + wIdx}-02-02` },
          { nama: kel.anak1, posisi: 'Anak', jk: 'Laki-Laki', ttl: `Jakarta, ${1995 + wIdx}-03-03` },
          { nama: kel.anak2, posisi: 'Anak', jk: wIdx % 2 === 0 ? 'Laki-Laki' : 'Perempuan', ttl: `Jakarta, ${1998 + wIdx}-04-04` }
        ];

        for (const member of familyMembers) {
          const wId = `WARGA-${Date.now()}-${wIdx}`;
          const newWarga = {
            id: wId,
            nik: `321606${Date.now().toString().slice(-6)}${wIdx.toString().padStart(4, '0')}`,
            kk: kel.kk,
            nama: member.nama,
            tempatLahir: member.ttl.split(', ')[0],
            tglLahir: member.ttl.split(', ')[1],
            jk: member.jk,
            posisi: member.posisi,
            agama: 'Islam',
            kawin: member.posisi === 'Anak' ? 'Belum Kawin' : 'Kawin',
            kewarganegaraan: 'WNI',
            profesi: member.posisi === 'Anak' ? 'Pelajar/Mahasiswa' : 'Karyawan Swasta',
            rt: kel.rt,
            rw: '26',
            kelurahan: 'Kebalen',
            kecamatan: 'Babelan',
            kota_kab: 'Bekasi',
            blok: kel.blok,
            status: 'Warga Tetap',
            hp: `0812${Date.now().toString().slice(-8)}`,
            fotoText: '-',
            fotoUrl: null
          };
          generatedWargas.push(newWarga);
          batch.set(doc(db, 'warga', wId), newWarga);
          wIdx++;
        }
      }

      setGenerateMsg('Warga berhasil di-generate. Membuat transaksi & kas...');

      // --- 2. DATA TRANSAKSI (IURAN & KAS) (50 Item) ---
      for (let i = 1; i <= 50; i++) {
        const RandomWarga = generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const isKeluar = i % 4 === 0; // 25% pengeluaran
        
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 90)); // random within last 90 days
        const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        const formattedDateTime = formattedDate + ', ' + dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        
        const kasId = `TRX-DUMMY-${Date.now()}-${i}`;
        const iuranId = `INV-DUMMY-${Date.now()}-${i}`;
        
        let jenis = '';
        let keterangan = '';
        let nominal = 0;

        if (isKeluar) {
          const jenisPengeluaran = ['Pemeliharaan Lingkungan', 'Kegiatan Warga', 'Upah', 'Bayar jasa', 'Pemasangan'];
          jenis = jenisPengeluaran[i % jenisPengeluaran.length];
          keterangan = `Pembayaran ${jenis}`;
          nominal = 150000 + (Math.floor(Math.random() * 5) * 50000);
          
          batch.set(doc(db, 'kas', kasId), {
            id: kasId,
            tanggal: formattedDate,
            tipe: 'Keluar',
            transaksi: jenis,
            nama: i % 2 === 0 ? 'Toko Material' : 'Bpk. Tukang',
            alamat: '-',
            keterangan: keterangan,
            debit: 0,
            kredit: nominal,
            strukUrl: ""
          });

        } else {
          jenis = 'Iuran Rutin Warga';
          keterangan = 'Iuran Bulanan';
          nominal = 50000;
          
          // Set ke kas
          batch.set(doc(db, 'kas', kasId), {
            id: kasId,
            tanggal: formattedDate,
            tipe: 'Masuk',
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            keterangan: keterangan,
            debit: nominal,
            kredit: 0,
            strukUrl: ""
          });

          // Set ke iuran
          batch.set(doc(db, 'iuran', iuranId), {
            id: iuranId,
            tanggal: formattedDateTime,
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            tipe: 'Masuk',
            periode: 'Mar 2026',
            nominal: nominal,
            status: 'Lunas',
            keterangan: keterangan,
            strukUrl: ""
          });
        }
      }

      setGenerateMsg('Transaksi berhasil di-generate. Membuat Surat Pengantar...');

      // --- 3. DATA SURAT (50 Item) ---
      const jenisSurat = ['Surat Pengantar KTP', 'Surat Keterangan Domisili', 'Surat Pengantar SKCK', 'Surat Keterangan Usaha (SKU)'];
      for (let i = 1; i <= 50; i++) {
        const RandomWarga = generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const jSurat = jenisSurat[i % jenisSurat.length];
        
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30)); // random within last 30 days
        const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const suratId = `SRT-DUMMY-${Date.now()}-${i}`;
        
        batch.set(doc(db, 'surat', suratId), {
          id: suratId,
          tanggal: formattedDate,
          jenisSurat: jSurat,
          pemohon: RandomWarga.nama,
          status: i % 5 === 0 ? 'Tertunda' : (i % 7 === 0 ? 'Ditolak' : 'Disetujui'),
          keterangan: 'Keperluan administrasi'
        });
      }

      setGenerateMsg('Menulis semua data ke Database, mohon tunggu...');
      await batch.commit();

      setGenerateMsg('Selesai! 120 Data Dummy berhasil ditambahkan ke Database.');
      setTimeout(() => {
        setGenerateMsg('');
      }, 5000);

    } catch (error) {
      console.error(error);
      setGenerateMsg('Gagal membuat data dummy.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Pengaturan Sistem & Database
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Konfigurasi Umum */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Konfigurasi Umum</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal Iuran Tetap (Rp)</label>
              <input type="number" defaultValue="50000" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Lingkungan (RT/RW)</label>
              <input type="text" defaultValue="RT 04 / RW 09" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Ketua</label>
              <input type="text" defaultValue="Bpk. Bambang" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          {/* Konfigurasi Integrasi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Integrasi WhatsApp API</h4>
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Status Automasi</label>
              <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                <option value="aktif">Aktif (Tiap Tgl 5)</option>
                <option value="nonaktif">Non-Aktif</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Token API (Bearer)</label>
              <input type="password" defaultValue="TOKEN_RAHASIA_123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" />
              <p className="text-[10px] text-slate-400 mt-1">Jangan bagikan token ini kepada siapapun.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Template Pesan Reminder</label>
              <textarea rows={3} defaultValue="Halo Bpk/Ibu {nama}, ini adalah pengingat dari Sistem RT..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
          <button className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-sm font-bold transition-colors">
            Reset Default
          </button>
          <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95">
            Simpan Pengaturan
          </button>
        </div>
      </div>

      {/* Database Schema Map Info */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col">
        <h3 className="text-sm font-bold mb-4 flex items-center text-blue-400">
          Struktur Sheet 'Pengaturan' di Google Tables
        </h3>
        <div className="font-mono text-[11px] space-y-2 text-slate-300 bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto">
          <p className="text-green-400 mb-2">// Buat Sheet baru dengan nama "Pengaturan". Isi Kolom A (Key) dan Kolom B (Value):</p>
          <table className="w-full text-left">
             <thead className="text-slate-500 border-b border-slate-700">
               <tr>
                 <th className="pb-2 w-1/3">Kunci / Key (Kolom A)</th>
                 <th className="pb-2 w-2/3">Nilai / Value (Kolom B)</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-700/50">
               <tr>
                 <td className="py-2 text-blue-300">NOMINAL_IURAN</td>
                 <td className="py-2">50000</td>
               </tr>
               <tr>
                 <td className="py-2 text-blue-300">NAMA_RT</td>
                 <td className="py-2">RT 04 / RW 09</td>
               </tr>
               <tr>
                 <td className="py-2 text-blue-300">TOKEN_WA</td>
                 <td className="py-2">ab12cd34ef56...</td>
               </tr>
             </tbody>
          </table>
        </div>
      </div>

      {/* Tombol Generate Dummy Data (Hanya untuk Testing) */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col items-center text-center">
        <h3 className="text-sm font-bold text-orange-800 mb-2">Alat Uji Coba: Generate Data Dummy</h3>
        <p className="text-xs text-orange-600 mb-4 max-w-lg">Gunakan tombol ini untuk menghasilkan 120 data secara otomatis (20 Warga, 5 KK, 50 Surat, 50 Transaksi) untuk menguji fitur aplikasi. Data akan ditambahkan ke database Anda yang aktif.</p>
        
        {generateMsg && (
          <p className="text-xs font-bold text-blue-700 mb-3 bg-white px-3 py-1 rounded shadow-sm">{generateMsg}</p>
        )}

        <button 
          onClick={generateDummyData} 
          disabled={isGenerating}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:bg-orange-300 flex items-center gap-2"
        >
          {isGenerating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <Database className="w-4 h-4" />}
          {isGenerating ? 'Memproses...' : 'Generate 120 Data Dummy'}
        </button>
      </div>

    </div>
  );
}

function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Logic for easy demo: if user types "admin" and not an email, append a domain
      let finalEmail = email;
      if (!email.includes('@')) {
        finalEmail = `${email}@rw26.com`;
      }
      
      await signInWithEmailAndPassword(auth, finalEmail, password);
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = `Gagal masuk (${err.code}). Periksa kembali email dan password Anda.`;
      
      if (err.code === 'auth/user-not-found') {
        msg = 'PENGGUNA TIDAK DITEMUKAN: Silakan daftarkan email ini di Firebase Console.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'PASSWORD SALAH: Password tidak sesuai.';
      } else if (err.code === 'auth/invalid-credential') {
        msg = 'KREDENSIAL TIDAK VALID: Email atau password salah. Jika Anda baru saja menambah user di Console, pastikan Password-nya sama persis.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'FORMAT EMAIL SALAH: Masukkan format email yang benar.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'METODE LOGIN BELUM AKTIF: Anda harus mengaktifkan "Email/Password" di tab "Sign-in method" di Firebase Console.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'MASALAH JARINGAN: Periksa koneksi internet Anda atau cek apakah Firebase config sudah benar.';
      }
      
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-slate-900">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-200 mb-4 animate-[bounce_2s_infinite]">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">RW 26 BERJUANG</h1>
          <p className="text-slate-500 font-medium mt-2 tracking-tight">Smart Management Information System (Firebase Edition)</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
          <div className="p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 font-primary text-slate-900">Silakan Masuk</h2>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email / Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    placeholder="Contoh: admin@rw26.com atau admin"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
                    placeholder="Masukkan password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Masuk Sekarang'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <a 
                href="https://console.firebase.google.com/project/gen-lang-client-0332165962/authentication/users" 
                target="_blank" 
                rel="noreferrer"
                className="text-[10px] text-blue-500 hover:underline font-bold"
              >
                Lupa Password atau Belum Daftar? Klik di sini untuk ke Firebase Console
              </a>
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100 italic">
            <p className="text-center text-[10px] text-slate-400">
              Demo Users (Firestore): admin@rw26.com | operator@rw26.com | viewer@rw26.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
