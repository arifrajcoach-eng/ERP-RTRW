import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Siren, ShieldAlert, MapPin, LifeBuoy, Users, BookOpen, FileText, LayoutDashboard, CreditCard, PlusCircle, MinusCircle, Calendar, Search, Settings, Edit, Trash2, X, Download, Menu, Upload, LogOut, Lock, User, Printer, AlertTriangle, Eye, EyeOff, ChevronRight, Database, Shield, CheckCircle, AlertCircle, Info, Package, History, ClipboardList, Baby, Stethoscope, Scale, Activity, HeartPulse, Recycle, Wallet, TrendingUp, HandCoins, Vote, ShoppingBag, FileSpreadsheet, BookCopy, Store, ShieldCheck, UserCheck, Image, Camera, Plus, BellOff, Monitor, UserPlus, Archive, CheckCircle2, Clock, Phone, Home, MessageSquare, MessageCircle, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import * as faceapi from 'face-api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc, onSnapshot, getDocFromServer, writeBatch } from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { auth, storage } from './firebase';
import KopTemplateManagementView from './components/KopTemplateManagementView';
import DashboardView from './components/DashboardView';
import WargaView from './components/WargaView';
import BukuTamuView from './components/BukuTamuView';
import VerifikasiAdminView from './components/VerifikasiAdminView';
import IuranView from './components/IuranView';
import PosyanduView from './components/PosyanduView';
import BankSampahView from './components/BankSampahView';
import InventarisView from './components/InventarisView';
import SuratView from './components/SuratView';
import KasView from './components/KasView';
import UsersView from './components/UsersView';
import TenantsView from './components/TenantsView';
import PengaturanView from './components/PengaturanView';
import EVotingView from './components/EVotingView';
import ETokoView from './components/ETokoView';
import SOSOverlay from './components/SOSOverlay';
import LoginView from './components/LoginView';
import WargaProfileView from './components/WargaProfileView';
import ConfirmModal from './components/ConfirmModal';
import { calculateAge } from './utils/helpers';
import { generateSuratHTML } from './utils/suratTemplates';

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
  { id: "SRT-1004", tanggal: "19 Apr 2026", pemohon: "Ibu Siti Aminah", jenisSurat: "Surat Domisili", status: "Diajukan" },
  { id: "SRT-1003", tanggal: "17 Apr 2026", pemohon: "Bpk. Ahmad Suhendar", jenisSurat: "Pengantar Kelurahan", status: "Selesai" },
  { id: "SRT-1002", tanggal: "16 Apr 2026", pemohon: "Sdr. Bayu Pratama", jenisSurat: "Surat Keterangan Usaha", status: "Diajukan" },
  { id: "SRT-1001", tanggal: "10 Apr 2026", pemohon: "Bpk. Joko Anas", jenisSurat: "Surat Domisili", status: "Selesai" },
];

const INITIAL_IURAN_DATA = [
  { id: "INV-2604-001", tanggal: "19 Apr 2026, 08:30", transaksi: "Iuran Keamanan", nama: "Bpk. Ahmad Suhendar", periode: "Apr 2026", nominal: 50000, status: "Lunas", keterangan: "-" },
  { id: "INV-2604-002", tanggal: "18 Apr 2026, 14:15", transaksi: "Iuran Kebersihan", nama: "Ibu Siti Aminah", periode: "Apr 2026", nominal: 50000, status: "Pending", keterangan: "Janji bayar akhir bulan" },
  { id: "INV-2604-003", tanggal: "02 Apr 2026, 09:10", transaksi: "Iuran Keamanan", nama: "Bpk. Joko Anas", periode: "Apr 2026", nominal: 50000, status: "Lunas", keterangan: "-" },
];

