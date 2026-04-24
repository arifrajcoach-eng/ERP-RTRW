import React, { useState, useRef, useEffect } from 'react';
import { Siren, ShieldAlert, MapPin, LifeBuoy, Users, BookOpen, FileText, LayoutDashboard, CreditCard, PlusCircle, MinusCircle, Calendar, Search, Settings, Edit, Trash2, X, Download, Menu, Upload, LogOut, Lock, User, Printer, AlertTriangle, Eye, EyeOff, ChevronRight, Database, Shield, CheckCircle, AlertCircle, Info, Package, History, ClipboardList, Baby, Stethoscope, Scale, Activity, HeartPulse, Recycle, Wallet, TrendingUp, HandCoins, Vote, ShoppingBag, FileSpreadsheet, BookCopy } from 'lucide-react';
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
import KopTemplateManagementView from './components/KopTemplateManagementView';

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
          let userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists() && user.email) {
            // Check for pre-registered doc using email
            const preRegId = user.email.replace(/\./g, '_');
            const preRegDoc = await getDoc(doc(db, 'users', preRegId));
            if (preRegDoc.exists()) {
              // Convert pre-reg doc to UID-based doc
              const data = preRegDoc.data();
              const newUserInfo = { ...data, uid: user.uid, isPreRegistered: false };
              await setDoc(userDocRef, newUserInfo);
              try {
                await deleteDoc(preRegDoc.ref); // Clean up
              } catch (e) {
                console.warn("Could not delete pre-reg doc, possibly rules restriction. Continuing...");
              }
              userDoc = await getDoc(userDocRef);
            }
          }

          if (userDoc.exists()) {
            let userData = userDoc.data() as any;
            // Force Super Admin status for the specific master email
            if (user.email === 'arifrajcoach@gmail.com') {
              userData.isSuperAdmin = true;
              userData.role = 'ADMIN';
            }
            setCurrentUser(userData);
          } else {
            // If No Firestore doc yet, use default based on email (for easy migration)
            let role = 'RT';
            let name = user.email?.split('@')[0] || 'User';
            
            const isMasterEmail = user.email === 'arifrajcoach@gmail.com';
            
            // Set default tenantId to 'RW26_SMART' for the current user
            const tenantId = 'RW26_SMART';
            const isSuperAdmin = isMasterEmail;
            
            if (isMasterEmail) { 
              role = 'ADMIN'; 
              name = 'Bpk. Arif (Super Admin)'; 
            }
            
            const newUser = { 
              id_user: user.uid,
              name: name,
              nama: name, 
              username: user.email?.split('@')[0] || 'user',
              role: role, 
              email: user.email, 
              tenantId, 
              isSuperAdmin,
              rt: "01",
              status: "AKTIF",
              created_at: new Date().toISOString()
            };
            // Auto-create the doc BEFORE setting state to avoid race condition with rules
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser as any);
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

  const linkedWarga = currentUser?.nikMapping ? wargaData.find((w: any) => w.nik === currentUser.nikMapping) : null;
  const userPhoto = (currentUser as any)?.photoUrl || linkedWarga?.foto || linkedWarga?.ktpUrl || null;

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

  const [inventarisData, setInventarisData] = useState(() => {
    const saved = localStorage.getItem('rw26_inventarisData');
    return saved ? JSON.parse(saved) : INITIAL_INVENTARIS_DATA;
  });

  const [inventarisLogs, setInventarisLogs] = useState<any[]>([]);
  const [inventarisKategori, setInventarisKategori] = useState<any[]>([]);
  const [inventarisLokasi, setInventarisLokasi] = useState<any[]>([]);
  const [inventarisSupplier, setInventarisSupplier] = useState<any[]>([]);

  const [balitaData, setBalitaData] = useState<any[]>([]);
  const [ibuHamilData, setIbuHamilData] = useState<any[]>([]);
  const [posyanduKegiatanData, setPosyanduKegiatanData] = useState<any[]>([]);
  const [pemeriksaanBalitaData, setPemeriksaanBalitaData] = useState<any[]>([]);
  const [imunisasiData, setImunisasiData] = useState<any[]>([]);
  const [sampahKategoriData, setSampahKategoriData] = useState<any[]>([]);
  const [sampahSetoranData, setSampahSetoranData] = useState<any[]>([]);
  const [sampahTarikSaldoData, setSampahTarikSaldoData] = useState<any[]>([]);
  const [emergenciesData, setEmergenciesData] = useState<any[]>([]);
  const [isSOSTriggering, setIsSOSTriggering] = useState(false);

  const [usersData, setUsersData] = useState<any[]>([]);
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [kopSettings, setKopSettings] = useState<Record<string, any>>({});

  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const activeEmergency = emergenciesData.find(e => e.status === 'ACTIVE');

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [isSOSConfirmOpen, setIsSOSConfirmOpen] = useState(false);

  const handleTriggerSOS = async () => {
    if (!currentUser) return;
    setIsSOSConfirmOpen(true);
  };

  const confirmSOS = async () => {
    setIsSOSConfirmOpen(false);
    setIsSOSTriggering(true);
    try {
      const id = `SOS-${Date.now()}`;
      let userLocation = "Lokasi Tidak Diketahui";
      let lat = 0;
      let lng = 0;

      // Try to get geolocation
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { 
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 0
            });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          userLocation = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (geoErr) {
          console.warn("Geolocation failed", geoErr);
        }
      }

      // Fallback or Append Address if NIK is linked
      const linkedWarga = (currentUser as any).nikMapping ? wargaData.find(w => w.nik === (currentUser as any).nikMapping) : null;
      let addressStr = "";
      let userPhone = "";
      let userEmail = currentUser.email || "";
      let userPhoto = "";

      if (linkedWarga) {
        addressStr = `Alamat: Blok ${linkedWarga.blok || '-'}, RT ${linkedWarga.rt || '-'}/RW ${linkedWarga.rw || '-'}`;
        userPhone = (linkedWarga as any).hp || "";
        userPhoto = (linkedWarga as any).foto || "";
        if ((linkedWarga as any).email) userEmail = (linkedWarga as any).email;
      }

      const sosData = {
        tenantId: currentUser.tenantId || 'RW26_SMART',
        id,
        userId: auth.currentUser?.uid || 'anonymous',
        userName: currentUser.name,
        userLocation: userLocation,
        userAddress: addressStr,
        userPhone: userPhone,
        userEmail: userEmail,
        userPhoto: userPhoto,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        status: 'ACTIVE'
      };

      await setDoc(doc(db, 'emergencies', id), sosData);
      showNotification("Sinyal Darurat Terkirim!", "error");
    } catch (err) {
      handleFirestoreError(err, 'create', 'emergencies');
    } finally {
      setIsSOSTriggering(false);
    }
  };

  const handleResolveSOS = async (id: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'emergencies', id), {
        status: 'RESOLVED',
        resolvedBy: currentUser.name,
        resolvedAt: new Date().toISOString()
      });
      showNotification("Sinyal Darurat Dinonaktifkan", "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'emergencies');
    }
  };

  // --- FIREBASE SYNC (REAL-TIME) ---
  useEffect(() => {
    if (!currentUser) {
      setIsLoadingDB(false);
      return;
    }

    setIsLoadingDB(true);
    let loadedSections = 0;
    const totalSections = currentUser?.isSuperAdmin ? 16 : (currentUser?.role === 'ADMIN' ? 15 : 14);

    const onDataLoaded = () => {
      loadedSections++;
      if (loadedSections >= totalSections) {
        setIsLoadingDB(false);
      }
    };

    // 0. Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', currentUser?.tenantId || 'RW26_SMART'), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data());
      }
    });

    // 0.5 Kop Settings Listener
    const unsubKopSettings = onSnapshot(doc(db, 'tenant_settings', currentUser?.tenantId || 'RW26_SMART'), (snap) => {
      if (snap.exists()) {
        setKopSettings(snap.data());
      }
    });

    // 1. Warga Listener
    const getWargaQuery = () => {
      const base = collection(db, 'data_warga');
      if (currentUser?.isSuperAdmin) return query(base);
      
      const constraints = [where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')];
      
      if (currentUser?.role === 'RT') {
        constraints.push(where('rt', '==', currentUser.rt || '01'));
      }
      
      return query(base, ...constraints);
    };

    const unsubWarga = onSnapshot(getWargaQuery(), 
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
    const getKasQuery = () => {
      const base = collection(db, 'kas');
      const constraints = [where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')];
      if (currentUser?.role === 'RT') {
        constraints.push(where('rt', '==', currentUser.rt || '01'));
      }
      return query(base, ...constraints);
    };

    const unsubKas = onSnapshot(getKasQuery(), 
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
    const unsubSurat = onSnapshot(query(collection(db, 'surat'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        const filtered = currentUser?.role === 'RT' 
          ? data.filter((s: any) => s.rt === currentUser.rt)
          : data;
        setSuratData(filtered);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'surat');
        onDataLoaded();
      }
    );

    // 4. Iuran Listener
    const unsubIuran = onSnapshot(query(collection(db, 'iuran'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        const filtered = currentUser?.role === 'RT'
          ? data.filter((i: any) => i.rt === currentUser.rt)
          : data;
        setIuranData(filtered);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'iuran');
        onDataLoaded();
      }
    );

    // 4.5 Inventaris Listener
    const unsubInventaris = onSnapshot(query(collection(db, 'inventaris'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setInventarisData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'inventaris');
        onDataLoaded();
      }
    );

    // 4.6 Inventaris Logs Listener
    const unsubInventarisLogs = onSnapshot(query(collection(db, 'inventaris_logs'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        const data = snap.docs.map(doc => ({ ...doc.data() }));
        setInventarisLogs(data);
      },
      (err) => {
        handleFirestoreError(err, 'list', 'inventaris_logs');
      }
    );

    // 4.7 Inventaris Kategori/Lokasi/Supplier
    const unsubInventarisKategori = onSnapshot(query(collection(db, 'inventaris_kategori'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => setInventarisKategori(snap.docs.map(doc => ({ ...doc.data() })))
    );
    const unsubInventarisLokasi = onSnapshot(query(collection(db, 'inventaris_lokasi'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => setInventarisLokasi(snap.docs.map(doc => ({ ...doc.data() })))
    );
    const unsubInventarisSupplier = onSnapshot(query(collection(db, 'inventaris_supplier'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => setInventarisSupplier(snap.docs.map(doc => ({ ...doc.data() })))
    );

    // 4.8 Posyandu Listeners
    const unsubBalita = onSnapshot(query(collection(db, 'balita'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setBalitaData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'balita'); onDataLoaded(); }
    );
    const unsubIbuHamil = onSnapshot(query(collection(db, 'ibu_hamil'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setIbuHamilData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'ibu_hamil'); onDataLoaded(); }
    );
    const unsubPosyanduKegiatan = onSnapshot(query(collection(db, 'posyandu_kegiatan'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setPosyanduKegiatanData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'posyandu_kegiatan'); onDataLoaded(); }
    );
    const unsubPemeriksaanBalita = onSnapshot(query(collection(db, 'pemeriksaan_balita'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setPemeriksaanBalitaData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'pemeriksaan_balita'); onDataLoaded(); }
    );
    const unsubImunisasi = onSnapshot(query(collection(db, 'imunisasi'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setImunisasiData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'imunisasi'); onDataLoaded(); }
    );

    // 4.9 Bank Sampah Listeners
    const unsubSampahKategori = onSnapshot(query(collection(db, 'sampah_kategori'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setSampahKategoriData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'sampah_kategori'); onDataLoaded(); }
    );
    const unsubSampahSetoran = onSnapshot(query(collection(db, 'sampah_setoran'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setSampahSetoranData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'sampah_setoran'); onDataLoaded(); }
    );
    const unsubSampahTarikSaldo = onSnapshot(query(collection(db, 'sampah_tarik_saldo'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setSampahTarikSaldoData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'sampah_tarik_saldo'); onDataLoaded(); }
    );

    const unsubEmergencies = onSnapshot(query(collection(db, 'emergencies'), where('tenantId', '==', currentUser?.tenantId || 'RW26_SMART')), 
      (snap) => {
        setEmergenciesData(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'emergencies'); onDataLoaded(); }
    );

    // 5. Users Listener
    let unsubUsers = () => {};
    if (currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin || currentUser?.role === 'RW' || currentUser?.role === 'RT') {
      const usersQuery = currentUser.isSuperAdmin 
        ? query(collection(db, 'users'))
        : query(collection(db, 'users'), where('tenantId', '==', currentUser.tenantId || 'RW26_SMART'));

      unsubUsers = onSnapshot(usersQuery, 
        (snap) => {
          const data = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          setUsersData(data);
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'users');
          onDataLoaded();
        }
      );
    } else {
      onDataLoaded();
    }

    // 6. Tenants Listener (Super Admin Only)
    let unsubTenants = () => {};
    if (currentUser?.isSuperAdmin) {
      unsubTenants = onSnapshot(collection(db, 'tenants'), 
        (snap) => {
          const data = snap.docs.map(doc => ({ ...doc.data() }));
          setTenantsData(data);
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'tenants');
          onDataLoaded();
        }
      );
    }

    return () => {
      unsubWarga();
      unsubKas();
      unsubSurat();
      unsubIuran();
      unsubInventaris();
      unsubInventarisLogs();
      unsubInventarisKategori();
      unsubInventarisLokasi();
      unsubInventarisSupplier();
      unsubBalita();
      unsubIbuHamil();
      unsubPosyanduKegiatan();
      unsubPemeriksaanBalita();
      unsubImunisasi();
      unsubSampahKategori();
      unsubSampahSetoran();
      unsubSampahTarikSaldo();
      unsubEmergencies();
      unsubUsers();
      unsubTenants();
      unsubSettings();
      unsubKopSettings();
    };
  }, [currentUser]);

  // --- CENTRAL CONFIG HELPERS ---
  const getSetting = (key: string) => {
    return settings[key] || "";
  };

  const kirimWhatsApp = (nomor: string, nama: string) => {
    const token = getSetting("TOKEN_WA");
    let pesan = getSetting("TEMPLATE_WA");
    const status = getSetting("STATUS_WA");

    if (status !== "Aktif") return;

    pesan = pesan.replace("{nama}", nama);

    // Simulasi kirim API
    console.log("Kirim WhatsApp ke:", nomor, "Pesan:", pesan);
    // Di sini bisa ditambahkan fetch() ke API WhatsApp Gateway
  };

  // Automaasi WhatsApp (Tanggal 5)
  useEffect(() => {
    const checkAutomasiWA = () => {
      const today = new Date();
      const statusWA = getSetting("STATUS_WA");
      
      if (today.getDate() === 5 && statusWA === "Aktif") {
        // Cari warga yang memiliki iuran pending/belum bayar bulan ini
        const currentMonth = today.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        
        wargaData.forEach((w: any) => {
          const isLunas = iuranData.some((i: any) => i.nama === w.nama && i.periode.includes(currentMonth) && i.status === 'Lunas');
          if (!isLunas && w.hp) {
            kirimWhatsApp(w.hp, w.nama);
          }
        });
      }
    };

    if (wargaData.length > 0 && Object.keys(settings).length > 0) {
      checkAutomasiWA();
    }
  }, [wargaData, settings, iuranData]);

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
      {/* SOS EMERGENCY OVERLAY */}
      <AnimatePresence>
        {activeEmergency && (
          <SOSOverlay emergency={activeEmergency} onResolve={handleResolveSOS} canResolve={currentUser.role !== 'Viewer'} />
        )}
      </AnimatePresence>

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
        <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Tenant Aktif</p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tight">ID Klien:</p>
            <p className="text-[10px] text-slate-700 font-mono font-bold truncate">{currentUser.tenantId || 'RW26_SMART'}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'warga', label: 'Data Warga', icon: Users },
            { id: 'transaksi', label: 'Transaksi', icon: CreditCard },
            { id: 'posyandu', label: 'Posyandu', icon: Baby },
            { id: 'bank-sampah', label: 'Bank Sampah', icon: Recycle },
            { id: 'etoko', label: 'E-Toko', icon: ShoppingBag },
            { id: 'voting', label: 'E-Pemilu', icon: Vote },
            { id: 'inventaris', label: 'Inventaris Barang', icon: Package },
            { id: 'surat', label: 'Surat Pengantar', icon: FileText },
            { id: 'kop-template', label: 'KOP & Template', icon: FileSpreadsheet },
            { id: 'kas', label: 'Laporan Kas', icon: BookOpen },
            { id: 'users', label: 'Manajemen User', icon: User },
            { id: 'super-admin', label: 'Super Admin', icon: Shield },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
          ].filter(item => {
            if (currentUser?.role === 'BENDAHARA') {
              return ['dashboard', 'transaksi', 'kas', 'bank-sampah'].includes(item.id);
            }
            if (currentUser?.role === 'RT') {
              return ['dashboard', 'warga', 'transaksi', 'posyandu', 'bank-sampah', 'inventaris', 'surat', 'kop-template', 'kas'].includes(item.id);
            }
            if (item.id === 'users' && currentUser?.role !== 'ADMIN' && !currentUser?.isSuperAdmin) return false;
            if (item.id === 'pengaturan' && currentUser?.role !== 'ADMIN' && !currentUser?.isSuperAdmin) return false;
            if (item.id === 'super-admin' && !currentUser?.isSuperAdmin) return false;
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
               <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-100 border border-blue-400 overflow-hidden">
                 {userPhoto ? (
                   <img src={userPhoto} alt={currentUser.name} className="w-full h-full object-cover" />
                 ) : (
                   currentUser.name.charAt(0)
                 )}
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
          {activeTab === 'dashboard' && <DashboardView kasData={kasData} wargaData={wargaData} suratData={suratData} iuranData={iuranData} emergenciesData={emergenciesData} handleTriggerSOS={handleTriggerSOS} userRole={currentUser.role} setActiveTab={setActiveTab} posyanduKegiatanData={posyanduKegiatanData} inventarisData={inventarisData} sampahSetoranData={sampahSetoranData} />}
          {activeTab === 'warga' && <WargaView wargaData={wargaData} setWargaData={setWargaData} userRole={currentUser.role} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          {activeTab === 'transaksi' && <IuranView iuranData={iuranData} setIuranData={setIuranData} kasData={kasData} setKasData={setKasData} wargaData={wargaData} userRole={currentUser.role} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          { activeTab === 'posyandu' && (
            <PosyanduView 
              balitaData={balitaData} setBalitaData={setBalitaData}
              ibuHamilData={ibuHamilData} setIbuHamilData={setIbuHamilData}
              posyanduKegiatanData={posyanduKegiatanData} setPosyanduKegiatanData={setPosyanduKegiatanData}
              pemeriksaanBalitaData={pemeriksaanBalitaData} setPemeriksaanBalitaData={setPemeriksaanBalitaData}
              imunisasiData={imunisasiData} setImunisasiData={setImunisasiData}
              wargaData={wargaData} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'}
              setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification}
            />
          )}
          { activeTab === 'bank-sampah' && (
            <BankSampahView 
              sampahKategoriData={sampahKategoriData}
              sampahSetoranData={sampahSetoranData}
              sampahTarikSaldoData={sampahTarikSaldoData}
              wargaData={wargaData}
              currentUser={currentUser}
              tenantId={currentUser.tenantId || 'RW26_SMART'}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'inventaris' && <InventarisView 
             inventarisData={inventarisData} setInventarisData={setInventarisData} 
             inventarisLogs={inventarisLogs} setInventarisLogs={setInventarisLogs} 
             inventarisKategori={inventarisKategori} inventarisLokasi={inventarisLokasi} inventarisSupplier={inventarisSupplier}
             userRole={currentUser.role} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} 
             setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} 
          />}
          {activeTab === 'surat' && <SuratView suratData={suratData} setSuratData={setSuratData} wargaData={wargaData} usersData={usersData} userRole={currentUser.role} currentUser={currentUser} getSetting={getSetting} kopSettings={kopSettings} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'kop-template' && <KopTemplateManagementView currentUser={currentUser} showNotification={showNotification} handleFirestoreError={handleFirestoreError} />}
          {activeTab === 'kas' && <KasView kasData={kasData} setKasData={setKasData} iuranData={iuranData} setIuranData={setIuranData} wargaData={wargaData} userRole={currentUser.role} currentUser={currentUser} getSetting={getSetting} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />}
          {activeTab === 'users' && <UsersView usersData={usersData} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} tenantId={currentUser.tenantId || 'RW26_SMART'} showNotification={showNotification} />}
          {activeTab === 'super-admin' && <TenantsView tenantsData={tenantsData} isLoadingDB={isLoadingDB} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'pengaturan' && <PengaturanView tenantId={currentUser.tenantId || 'RW26_SMART'} settings={settings} userRole={currentUser.role} showNotification={showNotification} />}
          {activeTab === 'voting' && <EVotingView userRole={currentUser.role} />}
          {activeTab === 'etoko' && <ETokoView userRole={currentUser.role} />}
        </div>
      </main>

      {/* Global Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-green-600' : 
              notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            } text-white min-w-[300px] justify-center`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Info className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PANIC BUTTON (SOS) - BOTTOM RIGHT (NOW DRAGGABLE) */}
      {currentUser && (
        <motion.button 
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
          onClick={handleTriggerSOS}
          disabled={isSOSTriggering}
          className="fixed bottom-6 right-6 z-[60] w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-300 hover:bg-red-700 transition-colors active:scale-90 group ring-4 ring-white cursor-grab touch-none"
          title="TOMBOL DARURAT (SOS)"
        >
          {isSOSTriggering ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Siren className="w-8 h-8 group-hover:animate-pulse" />
          )}
        </motion.button>
      )}

      {/* SOS CONFIRMATION MODAL */}
      <AnimatePresence>
        {isSOSConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border border-red-100"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
                <Siren className="w-12 h-12 text-red-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Kirimi Sinyal Darurat?</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 px-4">
                Tindakan ini akan memberitahukan seluruh pengurus dan warga RW26 secara instan. Gunakan hanya untuk keadaan mendesak.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={confirmSOS}
                   className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-200"
                 >
                   Ya, Kirim SOS Sekarang
                 </button>
                 <button 
                   onClick={() => setIsSOSConfirmOpen(false)}
                   className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                 >
                   Batal
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SOSOverlay({ emergency, onResolve, canResolve }: any) {
  useEffect(() => {
    // Vibration: Urgent pattern
    if (navigator.vibrate) {
      // Repeat long pulses for urgency
      const pattern = Array(24).fill([500, 200]).flat();
      navigator.vibrate(pattern);
    }

    // Audio - Police Siren (Yelp/Wail style)
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    let count = 0;
    const playSiren = () => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Police Yelp Style: Fast frequency sweep
      oscillator.type = 'triangle'; // Richer sound than sine
      oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.25);
      oscillator.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.75);
      oscillator.frequency.linearRampToValueAtTime(500, audioCtx.currentTime + 1.0);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.0);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.0);
    };

    playSiren();
    const interval = setInterval(() => {
      count++;
      if (count < 12) { // Loop 12 times as requested
        playSiren();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      audioCtx.close();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center justify-center p-6 text-white text-center sm:p-12 overflow-hidden"
    >
      {/* Flashing Background Animation */}
      <motion.div 
        animate={{ opacity: [0.7, 1, 0.7] }} 
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-red-700"
      />
      
      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full">
         <motion.div 
           animate={{ scale: [1, 1.2, 1] }} 
           transition={{ repeat: Infinity, duration: 1 }}
           className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md"
         >
            <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-pulse" />
         </motion.div>

         <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase italic">
           Sinyal Darurat Aktif!
         </h1>
         
         <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 rounded-3xl w-full mb-8 shadow-2xl">
            <div className="flex flex-col gap-4 text-left">
               <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                    {emergency.userPhoto ? (
                      <img src={emergency.userPhoto} alt="Reporter" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Nama Pelapor</p>
                    <p className="text-xl sm:text-2xl font-black leading-tight">{emergency.userName}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {emergency.userPhone && (
                        <a 
                          href={`https://wa.me/${emergency.userPhone.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 bg-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/50 hover:bg-green-500/50 transition-colors"
                        >
                          WhatsApp: {emergency.userPhone}
                        </a>
                      )}
                      {emergency.userEmail && (
                        <p className="text-[10px] font-bold opacity-70 bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                          {emergency.userEmail}
                        </p>
                      )}
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Lokasi Kejadian</p>
                    {(emergency.latitude && emergency.longitude) ? (
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${emergency.latitude},${emergency.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-bold truncate underline hover:text-white/80 transition-colors"
                      >
                        {emergency.userLocation} ↗
                      </a>
                    ) : (
                      <p className="text-sm font-bold truncate">{emergency.userLocation}</p>
                    )}
                    {emergency.userAddress && (
                      <p className="text-sm font-black bg-white/20 px-2 py-1 rounded inline-block w-fit uppercase tracking-tight">
                        {emergency.userAddress}
                      </p>
                    )}
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Waktu Terkirim</p>
                    <p className="text-lg font-bold">{new Date(emergency.timestamp).toLocaleTimeString('id-ID')}</p>
                  </div>
               </div>
            </div>
         </div>

         <p className="text-lg sm:text-xl font-bold mb-8 animate-bounce flex items-center gap-2">
           <LifeBuoy className="w-6 h-6" />
           Membutuhkan Pertolongan Segera!
         </p>

         {canResolve && (
            <button 
              onClick={() => onResolve(emergency.id)}
              className="px-10 py-5 bg-white text-red-600 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl"
            >
              Nonaktifkan Sinyal (Masalah Selesai)
            </button>
         )}
         
         <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-widest">
            Sinyal ini terkirim ke seluruh warga RW26 SMART
         </p>
      </div>
    </motion.div>
  );
}

function ETokoView({ userRole }: { userRole: string }) {
  const [view, setView] = useState<'buyer' | 'seller'>('buyer');
  const [products, setProducts] = useState([
    { id: 1, name: 'Beras Premium', price: 65000, stock: 20 },
    { id: 2, name: 'Minyak Goreng', price: 18000, stock: 50 },
    { id: 3, name: 'Gula Pasir', price: 16000, stock: 30 },
  ]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">E-Toko RW 26</h2>
        {userRole === 'ADMIN' && (
          <div className="bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setView('buyer')} className={`px-4 py-2 rounded-lg ${view === 'buyer' ? 'bg-white shadow' : ''}`}>Pembeli</button>
            <button onClick={() => setView('seller')} className={`px-4 py-2 rounded-lg ${view === 'seller' ? 'bg-white shadow' : ''}`}>Penjual</button>
          </div>
        )}
      </div>
      
      {view === 'buyer' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-xl shadow border">
              <h3 className="font-bold">{product.name}</h3>
              <p className="text-sm text-slate-500">Harga: Rp {product.price.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Stok: {product.stock}</p>
              <button className="mt-2 w-full bg-blue-600 text-white rounded-lg py-2">Beli</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="font-bold mb-4">Manajemen Produk (Penjual)</h3>
            <p className="text-slate-500">Fitur penambahan/pengeditan produk akan hadir di sini.</p>
        </div>
      )}
    </div>
  );
}

function EVotingView({ userRole }: { userRole: string }) {
  const [candidates, setCandidates] = useState([
    { id: '1', name: 'Bpk. Ahmad Suhendar', description: 'Berpengalaman dalam administrasi lingkungan.', profile: 'Latar belakang: Mantan ketua RW.', count: 10 },
    { id: '2', name: 'Ibu Siti Aminah', description: 'Fokus pada kesejahteraan keluarga dan kesehatan.', profile: 'Latar belakang: Tenaga medis.', count: 5 },
  ]);
  const [voted, setVoted] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDesc, setNewCandidateDesc] = useState('');
  const [newCandidateProfile, setNewCandidateProfile] = useState('');
  const [newCandidatePhoto, setNewCandidatePhoto] = useState('');
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editProfile, setEditProfile] = useState('');
  const [editPhoto, setEditPhoto] = useState('');
  const [aturanMain, setAturanMain] = useState('1. Pemilih hanya bisa memilih satu calon.\n2. Keputusan berdasarkan suara terbanyak.\n3. Voting bersifat rahasia dan aman.');
  const [isEditingAturan, setIsEditingAturan] = useState(false);
  const [tempAturan, setTempAturan] = useState(aturanMain);

  const totalVotes = candidates.reduce((acc, curr) => acc + curr.count, 0);

  const handleVote = (id: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, count: c.count + 1 } : c));
    setVoted(true);
    setShowConfirm(null);
  };

  const addCandidate = () => {
    if (!newCandidateName) return;
    setCandidates(prev => [...prev, { 
        id: Date.now().toString(), 
        name: newCandidateName, 
        description: newCandidateDesc || 'Calon baru.', 
        profile: newCandidateProfile || 'Belum ada profil.',
        photo: newCandidatePhoto || 'https://via.placeholder.com/150',
        count: 0 
    }]);
    setNewCandidateName('');
    setNewCandidateDesc('');
    setNewCandidateProfile('');
    setNewCandidatePhoto('');
  };

  const deleteCandidate = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  const startEditCandidate = (c: any) => {
      setEditingCandidate(c.id);
      setEditName(c.name);
      setEditDesc(c.description);
      setEditProfile(c.profile);
      setEditPhoto(c.photo || '');
  };

  const saveEditCandidate = (id: string) => {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, name: editName, description: editDesc, profile: editProfile, photo: editPhoto } : c));
      setEditingCandidate(null);
  };

  const saveAturan = () => {
    setAturanMain(tempAturan);
    setIsEditingAturan(false);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black mb-6 text-slate-800 tracking-tighter">E-Pemilu RW 26</h2>
        
        {/* Aturan Main Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Aturan Main Voting</h3>
            {userRole === 'ADMIN' && (
              <button 
                onClick={() => isEditingAturan ? saveAturan() : setIsEditingAturan(true)}
                className={`text-sm font-bold px-3 py-1 rounded-lg ${isEditingAturan ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-600'}`}
              >
                {isEditingAturan ? 'Simpan Aturan' : 'Edit Aturan'}
              </button>
            )}
          </div>
          {isEditingAturan ? (
            <textarea 
              value={tempAturan}
              onChange={(e) => setTempAturan(e.target.value)}
              className="w-full h-32 p-3 border border-slate-300 rounded-lg text-sm text-slate-700"
            />
          ) : (
            <pre className="text-slate-600 text-sm whitespace-pre-wrap font-sans">{aturanMain}</pre>
          )}
        </div>
        
        {userRole === 'ADMIN' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6 flex flex-col gap-2">
            <input 
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              placeholder="Nama calon baru"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <input 
              value={newCandidateDesc}
              onChange={(e) => setNewCandidateDesc(e.target.value)}
              placeholder="Deskripsi singkat"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <textarea 
              value={newCandidateProfile}
              onChange={(e) => setNewCandidateProfile(e.target.value)}
              placeholder="Profil lengkap"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <input 
              value={newCandidatePhoto}
              onChange={(e) => setNewCandidatePhoto(e.target.value)}
              placeholder="URL Foto Calon"
              className="p-2 border border-slate-300 rounded-lg"
            />
            <button onClick={addCandidate} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Tambah Calon</button>
          </div>
        )}
// ... rest of the code ...

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map(c => (
            <div key={c.id} className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex flex-col justify-between">
              {editingCandidate === c.id ? (
                  <div className="flex flex-col gap-2">
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <textarea value={editProfile} onChange={(e) => setEditProfile(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <input value={editPhoto} onChange={(e) => setEditPhoto(e.target.value)} className="p-2 border border-slate-300 rounded-lg"/>
                      <button onClick={() => saveEditCandidate(c.id)} className="bg-green-600 text-white p-2 rounded-lg">Simpan</button>
                  </div>
              ) : (
                <div>
                  <img src={c.photo} alt={c.name} className="w-full h-48 object-cover rounded-xl mb-4" />
                  <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                  <p className="text-slate-600 mb-2 font-medium">{c.description}</p>
                  <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">{c.profile}</p>
                  <div className="bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${totalVotes > 0 ? (c.count / totalVotes) * 100 : 0}%` }} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 mb-4">{c.count} suara ({totalVotes > 0 ? Math.round((c.count / totalVotes) * 100) : 0}%)</p>
                </div>
              )}
              {userRole === 'ADMIN' && (
                  <div className="flex gap-2 mb-4">
                      <button onClick={() => startEditCandidate(c)} className="flex-1 bg-amber-500 text-white py-2 rounded-lg text-xs font-bold">Edit</button>
                      <button onClick={() => deleteCandidate(c.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg text-xs font-bold">Hapus</button>
                  </div>
              )}
              <button
                disabled={voted}
                onClick={() => setShowConfirm(c.id)}
                className={`w-full py-3 rounded-xl font-black uppercase text-sm tracking-widest transition-all ${voted ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
              >
                {voted ? 'Sudah Memilih' : 'Pilih Calon'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full">
            <h3 className="text-xl font-black mb-4">Konfirmasi Pilihan</h3>
            <p className="mb-6">Anda yakin ingin memilih <span className="font-bold">{candidates.find(c => c.id === showConfirm)?.name}</span>?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowConfirm(null)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Batal</button>
              <button onClick={() => handleVote(showConfirm)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Konfirmasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ kasData, wargaData, suratData, iuranData, emergenciesData, handleTriggerSOS, userRole, setActiveTab, posyanduKegiatanData, inventarisData, sampahSetoranData }: { kasData: any[], wargaData: any[], suratData: any[], iuranData: any[], emergenciesData: any[], handleTriggerSOS: () => void, userRole: string, setActiveTab: (tab: string) => void, posyanduKegiatanData: any[], inventarisData: any[], sampahSetoranData: any[] }) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  const [piePeriod, setPiePeriod] = useState('30days');

  const activeSOS = emergenciesData?.find(e => e.status === 'ACTIVE');

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
    ...suratData.map(s => ({ 
      date: s.tanggal, 
      title: `Surat: ${s.jenisSurat || s.jenis || s.keperluan || 'Pengantar'}`, 
      desc: `Pemohon: ${s.pemohon}`, 
      type: 'doc', 
      status: s.status 
    })),
    ...posyanduKegiatanData.map(p => ({
      date: p.tanggal,
      title: 'Posyandu',
      desc: p.keterangan || 'Kegiatan Posyandu',
      type: 'info'
    })),
    ...inventarisData.map(i => ({
      date: i.updatedAt || new Date().toISOString(),
      title: 'Inventaris',
      desc: i.nama_barang || 'Perubahan Inventaris',
      type: 'info'
    })),
    ...sampahSetoranData.map(s => ({
      date: s.tanggal,
      title: 'Bank Sampah',
      desc: `${s.namaNasabah}: ${s.berat}kg`,
      type: 'in'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* EXTREME SOS ALERT CARD (Modeled after reference) */}
      <AnimatePresence>
        {activeSOS && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-6 text-white shadow-2xl shadow-red-200 border border-red-400 relative overflow-hidden group">
               {/* Flashing background accent */}
               <motion.div 
                 animate={{ opacity: [0, 0.4, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5 }}
                 className="absolute inset-0 bg-white"
               />
               
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse backdrop-blur-md">
                        <Siren className="w-8 h-8 text-white" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">
                          Sinyal Darurat Diaktifkan!
                        </h2>
                        <p className="text-red-50 font-medium text-sm">
                          Lokasi: <span className="font-bold underline">{activeSOS.userName} ({activeSOS.userLocation})</span>
                        </p>
                        <p className="text-red-100/80 text-[10px] mt-1 italic font-bold">
                          • Segera hubungi pihak berwajib atau datangi lokasi.
                        </p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto">
                     <button 
                       onClick={() => setActiveTab('dashboard')} // Refresh or just scroll to focus
                       className="flex-1 md:flex-none px-6 py-3 bg-white text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95 transition-all"
                     >
                       Cek Lokasi
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <button 
          onClick={handleTriggerSOS}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform ring-2 ring-red-100">
            <Siren className="w-5 h-5 text-red-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">SOS Darurat</span>
        </button>
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
          onClick={() => setActiveTab('bank-sampah')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Recycle className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Bank Sampah</span>
        </button>
        <button 
          onClick={() => setActiveTab('posyandu')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5 text-pink-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Posyandu</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventaris')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5 text-violet-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Inventaris</span>
        </button>
        <button 
          onClick={() => setActiveTab('surat')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Surat</span>
        </button>
        <button 
          onClick={() => setActiveTab('voting')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Vote className="w-5 h-5 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">E-Pemilu</span>
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

function WargaView({ wargaData, setWargaData, userRole, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification }: { wargaData: any[], setWargaData: any, userRole: string, tenantId: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
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
          console.error("CSV Merge Error (Warga):", error);
          showNotification("Gagal mengimpor data warga. Pastikan format CSV benar.", 'error');
        }
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedData = async (data: any[]) => {
    const newData = data.map((row: any) => ({
      tenantId: tenantId,
      nama: row['Nama Lengkap'] || row['nama'] || "",
      nik: row['NIK'] || row['nik'] || "",
      kk: row['No. KK'] || row['no_kk'] || row['kk'] || "",
      rt: row['RT'] || row['rt'] || "01",
      rw: row['RW'] || row['rw'] || "05",
      blok: row['Alamat'] || row['alamat'] || row['blok'] || "",
      status: row['Status Warga'] || row['status'] || "Warga Tetap",
      hp: row['No. HP'] || row['hp'] || "",
      email: row['Email'] || row['email'] || "",
      foto: row['Foto Profil'] || row['foto'] || "",
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
          await setDoc(doc(db, 'data_warga', item.nik), item);
        }
        setWargaData((prev: any) => [...prev, ...newData]);
        showNotification(`Berhasil mengimpor ${newData.length} data warga.`, 'success');
      } catch (error: any) {
        console.error("Firebase Import Error:", error);
        showNotification("Gagal sinkronisasi data ke Firebase: " + error.message, 'error');
      }
    } else {
      showNotification("Tidak ada data valid yang ditemukan.", 'info');
    }
  };

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI"
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
      showNotification("NIK harus terdiri dari tepat 16 digit angka.", 'error');
      return;
    }
    
    const newWarga = { ...formData, tenantId: tenantId, tglDaftar: new Date().toISOString().split('T')[0] };
    
    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'data_warga', newWarga.nik), newWarga);
      setShowAddForm(false);
      resetForm();
      showNotification("Data warga berhasil ditambahkan!", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/data_warga/${newWarga.nik}`);
      showNotification("Gagal menambahkan data warga.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.nik && formData.nik.length !== 16) {
      showNotification("NIK harus terdiri dari tepat 16 digit angka.", 'error');
      return;
    }

    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'data_warga', editingWarga.nik), { ...formData, tenantId: tenantId });
      setShowEditForm(false);
      setEditingWarga(null);
      resetForm();
      showNotification("Perubahan data warga berhasil disimpan!", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/data_warga/${editingWarga.nik}`);
      showNotification("Gagal memperbarui data warga.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    
    setIsDeletingWarga(true);
    try {
      await deleteDoc(doc(db, 'data_warga', wargaToDelete.nik));
      setWargaData((prev: any) => prev.filter((w: any) => w.nik !== wargaToDelete.nik));
      setWargaToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/warga/${wargaToDelete.nik}`);
      showNotification("Gagal menghapus data warga.", 'error');
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
      nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI"
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
          Data Warga
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
                  <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                    {warga.foto ? (
                      <img src={warga.foto} alt={warga.nama} className="w-full h-full object-cover" />
                    ) : warga.ktpUrl ? (
                      <img src={warga.ktpUrl} alt="KTP" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
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
                      {(userRole === 'ADMIN' || userRole === 'RT' || userRole === 'Admin') && (
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

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Pendidikan Terakhir</label>
                <select required name="pendidikanTerakhir" value={formData.pendidikanTerakhir} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="">Pilih Pendidikan Terakhir</option>
                  <option value="Belum Sekolah">Belum Sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
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
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono" placeholder="nama@email.com" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Jalur/Blok)</label>
                <input required name="blok" value={formData.blok} onChange={handleInputChange} type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="A/01" />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Foto Profil (Opsional)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const url = await handleFileUpload(file, 'profil_warga');
                            setFormData(prev => ({ ...prev, foto: url }));
                          } catch (err) {
                            showNotification("Gagal mengunggah foto profil.", 'error');
                          }
                        }
                      }} 
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer w-full"
                    />
                    {formData.foto && (
                      <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden shrink-0">
                        <img src={formData.foto} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Foto KTP (Opsional)</label>
                  <div className="flex items-center gap-3">
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
                            showNotification("Gagal mengunggah foto KTP.", 'error');
                          }
                        }
                      }} 
                      className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer w-full"
                    />
                    {(formData as any).ktpUrl && (
                      <div className="w-8 h-8 rounded border border-slate-200 overflow-hidden shrink-0">
                        <img src={(formData as any).ktpUrl} className="w-full h-full object-cover opacity-50" alt="Preview KTP" />
                      </div>
                    )}
                  </div>
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
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                    {viewWarga.foto ? (
                      <img src={viewWarga.foto} alt={viewWarga.nama} className="w-full h-full object-cover" />
                    ) : viewWarga.ktpUrl ? (
                      <img src={viewWarga.ktpUrl} alt="KTP" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <User className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">{viewWarga.nama}</h2>
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
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Email</p>
                    <p className="font-medium text-slate-800">{viewWarga.email || '-'}</p>
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

function PaymentModal({ amount, onClose, onConfirm }: { amount: number, onClose: () => void, onConfirm: (method: string) => void }) {
  const [method, setMethod] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl">
        <h3 className="text-2xl font-black mb-2 text-slate-800">Pembayaran Digital</h3>
        <p className="text-slate-600 mb-6">Total Tagihan: <span className="font-bold text-blue-600">Rp {amount.toLocaleString()}</span></p>
        
        <div className="space-y-3 mb-8">
          <button onClick={() => setMethod('QRIS')} className={`w-full p-4 border rounded-xl flex items-center justify-between ${method === 'QRIS' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <span className="font-bold">QRIS (E-Wallet)</span>
            <div className={`w-5 h-5 rounded-full border-2 ${method === 'QRIS' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
          </button>
          <button onClick={() => setMethod('VA')} className={`w-full p-4 border rounded-xl flex items-center justify-between ${method === 'VA' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
            <span className="font-bold">Virtual Account (Bank)</span>
            <div className={`w-5 h-5 rounded-full border-2 ${method === 'VA' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`} />
          </button>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Batal</button>
          <button 
            disabled={!method}
            onClick={() => onConfirm(method)} 
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50"
          >
            Bayar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

function IuranView(f_params) {
  const { iuranData, setIuranData, kasData, setKasData, wargaData = [], userRole, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification } = f_params;
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrx, setEditingTrx] = useState<any>(null);
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [trxToDelete, setTrxToDelete] = useState<any>(null);
  const [isDeletingTrx, setIsDeletingTrx] = useState(false);
  const [strukUrl, setStrukUrl] = useState("");
  const [showPaymentId, setShowPaymentId] = useState<string | null>(null);
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
      showNotification("Data berhasil dihapus dari sistem.", 'success');
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
          console.error("CSV Merge Error (Iuran):", error);
          showNotification("Gagal mengimpor data transaksi. Pastikan format CSV benar.", 'error');
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
      tenantId: tenantId,
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
        showNotification(`Berhasil mengimpor ${newData.length} data transaksi.`, 'success');
      } catch (error: any) {
        console.error("Firebase Import Error (Iuran):", error);
        handleFirestoreError(error, 'create', '/iuran/import');
        showNotification("Gagal sinkronisasi data iuran ke Firebase.", 'error');
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      showNotification("Tidak ada data transaksi valid yang ditemukan.", 'info');
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
    const warga = wargaData.find(w => w.nama === nama);
    const rt = warga?.rt || "";

    const newPayment = {
      tenantId: tenantId,
      id: transactionId,
      rt: rt,
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
        showNotification("Data berhasil diperbarui.", 'success');
      } else {
        await setDoc(doc(db, 'iuran', newPayment.id), newPayment);
        
        // Also record to Kas if NEW transaction
        const newKasEntry = {
          tenantId: tenantId,
          id: `TRX-${Date.now()}`,
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
        showNotification(`${trxType === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'} berhasil dicatat.`, 'success');
      }
    } catch (error: any) {
      console.error("Firebase operation error:", error);
      handleFirestoreError(error, editingTrx ? 'update' : 'create', `/iuran/${editingTrx?.id || 'new'}`);
      showNotification(`Gagal menyimpan data ${trxType}.`, 'error');
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
    doc.text(`Laporan Transaksi RW 26 ${new Date().toLocaleDateString('id-ID')}`, 14, 15);
    
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
              <button 
                onClick={() => { setTrxType('Masuk'); setShowAddForm(true); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
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
              {/* Modal Pembayaran */}
              {showPaymentId === trx.id && (
                <PaymentModal 
                  amount={trx.nominal} 
                  onClose={() => setShowPaymentId(null)}
                  onConfirm={(method) => {
                    showNotification(`Memproses pembayaran via ${method} untuk ${trx.nama}...`, 'info');
                    setShowPaymentId(null);
                  }}
                />
              )}
                
                <td className="px-6 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {trx.status !== 'Lunas' && (
                      <button 
                        onClick={() => setShowPaymentId(trx.id)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all shadow-sm active:scale-95 text-[10px] font-bold uppercase"
                      >
                        Bayar
                      </button>
                    )}
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
                              showNotification("ID Transaksi tidak ditemukan, tidak bisa menghapus.", 'error');
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Jenis Transaksi
                  </label>
                  <select name="transaksi" defaultValue={editingTrx?.transaksi} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Iuran Rutin Warga">Iuran Rutin Warga</option>
                    <option value="Iuran Partisipasi Pembangunan">Iuran Partisipasi Pembangunan</option>
                    <option value="Dana Kelurahan/Pemerintah">Dana Kelurahan/Pemerintah</option>
                    <option value="Donasi & Bantuan Sosial">Donasi & Bantuan Sosial</option>
                    <option value="Sponsorship & Donatur">Sponsorship & Donatur</option>
                    <option value="Hasil Usaha RT/RW">Hasil Usaha RT/RW</option>
                    <option value="Lainnya">Lainnya...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Nama Penyetor
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
                          showNotification("Gagal mengunggah struk.", 'error');
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

function SuratView({ suratData, setSuratData, wargaData = [], usersData = [], userRole, currentUser, getSetting, kopSettings, tenantId, setIsLoadingDB, handleFirestoreError, showNotification }: { suratData: any[], setSuratData: any, wargaData?: any[], usersData?: any[], userRole: string, currentUser: any, getSetting: (k: string) => any, kopSettings: any, tenantId: string, setIsLoadingDB: any, handleFirestoreError: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [showSuratForm, setShowSuratForm] = useState(false);
  const [editingSurat, setEditingSurat] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const toRoman = (num: number) => {
    const map: any = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let roman = '';
    for (let i in map) {
      while (num >= map[i]) {
        roman += i;
        num -= map[i];
      }
    }
    return roman;
  };

  const getAutoNomorSurat = (rt: string, rw: string) => {
    const year = new Date().getFullYear();
    const month = toRoman(new Date().getMonth() + 1);
    const lastCount = suratData.length + 1;
    const num = `${lastCount}`.padStart(3, '0');
    return `${num}/RT.${rt}/RW.${rw}/${month}/${year}`;
  };

  const getPejabat = (rt: string, rw: string) => {
    // Mencari Ketua RT dan Ketua RW dari usersData
    const kRT = usersData.find(u => u.role === 'RT' && u.rt === rt)?.nama || "";
    const kRW = usersData.find(u => u.role === 'RW')?.nama || "";
    return { ketuaRT: kRT, ketuaRW: kRW };
  };

  const handleSearchWarga = (term: string) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const results = wargaData.filter(w => 
        w.nama?.toLowerCase().includes(term.toLowerCase()) || 
        w.nik?.includes(term)
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

    const { ketuaRT, ketuaRW } = getPejabat(warga.rt || "", warga.rw || "");
    const nomorOtomatis = getAutoNomorSurat(warga.rt || "000", warga.rw || "000");

    setVal('pemohon', warga.nama);
    setVal('nik', warga.nik);
    setVal('ttl', `${warga.tempatLahir}, ${warga.tglLahir}`);
    setVal('jk', warga.jk);
    setVal('agama', warga.agama || 'Islam');
    setVal('pekerjaan', warga.profesi);
    setVal('statusKawin', warga.kawin);
    setVal('alamat', `${warga.blok}, RT ${warga.rt} / RW ${warga.rw}`);
    setVal('rt', warga.rt);
    setVal('rw', warga.rw);
    setVal('kelurahan', warga.kelurahan);
    setVal('kecamatan', warga.kecamatan);
    setVal('kota_kab', warga.kota_kab);
    setVal('kk', warga.kk);
    setVal('kewarganegaraan', warga.kewarganegaraan || 'WNI');
    setVal('nomor_surat', nomorOtomatis);
    setVal('ketua', ketuaRT);
    setVal('ketua_rw_nama', ketuaRW); // Temporary field to pass RW name
    
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSetujui = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Selesai", tenantId: tenantId });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Selesai" } : s));
      showNotification("Pengajuan surat telah disetujui.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
      showNotification("Gagal menyetujui pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleTolak = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { status: "Ditolak", tenantId: tenantId });
      setSuratData((prev: any[]) => prev.map(s => s.id === id ? { ...s, status: "Ditolak" } : s));
      showNotification("Pengajuan surat telah ditolak.", 'info');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
      showNotification("Gagal menolak pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengajuan surat ini?")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'surat', id));
      setSuratData((prev: any[]) => prev.filter(s => s.id !== id));
      showNotification("Pengajuan surat berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/surat/${id}`);
      showNotification("Gagal menghapus pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleEdit = (surat: any) => {
    setEditingSurat(surat);
    setShowSuratForm(true);
    // Note: Population of form will be handled via useEffect in the form component or a setup effect
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
          <title>Cetak Surat - ${surat.nomor_surat || surat.id}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body { 
              font-family: 'Times New Roman', Times, serif; 
              padding: 0; 
              margin: 0; 
              line-height: 1.5; 
              color: #000;
              background: #fff;
            }
            .page {
              width: 210mm;
              height: 297mm;
              margin: 0 auto;
              background: white;
            }
            .header { 
              display: flex; 
              align-items: center; 
              border-bottom: 5px double #000; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .header-info {
              text-align: center;
              flex-grow: 1;
              padding-right: 80px; /* Adjust for logo balance */
            }
            .header h1 { font-size: 16pt; margin: 0; text-transform: uppercase; }
            .header h2 { font-size: 13pt; margin: 2px 0; text-transform: uppercase; }
            .header h3 { font-size: 11pt; margin: 2px 0; text-transform: uppercase; }
            .header p { font-size: 10pt; margin: 2px 0; }
            
            .title-box { text-align: center; margin: 20px 0; }
            .title { font-size: 14pt; font-weight: bold; text-decoration: underline; text-transform: uppercase; margin: 0; }
            .nomor { font-size: 11pt; margin-top: 5px; }

            .content { font-size: 11pt; padding: 0 10px; }
            .content p { text-align: justify; margin: 10px 0; text-indent: 40px; }
            .content .intro { text-indent: 0; }

            .details { width: 100%; margin: 15px 0; border-collapse: collapse; }
            .details td { padding: 3px 0; vertical-align: top; }
            .details td:first-child { width: 180px; }
            .details td:nth-child(2) { width: 20px; text-align: center; }
            .details strong { font-weight: bold; }

            .footer { margin-top: 40px; }
            .signatures { display: flex; justify-content: space-between; padding: 0 20px; }
            .signature-box { text-align: center; min-width: 200px; }
            .signature-box p { margin: 2px 0; font-size: 11pt; }
            .spacer { height: 70px; }
            
            .archive-area { 
              margin-top: 50px; 
              border-top: 1px solid #000; 
              padding-top: 10px; 
              font-size: 9pt; 
            }
            .archive-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
            .checkbox-group { display: flex; align-items: center; gap: 5px; margin-top: 5px; }
            .checkbox { width: 12px; height: 12px; border: 1px solid #000; }

            @media print {
              body, .page { width: auto; height: auto; margin: 0; padding: 0; }
              .page { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="header">
              ${kopSettings.logo_url ? `<img src="${kopSettings.logo_url}" crossorigin="anonymous" style="width: 80px; height: 80px; margin-right: 15px; object-fit: contain; display: block;" />` : '<div style="width: 80px;"></div>'}
              <div class="header-info">
                <h1>${kopSettings.nama_rt || 'RUKUN TETANGGA / RUKUN WARGA'}</h1>
                <h2>KELURAHAN ${kopSettings.kelurahan?.toUpperCase() || '...........'} - KECAMATAN ${kopSettings.kecamatan?.toUpperCase() || '...........'}</h2>
                <h3>${kopSettings.kabupaten?.toUpperCase() || 'KABUPATEN BEKASI'}</h3>
                <p>Sekretariat: ${kopSettings.alamat || '................................................'} | Telp: ${kopSettings.telepon || '...'} | Email: ${kopSettings.email || '...'}</p>
              </div>
            </div>
            
            <div class="title-box">
              <p class="title"><u>SURAT PENGANTAR</u></p>
              <p class="nomor">Nomor: ${surat.nomor_surat || '.../RT.../RW.../.../...'}</p>
            </div>

            <div class="content">
              <p class="intro">Yang bertanda tangan di bawah ini menerangkan bahwa:</p>
              
              <table class="details">
                <tr><td>Nama Lengkap</td><td>:</td><td><strong>${surat.pemohon}</strong></td></tr>
                <tr><td>NIK</td><td>:</td><td>${surat.nik || '-'}</td></tr>
                <tr><td>No. KK</td><td>:</td><td>${surat.kk || '-'}</td></tr>
                <tr><td>Tempat, Tgl Lahir</td><td>:</td><td>${surat.ttl || '-'}</td></tr>
                <tr><td>Jenis Kelamin</td><td>:</td><td>${surat.jk || '-'}</td></tr>
                <tr><td>Agama</td><td>:</td><td>${surat.agama || '-'}</td></tr>
                <tr><td>Pekerjaan</td><td>:</td><td>${surat.pekerjaan || '-'}</td></tr>
                <tr><td>Status Perkawinan</td><td>:</td><td>${surat.statusKawin || '-'}</td></tr>
                <tr><td>Alamat</td><td>:</td><td>${surat.alamat || '-'}</td></tr>
                <tr><td>Keperluan</td><td>:</td><td>${surat.keperluan || '-'}</td></tr>
              </table>

              <p>Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
            </div>

            <div class="footer">
              <div class="signatures">
                <div class="signature-box">
                  <p>Mengetahui,</p>
                  <p>Ketua RW ${surat.rw || kopSettings.rw || '....'}</p>
                  <div class="spacer"></div>
                  <p><strong>( ${surat.ketua_rw_nama || kopSettings.nama_ketua_rw || '...................................'} )</strong></p>
                </div>
                <div class="signature-box">
                  <p>${kopSettings.kabupaten || 'Bekasi'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>Ketua RT ${surat.rt || kopSettings.rt || '....'}</p>
                  <div class="spacer"></div>
                  <p><strong>( ${surat.ketua || kopSettings.nama_ketua_rt || '...................................'} )</strong></p>
                </div>
              </div>
            </div>

          </div>
          <script>
            function checkImages() {
              const images = document.getElementsByTagName('img');
              let loadedCount = 0;
              if (images.length === 0) {
                window.print();
                return;
              }
              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  loadedCount++;
                } else {
                  images[i].addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === images.length) window.print();
                  });
                  images[i].addEventListener('error', () => {
                    loadedCount++;
                    if (loadedCount === images.length) window.print();
                  });
                }
              }
              if (loadedCount === images.length) {
                window.print();
              }
            }
            window.onload = checkImages;
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

    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Auto Id (SRT-100X)
    const newId = `SRT-${Date.now()}`;
    
    const isEditing = !!editingSurat;
    const suratId = isEditing ? editingSurat.id : `SRT-${Date.now()}`;
    
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const nAuto = (suratData.length + 1).toString().padStart(3, '0');
    const newNomorSurat = `${nAuto}/RT.${formData.get('rt') || '00'}/RW.${formData.get('rw') || '00'}/${mm}/${yyyy}`;

    const { ketuaRT, ketuaRW } = getPejabat(formData.get('rt') as string || "", formData.get('rw') as string || "");

    const suratDataPayload = {
      tenantId: tenantId,
      id: suratId,
      tanggal: isEditing ? editingSurat.tanggal : formattedDate,
      rt_user: formData.get('rt') as string || "01",
      nama_rt: kopSettings.nama_rt || "Rukun Tetangga",
      ketua: formData.get('ketua') as string || ketuaRT,
      ketua_rw_nama: formData.get('ketua_rw_nama') as string || ketuaRW,
      nomor_surat: formData.get('nomor_surat') as string || newNomorSurat,
      pemohon: formData.get('pemohon') as string,
      nik: formData.get('nik') as string,
      kk: formData.get('kk') as string,
      ttl: formData.get('ttl') as string,
      umur: formData.get('umur') as string || '',
      jk: formData.get('jk') as string,
      kewarganegaraan: formData.get('kewarganegaraan') as string,
      pekerjaan: formData.get('pekerjaan') as string,
      agama: formData.get('agama') as string,
      statusKawin: formData.get('statusKawin') as string,
      alamat: formData.get('alamat') as string,
      rt: formData.get('rt') as string || '',
      rw: formData.get('rw') as string || '',
      kelurahan: formData.get('kelurahan') as string || '',
      kecamatan: formData.get('kecamatan') as string || '',
      keperluan: formData.get('keperluan') as string,
      jenisSurat: formData.get('jenisSurat') as string,
      status: isEditing ? editingSurat.status : "Diajukan"
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'surat', suratId), suratDataPayload);
      if (isEditing) {
        setSuratData((prev: any[]) => prev.map(s => s.id === suratId ? suratDataPayload : s));
        showNotification("Pengajuan surat berhasil diperbarui.", 'success');
      } else {
        setSuratData([suratDataPayload, ...suratData]);
        showNotification("Pengajuan surat berhasil dikirim.", 'success');
      }
      setShowSuratForm(false);
      setEditingSurat(null);
      formRef.current?.reset();
    } catch (error: any) {
      handleFirestoreError(error, isEditing ? 'update' : 'create', `/surat/${suratId}`);
      showNotification("Gagal menyimpan pengajuan surat.", 'error');
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
          <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">ID Pengajuan</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4 text-left">Pemohon</th>
              <th className="px-6 py-4 text-left">Jenis</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {suratData.length > 0 ? suratData.map((surat) => (
              <tr key={surat.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{surat.id.substring(0, 10)}</td>
                <td className="px-6 py-4 text-[11px] whitespace-nowrap">{surat.tanggal}</td>
                <td className="px-6 py-4 text-[11px] font-bold text-slate-800">{surat.pemohon}</td>
                <td className="px-6 py-4 text-[11px] font-medium text-slate-600 whitespace-nowrap">{surat.jenisSurat}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-md border ${
                    surat.status === 'Selesai' ? 'border-green-200 bg-green-50 text-green-700' : 
                    surat.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' :
                    'border-orange-200 bg-orange-50 text-orange-700'
                  }`}>
                    {surat.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {userRole !== 'Viewer' && surat.status === 'Diajukan' && (
                    <>
                      <button onClick={() => handleSetujui(surat.id)} className="text-[10px] font-bold text-green-700 hover:bg-green-100 transition-colors cursor-pointer bg-green-50 px-3 py-1.5 rounded border border-green-200">
                        Setujui
                      </button>
                      <button onClick={() => handleTolak(surat.id)} className="text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer bg-red-50 px-3 py-1.5 rounded border border-red-200">
                        Tolak
                      </button>
                    </>
                  )}
                  {userRole !== 'Viewer' && (
                    <button onClick={() => handleEdit(surat)} className="text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer bg-blue-50 p-2 rounded border border-blue-200" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {surat.status === 'Selesai' && (
                    <button onClick={() => handleCetak(surat.id)} className="text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 p-2 rounded transition-colors cursor-pointer" title="Cetak Surat">
                      <Printer className="w-3.5 h-3.5" />
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
                {editingSurat ? "Edit Surat Pengantar" : "Buat Surat Pengantar"}
              </h3>
              <button onClick={() => {setShowSuratForm(false); setEditingSurat(null);}} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {showSuratForm && (
              <script dangerouslySetInnerHTML={{ __html: `
                (function() {
                  const form = document.querySelector('form');
                  if (!form) return;
                  const editingSurat = ${JSON.stringify(editingSurat)};
                  if (editingSurat) {
                    Object.keys(editingSurat).forEach(key => {
                      const el = form.elements.namedItem(key);
                      if (el) el.value = editingSurat[key];
                    });
                  } else {
                    form.reset();
                  }
                })();
              `}} />
            )}
            <form ref={formRef} onSubmit={handleAddSurat} className="p-5 overflow-y-auto space-y-5">
              {/* Seksi 1: Identitas Pribadi */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  Data Pemohon
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Cari Nama Pemohon</label>
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => handleSearchWarga(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" 
                    placeholder="Ketik nama atau NIK warga..." 
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border border-slate-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {searchResults.map((w: any) => (
                        <button
                          key={w.nik}
                          type="button"
                          onClick={() => {
                            autoFillForm(w);
                            setSearchTerm("");
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm border-b last:border-b-0"
                        >
                          {w.nama} - {w.nik}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nama Lengkap</label>
                  <input name="pemohon" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Nama Lengkap" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor NIK</label>
                    <input name="nik" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="NIK" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor KK</label>
                    <input name="kk" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="Nomor KK" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Tempat, Tgl Lahir</label>
                        <input name="ttl" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kota, DD-MM-YYYY" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Umur</label>
                        <input name="umur" type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Umur" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Kelamin</label>
                    <select name="jk" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Warga Negara</label>
                    <select name="kewarganegaraan" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="WNI">WNI</option>
                      <option value="WNA">WNA</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Pekerjaan</label>
                    <input name="pekerjaan" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Pekerjaan" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Agama</label>
                    <select name="agama" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
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
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kelurahan</label>
                    <input name="kelurahan" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kelurahan" defaultValue="Sukamaju" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Kecamatan</label>
                    <input name="kecamatan" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Kecamatan" defaultValue="Sukajaya" />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 mb-1">Status Perkawinan</label>
                    <select name="statusKawin" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all">
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                </div>
              </div>

              {/* Seksi 2: Alamat */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <div className="w-1 h-3 bg-blue-600 rounded-full"></div>
                  Alamat
                </h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Alamat</label>
                  <input name="alamat" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Alamat" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">RT</label>
                      <select name="rt" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono">
                        {Array.from({ length: 50 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">RW</label>
                      <select name="rw" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono">
                        {Array.from({ length: 50 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Nomor Surat</label>
                    <input name="nomor_surat" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="Otomatis..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Jenis Surat</label>
                    <select name="jenisSurat" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold cursor-pointer">
                      <option value="SURAT PENGANTAR">SURAT PENGANTAR</option>
                      <option value="SURAT KETERANGAN DOMISILI">SURAT KETERANGAN DOMISILI</option>
                      <option value="SURAT PENGANTAR SKCK">SURAT PENGANTAR SKCK</option>
                      <option value="SURAT KETERANGAN USAHA">SURAT KETERANGAN USAHA</option>
                      <option value="SURAT KETERANGAN TIDAK MAMPU (SKTM)">SURAT KETERANGAN TIDAK MAMPU (SKTM)</option>
                      <option value="LAINNYA">LAINNYA...</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ketua RT (Nama TTD)</label>
                    <input name="ketua" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Nama Ketua RT" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ketua RW (Nama TTD)</label>
                    <input name="ketua_rw_nama" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Nama Ketua RW" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Keperluan</label>
                  <textarea name="keperluan" rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Tuliskan keperluan surat di sini..."></textarea>
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

function KasView({ kasData, setKasData, iuranData, setIuranData, wargaData = [], userRole, currentUser, getSetting, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification }: { kasData: any[], setKasData: any, iuranData: any[], setIuranData: any, wargaData?: any[], userRole: string, currentUser: any, getSetting: (k: string) => any, tenantId: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [showMasukForm, setShowMasukForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [strukUrl, setStrukUrl] = useState("");
  const [trxType, setTrxType] = useState<'Masuk' | 'Keluar'>('Masuk');
  
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
      showNotification("Catatan kas berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/kas/${kasToDelete.id}`);
      showNotification("Gagal menghapus catatan kas.", 'error');
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
    let nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    
    // Auto nominal from settings if zero
    if (nominal === 0 && trxType === 'Masuk') {
      const defaultNominal = parseInt(getSetting("NOMINAL_IURAN").replace(/\D/g, '') || "0");
      if (defaultNominal) nominal = defaultNominal;
    }
    
    const transaksi = formData.get('transaksi') as string;
    
    const newTrx = {
      tenantId: tenantId,
      id: newId,
      tanggal: formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: formData.get('nama') as string,
      alamat: formData.get('alamat') as string || "-",
      keterangan: formData.get('keterangan') as string,
      debit: trxType === 'Masuk' ? nominal : 0,
      kredit: trxType === 'Keluar' ? nominal : 0,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'kas', newId), newTrx);

      // Sync with IuranData if applicable
      if (trxType === 'Masuk' && (transaksi === 'Iuran Warga')) {
        const formattedDateTime = formattedDate + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
        const newIuran = {
          tenantId: tenantId,
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
      showNotification(`${trxType === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'} berhasil disimpan.`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'create', `/kas/${newId}`);
      showNotification(`Gagal menyimpan catatan ${trxType}.`, 'error');
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
            {/* Action buttons removed as requested */}
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
              {/* Tipe Transaksi Selector */}
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button 
                  type="button"
                  onClick={() => setTrxType('Masuk')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${trxType === 'Masuk' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  Pemasukan
                </button>
                <button 
                  type="button"
                  onClick={() => setTrxType('Keluar')}
                  className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${trxType === 'Keluar' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}
                >
                  Pengeluaran
                </button>
              </div>

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
                          showNotification("Gagal mengunggah struk.", 'error');
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
                <button type="submit" className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-all ${trxType === 'Masuk' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Simpan {trxType}
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

function PengaturanView({ tenantId, settings, userRole, showNotification }: { tenantId: string, settings: any, userRole: string, showNotification: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userRole !== 'ADMIN') {
      showNotification("Hanya Admin yang dapat mengubah pengaturan.", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const newSettings: Record<string, string> = {};
    formData.forEach((value, key) => {
      newSettings[key] = value as string;
    });

    try {
      await setDoc(doc(db, 'settings', tenantId), newSettings, { merge: true });
      showNotification("Pengaturan berhasil disimpan.", "success");
    } catch (error) {
      console.error(error);
      showNotification("Gagal menyimpan pengaturan.", "error");
    } finally {
      setIsSaving(false);
    }
  };

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
            tenantId: tenantId,
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
          batch.set(doc(db, 'data_warga', wId), newWarga);
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
            tenantId: tenantId,
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
            tenantId: tenantId,
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
            tenantId: tenantId,
            id: iuranId,
            rt: RandomWarga.rt,
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
          tenantId: tenantId,
          id: suratId,
          rt: RandomWarga.rt,
          tanggal: formattedDate,
          jenis: jSurat,
          pemohon: RandomWarga.nama,
          status: i % 5 === 0 ? 'Draft' : (i % 7 === 0 ? 'Ditolak' : 'Selesai'),
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
      {/* Pengaturan Utama */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
            <Settings className="w-4 h-4 mr-2 text-blue-600" />
            Pengaturan Sistem
          </h3>
          {userRole === 'ADMIN' && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">Mode Editor</span>
          )}
        </div>
        
        <form onSubmit={handleSaveSettings} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Informasi RT</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nama RT (Label)</label>
              <input name="NAMA_RT" defaultValue={settings.NAMA_RT} placeholder="Contoh: RT 01 Merdeka" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nama Ketua RT</label>
              <input name="NAMA_KETUA" defaultValue={settings.NAMA_KETUA} placeholder="Contoh: Bpk. H. Ahmad" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nominal Iuran Rutin (Rp)</label>
              <input name="NOMINAL_IURAN" defaultValue={settings.NOMINAL_IURAN} type="number" placeholder="50000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold text-green-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Konfigurasi WhatsApp</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Status Integrasi</label>
              <select name="STATUS_WA" defaultValue={settings.STATUS_WA || "Nonaktif"} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold">
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Token API / WA Gateway</label>
              <input name="TOKEN_WA" defaultValue={settings.TOKEN_WA} type="password" placeholder="••••••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Template Pesan ({'{nama}'} otomatis)</label>
              <textarea name="TEMPLATE_WA" defaultValue={settings.TEMPLATE_WA} rows={3} placeholder="Halo {nama}, iuran bulan ini belum lunas..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all" />
            </div>
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-50 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving || userRole !== 'ADMIN'}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>

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

  const handleSubmit = async (e: React.FormEvent, quickEmail?: string, quickPass?: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const targetEmail = quickEmail || email;
      const targetPass = quickPass || password;

      // Logic for easy demo: if user types "admin" and not an email, append a domain
      let finalEmail = targetEmail;
      if (!targetEmail.includes('@')) {
        finalEmail = `${targetEmail}@rw26.com`;
      }
      
      await signInWithEmailAndPassword(auth, finalEmail, targetPass);
    } catch (err: any) {
      console.error("Login Error:", err);
      // ... same error logic
      let msg = `Gagal masuk (${err.code}). Periksa kembali email dan password Anda.`;
      
      if (err.code === 'auth/user-not-found') {
        msg = 'PENGGUNA TIDAK DITEMUKAN: Silakan daftarkan email ini di Firebase Console.';
      } else if (err.code === 'auth/wrong-password') {
        msg = 'PASSWORD SALAH: Password tidak sesuai.';
      } else if (err.code === 'auth/invalid-credential') {
        msg = 'KREDENSIAL TIDAK VALID: Email atau password salah.';
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
             
             <div className="mt-8 pt-6 border-t border-slate-100">
               <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Demo Quick Login</p>
               <div className="grid grid-cols-1 gap-2">
                 <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'arifrajcoach@gmail.com', '4R1f080162')} className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800">SUPER ADMIN</button>
                 <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'admin@rw26.com', 'admin123')} className="w-full bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">ADMIN</button>
                 <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'operator@rw26.com', 'operator123')} className="w-full bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">OPERATOR</button>
                 <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'warga@rw26.com', 'warga123')} className="w-full bg-slate-100 text-slate-700 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">VIEWER</button>
               </div>
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

function UsersView({ usersData, setIsLoadingDB, handleFirestoreError, tenantId, showNotification }: { usersData: any[], setIsLoadingDB: any, handleFirestoreError: any, tenantId: string, showNotification: (m: string, t?: any) => void }) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id_user = editingUser ? editingUser.uid || editingUser.id_user : `USR-${Date.now()}`;
    
    const userData = {
      id_user,
      nama: formData.get('nama') as string,
      name: formData.get('nama') as string, // Legacy compatibility
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as "ADMIN" | "RW" | "RT" | "BENDAHARA" | "SEKRETARIS",
      rt: formData.get('rt') as string,
      nik: formData.get('nik') as string,
      status: formData.get('status') as "AKTIF" | "NONAKTIF",
      tenantId,
      created_at: editingUser?.created_at || new Date().toISOString()
    };

    if (!userData.username || !userData.role) {
      showNotification("Username dan Role wajib diisi!", 'error');
      return;
    }

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'users', id_user), userData);
      setShowForm(false);
      setEditingUser(null);
      showNotification(`Data pengguna ${editingUser ? 'diperbarui' : 'ditambahkan'}!`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, editingUser ? 'update' : 'create', `/users/${id_user}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Hapus pengguna ${user.nama || user.name}?`)) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'users', user.uid || user.id_user));
      showNotification("User berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/users/${user.uid || user.id_user}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
              Manajemen Pengguna & Pemetaan Unit
            </h3>
            <button 
              onClick={() => { setEditingUser(null); setShowForm(true); }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah User
            </button>
         </div>
         
         <div className="overflow-x-auto border border-slate-100 rounded-lg">
           <table className="w-full text-left border-collapse border-transparent">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Pengguna</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Peran</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">RT</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">NIK</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {usersData.length === 0 && (
                 <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic text-xs">Belum ada data pengguna</td>
                 </tr>
               )}
               {usersData.map((user) => (
                 <tr key={user.uid || user.id_user} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-4 py-3">
                     <p className="text-xs font-bold text-slate-700">{user.nama || user.name}</p>
                   </td>
                   <td className="px-4 py-3">
                     <p className="text-[10px] text-slate-500 font-medium font-mono">{user.username || user.email?.split('@')[0]}</p>
                   </td>
                   <td className="px-4 py-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === 'ADMIN' || user.role === 'RW' ? 'bg-red-50 text-red-600 border-red-100' :
                        user.role === 'RT' || user.role === 'SEKRETARIS' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-green-50 text-green-600 border-green-100'
                      }`}>{user.role || 'GUEST'}</span>
                   </td>
                   <td className="px-4 py-3 text-center">
                     <p className="text-[11px] text-slate-600 font-bold font-mono">{user.rt || '-'}</p>
                   </td>
                   <td className="px-4 py-3">
                     <p className="text-[11px] text-slate-600 font-bold font-mono">{user.nik || user.nikMapping || '-'}</p>
                   </td>
                   <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        user.status === 'AKTIF' || !user.status ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {user.status || 'AKTIF'}
                      </span>
                   </td>
                   <td className="px-4 py-3 text-right">
                     <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditingUser(user); setShowForm(true); }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>

       {showForm && (
         <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
            >
               <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {editingUser ? <Edit className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                     </div>
                     <h3 className="font-bold text-slate-800">{editingUser ? 'Edit User' : 'Tambah User baru'}</h3>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-1.5 hover:text-red-500 rounded-lg bg-white border border-slate-200 transition-colors"><X className="w-4 h-4" /></button>
               </div>
               <form className="p-6 space-y-4" onSubmit={handleSaveUser}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nama Lengkap</label>
                      <input type="text" name="nama" required defaultValue={editingUser?.nama || editingUser?.name || ''} placeholder="Contoh: Bpk. Budi Santoso" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Username</label>
                      <input type="text" name="username" required defaultValue={editingUser?.username || ''} placeholder="user123" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" required={!editingUser} defaultValue={editingUser?.password || ''} placeholder="******" className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Peran (Role)</label>
                      <select name="role" defaultValue={editingUser?.role || 'RT'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold">
                         <option value="ADMIN">ADMIN</option>
                         <option value="RW">RW</option>
                         <option value="RT">RT</option>
                         <option value="BENDAHARA">BENDAHARA</option>
                         <option value="SEKRETARIS">SEKRETARIS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nomor RT</label>
                      <input type="text" name="rt" defaultValue={editingUser?.rt || ''} placeholder="Contoh: 01" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">NIK (Optional)</label>
                      <input type="text" name="nik" defaultValue={editingUser?.nik || editingUser?.nikMapping || ''} placeholder="16 Digit NIK" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Status</label>
                      <select name="status" defaultValue={editingUser?.status || 'AKTIF'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold">
                         <option value="AKTIF">AKTIF</option>
                         <option value="NONAKTIF">NONAKTIF</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-slate-500 font-black uppercase text-[10px] tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                    <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Simpan Pengguna</button>
                  </div>
               </form>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function TenantsView({ tenantsData, isLoadingDB, setIsLoadingDB, handleFirestoreError, showNotification }: { tenantsData: any[], isLoadingDB: boolean, setIsLoadingDB: any, handleFirestoreError: any, showNotification: any }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tenantId = formData.get('id') as string;
    const name = formData.get('name') as string;
    const email = formData.get('adminEmail') as string;
    const password = formData.get('adminPassword') as string;
    const phone = formData.get('adminPhone') as string;
    const paket = formData.get('status') as string;
    const rtCount = parseInt(formData.get('rtCount') as string || "1");

    if (!editingTenant && (!password || password.length < 6)) {
      showNotification("Password admin minimal 6 karakter.", "error");
      return;
    }

    // Limit calculation based on package
    let maxWarga = 50;
    if (paket === 'Active') maxWarga = 200; // Basic
    if (paket === 'Pro') maxWarga = 1000;

    const tenant = {
      id: tenantId,
      name: name,
      address: formData.get('address') as string,
      adminEmail: email,
      status: paket,
      maxWarga,
      rtTarget: rtCount,
      createdAt: editingTenant ? editingTenant.createdAt : new Date().toISOString()
    };

    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);

      // 1. Setup Tenant Doc
      batch.set(doc(db, 'tenants', tenant.id), tenant);

      // 2. Auto Setup Admin User (Only on creation)
      if (!editingTenant) {
        const userId = `ADM-${Date.now()}`;
        batch.set(doc(db, 'users', userId), {
          id_user: userId,
          nama: `Admin ${name}`,
          name: `Admin ${name}`,
          username: email.split('@')[0],
          email: email,
          password: password, // In production, this should be handled by Firebase Auth create
          role: 'ADMIN',
          tenantId: tenantId,
          rt: "01",
          status: "AKTIF",
          hp: phone,
          created_at: new Date().toISOString()
        });

        // 3. Auto Setup Default Settings
        batch.set(doc(db, 'settings', tenantId), {
          NAMA_RT: name,
          NAMA_KETUA: "-",
          NOMINAL_IURAN: "50000",
          STATUS_WA: "Nonaktif",
          TEMPLATE_WA: "Halo {nama}, ini pengingat iuran Anda dari pengurus RW/RT. Mohon untuk segera melakukan pembayaran. Terima kasih.",
          TOKEN_WA: ""
        });
      }

      await batch.commit();
      
      showNotification(`Tenant ${name} berhasil ${editingTenant ? 'diperbarui' : 'didaftarkan'}!`, "success");
      setShowAddForm(false);
      setEditingTenant(null);
    } catch (error: any) {
      handleFirestoreError(error, 'write', `/tenants/${tenant.id}`);
      showNotification("Gagal menyimpan data tenant.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!confirm("Hapus tenant ini? Semua data terkait di rules akan terputus.")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'tenants', id));
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/tenants/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
               <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Manajemen Tenant (Client RW/RT)</h3>
              <p className="text-sm text-slate-500">Ekosistem Multi-Tenant RW 26 Smart System.</p>
            </div>
          </div>
          <button 
            onClick={() => { setEditingTenant(null); setShowAddForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Tenant Baru
          </button>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail Tenant</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Utama</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {tenantsData.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic text-sm">Belum ada tenant terdaftar.</td>
                  </tr>
                )}
                {tenantsData.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                             <Database className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-800">{tenant.name}</p>
                             <p className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded inline-block">ID: {tenant.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-600 font-bold">{tenant.adminEmail || '-'}</p>
                       <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{tenant.address || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border ${
                         tenant.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                         tenant.status === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                         'bg-slate-50 text-slate-700 border-slate-200'
                       }`}>
                         {tenant.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 text-[10px] uppercase font-black tracking-widest">
                          <button onClick={() => { setEditingTenant(tenant); setShowAddForm(true); }} className="px-3 py-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100">Edit</button>
                          <button onClick={() => handleDeleteTenant(tenant.id)} className="px-3 py-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-100">Hapus</button>
                       </div>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
         </div>
       </div>

       {showAddForm && (
         <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
            >
               <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">{editingTenant ? 'Edit Tenant' : 'Daftarkan Tenant Baru'}</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
               </div>
               <form className="p-8 grid grid-cols-2 gap-5 overflow-y-auto max-h-[80vh]" onSubmit={handleSaveTenant}>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                       <Database className="w-4 h-4 text-blue-600" />
                       <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">Identitas Klien</label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">ID Klien (Unique ID)</label>
                        <input name="id" defaultValue={editingTenant?.id} readOnly={!!editingTenant} required placeholder="Contoh: RT01_WARGA" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold text-blue-600" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nama Organisasi</label>
                        <input name="name" defaultValue={editingTenant?.name} required placeholder="Contoh: RT 01 / RW 26" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700" />
                      </div>
                    </div>
                  </div>

                  {!editingTenant && (
                    <div className="col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                         <Shield className="w-4 h-4 text-blue-600" />
                         <label className="text-[11px] font-black uppercase text-blue-600 tracking-widest block">Setup Admin Utama</label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <input name="adminEmail" required type="email" placeholder="Email Admin" className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm" />
                        </div>
                        <div>
                          <input name="adminPassword" required type="password" placeholder="Password Admin (Min 6 Karakter)" className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input name="adminPhone" required placeholder="No. HP Admin" className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingTenant && (
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Email Admin RW/RT</label>
                      <input name="adminEmail" defaultValue={editingTenant?.adminEmail} type="email" placeholder="admin@rt01.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-medium text-slate-700" />
                    </div>
                  )}

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Paket Sistem</label>
                    <select name="status" defaultValue={editingTenant?.status || 'Trial'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                       <option value="Trial">Trial (Max 50 Warga)</option>
                       <option value="Active">Basic (Max 200 Warga)</option>
                       <option value="Pro">Professional (Max 1000 Warga)</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Target Jumlah RT</label>
                    <input name="rtCount" type="number" defaultValue={editingTenant?.rtTarget || 5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Alamat / Keterangan Lokasi</label>
                    <textarea name="address" defaultValue={editingTenant?.address} rows={2} placeholder="Alamat lengkap organisasi..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>

                  <div className="col-span-2 flex gap-4 mt-2">
                     <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all border border-slate-200">Batal</button>
                     <button type="submit" disabled={isLoadingDB} className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300">
                        {isLoadingDB ? 'Memproses...' : (editingTenant ? 'Simpan Perubahan' : 'Daftarkan & Setup Tenant')}
                     </button>
                  </div>
               </form>
            </motion.div>
         </div>
       )}
    </div>
  );
}

function PosyanduView({ 
  balitaData, setBalitaData, 
  ibuHamilData, setIbuHamilData, 
  posyanduKegiatanData, setPosyanduKegiatanData, 
  pemeriksaanBalitaData, setPemeriksaanBalitaData, 
  imunisasiData, setImunisasiData,
  wargaData, currentUser, tenantId, setIsLoadingDB, handleFirestoreError, showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'balita' | 'ibuhamil' | 'kegiatan' | 'timeline' | 'ibuhamil_detail'>('dashboard');
  const [showBalitaForm, setShowBalitaForm] = useState(false);
  const [showIbuHamilForm, setShowIbuHamilForm] = useState(false);
  const [showKegiatanForm, setShowKegiatanForm] = useState(false);
  const [showPemeriksaanForm, setShowPemeriksaanForm] = useState(false);
  const [showImunisasiForm, setShowImunisasiForm] = useState(false);
  const [selectedBalita, setSelectedBalita] = useState<any>(null);
  const [selectedIbuHamil, setSelectedIbuHamil] = useState<any>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefIbuHamil = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of (data as any[])) {
          const nik = row['NIK'] || row['nik'] || row['Nik'] || row['NIK Anak'];
          const nama = row['Nama'] || row['nama'] || row['Nama Anak'];
          
          if (nik && nama) {
            const id = `BAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newBalita = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglLahir: row['Tgl Lahir'] || row['Tanggal Lahir'] || row['tgl_lahir'] || new Date().toISOString().split('T')[0],
              jenisKelamin: row['Jenis Kelamin'] || row['L/P'] || row['jenis_kelamin'] || 'L',
              namaIbu: row['Nama Ibu'] || row['nama_ibu'] || '',
              namaAyah: row['Nama Ayah'] || row['nama_ayah'] || '',
              rt: row['RT'] || row['rt'] || '01',
              rw: row['RW'] || row['rw'] || '01',
              bbLahir: parseFloat(row['BB Lahir'] || row['bb_lahir'] || '0'),
              pbLahir: parseFloat(row['PB Lahir'] || row['pb_lahir'] || '0')
            };
            
            await setDoc(doc(db, 'posyandu_balita', id), newBalita);
            successCount++;
          }
        }
        
        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data balita berhasil diimpor!`);
        } else {
          showNotification("Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.", "error");
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportIbuHamilExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of (data as any[])) {
          const nik = row['NIK'] || row['nik'] || row['NIK Ibu'];
          const nama = row['Nama'] || row['nama'] || row['Nama Ibu Hamil'];
          
          if (nik && nama) {
            const id = `HML-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newIbuHamil = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglHPL: row['Tgl HPL'] || row['HPL'] || row['tgl_hpl'] || new Date().toISOString().split('T')[0],
              usiaKehamilan: parseFloat(row['Usia Hamil'] || row['Usia Kehamilan'] || row['usia_kehamilan'] || '0'),
              riwayatKesehatan: row['Riwayat Kesehatan'] || row['Kesehatan'] || '',
              rt: row['RT'] || row['rt'] || '01',
              rw: row['RW'] || row['rw'] || '01',
            };
            
            await setDoc(doc(db, 'ibu_hamil', id), newIbuHamil);
            successCount++;
          }
        }
        
        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data ibu hamil berhasil diimpor!`);
        } else {
          showNotification("Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.", "error");
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRefIbuHamil.current) fileInputRefIbuHamil.current.value = '';
  };

  const exportPosyanduPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LAPORAN BULANAN POSYANDU', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);
    
    // Balita Table
    const tableData = balitaData.map((b: any) => [
      b.nama,
      b.jk,
      calculateAgeMonths(b.tglLahir) + " Bln",
      b.namaOrangTua,
      b.statusStunting
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Nama Balita', 'JK', 'Usia', 'Wali', 'Status Gizi']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] }
    });

    doc.save(`Laporan_Posyandu_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Laporan PDF berhasil diunduh!");
  };

  const exportKegiatanPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('JADWAL & AGENDA POSYANDU', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 30);
    
    const tableData = posyanduKegiatanData.map((k: any) => [
      formatTgl(k.tanggal),
      k.lokasi,
      k.keterangan || '-',
      k.kaderId?.split('@')[0] || '-'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Tanggal', 'Lokasi', 'Keterangan', 'Petugas']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }
    });

    doc.save(`Jadwal_Posyandu_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Jadwal PDF berhasil diunduh!");
  };

  const exportKegiatanExcel = () => {
    const ws = XLSX.utils.json_to_sheet(posyanduKegiatanData.map((k: any) => ({
      'Tanggal': formatTgl(k.tanggal),
      'Lokasi': k.lokasi,
      'Keterangan': k.keterangan || '-',
      'Petugas': k.kaderId?.split('@')[0] || '-'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal Posyandu");
    XLSX.writeFile(wb, `Jadwal_Posyandu_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Jadwal Excel berhasil diunduh!");
  };

  const exportPosyanduExcel = () => {
    const ws = XLSX.utils.json_to_sheet(balitaData.map((b: any) => ({
      'Nama Balita': b.nama,
      'Jenis Kelamin': b.jk,
      'Usia (Bulan)': calculateAgeMonths(b.tglLahir),
      'Nama Orang Tua': b.namaOrangTua,
      'Status Gizi': b.statusStunting,
      'NIK': b.nik
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Balita");
    XLSX.writeFile(wb, `Laporan_Posyandu_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Laporan Excel berhasil diunduh!");
  };

  const exportBalitaKardPDF = (balita: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('KARTU KESEHATAN ANAK (BALITA)', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Nama Anak: ${balita.nama}`, 14, 32);
    doc.text(`NIK: ${balita.nik || '-'}`, 14, 38);
    doc.text(`Jenis Kelamin: ${balita.jk}`, 14, 44);
    doc.text(`Tanggal Lahir: ${formatTgl(balita.tglLahir)}`, 14, 50);
    doc.text(`Nama Ibu: ${balita.namaIbu || balita.namaOrangTua || '-'}`, 14, 56);
    doc.text(`Status Gizi: ${balita.statusStunting || 'Normal'}`, 14, 62);

    const history = [
      ...pemeriksaanBalitaData.filter((p: any) => p.balitaId === balita.id).map((p: any) => [
        formatTgl(p.tanggal),
        'Pemeriksaan',
        `BB: ${p.beratBadan}kg, TB: ${p.tinggiBadan}cm`,
        p.pemeriksa || '-'
      ]),
      ...imunisasiData.filter((i: any) => i.balitaId === balita.id).map((i: any) => [
        formatTgl(i.tanggal),
        'Imunisasi',
        i.jenisImunisasi,
        'Posyandu'
      ])
    ].sort((a: any, b: any) => b[0].localeCompare(a[0]));

    autoTable(doc, {
      startY: 70,
      head: [['Tanggal', 'Tipe', 'Keterangan', 'Petugas']],
      body: history,
      theme: 'grid',
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] }
    });

    doc.save(`Kartu_Kesehatan_${balita.nama}.pdf`);
    showNotification("Kartu Kesehatan berhasil diunduh!");
  };

  const exportIbuHamilKardPDF = (mil: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('KARTU KESEHATAN IBU HAMIL', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Nama Ibu: ${mil.nama}`, 14, 32);
    doc.text(`NIK: ${mil.nik}`, 14, 38);
    doc.text(`Usia Kehamilan: ${mil.usiaKehamilan} Minggu`, 14, 44);
    doc.text(`Estimasi HPL: ${formatTgl(mil.tglHPL)}`, 14, 50);
    doc.text(`Catatan: ${mil.riwayatKesehatan || '-'}`, 14, 56);

    autoTable(doc, {
      startY: 65,
      head: [['Keterangan', 'Detail']],
      body: [
        ['Nama Ibu', mil.nama],
        ['NIK', mil.nik],
        ['Usia Hamil', `${mil.usiaKehamilan} Minggu`],
        ['Estimasi HPL', formatTgl(mil.tglHPL)],
        ['Lokasi', `RT ${mil.rt} / RW ${mil.rw}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] }
    });

    doc.save(`Kesehatan_IbuHamil_${mil.nama}.pdf`);
    showNotification("Kartu Kesehatan berhasil diunduh!");
  };

  const formatTgl = (tgl: string) => {
    if (!tgl) return "-";
    try {
      return new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return tgl;
    }
  };

  const calculateAgeMonths = (tglLahir: string) => {
    if (!tglLahir) return 0;
    const birth = new Date(tglLahir);
    const today = new Date();
    return (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  };

  const determineGiziStatus = (bb: number, tb: number, jk: string, ageMonths: number) => {
    // Simplified growth logic based on typical WHO mean
    // This is a rough estimation for UX purposes
    if (!bb || !tb) return "Data Belum Lengkap";
    
    // Example: BB for 12 months (Normal is roughly 7-11kg for boys, 6.5-10kg for girls)
    // We can use a simple BB/TB ratio or simple age-based thresholds
    const bmi = bb / ((tb / 100) * (tb / 100));
    
    if (bmi < 13) return "Gizi Kurang / Kurus";
    if (bmi > 18) return "Risiko Gizi Lebih / Gemuk";
    
    // Check height for age (stunting indicator)
    const minHeight = ageMonths * 1.5 + 45; // very rough linear approx
    if (tb < minHeight * 0.85) return "Tinggi Kurang (Risiko Stunting)";
    
    return "Normal";
  };

  const handleSaveBalita = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || `BLT-${Date.now()}`;
    
    const nikOrangTua = formData.get('orangTuaId') as string;
    const orangTua = wargaData.find((w: any) => w.nik === nikOrangTua);

    const data = {
      id,
      tenantId,
      nama: formData.get('nama'),
      tglLahir: formData.get('tglLahir'),
      jk: formData.get('jk'),
      orangTuaId: nikOrangTua,
      namaOrangTua: orangTua?.nama || formData.get('namaOrangTua'),
      alamat: orangTua?.blok || formData.get('alamat'),
      rt: orangTua?.rt || formData.get('rt'),
      rw: orangTua?.rw || formData.get('rw'),
      statusStunting: formData.get('statusStunting') || 'Normal'
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'balita', id), data);
      showNotification(`Data Balita ${editingItem ? 'diperbarui' : 'ditambahkan'}!`);
      setShowBalitaForm(false);
      setEditingItem(null);
    } catch (err) { handleFirestoreError(err, 'write', 'balita'); }
    finally { setIsLoadingDB(false); }
  };

  const handleSaveIbuHamil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || `MIL-${Date.now()}`;
    
    const nik = formData.get('nik') as string;
    const warga = wargaData.find((w: any) => w.nik === nik);

    const data = {
      id,
      tenantId,
      nik,
      nama: warga?.nama || formData.get('nama'),
      tglHPL: formData.get('tglHPL'),
      usiaKehamilan: parseInt(formData.get('usiaKehamilan') as string || "0"),
      riwayatKesehatan: formData.get('riwayatKesehatan'),
      rt: warga?.rt || formData.get('rt'),
      rw: warga?.rw || formData.get('rw')
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'ibu_hamil', id), data);
      showNotification(`Data Ibu Hamil ${editingItem ? 'diperbarui' : 'ditambahkan'}!`);
      setShowIbuHamilForm(false);
      setEditingItem(null);
    } catch (err) { handleFirestoreError(err, 'write', 'ibu_hamil'); }
    finally { setIsLoadingDB(false); }
  };

  const handleSaveKegiatan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || `KGT-${Date.now()}`;
    
    const data = {
      id, tenantId,
      tanggal: formData.get('tanggal'),
      lokasi: formData.get('lokasi'),
      kaderId: currentUser.email,
      keterangan: formData.get('keterangan')
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'posyandu_kegiatan', id), data);
      showNotification("Kegiatan Posyandu disimpan!");
      setShowKegiatanForm(false);
      setEditingItem(null);
    } catch (err) { handleFirestoreError(err, 'write', 'posyandu_kegiatan'); }
    finally { setIsLoadingDB(false); }
  };

  const handleSavePemeriksaan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `PMK-${Date.now()}`;
    
    const bb = parseFloat(formData.get('beratBadan') as string);
    const tb = parseFloat(formData.get('tinggiBadan') as string);
    const balita = balitaData.find((b: any) => b.id === selectedBalita.id);
    const ageMonths = calculateAgeMonths(balita.tglLahir);

    const data = {
      id, tenantId,
      balitaId: selectedBalita.id,
      kegiatanId: selectedKegiatan?.id || "",
      tanggal: formData.get('tanggal'),
      beratBadan: bb,
      tinggiBadan: tb,
      lingkarKepala: parseFloat(formData.get('lingkarKepala') as string || "0"),
      statusGizi: determineGiziStatus(bb, tb, balita.jk, ageMonths),
      catatan: formData.get('catatan')
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'pemeriksaan_balita', id), data);
      showNotification("Hasil pemeriksaan berhasil dicatat!");
      setShowPemeriksaanForm(false);
    } catch (err) { handleFirestoreError(err, 'write', 'pemeriksaan'); }
    finally { setIsLoadingDB(false); }
  };

  const handleSaveImunisasi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `IMU-${Date.now()}`;
    
    const data = {
      id, tenantId,
      balitaId: selectedBalita.id,
      jenisImunisasi: formData.get('jenisImunisasi'),
      tanggal: formData.get('tanggal'),
      status: formData.get('status') || 'Selesai'
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'imunisasi', id), data);
      showNotification("Catatan imunisasi disimpan!");
      setShowImunisasiForm(false);
    } catch (err) { handleFirestoreError(err, 'write', 'imunisasi'); }
    finally { setIsLoadingDB(false); }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!confirm("Hapus data ini?")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, col, id));
      showNotification("Data berhasil dihapus.");
    } catch (err) { handleFirestoreError(err, 'delete', col); }
    finally { setIsLoadingDB(false); }
  };

  // Dashboard Stats
  const stats = {
    totalBalita: balitaData.length,
    ibuHamil: ibuHamilData.length,
    posyanduTerakhir: posyanduKegiatanData.sort((a: any, b: any) => b.tanggal.localeCompare(a.tanggal))[0],
    stuntingCount: balitaData.filter((b: any) => b.statusStunting === 'Stunting').length,
    risikoStunting: balitaData.filter((b: any) => b.statusStunting === 'Risiko Stunting').length
  };

  const exportIbuHamilExcel = () => {
    const data = ibuHamilData.map(mil => ({
      'Nama': mil.nama,
      'NIK': mil.nik,
      'Usia Hamil (Minggu)': mil.usiaKehamilan,
      'HPL': mil.tglHPL,
      'Riwayat Kesehatan': mil.riwayatKesehatan || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monitor Ibu Hamil");
    XLSX.writeFile(wb, `Data_Ibu_Hamil_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Data Excel berhasil diunduh!");
  };

  const exportIbuHamilPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('MONITOR IBU HAMIL', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);
    
    const tableData = ibuHamilData.map((mil: any) => [
      mil.nama,
      mil.nik,
      mil.usiaKehamilan + " Minggu",
      formatTgl(mil.tglHPL),
      mil.riwayatKesehatan || '-'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Nama', 'NIK', 'Usia Hamil', 'HPL', 'Kesehatan']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] }
    });

    doc.save(`Monitor_Ibu_Hamil_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Laporan PDF berhasil diunduh!");
  };

  const exportBalitaExcel = () => {
    const data = balitaData.map(b => ({
      'Nama Balita': b.nama,
      'NIK': b.nik || '-',
      'Jenis Kelamin': b.jk,
      'Tgl Lahir': b.tglLahir,
      'Usia (Bulan)': calculateAgeMonths(b.tglLahir),
      'Orang Tua': b.namaOrangTua,
      'Alamat': `Blok ${b.alamat} / RT ${b.rt}`,
      'Status Gizi': b.statusStunting || 'Normal'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Balita");
    XLSX.writeFile(wb, `Data_Balita_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Data Excel Balita berhasil diunduh!");
  };

  const exportBalitaPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('DATA BALITA POSYANDU', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);
    
    const tableData = balitaData.map((b: any) => [
      b.nama,
      calculateAgeMonths(b.tglLahir) + " Bulan",
      b.namaOrangTua,
      b.statusStunting || 'Normal'
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Nama Balita', 'Usia', 'Orang Tua', 'Status Gizi']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] }
    });

    doc.save(`Data_Balita_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Laporan PDF Balita berhasil diunduh!");
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
            <Baby className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Posyandu</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manajemen Kesehatan Ibu & Anak</p>
          </div>
        </div>
        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'balita', label: 'Balita', icon: Users },
            { id: 'ibuhamil', label: 'Ibu Hamil', icon: HeartPulse },
            { id: 'kegiatan', label: 'Kegiatan', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeSubTab === tab.id ? 'bg-white text-pink-600 shadow-sm border border-pink-100' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Balita</p>
              <p className="text-2xl font-black text-slate-800">{stats.totalBalita}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Ibu Hamil</p>
              <p className="text-2xl font-black text-pink-600">{stats.ibuHamil}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm">
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest mb-1">Kasus Stunting</p>
              <p className="text-2xl font-black text-red-700">{stats.stuntingCount}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Risiko Stunting</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-orange-700">{stats.risikoStunting}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                Status Gizi Balita
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Normal', count: balitaData.filter(b => b.statusStunting === 'Normal').length },
                    { name: 'Risiko', count: stats.risikoStunting },
                    { name: 'Stunting', count: stats.stuntingCount }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="count" radius={[4,4,0,0]}>
                      { [0,1,2].map((i) => <Cell key={i} fill={i === 0 ? '#10b981' : i === 1 ? '#f59e0b' : '#ef4444'} />) }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Jadwal Posyandu Terakhir / Mendatang
              </h3>
              {stats.posyanduTerakhir ? (
                <div className="flex-1 flex flex-col justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
                  <p className="text-xl font-black text-slate-800">{formatTgl(stats.posyanduTerakhir.tanggal)}</p>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tight">{stats.posyanduTerakhir.lokasi}</p>
                  <div className="mt-4 flex gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-200">
                      Petugas: {stats.posyanduTerakhir.kaderId?.split('@')[0]}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">Belum ada kegiatan dijadwalkan.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'balita' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari balita..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-pink-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportExcel}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                  title="Impor Database (Excel/CSV)"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button 
                  onClick={exportBalitaPDF}
                  className="p-1.5 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Export PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={exportBalitaExcel}
                  className="p-1.5 bg-white border border-slate-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  title="Export Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => { setEditingItem(null); setShowBalitaForm(true); }}
              className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-700 flex items-center gap-2 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Daftar Balita
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Nama Balita</th>
                  <th className="px-6 py-4">Tgl Lahir / Usia</th>
                  <th className="px-6 py-4">Orang Tua</th>
                  <th className="px-6 py-4">Status Gizi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {balitaData.filter(b => b.nama.toLowerCase().includes(searchQuery.toLowerCase())).map(balita => {
                  const age = calculateAgeMonths(balita.tglLahir);
                  return (
                    <tr key={balita.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">{balita.nama}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black">{balita.jk}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-600">{formatTgl(balita.tglLahir)}</p>
                        <p className="text-[10px] text-pink-600 font-bold">{age} Bulan</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-slate-600">{balita.namaOrangTua}</p>
                        <p className="text-[10px] text-slate-400">Blok {balita.alamat} / RT {balita.rt}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                          balita.statusStunting === 'Normal' ? 'bg-green-50 text-green-600 border-green-100' :
                          balita.statusStunting === 'Risiko Stunting' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {balita.statusStunting}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => exportBalitaKardPDF(balita)}
                             className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors border border-transparent hover:border-pink-100" title="Download Kartu Kesehatan (PDF)"
                           >
                              <FileText className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => { setEditingItem(balita); setShowBalitaForm(true); }}
                             className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit"
                           >
                              <Edit className="w-4 h-4" />
                           </button>
                           <button onClick={() => deleteItem('balita', balita.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'timeline' && selectedBalita && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
                  {selectedBalita.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedBalita.nama}</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                    {selectedBalita.jk} • {calculateAgeMonths(selectedBalita.tglLahir)} Bulan • {formatTgl(selectedBalita.tglLahir)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Anak dari: {selectedBalita.namaOrangTua}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportBalitaKardPDF(selectedBalita)}
                  className="p-2 text-pink-600 hover:text-pink-700 bg-pink-50 rounded-xl transition-all"
                  title="Download Kartu Kesehatan (PDF)"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setActiveSubTab('balita')}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
               <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-3xl text-white shadow-xl shadow-pink-100 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30">
                      <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Digital Health Card</h3>
                    <p className="text-sm text-pink-100 font-medium max-w-xs mb-8">Kartu kesehatan digital ini berisi informasi lengkap pertumbuhan dan riwayat imunisasi anak.</p>
                    <button 
                      onClick={() => exportBalitaKardPDF(selectedBalita)} 
                      className="w-full py-4 bg-white text-pink-600 rounded-2xl font-black hover:bg-pink-50 transition-all shadow-lg uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Download className="w-5 h-5" /> Generate PDF
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                      <Scale className="w-3 h-3" /> Quick Actions
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setShowPemeriksaanForm(true)}
                        className="flex-1 py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-2 border border-blue-100"
                      >
                        <Scale className="w-6 h-6" />
                        Update BB/TB
                      </button>
                      <button 
                        onClick={() => setShowImunisasiForm(true)}
                        className="flex-1 py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex flex-col items-center justify-center gap-2 border border-emerald-100"
                      >
                        <HeartPulse className="w-6 h-6" />
                        Register Imunisasi
                      </button>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-slate-200">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Gizi Saat Ini</p>
                      <p className="text-2xl font-black">{selectedBalita.statusStunting || 'Normal'}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedBalita.statusStunting === 'Risiko Stunting' ? 'bg-orange-500' : selectedBalita.statusStunting === 'Stunting' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ibuhamil_detail' && selectedIbuHamil && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
                  {selectedIbuHamil.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedIbuHamil.nama}</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                    NIK: {selectedIbuHamil.nik} • {selectedIbuHamil.usiaKehamilan} Minggu
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">HPL (Perkiraan): {formatTgl(selectedIbuHamil.tglHPL)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => exportIbuHamilKardPDF(selectedIbuHamil)}
                  className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 rounded-xl transition-all"
                  title="Cetak Kartu Kesehatan Hamil (PDF)"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setActiveSubTab('ibuhamil')}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
               <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-100 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/30">
                      <HeartPulse className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-widest">Pregnancy Health Card</h3>
                    <p className="text-sm text-blue-100 font-medium max-w-xs mb-8">Dokumen ringkasan kesehatan ibu hamil dan perkiraan kelahiran (HPL) siap untuk dicetak.</p>
                    <button 
                      onClick={() => exportIbuHamilKardPDF(selectedIbuHamil)} 
                      className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Download className="w-5 h-5" /> Download Digital Card
                    </button>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="bg-pink-600 p-8 rounded-3xl text-white shadow-xl shadow-pink-100 relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-20">
                      <HeartPulse className="w-24 h-24" />
                    </div>
                    <h4 className="text-lg font-black leading-tight mb-1">Status Kehamilan</h4>
                    <p className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80 mb-6">Trimester {selectedIbuHamil.usiaKehamilan <= 12 ? 'I' : selectedIbuHamil.usiaKehamilan <= 24 ? 'II' : 'III'}</p>
                    
                    <div className="w-full bg-pink-400/30 h-3 rounded-full mb-3">
                       <div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000" style={{ width: `${Math.min((selectedIbuHamil.usiaKehamilan / 42) * 100, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                       <span className="bg-white/20 px-2 py-0.5 rounded">{selectedIbuHamil.usiaKehamilan} Minggu</span>
                       <span className="opacity-60">Target: 42 Minggu</span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Catatan Riwayat</p>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 font-medium leading-relaxed italic">
                      "{selectedIbuHamil.riwayatKesehatan || 'Belum ada catatan medis khusus.'}"
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'ibuhamil' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari ibu hamil..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-pink-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={fileInputRefIbuHamil} 
                  className="hidden" 
                  accept=".xlsx,.xls,.csv"
                  onChange={handleImportIbuHamilExcel}
                />
                <button 
                  onClick={() => fileInputRefIbuHamil.current?.click()} 
                  className="p-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" 
                  title="Impor Database (Excel/CSV)"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button 
                  onClick={exportIbuHamilPDF}
                  className="p-1.5 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Export PDF"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button 
                  onClick={exportIbuHamilExcel}
                  className="p-1.5 bg-white border border-slate-200 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  title="Export Excel"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => { setEditingItem(null); setShowIbuHamilForm(true); }}
              className="px-4 py-2 bg-pink-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-pink-100 hover:bg-pink-700 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Daftar Ibu Hamil
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Usia Hamil</th>
                  <th className="px-6 py-4">HPL (Perkiraan)</th>
                  <th className="px-6 py-4">Kesehatan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ibuHamilData.filter((mil: any) => mil.nama.toLowerCase().includes(searchQuery.toLowerCase())).map((mil: any) => (
                  <tr key={mil.id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-800">{mil.nama}</p>
                       <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">NIK: {mil.nik}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-black text-pink-600">{mil.usiaKehamilan} Minggu</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">
                       {formatTgl(mil.tglHPL)}
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs text-slate-500 max-w-[200px] truncate">{mil.riwayatKesehatan || '-'}</p>
                    </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => exportIbuHamilKardPDF(mil)} 
                            className="p-1.5 text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 border border-pink-100 transition-colors" 
                            title="Download Kartu Kesehatan (PDF)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { setEditingItem(mil); setShowIbuHamilForm(true); }} className="p-1.5 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-100 transition-colors" title="Edit"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteItem('ibu_hamil', mil.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-colors" title="Hapus"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'kegiatan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Jadwal & Agenda Posyandu</h3>
               <div className="flex gap-2">
                 <button onClick={exportKegiatanPDF} className="p-1.5 bg-white border border-slate-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Export PDF">
                   <FileText className="w-4 h-4" />
                 </button>
                 <button onClick={exportKegiatanExcel} className="p-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Export Excel">
                   <FileSpreadsheet className="w-4 h-4" />
                 </button>
               </div>
             </div>
             <button 
               onClick={() => { setEditingItem(null); setShowKegiatanForm(true); }}
               className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
             >
               <PlusCircle className="w-4 h-4" />
               Buat Agenda
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {posyanduKegiatanData.sort((a,b) => b.tanggal.localeCompare(a.tanggal)).map(kgt => (
              <div key={kgt.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingItem(kgt); setShowKegiatanForm(true); }} className="p-1 text-blue-600 hover:bg-white rounded border border-transparent hover:border-blue-100"><Edit className="w-3 h-3" /></button>
                    <button onClick={() => deleteItem('posyandu_kegiatan', kgt.id)} className="p-1 text-red-600 hover:bg-white rounded border border-transparent hover:border-red-100"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
                <h4 className="text-lg font-black text-slate-800">{formatTgl(kgt.tanggal)}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{kgt.lokasi}</p>
                <div className="space-y-2 border-t border-slate-200 pt-3">
                  <p className="text-[10px] text-slate-500 line-clamp-2">{kgt.keterangan || 'Tidak ada catatan tambahan.'}</p>
                  <p className="text-[9px] font-bold text-blue-600 uppercase">Petugas: {kgt.kaderId?.split('@')[0]}</p>
                </div>
              </div>
            ))}
            {posyanduKegiatanData.length === 0 && <div className="col-span-full py-20 text-center text-slate-400 italic">Belum ada agenda posyandu.</div>}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH BALITA */}
      {showBalitaForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-800">{editingItem ? 'Edit Data Balita' : 'Registrasi Balita Baru'}</h3>
                 <button onClick={() => setShowBalitaForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSaveBalita}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Nama Lengkap Balita</label>
                       <input type="text" name="nama" required defaultValue={editingItem?.nama} placeholder="Masukkan nama Balita..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tgl Lahir</label>
                       <input type="date" name="tglLahir" required defaultValue={editingItem?.tglLahir} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Jenis Kelamin</label>
                       <select name="jk" defaultValue={editingItem?.jk || 'Laki-Laki'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500">
                          <option value="Laki-Laki">Laki-Laki</option>
                          <option value="Perempuan">Perempuan</option>
                       </select>
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Orang Tua (Pilih dari Data Warga)</label>
                       <input type="text" name="orangTuaId" list="wargaList" required defaultValue={editingItem?.orangTuaId} placeholder="Ketik NIK atau Nama Orang Tua..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                       <datalist id="wargaList">
                          {wargaData.map((w: any) => <option key={w.nik} value={w.nik}>{w.nama} - RT {w.rt}</option>)}
                       </datalist>
                    </div>
                    <div className="col-span-1">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Status Stunting</label>
                       <select name="statusStunting" defaultValue={editingItem?.statusStunting || 'Normal'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none border-t-4 border-t-blue-500">
                          <option value="Normal">Normal</option>
                          <option value="Risiko Stunting">Risiko Stunting</option>
                          <option value="Stunting">Stunting</option>
                       </select>
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowBalitaForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all">Simpan Data</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH PEMERIKSAAN */}
      {showPemeriksaanForm && selectedBalita && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                 <h3 className="font-bold flex items-center gap-2">
                    <Scale className="w-4 h-4 text-blue-600" />
                    Pemeriksaan: {selectedBalita.nama}
                 </h3>
                 <button onClick={() => setShowPemeriksaanForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSavePemeriksaan}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal Periksa</label>
                       <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none border-blue-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Berat (kg)</label>
                       <input type="number" step="0.1" name="beratBadan" required placeholder="0.0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tinggi (cm)</label>
                       <input type="number" step="0.1" name="tinggiBadan" required placeholder="0.0" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Catatan Tambahan</label>
                       <textarea name="catatan" rows={2} placeholder="Kondisi kesehatan balita saat ini..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowPemeriksaanForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">Simpan Hasil</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH IMUNISASI */}
      {showImunisasiForm && selectedBalita && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                 <h3 className="font-bold flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-green-600" />
                    Catat Imunisasi: {selectedBalita.nama}
                 </h3>
                 <button onClick={() => setShowImunisasiForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSaveImunisasi}>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Jenis Imunisasi</label>
                       <select name="jenisImunisasi" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-green-500">
                          <option value="Hepatitis B-0">Hepatitis B-0 (0-24 Jam)</option>
                          <option value="BCG">BCG (1 Bulan)</option>
                          <option value="Polio 1">Polio 1 (1 Bulan)</option>
                          <option value="DPT-HB-HiB 1">DPT-HB-HiB 1 (2 Bulan)</option>
                          <option value="Polio 2">Polio 2 (2 Bulan)</option>
                          <option value="PCV 1">PCV 1 (2 Bulan)</option>
                          <option value="DPT-HB-HiB 2">DPT-HB-HiB 2 (3 Bulan)</option>
                          <option value="Polio 3">Polio 3 (3 Bulan)</option>
                          <option value="PCV 2">PCV 2 (3 Bulan)</option>
                          <option value="DPT-HB-HiB 3">DPT-HB-HiB 3 (4 Bulan)</option>
                          <option value="Polio 4">Polio 4 (4 Bulan)</option>
                          <option value="IPV">IPV (4 Bulan)</option>
                          <option value="MR / Campak">MR / Campak (9 Bulan)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal Pemberian</label>
                       <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-green-500" />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowImunisasiForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">Simpan Data</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH KEGIATAN */}
      {showKegiatanForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                 <h3 className="font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {editingItem ? 'Edit Jadwal Posyandu' : 'Buat Jadwal Posyandu'}
                 </h3>
                 <button onClick={() => setShowKegiatanForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSaveKegiatan}>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal Kegiatan</label>
                       <input type="date" name="tanggal" required defaultValue={editingItem?.tanggal || new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Lokasi Kegiatan</label>
                       <input type="text" name="lokasi" required defaultValue={editingItem?.lokasi || 'Posyandu RT 01'} placeholder="Cth: Balai Warga RT 01..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Keterangan / Agenda</label>
                       <textarea name="keterangan" rows={3} defaultValue={editingItem?.keterangan} placeholder="Cth: Penimbangan rutin dan imunisasi campak..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500" />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowKegiatanForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">Simpan Agenda</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: REGISTER IBU HAMIL */}
      {showIbuHamilForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                 <h3 className="font-bold">{editingItem ? 'Edit Data Ibu Hamil' : 'Register Ibu Hamil'}</h3>
                 <button onClick={() => setShowIbuHamilForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSaveIbuHamil}>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Pilih dari Data Warga (NIK / Nama)</label>
                       <input type="text" name="nik" list="wargaList" required defaultValue={editingItem?.nik} placeholder="Ketik NIK atau Nama..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">HPL (Perkiraan Lahir)</label>
                       <input type="date" name="tglHPL" required defaultValue={editingItem?.tglHPL} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Usia Kehamilan (Minggu)</label>
                       <input type="number" name="usiaKehamilan" defaultValue={editingItem?.usiaKehamilan || 8} min="1" max="42" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Riwayat Kesehatan / Catatan</label>
                       <textarea name="riwayatKesehatan" rows={3} defaultValue={editingItem?.riwayatKesehatan} placeholder="Cth: Hipertensi, Alergi obat tertentu..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-pink-500" />
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setShowIbuHamilForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                    <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all active:scale-95">Simpan Data</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function BankSampahView({ 
  sampahKategoriData, 
  sampahSetoranData, 
  sampahTarikSaldoData, 
  wargaData, 
  currentUser, 
  tenantId, 
  handleFirestoreError, 
  showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'setoran' | 'tarik' | 'nasabah' | 'kategori' | 'nasabah_detail'>('dashboard');
  const [showKategoriForm, setShowKategoriForm] = useState(false);
  const [showSetoranForm, setShowSetoranForm] = useState(false);
  const [showTarikForm, setShowTarikForm] = useState(false);
  const [showNasabahForm, setShowNasabahForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedNasabahId, setSelectedNasabahId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<{title: string, message: string, onConfirm: () => Promise<void>} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        for (const row of (data as any[])) {
          // Expecting columns matching common pattern: NIK, Nama, Total/Nominal, Tanggal
          const nik = row.NIK || row.nik;
          const total = parseFloat(row.Total || row.total || row.Setoran || row.setoran || 0);
          
          if (nik && total > 0) {
            const id = `STR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            await setDoc(doc(db, 'sampah_setoran', id), {
              tenantId,
              id,
              nasabahId: String(nik),
              namaKategori: row.Kategori || row.kategori || 'Impor Masal',
              berat: parseFloat(row.Berat || row.berat || 0),
              total: total,
              tanggal: row.Tanggal || row.tanggal || new Date().toISOString().split('T')[0],
              petugas: currentUser?.email?.split('@')[0] || 'Admin'
            });
            successCount++;
          }
        }
        
        if (successCount > 0) {
          showNotification(`Berhasil mengimpor ${successCount} data transaksi!`, 'success');
        } else {
          showNotification("Tidak ada data valid yang ditemukan untuk diimpor.", 'info');
        }
        // Reset input
        e.target.value = '';
      } catch (error) {
        console.error(error);
        showNotification("Gagal memproses file Excel. Pastikan format benar.", 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const canEdit = currentUser?.role !== 'Viewer';

  // Statistics
  const stats = {
    totalSampah: sampahSetoranData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.berat) || 0), 0),
    totalTabungan: sampahSetoranData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.total) || 0), 0) - 
                   sampahTarikSaldoData.reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0),
    transaksiBulanIni: sampahSetoranData.filter((s: any) => s.tanggal?.startsWith(new Date().toISOString().slice(0, 7))).length,
    nasabahAktif: new Set(sampahSetoranData.map((s: any) => s.nasabahId)).size
  };

  // Nasabah Summary (Warga with their balances)
  const nasabahSummary = wargaData.map((w: any) => {
    const setoran = sampahSetoranData.filter((s: any) => s.nasabahId === w.nik).reduce((acc: number, curr: any) => acc + (parseFloat(curr.total) || 0), 0);
    const tarikan = sampahTarikSaldoData.filter((t: any) => t.nasabahId === w.nik).reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0);
    return {
      ...w,
      saldo: setoran - tarikan,
      totalSetoran: setoran
    };
  }).filter((n: any) => n.totalSetoran > 0 || n.saldo > 0 || n.isNasabah === true);

  const selectedNasabah = selectedNasabahId ? nasabahSummary.find((n: any) => n.nik === selectedNasabahId) : null;

  const handleSaveKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId,
      id: editingItem?.id || `KAT-${Date.now()}`,
      nama: formData.get('nama'),
      satuan: formData.get('satuan'),
      hargaBeli: parseFloat(formData.get('hargaBeli') as string)
    };

    try {
      await setDoc(doc(db, 'sampah_kategori', data.id), data);
      showNotification(`Kategori ${data.nama} berhasil disimpan`);
      setShowKategoriForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, 'create', 'sampah_kategori');
    }
  };

  const handleSaveSetoran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const katId = formData.get('kategoriId') as string;
    const kategori = sampahKategoriData.find((k: any) => k.id === katId);
    const nasabahId = formData.get('nasabahId') as string;
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);

    const berat = parseFloat(formData.get('berat') as string);
    const harga = kategori?.hargaBeli || 0;
    const total = berat * harga;

    const data = {
      tenantId,
      id: editingItem?.id || `STR-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || 'Unknown',
      kategoriId: katId,
      namaKategori: kategori?.nama || 'Unknown',
      berat,
      harga,
      total,
      tanggal: formData.get('tanggal'),
      status: 'Selesai',
      keterangan: formData.get('keterangan')
    };

    try {
      await setDoc(doc(db, 'sampah_setoran', data.id), data);
      showNotification(`Setoran senilai Rp${total.toLocaleString()} berhasil dicatat`);
      setShowSetoranForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, 'create', 'sampah_setoran');
    }
  };

  const handleSaveTarik = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nasabahId = editingItem?.nasabahId || (formData.get('nasabahId') as string);
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);
    const nominal = parseFloat(formData.get('nominal') as string);

    const data = {
      tenantId,
      id: editingItem?.id || `TRK-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || 'Unknown',
      nominal,
      tanggal: formData.get('tanggal'),
      keterangan: formData.get('keterangan')
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'sampah_tarik_saldo', editingItem.id), data);
        showNotification(`Penarikan berhasil diperbarui`);
      } else {
        await setDoc(doc(db, 'sampah_tarik_saldo', data.id), data);
        showNotification(`Penarikan Rp${nominal.toLocaleString()} berhasil dicatat`);
      }
      setShowTarikForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, 'create', 'sampah_tarik_saldo');
    }
  };

  const handleSaveNasabah = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inik = formData.get('nik') as string;
    const inama = formData.get('nama') as string;
    const irt = formData.get('rt') as string;
    const irw = formData.get('rw') as string;
    
    if (!inik || !inama) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, 'warga', editingItem.nik), {
          nama: inama,
          rt: irt,
          rw: irw,
          isNasabah: true
        });
        showNotification("Data nasabah (warga) berhasil diperbarui");
      } else {
        const newWarga = {
          tenantId,
          nik: inik,
          nama: inama,
          rt: irt,
          rw: irw,
          blok: '',
          kelurahan: '',
          kecamatan: '',
          kota_kab: '',
          status: 'Warga Tetap',
          hp: '',
          email: '',
          foto: '',
          ktpUrl: '',
          posisi: '',
          profesi: '',
          pendidikanTerakhir: '',
          jk: 'Laki-Laki',
          tglLahir: '',
          tempatLahir: '',
          kawin: 'Belum Kawin',
          kewarganegaraan: 'WNI',
          isNasabah: true
        };
        await setDoc(doc(db, 'data_warga', inik), newWarga);
        showNotification("Nasabah (Warga) baru berhasil ditambahkan!");
      }
      setShowNasabahForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, editingItem ? 'update' : 'create', 'data_warga');
    }
  };

  const deleteItemsByNasabah = async (nik: string) => {
    setConfirmConfig({
      title: 'Hapus Semua Riwayat Transaksi',
      message: `Yakin ingin menghapus SEMUA riwayat transaksi (Setoran & Penarikan) untuk nasabah dengan NIK ${nik}? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        try {
          const setoranToDelete = sampahSetoranData.filter((s: any) => s.nasabahId === nik);
          const tarikToDelete = sampahTarikSaldoData.filter((t: any) => t.nasabahId === nik);
          
          for (const s of setoranToDelete) {
            await deleteDoc(doc(db, 'sampah_setoran', s.id));
          }
          for (const t of tarikToDelete) {
            await deleteDoc(doc(db, 'sampah_tarik_saldo', t.id));
          }
          
          showNotification(`Semua riwayat transaksi nasabah berhasil dihapus.`);
        } catch (err) {
          handleFirestoreError(err, 'delete', 'bank_sampah_mass');
        }
        setConfirmConfig(null);
      }
    });
  };

  const deleteItem = async (collectionName: string, id: string) => {
    setConfirmConfig({
      title: 'Hapus Data',
      message: 'Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, collectionName, id));
          showNotification('Data berhasil dihapus');
        } catch (err) {
          handleFirestoreError(err, 'delete', collectionName);
        }
        setConfirmConfig(null);
      }
    });
  };

  const exportAllSetoranExcel = () => {
    const data = sampahSetoranData.map(s => ({
      'Nasabah': s.namaNasabah,
      'Kategori': s.namaKategori,
      'Berat (kg)': s.berat,
      'Harga': s.harga,
      'Total': s.total,
      'Tanggal': s.tanggal,
      'Keterangan': s.keterangan || '-'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Setoran Bank Sampah");
    XLSX.writeFile(wb, `Setoran_Sampah_All_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Eksport Excel Berhasil!");
  };

  const exportAllSetoranPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('LAPORAN SETORAN BANK SAMPAH', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);
    
    const tableData = sampahSetoranData.map((s: any) => [
      s.namaNasabah,
      s.namaKategori,
      s.berat + " kg",
      "Rp " + s.total.toLocaleString(),
      s.tanggal
    ]);

    autoTable(doc, {
      startY: 45,
      head: [['Nasabah', 'Kategori', 'Berat', 'Total', 'Tanggal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] }
    });

    doc.save(`Laporan_Setoran_Sampah_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Eksport PDF Berhasil!");
  };

  const exportBukuTabunganPDF = (nasabah: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('BUKU TABUNGAN BANK SAMPAH', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Nama Nasabah: ${nasabah.nama}`, 14, 32);
    doc.text(`NIK: ${nasabah.nik}`, 14, 38);
    doc.text(`Blok/RT: ${nasabah.blok} / ${nasabah.rt}`, 14, 44);
    
    const transactions = [
      ...sampahSetoranData.filter((s: any) => s.nasabahId === nasabah.nik).map(s => ({ ...s, type: 'Setoran', amount: s.total })),
      ...sampahTarikSaldoData.filter((t: any) => t.nasabahId === nasabah.nik).map(t => ({ ...t, type: 'Penarikan', amount: -t.nominal }))
    ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    let currentSaldo = 0;
    const tableData = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return [
        t.tanggal,
        t.type,
        t.type === 'Setoran' ? t.namaKategori : '-',
        t.type === 'Setoran' ? t.berat + " kg" : '-',
        t.amount > 0 ? "Rp " + t.amount.toLocaleString() : "-",
        t.amount < 0 ? "Rp " + Math.abs(t.amount).toLocaleString() : "-",
        "Rp " + currentSaldo.toLocaleString()
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [['Tanggal', 'Jenis', 'Item', 'Berat', 'Masuk', 'Keluar', 'Saldo']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] }
    });

    doc.save(`Buku_Tabungan_${nasabah.nama}_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification(`Buku Tabungan ${nasabah.nama} berhasil diunduh!`);
  };

  const exportBukuTabunganExcel = (nasabah: any) => {
    const transactions = [
      ...sampahSetoranData.filter((s: any) => s.nasabahId === nasabah.nik).map(s => ({ ...s, type: 'Setoran', amount: s.total })),
      ...sampahTarikSaldoData.filter((t: any) => t.nasabahId === nasabah.nik).map(t => ({ ...t, type: 'Penarikan', amount: -t.nominal }))
    ].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

    let currentSaldo = 0;
    const data = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return {
        'Tanggal': t.tanggal,
        'Jenis': t.type,
        'Item': t.type === 'Setoran' ? t.namaKategori : '-',
        'Berat': t.type === 'Setoran' ? t.berat : 0,
        'Masuk': t.amount > 0 ? t.amount : 0,
        'Keluar': t.amount < 0 ? Math.abs(t.amount) : 0,
        'Saldo': currentSaldo
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tabungan");
    XLSX.writeFile(wb, `Tabungan_${nasabah.nama}_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Eksport Excel Tabungan Berhasil!");
  };

  const exportNasabahSummaryExcel = () => {
    const data = nasabahSummary.map(n => {
      const totalDitarik = sampahTarikSaldoData.filter((t: any) => t.nasabahId === n.nik).reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0);
      return {
        'Nama Nasabah': n.nama,
        'NIK': n.nik,
        'Total Tabungan': n.totalSetoran,
        'Telah Ditarik': totalDitarik,
        'Saldo Saat Ini': n.saldo,
        'Alamat': `Blok ${n.blok} / RT ${n.rt}`
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan Nasabah");
    XLSX.writeFile(wb, `Ringkasan_Nasabah_Sampah_${new Date().toISOString().split('T')[0]}.xlsx`);
    showNotification("Eksport Ringkasan Nasabah Excel Berhasil!");
  };

  const exportNasabahSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RINGKASAN SALDO NASABAH BANK SAMPAH', 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);
    
    const tableData = nasabahSummary.map((n: any) => {
      const totalDitarik = sampahTarikSaldoData.filter((t: any) => t.nasabahId === n.nik).reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0);
      return [
        n.nama,
        n.nik,
        "Rp " + n.totalSetoran.toLocaleString(),
        "Rp " + totalDitarik.toLocaleString(),
        "Rp " + n.saldo.toLocaleString()
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Nama Nasabah', 'NIK', 'Total Tabungan', 'Tarik Saldo', 'Saldo Sisa']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] }
    });

    doc.save(`Ringkasan_Nasabah_Sampah_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification("Eksport Ringkasan Nasabah PDF Berhasil!");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Recycle className="w-8 h-8 text-emerald-600" />
            Bank Sampah Mandiri
          </h1>
          <p className="text-slate-500 text-sm font-medium">Ubah sampah menjadi tabungan bermanfaat</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'setoran', label: 'Setoran', icon: PlusCircle },
            { id: 'tarik', label: 'Tarik Saldo', icon: HandCoins },
            { id: 'nasabah', label: 'Nasabah', icon: Users },
            { id: 'kategori', label: 'Kategori', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Recycle className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Sampah</p>
              <p className="text-2xl font-black text-slate-800">{stats.totalSampah.toFixed(1)} <span className="text-sm font-bold text-slate-400">kg</span></p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Tabungan</p>
              <p className="text-2xl font-black text-slate-800">Rp {stats.totalTabungan.toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Setoran Bulan Ini</p>
              <p className="text-2xl font-black text-slate-800">{stats.transaksiBulanIni}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Nasabah Aktif</p>
              <p className="text-2xl font-black text-slate-800">{stats.nasabahAktif}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    Setoran Terakhir
                  </h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                      <tr>
                        <th className="px-6 py-3">Nasabah</th>
                        <th className="px-6 py-3">Kategori</th>
                        <th className="px-6 py-3 text-right">Berat</th>
                        <th className="px-6 py-3 text-right">Total</th>
                        <th className="px-6 py-3">Tanggal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {sampahSetoranData.slice(0, 5).map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700">{item.namaNasabah}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                              {item.namaKategori}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-bold">{item.berat} kg</td>
                          <td className="px-6 py-4 text-right font-black">Rp {item.total.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs">{item.tanggal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* Price List Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/30">
                <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Harga Hari Ini
                </h3>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto max-h-[300px]">
                {sampahKategoriData.map((kat: any) => (
                  <div key={kat.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-sm font-bold text-slate-700">{kat.nama}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">per {kat.satuan}</p>
                    </div>
                    <p className="text-emerald-600 font-black">Rp {kat.hargaBeli.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'setoran' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Cari setoran..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {canEdit && (
                <button 
                  onClick={() => setShowSetoranForm(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  Catat Setoran
                </button>
              )}
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Nasabah</th>
                    <th className="px-6 py-3">Kategori</th>
                    <th className="px-6 py-3 text-right">Berat</th>
                    <th className="px-6 py-3 text-right">Harga</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                  {sampahSetoranData.filter((s: any) => s.namaNasabah.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.namaNasabah}</td>
                      <td className="px-6 py-4">{item.namaKategori}</td>
                      <td className="px-6 py-4 text-right font-bold">{item.berat} kg</td>
                      <td className="px-6 py-4 text-right text-slate-400">Rp {item.harga.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">Rp {item.total.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{item.tanggal}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const n = nasabahSummary.find((nas: any) => nas.nik === item.nasabahId);
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab('nasabah_detail');
                              } else {
                                showNotification("Data nasabah tidak ditemukan", "error");
                              }
                            }} 
                            className="text-slate-400 hover:text-slate-600 transition-colors" 
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => { setEditingItem(item); setShowSetoranForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-100" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteItem('sampah_setoran', item.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100" title="Hapus Transaksi">
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {activeSubTab === 'tarik' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cari penarikan..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-blue-500/20"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {canEdit && (
                <button 
                  onClick={() => setShowTarikForm(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  <HandCoins className="w-4 h-4" />
                  Tarik Saldo
                </button>
              )}
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Nasabah</th>
                    <th className="px-6 py-3 text-right">Nominal</th>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Keterangan</th>
                    <th className="px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sampahTarikSaldoData.filter((t: any) => t.namaNasabah.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-700">{item.namaNasabah}</td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">Rp {item.nominal.toLocaleString()}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{item.tanggal}</td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">{item.keterangan || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              const n = nasabahSummary.find((nas: any) => nas.nik === item.nasabahId);
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab('nasabah_detail');
                              } else {
                                showNotification("Data nasabah tidak ditemukan", "error");
                              }
                            }} 
                            className="text-slate-400 hover:text-slate-600 transition-colors" 
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingItem(item); setShowTarikForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-100" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteItem('sampah_tarik_saldo', item.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100" title="Hapus Penarikan">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeSubTab === 'nasabah_detail' && selectedNasabah && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-black border-4 border-white shadow-sm uppercase">
                  {selectedNasabah.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedNasabah.nama}</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nasabah ID: {selectedNasabah.nik}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => exportBukuTabunganPDF(selectedNasabah)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-100 border border-red-100 transition-all"
                >
                  <FileText className="w-4 h-4" /> PDF
                </button>
                <button 
                  onClick={() => setActiveSubTab('nasabah')}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
               <div className="md:col-span-1 space-y-4">
                  <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-100">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Saldo Saat Ini</p>
                    <p className="text-2xl font-black">Rp {selectedNasabah.saldo.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statistik Nasabah</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Total Setoran</span>
                        <span className="font-bold text-emerald-600">Rp {selectedNasabah.totalSetoran.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Total Tarik</span>
                        <span className="font-bold text-red-600">Rp {(selectedNasabah.totalSetoran - selectedNasabah.saldo).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="md:col-span-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-600" />
                    Riwayat Transaksi
                  </h3>
                  <div className="space-y-3">
                    {[
                      ...sampahSetoranData.filter((s: any) => s.nasabahId === selectedNasabah.nik).map(s => ({ ...s, type: 'setoran' })),
                      ...sampahTarikSaldoData.filter((t: any) => t.nasabahId === selectedNasabah.nik).map(t => ({ ...t, type: 'tarik' }))
                    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all shadow-sm">
                         <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${item.type === 'setoran' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                               {item.type === 'setoran' ? <TrendingUp className="w-4 h-4" /> : <HandCoins className="w-4 h-4" />}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-800">{item.type === 'setoran' ? `Setoran: ${item.namaKategori}` : 'Penarikan Saldo'}</p>
                               <p className="text-[10px] text-slate-400 font-medium">{item.tanggal}</p>
                            </div>
                         </div>
                         <p className={`text-sm font-black ${item.type === 'setoran' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.type === 'setoran' ? '+' : '-'} Rp {(item.total || item.nominal || 0).toLocaleString()}
                         </p>
                      </div>
                    ))}
                    {selectedNasabah.totalSetoran === 0 && (
                      <p className="text-sm text-slate-400 text-center py-8 italic font-medium">Belum ada transaksi.</p>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'nasabah' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
           <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-slate-800">Daftar Nasabah & Saldo</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input 
                     type="text" 
                     placeholder="Cari nasabah..." 
                     className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20"
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                </div>
                <div className="flex gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                  />
                  {canEdit && (
                    <button 
                      onClick={() => { setEditingItem(null); setShowNasabahForm(true); }} 
                      className="p-2 px-3 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all active:scale-95 font-bold text-sm flex items-center gap-2" 
                      title="Tambah Nasabah Baru"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Nasabah
                    </button>
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-all active:scale-95" 
                    title="Impor Database (Excel/CSV)"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button onClick={exportNasabahSummaryPDF} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100" title="Export PDF Semua Nasabah">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button onClick={exportNasabahSummaryExcel} className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100" title="Export Excel Semua Nasabah">
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Nama Nasabah</th>
                    <th className="px-6 py-3">NIK</th>
                    <th className="px-6 py-3 text-right">Total Tabungan</th>
                    <th className="px-6 py-3 text-right">Telah Ditarik</th>
                    <th className="px-6 py-3 text-right">Saldo Saat Ini</th>
                    <th className="px-6 py-3 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                  {nasabahSummary.filter((n: any) => n.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || n.nik?.includes(searchQuery)).map((n: any) => {
                    const totalDitarik = sampahTarikSaldoData.filter((t: any) => t.nasabahId === n.nik).reduce((acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0), 0);
                    return (
                      <tr key={n.nik} className="hover:bg-slate-50 group">
                        <td className="px-6 py-4 font-bold text-slate-700">{n.nama}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs">{n.nik}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">Rp {n.totalSetoran.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-bold text-orange-600">Rp {totalDitarik.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`px-3 py-1.5 rounded-lg font-black ${n.saldo > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                            Rp {n.saldo.toLocaleString()}
                          </span>
                        </td>
                       <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5 transition-all">
                              <button 
                                onClick={() => { setSelectedNasabahId(n.nik); setActiveSubTab('nasabah_detail'); }} 
                                className="p-1.5 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200" 
                                title="Lihat/Mata"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => { setEditingItem(n); setShowNasabahForm(true); }} 
                                className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-100" 
                                title="Edit Nasabah"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => deleteItemsByNasabah(n.nik)} 
                                className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100" 
                                title="Hapus Semua Riwayat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                         </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {activeSubTab === 'kategori' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Kategori Sampah & Harga</h3>
             {canEdit && (
               <button onClick={() => setShowKategoriForm(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2">
                 <PlusCircle className="w-4 h-4" />
                 Tambah Kategori
               </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {sampahKategoriData.map((kat: any) => (
              <div key={kat.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50 group transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                    <Recycle className="w-5 h-5 text-emerald-600" />
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                       <button onClick={() => { setEditingItem(kat); setShowKategoriForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 border border-amber-100" title="Edit"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => deleteItem('sampah_kategori', kat.id)} className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{kat.nama}</h4>
                <p className="text-emerald-600 font-black text-xl">
                  Rp {kat.hargaBeli.toLocaleString()} 
                  <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">per {kat.satuan}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showKategoriForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">{editingItem ? 'Edit Kategori' : 'Tambah Kategori Sampah'}</h3>
                <button onClick={() => { setShowKategoriForm(false); setEditingItem(null); }} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
             </div>
             <form className="p-6 space-y-4" onSubmit={handleSaveKategori}>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Nama Kategori</label>
                   <input type="text" name="nama" required defaultValue={editingItem?.nama} placeholder="Cth: Botol Plastik, Kardus, dll" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Satuan</label>
                      <select name="satuan" defaultValue={editingItem?.satuan || 'kg'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500">
                         <option value="kg">kg</option>
                         <option value="liter">liter</option>
                         <option value="pcs">pcs</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Harga Beli (Rp)</label>
                      <input type="number" name="hargaBeli" required defaultValue={editingItem?.hargaBeli} placeholder="Cth: 2500" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => { setShowKategoriForm(false); setEditingItem(null); }} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                   <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transform active:scale-95 transition-all">Simpan Kategori</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}

      {showSetoranForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><Recycle className="w-4 h-4 text-emerald-600" /> Catat Setoran Baru</span>
                <button onClick={() => setShowSetoranForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <form className="p-6 space-y-4" onSubmit={handleSaveSetoran}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Pilih Nasabah (Warga)</label>
                      <select name="nasabahId" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500">
                         <option value="">-- Pilih Nasabah --</option>
                         {wargaData.map((w: any) => (
                           <option key={w.nik} value={w.nik}>{w.nama} ({w.blok})</option>
                         ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Kategori Sampah</label>
                      <select name="kategoriId" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500">
                         <option value="">-- Pilih Kategori --</option>
                         {sampahKategoriData.map((k: any) => (
                           <option key={k.id} value={k.id}>{k.nama} (Rp {k.hargaBeli}/{k.satuan})</option>
                         ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Berat / Jumlah</label>
                      <input type="number" step="0.1" name="berat" required placeholder="Cth: 2.5" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal</label>
                      <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                   </div>
                   <div className="col-span-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Keterangan Tambahan</label>
                      <textarea name="keterangan" rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500" placeholder="Opsional..."></textarea>
                   </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setShowSetoranForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                   <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transform active:scale-95 transition-all">Simpan Setoran</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}

      {showTarikForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><HandCoins className="w-4 h-4 text-blue-600" /> {editingItem ? 'Edit Tarik Saldo' : 'Tarik Saldo Nasabah'}</span>
                <button onClick={() => { setShowTarikForm(false); setEditingItem(null); }} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <form className="p-6 space-y-4" onSubmit={handleSaveTarik}>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Pilih Nasabah (Aktif)</label>
                   <select name="nasabahId" required defaultValue={editingItem?.nasabahId} disabled={!!editingItem} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50">
                      <option value="">-- Pilih Nasabah --</option>
                      {nasabahSummary.filter((n:any) => n.saldo > 0 || (editingItem && editingItem.nasabahId === n.nik)).map((n: any) => (
                        <option key={n.nik} value={n.nik}>{n.nama} (Saldo: Rp {n.saldo.toLocaleString()})</option>
                      ))}
                   </select>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Nominal yang Ditarik (Rp)</label>
                   <input type="number" name="nominal" required defaultValue={editingItem?.nominal} placeholder="Cth: 50000" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal</label>
                   <input type="date" name="tanggal" required defaultValue={editingItem?.tanggal || new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Keterangan</label>
                   <textarea name="keterangan" rows={2} defaultValue={editingItem?.keterangan} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500" placeholder="Contoh: Keperluan harian..."></textarea>
                </div>
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => { setShowTarikForm(false); setEditingItem(null); }} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                   <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transform active:scale-95 transition-all">{editingItem ? 'Simpan Perubahan' : 'Konfirmasi Tarik'}</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}

      {showNasabahForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
                <span className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-600" /> {editingItem ? 'Edit Data Nasabah (Warga)' : 'Tambah Nasabah (Warga)'}</span>
                <button onClick={() => setShowNasabahForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
             </div>
             <form className="p-6 space-y-4" onSubmit={handleSaveNasabah}>
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mb-4 flex items-start gap-2">
                   <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                   <p>Data nasabah ini terhubung dengan data Warga. {editingItem ? 'Mengedit' : 'Menambahkan'} nama di sini akan ikut {editingItem ? 'mengubah' : 'menambahkan'} data warga tersebut.</p>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">NIK {editingItem ? '(Hanya Baca)' : ''}</label>
                   <input type="text" name="nik" required defaultValue={editingItem?.nik} readOnly={!!editingItem} placeholder="Masukkan 16 digit NIK..." minLength={16} maxLength={16} className={`w-full px-4 py-2.5 ${editingItem ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50 focus:bg-white'} border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500`} />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Nama Lengkap</label>
                   <input type="text" name="nama" required defaultValue={editingItem?.nama} list="wargaListNasabah" onChange={(e) => {
                     const selectedName = e.target.value;
                     const warga = wargaData.find((w: any) => w.nama === selectedName);
                     if (warga) {
                       const form = e.target.closest('form');
                       if (form) {
                         if (!editingItem) (form.elements.namedItem('nik') as HTMLInputElement).value = warga.nik;
                         (form.elements.namedItem('rt') as HTMLInputElement).value = warga.rt || '01';
                         (form.elements.namedItem('rw') as HTMLInputElement).value = warga.rw || '05';
                       }
                     }
                   }} placeholder="Masukkan Nama Lengkap" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                   <datalist id="wargaListNasabah">
                     {wargaData.map((w: any) => (
                       <option key={w.nik} value={w.nama} />
                     ))}
                   </datalist>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">RT</label>
                     <input type="text" name="rt" required defaultValue={editingItem?.rt || '01'} placeholder="01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div className="flex-1">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">RW</label>
                     <input type="text" name="rw" required defaultValue={editingItem?.rw || '05'} placeholder="05" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>
                
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setShowNasabahForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                   <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transform active:scale-95 transition-all">{editingItem ? 'Simpan Perubahan' : 'Tambah Nasabah'}</button>
                </div>
             </form>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {confirmConfig && (
          <ConfirmModal 
            isOpen={true}
            title={confirmConfig.title}
            message={confirmConfig.message}
            onConfirm={confirmConfig.onConfirm}
            onCancel={() => setConfirmConfig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function InventarisView({ inventarisData, setInventarisData, inventarisLogs, setInventarisLogs, inventarisKategori, inventarisLokasi, inventarisSupplier, userRole, currentUser, tenantId, setIsLoadingDB, handleFirestoreError, showNotification }: any) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // States untuk form transaksi dinamis
  const [txType, setTxType] = useState('Barang Masuk');
  const [txJumlah, setTxJumlah] = useState(1);
  const [txHarga, setTxHarga] = useState(0);
  const [txStokFisik, setTxStokFisik] = useState(0);

  const canEdit = userRole === 'ADMIN' || userRole === 'RW' || userRole === 'RT' || userRole === 'BENDAHARA' || userRole === 'SEKRETARIS';

  const filteredData = inventarisData.filter((item: any) => 
    item.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) return;

    const formData = new FormData(e.currentTarget);
    const itemId = editingItem ? editingItem.id : `INV-BRG-${Date.now()}`;
    
    const itemData = {
      id: itemId,
      nama_barang: formData.get('nama_barang') as string,
      kategori: formData.get('kategori') as string,
      satuan: formData.get('satuan') as string,
      merk: formData.get('merk') as string,
      spesifikasi: formData.get('spesifikasi') as string,
      stok: parseInt(formData.get('stok') as string) || 0,
      minimum_stok: parseInt(formData.get('minimum_stok') as string) || 0,
      status: formData.get('status') as string,
      lokasi: formData.get('lokasi') as string,
      supplier: formData.get('supplier') as string,
      tenantId
    };

    setIsLoadingDB(true);
    try {
      // Auto-save Kategori & Lokasi ke Master Data jika belum ada
      if (itemData.kategori) {
        const kExists = inventarisKategori.find(k => k.nama_kategori.toLowerCase() === itemData.kategori.toLowerCase());
        if (!kExists) {
          const kId = `KAT-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_kategori', kId), { id: kId, nama_kategori: itemData.kategori, tenantId });
        }
      }
      if (itemData.lokasi) {
        const lExists = inventarisLokasi.find(l => l.nama_lokasi.toLowerCase() === itemData.lokasi.toLowerCase());
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_lokasi', lId), { id: lId, nama_lokasi: itemData.lokasi, tenantId });
        }
      }
      if (itemData.supplier) {
        const sExists = inventarisSupplier.find(s => s.nama.toLowerCase() === itemData.supplier.toLowerCase());
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_supplier', sId), { 
             id: sId, 
             nama: itemData.supplier, 
             kontak: '', 
             alamat: '', 
             tenantId 
          });
        }
      }

      if (editingItem) {
        await updateDoc(doc(db, 'inventaris', itemId), itemData);
        setInventarisData((prev: any) => prev.map((item: any) => item.id === itemId ? itemData : item));
        showNotification("Data inventaris diperbarui!", "success");
      } else {
        await setDoc(doc(db, 'inventaris', itemId), itemData);
        setInventarisData((prev: any) => [itemData, ...prev]);
        showNotification("Barang baru ditambahkan ke inventaris!", "success");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error: any) {
      handleFirestoreError(error, editingItem ? 'update' : 'create', 'inventaris');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit || !selectedItem) return;

    const formData = new FormData(e.currentTarget);
    const logId = `LOG-${Date.now()}`;
    const tanggal = formData.get('tanggal') as string;
    
    // Base log
    const logData: any = {
      id: logId,
      itemId: selectedItem.id,
      itemName: selectedItem.nama_barang,
      aktivitas: txType,
      pencatat: currentUser.name,
      tanggal,
      tenantId
    };

    const itemUpdate: any = {};
    const currentStok = selectedItem.stok || 0;

    if (txType === 'Barang Masuk') {
       const jumlah = parseInt(formData.get('jumlah') as string) || 0;
       const harga = parseInt(formData.get('harga') as string) || 0;
       logData.supplier = formData.get('supplier') as string;
       logData.jumlah = jumlah;
       logData.harga = harga;
       logData.total = jumlah * harga;
       itemUpdate.stok = currentStok + jumlah;
    } else if (txType === 'Barang Keluar') {
       const jumlah = parseInt(formData.get('jumlah') as string) || 0;
       logData.jumlah = jumlah;
       logData.tujuan = formData.get('tujuan') as string;
       logData.keterangan = formData.get('keterangan') as string;
       itemUpdate.stok = Math.max(0, currentStok - jumlah);
    } else if (txType === 'Mutasi Barang') {
       logData.dari_lokasi = selectedItem.lokasi;
       logData.ke_lokasi = formData.get('ke_lokasi') as string;
       logData.keterangan = formData.get('keterangan') as string;
       itemUpdate.lokasi = logData.ke_lokasi;
    } else if (txType === 'Stock Opname') {
       const stok_fisik = parseInt(formData.get('stok_fisik') as string) || 0;
       logData.stok_sistem = currentStok;
       logData.stok_fisik = stok_fisik;
       logData.selisih = stok_fisik - currentStok;
       logData.catatan = formData.get('catatan') as string;
       itemUpdate.stok = stok_fisik;
    }

    setIsLoadingDB(true);
    try {
      if (itemUpdate.stok !== undefined || itemUpdate.lokasi !== undefined) {
         await updateDoc(doc(db, 'inventaris', selectedItem.id), itemUpdate);
         setInventarisData((prev: any) => prev.map((item: any) => item.id === selectedItem.id ? { ...item, ...itemUpdate } : item));
      }
      if (logData.supplier && txType === 'Barang Masuk') {
        const sExists = inventarisSupplier.find((s:any) => s.nama.toLowerCase() === logData.supplier.toLowerCase());
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_supplier', sId), { id: sId, nama: logData.supplier, kontak: '', alamat: '', tenantId });
        }
      }
      if (logData.ke_lokasi && txType === 'Mutasi Barang') {
        const lExists = inventarisLokasi.find((l:any) => l.nama_lokasi.toLowerCase() === logData.ke_lokasi.toLowerCase());
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_lokasi', lId), { id: lId, nama_lokasi: logData.ke_lokasi, tenantId });
        }
      }

      await setDoc(doc(db, 'inventaris_logs', logId), logData);
      showNotification("Transaksi berhasil dicatat!", "success");
      setShowLogForm(false);
      setTxType('Barang Masuk');
      setTxJumlah(1);
      setTxHarga(0);
      setTxStokFisik(0);
    } catch (error: any) {
      handleFirestoreError(error, 'create', 'inventaris_logs');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteItem = async (id: string, nama: string) => {
    if (!canEdit) return;
    if (!window.confirm(`Hapus barang ${nama} dari inventaris?`)) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'inventaris', id));
      setInventarisData((prev: any) => prev.filter((item: any) => item.id !== id));
      showNotification("Barang berhasil dihapus.", "success");
    } catch (error: any) {
      handleFirestoreError(error, 'delete', 'inventaris');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
             <span className="bg-blue-600 w-1.5 h-6 rounded-full mr-2"></span>
             Inventaris Barang
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">Kelola dan pantau aset yang dimiliki oleh organisasi, perbarui kondisi, serta catat lokasi penyimpanannya di satu tempat.</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3 relative">
           <Search className="w-4 h-4 text-slate-400 absolute left-3" />
           <input 
             type="text" 
             placeholder="Cari barang atau lokasi..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full md:w-64 pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium shadow-sm"
           />
           {canEdit && (
             <button 
               onClick={() => { setEditingItem(null); setShowAddForm(true); }}
               className="flex-shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
             >
               <PlusCircle className="w-4 h-4" />
               Tambah Barang
             </button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Barang & Spesifikasi</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stok</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori & Lokasi</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm italic">Tidak ada data inventaris</td></tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-800 tracking-tight">{item.nama_barang}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">Merk: {item.merk || '-'} - {item.spesifikasi || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-black font-mono ${item.stok <= (item.minimum_stok || 0) ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {item.stok} {item.satuan}
                        </span>
                        {item.minimum_stok > 0 && <span className="text-[9px] text-slate-400">Min: {item.minimum_stok}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        item.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-100' :
                        item.status === 'rusak' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-700">{item.kategori || '-'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.lokasi || '-'}</p>
                      {item.supplier && <p className="text-[9px] text-slate-400 mt-0.5">Supplier: {item.supplier}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item); setShowLogForm(true); }} 
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 text-[10px] font-bold uppercase tracking-wider"
                          title="Catat Aktivitas"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          Catat
                        </button>
                        <button 
                          onClick={() => { setSelectedItem(item); setShowLogHistory(true); }} 
                          className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                          title="Riwayat"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <>
                            <button onClick={() => { setEditingItem(item); setShowAddForm(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteItem(item.id, item.nama_barang)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: TAMBAH/EDIT BARANG */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    {editingItem ? <Edit className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <h3 className="font-bold text-slate-800">{editingItem ? 'Edit Aset' : 'Tambah Aset Baru'}</h3>
               </div>
               <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:text-red-500 bg-white border border-slate-200 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
             </div>
             <form onSubmit={handleSaveItem} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nama Barang <span className="text-red-500">*</span></label>
                   <input type="text" name="nama_barang" required defaultValue={editingItem?.nama_barang} placeholder="Contoh: Tenda 3x4" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold" />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Kategori <span className="text-red-500">*</span></label>
                   <input type="text" name="kategori" list="kategoriList" required defaultValue={editingItem?.kategori} placeholder="Pilih / Ketik Kategori..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                   <datalist id="kategoriList">
                      {inventarisKategori.map(k => <option key={k.id} value={k.nama_kategori} />)}
                   </datalist>
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Lokasi <span className="text-red-500">*</span></label>
                   <input type="text" name="lokasi" list="lokasiList" required defaultValue={editingItem?.lokasi} placeholder="Pilih / Ketik Lokasi..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                   <datalist id="lokasiList">
                      {inventarisLokasi.map(l => <option key={l.id} value={l.nama_lokasi} />)}
                   </datalist>
                 </div>
                 <div className="col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Stok <span className="text-red-500">*</span></label>
                   <input type="number" name="stok" required min="0" defaultValue={editingItem?.stok ?? 0} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold" />
                 </div>
                 <div className="col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Satuan (Unit)</label>
                   <input type="text" name="satuan" defaultValue={editingItem?.satuan || 'Pcs'} placeholder="Contoh: Pcs, Set" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                 </div>
                 <div className="col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Minimum Stok</label>
                   <input type="number" name="minimum_stok" min="0" defaultValue={editingItem?.minimum_stok ?? 0} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold" />
                 </div>
                 <div className="col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Status <span className="text-red-500">*</span></label>
                   <select name="status" defaultValue={editingItem?.status || 'aktif'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold">
                     <option value="aktif">Aktif / Baik</option>
                     <option value="rusak">Rusak</option>
                     <option value="hilang">Hilang</option>
                   </select>
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Merk</label>
                   <input type="text" name="merk" defaultValue={editingItem?.merk} placeholder="Contoh: Krisbow" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                 </div>
                 <div className="col-span-2 md:col-span-1">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Supplier Baru / Pilih Supplier</label>
                   <input type="text" name="supplier" list="supplierList" defaultValue={editingItem?.supplier} placeholder="Ketik nama supplier..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                   <datalist id="supplierList">
                      {inventarisSupplier.map(s => <option key={s.id} value={s.nama} />)}
                   </datalist>
                 </div>
                 <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Spesifikasi</label>
                   <input type="text" name="spesifikasi" defaultValue={editingItem?.spesifikasi} placeholder="Detail teknis..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600" />
                 </div>
               </div>
               
               <div className="pt-4 flex gap-3">
                 <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-slate-50 transition-all">Batal</button>
                 <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">Simpan Barang</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: CATAT AKTIVITAS */}
      {showLogForm && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <ClipboardList className="w-4 h-4 text-green-600" />
                 Catat Transaksi: {selectedItem.nama_barang}
               </h3>
               <button onClick={() => setShowLogForm(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
             </div>
             <form onSubmit={handleSaveLog} className="p-6 space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Jenis Transaksi <span className="text-red-500">*</span></label>
                  <select 
                     name="aktivitas" 
                     value={txType} 
                     onChange={(e) => setTxType(e.target.value)} 
                     className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold"
                  >
                    <option value="Barang Masuk">Barang Masuk</option>
                    <option value="Barang Keluar">Barang Keluar</option>
                    <option value="Mutasi Barang">Mutasi Barang</option>
                    <option value="Stock Opname">Stock Opname</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" name="tanggal" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium" />
               </div>

               {txType === 'Barang Masuk' && (
                 <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Supplier Baru/Pilih <span className="text-red-500">*</span></label>
                     <input type="text" name="supplier" list="supplierListTx" required placeholder="Supplier..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold" />
                     <datalist id="supplierListTx">
                        {inventarisSupplier.map(s => <option key={s.id} value={s.nama} />)}
                     </datalist>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Jumlah Masuk <span className="text-red-500">*</span></label>
                       <input type="number" name="jumlah" required min="1" value={txJumlah} onChange={(e) => setTxJumlah(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold" />
                     </div>
                     <div className="col-span-1">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Harga Satuan</label>
                       <input type="number" name="harga" min="0" value={txHarga} onChange={(e) => setTxHarga(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold" />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Total Estimasi Nilai</label>
                     <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-700">
                       Rp {(txJumlah * txHarga).toLocaleString('id-ID')}
                     </div>
                   </div>
                 </div>
               )}

               {txType === 'Barang Keluar' && (
                 <div className="space-y-4 p-4 border border-orange-100 bg-orange-50/30 rounded-xl">
                    <div className="flex items-center justify-between text-xs font-bold text-orange-600 bg-white px-3 py-2 border border-orange-100 rounded-lg">
                       <span>Stok Tersedia Saat Ini:</span>
                       <span className="font-mono text-sm">{selectedItem.stok} {selectedItem.satuan}</span>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Jumlah Keluar <span className="text-red-500">*</span></label>
                      <input type="number" name="jumlah" required min="1" max={selectedItem.stok} defaultValue={1} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tujuan (User/Divisi) <span className="text-red-500">*</span></label>
                      <input type="text" name="tujuan" required placeholder="Cth: Bpk Andi RT 01..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Keterangan / Tujuan Penggunaan</label>
                      <textarea name="keterangan" rows={2} placeholder="Cth: Untuk perbaikan pipa di lapangan..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none" />
                    </div>
                 </div>
               )}

               {txType === 'Mutasi Barang' && (
                 <div className="space-y-4 p-4 border border-purple-100 bg-purple-50/30 rounded-xl">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Dari Lokasi Saat Ini</label>
                      <input type="text" disabled value={selectedItem.lokasi || '-'} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-500 cursor-not-allowed outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Pindah Ke Lokasi Baru <span className="text-red-500">*</span></label>
                      <input type="text" name="ke_lokasi" list="keLokasiList" required placeholder="Gudang B..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold" />
                      <datalist id="keLokasiList">
                         {inventarisLokasi.map(l => <option key={l.id} value={l.nama_lokasi} />)}
                      </datalist>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Keterangan Mutasi</label>
                      <textarea name="keterangan" rows={2} placeholder="Alasan pemindahan..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none" />
                    </div>
                 </div>
               )}

               {txType === 'Stock Opname' && (
                 <div className="space-y-4 p-4 border border-teal-100 bg-teal-50/30 rounded-xl">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Stok Sistem (Saat Ini)</label>
                        <input type="number" disabled value={selectedItem.stok} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-500 cursor-not-allowed outline-none font-mono font-bold" />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Stok Fisik (Realita) <span className="text-red-500">*</span></label>
                        <input type="number" name="stok_fisik" required min="0" value={txStokFisik} onChange={(e) => setTxStokFisik(parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-teal-500 ring-2 ring-transparent focus:ring-teal-100 outline-none font-mono font-black text-teal-700" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                           <span>Selisih Stok</span>
                           <span className={`text-xs ${txStokFisik - selectedItem.stok < 0 ? 'text-red-500' : 'text-green-500'}`}>{txStokFisik - selectedItem.stok}</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Catatan Pengecekan</label>
                      <textarea name="catatan" rows={2} placeholder="Cth: 2 kursi patah diletakkan di luar, 1 kursi hilang..." className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none" />
                    </div>
                 </div>
               )}

               <div className="pt-2 flex gap-3">
                 <button type="button" onClick={() => setShowLogForm(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50">Batal</button>
                 <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100">Simpan Catatan</button>
               </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT AKTIVITAS */}
      {showLogHistory && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                 <History className="w-4 h-4 text-blue-600" />
                 Riwayat: {selectedItem.nama_barang}
               </h3>
               <button onClick={() => setShowLogHistory(false)} className="p-1.5 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
             </div>
             <div className="p-0 max-h-[60vh] overflow-y-auto">
                {inventarisLogs.filter((l: any) => l.itemId === selectedItem.id).length === 0 ? (
                  <div className="p-12 text-center text-slate-400">Belum ada riwayat aktivitas untuk barang ini.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {inventarisLogs
                      .filter((l: any) => l.itemId === selectedItem.id)
                      .sort((a: any, b: any) => b.tanggal.localeCompare(a.tanggal))
                      .map((log: any) => (
                        <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              log.aktivitas === 'Barang Masuk' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              log.aktivitas === 'Barang Keluar' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                              log.aktivitas === 'Mutasi Barang' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              log.aktivitas === 'Stock Opname' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                              'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {log.aktivitas}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{log.tanggal}</span>
                          </div>
                          
                          {log.aktivitas === 'Barang Masuk' && (
                             <p className="text-sm text-slate-700 mt-2">
                               Masuk <strong className="font-mono">{log.jumlah}</strong> unit dari <strong>{log.supplier}</strong> (Nilai: Rp {(log.total || 0).toLocaleString('id-ID')})
                             </p>
                          )}
                          {log.aktivitas === 'Barang Keluar' && (
                             <p className="text-sm text-slate-700 mt-2">
                               Keluar <strong className="font-mono">{log.jumlah}</strong> unit untuk <strong>{log.tujuan}</strong> <br/>
                               {log.keterangan && <span className="text-xs text-slate-500">{log.keterangan}</span>}
                             </p>
                          )}
                          {log.aktivitas === 'Mutasi Barang' && (
                             <p className="text-sm text-slate-700 mt-2">
                               Dipindah dari <strong>{log.dari_lokasi}</strong> ke <strong>{log.ke_lokasi}</strong> <br/>
                               {log.keterangan && <span className="text-xs text-slate-500">{log.keterangan}</span>}
                             </p>
                          )}
                          {log.aktivitas === 'Stock Opname' && (
                             <p className="text-sm text-slate-700 mt-2">
                               Stok Sistem: <strong className="font-mono">{log.stok_sistem}</strong> &rarr; Stok Fisik: <strong className="font-mono">{log.stok_fisik}</strong> (Selisih: <span className={log.selisih < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{log.selisih}</span>) <br/>
                               {log.catatan && <span className="text-xs text-slate-500">{log.catatan}</span>}
                             </p>
                          )}
                          {!['Barang Masuk', 'Barang Keluar', 'Mutasi Barang', 'Stock Opname'].includes(log.aktivitas) && (
                             <p className="text-sm text-slate-700 font-medium my-1">{log.keterangan || '-'}</p>
                          )}

                          <p className="text-[10px] text-slate-400 italic mt-1">Dicatat oleh: {log.pencatat}</p>
                        </div>
                      ))}
                  </div>
                )}
             </div>
             <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowLogHistory(false)} className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-widest">Tutup</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