const INITIAL_INVENTARIS_DATA = [
  { id: "INV-BRG-001", nama_barang: "Kursi Lipat Merek Chitose", kategori: "Aset Tenda & Kursi", jumlah: 50, kondisi: "Baik", lokasi: "Gudang RT 01", tanggal_pengadaan: "2024-01-10", keterangan: "Pengadaan Mandiri" },
  { id: "INV-BRG-002", nama_barang: "Tenda 3x4 Meter", kategori: "Aset Tenda & Kursi", jumlah: 2, kondisi: "Baik", lokasi: "Gudang RW", tanggal_pengadaan: "2023-05-15", keterangan: "Bantuan Desa" },
  { id: "INV-BRG-003", nama_barang: "Sound System Portable", kategori: "Elektronik", jumlah: 1, kondisi: "Rusak Ringan", lokasi: "Pos Kamling", tanggal_pengadaan: "2022-11-20", keterangan: "Mic kadang putus" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, role: string, email?: string, tenantId?: string, isSuperAdmin?: boolean} | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // --- FIREBASE AUTH SYNC ---
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firestore client is operating in offline mode.");
        } else if (error?.code === 'unavailable') {
          console.warn("Firestore client is offline.");
        }
      }
    };
    testConnection();

    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          let userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists() && user.email) {
            const preRegId = user.email.replace(/\./g, '_');
            try {
              const preRegDoc = await getDoc(doc(db, 'users', preRegId));
              if (preRegDoc.exists()) {
                const data = preRegDoc.data();
                const newUserInfo = { ...data, uid: user.uid, isPreRegistered: false };
                await setDoc(userDocRef, newUserInfo);
                try {
                  await deleteDoc(preRegDoc.ref);
                } catch (e) {
                  console.warn("Could not delete pre-reg doc");
                }
                userDoc = await getDoc(userDocRef);
              }
            } catch (preRegErr) {
              console.warn("Could not check pre-registered doc");
            }
          }

          if (userDoc.exists()) {
            let userData = userDoc.data() as any;
            const isMasterEmail = user.email?.toLowerCase() === 'arifrajcoach@gmail.com';
            if (isMasterEmail) {
              const needsUpdate = userData.role !== 'SUPER_ADMIN' || !userData.isSuperAdmin;
              userData.isSuperAdmin = true;
              userData.role = 'SUPER_ADMIN';
              if (!userData.name || userData.name === 'User') {
                userData.name = 'Bpk. Arif (Super Admin)';
              }
              if (needsUpdate) {
                try {
                  await updateDoc(userDocRef, { isSuperAdmin: true, role: 'SUPER_ADMIN', name: userData.name });
                } catch(e) {
                  console.warn("Could not sync super admin status");
                }
              }
            }
            setCurrentUser(userData);
          } else if (user.isAnonymous) {
            setCurrentUser({ 
              name: "Warga (Anonymous)", 
              role: "Warga", 
              uid: user.uid,
              tenantId: "RW26_SMART",
              isSuperAdmin: false 
            });
          } else {
            let role = 'RT';
            let name = user.email?.split('@')[0] || 'User';
            const isMasterEmail = user.email?.toLowerCase() === 'arifrajcoach@gmail.com';
            const tenantId = 'RW26_SMART';
            const isSuperAdmin = isMasterEmail;
            
            if (isMasterEmail) { 
              role = 'SUPER_ADMIN'; 
              name = 'Bpk. Arif (Super Admin)'; 
            }
            
            const newUser = { 
              id_user: user.uid,
              name: name,
              role: role, 
              email: user.email, 
              tenantId, 
              isSuperAdmin: !!isSuperAdmin,
              rt: "01",
              status: "AKTIF",
              created_at: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser as any);
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          setCurrentUser({ name: user.email || 'User', role: 'Viewer' });
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
      if (wargaAuth) {
        setWargaAuth(null);
      } else {
        await signOut(auth);
      }
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const [wargaData, setWargaData] = useState([]);
  const [kasData, setKasData] = useState([]);
  const [suratData, setSuratData] = useState([]);
  const [iuranData, setIuranData] = useState([]);
  const [inventarisData, setInventarisData] = useState([]);
  const [inventarisLogs, setInventarisLogs] = useState<any[]>([]);
  const [inventarisKategori, setInventarisKategori] = useState<any[]>([]);
  const [inventarisLokasi, setInventarisLokasi] = useState<any[]>([]);
  const [inventarisSupplier, setInventarisSupplier] = useState<any[]>([]);
  const [balitaData, setBalitaData] = useState<any[]>([]);
  const [ibuHamilData, setIbuHamilData] = useState<any[]>([]);
  const [posyanduKegiatanData, setPosyanduKegiatanData] = useState<any[]>([]);
  const [posbinduKegiatanData, setPosbinduKegiatanData] = useState<any[]>([]);
  const [pemeriksaanBalitaData, setPemeriksaanBalitaData] = useState<any[]>([]);
  const [pemeriksaanPosbinduData, setPemeriksaanPosbinduData] = useState<any[]>([]);
  const [imunisasiData, setImunisasiData] = useState<any[]>([]);
  const [sampahKategoriData, setSampahKategoriData] = useState<any[]>([]);
  const [sampahSetoranData, setSampahSetoranData] = useState<any[]>([]);
  const [sampahTarikSaldoData, setSampahTarikSaldoData] = useState<any[]>([]);
  const [emergenciesData, setEmergenciesData] = useState<any[]>([]);
  const [verifikasiWargaData, setVerifikasiWargaData] = useState<any[]>([]);
  const [bukuTamuData, setBukuTamuData] = useState<any[]>([]);
  const [isSOSTriggering, setIsSOSTriggering] = useState(false);
  const [hiddenEmergencyId, setHiddenEmergencyId] = useState<string | null>(null);
  const [usersData, setUsersData] = useState<any[]>([]);
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [kopSettings, setKopSettings] = useState<Record<string, any>>({});
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSOSConfirmOpen, setIsSOSConfirmOpen] = useState(false);
  const [wargaAuth, setWargaAuth] = useState<any>(null);

  const activeEmergency = emergenciesData.find(e => e.status === 'ACTIVE' && e.id !== hiddenEmergencyId);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFirestoreError = (err: any, op: string, path: string) => {
    console.error('Firestore Error: ', err);
    showNotification(`Akses Gagal: ${op.toUpperCase()} pada ${path}`, 'error');
  };

  const handleFileUpload = async (file: File, folder: string, onProgress?: (pct: number) => void) => {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          if (onProgress) onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        }, 
        reject, 
        async () => {
          resolve(await getDownloadURL(uploadTask.snapshot.ref));
        }
      );
    });
  };

  useEffect(() => {
    if (!currentUser && !wargaAuth) {
      if (!isAuthInitializing) signInAnonymously(auth);
      setIsLoadingDB(false);
      return;
    }
    const tId = currentUser?.tenantId || wargaAuth?.tenantId || 'RW26_SMART';
    const hasFullAccess = currentUser && !['Warga', 'Viewer'].includes(currentUser.role);

    setIsLoadingDB(true);
    let loadedSections = 0;
    const totalSections = currentUser?.isSuperAdmin ? 16 : 14; 

    const onDataLoaded = () => {
      loadedSections++;
      if (loadedSections >= totalSections) setIsLoadingDB(false);
    };

    const unsubSettings = onSnapshot(doc(db, 'settings', tId), (snap) => snap.exists() && setSettings(snap.data()));
    const unsubKopSettings = onSnapshot(doc(db, 'tenant_settings', tId), (snap) => snap.exists() && setKopSettings(snap.data()));

    const unsubWarga = onSnapshot(query(collection(db, 'data_warga'), where('tenantId', '==', tId)), (snap) => {
      setWargaData(snap.docs.map(doc => ({ docId: doc.id, ...doc.data() })) as any);
      onDataLoaded();
    });

    const unsubKas = onSnapshot(query(collection(db, 'kas'), where('tenantId', '==', tId)), (snap) => {
      setKasData(snap.docs.map(doc => ({ ...doc.data() })) as any);
      onDataLoaded();
    });

    const unsubSurat = onSnapshot(query(collection(db, 'surat'), where('tenantId', '==', tId)), (snap) => {
      setSuratData(snap.docs.map(doc => ({ ...doc.data() })) as any);
      onDataLoaded();
    });

    const unsubIuran = onSnapshot(query(collection(db, 'iuran'), where('tenantId', '==', tId)), (snap) => {
      setIuranData(snap.docs.map(doc => ({ ...doc.data() })) as any);
      onDataLoaded();
    });

    const unsubInventaris = onSnapshot(query(collection(db, 'inventaris'), where('tenantId', '==', tId)), (snap) => {
      setInventarisData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any);
      onDataLoaded();
    });

    const unsubEmergencies = onSnapshot(query(collection(db, 'emergencies'), where('tenantId', '==', tId)), (snap) => {
      setEmergenciesData(snap.docs.map(doc => ({ ...doc.data() })));
      onDataLoaded();
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('tenantId', '==', tId)), (snap) => {
      setUsersData(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      onDataLoaded();
    });

    // POSYANDU & OTHER SYNC (Simplified for size)
    const unsubBalita = onSnapshot(query(collection(db, 'balita'), where('tenantId', '==', tId)), (s) => setBalitaData(s.docs.map(d => d.data())));
    const unsubIbuHamil = onSnapshot(query(collection(db, 'ibu_hamil'), where('tenantId', '==', tId)), (s) => setIbuHamilData(s.docs.map(d => d.data())));
    const unsubPK = onSnapshot(query(collection(db, 'posyandu_kegiatan'), where('tenantId', '==', tId)), (s) => setPosyanduKegiatanData(s.docs.map(d => d.data())));
    const unsubBK = onSnapshot(query(collection(db, 'posbindu_kegiatan'), where('tenantId', '==', tId)), (s) => setPosbinduKegiatanData(s.docs.map(d => d.data())));
    const unsubPB = onSnapshot(query(collection(db, 'pemeriksaan_balita'), where('tenantId', '==', tId)), (s) => setPemeriksaanBalitaData(s.docs.map(d => d.data())));
    const unsubPP = onSnapshot(query(collection(db, 'pemeriksaan_posbindu'), where('tenantId', '==', tId)), (s) => setPemeriksaanPosbinduData(s.docs.map(d => d.data())));
    const unsubIm = onSnapshot(query(collection(db, 'imunisasi'), where('tenantId', '==', tId)), (s) => setImunisasiData(s.docs.map(d => d.data())));
    const unsubBT = onSnapshot(query(collection(db, 'buku_tamu'), where('tenantId', '==', tId)), (s) => setBukuTamuData(s.docs.map(d => d.data())));
    const unsubVW = onSnapshot(query(collection(db, 'verifikasi_warga'), where('tenantId', '==', tId)), (s) => setVerifikasiWargaData(s.docs.map(d => d.data())));

    return () => {
      unsubWarga(); unsubKas(); unsubSurat(); unsubIuran(); unsubInventaris(); unsubEmergencies(); unsubUsers(); unsubSettings(); unsubKopSettings();
      unsubBalita(); unsubIbuHamil(); unsubPK(); unsubBK(); unsubPB(); unsubPP(); unsubIm(); unsubBT(); unsubVW();
    };
  }, [currentUser, wargaAuth]);

  const handleTriggerSOS = () => setIsSOSConfirmOpen(true);

  const confirmSOS = async () => {
    setIsSOSConfirmOpen(false);
    setIsSOSTriggering(true);
    try {
      const id = `SOS-${Date.now()}`;
      await setDoc(doc(db, 'emergencies', id), {
        tenantId: currentUser?.tenantId || 'RW26_SMART',
        id,
        userId: auth.currentUser?.uid || 'anonymous',
        userName: currentUser?.name || 'Warga',
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      });
      showNotification("Sinyal Darurat Terkirim!", "error");
    } finally {
      setIsSOSTriggering(false);
    }
  };

  const handleResolveSOS = async (id: string) => {
    await updateDoc(doc(db, 'emergencies', id), { status: 'RESOLVED', resolvedBy: currentUser?.name, resolvedAt: new Date().toISOString() });
  };

  if (isAuthInitializing) return <div className="p-20 text-center">Inisialisasi...</div>;
  if (!currentUser && !wargaAuth) return <LoginView setWargaAuth={setWargaAuth} wargaData={wargaData} isLoadingDB={isLoadingDB} />;
  
  if (!currentUser && wargaAuth) return (
    <WargaProfileView wargaData={wargaAuth} verifikasiData={verifikasiWargaData} suratData={suratData} setSuratData={setSuratData} setWargaAuth={setWargaAuth} tenantId={wargaAuth.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFileUpload={handleFileUpload} showNotification={showNotification} handleFirestoreError={handleFirestoreError} kopSettings={kopSettings} getSetting={(k) => settings[k]} usersData={usersData} generateSuratHTML={generateSuratHTML} settings={settings} />
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden relative">
      <AnimatePresence>
        {activeEmergency && <SOSOverlay emergency={activeEmergency} onResolve={handleResolveSOS} onCloseLocal={() => setHiddenEmergencyId(activeEmergency.id)} canResolve={currentUser.role !== 'Viewer'} />}
      </AnimatePresence>

      <aside className={`w-64 bg-white border-r border-slate-200 h-full flex flex-col transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative z-50`}>
        <div className="p-6 border-b font-black text-xl text-blue-600">RW 26 SMART</div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'warga', label: 'Data Warga', icon: Users },
            { id: 'buku-tamu', label: 'Buku Tamu', icon: BookCopy },
            { id: 'verifikasi', label: 'Verifikasi', icon: ShieldCheck },
            { id: 'transaksi', label: 'Transaksi', icon: CreditCard },
            { id: 'posyandu', label: 'Kesehatan', icon: Baby },
            { id: 'bank-sampah', label: 'Sampah', icon: Recycle },
            { id: 'inventaris', label: 'Inventaris', icon: Package },
            { id: 'surat', label: 'Surat', icon: FileText },
            { id: 'kas', label: 'Kas', icon: BookOpen },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-sm uppercase">{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-4">
            <LogOut className="w-5 h-5" />
            <span className="text-sm uppercase font-bold">Keluar</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2"><Menu /></button>
          <div className="font-bold text-slate-500 uppercase tracking-widest">{activeTab}</div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-sm">{currentUser.name}</div>
              <div className="text-[10px] text-blue-600 font-black">{currentUser.role}</div>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && <DashboardView kasData={kasData} wargaData={wargaData} suratData={suratData} iuranData={iuranData} emergenciesData={emergenciesData} handleTriggerSOS={handleTriggerSOS} userRole={currentUser.role} setActiveTab={setActiveTab} posyanduKegiatanData={posyanduKegiatanData} inventarisData={inventarisData} sampahSetoranData={sampahSetoranData} />}
          {activeTab === 'warga' && <WargaView wargaData={wargaData} setWargaData={setWargaData} userRole={currentUser.role} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          {activeTab === 'buku-tamu' && <BukuTamuView bukuTamuData={bukuTamuData} setBukuTamuData={setBukuTamuData} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'verifikasi' && <VerifikasiAdminView verifikasiData={verifikasiWargaData} wargaData={wargaData} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} showNotification={showNotification} handleFirestoreError={handleFirestoreError} currentUser={currentUser} />}
          {activeTab === 'transaksi' && <IuranView iuranData={iuranData} setIuranData={setIuranData} kasData={kasData} setKasData={setKasData} wargaData={wargaData} userRole={currentUser.role} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          {activeTab === 'posyandu' && <PosyanduView balitaData={balitaData} setBalitaData={setBalitaData} ibuHamilData={ibuHamilData} setIbuHamilData={setIbuHamilData} posyanduKegiatanData={posyanduKegiatanData} setPosyanduKegiatanData={setPosyanduKegiatanData} posbinduKegiatanData={posbinduKegiatanData} setPosbinduKegiatanData={setPosbinduKegiatanData} pemeriksaanBalitaData={pemeriksaanBalitaData} setPemeriksaanBalitaData={setPemeriksaanBalitaData} pemeriksaanPosbinduData={pemeriksaanPosbinduData} setPemeriksaanPosbinduData={setPemeriksaanPosbinduData} imunisasiData={imunisasiData} setImunisasiData={setImunisasiData} wargaData={wargaData} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'bank-sampah' && <BankSampahView sampahKategoriData={sampahKategoriData} sampahSetoranData={sampahSetoranData} sampahTarikSaldoData={sampahTarikSaldoData} wargaData={wargaData} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'inventaris' && <InventarisView inventarisData={inventarisData} setInventarisData={setInventarisData} inventarisLogs={inventarisLogs} setInventarisLogs={setInventarisLogs} inventarisKategori={inventarisKategori} inventarisLokasi={inventarisLokasi} inventarisSupplier={inventarisSupplier} userRole={currentUser.role} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} handleFileUpload={handleFileUpload} />}
          {activeTab === 'surat' && <SuratView suratData={suratData} setSuratData={setSuratData} wargaData={wargaData} usersData={usersData} userRole={currentUser.role} currentUser={currentUser} getSetting={(k) => settings[k]} kopSettings={kopSettings} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} settings={settings} handleFileUpload={handleFileUpload} />}
          {activeTab === 'kas' && <KasView kasData={kasData} setKasData={setKasData} iuranData={iuranData} setIuranData={setIuranData} wargaData={wargaData} userRole={currentUser.role} currentUser={currentUser} getSetting={(k) => settings[k]} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          {activeTab === 'pengaturan' && <PengaturanView tenantId={currentUser.tenantId || 'RW26_SMART'} settings={settings} userRole={currentUser.role} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
        </div>
      </main>

      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl font-bold text-white ${notification.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleTriggerSOS} className="fixed bottom-6 right-6 z-[60] w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-red-700 active:scale-95 transition-all outline-none">
        <Siren className="w-8 h-8" />
      </button>

      <AnimatePresence>
        {isSOSConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 ">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white max-w-sm rounded-3xl p-8 text-center shadow-2xl">
              <Siren className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-black mb-4">Kirim Sinyal Darurat?</h2>
              <div className="flex flex-col gap-3">
                <button onClick={confirmSOS} className="py-4 bg-red-600 text-white rounded-2xl font-bold uppercase">Ya, Kirim Sekarang</button>
                <button onClick={() => setIsSOSConfirmOpen(false)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold uppercase">Batal</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
