import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Network,
  Siren,
  ShieldAlert,
  MapPin,
  LifeBuoy,
  Users,
  BookOpen,
  FileText,
  LayoutDashboard,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Calendar,
  Search,
  Settings,
  Edit,
  Edit2,
  Edit3,
  Trash2,
  X,
  Download,
  Menu,
  Upload,
  LogOut,
  Lock,
  User,
  Printer,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  Database,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Package,
  History,
  ClipboardList,
  Baby,
  Stethoscope,
  Scale,
  Activity,
  HeartPulse,
  Recycle,
  Wallet,
  TrendingUp,
  HandCoins,
  Vote,
  ShoppingBag,
  ShoppingCart,
  Minus,
  LayoutGrid,
  Phone,
  FileSpreadsheet,
  BookCopy,
  Store,
  ShieldCheck,
  Star,
  UserCheck,
  Image,
  Camera,
  Plus,
  BellOff,
  Monitor,
  UserPlus,
  Archive,
  CheckCircle2,
  Clock,
  RefreshCw,
  Files,
  ArrowRight,
  Smartphone,
  Zap,
  Droplets,
  Train,
  QrCode,
  BarChart3,
  Video,
  FileCheck,
  Globe,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Tag,
  Ticket,
  Gift,
} from "lucide-react";
import BelanjaView from "./components/toko/BelanjaView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import Webcam from "react-webcam";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  limit,
  orderBy,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { auth, storage } from "./firebase";
import { QRCodeSVG } from "qrcode.react";
import KopTemplateManagementView from "./components/KopTemplateManagementView";
import { DaftarPendaftarTrialView } from "./components/DaftarPendaftarTrialView";
import { FreeTrialRegistrationModal } from "./components/FreeTrialRegistrationModal";
import { RTRegistrationForm } from "./components/RTRegistrationForm";
import { PricingSection } from "./components/PricingSection";
import ChatWargaView from "./components/ChatWargaView";
import AIChatBot from "./components/AIChatBot";
import UpgradeModal from "./components/UpgradeModal";
import LeadManagementView from "./components/LeadManagementView";
import { GuestBookFormPublic } from "./components/GuestBookFormPublic";
import { GuestBookQRCode } from "./components/GuestBookQRCode";
import DashboardView from "./components/DashboardView";
import WargaView from "./components/WargaView";
import { IuranView } from "./components/IuranView";
import { PPOBView } from "./components/PPOBView";
import { KasView } from "./components/KasView";
import { SuratView } from "./components/SuratView";
import { BukuTamuView } from "./components/BukuTamuView";
import { FinansialDashboardView } from "./components/FinansialDashboardView";
import { VerifikasiAdminView } from "./components/VerifikasiAdminView";
import { WargaProfileView } from "./components/WargaProfileView";
import { ComplaintView } from "./components/ComplaintView";
import { BookingView } from "./components/BookingView";
import { OrganisasiView } from "./components/OrganisasiView";
import { StyledButton } from "./components/StyledButton";
import { ConfirmModal } from "./components/ui/ConfirmModal";
import { MessageSquare, Bot } from "lucide-react";
import { checkFeatureAccess } from "./services/subscriptionService";
import {
  generateAIReport,
  generateRegionalInsight,
  textToSpeech,
  scanReceiptAI,
} from "./services/aiService";
// import {
//   INITIAL_WARGA_DATA,
//   INITIAL_KAS_DATA,
//   INITIAL_SURAT_DATA,
//   INITIAL_INVENTARIS_DATA,
// } from "./data/initialData";
import { getPlanFeatures, generateSuratHTML, canCreate, canUpdate, canDelete, canView } from "./lib/appUtils";
import { PLAN_FEATURES, PLAN_ALIASES, ADDON_CONFIG } from "./constants";

const APP_LOGO = "/logo_rw.png";

const AppLogo = ({
  className,
  size = 12,
  logoUrl,
}: {
  className?: string;
  size?: number;
  logoUrl?: string;
}) => {
  const [hasError, setHasError] = useState(false);
  const displayLogo = logoUrl || APP_LOGO;

  useEffect(() => {
    setHasError(false);
  }, [logoUrl]);

  return !hasError ? (
    <img
      key={displayLogo}
      src={displayLogo}
      alt="Logo"
      className={className || `w-${size} h-${size} object-contain`}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      draggable={false}
    />
  ) : (
    <div
      className={`${className || `w-${size} h-${size}`} bg-brand-blue/10 rounded-xl flex items-center justify-center p-2`}
    >
      <Shield className="w-full h-full text-brand-blue" />
    </div>
  );
};

// --- INITIAL DUMMY DATA ---
const INITIAL_WARGA_DATA = [
  {
    nama: "Bpk. Ahmad Suhendar",
    nik: "3271012345670001",
    kk: "3271012345678881",
    rt: "01",
    rw: "26",
    blok: "A/01",
    status: "Warga Tetap",
    hp: "081234567890",
    posisi: "Ketua RT",
    profesi: "Guru",
    jk: "Laki-Laki",
    tglLahir: "1980-05-15",
    tglDaftar: "2024-01-10",
  },
  {
    nama: "Ibu Siti Aminah",
    nik: "3271012345670002",
    kk: "3271012345678882",
    rt: "01",
    rw: "26",
    blok: "A/02",
    status: "Warga Tetap",
    hp: "081234567891",
    posisi: "Ibu Rumah Tangga",
    profesi: "Ibu Rumah Tangga",
    jk: "Perempuan",
    tglLahir: "1983-08-20",
    tglDaftar: "2024-01-12",
  },
  {
    nama: "Bpk. Joko Anas",
    nik: "3271012345670003",
    kk: "3271012345678883",
    rt: "02",
    rw: "26",
    blok: "B/05",
    status: "Warga Tetap",
    hp: "081234567892",
    posisi: "Wiraswasta",
    profesi: "Pedagang",
    jk: "Laki-Laki",
    tglLahir: "1975-12-10",
    tglDaftar: "2024-01-15",
  },
  {
    nama: "Sdr. Bayu Pratama",
    nik: "3271012345670004",
    kk: "3271012345678884",
    rt: "03",
    rw: "26",
    blok: "C/10",
    status: "Kontrak",
    hp: "081234567893",
    posisi: "Karyawan Swasta",
    profesi: "Programmer",
    jk: "Laki-Laki",
    tglLahir: "1998-03-25",
    tglDaftar: "2024-03-20",
  },
  {
    nama: "Ibu Ratna Sari",
    nik: "3271012345670005",
    kk: "3271012345678883",
    rt: "02",
    rw: "26",
    blok: "B/05",
    status: "Warga Tetap",
    hp: "081234567894",
    posisi: "Istri",
    profesi: "Karyawan",
    jk: "Perempuan",
    tglLahir: "1978-02-14",
    tglDaftar: "2024-01-15",
  },
  {
    nama: "Bpk. Bambang Pamungkas",
    nik: "3271012345670006",
    kk: "3271012345678886",
    rt: "04",
    rw: "26",
    blok: "D/12",
    status: "Warga Tetap",
    hp: "081234567895",
    posisi: "PNS",
    profesi: "ASN",
    jk: "Laki-Laki",
    tglLahir: "1970-07-07",
    tglDaftar: "2024-02-10",
  },
  {
    nama: "Bpk. Agus Riyadi",
    nik: "3271012345670007",
    kk: "3271012345678887",
    rt: "01",
    rw: "26",
    blok: "A/15",
    status: "Warga Tetap",
    hp: "081234567896",
    posisi: "Buruh",
    profesi: "Buruh",
    jk: "Laki-Laki",
    tglLahir: "1985-11-30",
    tglDaftar: "2024-04-05",
  },
  {
    nama: "Ibu Lilis Suriani",
    nik: "3271012345670008",
    kk: "3271012345678887",
    rt: "01",
    rw: "26",
    blok: "A/15",
    status: "Warga Tetap",
    hp: "081234567897",
    posisi: "Istri",
    profesi: "Desainer",
    jk: "Perempuan",
    tglLahir: "1988-04-12",
    tglDaftar: "2024-04-05",
  },
];

const INITIAL_KAS_DATA = [
  {
    id: "TRX-001",
    tanggal: "20 Jan 2026",
    tipe: "Masuk",
    transaksi: "Kas Lingkungan",
    nama: "Warga",
    keterangan: "Saldo Awal Tahun",
    debit: 4500000,
    kredit: 0,
  },
  {
    id: "TRX-002",
    tanggal: "05 Feb 2026",
    tipe: "Keluar",
    transaksi: "Biaya Listrik",
    nama: "PLN",
    keterangan: "Lampu Jalan & Pos",
    debit: 0,
    kredit: 250000,
  },
  {
    id: "TRX-003",
    tanggal: "12 Feb 2026",
    tipe: "Masuk",
    transaksi: "Iuran Warga",
    nama: "RT 01",
    keterangan: "Iuran Sampah Kolektif Feb",
    debit: 1200000,
    kredit: 0,
  },
  {
    id: "TRX-004",
    tanggal: "02 Mar 2026",
    tipe: "Keluar",
    transaksi: "Biaya Perbaikan",
    nama: "Toko Bangunan",
    keterangan: "Semen & Cat Pos Ronda",
    debit: 0,
    kredit: 450000,
  },
  {
    id: "TRX-005",
    tanggal: "15 Mar 2026",
    tipe: "Masuk",
    transaksi: "Donasi",
    nama: "Bpk. Bambang",
    keterangan: "Sumbangan Acara Bukber",
    debit: 1000000,
    kredit: 0,
  },
  {
    id: "TRX-006",
    tanggal: "02 Apr 2026",
    tipe: "Masuk",
    transaksi: "Iuran Warga",
    nama: "Bpk. Joko",
    keterangan: "Iuran Keamanan Apr",
    debit: 50000,
    kredit: 0,
  },
  {
    id: "TRX-007",
    tanggal: "05 Apr 2026",
    tipe: "Keluar",
    transaksi: "Konsumsi",
    nama: "Warung Makan",
    keterangan: "Rapat Pengurus",
    debit: 0,
    kredit: 150000,
  },
  {
    id: "TRX-008",
    tanggal: "10 Apr 2026",
    tipe: "Masuk",
    transaksi: "Iuran Warga",
    nama: "Ibu Siti",
    keterangan: "Iuran Kebersihan Apr",
    debit: 50000,
    kredit: 0,
  },
  {
    id: "TRX-009",
    tanggal: "15 Apr 2026",
    tipe: "Keluar",
    transaksi: "Transaksi",
    nama: "Kurir",
    keterangan: "Kirim Berkas RW",
    debit: 0,
    kredit: 25000,
  },
  {
    id: "TRX-010",
    tanggal: "18 Apr 2026",
    tipe: "Masuk",
    transaksi: "Donasi",
    nama: "Hamba Allah",
    keterangan: "Kas Mesjid",
    debit: 500000,
    kredit: 0,
  },
  {
    id: "TRX-011",
    tanggal: "19 Apr 2026",
    tipe: "Masuk",
    transaksi: "Iuran Warga",
    nama: "Bpk. Ahmad",
    keterangan: "Iuran Keamanan Apr",
    debit: 50000,
    kredit: 0,
  },
  {
    id: "TRX-012",
    tanggal: "20 Apr 2026",
    tipe: "Keluar",
    transaksi: "Kebersihan",
    nama: "Petugas Sampah",
    keterangan: "Gaji Petugas Apr",
    debit: 0,
    kredit: 750000,
  },
];

const INITIAL_SURAT_DATA = [
  {
    id: "SRT-1004",
    tanggal: "19 Apr 2026",
    pemohon: "Ibu Siti Aminah",
    jenisSurat: "Surat Domisili",
    status: "Menunggu Persetujuan RT",
  },
  {
    id: "SRT-1003",
    tanggal: "17 Apr 2026",
    pemohon: "Bpk. Ahmad Suhendar",
    jenisSurat: "Pengantar Kelurahan",
    status: "Selesai",
  },
  {
    id: "SRT-1002",
    tanggal: "16 Apr 2026",
    pemohon: "Sdr. Bayu Pratama",
    jenisSurat: "Surat Keterangan Usaha",
    status: "Menunggu Persetujuan RT",
  },
  {
    id: "SRT-1001",
    tanggal: "10 Apr 2026",
    pemohon: "Bpk. Joko Anas",
    jenisSurat: "Surat Domisili",
    status: "Selesai",
  },
];

const INITIAL_IURAN_DATA = [];

const INITIAL_INVENTARIS_DATA = [
  {
    id: "INV-BRG-001",
    nama_barang: "Kursi Lipat Merek Chitose",
    kategori: "Aset Tenda & Kursi",
    jumlah: 50,
    kondisi: "Baik",
    lokasi: "Gudang RT 01",
    tanggal_pengadaan: "2024-01-10",
    keterangan: "Pengadaan Mandiri",
  },
  {
    id: "INV-BRG-002",
    nama_barang: "Tenda 3x4 Meter",
    kategori: "Aset Tenda & Kursi",
    jumlah: 2,
    kondisi: "Baik",
    lokasi: "Gudang RW",
    tanggal_pengadaan: "2023-05-15",
    keterangan: "Bantuan Desa",
  },
  {
    id: "INV-BRG-003",
    nama_barang: "Sound System Portable",
    kategori: "Elektronik",
    jumlah: 1,
    kondisi: "Rusak Ringan",
    lokasi: "Pos Kamling",
    tanggal_pengadaan: "2022-11-20",
    keterangan: "Mic kadang putus",
  },
];

// NOTE: Kategori Inventaris dikelola secara dinamis melalui Firestore (koleksi: inventaris_kategori).
// Anda dapat menambahkannya melalui fitur "Kategori" pada menu Inventaris di aplikasi.

// Removed redundant plan constants and functions

// Removed duplicate generateSuratHTML

// Global utility helpers
export function getTrialStatus(tenant: any, currentUser?: any) {
  if (!tenant) {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30, daysRemainingFrozen: 30 };
  }
  
  if (currentUser?.isSuperAdmin || tenant.id === "MASTER" || tenant.id === "rw26_berjuang") {
    return { phase: "PAID" as const, daysRemainingActive: 9999, daysRemainingFrozen: 9999 };
  }

  const isPaidPremium = tenant.id === "rw26_berjuang" || 
                        tenant.id === "trihprw26" || 
                        (tenant.id && tenant.id.endsWith("_rw26_berjuang")) ||
                        ["PREMIUM", "PRIME", "ENTERPRISE"].some((st: string) => tenant.status?.toUpperCase()?.includes(st));

  const isStarter = !isPaidPremium && (!tenant.status || 
                    ["STARTER", "GRATIS", "BASIC", "TRIAL", "ACTIVE"].includes(tenant.status?.toUpperCase()));

  if (!isStarter) {
    return { phase: "PAID" as const, daysRemainingActive: 9999, daysRemainingFrozen: 9999 };
  }

  let createdAt = tenant.createdAt;
  if (!createdAt) {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30, daysRemainingFrozen: 30 };
  }

  const startDate = typeof createdAt === "string" 
    ? new Date(createdAt) 
    : (createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000));
  
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 60) {
    return { phase: "DELETED" as const, daysRemainingActive: 0, daysRemainingFrozen: 0 };
  } else if (diffDays >= 30) {
    return { phase: "FROZEN" as const, daysRemainingActive: 0, daysRemainingFrozen: 60 - diffDays };
  } else {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30 - diffDays, daysRemainingFrozen: 30 };
  }
}

const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  // Format anticipated: "YYYY-MM-DD"
  const parts = tglLahir.split("-");
  if (parts.length !== 3) return "-";
  const birthDate = new Date(
    parseInt(parts[0]),
    parseInt(parts[1]) - 1,
    parseInt(parts[2]),
  );
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function App() {
  console.log("App component: DB exists?", !!db);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [wargaAuth, setWargaAuth] = useState<any>(null); // For custom citizen login
  const [impersonatedTenantId, setImpersonatedTenantId] = useState<
    string | null
  >(localStorage.getItem("impersonatedTenantId"));
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("TRIAL");
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true); // Default show for announcement
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const alertedSOSRef = useRef<Set<string>>(new Set());
  const appStartTime = useRef(Date.now());

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email?: string;
    tenantId?: string;
    isSuperAdmin?: boolean;
    [key: string]: any;
  } | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // --- FIREBASE AUTH SYNC ---
  useEffect(() => {
    // 0. Validate Connection to Firestore (Critical Constraint with watchdog retry & online monitoring)
    let retryTimeoutId: any = null;
    let initialDelayId: any = null;
    let isUnmounted = false;

    const testConnection = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setDbStatus("OFFLINE");
        return;
      }
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        if (!isUnmounted) {
          setDbError(null);
          setDbStatus("ONLINE");
        }
      } catch (error: any) {
        console.warn(
          "Firestore Connectivity Check:",
          error.message || error.code,
        );
        if (isUnmounted) return;
        
        if (
          error instanceof Error &&
          (error.message.includes("the client is offline") ||
            error.message.includes("Could not reach Cloud Firestore") ||
            error.message.includes("failed to connect"))
        ) {
          setDbStatus("OFFLINE");
        } else if (error?.code === "unavailable") {
          setDbStatus("UNAVAILABLE");
        }

        // Resilient retry watchdog inside sandboxed or iframe browser environment
        if (navigator.onLine && !retryTimeoutId) {
          retryTimeoutId = setTimeout(() => {
            retryTimeoutId = null;
            if (!isUnmounted) {
              testConnection();
            }
          }, 25000); // retry every 25 seconds if browser is online but firestore hasn't synced yet
        }
      }
    };

    // Delay slightly to give Firestore connection time to establish its background channel gracefully
    initialDelayId = setTimeout(() => {
      if (!isUnmounted) {
        testConnection();
      }
    }, 2500);

    const handleOnline = () => {
      console.log("Device is online. Triggering Firestore diagnostic check...");
      testConnection();
    };

    const handleOffline = () => {
      console.log("Device is offline. Flagging offline local mode.");
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
      setDbStatus("OFFLINE");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Ensure persistence
    setPersistence(auth, browserLocalPersistence);

    const userProfileCache: Record<string, any> = {};

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check session cache first to prevent redundant quota usage
          const cachedProfile = sessionStorage.getItem(`user_profile_${user.uid}`);
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              setCurrentUser({ uid: user.uid, ...parsed });
              setIsAuthInitializing(false);
              // We still want to verify if the profile exists in background or just proceed
              // To be safe and save quota, we'll return here if we have a cache
              return;
            } catch (e) {
              sessionStorage.removeItem(`user_profile_${user.uid}`);
            }
          }

          // Fetch additional user info/role from Firestore
          const userDocRef = doc(db, "users", user.uid);
          let userDoc;

          if (userProfileCache[user.uid]) {
            userDoc = userProfileCache[user.uid];
          } else {
            console.log("Fetching user profile for UID:", user.uid);
            try {
              userDoc = await getDoc(userDocRef);
            } catch (err: any) {
              if (err.code === "permission-denied") {
                console.warn(
                  "Permission denied reading users collection for UID (Auth sync delay), retrying...",
                  user.uid,
                );
                await new Promise((resolve) => setTimeout(resolve, 1500));
                userDoc = await getDoc(userDocRef);
              } else if (err.message?.includes("quota") || err.code === "resource-exhausted") {
                  // If quota hit, we might have a dead lock. Try to use minimal info if possible
                  setCurrentUser({ uid: user.uid, name: user.email || "User", role: "Viewer", tenantId: "GUEST" });
                  setIsAuthInitializing(false);
                  return;
              } else {
                throw err;
              }
            }
            if (userDoc && userDoc.exists()) {
              userProfileCache[user.uid] = userDoc;
            }
          }

          if (userDoc && userDoc.exists()) {
            let userData = userDoc.data() as any;

            // --- AUTO MIGRATION & REPAIR LOGIC ---
            const isTrihUser =
              user.email?.toLowerCase().includes("trihprw26") ||
              user.email?.toLowerCase().includes("handoko");
            let needsUpdate = false;

            if (isTrihUser && userData.tenantId !== "rw26_berjuang") {
              userData.tenantId = "rw26_berjuang";
              userData.role = "RW";
              needsUpdate = true;
            }

            const isMasterEmail =
              user.email?.toLowerCase() === "arifrajcoach@gmail.com";
            if (isMasterEmail) {
              const isAdminStatusWrong =
                userData.role !== "SUPER_ADMIN" ||
                !userData.isSuperAdmin ||
                userData.tenantId !== "MASTER";

              userData.isSuperAdmin = true;
              userData.role = "SUPER_ADMIN";
              userData.tenantId = "MASTER";
              if (!userData.name || userData.name === "User") {
                userData.name = "Bpk. Arif (Super Admin)";
              }
              if (isAdminStatusWrong) needsUpdate = true;
            }

            if (needsUpdate) {
              try {
                await updateDoc(userDocRef, {
                  isSuperAdmin: userData.isSuperAdmin || false,
                  role: userData.role,
                  name: userData.name,
                  tenantId: userData.tenantId,
                });
              } catch (e) {
                console.warn("Could not sync profile repairs to DB.", e);
              }
            }
            
            // Cache the final profile
            sessionStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(userData));
            setCurrentUser({ uid: user.uid, ...userData });
          } else if (user.isAnonymous) {
            // Anonymous Citizen Bypass for Super Admin
            const overrideAdmin = user.uid === "MKe94buSU4SMg8jiRbCcOLwJp9H3";
            setCurrentUser({
              name: overrideAdmin
                ? "Bpk. Arif (Super Admin Override)"
                : "Warga (Anonymous)",
              role: overrideAdmin ? "SUPER_ADMIN" : "Warga",
              uid: user.uid,
              tenantId: overrideAdmin ? "MASTER" : "rw26_berjuang",
              isSuperAdmin: overrideAdmin,
            });
          } else {
            // If No Firestore doc yet, check if they are pre-registered by email (both "PRE_email" and USR-based entries)
            const preRegDocRef = doc(
              db,
              "users",
              "PRE_" + (user.email?.toLowerCase() || "NONE"),
            );
            const preRegDoc = await getDoc(preRegDocRef);

            let preRegUserData = null;
            let docToDeleteRef = null;

            if (preRegDoc.exists()) {
              preRegUserData = preRegDoc.data();
              docToDeleteRef = preRegDocRef;
            } else if (user.email) {
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("email", "==", user.email));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                const matchedUser = querySnapshot.docs[0];
                if (matchedUser.id !== user.uid) {
                  preRegUserData = matchedUser.data();
                  docToDeleteRef = doc(db, "users", matchedUser.id);
                }
              }
            }

            if (preRegUserData) {
              // Linked pre-registered / admin-created user
              const newUser = {
                ...preRegUserData,
                id_user: user.uid,
                uid: user.uid,
              };

              await setDoc(doc(db, "users", user.uid), newUser);
              if (docToDeleteRef) {
                await deleteDoc(docToDeleteRef);
              }

              setCurrentUser({ uid: user.uid, ...newUser } as any);
            } else {
              // Otherwise check if they are the hardcoded super admin or trih user
              const isMasterEmail =
                user.email?.toLowerCase() === "arifrajcoach@gmail.com";
              const isTrihUser =
                user.email?.toLowerCase().includes("trihprw26") ||
                user.email?.toLowerCase().includes("handoko");

              if (isMasterEmail || isTrihUser) {
                const newUser = {
                  id_user: user.uid,
                  name: isMasterEmail
                    ? "Bpk. Arif (Super Admin)"
                    : "Admin RW Berjuang",
                  nama: isMasterEmail
                    ? "Bpk. Arif (Super Admin)"
                    : "Admin RW Berjuang",
                  username: user.email?.split("@")[0] || "user",
                  role: isMasterEmail ? "SUPER_ADMIN" : "RW",
                  email: user.email,
                  tenantId: isMasterEmail ? "MASTER" : "rw26_berjuang",
                  isSuperAdmin: isMasterEmail,
                  rt: "01",
                  status: "AKTIF",
                  created_at: new Date().toISOString(),
                };
                await setDoc(userDocRef, newUser);
                setCurrentUser(newUser as any);
              } else {
                // Unauthorized session without a Firestore document
                await signOut(auth);
                setCurrentUser(null);
                // Note: Ensure setDbError is available or available in scope.
                // Based on lines 1147, it was available.
                if (typeof setDbError === "function")
                  setDbError(
                    "Akun Google Anda belum terdaftar di sistem. Silakan mendaftar Trial atau minta Admin untuk mendaftarkan Anda.",
                  );
              }
            }
          }
        } catch (error: any) {
          if (
            error?.message?.includes("offline") ||
            error?.code === "unavailable"
          ) {
            console.warn("Client is offline, using fallback auth profile.");
            setCurrentUser({ name: user.email || "User", role: "Viewer" });
          } else {
            console.error("Error fetching user profile:", error);
            if (error?.code !== "permission-denied") {
              setCurrentUser({ name: user.email || "User", role: "Viewer" });
            } else {
              // Handle profile read denial explicitly
              setCurrentUser(null);
              setDbError(
                "Profil Anda belum aktif atau tidak memiliki izin akses. Hubungi Admin.",
              );
            }
          }
        }
      } else {
        setCurrentUser(null);
      }
      setIsAuthInitializing(false);
    });

    return () => {
      isUnmounted = true;
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      if (initialDelayId) {
        clearTimeout(initialDelayId);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (wargaAuth) {
        setWargaAuth(null);
      } else {
        await signOut(auth);
      }
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // --- CENTRAL STATE WITH LOCALSTORAGE PERSISTENCE ---
  const [globalSelectedRw, setGlobalSelectedRw] = useState<string>("Semua");

  const isSpecialTenant = (val: string) => {
    const v = val.toLowerCase();
    return v.includes('berjuang') || v.includes('_') || v.includes('smart') || v.includes('trih');
  };

  const normalizeRwValue = (rwVal: any): string => {
    const raw = (rwVal || "").toString().trim();
    if (!raw) return "";

    if (isSpecialTenant(raw)) return raw;

    const digits = raw.match(/\d+/);
    return digits ? digits[0].padStart(2, "0") : raw;
  };

  const [wargaData, setWargaData] = useState(() => {
    const saved = localStorage.getItem("rw26_wargaData");
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let has05 = false;
          parsed = parsed.map(w => {
            const rawRw = String(w.rw || "").trim();
            if (rawRw.includes("05")) {
              has05 = true;
              return { ...w, rw: "26" };
            }
            return w;
          });
          if (has05) {
            localStorage.setItem("rw26_wargaData", JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch(e) {}
    }
    return INITIAL_WARGA_DATA;
  });

  const [kasData, setKasData] = useState(() => {
    const saved = localStorage.getItem("rw26_kasData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Corrupted kasData detected, self-healing memory check run...", e);
        try { localStorage.removeItem("rw26_kasData"); } catch (_) {}
      }
    }
    return INITIAL_KAS_DATA;
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [suratData, setSuratData] = useState(() => {
    const saved = localStorage.getItem("rw26_suratData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Corrupted suratData detected, self-healing memory check run...", e);
        try { localStorage.removeItem("rw26_suratData"); } catch (_) {}
      }
    }
    return INITIAL_SURAT_DATA;
  });

  const [iuranData, setIuranData] = useState<any[]>([]);
  const [ppobData, setPpobData] = useState<any[]>([]);

  const [inventarisData, setInventarisData] = useState(() => {
    const saved = localStorage.getItem("rw26_inventarisData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Corrupted inventarisData detected, self-healing memory check run...", e);
        try { localStorage.removeItem("rw26_inventarisData"); } catch (_) {}
      }
    }
    return INITIAL_INVENTARIS_DATA;
  });

  const [inventarisLogs, setInventarisLogs] = useState<any[]>([]);
  const [inventarisKategori, setInventarisKategori] = useState<any[]>([]);
  const [inventarisLokasi, setInventarisLokasi] = useState<any[]>([]);
  const [inventarisSupplier, setInventarisSupplier] = useState<any[]>([]);

  const [balitaData, setBalitaData] = useState<any[]>([]);
  const [ibuHamilData, setIbuHamilData] = useState<any[]>([]);
  const [posyanduKegiatanData, setPosyanduKegiatanData] = useState<any[]>([]);
  const [posbinduKegiatanData, setPosbinduKegiatanData] = useState<any[]>([]);
  const [pemeriksaanBalitaData, setPemeriksaanBalitaData] = useState<any[]>([]);
  const [pemeriksaanPosbinduData, setPemeriksaanPosbinduData] = useState<any[]>(
    [],
  );
  const [imunisasiData, setImunisasiData] = useState<any[]>([]);
  const [sampahKategoriData, setSampahKategoriData] = useState<any[]>([]);
  const [sampahSetoranData, setSampahSetoranData] = useState<any[]>([]);
  const [sampahTarikSaldoData, setSampahTarikSaldoData] = useState<any[]>([]);
  const [emergenciesData, setEmergenciesData] = useState<any[]>([]);
  const [verifikasiWargaData, setVerifikasiWargaData] = useState<any[]>([]);
  const [bukuTamuData, setBukuTamuData] = useState<any[]>([]);
  const [votingCandidates, setVotingCandidates] = useState<any[]>([]);
  const [votingConfig, setVotingConfig] = useState<any>({
    status: "CLOSED",
    aturan: "",
  });
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [tokoProducts, setTokoProducts] = useState<any[]>([]);
  const [tokoOrders, setTokoOrders] = useState<any[]>([]);
  const [tokoReviews, setTokoReviews] = useState<any[]>([]);
  const [complaintsData, setComplaintsData] = useState<any[]>([]);
  const [bookingsData, setBookingsData] = useState<any[]>([]);
  const [isSOSTriggering, setIsSOSTriggering] = useState(false);
  const [hiddenEmergencyId, setHiddenEmergencyId] = useState<string | null>(null);

  const [usersData, setUsersData] = useState<any[]>([]);
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [kopSettings, setKopSettings] = useState<Record<string, any>>({});

  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbStatus, setDbStatus] = useState<
    "ONLINE" | "OFFLINE" | "UNAVAILABLE" | "INITIALIZING"
  >("INITIALIZING");
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  const darkMode = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.remove(
      "light",
      "dark",
      "oceanic",
      "forest",
      "sunset",
      "pink-baby",
    );
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const themes = [
      "light",
      "dark",
      "oceanic",
      "forest",
      "sunset",
      "pink-baby",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    setNotification({
      message: `Tema diubah ke ${nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1)}`,
      type: "info",
    });
    setTimeout(() => setNotification(null), 2000);
  };

  // Keep toggleDarkMode for compatibility
  const toggleDarkMode = cycleTheme;

  const activeEmergency = emergenciesData.find((e) => {
    if (e.status !== "ACTIVE" || e.id === hiddenEmergencyId) return false;
    const emTime = e.timestamp ? new Date(e.timestamp).getTime() : (e.createdAt?.toMillis?.() || Date.now());
    
    const isMine = e.userId === auth.currentUser?.uid;
    const isNewSinceAppStart = emTime > appStartTime.current - 20000; // 20s buffer for clock drift
    
    // ONLY show if it's the user's own SOS OR if it's a new SOS that occurred while app is open
    // This prevents stale/old SOS from screaming on every login or refresh.
    return isMine || isNewSinceAppStart;
  });

  useEffect(() => {
    // Redundant - audio logic is in SOSOverlay
  }, [activeEmergency?.id]);

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [isSOSConfirmOpen, setIsSOSConfirmOpen] = useState(false);
  const [isSelfRegistering, setIsSelfRegistering] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  // Extract and normalize the RT restriction of the active tenant
  const tenantRT = useMemo(() => {
    // 1. Check if settings.rt is configured
    if (settings?.rt) {
      return settings.rt.toString().replace(/^0+/, "").padStart(2, "0");
    }
    // 2. Extrapolate from tenant name
    const fullName =
      currentTenant?.nama || currentTenant?.name || settings?.nama_rt || "";
    const match = fullName.match(/RT\s*(\d+)/i);
    if (match) {
      return match[1].padStart(2, "0");
    }
    // 3. Extrapolate from tenant ID
    const idStr = (currentTenant?.id || "").toLowerCase();
    const matchId = idStr.match(/rt\s*(\d+)/i);
    if (matchId) {
      return matchId[1].padStart(2, "0");
    }
    return null;
  }, [currentTenant, settings]);

  // Centrally filtered data based on the tenant's specific RT if restricted
  const extractRtNorm = (rtVal: any) => {
    const wRtRaw = (rtVal || "").toString();
    const match = wRtRaw.match(/rt\s*(\d+)/i) || wRtRaw.match(/\d+/);
    const wRtNorm = match ? match[1] || match[0] : wRtRaw;
    return wRtNorm.replace(/^0+/, "");
  };

  const checkWorkspaceFilter = (w: any, globalRw: string) => {
    if (!globalRw || globalRw === "Semua") return true;
    const lowRw = globalRw.toLowerCase();
    const lowW = (w.tenantId || "").toLowerCase();

    // Isolate developer master tenant and its sub-tenants from wildcard/keyword matching
    const isRw26BerjuangSystem = (tIdId: string) => tIdId === "rw26_berjuang" || tIdId.endsWith("_rw26_berjuang");
    if (isRw26BerjuangSystem(lowRw) || isRw26BerjuangSystem(lowW)) {
       if (isRw26BerjuangSystem(lowRw) && isRw26BerjuangSystem(lowW)) {
          if (lowRw === "rw26_berjuang") return true;
          return lowW === lowRw || lowW === "rw26_berjuang";
       }
       return false;
    }

    // Isolation for Berjuang cluster RTs
    // If filtering by a specific RT unit, it must match exactly or match the parent
    if (lowRw.includes("rt") && lowRw.includes("berjuang")) {
       return lowW === lowRw || lowW === "rw26_berjuang" || lowW === "rw_berjuang";
    }

    // Expansion for Berjuang cluster (Parent Dashboard View)
    if ((lowRw === "rw26_berjuang" || lowRw === "rw_berjuang") && lowW.includes("berjuang")) return true;

    // Expansion for Trih cluster
    if (lowRw.includes("trih") && lowW.includes("trih")) return true;
    // Expansion for RW26 smart cluster
    if (lowRw.includes("rw26") && lowW.includes("rw26") && !lowRw.includes("berjuang") && !lowW.includes("berjuang")) return true;

    if (isSpecialTenant(globalRw)) {
      return (lowW === lowRw) || normalizeRwValue(w.rw) === globalRw;
    }
    return normalizeRwValue(w.rw) === globalRw;
  };

  const isDeletedTrial = useMemo(() => {
    if (!currentTenant) return false;
    return getTrialStatus(currentTenant, currentUser).phase === "DELETED";
  }, [currentTenant, currentUser]);

  const filteredWargaDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = wargaData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [wargaData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredIuranDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = iuranData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [iuranData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredKasDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = kasData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [kasData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredSuratDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = suratData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [suratData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredVerifikasiWargaDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = verifikasiWargaData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [verifikasiWargaData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredBalitaDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = balitaData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [balitaData, tenantRT, globalSelectedRw, isDeletedTrial]);

  const filteredIbuHamilDataCentral = useMemo(() => {
    if (isDeletedTrial) return [];
    let result = ibuHamilData;
    if (tenantRT) {
      const targetRtNorm = tenantRT.replace(/\D/g, "").replace(/^0+/, "");
      result = result.filter((w: any) => extractRtNorm(w.rt) === targetRtNorm);
    }
    if (globalSelectedRw && globalSelectedRw !== "Semua") {
      result = result.filter((w: any) => checkWorkspaceFilter(w, globalSelectedRw));
    }
    return result;
  }, [ibuHamilData, tenantRT, globalSelectedRw, isDeletedTrial]);

  // Securely resolve active tenant IDs for filtering
  const activeTenantIds = useMemo(() => {
    const baseTenantId =
      currentUser?.tenantId || wargaAuth?.tenantId || "rw26_berjuang";
    const tId =
      currentUser?.isSuperAdmin && selectedTenantId
        ? selectedTenantId
        : baseTenantId;
    
    const list = new Set<string>([tId]);

    // Gather all valid options from actual tenant collection
    const addChildren = (parentId: string) => {
      tenantsData.forEach(t => {
        if (t.parentId === parentId) {
          if (!list.has(t.id)) {
            list.add(t.id);
            addChildren(t.id);
          }
        }
      });
    };
    
    addChildren(tId);

    // Give children context for their parent
    let current = tenantsData.find(t => t.id === tId);
    while (current && current.parentId) {
      if (!list.has(current.parentId)) {
        list.add(current.parentId);
      }
      current = tenantsData.find(t => t.id === current?.parentId);
    }
    
    return Array.from(list);
  }, [currentUser, wargaAuth, selectedTenantId, tenantsData]);

  // Tenant friendly name display format mapper
  const getTenantFriendlyName = (tId: string) => {
    const tenantObj = tenantsData.find(t => t.id === tId);
    if (tenantObj && tenantObj.name) {
      return tenantObj.name;
    }

    const fallbackNames: Record<string, string> = {
      "rw26_berjuang": "RW 26 Berjuang",
      "trihprw26": "RW 26 Trih",
      "rt01_rw26_berjuang": "RT 01 Berjuang",
      "rt02_rw26_berjuang": "RT 02 Berjuang",
      "rt03_rw26_berjuang": "RT 03 Berjuang",
      "rt04_rw26_berjuang": "RT 04 Berjuang",
    };

    if (fallbackNames[tId]) return fallbackNames[tId];

    let clean = tId;
    if (clean.includes("_")) {
      const parts = clean.split("_");
      clean = parts.map(p => p.toUpperCase()).join(" ");
    }
    return clean;
  };

  // Synchronized active workspace list (Only actual active tenant IDs)
  const realRWList = useMemo(() => {
    const validTenantIdsSet = new Set<string>();

    tenantsData.forEach(t => {
      if (t.id) {
        validTenantIdsSet.add(t.id);
      }
    });

    const list = new Set<string>();
    activeTenantIds.forEach((tId) => {
      if (validTenantIdsSet.has(tId)) {
        list.add(tId);
      }
    });

    const orderedList = Array.from(list).sort((a, b) => {
      const tenantA = tenantsData.find(t => t.id === a);
      const tenantB = tenantsData.find(t => t.id === b);
      if (!tenantA?.parentId) return -1;
      if (!tenantB?.parentId) return 1;
      return a.localeCompare(b);
    });

    return orderedList;
  }, [activeTenantIds, tenantsData]);

  // Centrally filtered user accounts matching the active tenant and security privileges
  const filteredUsersDataCentral = useMemo(() => {
    let filtered = usersData;

    // 1. A Tenant Admin must only see users that belong to their active tenant/sub-tenant group
    filtered = filtered.filter((u: any) => {
      const userTenantId = u.tenantId || "rw26_berjuang";
      return activeTenantIds.includes(userTenantId);
    });

    // 2. Non-Super-Admins should NEVER see SUPER_ADMIN accounts in their list
    if (!currentUser?.isSuperAdmin) {
      filtered = filtered.filter(
        (u: any) => u.role !== "SUPER_ADMIN" && !u.isSuperAdmin,
      );
    }

    return filtered;
  }, [usersData, activeTenantIds, currentUser]);

  const linkedWarga = useMemo(() => {
    const targetNik = currentUser?.nikMapping || currentUser?.nik;
    if (!targetNik) return null;
    return filteredWargaDataCentral.find((w: any) => w.nik === targetNik) || null;
  }, [currentUser, filteredWargaDataCentral]);

  const mergedWargaProfile = useMemo(() => {
    return {
      ...(linkedWarga || {}),
      ...(wargaAuth || {}),
      nik: linkedWarga?.nik || wargaAuth?.nik || currentUser?.nik || currentUser?.nikMapping || "",
      nama: linkedWarga?.nama || wargaAuth?.nama || currentUser?.name || currentUser?.displayName || "Warga",
      email: linkedWarga?.email || wargaAuth?.email || currentUser?.email || "",
      rt: linkedWarga?.rt || wargaAuth?.rt || currentUser?.rt || "01",
      rw: linkedWarga?.rw || wargaAuth?.rw || currentUser?.rw || "26",
      tenantId: linkedWarga?.tenantId || wargaAuth?.tenantId || currentUser?.tenantId || "rw26_berjuang",
      terverifikasi: linkedWarga?.terverifikasi === true || wargaAuth?.terverifikasi === true || currentUser?.status === "Disetujui" || false
    };
  }, [linkedWarga, wargaAuth, currentUser]);

  // Enforce Max Warga limit locally for UI based on Plan
  const cappedWargaData = useMemo(() => {
    if (!currentTenant) return filteredWargaDataCentral.slice(0, 50);
    const isFree =
      currentTenant.status === "TRIAL" || currentTenant.status === "FREE";
    const maxWargaLimit = isFree
      ? 50
      : getPlanFeatures(currentTenant).maxWarga || 50;
    return filteredWargaDataCentral.slice(0, maxWargaLimit);
  }, [filteredWargaDataCentral, currentTenant]);

  const userPhoto =
    (currentUser as any)?.photoUrl ||
    linkedWarga?.foto ||
    linkedWarga?.ktpUrl ||
    null;

  // Derived Access Roles
  const roleUpperApp = currentUser?.role?.toUpperCase() || "";
  const isViewer = roleUpperApp === "VIEWER" || roleUpperApp === "TAMU";
  const isCitizen = roleUpperApp === "WARGA" || (!currentUser && !!wargaAuth);
  const hasFullAccess =
    !!currentUser && !isCitizen && !isViewer && roleUpperApp !== "VIEWER";

  useEffect(() => {
    if (currentUser?.role === "Viewer" || (!currentUser && wargaAuth)) {
      if (
        activeTab === "dashboard" ||
        activeTab === "transaksi" ||
        activeTab === "kas" ||
        activeTab === "posyandu"
      ) {
        setActiveTab("warga");
      }
    }
  }, [currentUser, wargaAuth, activeTab]);

  const handleTriggerSOS = async () => {
    if (!currentUser) return;

    // Feedback getar saat tombol SOS awal ditekan
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([200]); // Getar pendek
      } catch (e) {}
    }

    setIsSOSConfirmOpen(true);
  };

  const confirmSOS = async () => {
    setIsSOSConfirmOpen(false);
    setIsSOSTriggering(true);

    // Add vibration for supported devices
    if ("vibrate" in navigator) {
      try {
        navigator.vibrate([1000, 500, 1000, 500]);
      } catch (e) {}
    }

    // Play immediate war sound
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(
        800,
        audioCtx.currentTime + 1.5,
      );
      oscillator.frequency.linearRampToValueAtTime(
        300,
        audioCtx.currentTime + 3,
      );
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 2.5);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 3);
    } catch (e) {
      console.error("Audio API warning/not supported", e);
    }

    try {
      const id = `SOS-${Date.now()}`;
      let userLocation = "Lokasi Tidak Diketahui";
      let lat = 0;
      let lng = 0;

      // Try to get geolocation
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0,
              });
            },
          );
          lat = position.coords.latitude;
          lng = position.coords.longitude;
          userLocation = `Koordinat: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        } catch (geoErr) {
          console.warn("Geolocation failed", geoErr);
        }
      }

      // Fallback or Append Address if NIK is linked
      const linkedWarga = (currentUser as any).nikMapping
        ? wargaData.find((w) => w.nik === (currentUser as any).nikMapping)
        : null;
      let addressStr = "";
      let userPhone = "";
      let userEmail = currentUser.email || "";
      let userPhoto = "";

      if (linkedWarga) {
        addressStr = `Alamat: Blok ${linkedWarga.blok || "-"}, RT ${linkedWarga.rt || "-"}/RW ${linkedWarga.rw || "-"}`;
        userPhone = (linkedWarga as any).hp || "";
        userPhoto = (linkedWarga as any).foto || "";
        if ((linkedWarga as any).email) userEmail = (linkedWarga as any).email;
      }

      const sosData = {
        tenantId: currentUser.tenantId || "rw26_berjuang",
        id,
        userId: auth.currentUser?.uid || "anonymous",
        userName: currentUser.name,
        userLocation: userLocation,
        userAddress: addressStr,
        rt: linkedWarga?.rt || "-",
        rw: linkedWarga?.rw || "-",
        userPhone: userPhone,
        userEmail: userEmail,
        userPhoto: userPhoto,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        status: "ACTIVE",
      };

      await setDoc(doc(db, "emergencies", id), sosData);
      showNotification("Sinyal Darurat Terkirim!", "error");
    } catch (err) {
      handleFirestoreError(err, "create", "emergencies");
    } finally {
      setIsSOSTriggering(false);
    }
  };

  const handleResolveSOS = async (id: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "emergencies", id), {
        status: "RESOLVED",
        resolvedBy: currentUser.name,
        resolvedAt: new Date().toISOString(),
      });
      showNotification("Sinyal Darurat Dinonaktifkan", "success");
    } catch (err) {
      handleFirestoreError(err, "update", "emergencies");
    }
  };

  // --- FIREBASE SYNC (REAL-TIME CORE DATA) ---
  useEffect(() => {
    if (!currentUser && !wargaAuth) {
      setIsLoadingDB(false);
      return;
    }
    const tIds = activeTenantIds;
    const tId = currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "rw26_berjuang");

    setIsLoadingDB(true);
    let loadedSections = 0;
    const requiredSections = 1; // Base settings

    const onDataLoaded = () => {
      loadedSections++;
      if (loadedSections >= requiredSections) {
        setIsLoadingDB(false);
      }
    };

    // 1. Settings (Global)
    const unsubSettings = onSnapshot(doc(db, "settings", tId), (snap) => {
      if (snap.exists()) setSettings(snap.data());
      onDataLoaded();
    }, (err) => {
      handleFirestoreError(err, "get", `settings/${tId}`);
      onDataLoaded();
    });

    // 2. Tenant (Global)
    const unsubCurrentTenant = tId === "MASTER" ? (() => {
      setCurrentTenant({ id: "MASTER", name: "SUPER ADMIN", status: "ENTERPRISE" });
      onDataLoaded();
      return () => {};
    })() : onSnapshot(doc(db, "tenants", tId), (snap) => {
      if (snap.exists()) setCurrentTenant(snap.data());
      onDataLoaded();
    });

    // 3. SOS (Global) - Important for safety
    let isInitialLoad = true;
    const unsubEmergencies = onSnapshot(
      query(collection(db, "emergencies"), where("tenantId", "in", tIds)),
      (snap) => {
        setEmergenciesData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        snap.docChanges().forEach(change => {
           if (change.type === "added" && change.doc.data().status === "ACTIVE") {
              const data = change.doc.data();
              const sosTime = data.timestamp ? new Date(data.timestamp).getTime() : (data.createdAt?.toMillis?.() || Date.now());
              
              const isMine = data.userId === auth.currentUser?.uid;
              const isNewSinceAppStart = sosTime > appStartTime.current - 5000; 
              
              if (isMine || isNewSinceAppStart) {
                 // Reveal ONLY new SOS, don't force-reveal on modifications
                 setHiddenEmergencyId(null);
              }
           }
        });
        isInitialLoad = false;
      },
      (err) => handleFirestoreError(err, "list", "emergencies")
    );

    return () => {
      unsubSettings();
      unsubCurrentTenant();
      unsubEmergencies();
    };
  }, [currentUser?.uid, selectedTenantId, currentTenant?.parentId]);

  // --- FIREBASE SYNC (TAB-SPECIFIC LAZY LOADING) ---
  
  // Helper to normalize RT
  const getQueryRtNormalized = (rtVal: any): string => {
    const rtStr = (rtVal || "").toString();
    const match = rtStr.match(/rt\s*(\d+)/i) || rtStr.match(/\d+/);
    const num = match ? match[1] || match[0] : rtStr;
    return num ? num.replace(/^0+/, "").padStart(2, "0") : "01";
  };

  // 1. Warga & Users Sync
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    if (activeTab !== "warga" && activeTab !== "dashboard" && activeTab !== "users") return;

    const tIds = activeTenantIds;
    const constraints = [where("tenantId", "in", tIds), limit(1000)];
    if (currentUser?.role === "RT") {
      constraints.push(where("rt", "==", getQueryRtNormalized(currentUser.rt)));
    }

    const unsubWarga = onSnapshot(query(collection(db, "data_warga"), ...constraints), (snap) => {
      setWargaData(snap.docs.map(doc => ({ docId: doc.id, ...doc.data() })));
    });

    let unsubUsers = () => {};
    if (currentUser?.isSuperAdmin || ["ADMIN", "RW", "RT"].includes(currentUser?.role || "")) {
      const uq = currentUser?.isSuperAdmin ? query(collection(db, "users")) : query(collection(db, "users"), where("tenantId", "in", tIds));
      unsubUsers = onSnapshot(query(uq, limit(1000)), (snap) => {
        setUsersData(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
      });
    }

    return () => { unsubWarga(); unsubUsers(); };
  }, [activeTab, activeTenantIds, currentUser?.uid]);

  // 2. Financial Sync (Kas, Iuran, PPOB)
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    if (!["keuangan", "dashboard"].includes(activeTab)) return;

    const tIds = activeTenantIds;
    const rt = currentUser?.role === "RT" ? getQueryRtNormalized(currentUser.rt) : null;
    
    let unsubKas = () => {};
    if (hasFullAccess) {
      const kq = rt ? query(collection(db, "kas"), where("tenantId", "in", tIds), where("rt", "==", rt), orderBy("tanggal", "desc"), limit(100)) : query(collection(db, "kas"), where("tenantId", "in", tIds), orderBy("tanggal", "desc"), limit(100));
      unsubKas = onSnapshot(kq, (snap) => setKasData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    }

    const iuranQ = hasFullAccess ? 
      (rt ? query(collection(db, "iuran"), where("tenantId", "in", tIds), where("rt", "==", rt)) : query(collection(db, "iuran"), where("tenantId", "in", tIds))) :
      query(collection(db, "iuran"), where("tenantId", "in", tIds), where("userId", "==", auth.currentUser?.uid || ""));
    
    const unsubIuran = onSnapshot(query(iuranQ, limit(1000)), (snap) => setIuranData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));

    return () => { unsubKas(); unsubIuran(); };
  }, [activeTab, activeTenantIds, currentUser?.uid, hasFullAccess]);

  // 3. Posyandu & Health Sync
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    if (activeTab !== "posyandu") return;

    const tIds = activeTenantIds;
    const collections = ["balita", "ibu_hamil", "posyandu_kegiatan", "posbindu_kegiatan", "pemeriksaan_balita", "pemeriksaan_posbindu", "imunisasi"];
    const unsubs = collections.map(col => {
      const q = query(collection(db, col), where("tenantId", "in", tIds), limit(100));
      return onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (col === "balita") setBalitaData(data);
        else if (col === "ibu_hamil") setIbuHamilData(data);
        else if (col === "posyandu_kegiatan") setPosyanduKegiatanData(data);
        else if (col === "posbindu_kegiatan") setPosbinduKegiatanData(data);
        else if (col === "pemeriksaan_balita") setPemeriksaanBalitaData(data);
        else if (col === "pemeriksaan_posbindu") setPemeriksaanPosbinduData(data);
        else if (col === "imunisasi") setImunisasiData(data);
      });
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [activeTab, activeTenantIds, currentUser?.uid]);

  // 4. Inventory, Trash Bank, Store & more
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tIds = activeTenantIds;
    const unsubs: (() => void)[] = [];

    // Inventaris
    if (activeTab === "inventaris") {
      unsubs.push(onSnapshot(query(collection(db, "inventaris"), where("tenantId", "in", tIds)), (snap) => setInventarisData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))));
      unsubs.push(onSnapshot(query(collection(db, "inventaris_logs"), where("tenantId", "in", tIds)), (snap) => setInventarisLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))));
    }

    // Bank Sampah
    if (activeTab === "bank-sampah") {
      ["sampah_kategori", "sampah_setoran", "sampah_tarik_saldo"].forEach(c => {
         unsubs.push(onSnapshot(query(collection(db, c), where("tenantId", "in", tIds), limit(200)), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (c === "sampah_kategori") setSampahKategoriData(data);
            else if (c === "sampah_setoran") setSampahSetoranData(data);
            else setSampahTarikSaldoData(data);
         }));
      });
    }

    // Shop/Store
    if (activeTab === "etoko") {
       unsubs.push(onSnapshot(query(collection(db, "toko_products"), where("tenantId", "in", tIds)), snap => setTokoProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))));
       unsubs.push(onSnapshot(query(collection(db, "toko_orders"), where("tenantId", "in", tIds)), snap => setTokoOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))));
    }

    return () => unsubs.forEach(u => u());
  }, [activeTab, activeTenantIds, currentUser?.uid]);

  // 5. Surat, Voting, Booking & Misc Sync
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tIds = activeTenantIds;
    const unsubs: (() => void)[] = [];

    // Surat
    if (activeTab === "surat" || activeTab === "dashboard") {
       unsubs.push(onSnapshot(query(collection(db, "surat"), where("tenantId", "in", tIds), limit(500)), snap => {
          setSuratData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
       }));
    }

    // Voting
    if (activeTab === "voting") {
       unsubs.push(onSnapshot(query(collection(db, "voting_candidates"), where("tenantId", "in", tIds)), snap => setVotingCandidates(snap.docs.map(d => ({ ...d.data() })))));
       unsubs.push(onSnapshot(doc(db, "voting_config", currentUser?.tenantId || "rw26_berjuang"), snap => snap.exists() && setVotingConfig(snap.data())));
    }

    // Booking
    if (activeTab === "booking" || activeTab === "dashboard") {
       unsubs.push(onSnapshot(query(collection(db, "bookings"), where("tenantId", "in", tIds)), snap => setBookingsData(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    }

    // Complaints
    if (activeTab === "complaint" || activeTab === "dashboard") {
       unsubs.push(onSnapshot(query(collection(db, "complaints"), where("tenantId", "in", tIds)), snap => setComplaintsData(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    }

    // Verifikasi
    if (activeTab === "verifikasi" || activeTab === "dashboard") {
       unsubs.push(onSnapshot(query(collection(db, "verifikasi_warga"), where("tenantId", "in", tIds)), snap => setVerifikasiWargaData(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
    }

    return () => unsubs.forEach(u => u());
  }, [activeTab, activeTenantIds, currentUser?.uid]);

  // Real-time synchronization of all tenants
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    
    // For normal users, we might want to restrict this, but for hierarchy to work 
    // in activeTenantIds, we need at least the parent/child structure.
    // In this app, many views depend on tenantsData for name mapping and hierarchy.
    const q = query(collection(db, "tenants"), orderBy("createdAt", "desc"));
    const unsubTenants = onSnapshot(q, (snap) => {
      setTenantsData(snap.docs.map(doc => ({ id: doc.id, docId: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Failed to subscribe to tenants:", err);
    });

    return () => unsubTenants();
  }, [currentUser, wargaAuth]);

  // 6. Automation: Tenant Subscription Follow-up (2 months after expiration)
  useEffect(() => {
    const checkTenantFollowups = async () => {
      if (!currentUser?.isSuperAdmin || tenantsData.length === 0) return;

      const now = new Date();
      const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;

      for (const tenant of tenantsData) {
        if (['EXPIRED', 'TRIAL', 'BASIC', 'INACTIVE'].includes(tenant.status)) {
          const endDate = tenant.endDate ? new Date(tenant.endDate) : (tenant.createdAt ? new Date(tenant.createdAt) : null);
          if (!endDate) continue;

          const diff = now.getTime() - endDate.getTime();
          if (diff > sixtyDaysInMs && !tenant.autoFollowedUpAfterTwoMonths) {
            try {
              await updateDoc(doc(db, 'tenants', tenant.docId || tenant.id), {
                autoFollowedUpAfterTwoMonths: true,
                lastAutoFollowUpAt: new Date().toISOString()
              });
            } catch (e) {
              console.error("Failed to update tenant follow up:", e);
            }
          }
        }
      }
    };
    checkTenantFollowups();
  }, [currentUser?.isSuperAdmin, tenantsData.length]);

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
        const currentMonth = today.toLocaleDateString("id-ID", {
          month: "short",
          year: "numeric",
        });

        wargaData.forEach((w: any) => {
          const isLunas = iuranData.some(
            (i: any) =>
              i.nama === w.nama &&
              i.periode.includes(currentMonth) &&
              i.status === "Lunas",
          );
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
  const handleFirestoreError = (
    err: any,
    op: "create" | "update" | "delete" | "list" | "get" | "write",
    path: string,
  ) => {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isQuotaError =
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("resource-exhausted") ||
      err?.code === "resource-exhausted" ||
      errorMessage.includes("quota metric");

    if (isQuotaError) {
      if (!quotaExceeded) {
        setQuotaExceeded(true);
        setIsLoadingDB(false);
        showNotification(
          "Batas penggunaan harian (Quota) tercapai. Aplikasi akan masuk mode offline.",
          "error",
        );
        console.warn(
          "Firestore Quota Exceeded. Reading/Writing disabled until tomorrow.",
        );
      }
      return; 
    }

    if (err?.code === 'unavailable' || errorMessage.includes('Could not reach Cloud Firestore')) {
       console.warn(`Firestore Unavailable for ${op} on ${path}:`, errorMessage);
       setDbStatus("UNAVAILABLE");
       // Don't flood user with notifications for every failed poll, but maybe show a subtle indicator
       return; 
    }

    const errInfo = {
      error: errorMessage,
      operationType: op,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: currentUser?.tenantId || "unknown",
        providerInfo:
          auth.currentUser?.providerData?.map((provider) => ({
            providerId: provider.providerId,
            email: provider.email,
          })) || [],
      },
    };
    console.error("Firestore Error: ", JSON.stringify(errInfo));
    showNotification(
      `Akses Gagal: ${op.toUpperCase()} pada ${path}. Sesi anda mungkin habis atau izin ditolak.`,
    );
    // throw removed for stability
  };

  // Helper for uploading files. In this environment, Firebase Storage (bucket) might not be fully initialized.
  // We use Base64 encoding and image compression as a fallback so the app works without the Storage bucket.
  const handleFileUpload = async (
    file: File,
    folder: string,
    onProgress?: (pct: number) => void,
  ) => {
    console.log(`Starting base64 encoding for ${folder}:`, file.name);

    if (onProgress) onProgress(10);

    return new Promise<string>((resolve, reject) => {
      const isImage = file.type.startsWith("image/");
      const reader = new FileReader();

      reader.onload = (e) => {
        if (onProgress) onProgress(50);
        const result = e.target?.result as string;

        if (isImage) {
          // Compress image to fit well within Firestore's 1MB document limit
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              if (onProgress) onProgress(100);
              resolve(canvas.toDataURL("image/jpeg", 0.6)); // Compress to 60% JPEG
            } else {
              if (onProgress) onProgress(100);
              resolve(result);
            }
          };
          img.onerror = () => {
            showNotification("Gagal memproses gambar.", "error");
            reject(new Error("Failed to load image for compression"));
          };
          img.src = result;
        } else {
          // For non-images (PDFs), Firestore max document size is 1MB (~700KB before base64)
          if (file.size > 700 * 1024) {
            const errMsg =
              "File PDF/Dokumen terlalu besar. Maksimal 700KB untuk upload karena keterbatasan database.";
            showNotification(errMsg, "error");
            reject(new Error(errMsg));
            return;
          }
          if (onProgress) onProgress(100);
          resolve(result);
        }
      };

      reader.onerror = (e) => {
        showNotification("Gagal membaca file.", "error");
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  };

  // Effect to sync data to localStorage (keep as secondary backup)
  useEffect(() => {
    localStorage.setItem("rw26_wargaData", JSON.stringify(wargaData));
  }, [wargaData]);
  useEffect(() => {
    localStorage.setItem("rw26_kasData", JSON.stringify(kasData));
  }, [kasData]);
  useEffect(() => {
    localStorage.setItem("rw26_suratData", JSON.stringify(suratData));
  }, [suratData]);
  useEffect(() => {
    localStorage.setItem("rw26_iuranData", JSON.stringify(iuranData));
  }, [iuranData]);

  useEffect(() => {
    // DEV AUTO-ACTIVATE: Ensure our main developer has all features enabled
    const autoActivate = async () => {
      if (
        currentUser?.email === "arifrajcoach@gmail.com" &&
        currentTenant &&
        currentTenant.status !== "PREMIUM" &&
        currentTenant.status !== "ENTERPRISE"
      ) {
        const tId = currentUser.tenantId || "rw26_berjuang";
        if (tId === "MASTER") return; // Skip virtual tenant update
        console.log("Auto-activating PREMIUM for dev account...");
        try {
          await updateDoc(doc(db, "tenants", tId), {
            status: "PREMIUM",
            updatedAt: new Date().toISOString(),
          });
          // Also set as super admin for this login session
          if (!currentUser.isSuperAdmin) {
            setCurrentUser((prev) =>
              prev
                ? { ...prev, isSuperAdmin: true, role: "SUPER_ADMIN" }
                : null,
            );
          }
        } catch (e) {
          console.error("Auto-activation failed", e);
        }
      }
    };
    autoActivate();
  }, [currentUser?.email, currentTenant?.status]);

  const handleLinkToWarga = async (nik: string, pin: string) => {
    setIsLoadingDB(true);
    try {
      const searchKey = nik.trim().toLowerCase();
      const pinKey = pin.trim();

      const warga = wargaData.find(
        (w) =>
          (w.nik && w.nik.toLowerCase() === searchKey) ||
          (w.nama && w.nama.toLowerCase() === searchKey),
      );

      if (!warga) {
        showNotification(
          "Data warga tidak ditemukan. Gunakan NIK atau Nama Lengkap.",
          "error",
        );
        setIsLoadingDB(false);
        return;
      }

      const isMatch =
        (warga.no_kk && warga.no_kk === pinKey) ||
        (warga.telepon && warga.telepon === pinKey) ||
        (warga.hp && warga.hp === pinKey);

      if (!isMatch) {
        showNotification("Kunci (KK atau No. HP) salah.", "error");
        setIsLoadingDB(false);
        return;
      }

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const nameToUse = warga.nama || auth.currentUser.displayName || "Warga";

        await setDoc(
          userRef,
          {
            role: "Warga",
            nik: warga.nik || "",
            name: nameToUse,
            tenantId: warga.tenantId || currentTenant?.id || "rw26_berjuang",
            linkedResidentId: warga.id || warga.id_warga || warga.nik || "",
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );

        showNotification(
          `Berhasil! Selamat datang Bpk/Ibu ${nameToUse}.`,
          "success",
        );
      }
    } catch (err) {
      handleFirestoreError(err, "update", "users");
    } finally {
      setIsLoadingDB(false);
    }
  };

  // 1A. Handle Public Self-Registration via QR
  const queryParams = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  );
  const regTenantId = queryParams.get("reg");

  // --- VIEW SELECTION (Must be after all hooks) ---

  const renderableNavItems = useMemo(() => {
    const isApt = settings?.themeMode === "apartemen";
    return [
      { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
      {
        id: "warga",
        label: isApt ? "Data Penghuni" : "Data Warga",
        icon: Users,
      },
      // --- KEBUTUHAN WARGA ---
      {
        id: "buku-tamu",
        label: "Keamanan Digital",
        icon: BookCopy,
        plan: "bukuTamu",
      },
      {
        id: "complaint",
        label: isApt ? "Keluhan/Defect" : "Keluhan",
        icon: AlertTriangle,
        plan: "complaint",
      },
      {
        id: "booking",
        label: isApt ? "Booking Fasilitas" : "Booking Fasum",
        icon: Calendar,
        plan: "booking",
      },
      {
        id: "etoko",
        label: "E-LAPAK26",
        icon: ShoppingBag,
        plan: "eLapak",
        minPlan: "BASIC",
      },
      {
        id: "voting",
        label: isApt ? "Voting Penghuni" : "E-Pemilu",
        icon: Vote,
        plan: "ePemilu",
        minPlan: "PRO",
      },
      { id: "organisasi", label: "Struktur Organisasi", icon: Network },
      {
        id: "chat",
        label: "Grup Chat",
        icon: MessageSquare,
        plan: "chatMode",
        minPlan: "BASIC",
      },
      {
        id: "ai-bot",
        label: "AI Agent",
        icon: Bot,
        plan: "ai",
        minPlan: "PREMIUM",
      },
      // --- FITUR OPERATOR ---
      {
        id: "verifikasi",
        label: "VERIFIKASI",
        icon: ShieldCheck,
        plan: "verifikasi",
        minPlan: "BASIC",
      },
      {
        id: "keuangan",
        label: isApt ? "Keuangan / IPL" : "Keuangan",
        icon: CreditCard,
        plan: "keuangan",
        minPlan: "BASIC",
      },
      {
        id: "posyandu",
        label: "Kesehatan",
        icon: Baby,
        plan: "posyandu",
        minPlan: "PRO",
      },
      {
        id: "bank-sampah",
        label: "Bank Sampah",
        icon: Recycle,
        plan: "bankSampah",
        minPlan: "PRO",
      },
      {
        id: "inventaris",
        label: "Inventaris",
        icon: Package,
        plan: "inventaris",
      },
      // --- FITUR ADMIN ---
      {
        id: "surat",
        label: "Surat",
        icon: FileText,
        plan: "surat",
        minPlan: "BASIC",
      },
      { id: "kop-template", label: "KOP & Template", icon: FileSpreadsheet },
      { id: "leads", label: "CRM & Leads", icon: Users },
      {
        id: "daftar-trial",
        label: "Pendaftar Trial",
        icon: UserPlus,
        badge: tenantsData.filter(
          (t) =>
            (t.id.startsWith("TRIAL_") ||
              t.status === "TRIAL" ||
              t.plan === "TRIAL") &&
            t.followUpStatus === "NEW",
        ).length,
      },
      { id: "users", label: "Manage User", icon: User },
      { id: "super-admin", label: "Manajemen Tenant", icon: Shield },
      {
        id: "monitoring",
        label: "MONITORING",
        icon: LayoutGrid,
        plan: "multiRegion",
        minPlan: "PRO",
      },
      {
        id: "audit",
        label: "GOVERNANCE",
        icon: Shield,
        plan: "governance",
        minPlan: "PRO",
      },
      { id: "pengaturan", label: "Pengaturan", icon: Settings, minPlan: "BASIC" },
    ]
      .filter((item) => {
        const role = (currentUser?.role || "TAMU").toUpperCase();
        const isSuperAdmin = !!currentUser?.isSuperAdmin;
        const isVerified = linkedWarga?.terverifikasi === true;
        const planConfig = getPlanFeatures(currentTenant);
        const isFreePlan =
          (currentTenant?.status || "TRIAL") === "TRIAL" ||
          (currentTenant?.status || "TRIAL") === "FREE";

        const planLevels: Record<string, number> = {
          'TRIAL': 0, 'FREE': 0, 'STARTER': 0,
          'BASIC': 1, 'FLASH': 1, 'LITE': 1, 'RT': 1,
          'PRO': 2, 'RW': 2,
          'PREMIUM': 3, 'GOLD': 3,
          'ENTERPRISE': 4, 'DIAMOND': 4, 'PRIME': 4, 'GOV': 4
        };

        const currentPlanStatus = (currentTenant?.status || 'TRIAL')
          .toUpperCase()
          .replace("V4.0 ", "")
          .replace("PLAN", "")
          .trim();
        
        const currentLevel = planLevels[currentPlanStatus] || 0;
        const requiredLevel = item.minPlan ? (planLevels[item.minPlan] || 0) : 0;

        // Hide items strictly above plan level (Gatekeeper)
        if (requiredLevel > currentLevel) return false;

        const isPlatformOwner = currentUser?.email?.toLowerCase() === "arifrajcoach@gmail.com";
        const restrictedItems = ["daftar-trial", "super-admin", "leads"];
        if (restrictedItems.includes(item.id) && !isPlatformOwner) return false;
        
        if (isSuperAdmin) return true;
        if (
          role === "WARGA" &&
          !isVerified &&
          item.id !== "dashboard" &&
          item.id !== "verifikasi"
        )
          return false;
        if ((role === "ADMIN" || role === "RT") && isFreePlan) {
          if (["inventaris", "posyandu", "bank-sampah"].includes(item.id))
            return false;
        }

        const rolePermissions: { [key: string]: string[] } = {
          SUPER_ADMIN: [
            "dashboard",
            "warga",
            "buku-tamu",
            "verifikasi",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "kop-template",
            "leads",
            "daftar-trial",
            "users",
            "super-admin",
            "pengaturan",
            "chat",
            "ai-bot",
            "monitoring",
            "audit",
          ],
          KELURAHAN_ADMIN: [
            "dashboard",
            "warga",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "users",
            "chat",
            "ai-bot",
            "monitoring",
            "audit",
          ],
          ADMIN: [
            "dashboard",
            "warga",
            "buku-tamu",
            "verifikasi",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "kop-template",
            "users",
            "pengaturan",
            "chat",
            "ai-bot",
            "monitoring",
            "audit",
          ],
          RW: [
            "dashboard",
            "warga",
            "buku-tamu",
            "verifikasi",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "kop-template",
            "users",
            "chat",
            "ai-bot",
            "monitoring",
            "audit",
            "pengaturan",
          ],
          RT: [
            "dashboard",
            "warga",
            "buku-tamu",
            "verifikasi",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "kop-template",
            "users",
            "chat",
            "ai-bot",
            "complaint",
            "booking",
            "pengaturan",
          ],
          OPERATOR: [
            "dashboard",
            "warga",
            "buku-tamu",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "inventaris",
            "surat",
            "chat",
            "ai-bot",
          ],
          SEKRETARIS: [
            "dashboard",
            "warga",
            "buku-tamu",
            "verifikasi",
            "inventaris",
            "surat",
            "kop-template",
            "chat",
            "ai-bot",
            "complaint",
            "booking",
          ],
          BENDAHARA: ["dashboard", "keuangan", "bank-sampah", "chat", "ai-bot"],
          SATPAM: ["dashboard", "buku-tamu"],
          KADER: ["dashboard", "posyandu", "bank-sampah", "chat", "ai-bot"],
          WARGA: [
            "dashboard",
            "verifikasi",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "surat",
            "chat",
            "ai-bot",
            "complaint",
            "booking",
            "inventaris",
          ],
          TAMU: ["dashboard", "etoko"],
          VIEWER: ["dashboard", "etoko"],
        };

        const allowed = rolePermissions[role] || ["dashboard"];
        if (item.id === "organisasi") return true;
        return allowed.includes(item.id);
      })
      .map((item) => {
        const role = (currentUser?.role || "TAMU").toUpperCase();
        const planConfig = getPlanFeatures(currentTenant);
        const isLocked =
          item.plan &&
          (!currentTenant || (planConfig as any)[item.plan] === false || (planConfig as any)[item.plan] === "NONE");

        let label = item.label;
        let icon = item.icon;
        if (item.id === "verifikasi" && role === "WARGA") {
          label = "Profil & Layanan";
          icon = User;
        }

        return { ...item, isLocked, label, icon };
      });
  }, [currentUser, linkedWarga, currentTenant, settings]);

  if (window.location.pathname.startsWith("/guestbook/")) {
    const tenantId = window.location.pathname.split("/")[2];
    return <GuestBookFormPublic tenantId={tenantId} />;
  }

  if (quotaExceeded) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-500/20 rounded-3xl flex items-center justify-center mb-8 animate-pulse border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-4">
          Quota Terlampaui
        </h1>
        <div className="max-w-md bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm mb-8">
          <p className="text-slate-300 leading-relaxed font-medium">
            Batas penggunaan gratis harian (Firestore Quota) untuk sistem ini
            telah tercapai.
          </p>
          <p className="text-slate-400 text-sm mt-4 italic">
            Akses data akan dipulihkan secara otomatis besok saat limit direset
            oleh Google Cloud. Detail dapat dilihat di konsol Firebase (Spark
            Plan).
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Halaman
        </button>
        <p className="mt-12 text-white/20 font-mono text-[10px] uppercase tracking-[0.5em]">
          System Offline Mode v1.0
        </p>
      </div>
    );
  }

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-soft-blue border-t-brand-blue rounded-full animate-spin mb-6"></div>
          <AppLogo
            size={8}
            className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"
            logoUrl={settings?.org_logo_url || settings?.logo_url}
          />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight font-['Georgia'] mb-2">
          <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmartRW</span>
          {' '}
          <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
        </h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
          Menyiapkan Sesi Keamanan...
        </p>
      </div>
    );
  }

  if (regTenantId) {
    return (
      <SelfRegistrationView
        tenantId={regTenantId}
        onClose={() => (window.location.href = "/")}
        handleFileUpload={handleFileUpload}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
      />
    );
  }

  if (isSelfRegistering) {
    return (
      <SelfRegistrationView
        tenantId={currentUser?.tenantId || "rw26_berjuang"}
        onClose={() => setIsSelfRegistering(false)}
        handleFileUpload={handleFileUpload}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
      />
    );
  }

  if (
    !wargaAuth &&
    (!currentUser ||
      (currentUser.role === "Warga" &&
        currentUser.name === "Warga (Anonymous)"))
  ) {
    return (
      <>
        <LoginView
          setWargaAuth={setWargaAuth}
          wargaData={filteredWargaDataCentral}
          verifikasiWargaData={verifikasiWargaData}
          isLoadingDB={isLoadingDB}
          onSelfRegister={() => setIsSelfRegistering(true)}
          onShowFreeTrial={() => setShowFreeTrialModal(true)}
          onShowPricing={() => setShowPricingModal(true)}
          settings={settings}
          tenantId={currentUser?.tenantId || "rw26_berjuang"}
          initialEmail={prefilledEmail}
          initialMode={prefilledEmail ? "admin" : "admin"}
        />
        {showFreeTrialModal && (
          <FreeTrialRegistrationModal
            onClose={() => setShowFreeTrialModal(false)}
            showNotification={showNotification}
            initialPlan={selectedPlan}
            onSuccess={(email: string) => {
              setPrefilledEmail(email);
              setShowFreeTrialModal(false);
              showNotification('Selamat datang di lingkungan Smart RW AI - Enjoy Yahh', 'success');
              // Automatically try to login with prefilled email if possible or just let them click login
            }}
          />
        )}
        {showPricingModal && (
          <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="min-h-full flex items-center justify-center py-10">
              <div className="bg-white rounded-[3rem] w-full max-w-5xl relative overflow-hidden">
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="absolute top-8 right-8 z-10 p-3 bg-slate-100 rounded-full hover:bg-slate-200"
                >
                  <X className="w-6 h-6" />
                </button>
                <PricingSection
                  onSelectPlan={(planId) => {
                    setSelectedPlan(planId);
                    setShowPricingModal(false);
                    setShowFreeTrialModal(true);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // CHECK TRIAL EXPIRY BLOCKER (FROZEN OR DELETED PHASES)
  if (currentTenant) {
    const trialStatus = getTrialStatus(currentTenant, currentUser);
    if (trialStatus.phase === "DELETED") {
      return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
          {/* Decorative ambient background */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-xl w-full bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl text-center relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/15 border border-red-500/30 rounded-3xl flex items-center justify-center text-red-400 mb-6 shadow-inner animate-bounce">
              <Trash2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight leading-snug">
              Data Uji Coba Telah Dihapus!
            </h2>
            <div className="mt-2 text-red-400 font-extrabold uppercase text-[10px] tracking-widest pl-3 pr-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 inline-block mb-6">
              Masa Tenggat 60 Hari Terlampaui
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Uji coba wilayah <strong className="text-slate-200 uppercase">{currentTenant.name || "Anda"}</strong> telah melewati tenggat 60 hari. Sesuai dengan kebijakan privasi dan pembersihan data berkala SmartRW AI, database wilayah Anda <strong>telah dihapus secara permanen</strong> dari server kami.
            </p>

            <div className="w-full bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl mb-8 text-left space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Info Kebijakan Sistem:
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1 bg-transparent font-sans list-disc list-inside">
                <li>Hari 1-30: Masa uji coba penuh aktif.</li>
                <li>Hari 31-60: Data dibekukan & disimpan aman.</li>
                <li>Hari 61: Penghapusan data permanen tak terpulihkan.</li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => window.open(`https://wa.me/6287726741143?text=Halo%20Admin%20SmartRW%20AI,%20kami%20terbawa%20penghapusan%20data%20karena%20telat%20upgrade%20untuk%20tenant%20${currentTenant.id}.%20Apakah%20kami%20bisa%20daftar%20baru?`, "_blank")}
                className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 active:scale-95 shadow-xl shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
              >
                Hubungi Admin WA 💬
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all"
              >
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (trialStatus.phase === "FROZEN") {
      return (
        <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
          {/* Decorative ambient background */}
          <div className="absolute top-10 right-10 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-xl w-full bg-slate-900/40 backdrop-blur-3xl border border-slate-800/80 p-8 sm:p-10 rounded-3xl shadow-2xl text-center relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-500/15 border border-amber-500/30 rounded-3xl flex items-center justify-center text-amber-400 mb-6 shadow-inner animate-pulse duration-[2s]">
              <Lock className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight leading-snug">
              Masa Uji Coba Selesai!
            </h2>
            <div className="mt-2 text-rose-450 font-extrabold uppercase text-[10px] tracking-widest pl-3 pr-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20 inline-block mb-6">
              Sistem Terkunci • Mode Penyimpanan Aman
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Uji coba gratis 30 hari untuk wilayah <strong className="text-slate-200 uppercase">{currentTenant.name || "Anda"}</strong> telah berakhir. Seluruh data warga, keuangan, dan surat pengantar Anda tetap tersimpan dengan aman, namun database <strong>terkunci sementara</strong> hingga Anda melakukan upgrade paket.
            </p>

            {/* Countdown Area */}
            <div className="w-full bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl mb-8 flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Sisa Waktu Penyimpanan Data Anda:
              </span>
              <div className="flex items-baseline gap-1.5 text-white">
                <span className="text-4xl font-extrabold font-mono text-amber-500 animate-pulse">{trialStatus.daysRemainingFrozen}</span>
                <span className="text-sm font-black uppercase text-slate-400">Hari Lagi</span>
              </div>
              <span className="text-[10px] text-slate-400 italic mt-2 text-center">
                Perhatian: Pada hari ke-61, data Anda akan dihapus secara otomatis & permanen oleh sistem.
              </span>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => window.open(`https://wa.me/6287726741143?text=Halo%20Admin%20SmartRW%20AI,%20kami%20tertarik%20dengan%20info%20paket%20dan%20aktivasi%20SmartRW%20AI%20premium%20untuk%20wilayah%20kami%20${currentTenant.id}.%20Saat%20ini%20status%20kami%20Free%20Trial%20Frozen.`, "_blank")}
                className="flex-1 px-6 py-4 bg-brand-pink text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-pink/90 active:scale-95 shadow-xl shadow-brand-pink/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 animate-bounce" />
                Upgrade Sekarang ⚡
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 active:scale-95 transition-all"
              >
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (wargaAuth && !currentUser?.isSuperAdmin) {
    return (
      <WargaProfileView
        wargaData={mergedWargaProfile}
        verifikasiData={verifikasiWargaData}
        suratData={suratData}
        setSuratData={setSuratData}
        setWargaAuth={setWargaAuth}
        tenantId={mergedWargaProfile.tenantId || "rw26_berjuang"}
        isLoadingDB={isLoadingDB}
        setIsLoadingDB={setIsLoadingDB}
        handleFileUpload={handleFileUpload}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
        kopSettings={kopSettings}
        getSetting={getSetting}
        usersData={filteredUsersDataCentral}
        generateSuratHTML={generateSuratHTML}
        settings={settings}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans print:h-auto print:bg-white text-sm relative transition-colors duration-300">
      {/* SOS EMERGENCY OVERLAY */}
      <AnimatePresence>
        {activeEmergency && (
          <SOSOverlay
            key={activeEmergency.id}
            emergency={activeEmergency}
            onResolve={(id) => {
              handleResolveSOS(id);
              setActiveTab("dashboard");
            }}
            onCloseLocal={() => setHiddenEmergencyId(activeEmergency.id)}
            setActiveTab={setActiveTab}
            canResolve={(() => {
              const role = (currentUser?.role || "").toUpperCase();
              const isPrivileged = 
                role === "ADMIN" || 
                role === "PENGURUS" || 
                role === "SATPAM" || 
                currentUser?.isSuperAdmin;
              const isOwner = auth.currentUser?.uid === activeEmergency.userId;
              return isPrivileged || isOwner;
            })()}
          />
        )}
      </AnimatePresence>

      {quotaExceeded && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10001] bg-white border-2 border-red-500 rounded-2xl shadow-2xl p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 max-w-md w-full mx-auto">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Kuota Firestore Terlampaui
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              Batas penggunaan gratis harian (Quota) telah tercapai. Kuota akan
              direset besok. Informasi detail kuota dapat ditemukan di konsol
              Firebase (Spark Plan).
            </p>
          </div>
          <button
            onClick={() => setQuotaExceeded(false)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {isLoadingDB && (
        <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md transition-colors">
          <div className="absolute inset-0 bg-mesh opacity-50 -z-10 animate-pulse"></div>
          <div className="relative mb-8 pt-4">
            <div className="w-24 h-24 border-8 border-brand-blue/10 border-t-brand-blue border-r-brand-pink rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <AppLogo
                size={12}
                className="w-12 h-12 drop-shadow-lg"
                logoUrl={settings?.org_logo_url || settings?.logo_url}
              />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-3 py-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] font-bold text-brand-blue animate-bounce transition-colors">
              LOADING
            </div>
          </div>
          <h2 className="font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-1 font-elegant transition-colors" style={{ fontSize: "29px" }}>
            <span className="font-bold flex items-center justify-center gap-1">
              <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmartRW</span>
              <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
            </span>
          </h2>
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-6 transition-colors">
            Berdampak & Memberdayakan
          </p>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 font-elegant tracking-tight transition-colors">
              Powered by Nexapps
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium text-sm leading-relaxed transition-colors">
              Mohon tunggu sebentar, kami sedang menyiapkan lingkungan yang
              ceria untuk Anda...
            </p>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60  z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:relative z-50 md:z-auto w-72 md:w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800 flex flex-col h-full print:hidden transition-all duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full shadow-2xl md:shadow-none"} rounded-r-3xl md:rounded-none`}
      >
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 relative overflow-hidden group rounded-tr-3xl md:rounded-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl group-hover:bg-brand-pink/20 transition-all duration-700"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-yellow/10 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="flex justify-between w-full mb-6">
              <button
                onClick={cycleTheme}
                className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-90 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-brand-blue/30"
                title={darkMode ? "Switch to Light Mode" : "Switch to Night View"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </button>
              <div className="w-10 h-10 md:hidden"></div>
            </div>

            <div className="relative group/logo mb-6 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 to-brand-pink/20 rounded-3xl blur-md opacity-0 group-hover/logo:opacity-100 transition-all duration-500 scale-110"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center p-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 group-hover/logo:scale-105 transition-all duration-500">
                <AppLogo
                  size={12}
                  className="w-12 h-12"
                  logoUrl={
                    currentTenant?.logo_url ||
                    settings?.tenant_system_logo ||
                    settings?.org_logo_url ||
                    settings?.logo_url
                  }
                />
              </div>
              {hasFullAccess && (
                <button
                  onClick={() => setActiveTab("pengaturan")}
                  className="absolute -bottom-2 -right-2 bg-brand-blue text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-800 hover:scale-110 active:scale-90 transition-all opacity-0 group-hover/logo:opacity-100 backdrop-blur-sm z-20"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="text-center px-2">
              <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight font-elegant leading-none">
                {currentTenant?.name || settings?.nama_rt ? (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-pink uppercase">
                    {currentTenant?.name || settings?.nama_rt}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 justify-center">
                    <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent font-black">SmartRW</span>
                    <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent font-black drop-shadow-[0_1px_1px_rgba(251,113,133,0.3)] ml-0.5">AI</span>
                  </span>
                )}
              </h1>
              {(currentTenant?.name || settings?.nama_rt) && (
                <div className="mt-2 space-y-1.5 flex flex-col items-center">
                  {(currentTenant?.tagline || settings?.tagline) && (
                    <p className="text-[12px] font-bold text-brand-pink dark:text-pink-400 italic text-center leading-normal max-w-[180px]">
                      "{currentTenant?.tagline || settings?.tagline}"
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-brand-blue/5 to-cyan-500/5 border border-brand-blue/10 rounded-full !mt-[6px]">
                    <Zap className="w-2.5 h-2.5 text-brand-blue animate-pulse" />
                    <span className="text-[10px] font-black text-brand-blue uppercase tracking-wider">
                      {(currentTenant?.status || "STARTER").toUpperCase()} PLAN
                    </span>
                  </div>
                  <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none !mt-[-1px]">
                    Nexapps Intelligent
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-red-500 md:hidden bg-white/80 dark:bg-slate-800/80 rounded-2xl transition-all absolute top-4 right-4 border border-slate-100 dark:border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div style={{ height: '137.08px', paddingTop: '-8px', marginBottom: '-39px' }} className="flex-shrink-0 px-6 py-5 bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="relative flex">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-green animate-ping opacity-20"></div>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest !mt-[-4px]">
              System Active
            </p>
          </div>
          <div className="p-3 bg-white/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-brand-blue/20">
            {getPlanFeatures(currentTenant).multiRegion ? (
              <div className="space-y-1.5">
                <label className="text-[9px] text-brand-blue font-black uppercase tracking-widest pl-1">
                  Wilayah Kerja
                </label>
                <div className="relative">
                  <select
                    value={globalSelectedRw}
                    onChange={(e) => setGlobalSelectedRw(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold py-2 pl-3 pr-8 outline-none text-slate-700 dark:text-slate-200 appearance-none shadow-inner cursor-pointer"
                  >
                    <option value="Semua">🏢 KELURAHAN (PUSAT)</option>
                    {realRWList.map((rw) => {
                      const friendlyLabel = getTenantFriendlyName(rw);
                      const isCurrentActive = currentUser?.tenantId === rw || wargaAuth?.tenantId === rw;
                      return (
                        <option key={rw} value={rw}>
                          🏠 {friendlyLabel} {isCurrentActive ? "(AKTIF)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-[10px] text-brand-blue font-black uppercase tracking-wider mb-0.5">
                  Tenant ID
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-800 dark:text-slate-200 font-mono font-black truncate bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-1">
                    {currentUser.tenantId || "rw26_berjuang"}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2.5 mt-8 overflow-y-auto pb-24 scrollbar-hide">
          {renderableNavItems.map((item: any, idx: number) => {
            const isLocked = item.isLocked;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  if (isLocked) {
                    setShowUpgradeModal(true);
                  } else {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-500 relative group overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-r from-brand-blue to-indigo-600 text-white shadow-xl shadow-brand-blue/30 scale-[1.02]"
                    : isLocked
                      ? "text-slate-300 bg-slate-50 dark:bg-slate-800/20 cursor-not-allowed opacity-50"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-brand-blue font-bold"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1.5 h-7 bg-brand-yellow rounded-r-full z-10"
                  />
                )}
                
                <div className="relative group-hover:scale-110 transition-transform duration-500">
                  <div className={`p-2 rounded-2xl transition-colors duration-500 ${isActive ? "bg-white/20" : "bg-transparent group-hover:bg-brand-blue/5"}`}>
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? "text-white" : "group-hover:text-brand-blue"}`} />
                  </div>
                  {isLocked && (
                    <div className="absolute -top-1 -right-1 bg-slate-800 text-white p-1 rounded-full border-2 border-white scale-75 shadow-lg">
                      <Lock className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left flex flex-col">
                  <span
                    className={`text-[12px] font-black uppercase tracking-wider text-wrap ${isLocked ? "text-slate-400" : ""}`}
                  >
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg border-2 border-white dark:border-slate-900 shadow-lg animate-bounce-subtle">
                      {item.badge}
                    </span>
                  )}
                  {isLocked ? (
                    <span className="text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-500/20 self-start mt-1 uppercase tracking-widest">
                      {item.minPlan || "PREMIUM"}
                    </span>
                  ) : (
                    isActive && (
                      <span className="text-[9px] font-black text-brand-yellow uppercase tracking-widest mt-0.5 animate-in fade-in slide-in-from-left-2 drop-shadow-sm">
                        Active Now
                      </span>
                    )
                  )}
                </div>
                
                {!isLocked && !isActive && (
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-300" />
                )}
              </motion.button>
            );
          })}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible w-full bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
        {/* Subtle Unique Background Pattern / Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50/10 to-teal-50/30 dark:from-indigo-900/10 dark:via-slate-950 dark:to-cyan-900/10 pointer-events-none z-0"></div>

        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-slate-200/40 dark:border-slate-800/80 flex items-center justify-between px-6 md:px-10 shrink-0 print:hidden sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.03)] dark:shadow-none relative">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 -ml-2 text-slate-500 dark:text-slate-400 hover:text-brand-blue md:hidden bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all active:scale-95 border border-slate-100 dark:border-slate-700 shadow-sm"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-sm scale-150 group-hover:bg-brand-yellow/30 transition-all"></div>
                  <span className="relative bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-500 text-[10px] px-3 py-1 rounded-full border border-amber-100 dark:border-amber-500/20 uppercase font-black tracking-widest shadow-sm">
                    V4.0 PRIME
                  </span>
                </div>
              </div>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>

              <div
                style={{ color: '#0fcb82' }}
                className={`flex items-center gap-2.5 px-4 py-1 rounded-full border transition-all duration-500 
                  ${dbStatus === "UNAVAILABLE" ? "bg-red-50 text-red-600 border-red-100" : 
                    dbStatus === "OFFLINE" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                    "bg-emerald-50 text-brand-green border-emerald-100"} 
                  dark:bg-slate-800/50 dark:border-slate-700 shadow-sm group`}
              >
                <div className="relative flex">
                  <div className={`w-2 h-2 ${dbStatus === "UNAVAILABLE" ? "bg-red-500" : dbStatus === "OFFLINE" ? "bg-amber-500" : "bg-brand-green"} animate-pulse`}></div>
                  <div className={`absolute inset-0 w-2 h-2 rounded-full ${dbStatus === "UNAVAILABLE" ? "bg-red-500" : dbStatus === "OFFLINE" ? "bg-amber-500" : "bg-brand-green"} animate-ping opacity-20`}></div>
                </div>
                <span className="text-[10px] uppercase font-black tracking-wider">
                  {dbStatus === "UNAVAILABLE" ? "Blocked" : dbStatus === "OFFLINE" ? "Offline" : "Live Sync"}
                </span>
              </div>


            </div>

            <div className="h-6 w-px bg-slate-100 dark:bg-slate-800 mx-1 hidden md:block"></div>
            
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 capitalize tracking-tight hidden lg:block font-elegant">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-400 dark:from-white dark:to-slate-500">
                {activeTab === "etoko"
                  ? "E-LAPAK26"
                  : activeTab === "posyandu"
                    ? "Care Center"
                    : activeTab.replace("-", " ")}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-black leading-none text-slate-800 dark:text-slate-100 flex items-center justify-end gap-2 mb-1.5 font-elegant">
                  {currentUser.name}
                  {currentUser.isSuperAdmin && (
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-brand-blue" />
                      <div className="absolute inset-0 bg-brand-blue/20 blur-[2px] rounded-full scale-110"></div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <span
                    className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full border shadow-sm inline-block transition-all
                      ${currentUser.isSuperAdmin
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-brand-blue/5 text-brand-blue border-brand-blue/10"
                      }`}
                  >
                    {currentUser.isSuperAdmin ? "Authority Role" : (currentUser.role || "Citizen")}
                  </span>
                </div>
              </div>

              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-indigo-600 rounded-2xl blur opacity-20 group-hover/avatar:opacity-40 transition-all duration-500"></div>
                <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-2xl bg-white dark:bg-slate-800 p-0.5 shadow-xl border-2 border-white dark:border-slate-800 overflow-hidden cursor-pointer group-hover/avatar:scale-105 transition-transform duration-300">
                  <div className="w-full h-full rounded-[0.9rem] overflow-hidden flex items-center justify-center text-white text-lg font-black bg-gradient-to-tr from-brand-blue to-indigo-500 shadow-inner">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt={currentUser.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <span className="drop-shadow-md">{currentUser.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-11 h-11 md:w-12 md:h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center active:scale-90 group"
                title="Keluar"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {currentUser?.isSuperAdmin && selectedTenantId && (
          <div className="mx-3 md:mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm animate-pulse-subtle">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-amber-600" />
              <p className="text-[10px] md:text-xs font-bold text-amber-800 uppercase tracking-widest">
                Mode Bypass Aktif: Mengakses Data{" "}
                {currentTenant?.name || selectedTenantId}
              </p>
            </div>
            <button
              onClick={() => setSelectedTenantId(null)}
              className="px-3 py-1 bg-amber-600 text-white text-[10px] font-black rounded-lg hover:bg-amber-700 uppercase tracking-tighter transition-all"
            >
              Reset Master
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="p-3 md:p-6 flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible print:h-auto print:p-0 relative z-10">
          {activeTab === "dashboard" && (
            <DashboardView
              allowedMenuItems={renderableNavItems}
              kasData={filteredKasDataCentral}
              wargaData={cappedWargaData}
              suratData={filteredSuratDataCentral}
              iuranData={filteredIuranDataCentral}
              emergenciesData={emergenciesData}
              handleTriggerSOS={handleTriggerSOS}
              onResolveSOS={handleResolveSOS}
              userRole={currentUser.role}
              setActiveTab={setActiveTab}
              posyanduKegiatanData={posyanduKegiatanData}
              inventarisData={inventarisData}
              sampahSetoranData={sampahSetoranData}
              bukuTamuData={bukuTamuData}
              verifikasiWargaData={filteredVerifikasiWargaDataCentral}
              sampahTarikSaldoData={sampahTarikSaldoData}
              votingConfig={votingConfig}
              userVotes={userVotes}
              tokoOrders={tokoOrders}
              tokoReviews={tokoReviews}
              complaintsData={complaintsData}
              bookingsData={bookingsData}
              handleLinkToWarga={handleLinkToWarga}
              currentTenant={currentTenant}
              setShowUpgradeModal={setShowUpgradeModal}
              setShowQRModal={setShowQRModal}
              settings={settings}
              currentUser={currentUser}
              setIsLoadingDB={setIsLoadingDB}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              AppLogo={AppLogo}
            />
          )}
          {activeTab === "warga" && (
            <WargaView
              wargaData={cappedWargaData}
              currentTenant={currentTenant}
              setWargaData={setWargaData}
              userRole={currentUser.role}
              tenantId={currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || "rw26_berjuang")}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              currentUser={currentUser}
              settings={settings}
            />
          )}
          {activeTab === "buku-tamu" && (
            <BukuTamuView
              tamuData={bukuTamuData}
              setTamuData={setBukuTamuData}
              userRole={currentUser.role}
              currentUser={currentUser}
              tenantId={
                currentUser?.tenantId && currentUser.tenantId !== "unknown"
                  ? currentUser.tenantId
                  : "rw26_berjuang"
              }
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
            />
          )}
          {activeTab === "organisasi" && (
            <OrganisasiView
              currentUser={currentUser}
              currentTenant={currentTenant}
              showNotification={showNotification}
            />
          )}
          {activeTab === "verifikasi" && (
            currentUser?.role === "WARGA" ? (
              <WargaProfileView
                wargaData={mergedWargaProfile}
                verifikasiData={verifikasiWargaData}
                suratData={suratData}
                setSuratData={setSuratData}
                setWargaAuth={handleLogout}
                tenantId={mergedWargaProfile.tenantId || "rw26_berjuang"}
                isLoadingDB={isLoadingDB}
                setIsLoadingDB={setIsLoadingDB}
                handleFileUpload={handleFileUpload}
                showNotification={showNotification}
                handleFirestoreError={handleFirestoreError}
                kopSettings={kopSettings}
                getSetting={getSetting}
                usersData={filteredUsersDataCentral}
                generateSuratHTML={generateSuratHTML}
                settings={settings}
              />
            ) : (
              <VerifikasiAdminView
                verifikasiData={filteredVerifikasiWargaDataCentral}
                wargaData={filteredWargaDataCentral}
                tenantId={currentUser.tenantId || "rw26_berjuang"}
                isLoadingDB={isLoadingDB}
                setIsLoadingDB={setIsLoadingDB}
                showNotification={showNotification}
                handleFirestoreError={handleFirestoreError}
                currentUser={currentUser}
              />
            )
          )}
          {activeTab === "chat" && (
            <ChatWargaView
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              currentUser={currentUser}
              handleFirestoreError={handleFirestoreError}
              currentTenant={currentTenant}
            />
          )}
          {activeTab === "ai-bot" && (
            <AIChatBot currentUser={currentUser} plan={currentTenant?.status} />
          )}
          {activeTab === "keuangan" && (
            <FinansialDashboardView
              ppobData={ppobData}
              setPpobData={setPpobData}
              iuranData={filteredIuranDataCentral}
              setIuranData={setIuranData}
              kasData={filteredKasDataCentral}
              setKasData={setKasData}
              wargaData={filteredWargaDataCentral}
              userRole={currentUser.role}
              currentUser={currentUser}
              getSetting={getSetting}
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              plan={currentTenant?.status}
              isPengurus={["ADMIN", "SUPER_ADMIN", "OWNER", "RW", "RT", "BENDAHARA", "SEKRETARIS", "KADER"].includes(
                currentUser.role?.toUpperCase(),
              )}
            />
          )}
          {activeTab === "posyandu" &&
            (getPlanFeatures(currentTenant).posyandu ? (
              <PosyanduView
                balitaData={filteredBalitaDataCentral}
                setBalitaData={setBalitaData}
                ibuHamilData={filteredIbuHamilDataCentral}
                setIbuHamilData={setIbuHamilData}
                posyanduKegiatanData={posyanduKegiatanData}
                setPosyanduKegiatanData={setPosyanduKegiatanData}
                posbinduKegiatanData={posbinduKegiatanData}
                setPosbinduKegiatanData={setPosbinduKegiatanData}
                pemeriksaanBalitaData={pemeriksaanBalitaData}
                setPemeriksaanBalitaData={setPemeriksaanBalitaData}
                pemeriksaanPosbinduData={pemeriksaanPosbinduData}
                setPemeriksaanPosbinduData={setPemeriksaanPosbinduData}
                imunisasiData={imunisasiData}
                setImunisasiData={setImunisasiData}
                wargaData={filteredWargaDataCentral}
                currentUser={currentUser}
                tenantId={currentUser.tenantId || "rw26_berjuang"}
                setIsLoadingDB={setIsLoadingDB}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Fitur Terbatas
                </h3>
                <p className="text-slate-500 mt-2">
                  Fitur Kesehatan/Posyandu tersedia untuk paket PRO, PREMIUM,
                  dan ENTERPRISE.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-6 px-8 py-3 bg-brand-pink text-white rounded-xl font-bold uppercase text-[15px] tracking-widest"
                >
                  Upgrade Paket
                </button>
              </div>
            ))}
          {activeTab === "bank-sampah" &&
            (getPlanFeatures(currentTenant).bankSampah ? (
              <BankSampahView
                sampahKategoriData={sampahKategoriData}
                sampahSetoranData={sampahSetoranData}
                sampahTarikSaldoData={sampahTarikSaldoData}
                wargaData={filteredWargaDataCentral}
                currentUser={currentUser}
                tenantId={currentUser.tenantId || "rw26_berjuang"}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Fitur Terbatas
                </h3>
                <p className="text-slate-500 mt-2">
                  Fitur Bank Sampah lingkungan tersedia untuk paket PRO,
                  PREMIUM, dan ENTERPRISE.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-6 px-8 py-3 bg-brand-green text-white rounded-xl font-bold uppercase text-[15px] tracking-widest"
                >
                  Upgrade Paket
                </button>
              </div>
            ))}
          {activeTab === "inventaris" && (
            <InventarisView
              inventarisData={inventarisData}
              setInventarisData={setInventarisData}
              inventarisLogs={inventarisLogs}
              setInventarisLogs={setInventarisLogs}
              inventarisKategori={inventarisKategori}
              inventarisLokasi={inventarisLokasi}
              inventarisSupplier={inventarisSupplier}
              userRole={currentUser.role}
              currentUser={currentUser}
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
              handleFileUpload={handleFileUpload}
            />
          )}
          {activeTab === "surat" && (
            (currentUser?.role === "WARGA" || currentUser?.role === "Warga" || isCitizen) ? (
              <WargaProfileView
                wargaData={mergedWargaProfile}
                verifikasiData={verifikasiWargaData}
                suratData={suratData}
                setSuratData={setSuratData}
                setWargaAuth={handleLogout}
                tenantId={mergedWargaProfile.tenantId || "rw26_berjuang"}
                isLoadingDB={isLoadingDB}
                setIsLoadingDB={setIsLoadingDB}
                handleFileUpload={handleFileUpload}
                showNotification={showNotification}
                handleFirestoreError={handleFirestoreError}
                kopSettings={kopSettings}
                getSetting={getSetting}
                usersData={filteredUsersDataCentral}
                generateSuratHTML={generateSuratHTML}
                settings={settings}
              />
            ) : (
              <SuratView
                suratData={filteredSuratDataCentral}
                setSuratData={setSuratData}
                wargaData={filteredWargaDataCentral}
                usersData={filteredUsersDataCentral}
                userRole={currentUser.role}
                currentUser={currentUser}
                getSetting={getSetting}
                kopSettings={kopSettings}
                tenantId={currentUser.tenantId || "rw26_berjuang"}
                isLoadingDB={isLoadingDB}
                setIsLoadingDB={setIsLoadingDB}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
                settings={settings}
                handleFileUpload={handleFileUpload}
              />
            )
          )}
          {activeTab === "complaint" && (
            <ComplaintView
              currentUser={currentUser}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              settings={settings}
              complaintsData={complaintsData}
            />
          )}
          {activeTab === "booking" && (
            <BookingView
              currentUser={currentUser}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              settings={settings}
              bookingsData={bookingsData}
            />
          )}
          {activeTab === "kop-template" && (
            <KopTemplateManagementView
              currentUser={currentUser}
              settings={settings}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
            />
          )}
          {/* Updated tab 'kas' was here, merged into 'keuangan' */}

          {activeTab === "daftar-trial" && (
            <DaftarPendaftarTrialView 
              onAdd={() => setShowFreeTrialModal(true)} 
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
            />
          )}

          {activeTab === "users" && (
            <UsersView
              usersData={filteredUsersDataCentral}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              showNotification={showNotification}
              settings={settings}
              currentUser={currentUser}
            />
          )}
          {activeTab === "leads" && (
            <LeadManagementView 
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
              onAddLead={() => setShowFreeTrialModal(true)}
            />
          )}

          {activeTab === "super-admin" && (
            <TenantsView
              tenantsData={tenantsData}
              isLoadingDB={isLoadingDB}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
              setSelectedTenantId={setSelectedTenantId}
              selectedTenantId={selectedTenantId}
            />
          )}
          {activeTab === "pengaturan" && (
            <PengaturanView
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              currentTenant={currentTenant}
              wargaData={filteredWargaDataCentral}
              settings={settings}
              userRole={currentUser.role}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "voting" &&
            (getPlanFeatures(currentTenant).ePemilu ? (
              <EVotingView
                userRole={currentUser.role}
                tenantId={currentUser.tenantId || "rw26_berjuang"}
                candidates={votingCandidates}
                config={votingConfig}
                userVotes={userVotes}
                currentUser={currentUser}
                wargaAuth={wargaAuth}
                handleFirestoreError={handleFirestoreError}
                handleFileUpload={handleFileUpload}
                showNotification={showNotification}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Fitur Terbatas
                </h3>
                <p className="text-slate-500 mt-2">
                  Fitur E-Voting tersedia untuk paket PRO, PREMIUM, dan
                  ENTERPRISE.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[15px] tracking-widest"
                >
                  Upgrade Paket
                </button>
              </div>
            ))}
          {activeTab === "etoko" && (
            <ETokoView
              userRole={currentUser.role}
              tenantId={currentUser.tenantId || "rw26_berjuang"}
              products={tokoProducts}
              orders={tokoOrders}
              reviews={tokoReviews}
              currentUser={currentUser}
              wargaAuth={wargaAuth}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              accessMode={getPlanFeatures(currentTenant).eLapak}
            />
          )}
          {activeTab === "analitik" &&
            (getPlanFeatures(currentTenant).analytics ? (
              <AnalyticsPremiumView
                tenantId={currentUser.tenantId}
                kasData={filteredKasDataCentral}
                wargaData={filteredWargaDataCentral}
                iuranData={filteredIuranDataCentral}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">
                  Analitik Premium
                </h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                  Visualisasi tren, prediksi iuran, dan insight aktivitas warga
                  berbasis AI hanya tersedia di paket 🚀 PREMIUM.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[15px] tracking-widest shadow-lg shadow-blue-100"
                >
                  Upgrade ke Premium
                </button>
              </div>
            ))}
          {activeTab === "cctv" &&
            (getPlanFeatures(currentTenant).cctv ? (
              <CCTVView
                tenantId={currentUser.tenantId}
                settings={settings}
                onUpdateSettings={setSettings}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold">Integrasi CCTV</h3>
                <p className="text-slate-500 mt-2">
                  Pantauan kamera keamanan lingkungan langsung dari dashboard
                  tersedia di paket PREMIUM.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[15px] tracking-widest shadow-lg shadow-blue-100"
                >
                  Upgrade Paket
                </button>
              </div>
            ))}
          {activeTab === "monitoring" &&
            (getPlanFeatures(currentTenant).multiRegion ? (
              <EnterpriseGovDashboard
                tenantId={currentUser.tenantId}
                wargaData={wargaData}
                currentUser={currentUser}
                wargaAuth={wargaAuth}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold">Smart Monitoring Region</h3>
                <p className="text-slate-500 mt-2">
                  Fitur monitoring multi-wilayah hanya tersedia untuk paket 🏛️
                  ENTERPRISE.
                </p>
              </div>
            ))}
          {activeTab === "audit" &&
            (getPlanFeatures(currentTenant).governance === "HIGH" ? (
              <AuditLogView logs={auditLogs} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold">Governance & Audit Log</h3>
                <p className="text-slate-500 mt-2">
                  Transparansi tata kelola dan log aktivitas admin tersedia di
                  paket 🏛️ ENTERPRISE.
                </p>
              </div>
            ))}
        </div>
      </main>

      {/* Global Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-10 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 ${
              notification.type === "success"
                ? "bg-green-600"
                : notification.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
            } text-white min-w-[300px] justify-center`}
          >
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertCircle className="w-5 h-5" />
            )}
            {notification.type === "info" && <Info className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>



      {/* PANIC BUTTON (SOS) - BOTTOM RIGHT (NOW DRAGGABLE) */}
      {currentUser && (
        <motion.button
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.1, cursor: "grabbing" }}
          onTap={() => {
            if (activeEmergency) {
              const role = (currentUser?.role || "").toUpperCase();
              const canResolve =
                role === "ADMIN" ||
                role === "PENGURUS" ||
                role === "SATPAM" ||
                currentUser?.isSuperAdmin ||
                activeEmergency?.userId === auth.currentUser?.uid;

              if (canResolve) {
                if (window.confirm("Hentikan sinyal darurat aktif?")) {
                  handleResolveSOS(activeEmergency.id);
                  setActiveTab("dashboard");
                }
                return;
              }
            }
            handleTriggerSOS();
          }}
          disabled={isSOSTriggering}
          className={`fixed bottom-6 right-6 z-[60] w-16 h-16 ${activeEmergency ? 'bg-emerald-600 shadow-emerald-300 hover:bg-emerald-700' : 'bg-red-600 shadow-red-300 hover:bg-red-700'} text-white rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 group ring-4 ring-white cursor-grab touch-none`}
          title={activeEmergency ? "STOP SOS" : "TOMBOL DARURAT (SOS)"}
        >
          {isSOSTriggering ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : activeEmergency ? (
            <CheckCircle className="w-8 h-8" />
          ) : (
            <Siren className="w-8 h-8 group-hover:" />
          )}
        </motion.button>
      )}

      {/* SOS CONFIRMATION MODAL */}
      <AnimatePresence>
        {isSOSConfirmOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 ">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border border-red-100"
            >
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50">
                <Siren className="w-12 h-12 text-red-600 " />
              </div>
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">
                Kirimi Sinyal Darurat?
              </h2>
              <p className="text-slate-600 text-base font-medium leading-relaxed mb-8 px-2">
                Tindakan ini akan memberitahukan seluruh pengurus dan warga RW /
                RT secara instan. Gunakan hanya untuk keadaan mendesak.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={confirmSOS}
                  className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-200"
                >
                  Ya, Kirim SOS Sekarang
                </button>
                <button
                  onClick={() => setIsSOSConfirmOpen(false)}
                  className="w-full py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      <RegistrationQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        tenantId={currentTenant?.id || currentUser?.tenantId || "rw26_berjuang"}
        tenantName={currentTenant?.nama || "RT/RW Digital"}
      />
      {showFreeTrialModal && (
        <FreeTrialRegistrationModal
          onClose={() => setShowFreeTrialModal(false)}
          showNotification={showNotification}
          initialPlan={selectedPlan}
        />
      )}

      {showPricingModal && (
        <div className="fixed inset-0 z-[200] overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="min-h-full flex items-center justify-center py-10">
            <div className="bg-white rounded-[3rem] w-full max-w-5xl relative overflow-hidden">
              <button
                onClick={() => setShowPricingModal(false)}
                className="absolute top-8 right-8 z-10 p-3 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
              <PricingSection
                onSelectPlan={(planId) => {
                  setSelectedPlan(planId);
                  setShowPricingModal(false);
                  setShowFreeTrialModal(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showInfoPopup && (!currentUser || currentUser?.isAnonymous) && (
        <div className="fixed inset-0 z-[250] flex items-end md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border-t-4 border-brand-pink"
          >
            <button
              onClick={() => setShowInfoPopup(false)}
              className="absolute top-4 right-4 p-2"
            >
              <X className="w-5 h-5 text-slate-300" />
            </button>
            <div className="w-20 h-20 bg-brand-pink/10 rounded-3xl flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-brand-pink" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-3">
              <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmartRW</span>{" "}
              <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span> <br />
              <span className="text-brand-pink">Telah Hadir!</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Nikmati kemudahan pengelolaan RT/RW dengan teknologi AI terbaru.
              Daftar sekarang dan dapatkan Free Trial 30 hari.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowInfoPopup(false);
                  setShowFreeTrialModal(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
              >
                Coba Sekarang
              </button>
              <button
                onClick={() => setShowInfoPopup(false)}
                className="w-full py-4 bg-white text-slate-500 font-bold rounded-2xl border-2 border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all duration-300 active:scale-95"
              >
                Nanti Saja
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RegistrationQRModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
}) {
  const regUrl = `${window.location.origin}?reg=${tenantId}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">
              QR Self-Registration
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
              Tunjukkan QR Code ini kepada tamu atau warga baru. Mereka cukup
              scan untuk mengisi formulir pendaftaran secara mandiri.
            </p>

            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex items-center justify-center mb-8 mx-auto w-fit">
              <QRCodeSVG
                value={regUrl}
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl mb-8 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">
                Target Tenant
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">
                {tenantName} ({tenantId})
              </span>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(regUrl);
                  alert("Link pendaftaran berhasil disalin!");
                }}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                Salin Link
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Cetak QR
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- PREMIUM: ANALYTICS VIEW ---
function AnalyticsPremiumView({
  tenantId,
  kasData,
  wargaData,
  iuranData,
}: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      sourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    if (!report) return;

    try {
      setIsSpeaking(true);
      const response = await textToSpeech(report, true);
      if (!response) return;
      const base64Audio = response.data;

      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
      audioContextRef.current = audioContext;

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const buffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
      const data = buffer.getChannelData(0);
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < data.length; i++) {
        data[i] = view.getInt16(i * 2, true) / 32768;
      }

      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
      sourceRef.current = source;
    } catch (error) {
      console.error("Speech Error:", error);
      setIsSpeaking(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const dataSummary = {
        financial: kasData.slice(-20),
        warga: wargaData.length,
        iuran: iuranData.slice(-20),
      };

      const aiReportText = await generateAIReport(dataSummary);
      setReport(aiReportText);

      // Save to Firestore
      try {
        const reportId = `report_${new Date().getFullYear()}_${new Date().getMonth() + 1}`;
        await setDoc(doc(db, "monthly_reports", reportId), {
          tenantId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          content: aiReportText,
          createdAt: new Date().toISOString(),
          generatedBy: "AI_SYSTEM",
        });
      } catch (err) {
        console.error("Failed to save report to firestore");
      }
    } catch (e) {
      alert("Gagal membuat laporan AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const data = useMemo(() => {
    // Group financial by month for predictive trend
    const monthlyTotal: Record<string, number> = {};
    kasData.forEach((k: any) => {
      const month = k.tanggal.split(" ")[1] || "Jan";
      monthlyTotal[month] = (monthlyTotal[month] || 0) + (k.debit || 0);
    });
    return Object.entries(monthlyTotal)
      .map(([name, val]) => ({
        name,
        actual: val,
        prediction: val * 1.05 + 500000,
      }))
      .slice(-6);
  }, [kasData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">
          ANALYTICS PREDIKTIF AI
        </h2>
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            {isGenerating ? (
              "Sedang Menyusun..."
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                Generate Laporan Bulanan
              </>
            )}
          </button>
          <span className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            🚀 AI Premium
          </span>
        </div>
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative"
        >
          <button
            onClick={() => setReport("")}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-xl font-black mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            LAPORAN BULANAN OTOMATIS (AI)
          </h3>
          <div className="prose prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-indigo-100 leading-relaxed text-sm bg-indigo-950/50 p-6 rounded-2xl border border-indigo-800">
              {report}
            </pre>
          </div>
          <div className="mt-6 flex gap-4">
            <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Cetak PDF
            </button>
            <button
              onClick={handleToggleSpeak}
              className={`px-6 py-3 border-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg ${isSpeaking ? "bg-red-500 border-red-500 text-white animate-pulse" : "bg-white text-indigo-600 border-indigo-600 hover:bg-indigo-50"}`}
            >
              {isSpeaking ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              {isSpeaking ? "Berhenti" : "Dengarkan Analisis"}
            </button>
            <button className="px-6 py-3 bg-indigo-100/10 text-white border border-indigo-500 rounded-xl font-bold text-[10px] uppercase tracking-widest">
              Bagikan ke Grup Pengurus
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Prediksi Pendapatan (6 Bulan Ke Depan)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="prediction"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="#8b5cf6"
                  fillOpacity={0.05}
                  strokeDasharray="5 5"
                  name="Prediksi AI"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#4f46e5"
                  strokeWidth={4}
                  fill="#4f46e5"
                  fillOpacity={0.1}
                  name="Realisasi"
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <Bot className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
            <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">
              AI Insight Hari Ini
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-sm font-bold leading-relaxed italic">
                  "Berdasarkan tren 3 bulan terakhir, pembayaran iuran memuncak
                  di minggu ke-2. Kami merekomendasikan pengiriman pengingat di
                  tanggal 5 setiap bulannya untuk efisiensi tertagih +15%."
                </p>
              </div>
              <p className="text-[10px] font-medium opacity-60">
                Insight dihasilkan otomatis pukul 08:00 WIB
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Metrik Efisiensi
            </h4>
            <div className="space-y-4">
              {[
                {
                  label: "Kepatuhan Iuran",
                  val: "92%",
                  change: "+4.5%",
                  color: "emerald",
                },
                {
                  label: "Respon Admin",
                  val: "12m",
                  change: "-5m",
                  color: "blue",
                },
                {
                  label: "Kepuasan Warga",
                  val: "4.8",
                  change: "+0.2",
                  color: "amber",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                >
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {stat.val}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}
                  >
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- PREMIUM: CCTV VIEW ---
// --- SHARED: AUDIT LOG HELPER ---
const logAction = async (
  userId: string,
  userName: string,
  action: string,
  resource: string,
  details: string,
  tenantId: string,
) => {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, "audit_logs", logId), {
      userId,
      userName,
      action,
      resource,
      details,
      tenantId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Audit Log failed", err);
  }
};

// --- ENTERPRISE: AUDIT LOG VIEW ---
function AuditLogView({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">
          🛡️ AUDIT LOG & GOVERNANCE
        </h2>
        <button
          onClick={() => {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              ["Timestamp,User,Action,Resource,Details"]
                .concat(
                  logs.map(
                    (log) =>
                      `"${new Date(log.timestamp).toLocaleString("id-ID")}","${log.userName}","${log.action}","${log.resource}","${log.details}"`,
                  ),
                )
                .join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute(
              "download",
              `audit_log_${new Date().toISOString()}.csv`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">User</th>
                <th className="px-8 py-6">Action</th>
                <th className="px-8 py-6">Resource</th>
                <th className="px-8 py-6">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-6 font-mono text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString("id-ID")}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                        {log.userName?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">
                        {log.userName}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        log.action.includes("HAPUS")
                          ? "bg-red-50 text-red-600"
                          : log.action.includes("TAMBAH")
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-medium text-slate-500 uppercase text-[10px] tracking-widest">
                    {log.resource}
                  </td>
                  <td className="px-8 py-6 text-slate-500 max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- ENTERPRISE: GOVERNMENT DASHBOARD ---
function EnterpriseGovDashboard({
  tenantId,
  wargaData = [],
  currentUser,
  wargaAuth,
}: {
  tenantId: string;
  wargaData: any[];
  currentUser: any;
  wargaAuth?: any;
}) {
  const defaultRegion = useMemo(() => {
    const rawRw = currentUser?.rw || wargaAuth?.rw || "26";
    const digits = rawRw.match(/\d+/);
    return digits ? `RW ${digits[0].padStart(2, "0")}` : `RW ${rawRw}`;
  }, [currentUser, wargaAuth]);

  const [activeRegion, setActiveRegion] = useState(defaultRegion);
  const [insight, setInsight] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleToggleSpeak = async () => {
    if (isSpeaking) {
      sourceRef.current?.stop();
      setIsSpeaking(false);
      return;
    }

    if (!insight) return;

    try {
      setIsSpeaking(true);
      const response = await textToSpeech(insight, true);
      if (!response) return;
      const base64Audio = response.data;
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )({ sampleRate: 24000 });
      audioContextRef.current = audioContext;
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const buffer = audioContext.createBuffer(1, bytes.length / 2, 24000);
      const data = buffer.getChannelData(0);
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < data.length; i++) {
        data[i] = view.getInt16(i * 2, true) / 32768;
      }
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
      sourceRef.current = source;
    } catch (error) {
      console.error("Speech Error:", error);
      setIsSpeaking(false);
    }
  };

  // Real-time calculation from synced wargaData:
  const monitoringData = useMemo(() => {
    const rwMap = new Map<string, number>();
    wargaData.forEach((w: any) => {
      let rawRw = (w.rw || "").toString().trim();
      if (rawRw) {
        const digits = rawRw.match(/\d+/);
        if (digits) {
          const formatted = digits[0].padStart(2, "0");
          if (formatted !== "05") {
            const rwKey = `RW ${formatted}`;
            rwMap.set(rwKey, (rwMap.get(rwKey) || 0) + 1);
          }
        } else {
          if (!rawRw.includes("05")) {
            const rwKey = `RW ${rawRw}`;
            rwMap.set(rwKey, (rwMap.get(rwKey) || 0) + 1);
          }
        }
      }
    });

    if (rwMap.size === 0) {
      // Fallback to real active RW 26 if no citizens exist in the database yet
      const fallbackRw = currentUser?.rw || wargaAuth?.rw || "26";
      const digits = fallbackRw.match(/\d+/);
      const rwKey = digits ? `RW ${digits[0].padStart(2, "0")}` : `RW ${fallbackRw}`;
      rwMap.set(rwKey, 0);
    }

    const calculated = Array.from(rwMap.entries()).map(([rwName, count]) => {
      let status = "STABIL";
      if (count > 5) status = "SANGAT AKTIF";
      else if (count === 0) status = "PERLU ATENSI";

      return {
        name: rwName,
        status: status,
        budget: count * 1250000,
        compliance: count > 0 ? Math.min(100, 70 + (count % 6) * 5) : 0,
        health: count > 0 ? Math.min(100, 80 + (count % 4) * 3) : 0,
      };
    });

    return calculated.sort((a, b) => a.name.localeCompare(b.name));
  }, [wargaData, currentUser, wargaAuth]);

  // Sync activeRegion if the monitoringData layout updates
  useEffect(() => {
    if (monitoringData.length > 0 && !monitoringData.some((c) => c.name === activeRegion)) {
      setActiveRegion(monitoringData[0].name);
    }
  }, [monitoringData, activeRegion]);

  const isMonitoringLoading = false; // Resolved in real-time instantly

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
              🏛️ DASHBOARD KELURAHAN
            </h1>
            <span className="bg-indigo-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">
              Enterprise
            </span>
          </div>
          <p className="text-slate-500 font-medium">
            Monitoring Real-time & Decision Support Wilayah Terintegrasi.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            disabled={isLoading}
            className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Decision Insight (AI)
          </button>
        </div>
      </div>

      {insight && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-slate-800"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
          <button
            onClick={() => setInsight("")}
            className="absolute top-8 right-8 text-slate-500 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 font-mono">
            Goverment AI System v1.0
          </h3>
          <div className="prose prose-invert max-w-none">
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 leading-relaxed font-medium text-slate-300">
              {insight.split("\n").map((line, i) => (
                <p key={i} className="mb-4">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleToggleSpeak}
              className={`px-8 py-4 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all shadow-2xl border-2 ${isSpeaking ? "bg-red-500 border-red-500 text-white animate-pulse" : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"}`}
            >
              {isSpeaking ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              {isSpeaking ? "Berhenti" : "Dengarkan Rekomendasi AI"}
            </button>
            <button className="px-8 py-4 bg-white text-slate-900 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {monitoringData.map((reg) => (
          <div
            key={reg.name}
            className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
              activeRegion === reg.name
                ? "bg-white border-indigo-600 shadow-2xl shadow-indigo-100"
                : "bg-white border-slate-50 hover:border-slate-200"
            }`}
            onClick={() => setActiveRegion(reg.name)}
          >
            <div className="flex justify-between items-start mb-6">
              <div
                className={`p-4 rounded-2xl ${
                  reg.status.includes("SANGAT")
                    ? "bg-emerald-50 text-emerald-600"
                    : reg.status.includes("PERLU")
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-50 text-slate-600"
                }`}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <span
                className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                  reg.status.includes("SANGAT")
                    ? "bg-emerald-100 text-emerald-700"
                    : reg.status.includes("PERLU")
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {reg.status}
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">
              {reg.name}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
              Kawasan Cluster A-C
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Compliance
                </span>
                <span className="font-bold text-slate-700">
                  {reg.compliance}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600"
                  style={{ width: `${reg.compliance}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-10 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Distribusi Anggaran Regional
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monitoringData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip />
                <Bar
                  dataKey="budget"
                  fill="#4f46e5"
                  radius={[12, 12, 12, 12]}
                  barSize={60}
                >
                  {monitoringData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status.includes("PERLU") ? "#ef4444" : "#4f46e5"
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <Globe className="absolute -top-12 -right-12 w-64 h-64 opacity-10" />
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8 font-mono">
              Hierarchical Info
            </h3>
            <div className="space-y-8">
              <div>
                <p className="text-4xl font-black tracking-tighter mb-2">
                  1,248
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                  Total Warga Kelurahan
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-2xl font-black tracking-tighter mb-1">
                    12
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">
                    Total RW
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tighter mb-1">
                    45
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">
                    Total RT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Sistem Kelurahan Online
              </span>
            </div>
            <p className="text-xs font-medium text-indigo-100 leading-relaxed italic opacity-80">
              "Pantauan iuran mencapai 88.5% secara merata. Dibandingkan tahun
              lalu, terjadi peningkatan digitalisasi sebesar 42% di seluruh
              wilayah RW."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CCTVView({ tenantId, settings, onUpdateSettings }: any) {
  const [links, setLinks] = useState<string[]>(settings?.cctvLinks || []);
  const [newLink, setNewLink] = useState("");
  const [showLocalCamera, setShowLocalCamera] = useState(false);

  const addLink = () => {
    if (!newLink) return;
    const updated = [...links, newLink];
    setLinks(updated);
    setNewLink("");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-[#008bb5] to-[#014e66] p-10 rounded-[3.5rem] text-white shadow-2xl shadow-[#008bb5]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Security Protocol</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            INTEGRASI CCTV <span className="text-white/30">SEMATA</span>
          </h2>
          <p className="text-white/70 font-medium text-sm mt-4 max-w-xl leading-relaxed">
            Sistem pantauan keamanan modern berbasis web. Hubungkan perangkat kamera lokal atau 
            integrasikan protokol streaming IP dari vendor pihak ketiga melalui input URL.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10 bg-black/10 backdrop-blur-md p-4 rounded-[2.5rem] border border-white/10">
          <input
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            placeholder="Url Stream (HTTP/HTTPS)..."
            className="px-6 py-4 bg-white/10 border-none rounded-2xl text-sm w-full lg:w-64 placeholder:text-white/40 text-white outline-none focus:ring-2 ring-white/50 transition-all shadow-inner font-medium"
          />
          <button
            onClick={addLink}
            className="p-4 bg-white text-[#008bb5] rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center font-black group/btn shrink-0"
          >
            <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-all duration-500" />
            <span className="ml-2 mr-1 sm:hidden">Tambah Kamera</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setShowLocalCamera(!showLocalCamera)}
          className={`group px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all duration-500 shadow-2xl flex items-center gap-4 ${
            showLocalCamera 
              ? "bg-gradient-to-r from-red-600 to-red-800 text-white shadow-red-200" 
              : "bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:shadow-slate-300"
          }`}
        >
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${showLocalCamera ? 'bg-white animate-ping' : 'bg-red-500'}`} />
            <div className={`absolute inset-0 w-3 h-3 rounded-full ${showLocalCamera ? 'bg-white' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse'}`} />
          </div>
          {showLocalCamera ? "Hentikan Local Feed" : "Aktifkan Local Feed"}
        </button>
      </div>

      {showLocalCamera && (
        <div className="relative group max-w-2xl">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#008bb5] via-blue-500 to-indigo-600 rounded-[3.2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl aspect-video bg-black ring-1 ring-slate-100">
            <Webcam
              audio={false}
              videoConstraints={{ facingMode: "user" }}
              className="w-full h-full object-cover grayscale brightness-110 group-hover:grayscale-0 transition-all duration-700"
              mirrored={true}
              screenshotFormat="image/jpeg"
              forceScreenshotSourceSize={false}
              audioConstraints={false}
              disablePictureInPicture={true}
              imageSmoothing={true}
              onUserMedia={() => {}}
              onUserMediaError={() => {}}
              screenshotQuality={0.92}
            />
            <div className="absolute top-8 left-8 flex items-center gap-3 bg-black/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/20">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">LIVE FEED • DEVICE#01</span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
          </div>
        </div>
      )}

      {links.length === 0 && !showLocalCamera ? (
        <div className="bg-white border border-slate-100 rounded-[4rem] p-24 text-center shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,139,181,0.02),transparent)] group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white">
              <Video className="w-12 h-12 text-slate-200" />
            </div>
            <h4 className="text-slate-800 font-black uppercase text-xs tracking-[0.4em] mb-3">No Active Channels</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed">
              Silahkan tambahkan URL transmisi kamera di atas atau aktifkan kamera lokal untuk memulai pemantauan.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {links.map((url, i) => (
            <div
              key={i}
              className="group relative bg-slate-900 aspect-video rounded-[3.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-100 hover:ring-[#008bb5]/50 transition-all duration-700 hover:scale-[1.02]"
            >
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-5">
                  <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center animate-pulse border border-white/5">
                    <Video className="w-10 h-10 text-white/10" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Connecting Transceiver...</span>
                </div>
              </div>
              
              <iframe
                src={url}
                className="absolute inset-0 w-full h-full border-0 relative z-10 opacity-90 group-hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-1000"
                title={`Kamera ${i + 1}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />

              <div className="absolute top-8 left-8 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 group-hover:border-white/30 transition-all">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_12px_rgba(59,130,246,1)]" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">CHANNEL-0{i + 1}</span>
              </div>

              <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 duration-500">
                <button
                  onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                  className="p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-2xl backdrop-blur-md shadow-2xl transition-all hover:rotate-12"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-black to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-700 p-8 flex items-end">
                 <div className="w-full">
                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Source Address</p>
                    <p className="text-white/70 text-xs font-medium truncate italic">{url}</p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="p-3 bg-indigo-100 rounded-2xl flex-shrink-0">
          <Info className="w-6 h-6 text-indigo-600" />
        </div>
        <p className="text-sm font-medium text-indigo-900 opacity-80 leading-relaxed">
          <strong>Catatan Privasi:</strong> Nexapps tidak menyimpan data video
          di server. Tautan CCTV bersifat langsung (embed) dari penyedia
          masing-masing. Pastikan link yang Anda masukkan aman dan terproteksi
          kata sandi.
        </p>
      </div>
    </div>
  );
}

function SOSOverlay({ 
  emergency, 
  onResolve, 
  onCloseLocal, 
  canResolve,
  setActiveTab 
}: any) {
  // Save to log when viewed (implied)
  useEffect(() => {
    if (emergency && !emergency.logged) {
      // Logic would be here in a real production app to log the view
    }
  }, [emergency]);

  const [isMuted, setIsMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  useEffect(() => {
    // Stop all audio/vibration if not emergency or muted
    if (!emergency || isMuted) {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch (e) {}
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      return;
    }

    const startAudioContext = async () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        const audioCtx = audioCtxRef.current;
        if (!audioCtx) return;

        if (audioCtx.state === "suspended") {
          try {
            await audioCtx.resume();
          } catch (e) {
            setAudioBlocked(true);
            return;
          }
        }
        setAudioBlocked(false);

        if (audioCtx.state === "running") {
          startWarSiren();
        }
      } catch (e) {
        console.warn("SOS Audio Start Error:", e);
      }
    };

    let activeOsc1: OscillatorNode | null = null;
    let activeOsc2: OscillatorNode | null = null;
    let activeLFO: OscillatorNode | null = null;
    let activeGain: GainNode | null = null;

    const startWarSiren = () => {
      if (!audioCtxRef.current || isMuted || !emergency) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Create primary oscillators (Carriers)
      // Detuned sawtooth oscillators create a rich, realistic, massive mechanical war siren sound.
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const mainGain = ctx.createGain();

      osc1.type = "sawtooth";
      osc2.type = "sawtooth"; // Both sawtooth for maximum acoustic pressure / wailing buzz
      
      // Setup frequencies
      osc1.frequency.setValueAtTime(550, now);
      osc2.frequency.setValueAtTime(550, now);
      
      // Detune them slightly to simulate dual physical sirens / mechanical acoustic beats
      osc1.detune.setValueAtTime(-15, now);
      osc2.detune.setValueAtTime(15, now);

      // LFO (Low Frequency Oscillator) to modulate pitch up and down
      lfo.type = "triangle";
      lfo.frequency.setValueAtTime(0.20, now); // 5-second cycle for realistic heavy war siren wail

      // LFO Gain controls the depth of frequency modulation (+/- 250Hz around 550Hz)
      // This sweeps the frequencies smoothly between 300Hz (low moan) and 800Hz (high scream)
      lfoGain.gain.setValueAtTime(250, now);

      // Master volume node
      mainGain.gain.setValueAtTime(0.01, now);
      // Realistic siren startup: wind up the rotor and build volume over 2 seconds
      mainGain.gain.linearRampToValueAtTime(0.85, now + 2.0);

      // Connect LFO modulation to frequencies of both carriers
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Connect audio signal chain
      osc1.connect(mainGain);
      osc2.connect(mainGain);
      mainGain.connect(ctx.destination);

      // Start everything
      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      // Save references so we can safely stop or modify them on cleanup/mute
      activeOsc1 = osc1;
      activeOsc2 = osc2;
      activeLFO = lfo;
      activeGain = mainGain;

      // Vibration: synchronized rumble during active alarm
      const startVibration = () => {
        if (!emergency || isMuted) return;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          // Classic pulsating air raid alert vibration pattern
          navigator.vibrate([1800, 400, 1800, 400]);
        }
      };
      
      startVibration();
      sirenIntervalRef.current = setInterval(startVibration, 4400); // loops to align with siren sweep
    };

    startAudioContext();

    // Getaran terpisah (lebih lambat mengikuti irama sirine)
    const vibInterval = setInterval(() => {
      if (
        !isMuted &&
        typeof navigator !== "undefined" &&
        "vibrate" in navigator
      ) {
        navigator.vibrate([800, 400]);
      }
    }, 2000);

    return () => {
      if (vibInterval) clearInterval(vibInterval);
      if (activeOsc1) {
        try {
          activeOsc1.stop();
          activeOsc1.disconnect();
        } catch (e) {}
      }
      if (activeOsc2) {
        try {
          activeOsc2.stop();
          activeOsc2.disconnect();
        } catch (e) {}
      }
      if (activeLFO) {
        try {
          activeLFO.stop();
          activeLFO.disconnect();
        } catch (e) {}
      }
      if (activeGain) {
        try {
          activeGain.disconnect();
        } catch (e) {}
      }
      if (sirenIntervalRef.current) {
        clearInterval(sirenIntervalRef.current);
        sirenIntervalRef.current = null;
      }
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(0);
        } catch (e) {}
      }
    };
  }, [isMuted, emergency?.id]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  const enableAudioManually = async () => {
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try {
        await audioCtxRef.current.resume();
        setAudioBlocked(false);
      } catch (e) {
        console.error("Failed to enable audio manually:", e);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-red-600 flex flex-col items-center p-6 text-white text-center sm:p-12 overflow-y-auto"
    >
      {/* Flashing Background Animation */}
      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="absolute inset-0 bg-red-700 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center max-w-2xl w-full my-auto py-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full flex items-center justify-center mb-8 "
        >
          <Siren className="w-12 h-12 sm:w-16 sm:h-16 text-white " />
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-black mb-4 tracking-tighter uppercase italic">
          Sinyal Darurat Aktif!
        </h1>

        <div className="bg-white/10  border border-white/20 p-6 sm:p-8 rounded-3xl w-full mb-8 shadow-2xl">
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center gap-4 border-b border-white/10 pb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
                {emergency.userPhoto ? (
                  <img
                    src={emergency.userPhoto}
                    alt="Reporter"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Nama Pelapor
                </p>
                <p className="text-xl sm:text-2xl font-black leading-tight">
                  {emergency.userName}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {emergency.userPhone && (
                    <a
                      href={`https://wa.me/${emergency.userPhone.replace(/\D/g, "")}`}
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
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Lokasi Kejadian
                </p>
                {emergency.latitude && emergency.longitude ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${emergency.latitude},${emergency.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold truncate underline hover:text-white/80 transition-colors"
                  >
                    {emergency.userLocation} ↗
                  </a>
                ) : (
                  <p className="text-sm font-bold truncate">
                    {emergency.userLocation}
                  </p>
                )}
                {emergency.userAddress && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <p className="text-sm font-black bg-white/20 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                      {emergency.userAddress}
                    </p>
                    <p className="text-sm font-black bg-white/30 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                      RT: {emergency.rt || "-"} / RW: {emergency.rw || "-"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Waktu Terkirim
                </p>
                <p className="text-lg font-bold">
                  {new Date(emergency.timestamp).toLocaleTimeString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-lg sm:text-xl font-bold mb-8 animate-bounce flex items-center gap-2">
          <LifeBuoy className="w-6 h-6" />
          Membutuhkan Pertolongan Segera!
        </p>

        {/* Maps Navigation Button */}
        {emergency.latitude && emergency.longitude && (
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`,
                "_blank",
              )
            }
            className="px-10 py-5 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
          >
            <MapPin className="w-6 h-6" />
            CEK LOKASI KEJADIAN
          </button>
        )}

        {/* STOP SOS Button */}
        {canResolve && (
          <button
            onClick={() => onResolve(emergency.id)}
            className="px-10 py-5 bg-white text-rose-600 rounded-[2rem] font-black uppercase text-sm w-full tracking-widest hover:bg-rose-50 hover:scale-[1.02] transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-4 flex items-center justify-center gap-3 border-2 border-white/50"
          >
            <CheckCircle className="w-6 h-6" />
            STOP SOS & KEMBALI KE MENU UTAMA
          </button>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2 flex-wrap">
          {/* Back to menu without stopping */}
          <button
            onClick={() => {
              onCloseLocal();
              setActiveTab('dashboard');
            }}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <LayoutDashboard className="w-4 h-4" /> Kembali Ke Menu Utama
          </button>

          {audioBlocked && !isMuted ? (
            <button
              onClick={enableAudioManually}
              className="px-6 py-4 bg-yellow-400 text-slate-900 border border-[#ffcbcb] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-300 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto shadow-xl"
            >
              <Volume2 className="w-5 h-5" /> AKTIFKAN ALARM
            </button>
          ) : null}

          {!isMuted ? (
            <button
              onClick={() => setIsMuted(true)}
              className="px-6 py-4 bg-red-700/50 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <BellOff className="w-5 h-5" /> Stop Suara
            </button>
          ) : (
            <button
              onClick={() => setIsMuted(false)}
              className="px-6 py-4 bg-emerald-600 border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Volume2 className="w-5 h-5" /> On Suara
            </button>
          )}
        </div>

        <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-widest">
          Sinyal ini terkirim ke seluruh pengurus dan warga
        </p>
      </div>
    </motion.div>
  );
}

const AVAILABLE_VOUCHERS = [
  {
    code: "PASTIDISKON",
    title: "Hemat di Setiap Transaksi (11%)",
    description: "Nikmati potongan harga langsung 11% dari subtotal belanja Anda dengan maksimum diskon mencapai Rp55.000.",
    discountType: "PERCENTAGE",
    discountValue: 11,
    maxDiscount: 55000,
    badge: "11x Diskon s.d. Rp55rb",
    color: "emerald"
  },
  {
    code: "FLASHSALE50",
    title: "Flash Sale Eksklusif Diskon 50%",
    description: "Diskon istimewa sebesar 50% tanpa batas potongan harga, berlaku untuk semua jenis produk hari ini.",
    discountType: "PERCENTAGE",
    discountValue: 50,
    badge: "Diskon 50% Tanpa Limit",
    color: "rose"
  },
  {
    code: "ONGKIR0",
    title: "Gratis Ongkos Kirim RT 26",
    description: "Bebas ongkos kirim standar ke seluruh wilayah RT 26 tanpa minimum nominal transaksi.",
    discountType: "FREE_SHIPPING",
    discountValue: 12000,
    badge: "Potongan Ongkir Rp12.000",
    color: "blue"
  }
];

function ETokoView({
  userRole,
  tenantId,
  products,
  orders,
  reviews,
  currentUser,
  wargaAuth,
  handleFirestoreError,
  handleFileUpload,
  showNotification,
  accessMode,
}: {
  userRole: string;
  tenantId: string;
  products: any[];
  orders: any[];
  reviews: any[];
  currentUser: any;
  wargaAuth: any;
  handleFirestoreError: any;
  handleFileUpload: (file: File, folder: string) => Promise<string>;
  showNotification: any;
  accessMode?: "LIHAT" | "JUAL" | "PRIORITAS" | boolean;
}) {
  const [view, setView] = useState<"buyer" | "seller">("buyer");
  const [activeTab, setActiveTab] = useState<"shop" | "orders">("shop");
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedRT, setSelectedRT] = useState("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editProdFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "TRANSFER">("COD");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [targetOrderForReview, setTargetOrderForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeDetailTab, setActiveDetailTab] = useState<"detail" | "reviews">("detail");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Admin states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "Sembako",
    description: "",
    image: "",
  });

  const isAdmin =
    userRole === "ADMIN" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "OWNER" ||
    userRole === "RW" ||
    userRole === "RT";

  const isWarga = userRole === "WARGA" || userRole === "USER";

  // Allow Warga to toggle to seller view too
  const canToggleView = isAdmin || isWarga;
  const categories = [
    "Semua",
    "Sembako",
    "Rumah tangga",
    "Makanan & minuman",
    "Fashion",
    "Elektronik",
    "ATK & lainnya",
    "🔧 Servis (AC, listrik, bangunan)",
    "🧺 Laundry & kebersihan",
    "🚚 Transport / kurir",
    "🎓 Les & jasa profesional",
  ];

  const rtOptions = [
    "Semua",
    ...Array.from(new Set(products.map((p) => p.rtId).filter(Boolean))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesRT = selectedRT === "Semua" || p.rtId === selectedRT;
    return matchesSearch && matchesCategory && matchesRT;
  });

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showNotification(`${product.name} ditambahkan ke keranjang`, "success");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Perhitungan Ongkir dan Promo Fungsional
  const standardShippingFee = cart.length > 0 ? 12000 : 0;
  const isFreeShipping = appliedPromo?.code === "ONGKIR0";
  const shippingFee = isFreeShipping ? 0 : standardShippingFee;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.code === "PASTIDISKON") {
      const elevenPercent = Math.round(cartTotal * 0.11);
      discountAmount = Math.min(elevenPercent, 55000);
    } else if (appliedPromo.code === "FLASHSALE50") {
      discountAmount = Math.round(cartTotal * 0.5);
    }
  }

  const handleApplyPromoCode = (codeToApply: string) => {
    const formattedCode = codeToApply.trim().toUpperCase();
    const found = AVAILABLE_VOUCHERS.find((v) => v.code === formattedCode);
    if (found) {
      setAppliedPromo(found);
      setPromoCodeInput("");
      showNotification(`Voucher ${found.code} berhasil diterapkan!`, "success");
    } else {
      showNotification("Kode promo tidak valid atau kadaluarsa. Silakan cek syarat penggunaan.", "error");
    }
  };

  const finalTotal = Math.max(0, cartTotal + shippingFee - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const voterId = wargaAuth?.nik || currentUser?.uid;
    if (!voterId) {
      showNotification("Silakan login untuk memesan", "error");
      return;
    }

    setIsLoading(true);
    try {
      const orderId = `ORD-${Date.now()}`;
      await setDoc(doc(db, "toko_orders", orderId), {
        id: orderId,
        tenantId,
        items: cart,
        subtotal: cartTotal,
        shippingFee: shippingFee,
        discount: discountAmount,
        total: finalTotal,
        promoApplied: appliedPromo?.code || null,
        customerName: wargaAuth?.nama || currentUser?.name || "Warga",
        customerId: voterId,
        phone: wargaAuth?.telepon || "-",
        address: wargaAuth?.alamat || "-",
        paymentMethod: paymentMethod,
        status: "PENDING",
        timestamp: new Date().toISOString(),
      });

      // Update stock (ideally via cloud function/batch, but here for demo)
      const batch = writeBatch(db);
      cart.forEach((item) => {
        const prodRef = doc(db, "toko_products", item.id);
        const original = products.find((p) => p.id === item.id);
        if (original) {
          batch.update(prodRef, {
            stock: Math.max(0, (original.stock || 0) - item.qty),
          });
        }
      });
      await batch.commit();

      setCart([]);
      setShowCart(false);
      setActiveTab("orders");
      showNotification("Pesanan berhasil dikirim!", "success");
    } catch (err) {
      handleFirestoreError(err, "create", "toko_orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Seller/Admin Actions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const id = editingProduct ? editingProduct.id : `PROD-${Date.now()}`;
      const sellerId = wargaAuth?.nik || currentUser?.email || currentUser?.uid || "unknown";
      await setDoc(
        doc(db, "toko_products", id),
        {
          ...productForm,
          id,
          tenantId,
          sellerId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setEditingProduct(null);
      setIsAddingProduct(false);
      setProductForm({
        name: "",
        price: 0,
        stock: 0,
        category: "Sembako",
        description: "",
        image: "",
      });
      showNotification("Produk berhasil disimpan", "success");
    } catch (err) {
      handleFirestoreError(err, "write", "toko_products");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteDoc(doc(db, "toko_products", id));
      showNotification("Produk dihapus", "success");
    } catch (err) {
      handleFirestoreError(err, "delete", "toko_products");
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "toko_orders", orderId), { status });
      showNotification(
        `Pesanan ${status === "COMPLETED" ? "Selesai" : "Dibatalkan"}`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, "update", "toko_orders");
    }
  };

  const handleSaveReview = async () => {
    if (!reviewComment.trim() || !targetOrderForReview) return;
    setIsLoading(true);
    try {
      const reviewId = `REV-${targetOrderForReview.id}-${Date.now()}`;
      const firstItem = targetOrderForReview.items[0];
      await setDoc(doc(db, "toko_reviews", reviewId), {
        id: reviewId,
        orderId: targetOrderForReview.id,
        productId: firstItem.id,
        productName: firstItem.name,
        rating: reviewRating,
        comment: reviewComment,
        customerName: wargaAuth?.nama || currentUser?.name || "Warga",
        customerId: wargaAuth?.nik || currentUser?.uid,
        timestamp: new Date().toISOString(),
        tenantId,
      });

      await updateDoc(doc(db, "toko_orders", targetOrderForReview.id), {
        isReviewed: true,
      });

      showNotification("Ulasan berhasil dikirim!", "success");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewModal(false);
      setTargetOrderForReview(null);
    } catch (err) {
      handleFirestoreError(err, "create", "toko_reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const displayProducts = view === "seller" && isWarga 
    ? products.filter(p => p.sellerId === (wargaAuth?.nik || currentUser?.email || currentUser?.uid))
    : products;

  const displayOrders = view === "seller" && isWarga
    ? orders.filter(o => o.items.some((item: any) => {
        const prod = products.find(p => p.id === item.id);
        return prod?.sellerId === (wargaAuth?.nik || currentUser?.email || currentUser?.uid);
      }))
    : orders;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
            E-LAPAK26
          </h2>
          <p className="text-slate-500 font-medium">
            Beli kebutuhan harian lebih mudah & dukung UMKM warga
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {canToggleView && (
            <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
              <StyledButton
                onClick={() => setView("buyer")}
                label="Pembeli"
                colorType={view === "buyer" ? "pastelRed" : "secondary"}
                className="text-xs px-4 py-2"
              />
              <StyledButton
                onClick={() => setView("seller")}
                label="Penjual"
                colorType={view === "seller" ? "pastelBlue" : "secondary"}
                className="text-xs px-4 py-2"
              />
            </div>
          )}

          {view === "buyer" && (
            <button
              onClick={() => setShowCart(true)}
              className="relative p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
            >
              <ShoppingCart className="w-6 h-6 text-slate-700" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-blue text-white w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {view === "buyer" ? (
        <div className="space-y-8">
          {/* Navigation Tab */}
          <div className="flex border-b border-slate-200 gap-8">
            <button
              onClick={() => setActiveTab("shop")}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "shop" ? "text-brand-blue" : "text-slate-400"}`}
            >
              Belanja Umum
              {activeTab === "shop" && (
                <motion.div
                  layoutId="tokotab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === "orders" ? "text-brand-blue" : "text-slate-400"}`}
            >
              Pesanan Saya
              {activeTab === "orders" && (
                <motion.div
                  layoutId="tokotab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                />
              )}
            </button>
          </div>

          {activeTab === "shop" && (
            <BelanjaView 
              products={products} 
              onAddToCart={addToCart}
              showNotification={showNotification}
              onProductSelect={(p) => {
                setSelectedProduct(p);
                setShowProductModal(true);
              }}
            />
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders
                .filter(
                  (o) => o.customerId === (wargaAuth?.nik || currentUser?.uid),
                )
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
                )
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-4 rounded-2xl ${order.status === "COMPLETED" ? "bg-green-50 text-green-600" : order.status === "CANCELLED" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                      >
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">
                          {order.id}
                        </h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(order.timestamp).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 px-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item: any) => (
                          <span
                            key={item.id}
                            className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg"
                          >
                            {item.qty}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-black text-slate-800">
                        Rp {order.total?.toLocaleString("id-ID")}
                      </p>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${
                          order.status === "COMPLETED"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : order.status === "CANCELLED"
                              ? "text-red-600 border-red-200 bg-red-50"
                              : "text-blue-600 border-blue-200 bg-blue-50"
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.status === "COMPLETED" && !order.isReviewed && (
                        <button
                          onClick={() => {
                            setTargetOrderForReview(order);
                            setShowReviewModal(true);
                          }}
                          className="mt-2 block w-full px-3 py-1.5 bg-brand-blue text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-blue-600 transition-all"
                        >
                          Beri Ulasan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              {orders.filter(
                (o) => o.customerId === (wargaAuth?.nik || currentUser?.uid),
              ).length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <ShoppingBag className="w-16 h-16 opacity-10 mx-auto mb-4" />
                  <p className="font-bold text-sm uppercase tracking-widest">
                    Belum ada pesanan
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Seller / Admin View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order List for Admin */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-brand-blue" /> Pesanan
              Masuk
            </h3>
            <div className="space-y-4">
              {displayOrders
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime(),
                )
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-slate-800">
                            {order.customerName}
                          </h4>
                          <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === "PENDING" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {order.id} •{" "}
                          {new Date(order.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xl font-black text-brand-blue">
                        Rp {order.total?.toLocaleString()}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-60">
                        Rincian Barang
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm font-medium"
                          >
                            <span className="text-slate-600">
                              {item.qty}x {item.name}
                            </span>
                            <span className="text-slate-800">
                              Rp {(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 gap-4">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {order.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.address}
                        </div>
                      </div>
                      {order.status === "PENDING" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "CANCELLED")
                            }
                            className="px-4 py-2 text-red-600 font-bold text-xs hover:bg-red-50 rounded-xl transition-all"
                          >
                            Tolak
                          </button>
                          <button
                            onClick={() =>
                              updateOrderStatus(order.id, "COMPLETED")
                            }
                            className="px-6 py-2 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 active:scale-95"
                          >
                            Selesaikan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Product Management */}
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-6 h-6 text-brand-blue" /> Inventaris
              </h3>
              <button
                onClick={() => {
                  setIsAddingProduct(true);
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    price: 0,
                    stock: 0,
                    category: "Sembako",
                    description: "",
                    image: "",
                  });
                }}
                className="p-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {displayProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    <img
                      src={p.image || "https://via.placeholder.com/100"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">
                      {p.name}
                    </h4>
                    <p className="text-[10px] font-black text-brand-blue uppercase">
                      {p.price?.toLocaleString()} • Stok: {p.stock}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {(!isWarga || p.sellerId === (wargaAuth?.nik || currentUser?.email || currentUser?.uid)) && (
                      <>
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsAddingProduct(true);
                            setProductForm({ ...p });
                          }}
                          className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  Keranjang Belanja
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 bg-slate-100 rounded-xl"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || "https://via.placeholder.com/100"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-sm font-black text-brand-blue mb-2">
                        Rp {item.price?.toLocaleString()}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="p-2 hover:bg-slate-200 transition-all"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-black">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-2 hover:bg-slate-200 transition-all"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <ShoppingBag className="w-20 h-20 opacity-10 mb-4" />
                    <p className="font-black uppercase tracking-widest">
                      Keranjang Kosong
                    </p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 space-y-5 overflow-y-auto max-h-[60%]">
                {/* Metode Pembayaran */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Metode Pembayaran
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod("COD")}
                      className={`p-3 text-xs font-black uppercase rounded-xl border transition-all ${paymentMethod === "COD" ? "border-brand-blue bg-blue-50 text-brand-blue shadow-sm" : "border-slate-200 bg-white hover:bg-slate-100"}`}
                    >
                      COD (Bayar di Tempat)
                    </button>
                    <button
                      onClick={() => setPaymentMethod("TRANSFER")}
                      className={`p-3 text-xs font-black uppercase rounded-xl border transition-all ${paymentMethod === "TRANSFER" ? "border-brand-blue bg-blue-50 text-brand-blue shadow-sm" : "border-slate-200 bg-white hover:bg-slate-100"}`}
                    >
                      Transfer Bank
                    </button>
                  </div>
                </div>

                {/* Kode Promo / Voucher */}
                <div className="border-t border-slate-200/60 pt-4 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={12} className="text-emerald-500" /> Kode Promo / Voucher
                  </p>
                  
                  {appliedPromo ? (
                    <div className={`p-4 rounded-xl border border-dashed flex items-center justify-between transition-all ${appliedPromo.code === 'PASTIDISKON' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : appliedPromo.code === 'FLASHSALE50' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                      <div className="flex items-center gap-2">
                        <Gift size={16} className={`animate-bounce ${appliedPromo.code === 'PASTIDISKON' ? 'text-emerald-600' : appliedPromo.code === 'FLASHSALE50' ? 'text-rose-600' : 'text-blue-600'}`} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-black tracking-wide uppercase">{appliedPromo.code}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/80 rounded-md border border-slate-200">Aktif</span>
                          </div>
                          <p className="text-[10px] opacity-80 font-bold mt-0.5">{appliedPromo.badge}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setAppliedPromo(null);
                          showNotification("Voucher berhasil dilepas", "info");
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all text-[10px] font-black uppercase"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="Masukkan Kode Voucher..."
                        className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                      />
                      <button 
                        onClick={() => handleApplyPromoCode(promoCodeInput)}
                        className="px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase rounded-xl transition-all shadow-md shadow-emerald-500/10"
                      >
                        Pakai
                      </button>
                    </div>
                  )}

                  {/* Voucher List Selector Toggle */}
                  {!appliedPromo && (
                    <div>
                      <button 
                        onClick={() => setShowVoucherList(!showVoucherList)}
                        className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1.5 transition-all text-left"
                      >
                        <Ticket size={12} className="shrink-0" /> 
                        {showVoucherList ? "Sembunyikan Daftar Voucher" : "Pilih Kupon / Voucher Toko yang Tersedia"}
                      </button>

                      {showVoucherList && (
                        <div className="mt-2.5 max-h-44 overflow-y-auto space-y-2 p-1.5 bg-white rounded-xl border border-slate-100 shadow-inner">
                          {AVAILABLE_VOUCHERS.map((v) => (
                            <div 
                              key={v.code} 
                              className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${v.code === 'PASTIDISKON' ? 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/20' : v.code === 'FLASHSALE50' ? 'border-rose-100 hover:border-rose-200 bg-rose-50/20' : 'border-blue-100 hover:border-blue-200 bg-blue-50/20'}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase text-white ${v.color === 'emerald' ? 'bg-emerald-500' : v.color === 'rose' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                                  {v.code}
                                </span>
                                <button 
                                  onClick={() => handleApplyPromoCode(v.code)}
                                  className={`px-3 py-1 text-[9px] font-black rounded-lg uppercase transition-all text-white active:scale-95 ${v.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/10' : v.color === 'rose' ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-500/10' : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/10'}`}
                                >
                                  Gunakan
                                </button>
                              </div>
                              <h5 className="text-[11px] font-black text-slate-800 leading-tight uppercase tracking-tight">{v.title}</h5>
                              <p className="text-[9px] font-bold text-slate-400 leading-relaxed">{v.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Pemecahan Rincian Bayar */}
                <div className="border-t border-slate-200/60 pt-4 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-450">
                    <span>Subtotal Produk</span>
                    <span>Rp {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-450">
                    <span>Ongkos Kirim (RT 26)</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-600 font-extrabold uppercase text-[10px] bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded tracking-wide">Gratis Ongkir</span>
                      ) : (
                        `Rp ${shippingFee.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs font-black text-rose-600">
                      <span>Potongan Voucher Promo</span>
                      <span>-Rp {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end pt-3 border-t border-dashed border-slate-200">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Akhir Pembayaran
                      </p>
                      <p className="text-3xl font-black text-slate-800 tracking-tighter">
                        Rp {finalTotal.toLocaleString()}
                      </p>
                    </div>
                    {appliedPromo && (
                      <span className="text-[10px] font-black text-emerald-750 uppercase bg-emerald-100/70 px-2 leading-none py-1.5 rounded-lg border border-emerald-200/60 flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-600 shrink-0" />
                        Hemat Rp {discountAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={cart.length === 0 || isLoading}
                  onClick={handleCheckout}
                  className="w-full py-5 bg-brand-blue hover:bg-blue-600 disabled:bg-slate-300 disabled:shadow-none text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
                >
                  {isLoading ? (
                    "Membuat Pesanan..."
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" /> Buat Pesanan Sekarang
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProductModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden z-10"
            >
              <div className="relative h-64">
                <img
                  src={
                    selectedProduct.image || "https://via.placeholder.com/600"
                  }
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowProductModal(false)}
                  className="absolute top-4 right-4 p-2 bg-slate-900/50 backdrop-blur-md rounded-full text-white hover:bg-slate-900/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex border-b border-slate-100 mb-6 gap-6">
                  <button
                    onClick={() => setActiveDetailTab("detail")}
                    className={`pb-2 text-[10px] font-black uppercase tracking-widest relative ${activeDetailTab === "detail" ? "text-brand-blue" : "text-slate-400"}`}
                  >
                    Detail Produk
                    {activeDetailTab === "detail" && (
                      <motion.div
                        layoutId="detailtab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveDetailTab("reviews")}
                    className={`pb-2 text-[10px] font-black uppercase tracking-widest relative ${activeDetailTab === "reviews" ? "text-brand-blue" : "text-slate-400"}`}
                  >
                    Ulasan (
                    {
                      reviews.filter((r) => r.productId === selectedProduct.id)
                        .length
                    }
                    )
                    {activeDetailTab === "reviews" && (
                      <motion.div
                        layoutId="detailtab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full"
                      />
                    )}
                  </button>
                </div>

                {activeDetailTab === "detail" ? (
                  <>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">
                      {selectedProduct.name}
                    </h2>
                    <div className="flex items-center gap-2 mb-4">
                      <p className="text-xl font-black text-brand-blue">
                        Rp {selectedProduct.price.toLocaleString()}
                      </p>
                      <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        Stok: {selectedProduct.stock}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                      {selectedProduct.description ||
                        "Kualitas terjamin untuk warga RW 26."}
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          addToCart(selectedProduct);
                          setShowProductModal(false);
                        }}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
                      >
                        Tambah Ke Keranjang
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
                    {reviews.filter((r) => r.productId === selectedProduct.id)
                      .length === 0 ? (
                      <div className="py-14 text-center text-slate-300">
                        <ShoppingBag className="w-12 h-12 mx-auto opacity-10 mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">
                          Belum ada ulasan
                        </p>
                      </div>
                    ) : (
                      reviews
                        .filter((r) => r.productId === selectedProduct.id)
                        .sort(
                          (a, b) =>
                            new Date(b.timestamp).getTime() -
                            new Date(a.timestamp).getTime(),
                        )
                        .map((rev) => (
                          <div
                            key={rev.id}
                            className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                                {rev.customerName}
                              </span>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              {rev.comment}
                            </p>
                            <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase">
                              {new Date(rev.timestamp).toLocaleDateString(
                                "id-ID",
                                { month: "short", year: "numeric" },
                              )}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Editor Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAddingProduct(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 overflow-auto max-h-[90vh]"
          >
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                <Edit className="w-6 h-6" />
              </div>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </h3>

            <form
              onSubmit={handleSaveProduct}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Nama Produk
                  </label>
                  <input
                    required
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    placeholder="Contoh: Beras Raja Lele"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Harga (Rp)
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                      Stok
                    </label>
                    <input
                      required
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Kategori
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    {categories
                      .filter((c) => c !== "Semua")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Foto Produk
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center group relative">
                      {productForm.image ? (
                        <>
                          {productForm.image.toLowerCase().endsWith(".pdf") ? (
                            <FileText className="w-8 h-8 text-brand-blue" />
                          ) : (
                            <img
                              src={productForm.image}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({ ...productForm, image: "" })
                            }
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <Camera className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsLoading(true);
                            try {
                              const url = await handleFileUpload(
                                file,
                                "toko_products",
                              );
                              setProductForm((prev) => ({
                                ...prev,
                                image: url,
                              }));
                              showNotification(
                                "Foto produk berhasil diupload",
                                "success",
                              );
                            } catch (err) {
                              console.error("Upload error in component:", err);
                            } finally {
                              setIsLoading(false);
                              if (e.target) e.target.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                            fileInputRef.current.click();
                          }
                        }}
                        className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/30 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          "Mengupload..."
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Pilih Foto Produk
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold resize-none"
                    placeholder="Tuliskan spesifikasi produk..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200"
                  >
                    {isLoading
                      ? "Menyimpan..."
                      : editingProduct
                        ? "Simpan Perubahan"
                        : "Posting Produk"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function EVotingView({
  userRole,
  tenantId,
  candidates,
  config,
  userVotes,
  currentUser,
  wargaAuth,
  handleFirestoreError,
  handleFileUpload,
  showNotification,
}: {
  userRole: string;
  tenantId: string;
  candidates: any[];
  config: any;
  userVotes: any[];
  currentUser: any;
  wargaAuth: any;
  handleFirestoreError: any;
  handleFileUpload: (file: File, folder: string) => Promise<string>;
  showNotification: any;
}) {
  const [electionScope, setElectionScope] = useState<"RW" | "RT">("RW");
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateDesc, setNewCandidateDesc] = useState("");
  const [newCandidateProfile, setNewCandidateProfile] = useState("");
  const [newCandidatePhoto, setNewCandidatePhoto] = useState("");
  const [editingCandidate, setEditingCandidate] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editProfile, setEditProfile] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [isEditingAturan, setIsEditingAturan] = useState(false);

  // Scope Scaffolding
  const userRt = wargaAuth?.rt || currentUser?.rt || "01";
  const scopeId = electionScope === "RW" ? `CONFIG-RW` : `CONFIG-RT-${userRt}`;

  const currentAturan =
    config?.[scopeId]?.aturan || (electionScope === "RW" ? config.aturan : "");
  const currentStatus =
    config?.[scopeId]?.status ||
    (electionScope === "RW" ? config.status : "CLOSED");

  const [tempAturan, setTempAturan] = useState(currentAturan);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempAturan(currentAturan);
  }, [currentAturan]);

  // Data Filtering
  const filteredCandidates = candidates.filter((c) => {
    if (electionScope === "RW") return c.type === "RW" || !c.type;
    return c.type === "RT" && c.rt === userRt;
  });

  const filteredVotes = userVotes.filter((v) => {
    const candidate = candidates.find((c) => c.id === v.candidateId);
    if (!candidate) return false;
    if (electionScope === "RW")
      return candidate.type === "RW" || !candidate.type;
    return candidate.type === "RT" && candidate.rt === userRt;
  });

  const voterId = wargaAuth?.nik || currentUser?.uid;
  const hasVoted = filteredVotes.some((v) => v.voterId === voterId);
  const isAtLeastRW =
    userRole === "ADMIN" ||
    userRole === "RW" ||
    userRole === "SUPER_ADMIN" ||
    userRole === "OWNER" ||
    tenantId === "MASTER";
  const canManage =
    electionScope === "RW"
      ? isAtLeastRW
      : isAtLeastRW ||
        (userRole === "RT" && userRt === (wargaAuth?.rt || currentUser?.rt));

  const totalFilteredVotes = filteredVotes.length;

  const handleVote = async (candidateId: string) => {
    if (!voterId) {
      showNotification("Silakan login untuk dapat memberikan suara.", "error");
      return;
    }
    if (hasVoted) {
      showNotification(
        `Anda sudah memberikan suara untuk Pemilu ${electionScope}`,
        "error",
      );
      return;
    }
    if (currentStatus !== "OPEN") {
      showNotification("Voting sedang ditutup", "error");
      return;
    }

    setIsLoading(true);
    try {
      const voteId = `VOTE-${electionScope}-${Date.now()}-${voterId}`;
      await setDoc(doc(db, "voting_votes", voteId), {
        id: voteId,
        candidateId,
        voterId,
        tenantId,
        scope: electionScope,
        rt: electionScope === "RT" ? userRt : null,
        timestamp: new Date().toISOString(),
        voterName: wargaAuth?.nama || currentUser?.name || "Warga",
      });
      showNotification(
        `Suara Anda untuk Pemilu ${electionScope} berhasil dikirim!`,
        "success",
      );
      setShowConfirm(null);
    } catch (err) {
      handleFirestoreError(err, "create", "voting_votes");
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = async () => {
    if (!newCandidateName) return;
    setIsLoading(true);
    try {
      const id = `CAN-${Date.now()}`;
      await setDoc(doc(db, "voting_candidates", id), {
        id,
        tenantId,
        type: electionScope,
        rt: electionScope === "RT" ? userRt : null,
        name: newCandidateName,
        description: newCandidateDesc || "Calon baru.",
        profile: newCandidateProfile || "Belum ada profil.",
        photo: newCandidatePhoto || "https://via.placeholder.com/150",
      });
      setNewCandidateName("");
      setNewCandidateDesc("");
      setNewCandidateProfile("");
      setNewCandidatePhoto("");
      showNotification(
        `Kandidat ${electionScope} berhasil ditambahkan`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, "create", "voting_candidates");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCandidate = async (id: string) => {
    if (!confirm("Hapus calon ini?")) return;
    try {
      await deleteDoc(doc(db, "voting_candidates", id));
      showNotification("Calon berhasil dihapus", "success");
    } catch (err) {
      handleFirestoreError(err, "delete", "voting_candidates");
    }
  };

  const startEditCandidate = (c: any) => {
    setEditingCandidate(c.id);
    setEditName(c.name);
    setEditDesc(c.description);
    setEditProfile(c.profile);
    setEditPhoto(c.photo || "");
  };

  const saveEditCandidate = async (id: string) => {
    try {
      await updateDoc(doc(db, "voting_candidates", id), {
        name: editName,
        description: editDesc,
        profile: editProfile,
        photo: editPhoto,
      });
      setEditingCandidate(null);
      showNotification("Data calon diperbarui", "success");
    } catch (err) {
      handleFirestoreError(err, "update", "voting_candidates");
    }
  };

  const saveAturan = async () => {
    try {
      await setDoc(
        doc(db, "voting_config", tenantId),
        {
          [scopeId]: {
            aturan: tempAturan,
            status: currentStatus,
            updatedAt: new Date().toISOString(),
          },
        },
        { merge: true },
      );
      setIsEditingAturan(false);
      showNotification(`Aturan Pemilu ${electionScope} diperbarui`, "success");
    } catch (err) {
      handleFirestoreError(err, "update", "voting_config");
    }
  };

  const toggleVotingStatus = async () => {
    const nextStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await setDoc(
        doc(db, "voting_config", tenantId),
        {
          [scopeId]: {
            status: nextStatus,
            aturan: currentAturan || "",
          },
        },
        { merge: true },
      );
      showNotification(
        `Pemilu ${electionScope} ${nextStatus === "OPEN" ? "Dibuka" : "Ditutup"}`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, "update", "voting_config");
    }
  };

  const resetVotes = async () => {
    if (
      !confirm(
        `Hapus SEMUA suara pada Pemilu ${electionScope}? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;
    try {
      const batch = writeBatch(db);
      filteredVotes.forEach((v) => {
        batch.delete(doc(db, "voting_votes", v.id));
      });
      await batch.commit();
      showNotification(
        `Semua suara Pemilu ${electionScope} berhasil direset`,
        "success",
      );
    } catch (err) {
      handleFirestoreError(err, "delete", "voting_votes_reset");
    }
  };

  const getCandidateVotes = (id: string) => {
    return filteredVotes.filter((v) => v.candidateId === id).length;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Scope Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 mb-8 shadow-sm max-w-sm">
          <button
            onClick={() => setElectionScope("RW")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${electionScope === "RW" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Pemilu RW
          </button>
          <button
            onClick={() => setElectionScope("RT")}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${electionScope === "RT" ? "bg-brand-blue text-white shadow-lg shadow-brand-blue/20" : "text-slate-500 hover:bg-slate-50"}`}
          >
            Pemilu RT {userRt}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none">
              E-PEMILU <span className="text-brand-blue">{electionScope}</span>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`w-2 h-2 rounded-full ${currentStatus === "OPEN" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status:{" "}
                {currentStatus === "OPEN"
                  ? "Voting Berlangsung"
                  : "Voting Ditutup"}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex gap-2">
              <button
                onClick={toggleVotingStatus}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === "OPEN" ? "bg-red-50 text-red-600 border border-red-100" : "bg-green-50 text-green-600 border border-green-100"}`}
              >
                {currentStatus === "OPEN" ? "Tutup Voting" : "Buka Voting"}
              </button>
              <button
                onClick={resetVotes}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Aturan Main Section */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-blue" />
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Ketentuan Pemilihan {electionScope}
              </h3>
            </div>
            {canManage && (
              <button
                onClick={() =>
                  isEditingAturan ? saveAturan() : setIsEditingAturan(true)
                }
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${isEditingAturan ? "bg-brand-blue text-white border-brand-blue" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                {isEditingAturan ? "Simpan" : "Edit"}
              </button>
            )}
          </div>
          {isEditingAturan ? (
            <textarea
              value={tempAturan}
              onChange={(e) => setTempAturan(e.target.value)}
              className="w-full h-40 p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm text-slate-700 focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-medium leading-relaxed shadow-inner"
              placeholder={`Tuliskan aturan pemilihan ${electionScope} di sini...`}
            />
          ) : (
            <div className="prose prose-slate max-w-none">
              <pre className="text-slate-600 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                {currentAturan || "Belum ada aturan yang ditetapkan."}
              </pre>
            </div>
          )}
        </div>

        {canManage && (
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 mb-8">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <PlusCircle className="w-5 h-5" />
              </div>
              Tambah Kandidat {electionScope}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Nama Lengkap Calon
                  </label>
                  <input
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Contoh: Bpk. Nama Lengkap"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Motto / Deskripsi Singkat
                  </label>
                  <input
                    value={newCandidateDesc}
                    onChange={(e) => setNewCandidateDesc(e.target.value)}
                    placeholder="Contoh: Bersama Membangun RW 26"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Foto / Berkas Kandidat
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center group relative">
                      {newCandidatePhoto ? (
                        <>
                          {newCandidatePhoto.toLowerCase().endsWith(".pdf") ? (
                            <FileText className="w-8 h-8 text-brand-blue" />
                          ) : (
                            <img
                              src={newCandidatePhoto}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => setNewCandidatePhoto("")}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <Camera className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsLoading(true);
                            try {
                              const url = await handleFileUpload(
                                file,
                                "voting_candidates",
                              );
                              setNewCandidatePhoto(url);
                              showNotification(
                                "Berkas berhasil diupload",
                                "success",
                              );
                            } catch (err) {
                              console.error("Upload error in component:", err);
                            } finally {
                              setIsLoading(false);
                              if (e.target) e.target.value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/30 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" />{" "}
                            Mengupload...
                          </span>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Pilih Foto / Berkas
                          </>
                        )}
                      </button>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight ml-1">
                        PNG, JPG, PDF (Maks. 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Visi, Misi & Profil Lengkap
                  </label>
                  <textarea
                    value={newCandidateProfile}
                    onChange={(e) => setNewCandidateProfile(e.target.value)}
                    placeholder="Tuliskan pengalaman dan rencana kerja kandidat..."
                    className="w-full h-[180px] p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                  />
                </div>
                <button
                  onClick={addCandidate}
                  disabled={isLoading}
                  className="w-full py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    "Memproses..."
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" /> Daftarkan Calon
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCandidates.map((candidate, idx) => {
            const votes = getCandidateVotes(candidate.id);
            const percentage =
              totalFilteredVotes > 0 ? (votes / totalFilteredVotes) * 100 : 0;

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-brand-blue/5 transition-all duration-500 relative flex flex-col"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={candidate.photo || "https://via.placeholder.com/400"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Result Overlay */}
                  {(hasVoted || canManage) && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center border border-white/20">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Suara
                        </span>
                        <span className="text-2xl font-black text-brand-blue leading-none mt-1">
                          {votes}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                      Kandidat Nomor {idx + 1}
                    </p>
                    <h4 className="text-2xl font-black text-white leading-tight mb-1 uppercase tracking-tight">
                      {candidate.name}
                    </h4>
                    <p className="text-xs font-medium text-white/80 line-clamp-2 italic">
                      {candidate.description}
                    </p>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  {/* Stats bar if voted */}
                  {hasVoted && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Persentase Suara
                        </span>
                        <span className="text-sm font-black text-brand-blue">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="h-full bg-brand-blue rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 mt-auto">
                    <button
                      onClick={() => setShowConfirm(candidate.id)}
                      disabled={hasVoted || currentStatus !== "OPEN"}
                      className={`w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        hasVoted
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed font-bold"
                          : currentStatus !== "OPEN"
                            ? "bg-red-50 text-red-300 border border-red-50 cursor-not-allowed font-bold"
                            : "bg-brand-blue text-white shadow-xl shadow-brand-blue/20 hover:scale-[1.03] active:scale-95 font-bold"
                      }`}
                    >
                      {hasVoted
                        ? "Sudah Memilih"
                        : currentStatus !== "OPEN"
                          ? "Voting Ditutup"
                          : "Pilih Kandidat"}
                    </button>

                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditCandidate(candidate)}
                          className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCandidate(candidate.id)}
                          className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Belum Ada Kandidat
            </h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">
              Panitia belum mendaftarkan calon kandidat untuk Pemilu{" "}
              {electionScope}.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
            onClick={() => setShowConfirm(null)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative z-10 border border-white/20"
          >
            <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Vote className="w-10 h-10 text-brand-blue" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 text-center uppercase tracking-tighter mb-4 leading-none">
              Konfirmasi Suara
            </h3>
            <p className="text-center text-slate-500 text-base font-medium mb-10 px-4">
              Apakah Anda yakin ingin memberikan suara untuk{" "}
              <span className="text-brand-blue font-bold">
                {candidates.find((c) => c.id === showConfirm)?.name}
              </span>{" "}
              pada Pemilu {electionScope}?
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleVote(showConfirm)}
                disabled={isLoading}
                className="w-full py-5 bg-brand-blue text-white rounded-2.5xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 font-bold"
              >
                {isLoading ? (
                  <Clock className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Ya, Saya Yakin"
                )}
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="w-full py-5 bg-slate-50 text-slate-600 rounded-2.5xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-bold"
              >
                Mungkin Nanti
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Pilihan Anda bersifat
              Rahasia & Anonim
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const QuotaProgress = ({
  label,
  current,
  max,
  color = "blue",
  isText = false,
}: {
  label: string;
  current: any;
  max: any;
  color?: string;
  isText?: boolean;
}) => {
  const percentage = isText ? 100 : Math.min(100, (current / max) * 100);
  const colorMap: Record<string, string> = {
    blue: "bg-brand-blue",
    pink: "bg-brand-pink",
    yellow: "bg-brand-yellow",
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
  };

  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          {label}
        </span>
        <span
          className={`text-[10px] font-black ${isText ? "text-indigo-600" : "text-slate-600"}`}
        >
          {isText ? (
            current
          ) : (
            <>
              {current} / <span className="text-slate-400">{max}</span>
            </>
          )}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${colorMap[color] || "bg-brand-blue"}`}
        />
      </div>
    </div>
  );
};

function PengaturanView({
  tenantId,
  currentTenant,
  wargaData,
  settings,
  userRole,
  handleFileUpload,
  showNotification,
  handleFirestoreError,
  currentUser,
  setActiveTab,
}: {
  tenantId: string;
  currentTenant?: any;
  wargaData?: any[];
  settings: any;
  userRole: string;
  handleFileUpload: any;
  showNotification: any;
  handleFirestoreError: any;
  currentUser: any;
  setActiveTab: any;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roleUpper = userRole?.toUpperCase();
    if (
      roleUpper !== "ADMIN" &&
      roleUpper !== "SUPER_ADMIN" &&
      roleUpper !== "OWNER" &&
      roleUpper !== "SUPER ADMIN" &&
      roleUpper !== "RW" &&
      roleUpper !== "RT" &&
      !currentUser?.isSuperAdmin
    ) {
      showNotification("Hanya Admin yang dapat mengubah pengaturan.", "error");
      return;
    }

    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const newSettings: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (typeof value === "string") {
        newSettings[key] = value;
      }
    });

    try {
      // Save General Settings
      await setDoc(doc(db, "settings", tenantId), newSettings, { merge: true });

      // Build tenant update object
      const tenantUpdate: any = {};
      if (newSettings.tenant_system_logo) {
        tenantUpdate.logo_url = newSettings.tenant_system_logo;
      }
      if (newSettings.nama_rt) {
        tenantUpdate.name = newSettings.nama_rt;
        tenantUpdate.nama = newSettings.nama_rt;
      }
      if (newSettings.tagline !== undefined) {
        tenantUpdate.tagline = newSettings.tagline;
      }

      // Save Tenant Info if we have updates
      if (Object.keys(tenantUpdate).length > 0) {
        await setDoc(doc(db, "tenants", tenantId), tenantUpdate, {
          merge: true,
        });
      }

      showNotification("Pengaturan berhasil disimpan.", "success");
    } catch (error) {
      console.error("Save Settings Error:", error);
      if (typeof handleFirestoreError === "function") {
        handleFirestoreError(error, "update", `settings/${tenantId}`);
      } else {
        showNotification(
          "Gagal menyimpan pengaturan. Periksa koneksi atau izin anda.",
          "error",
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const generateDummyData = async () => {
    setIsGenerating(true);
    setGenerateMsg("Mulai membuat data dummy...");

    try {
      const batch = writeBatch(db);

      // --- 1. DATA WARGA (20 Warga, 5 Kepala Keluarga) ---
      const keluargaData = [
        {
          kk: "3216061111111111",
          namaKK: "Budi Santoso",
          istri: "Siti Aminah",
          anak1: "Budi Junior",
          anak2: "Ayu Lestari",
          rt: "01",
          blok: "Blok A No 1",
        },
        {
          kk: "3216062222222222",
          namaKK: "Ahmad Dahlan",
          istri: "Chairunnisa",
          anak1: "Raka Pratama",
          anak2: "Riki Hermawan",
          rt: "02",
          blok: "Blok B No 12",
        },
        {
          kk: "3216063333333333",
          namaKK: "Joko Widodo",
          istri: "Iriana M",
          anak1: "Gibran R",
          anak2: "Kaesang P",
          rt: "03",
          blok: "Blok C No 5",
        },
        {
          kk: "3216064444444444",
          namaKK: "Prabowo S",
          istri: "Titiek S",
          anak1: "Didit H",
          anak2: "Bobby N",
          rt: "01",
          blok: "Blok A No 8",
        },
        {
          kk: "3216065555555555",
          namaKK: "Susilo B Y",
          istri: "Ani Y",
          anak1: "Agus H",
          anak2: "Ibas Y",
          rt: "04",
          blok: "Blok D No 15",
        },
      ];

      let generatedWargas: any[] = [];
      let wIdx = 1;
      const nowWARGA = Date.now();

      for (const kel of keluargaData) {
        const familyMembers = [
          {
            nama: kel.namaKK,
            posisi: "Suami (Kepala Keluarga)",
            jk: "Laki-Laki",
            ttl: `Jakarta, ${1970 + wIdx}-01-01`,
          },
          {
            nama: kel.istri,
            posisi: "Istri",
            jk: "Perempuan",
            ttl: `Jakarta, ${1973 + wIdx}-02-02`,
          },
          {
            nama: kel.anak1,
            posisi: "Anak",
            jk: "Laki-Laki",
            ttl: `Jakarta, ${1995 + wIdx}-03-03`,
          },
          {
            nama: kel.anak2,
            posisi: "Anak",
            jk: wIdx % 2 === 0 ? "Laki-Laki" : "Perempuan",
            ttl: `Jakarta, ${1998 + wIdx}-04-04`,
          },
        ];

        for (const member of familyMembers) {
          const wId = `WARGA-${nowWARGA}-${wIdx}-${Math.floor(Math.random() * 10000)}`;
          const newWarga = {
            id: wId,
            tenantId: tenantId,
            nik: `321606${nowWARGA.toString().slice(-6)}${wIdx.toString().padStart(4, "0")}`,
            kk: kel.kk,
            nama: member.nama,
            tempatLahir: member.ttl.split(", ")[0],
            tglLahir: member.ttl.split(", ")[1],
            jk: member.jk,
            posisi: member.posisi,
            agama: "Islam",
            kawin: member.posisi === "Anak" ? "Belum Kawin" : "Kawin",
            kewarganegaraan: "WNI",
            profesi:
              member.posisi === "Anak"
                ? "Pelajar/Mahasiswa"
                : "Karyawan Swasta",
            rt: kel.rt,
            rw: "26",
            kelurahan: "Kebalen",
            kecamatan: "Babelan",
            kota_kab: "Bekasi",
            blok: kel.blok,
            status: "Warga Tetap",
            hp: `0812${Date.now().toString().slice(-8)}`,
            fotoText: "-",
            fotoUrl: null,
          };
          generatedWargas.push(newWarga);
          batch.set(doc(db, "data_warga", wId), newWarga);
          wIdx++;
        }
      }

      setGenerateMsg("Warga berhasil di-generate. Membuat transaksi & kas...");

      // --- 2. DATA TRANSAKSI (IURAN & KAS) (50 Item) ---
      const nowTX = Date.now();
      for (let i = 1; i <= 50; i++) {
        const RandomWarga =
          generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const isKeluar = i % 4 === 0; // 25% pengeluaran

        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 90)); // random within last 90 days
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const formattedDateTime =
          formattedDate +
          ", " +
          dateObj
            .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            .replace(/\./g, ":");

        const kasId = `TRX-DUMMY-${nowTX}-${i}`;
        const iuranId = `INV-DUMMY-${nowTX}-${i}`;

        let jenis = "";
        let keterangan = "";
        let nominal = 0;

        if (isKeluar) {
          const jenisPengeluaran = [
            "Pemeliharaan Lingkungan",
            "Kegiatan Warga",
            "Upah",
            "Bayar jasa",
            "Pemasangan",
          ];
          jenis = jenisPengeluaran[i % jenisPengeluaran.length];
          keterangan = `Pembayaran ${jenis}`;
          nominal = 150000 + Math.floor(Math.random() * 5) * 50000;

          batch.set(doc(db, "kas", kasId), {
            id: kasId,
            tenantId: tenantId,
            tanggal: formattedDate,
            tipe: "Keluar",
            transaksi: jenis,
            nama: i % 2 === 0 ? "Toko Material" : "Bpk. Tukang",
            alamat: "-",
            keterangan: keterangan,
            debit: 0,
            kredit: nominal,
            strukUrl: "",
          });
        } else {
          jenis = "Iuran Rutin Warga";
          keterangan = "Iuran Bulanan";
          nominal = 50000;

          // Set ke kas
          batch.set(doc(db, "kas", kasId), {
            tenantId: tenantId,
            id: kasId,
            tanggal: formattedDate,
            tipe: "Masuk",
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            keterangan: keterangan,
            debit: nominal,
            kredit: 0,
            strukUrl: "",
          });

          // Set ke iuran
          batch.set(doc(db, "iuran", iuranId), {
            tenantId: tenantId,
            id: iuranId,
            rt: RandomWarga.rt,
            tanggal: formattedDateTime,
            transaksi: jenis,
            nama: RandomWarga.nama,
            alamat: RandomWarga.blok,
            tipe: "Masuk",
            periode: "Mar 2026",
            nominal: nominal,
            status: "Lunas",
            keterangan: keterangan,
            strukUrl: "",
          });
        }
      }

      setGenerateMsg(
        "Transaksi berhasil di-generate. Membuat Surat Pengantar...",
      );

      // --- 3. DATA SURAT (50 Item) ---
      const jenisSurat = [
        "Surat Pengantar KTP",
        "Surat Keterangan Domisili",
        "Surat Pengantar SKCK",
        "Surat Keterangan Usaha (SKU)",
      ];
      const nowSRT = Date.now();
      for (let i = 1; i <= 50; i++) {
        const RandomWarga =
          generatedWargas[Math.floor(Math.random() * generatedWargas.length)];
        const jSurat = jenisSurat[i % jenisSurat.length];

        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - Math.floor(Math.random() * 30)); // random within last 30 days
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const suratId = `SRT-DUMMY-${nowSRT}-${i}`;

        batch.set(doc(db, "surat", suratId), {
          tenantId: tenantId,
          id: suratId,
          rt: RandomWarga.rt,
          tanggal: formattedDate,
          jenis: jSurat,
          pemohon: RandomWarga.nama,
          status: i % 5 === 0 ? "Draft" : i % 7 === 0 ? "Ditolak" : "Selesai",
          keterangan: "Keperluan administrasi",
        });
      }

      // Consistent choices of 3 residents from our generated list as examples for other features
      const rWarga1 = generatedWargas[0] || { id: "WARGA-DUMMY-1", nama: "Budi Santoso", nik: "3216060000000001", rt: "01", blok: "Blok A No 1", hp: "08123456781", kk: "3216061111111111", jk: "Laki-Laki", tglLahir: "1980-05-15" };
      const rWarga2 = generatedWargas[4] || { id: "WARGA-DUMMY-2", nama: "Ahmad Dahlan", nik: "3216060000000002", rt: "02", blok: "Blok B No 12", hp: "08123456782", kk: "3216062222222222", jk: "Laki-Laki", tglLahir: "1982-10-12" };
      const rWarga3 = generatedWargas[8] || { id: "WARGA-DUMMY-3", nama: "Joko Widodo", nik: "3216060000000003", rt: "03", blok: "Blok C No 5", hp: "08123456783", kk: "3216063333333333", jk: "Laki-Laki", tglLahir: "1975-04-20" };

      setGenerateMsg("Membuat data pengaduan, booking, dan verifikasi...");

      // --- 4. DATA PENGADUAN / KELUHAN (3 Item) ---
      const nowCP = Date.now();
      const complaints = [
        {
          id: `CP-DUMMY-${nowCP}-1`,
          tenantId: tenantId,
          userId: rWarga1.id,
          namaWarga: rWarga1.nama,
          jenisKeluhan: "Fasilitas Umum",
          deskripsi: "Lampu penerangan jalan utama dekat lapangan RT 01 padam, mohon responnya karena berbahaya saat malam hari.",
          status: "PROCESS",
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: `CP-DUMMY-${nowCP}-2`,
          tenantId: tenantId,
          userId: rWarga2.id,
          namaWarga: rWarga2.nama,
          jenisKeluhan: "Koleksi Sampah",
          deskripsi: "Petugas pengangkut sampah belum lewat sejak hari senin lalu, tumpukan sampah mulai menimbulkan aroma tidak sedap.",
          status: "SOLVED",
          createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
        },
        {
          id: `CP-DUMMY-${nowCP}-3`,
          tenantId: tenantId,
          userId: rWarga3.id,
          namaWarga: rWarga3.nama,
          jenisKeluhan: "Keamanan",
          deskripsi: "Ada kendaraan mencurigakan sering parkir di gerbang pintu masuk Blok C dari jam 1 malam tanpa melapor ke satpam.",
          status: "PENDING",
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      ];
      for (const item of complaints) {
        batch.set(doc(db, "complaints", item.id), item);
      }

      // --- 5. DATA BOOKING FASILITAS (3 Item) ---
      const nowBK = Date.now();
      const bookings = [
        {
          id: `BK-DUMMY-${nowBK}-1`,
          tenantId: tenantId,
          userId: rWarga1.id,
          namaWarga: rWarga1.nama,
          namaFasilitas: "Balai RW Serbaguna",
          tanggal: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Penyelenggaraan tumpengan & syukuran keluarga",
          status: "APPROVED",
          createdAt: new Date().toISOString()
        },
        {
          id: `BK-DUMMY-${nowBK}-2`,
          tenantId: tenantId,
          userId: rWarga2.id,
          namaWarga: rWarga2.nama,
          namaFasilitas: "Satu Set Tenda & 50 Kursi Lipat",
          tanggal: new Date(Date.now() + 12 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Resepsi pernikahan sederhana halaman rumah",
          status: "APPROVED",
          createdAt: new Date().toISOString()
        },
        {
          id: `BK-DUMMY-${nowBK}-3`,
          tenantId: tenantId,
          userId: rWarga3.id,
          namaWarga: rWarga3.nama,
          namaFasilitas: "Lapangan Olahraga Bulutangkis",
          tanggal: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          keperluan: "Turnamen persahabatan anak-anak pemuda RT 03",
          status: "PENDING",
          createdAt: new Date().toISOString()
        }
      ];
      for (const item of bookings) {
        batch.set(doc(db, "bookings", item.id), item);
      }

      // --- 6. DATA VERIFIKASI WARGA MANDIRI (3 Item) ---
      const nowVF = Date.now();
      const verifikasiReqs = [
        {
          id: `VRF-DUMMY-${nowVF}-1`,
          tenantId: tenantId,
          nik: rWarga1.nik,
          kk: rWarga1.kk || "3216060000001001",
          nama: rWarga1.nama,
          rt: rWarga1.rt,
          rw: "26",
          hp: rWarga1.hp || "081234567890",
          posisi: rWarga1.posisi || "Kepala Keluarga",
          profesi: "Wiraswasta Kuliner",
          jk: rWarga1.jk || "Laki-Laki",
          tglLahir: rWarga1.tglLahir || "1980-05-15",
          status: "Menunggu Persetujuan",
          submittedAt: new Date().toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        },
        {
          id: `VRF-DUMMY-${nowVF}-2`,
          tenantId: tenantId,
          nik: rWarga2.nik,
          kk: rWarga2.kk || "3216060000001002",
          nama: rWarga2.nama,
          rt: rWarga2.rt,
          rw: "26",
          hp: rWarga2.hp || "081234567891",
          posisi: rWarga2.posisi || "Kepala Keluarga",
          profesi: "Pegawai Negeri Sipil",
          jk: rWarga2.jk || "Laki-Laki",
          tglLahir: rWarga2.tglLahir || "1982-10-12",
          status: "Disetujui",
          submittedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        },
        {
          id: `VRF-DUMMY-${nowVF}-3`,
          tenantId: tenantId,
          nik: rWarga3.nik,
          kk: rWarga3.kk || "3216060000001003",
          nama: rWarga3.nama,
          rt: rWarga3.rt,
          rw: "26",
          hp: rWarga3.hp || "081234567892",
          posisi: rWarga3.posisi || "Kepala Keluarga",
          profesi: "Dokter Swasta",
          jk: rWarga3.jk || "Laki-Laki",
          tglLahir: rWarga3.tglLahir || "1975-04-20",
          status: "Menunggu Persetujuan",
          submittedAt: new Date().toISOString(),
          type: "PERBAIKAN_DATA",
          ktpUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400",
          kkUrl: "",
        }
      ];
      for (const item of verifikasiReqs) {
        batch.set(doc(db, "verifikasi_warga", item.id), item);
      }

      setGenerateMsg("Membuat data Bank Sampah...");

      // --- 7. DATA BANK SAMPAH (3 Kategori, 3 Setoran, 3 Tarikan) ---
      const sampahKats = [
        { tenantId, id: `KAT-DUMMY-1`, nama: "Botol Plastik PET", satuan: "Kg", hargaBeli: 3000 },
        { tenantId, id: `KAT-DUMMY-2`, nama: "Kertas/Kardus Bekas", satuan: "Kg", hargaBeli: 2000 },
        { tenantId, id: `KAT-DUMMY-3`, nama: "Minyak Jelantah Rumah Tangga", satuan: "Litter", hargaBeli: 6000 },
      ];
      for (const item of sampahKats) {
        batch.set(doc(db, "sampah_kategori", item.id), item);
      }

      const nowSP = Date.now();
      const setoranSampah = [
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-1`,
          nasabahId: rWarga1.nik,
          namaNasabah: rWarga1.nama,
          kategoriId: "KAT-DUMMY-1",
          namaKategori: "Botol Plastik PET",
          berat: 5,
          harga: 3000,
          total: 15000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Tabungan rutin mingguan keluarga",
        },
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-2`,
          nasabahId: rWarga2.nik,
          namaNasabah: rWarga2.nama,
          kategoriId: "KAT-DUMMY-2",
          namaKategori: "Kertas/Kardus Bekas",
          berat: 12,
          harga: 2000,
          total: 24000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Hasil pembersihan gudang bulanan",
        },
        {
          tenantId,
          id: `STR-DUMMY-${nowSP}-3`,
          nasabahId: rWarga3.nik,
          namaNasabah: rWarga3.nama,
          kategoriId: "KAT-DUMMY-3",
          namaKategori: "Minyak Jelantah Rumah Tangga",
          berat: 3,
          harga: 6000,
          total: 18000,
          tanggal: new Date().toISOString().split('T')[0],
          status: "Selesai",
          keterangan: "Sisa pemakaian minyak goreng rumah tangga",
        }
      ];
      for (const item of setoranSampah) {
        batch.set(doc(db, "sampah_setoran", item.id), item);
      }

      const tarikanSampah = [
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-1`,
          nasabahId: rWarga1.nik,
          namaNasabah: rWarga1.nama,
          nominal: 10000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Penarikan tabungan untuk jajan anak",
        },
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-2`,
          nasabahId: rWarga2.nik,
          namaNasabah: rWarga2.nama,
          nominal: 20000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tarik kas sampah",
        },
        {
          tenantId,
          id: `TRK-DUMMY-${nowSP}-3`,
          nasabahId: rWarga3.nik,
          namaNasabah: rWarga3.nama,
          nominal: 15000,
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tarik tabungan tunai",
        }
      ];
      for (const item of tarikanSampah) {
        batch.set(doc(db, "sampah_tarik_saldo", item.id), item);
      }

      setGenerateMsg("Membuat data Posyandu...");

      // --- 8. DATA POSYANDU & KESEHATAN (3 Balita, 3 Ibu Hamil, 3 Pemeriksaan, 3 Imunisasi) ---
      const balitas = [
        {
          id: `BLT-DUMMY-1`,
          tenantId,
          nama: "Budi Junior",
          tglLahir: "2023-01-15",
          jk: "Laki-Laki",
          orangTuaId: rWarga1.nik,
          namaOrangTua: rWarga1.nama,
          alamat: rWarga1.blok,
          rt: rWarga1.rt,
          rw: "26",
          statusStunting: "Normal"
        },
        {
          id: `BLT-DUMMY-2`,
          tenantId,
          nama: "Siti Fatimah",
          tglLahir: "2023-11-20",
          jk: "Perempuan",
          orangTuaId: rWarga2.nik,
          namaOrangTua: rWarga2.nama,
          alamat: rWarga2.blok,
          rt: rWarga2.rt,
          rw: "26",
          statusStunting: "Normal"
        },
        {
          id: `BLT-DUMMY-3`,
          tenantId,
          nama: "Joko Junior",
          tglLahir: "2022-08-10",
          jk: "Laki-Laki",
          orangTuaId: rWarga3.nik,
          namaOrangTua: rWarga3.nama,
          alamat: rWarga3.blok,
          rt: rWarga3.rt,
          rw: "26",
          statusStunting: "Tinggi Kurang (Risiko Stunting)"
        }
      ];
      for (const item of balitas) {
        batch.set(doc(db, "balita", item.id), item);
      }

      const ibuHamils = [
        {
          id: `MIL-DUMMY-1`,
          tenantId,
          nik: "3216069900000001",
          nama: "Ibu Rahmawati (Istri Budi)",
          tglHPL: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 28,
          riwayatKesehatan: "Kondisi sehat, HB normal",
          rt: rWarga1.rt,
          rw: "26"
        },
        {
          id: `MIL-DUMMY-2`,
          tenantId,
          nik: "3216069900000002",
          nama: "Ibu Susi Susanti",
          tglHPL: new Date(Date.now() + 110 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 16,
          riwayatKesehatan: "Mual di pagi hari, disarankan istirahat cukup",
          rt: rWarga2.rt,
          rw: "26"
        },
        {
          id: `MIL-DUMMY-3`,
          tenantId,
          nik: "3216069900000003",
          nama: "Ibu Megawati",
          tglHPL: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
          usiaKehamilan: 36,
          riwayatKesehatan: "Kaki bengkak ringan, tensi darah normal",
          rt: rWarga3.rt,
          rw: "26"
        }
      ];
      for (const item of ibuHamils) {
        batch.set(doc(db, "ibu_hamil", item.id), item);
      }

      const pemeriksaanBalitas = [
        {
          id: `PMK-DUMMY-1`,
          tenantId,
          balitaId: "BLT-DUMMY-1",
          statusGizi: "Normal",
          beratBadan: 14.2,
          tinggiBadan: 94.5,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "Anak lincah dan nafsu makan sangat bagus",
          pemeriksa: "Bid. Sri Lestari"
        },
        {
          id: `PMK-DUMMY-2`,
          tenantId,
          balitaId: "BLT-DUMMY-2",
          statusGizi: "Normal",
          beratBadan: 8.5,
          tinggiBadan: 71.2,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "ASI Eksklusif masih berlanjut, imunisasi tepat waktu",
          pemeriksa: "Bid. Sri Lestari"
        },
        {
          id: `PMK-DUMMY-3`,
          tenantId,
          balitaId: "BLT-DUMMY-3",
          statusGizi: "Tinggi Kurang (Risiko Stunting)",
          beratBadan: 11.8,
          tinggiBadan: 82.0,
          tanggal: new Date().toISOString().split('T')[0],
          catatan: "Disarankan mengonsumsi protein dan susu pertumbuhan ekstra",
          pemeriksa: "Bpk. Dokter RT"
        }
      ];
      for (const item of pemeriksaanBalitas) {
        batch.set(doc(db, "pemeriksaan_balita", item.id), item);
      }

      const imunisasiBalitas = [
        {
          id: `IMU-DUMMY-1`,
          tenantId,
          balitaId: "BLT-DUMMY-1",
          jenisImunisasi: "DPT-HB-HIB 3",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Telah selesai disuntikkan"
        },
        {
          id: `IMU-DUMMY-2`,
          tenantId,
          balitaId: "BLT-DUMMY-2",
          jenisImunisasi: "Polio 4",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Tetes mulut, kondisi anak riang"
        },
        {
          id: `IMU-DUMMY-3`,
          tenantId,
          balitaId: "BLT-DUMMY-3",
          jenisImunisasi: "Campak Rubella (MR)",
          tanggal: new Date().toISOString().split('T')[0],
          keterangan: "Imunisasi ulang dlm program Bulan Imunisasi Anak Sekolah/Balita"
        }
      ];
      for (const item of imunisasiBalitas) {
        batch.set(doc(db, "imunisasi", item.id), item);
      }

      setGenerateMsg("Membuat data E-Toko...");

      // --- 9. DATA E-TOKO WARGA (3 Produk, 3 Pesanan) ---
      const tokoProds = [
        {
          id: "PROD-DUMMY-1",
          tenantId,
          name: "Madu Hutan Murni Asli RT 01",
          price: 95000,
          stock: 25,
          category: "Kesehatan",
          description: "Madu hutan lebah liar berkhasiat tinggi, diproduksi higienis oleh kelompok UKM warga RT 01.",
          image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt01",
          sellerName: "UKM Mandiri RT 01"
        },
        {
          id: "PROD-DUMMY-2",
          tenantId,
          name: "Sambal Garing Tempe Mak Nyus",
          price: 15000,
          stock: 60,
          category: "Lauk Pauk",
          description: "Pedas gurih, garing, nikmat. Sangat cocok disajikan bersama nasi hangat maupun mie kuah.",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt02",
          sellerName: "Dapur Bu Siti"
        },
        {
          id: "PROD-DUMMY-3",
          tenantId,
          name: "Sabun Cuci Piring Cair Aromaterapi",
          price: 8000,
          stock: 100,
          category: "Kebutuhan Rumah Tangga",
          description: "Formula jeruk nipis konsentrat tinggi, kesat, harum dan sangat lembut di tangan.",
          image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=400",
          sellerId: "seller_rt03",
          sellerName: "Koperasi Warga Lestari"
        }
      ];
      for (const item of tokoProds) {
        batch.set(doc(db, "toko_products", item.id), item);
      }

      const orders = [
        {
          id: `ORD-DUMMY-1`,
          tenantId,
          items: [{ id: "PROD-DUMMY-1", name: "Madu Hutan Murni Asli RT 01", price: 95000, qty: 1 }],
          subtotal: 95000,
          shippingFee: 5000,
          discount: 0,
          total: 100000,
          promoApplied: null,
          customerName: rWarga1.nama,
          customerId: rWarga1.nik,
          phone: rWarga1.hp || "-",
          address: rWarga1.blok,
          paymentMethod: "COD",
          status: "DELIVERED",
          timestamp: new Date().toISOString()
        },
        {
          id: `ORD-DUMMY-2`,
          tenantId,
          items: [{ id: "PROD-DUMMY-2", name: "Sambal Garing Tempe Mak Nyus", price: 15000, qty: 3 }],
          subtotal: 45000,
          shippingFee: 5000,
          discount: 0,
          total: 50000,
          promoApplied: null,
          customerName: rWarga2.nama,
          customerId: rWarga2.nik,
          phone: rWarga2.hp || "-",
          address: rWarga2.blok,
          paymentMethod: "COD",
          status: "COMPLETED",
          timestamp: new Date().toISOString()
        },
        {
          id: `ORD-DUMMY-3`,
          tenantId,
          items: [{ id: "PROD-DUMMY-3", name: "Sabun Cuci Piring Cair Aromaterapi", price: 8000, qty: 2 }],
          subtotal: 16000,
          shippingFee: 5000,
          discount: 0,
          total: 21000,
          promoApplied: null,
          customerName: rWarga3.nama,
          customerId: rWarga3.nik,
          phone: rWarga3.hp || "-",
          address: rWarga3.blok,
          paymentMethod: "TRANSFER",
          status: "PENDING",
          timestamp: new Date().toISOString()
        }
      ];
      for (const item of orders) {
        batch.set(doc(db, "toko_orders", item.id), item);
      }

      setGenerateMsg("Membuat data Inventaris...");

      // --- 10. DATA INVENTARIS RT/RW (3 Item, 3 Logs) ---
      const inventarisItems = [
        {
          id: "INV-DUMMY-1",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Kursi Lipat Putih Chitose",
          kategori: "Meja & Kursi",
          jumlah: 60,
          kondisi: "Baik",
          lokasi: "Gudang RW Serbaguna",
          tanggal_pengadaan: "2024-03-20",
          keterangan: "Hibah pembinaan warga berprestasi"
        },
        {
          id: "INV-DUMMY-2",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Tenda Lipat Gazebo 3x4m",
          kategori: "Tenda",
          jumlah: 3,
          kondisi: "Baik",
          lokasi: "Gudang RW Serbaguna",
          tanggal_pengadaan: "2024-05-10",
          keterangan: "Pengadaan mandiri APB-RT"
        },
        {
          id: "INV-DUMMY-3",
          tenantId,
          rtId: "rw_berjuang",
          nama_barang: "Sound System Portable Bluetooth + 2 Mic Wireless",
          kategori: "Elektronik",
          jumlah: 1,
          kondisi: "Sangat Baik",
          lokasi: "Kantor Secretariat RW",
          tanggal_pengadaan: "2025-01-15",
          keterangan: "Bantuan dari aparat Kelurahan"
        }
      ];
      for (const item of inventarisItems) {
        batch.set(doc(db, "inventaris", item.id), item);
      }

      const invLogs = [
        {
          id: `INV-LOG-DUMMY-1`,
          tenantId,
          itemId: "INV-DUMMY-1",
          namaBarang: "Kursi Lipat Putih Chitose",
          tipe: "PINJAM",
          jumlah: 20,
          namaPeminjam: rWarga1.nama,
          nikPeminjam: rWarga1.nik,
          tanggalPinjam: new Date().toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "AKTIF",
          keterangan: "Dipinjam untuk acara syukuran rumah baru"
        },
        {
          id: `INV-LOG-DUMMY-2`,
          tenantId,
          itemId: "INV-DUMMY-2",
          namaBarang: "Tenda Lipat Gazebo 3x4m",
          tipe: "PINJAM",
          jumlah: 1,
          namaPeminjam: rWarga2.nama,
          nikPeminjam: rWarga2.nik,
          tanggalPinjam: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "SELESAI",
          keterangan: "Dipinjam pelengkap syukuran"
        },
        {
          id: `INV-LOG-DUMMY-3`,
          tenantId,
          itemId: "INV-DUMMY-3",
          namaBarang: "Sound System Portable Bluetooth",
          tipe: "PINJAM",
          jumlah: 1,
          namaPeminjam: rWarga3.nama,
          nikPeminjam: rWarga3.nik,
          tanggalPinjam: new Date().toISOString().split('T')[0],
          tanggalKembaliPlan: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString().split('T')[0],
          status: "AKTIF",
          keterangan: "Rapat karang taruna tingkat RT"
        }
      ];
      for (const item of invLogs) {
        batch.set(doc(db, "inventaris_logs", item.id), item);
      }

      setGenerateMsg("Membuat data Pemilihan...");

      // --- 11. DATA KANDIDAT PEMILIHAN / VOTING (3 Kandidat) ---
      const candidates = [
        {
          id: "1",
          tenantId,
          number: "01",
          name: "Bpk. Ahmad Suhendar",
          vision: "Menjadikan lingkungan rukun, asri, berdaya saing mandiri, serta melek teknologi pelayanan digital terpadu.",
          mission: "1. Mengoptimalkan sistem keamanan ronda digital\n2. Melaksanakan gotong royong terpadu satu bulan sekali\n3. Pengelolaan sampah pintar dengan Bank Sampah.",
          votes: 0,
        },
        {
          id: "2",
          tenantId,
          number: "02",
          name: "Bpk. Joko Anas",
          vision: "E-Synergy RW26: Pelayanan cepat, responsif, transparan, berkeadilan serta mengutamakan kepentingan sosial.",
          mission: "1. Menumbuhkan kewirausahaan warga di E-Toko\n2. Meningkatkan pelayanan Posyandu dan Lansia digital\n3. Transparansi laporan pemasukan kas RT/RW secara real-time.",
          votes: 0,
        },
        {
          id: "3",
          tenantId,
          number: "03",
          name: "Bpk. Bambang Pamungkas",
          vision: "Membangun lingkungan asri, harmonis, menjunjung tinggi toleransi kerukunan umat beragama serta sarana olahraga.",
          mission: "1. Renovasi total lapangan serbaguna Blok D\n2. Membentuk perkumpulan senam pagi mingguan warga\n3. Optimalisasi permohonan surat elektronik.",
          votes: 0,
        }
      ];
      for (const item of candidates) {
        batch.set(doc(db, "voting_candidates", `${tenantId}_${item.id}`), item);
      }

      setGenerateMsg("Menulis semua data ke Database, mohon tunggu...");
      await batch.commit();

      setGenerateMsg(
        "Selesai! Data Dummy berhasil ditambahkan ke seluruh Fitur Database.",
      );
      setTimeout(() => {
        setGenerateMsg("");
      }, 5000);
    } catch (error) {
      console.error(error);
      setGenerateMsg("Gagal membuat data dummy.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Package Summary */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">
                Paket: {currentTenant?.status || "Trial"}
              </h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                Langganan Anda Saat Ini
              </p>
              {currentUser?.isSuperAdmin && (
                <button
                  onClick={() => setActiveTab("super-admin")}
                  className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" /> Kelola (Tambah Slot) di
                  Manajemen Tenant
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-8 items-center min-w-[250px]">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Penggunaan Warga
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 leading-none">
                  {wargaData?.length || 0}
                </span>
                <span className="text-sm font-bold text-slate-500">
                  / {currentTenant?.maxWarga || 50} Limit
                </span>
              </div>
            </div>
            <div>
              <div
                className="w-12 h-12 rounded-full overflow-hidden flex"
                style={{
                  background: `conic-gradient(#3b82f6 ${((wargaData?.length || 0) / (currentTenant?.maxWarga || 50)) * 100}%, #e2e8f0 0)`,
                }}
              >
                <div className="w-9 h-9 m-auto bg-slate-50 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700">
                    {Math.round(
                      ((wargaData?.length || 0) /
                        (currentTenant?.maxWarga || 50)) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pengaturan Utama */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <form onSubmit={handleSaveSettings}>
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center">
              <Settings className="w-4 h-4 mr-2 text-blue-600" />
              Pengaturan Sistem
            </h3>
            {(userRole === "ADMIN" ||
              userRole === "SUPER_ADMIN" ||
              userRole === "OWNER" ||
              userRole === "SUPER ADMIN") && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                Mode Editor
              </span>
            )}
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 mb-2 mt-4">
                <label className="text-[10px] font-black text-orange-600 uppercase mb-2 block tracking-wider">
                  Mode Tema Aplikasi
                </label>
                <select
                  name="themeMode"
                  defaultValue={settings.themeMode || "rt_rw"}
                  className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 transition-all font-bold text-slate-800 shadow-sm"
                >
                  <option value="rt_rw">Mode Lingkungan (RT/RW)</option>
                  <option value="apartemen">
                    Mode Apartemen / Perumahan Mandiri
                  </option>
                </select>
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Mode Apartemen akan menyesuaikan beberapa istilah (misal:
                    Kas Warga menjadi IPL, RT/RW menjadi Tower/Lantai, dsb).
                  </p>
                </div>
              </div>
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2 mt-6">
                Informasi INSTANSI / RT / RW & Kop Surat
              </h4>
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 mb-2">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-wider">
                  Nama Organisasi / RT / RW (Muncul di Sidebar & Kop)
                </label>
                <input
                  name="nama_rt"
                  defaultValue={settings.nama_rt}
                  placeholder="Contoh: PENGURUS RT 04"
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800 shadow-sm"
                />
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Nama ini akan menjadi identitas utama di sidebar menu dan
                    kop surat dokumen warga.
                  </p>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 mb-2">
                <label className="text-[10px] font-black text-purple-600 uppercase mb-2 block tracking-wider">
                  Tagline Organisasi (Muncul di bawah Nama Organisasi)
                </label>
                <input
                  name="tagline"
                  defaultValue={settings.tagline || ""}
                  placeholder="Contoh: Guyub Rukun Saklawase"
                  className="w-full px-4 py-3 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all font-bold text-slate-800 shadow-sm"
                />
                <div className="flex items-start gap-2 mt-2">
                  <div className="w-1 h-1 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                  <p className="text-[10px] text-slate-500 italic leading-tight">
                    Tagline ini akan muncul tepat di bawah nama instansi/organisasi dan di atas teks Nexapps Intelligent di sidebar.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    RT
                  </label>
                  <input
                    name="rt"
                    defaultValue={settings.rt}
                    placeholder="04"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    RW
                  </label>
                  <input
                    name="rw"
                    defaultValue={settings.rw}
                    placeholder="09"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Kelurahan
                </label>
                <input
                  name="kelurahan"
                  defaultValue={settings.kelurahan}
                  placeholder="Kebalen"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Alamat Sekretariat
                </label>
                <textarea
                  name="alamat"
                  defaultValue={settings.alamat}
                  rows={2}
                  placeholder="Jl. Merdeka No. 123..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Logo Aplikasi (Sidebar)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(
                            file,
                            "system_logo",
                          );
                          const input = document.getElementById(
                            "tenant_system_logo_input",
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = url;
                            showNotification(
                              "Logo Sistem berhasil diupload. Simpan untuk menerapkan.",
                              "info",
                            );
                          }
                        } catch (err) {
                          showNotification("Gagal upload logo sistem", "error");
                        }
                      }
                    }}
                    className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                  />
                  <input
                    name="tenant_system_logo"
                    id="tenant_system_logo_input"
                    type="hidden"
                    defaultValue={currentTenant?.logo_url}
                  />
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {currentTenant?.logo_url ? (
                      <img
                        src={currentTenant.logo_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Logo RT/RW (Kop Surat)
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const url = await handleFileUpload(
                            file,
                            "logo_rt_rw",
                          );
                          const input = document.getElementById(
                            "logo_url_input",
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = url;
                            showNotification(
                              "Logo Kop Surat berhasil diupload. Simpan untuk menerapkan.",
                              "info",
                            );
                          }
                        } catch (err) {
                          showNotification("Gagal upload logo", "error");
                        }
                      }
                    }}
                    className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <input
                    name="logo_url"
                    id="logo_url_input"
                    type="hidden"
                    defaultValue={settings.logo_url}
                  />
                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {settings.logo_url ? (
                      <img
                        src={settings.logo_url}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">
                Konfigurasi Sistem & WhatsApp
              </h4>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Nominal Iuran Tetap (Rp)
                </label>
                <input
                  name="NOMINAL_IURAN"
                  type="number"
                  defaultValue={settings.NOMINAL_IURAN || "50000"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Status Integrasi WA
                </label>
                <select
                  name="STATUS_WA"
                  defaultValue={settings.STATUS_WA || "Nonaktif"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Token API / WA Gateway
                </label>
                <input
                  name="TOKEN_WA"
                  defaultValue={settings.TOKEN_WA}
                  type="password"
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Template Pesan WhatsApp
                </label>
                <textarea
                  name="TEMPLATE_WA"
                  defaultValue={settings.TEMPLATE_WA}
                  rows={3}
                  placeholder="Halo {nama}, iuran bulan ini belum lunas..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSaving ||
                    !(
                      ["ADMIN", "SUPER_ADMIN", "OWNER", "SUPER ADMIN", "RW", "RT"].includes(userRole?.toUpperCase()) ||
                      currentUser?.isSuperAdmin
                    )
                  }
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Semua Pengaturan"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <h4 className="text-sm font-bold text-red-800 mb-2">
          Peringatan: Reset Data Warga
        </h4>
        <p className="text-xs text-red-600 mb-4">
          Fitur ini akan menghapus <strong>SELURUH</strong> data warga di
          sistem. Data yang sudah dihapus tidak bisa dikembalikan. Gunakan
          dengan sangat hati-hati.
        </p>
        <button
          onClick={async () => {
            if (
              confirm(
                "Apakah Anda yakin ingin menghapus SELURUH data warga? Tindakan ini tidak dapat dibatalkan!",
              )
            ) {
              try {
                // Delete batch
                const { collection, getDocs, writeBatch, doc, query, where } =
                  await import("firebase/firestore");
                const q = query(
                  collection(db, "data_warga"),
                  where("tenantId", "==", currentUser?.tenantId),
                );
                const wargaSnapshot = await getDocs(q);
                const batch = writeBatch(db);
                wargaSnapshot.forEach((docSnapshot) =>
                  batch.delete(docSnapshot.ref),
                );
                await batch.commit();
                showNotification(
                  "Seluruh data warga berhasil dihapus.",
                  "success",
                );
              } catch (e) {
                console.error(e);
                showNotification("Gagal menghapus data.", "error");
              }
            }
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors"
        >
          Hapus Semua Data Warga
        </button>
      </div>

      {/* Database Schema Map Info */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col">
        <h3 className="text-sm font-bold mb-4 flex items-center text-blue-400">
          Struktur Sheet 'Pengaturan' di Google Tables
        </h3>
        <div className="font-mono text-[11px] space-y-2 text-slate-300 bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto">
          <p className="text-green-400 mb-2">
            // Buat Sheet baru dengan nama "Pengaturan". Isi Kolom A (Key) dan
            Kolom B (Value):
          </p>
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
        <h3 className="text-sm font-bold text-orange-800 mb-2">
          Alat Uji Coba: Generate Data Dummy
        </h3>
        <p className="text-xs text-orange-600 mb-4 max-w-lg">
          Gunakan tombol ini untuk menghasilkan 120 data secara otomatis (20
          Warga, 5 KK, 50 Surat, 50 Transaksi) untuk menguji fitur aplikasi.
          Data akan ditambahkan ke database Anda yang aktif.
        </p>

        {generateMsg && (
          <p className="text-xs font-bold text-blue-700 mb-3 bg-white px-3 py-1 rounded shadow-sm">
            {generateMsg}
          </p>
        )}

        <button
          onClick={generateDummyData}
          disabled={
            isGenerating ||
            (wargaData?.length || 0) + 20 > (currentTenant?.maxWarga || 50)
          }
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:bg-orange-300 flex items-center gap-2 disabled:cursor-not-allowed"
          title={
            (wargaData?.length || 0) + 20 > (currentTenant?.maxWarga || 50)
              ? `Sisa slot paket tidak cukup (Butuh 20 slot)`
              : undefined
          }
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isGenerating ? "Memproses..." : "Generate 120 Data Dummy"}
        </button>
      </div>
    </div>
  );
}

function SelfRegistrationView({
  tenantId,
  onClose,
  handleFileUpload,
  showNotification,
  handleFirestoreError,
}: {
  tenantId: string;
  onClose: () => void;
  handleFileUpload: any;
  showNotification: any;
  handleFirestoreError: any;
}) {
  const [formData, setFormData] = useState({
    nik: "",
    nama: "",
    kk: "",
    hp: "",
    blok: "",
    rt: "01",
    rw: "26",
    pekerjaan: "",
    statusKawin: "Belum Kawin",
    agama: "Islam",
    tempatLahir: "",
    tglLahir: "",
    jk: "Laki-Laki",
    golDarah: "",
    kewarganegaraan: "WNI",
    posisiKeluarga: "Kepala Keluarga",
    statusWarga: "Warga Tetap",
    email: "",
    kecamatan: "",
    kelurahan: "",
    kota: "",
    pendidikan: "",
  });
  const [files, setFiles] = useState<{ ktp?: File; kk?: File }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) =>
        console.warn("SelfReg: Anonymous sign-in failed", err),
      );
    }
  }, []);

  const handleSubmit = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("SelfRegistration: Submit initiated", {
      formData,
      filesCount: Object.keys(files).length,
    });

    // Basic validation
    if (!formData.nik || formData.nik.length < 10) {
      showNotification("NIK harus diisi dengan benar (min. 10 digit)", "error");
      return;
    }
    if (!formData.nama) {
      showNotification("Nama Lengkap wajib diisi sesuai KTP.", "error");
      return;
    }
    if (!formData.hp) {
      showNotification(
        "Nomor HP/WhatsApp wajib diisi untuk koordinasi.",
        "error",
      );
      return;
    }
    if (!files.ktp || !files.kk) {
      showNotification(
        "Harap unggah berkas KTP dan KK sebagai syarat verifikasi.",
        "error",
      );
      return;
    }

    setUploading(true);
    setUploadPct(5);
    try {
      console.log("SelfRegistration: Checking authentication...");
      // Ensure we have AUTH session for Firestore Rules
      if (!auth.currentUser) {
        try {
          console.log("No auth session, signing in anonymously...");
          await signInAnonymously(auth);
          console.log("Anonymous sign-in success:", auth.currentUser?.uid);
        } catch (authErr) {
          console.error("Auth error:", authErr);
          throw new Error(
            "Gagal mengaktifkan sesi keamanan. Periksa koneksi internet.",
          );
        }
      }

      let ktpUrl = "";
      let kkUrl = "";

      const uploadPath = `verifikasi/${formData.nik}_${Date.now()}`;

      console.log("SelfRegistration: Processing KTP...");
      setUploadPct(15);
      ktpUrl = await handleFileUpload(
        files.ktp,
        `${uploadPath}_ktp`,
        (pct: number) => setUploadPct(15 + pct * 0.35),
      );

      console.log("SelfRegistration: Processing KK...");
      setUploadPct(50);
      kkUrl = await handleFileUpload(
        files.kk,
        `${uploadPath}_kk`,
        (pct: number) => setUploadPct(50 + pct * 0.35),
      );

      console.log("SelfRegistration: Saving document to Firestore...");
      setUploadPct(90);
      const id = `VRF-${formData.nik}-${Date.now()}`;
      await setDoc(doc(db, "verifikasi_warga", id), {
        ...formData,
        id,
        tenantId: tenantId || "rw26_berjuang",
        ktpUrl,
        kkUrl,
        status: "Menunggu Persetujuan",
        submittedAt: new Date().toISOString(),
        type: "REGISTRASI_BARU",
        authUid: auth.currentUser?.uid || null,
        ipAddress: "client-side", // Placeholder
      });

      console.log("SelfRegistration: Success!");
      setUploadPct(100);
      showNotification(
        "Pendaftaran Berhasil! Data Anda telah dikirim ke Pengurus untuk divalidasi.",
        "success",
      );
      onClose();
    } catch (err: any) {
      console.error("SelfRegistration Error:", err);
      const msg =
        err.message ||
        "Gagal mengirim pendaftaran. Pastikan file tidak terlalu besar dan koneksi stabil.";
      showNotification(msg, "error");
      // Don't use handleFirestoreError here to avoid throwing again, just log it
      console.warn(
        "Firestore Details:",
        JSON.stringify({ error: err.message, path: "verifikasi_warga" }),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <motion.form
        onSubmit={handleSubmit}
        noValidate
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-brand-blue to-blue-600 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Formulir Pendaftaran Warga Baru
              </h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">
                Lengkapi data Anda untuk verifikasi sistem
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10">
          {/* Section 1: Identitas Utama */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center text-sm font-black italic shadow-inner">
                01
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Identitas Utama (Sesuai KTP/KK)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  NIK (16 Digit)
                </label>
                <input
                  required
                  maxLength={16}
                  placeholder="Contoh: 3201..."
                  value={formData.nik}
                  onChange={(e) =>
                    setFormData({ ...formData, nik: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nomor KK (16 Digit)
                </label>
                <input
                  required
                  maxLength={16}
                  placeholder="Sesuai Kartu Keluarga"
                  value={formData.kk}
                  onChange={(e) =>
                    setFormData({ ...formData, kk: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nama Lengkap
                </label>
                <input
                  required
                  placeholder="Nama sesuai KTP"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Tempat Lahir
                </label>
                <input
                  required
                  placeholder="Kota kelahiran"
                  value={formData.tempatLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tempatLahir: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Tanggal Lahir
                </label>
                <input
                  required
                  type="date"
                  value={formData.tglLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tglLahir: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jk}
                  onChange={(e) =>
                    setFormData({ ...formData, jk: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kewarganegaraan
                </label>
                <select
                  value={formData.kewarganegaraan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kewarganegaraan: e.target.value,
                    })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Pendidikan Terakhir
                </label>
                <select
                  value={formData.pendidikan}
                  onChange={(e) =>
                    setFormData({ ...formData, pendidikan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  <option value="">Pilih Pendidikan</option>
                  <option value="Belum Sekolah">Belum Sekolah</option>
                  <option value="SD">SD</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="SMA Sederajat">SMA Sederajat</option>
                  <option value="DIPLOMA 2">DIPLOMA 2</option>
                  <option value="DIPLOMA 3">DIPLOMA 3</option>
                  <option value="DIPLOMA 4">DIPLOMA 4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Agama
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) =>
                    setFormData({ ...formData, agama: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Status Perkawinan
                </label>
                <select
                  value={formData.statusKawin}
                  onChange={(e) =>
                    setFormData({ ...formData, statusKawin: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Posisi dalam Keluarga
                </label>
                <select
                  value={formData.posisiKeluarga}
                  onChange={(e) =>
                    setFormData({ ...formData, posisiKeluarga: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  <option value="Suami (Kepala Keluarga)">
                    Suami (Kepala Keluarga)
                  </option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Cucu">Cucu</option>
                  <option value="Family Lain">Family Lain</option>
                  <option value="Lainya">Lainya</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Golongan Darah
                </label>
                <input
                  placeholder="A/B/O/AB/Tdk Tahu"
                  value={formData.golDarah}
                  onChange={(e) =>
                    setFormData({ ...formData, golDarah: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Domisili & Kontak */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-pink-100 text-brand-pink flex items-center justify-center text-sm font-black italic shadow-inner">
                02
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Alamat & Kontak
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  No. Blok Rumah
                </label>
                <input
                  required
                  placeholder="Contoh: A-12"
                  value={formData.blok}
                  onChange={(e) =>
                    setFormData({ ...formData, blok: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  RT
                </label>
                <select
                  value={formData.rt}
                  onChange={(e) =>
                    setFormData({ ...formData, rt: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  {["01", "02", "03", "04", "05", "06", "07", "08"].map(
                    (rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  RW
                </label>
                <select
                  value={formData.rw}
                  onChange={(e) =>
                    setFormData({ ...formData, rw: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  {["26"].map((rw) => (
                    <option key={rw} value={rw}>
                      RW {rw}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Status Warga
                </label>
                <select
                  value={formData.statusWarga}
                  onChange={(e) =>
                    setFormData({ ...formData, statusWarga: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                >
                  <option value="Warga Tetap">Warga Tetap</option>
                  <option value="Warga Kontrak">Warga Kontrak</option>
                  <option value="Warga Kost">Warga Kost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  required
                  type="tel"
                  placeholder="0812..."
                  value={formData.hp}
                  onChange={(e) =>
                    setFormData({ ...formData, hp: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kelurahan
                </label>
                <input
                  required
                  placeholder="Kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) =>
                    setFormData({ ...formData, kelurahan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kecamatan
                </label>
                <input
                  required
                  placeholder="Kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) =>
                    setFormData({ ...formData, kecamatan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Kota / Kabupaten
                </label>
                <input
                  required
                  placeholder="Kota"
                  value={formData.kota}
                  onChange={(e) =>
                    setFormData({ ...formData, kota: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Profesi / Pekerjaan
                </label>
                <input
                  required
                  placeholder="Pekerjaan saat ini"
                  value={formData.pekerjaan}
                  onChange={(e) =>
                    setFormData({ ...formData, pekerjaan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Berkas Pendukung */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-black italic shadow-inner">
                03
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Unggah Berkas Pendukung
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 transition-all group">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6 text-brand-blue" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Foto KTP
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-4 px-4 font-medium italic">
                    Ambil foto KTP asli / scan yang terbaca jelas.
                  </p>
                  <input
                    type="file"
                    id="uploadKTP"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      setFiles({ ...files, ktp: e.target.files[0] })
                    }
                  />
                  <label
                    htmlFor="uploadKTP"
                    className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full text-[10px] font-bold text-slate-600 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all"
                  >
                    {files.ktp ? `✓ ${files.ktp.name}` : "Pilih Berkas"}
                  </label>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand-pink/40 transition-all group">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Files className="w-6 h-6 text-brand-pink" />
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                    Foto Kartu Keluarga
                  </h4>
                  <p className="text-[10px] text-slate-400 mb-4 px-4 font-medium italic">
                    Ambil foto KK asli agar mempermudah validasi data.
                  </p>
                  <input
                    type="file"
                    id="uploadKK"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files &&
                      setFiles({ ...files, kk: e.target.files[0] })
                    }
                  />
                  <label
                    htmlFor="uploadKK"
                    className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full text-[10px] font-bold text-slate-600 hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-all"
                  >
                    {files.kk ? `✓ ${files.kk.name}` : "Pilih Berkas"}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-brand-blue" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Aman • Terenkripsi • Privasi Terjamin
            </p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              type="button"
              disabled={uploading}
              onClick={onClose}
              className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 sm:flex-none px-12 py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {uploading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mengirim {Math.round(uploadPct)}%</span>
                </div>
              ) : (
                "Kirim Pendaftaran"
              )}
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

function TenantRegistrationView({
  onClose,
  showNotification,
  handleFirestoreError,
}: {
  onClose: () => void;
  showNotification: any;
  handleFirestoreError: any;
}) {
  const [formData, setFormData] = useState({
    namaTenant: "",
    namaPJ: "",
    email: "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `TENANT-${Date.now()}`;
      await setDoc(doc(db, "tenant_registrations", id), {
        ...formData,
        status: "Menunggu Persetujuan",
        submittedAt: new Date().toISOString(),
      });
      showNotification("Pendaftaran tenant berhasil dikirim!", "success");
      onClose();
    } catch (err) {
      handleFirestoreError(err, "create", "tenant_registrations");
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Pendaftaran Tenant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Nama Tenant"
            value={formData.namaTenant}
            onChange={(e) =>
              setFormData({ ...formData, namaTenant: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            required
            placeholder="Nama Penanggung Jawab"
            value={formData.namaPJ}
            onChange={(e) =>
              setFormData({ ...formData, namaPJ: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginView({
  setWargaAuth,
  wargaData,
  verifikasiWargaData,
  isLoadingDB,
  onSelfRegister,
  onShowFreeTrial,
  onShowPricing,
  settings,
  tenantId,
  initialEmail = "",
  initialMode = "admin",
}: {
  setWargaAuth: any;
  wargaData: any[];
  verifikasiWargaData: any[];
  isLoadingDB: boolean;
  onSelfRegister: () => void;
  onShowFreeTrial: () => void;
  onShowPricing: () => void;
  settings?: any;
  tenantId: string;
  initialEmail?: string;
  initialMode?: "admin" | "warga" | "verifikasi";
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showKK, setShowKK] = useState(false);
  const [showNik, setShowNik] = useState(false);
  const [error, setError] = useState("");
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<"admin" | "warga" | "verifikasi">(
    initialMode,
  );

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setLoginMode("admin");
    }
  }, [initialEmail]);

  const [nik, setNik] = useState("");
  const [kodeKeluarga, setKodeKeluarga] = useState("");

  // Trigger anonymous sign-in to allow fetching public/citizen data
  useEffect(() => {
    if (loginMode === "warga" && !auth.currentUser) {
      console.log("Pre-authenticating anonymously for citizen lookup...");
      signInAnonymously(auth).catch((err) =>
        console.warn("Anonymous sign-in failed", err),
      );
    }
  }, [loginMode]);

  const handleWargaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Ensure we have some data or at least tried to sync
    if (wargaData.length === 0 && isLoadingDB) {
      setTimeout(() => {
        setError(
          "Sistem sedang menyinkronkan data. Silakan tunggu beberapa detik dan coba lagi.",
        );
        setIsLoading(false);
      }, 1500);
      return;
    }

    // Identitas: NIK / Nama / No HP
    const cleanId = String(nik || "").trim();
    const idDigits = cleanId.replace(/\D/g, "");
    const cleanIdLower = cleanId.toLowerCase();

    // Kunci: KK / HP
    const cleanPass = String(kodeKeluarga || "").trim();
    const passDigits = cleanPass.replace(/\D/g, "");
    const cleanPassLower = cleanPass.toLowerCase();

    // 1. SEARCH IN MEMORY (Current Context)
    let found = wargaData.find((w) => {
      const cNik = String(w.nik || "")
        .trim()
        .toLowerCase();
      const cNikDigits = cNik.replace(/\D/g, "");
      const cNama = String(w.nama || "")
        .trim()
        .toLowerCase();
      const cHp = String(w.hp || "")
        .trim()
        .toLowerCase();
      const cHpDigits = cHp.replace(/\D/g, "");
      const cKK = String(w.kk || w.no_kk || w.nomor_kk || w.kodeKeluarga || "")
        .trim()
        .toLowerCase();
      const cKKDigits = cKK.replace(/\D/g, "");

      // Evaluate matches based on inputs that are provided
      const idMatch = !cleanId
        ? null
        : cNik === cleanIdLower ||
          (idDigits && cNikDigits === idDigits) ||
          cNama === cleanIdLower ||
          cHp === cleanIdLower ||
          (idDigits && cHpDigits === idDigits);
      const secretMatch = !cleanPass
        ? null
        : cKK === cleanPassLower ||
          (passDigits && cKKDigits === passDigits) ||
          cHp === cleanPassLower ||
          (passDigits && cHpDigits === passDigits) ||
          cNik === cleanPassLower ||
          (passDigits && cNikDigits === passDigits);

      if (idMatch === null && secretMatch === null) return false;
      if (idMatch === null) return secretMatch;
      if (secretMatch === null) return idMatch;
      return idMatch && secretMatch;
    });

    // Pre-authenticate anonymously if needed to allow discovery queries
    if (!auth.currentUser) {
      try {
        console.log("Ensuring anonymous authentication for citizen lookup...");
        await signInAnonymously(auth);
      } catch (err) {
        console.warn("Pre-auth failed:", err);
      }
    }

    // 2. DIRECT DISCOVERY (Across Tenants via Firestore)
    if (!found) {
      try {
        // A. Try direct Document ID lookup (NIK is standard docId, sometimes prefixed)
        const potentialIds = [cleanId, cleanPass].filter((k) => k.length >= 6);
        const knownTenants = [
          "rw26_berjuang",
          "trihprw26",
          "rt01_rw26_berjuang",
          "MASTER",
        ];

        for (const idCandidate of potentialIds) {
          if (found) break;

          // Try common docId patterns
          const candidateRefs = [
            doc(db, "data_warga", idCandidate),
            doc(db, "verifikasi_warga", idCandidate),
          ];

          // Try with tenant prefixes
          knownTenants.forEach((t) => {
            candidateRefs.push(doc(db, "data_warga", `${t}_${idCandidate}`));
            candidateRefs.push(doc(db, "verifikasi_warga", `${t}_${idCandidate}`));
          });

          for (const dRef of candidateRefs) {
            if (found) break;
            try {
              const dSnap = await getDoc(dRef);
              if (dSnap.exists()) {
                const candidate = { docId: dSnap.id, ...dSnap.data() } as any;
                const cNik = String(candidate.nik || "")
                  .trim()
                  .toLowerCase();
                const cNama = String(candidate.nama || "")
                  .trim()
                  .toLowerCase();
                const cHp = String(candidate.hp || "")
                  .trim()
                  .toLowerCase();
                const cKK = String(candidate.kk || candidate.kodeKeluarga || "")
                  .trim()
                  .toLowerCase();

                const otherInp =
                  idCandidate === cleanId ? cleanPassLower : cleanIdLower;
                const matches =
                  cNik === otherInp ||
                  (otherInp.replace(/\D/g, "") &&
                    cNik.replace(/\D/g, "") === otherInp.replace(/\D/g, "")) ||
                  cNama === otherInp ||
                  cHp === otherInp ||
                  cKK === otherInp ||
                  (otherInp.replace(/\D/g, "") &&
                    cKK.replace(/\D/g, "") === otherInp.replace(/\D/g, ""));

                if (matches) {
                  found = candidate;
                  console.log("Found citizen via direct ID lookup:", dRef.path);
                  break;
                }
              }
            } catch (refErr) {
              // Silently ignore permission errors for specific paths
            }
          }
        }

        // B. Query Discovery (as fallback) - Search for all fields that match cleanId or cleanPass
        if (!found) {
          const tokens = [cleanId, cleanPass].filter((k) => k.length >= 3);

          for (const token of tokens) {
            if (found) break;
            const isNumeric = /^\d+$/.test(token);
            const searchFields = ["nik", "hp", "nama", "kk", "no_kk"];

            for (const field of searchFields) {
              if (found) break;

              const variants: any[] = [];
              if (field === "nama") {
                const titleCase = token
                  .split(" ")
                  .map(
                    (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
                  )
                  .join(" ");
                variants.push(
                  token,
                  token.toUpperCase(),
                  token.toLowerCase(),
                  titleCase,
                );
              } else if (isNumeric) {
                variants.push(token, Number(token));
              } else {
                variants.push(token);
              }

              for (const value of variants) {
                if (found) break;

                // 1. Check in data_warga
                const qWarga = query(
                  collection(db, "data_warga"),
                  where(field, "==", value),
                  limit(10),
                );
                const sWarga = await getDocs(qWarga);

                // 2. Check in verifikasi_warga
                const qVerif = query(
                  collection(db, "verifikasi_warga"),
                  where(field, "==", value),
                  limit(10),
                );
                const sVerif = await getDocs(qVerif);

                // 3. Fallback: Check in surat (since user mentioned making a letter)
                const qSurat = query(
                  collection(db, "surat"),
                  where(field === "nama" ? "pemohon" : field, "==", value),
                  limit(5),
                );
                const sSurat = await getDocs(qSurat);

                const allSnaps = [sWarga, sVerif, sSurat];

                for (const snap of allSnaps) {
                  if (found) break;
                  if (!snap.empty) {
                    for (const d of snap.docs) {
                      const cand = { docId: d.id, ...d.data() } as any;
                      const otherVal =
                        token === cleanId ? cleanPassLower : cleanIdLower;

                      const cNik = String(cand.nik || "")
                        .trim()
                        .toLowerCase();
                      const cNama = String(cand.nama || cand.pemohon || "")
                        .trim()
                        .toLowerCase();
                      const cHp = String(cand.hp || cand.phone || "")
                        .trim()
                        .toLowerCase();
                      const cKK = String(cand.kk || cand.kodeKeluarga || "")
                        .trim()
                        .toLowerCase();

                      const matches =
                        cNik === otherVal ||
                        (otherVal.replace(/\D/g, "") &&
                          cNik.replace(/\D/g, "") ===
                            otherVal.replace(/\D/g, "")) ||
                        cNama === otherVal ||
                        cHp === otherVal ||
                        (otherVal.replace(/\D/g, "") &&
                          cHp.replace(/\D/g, "") ===
                            otherVal.replace(/\D/g, "")) ||
                        cKK === otherVal ||
                        (otherVal.replace(/\D/g, "") &&
                          cKK.replace(/\D/g, "") === otherVal.replace(/\D/g, ""));

                      if (matches) {
                        found = cand;
                        console.log("Found citizen via query lookup:", d.ref.path);
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }

      } catch (err) {
        console.warn("Direct discovery failed:", err);
      }
    }

    if (found) {
      try {
        // Sign in anonymously and link the UID to this citizen's document
        console.log("Processing login for citizen:", found.id || found.nik);
        let uid = auth.currentUser?.uid;
        if (!uid) {
          const userCredential = await signInAnonymously(auth);
          uid = userCredential.user.uid;
        }

        const docId = found.docId || found.id || found.nik;

        // 1. Create/update user document FIRST for Firestore security rules support (getUserData() mapping)
        // This grants the anonymous user the tenant status of the resident they are linking to,
        // which allows the subsequent verifikasi_warga update to pass 'isTenantMember' rule checks.
        const userRef = doc(db, "users", uid);
        await setDoc(
          userRef,
          {
            role: "Warga",
            nik: found.nik || "",
            name: found.nama || "Warga",
            tenantId: found.tenantId || "rw26_berjuang",
            linkedResidentId: docId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        );

        // 2. Update the verifikasi_warga document SECOND with authUid
        const vRef = doc(db, "verifikasi_warga", docId);
        await setDoc(
          vRef,
          {
            authUid: uid,
            nik: found.nik,
            kk: found.kk || found.kodeKeluarga || "",
            nama: found.nama,
            status:
              found.status === "Disetujui" || found.terverifikasi
                ? "Disetujui"
                : "Menunggu Persetujuan",
            tenantId: found.tenantId || "rw26_berjuang",
            lastLogin: new Date().toISOString(),
          },
          { merge: true },
        );

        // Find other family members
        const currentKK = String(found.kk || found.kodeKeluarga || "").trim();
        const familyMembers = currentKK
          ? wargaData.filter(
              (w) =>
                String(w.kk || "").trim() === currentKK ||
                String(w.kodeKeluarga || "").trim() === currentKK,
            )
          : [];
        const wargaAuthData = {
          ...found,
          authUid: uid,
          listWargaInKK: familyMembers,
        };

        setTimeout(() => {
          setWargaAuth(wargaAuthData);
          setIsLoading(false);
        }, 800);
      } catch (err: any) {
        console.error("Login Error:", err);
        setError(`Gagal masuk: ${err.message || String(err)}`);
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        setError(
          'Data tidak ditemukan! Jika Anda adalah warga baru atau belum terdaftar di sistem SmartRW AI, silakan klik tombol "DAFTAR MANDIRI" di bawah untuk mendaftarkan data Anda.',
        );
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    quickEmail?: string,
    quickPass?: string,
  ) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const inputEmail = (quickEmail || email || "").trim();
    const targetPass = (quickPass || password || "").trim();

    try {
      // Logic for username OR email login
      let loginEmail = inputEmail;

      // If the input doesn't contain '@', search for a username in public_usernames
      if (!inputEmail.includes("@")) {
        console.log(
          "Checking username in public_usernames:",
          inputEmail.toLowerCase(),
        );
        const usernameRef = doc(
          db,
          "public_usernames",
          inputEmail.toLowerCase(),
        );

        let usernameDoc;
        try {
          usernameDoc = await getDoc(usernameRef);
        } catch (err: any) {
          if (err.code === "permission-denied") {
            console.error(
              "Permission denied reading public_usernames. Check firestore.rules.",
            );
          }
          throw err;
        }

        if (usernameDoc.exists()) {
          const userData = usernameDoc.data();
          if (userData.email) {
            loginEmail = userData.email;
          } else {
            throw new Error("Username valid, but no email set.");
          }
        } else if (inputEmail.toLowerCase() === "trihprw26") {
          loginEmail = "trihprw26@rw26.com";
        } else if (inputEmail.toLowerCase() === "master") {
          loginEmail = "arifrajcoach@gmail.com";
        } else if (inputEmail.toLowerCase() === "rw26_smart") {
          loginEmail = "admin@rw26.com";
        } else {
          throw new Error("Username tidak ditemukan.");
        }
      }

      if (
        loginEmail === "arifrajcoach@gmail.com" &&
        targetPass === "4R1f080162a3"
      ) {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, targetPass);
        } catch (adminErr: any) {
          if (
            adminErr.code === "auth/user-not-found" ||
            adminErr.code === "auth/invalid-credential"
          ) {
            try {
              await createUserWithEmailAndPassword(
                auth,
                loginEmail,
                targetPass,
              );
            } catch (createErr: any) {
              if (createErr.code === "auth/email-already-in-use") {
                // If it already exists, then the original signIn failed because of wrong password
                throw adminErr;
              }
              throw createErr;
            }
          } else {
            throw adminErr;
          }
        }
      } else {
        try {
          await signInWithEmailAndPassword(auth, loginEmail, targetPass);
        } catch (loginErr: any) {
          if (
            loginErr.code === "auth/user-not-found" ||
            loginErr.code === "auth/invalid-credential" ||
            loginErr.code === "auth/wrong-password"
          ) {
            let wasCreated = false;
            try {
              // Sign in anonymously to query the users collection
              console.log("Attempting anonymous registration check for:", loginEmail);
              await signInAnonymously(auth);
              const usersRef = collection(db, "users");
              const q = query(usersRef, where("email", "==", loginEmail));
              const snap = await getDocs(q);

              if (!snap.empty) {
                const matchFound = snap.docs.some(
                  (d) => d.data().password === targetPass,
                );
                if (matchFound) {
                  await createUserWithEmailAndPassword(
                    auth,
                    loginEmail,
                    targetPass,
                  );
                  wasCreated = true;
                } else {
                   console.warn("Password in Firestore does not match input for:", loginEmail);
                }
              }
            } catch (autoErr: any) {
              console.warn("Auto-registration check failed:", autoErr);
              if (autoErr.code === 'unavailable' || autoErr.message?.includes('Could not reach')) {
                throw new Error("DATABASE_UNAVAILABLE");
              }
            }
            if (!wasCreated) throw loginErr;
          } else if (loginErr.code === "auth/network-request-failed") {
            throw loginErr;
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = `Gagal masuk (${err.code || "ERR"}). Periksa kembali email dan password Anda.`;

      if (err.message === "Username tidak ditemukan.") {
        msg = "Gagal masuk (ERR). Username tidak ditemukan.";
      } else if (err.message === "DATABASE_UNAVAILABLE") {
        msg = "KONEKSI DATABASE GAGAL: Tidak dapat menjangkau server Firestore. Silakan periksa koneksi internet Anda atau coba lagi beberapa saat lagi.";
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        if (
          inputEmail.toLowerCase() === "arifrajcoach@gmail.com" ||
          inputEmail.toLowerCase() === "master"
        ) {
          msg =
            'AKUN ADMIN: Bpk. Arif, silakan gunakan tombol "Masuk dengan Google" atau pastikan password sudah diset di Firebase Console.';
        } else {
          msg =
            "KREDENSIAL SALAH: Email/Username atau password tidak sesuai. Pastikan akun sudah terdaftar dan provider Email/Password sudah aktif di Firebase Console.";
        }
      } else if (err.code === "auth/wrong-password") {
        msg = "PASSWORD SALAH: Periksa kembali kata sandi Anda.";
      } else if (err.code === "auth/invalid-email") {
        msg = "FORMAT EMAIL SALAH: Masukkan format email yang benar.";
      } else if (err.code === "auth/email-already-in-use") {
        msg =
          "EMAIL SUDAH TERDAFTAR: Email ini sudah digunakan oleh akun lain. Silakan masuk menggunakan email tersebut.";
      } else if (err.code === "auth/operation-not-allowed") {
        msg =
          'METODE LOGIN NON-AKTIF: Aktifkan "Email/Password" di Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === "auth/network-request-failed") {
        msg =
          "MASALAH JARINGAN (Timeout): Firebase tidak dapat dijangkau. Coba refresh halaman (F5) atau cek apakah domain ini sudah diizinkan di Firebase Console.";
      } else {
        msg = `Gagal masuk (${err.code || "ERR"}). ${err.message || ""}`;
      }

      console.error("Login Details:", { code: err.code, message: err.message });
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const isArif = user.email?.toLowerCase() === "arifrajcoach@gmail.com";
      let tenantId = "rw26_berjuang";
      if (isArif) {
        tenantId = "MASTER";
      }

      // 1. Check if user entry exists by standard UID
      const userRef = doc(db, "users", user.uid);
      let userDoc = await getDoc(userRef);

      let preRegisteredRole = "Viewer";
      let preRegisteredTenant = tenantId;
      let isPreRegistered = false;

      // 2. If standard UID document doesn't exist, search if Super Admin pre-registered this email
      if (!userDoc.exists() && user.email) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          isPreRegistered = true;
          const matchedUser = querySnapshot.docs[0];
          const matchedData = matchedUser.data();
          preRegisteredRole = matchedData.role || "Viewer";
          preRegisteredTenant = matchedData.tenantId || tenantId;

          // Delete the old pre-registered dummy doc to prevent duplicates, since we will use the actual auth UID
          if (matchedUser.id !== user.uid) {
            await deleteDoc(doc(db, "users", matchedUser.id));
          }
        }
      }

      const isTrihUser =
        user.email?.toLowerCase().includes("trihprw26") ||
        user.email?.toLowerCase().includes("handoko");

      if (!userDoc.exists() && !isPreRegistered && !isArif && !isTrihUser) {
        await signOut(auth);
        setError(
          "Akun Google Anda belum terdaftar di sistem. Silakan minta Admin RT/RW untuk mendaftarkan email Anda, atau gunakan login Warga/Verifikasi WA.",
        );
        setIsLoading(false);
        return;
      }

      const userData = {
        email: user.email,
        role: isArif
          ? "SUPER_ADMIN"
          : userDoc.exists()
            ? userDoc.data()?.role
            : preRegisteredRole,
        isSuperAdmin: isArif,
        name: isArif
          ? "Bpk. Arif (Super Admin)"
          : userDoc.exists()
            ? userDoc.data()?.name
            : user.displayName || "User",
        tenantId: userDoc.exists()
          ? userDoc.data()?.tenantId || preRegisteredTenant
          : preRegisteredTenant,
        createdAt: userDoc.exists()
          ? userDoc.data()?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
      };

      // Always ensure the role and tenant are set
      await setDoc(userRef, userData, { merge: true });
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === "auth/popup-blocked") {
        setError(
          "Gagal login: Popup diblokir. Silakan buka aplikasi di tab baru (jika di dalam preview) atau izinkan popup browser Anda.",
        );
      } else if (err.code === "auth/network-request-failed" || String(err.message || err).includes("network-request-failed")) {
        setError(
          "KEAMANAN IFRAME: Google Login diblokir oleh browser Anda karena aplikasi sedang berjalan di dalam IFrame Preview (masalah pembatasan Cookie Pihak Ketiga). Harap buka aplikasi di Tab Baru agar Google Auth berjalan normal.",
        );
        setIframeError(true);
      } else {
        setError(`Gagal login dengan Google: ${err.message}`);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 relative overflow-y-auto">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div
        className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"
        style={{ animationDelay: "2s" }}
      ></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl pointer-events-none"></div>

      {/* Main Login Content Area */}
      <div className="min-h-[95vh] flex flex-col lg:flex-row lg:gap-16 items-center justify-center w-full max-w-7xl relative z-10">
        <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-[3rem] bg-white shadow-2xl shadow-brand-blue/20 mb-8 relative group isolate overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 via-brand-yellow/20 to-brand-pink/20 animate-spin-slow"></div>
            <div className="absolute inset-0.5 bg-white rounded-[2.9rem] -z-10"></div>
            <AppLogo
              size={18}
              className="w-18 h-18 relative z-10 transition-transform group-hover:scale-110 duration-500"
              logoUrl={settings?.org_logo_url || settings?.logo_url}
            />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-800 leading-none mb-2 font-elegant">
            <span className="font-bold flex items-center justify-center gap-1">
            <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmartRW</span>
            <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
          </span>
          </h1>
          <p className="text-brand-blue font-bold tracking-[0.2em] text-sm uppercase">
            BERDAMPAK &amp; MEMBERDAYAKAN
          </p>
          <div className="mt-2 flex flex-col items-center">
            <p className="text-slate-400/80 font-bold text-xs tracking-widest mt-0.5 text-center">
              Powered by Nexapps
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/90 rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-white overflow-hidden relative z-10">
        <div className="flex border-b border-slate-100/50 bg-white/50 ">
          <button
            onClick={() => {
              setLoginMode("admin");
              setError("");
            }}
            className={`flex-1 py-5 text-[15px] font-black uppercase tracking-widest transition-all relative ${loginMode === "admin" ? "text-brand-blue bg-white border-b-2 border-brand-blue shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-white/80"}`}
          >
            Pengurus
          </button>
          <button
            onClick={() => {
              setLoginMode("warga");
              setError("");
            }}
            className={`flex-1 py-5 text-[15px] font-black uppercase tracking-widest transition-all relative ${loginMode === "warga" ? "text-brand-green bg-white border-b-2 border-brand-green shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-white/80"}`}
          >
            <span className="relative text-[15px]">
              Warga
              <span className="absolute -top-3 -right-2 px-1.5 pt-0 pb-0 bg-emerald-500 text-white rounded-full text-[8px] animate-pulse">
                GOOGLE
              </span>
            </span>
          </button>
          <button
            onClick={() => {
              setLoginMode("verifikasi");
              setError("");
            }}
            className={`flex-1 py-5 text-[15px] font-black uppercase tracking-widest transition-all relative ${loginMode === "verifikasi" ? "text-brand-pink bg-white border-b-2 border-brand-pink shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-white/80"}`}
          >
            <span className="relative text-[15px]">
              NIK & KK
              <span className="absolute -top-3 -right-2 px-1.5 pt-0 pb-[1px] bg-brand-pink text-white rounded-full text-[8px]">
                PROFIL
              </span>
            </span>
          </button>
        </div>
        <div className="p-8">
          <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-white" />
            </div>
            <p className="text-[10px] font-bold text-brand-blue uppercase tracking-tight leading-tight">
              {loginMode === "warga"
                ? 'KHUSUS AKUN GOOGLE. Jika ingin masuk pakai NIK & KK, silakan pilih tab "NIK & KK" di atas.'
                : loginMode === "verifikasi"
                  ? "VERIFIKASI WARGA (Tanpa Google). Masukkan NIK atau Nama sebagai ID, dan Nomor KK atau No. HP sebagai Kunci."
                  : "Akses khusus pengurus RT/RW yang telah terdaftar."}
            </p>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-6 font-elegant tracking-tight text-center">
            {loginMode === "admin"
              ? "LOGIN PENGURUS"
              : loginMode === "warga"
                ? "MASUK GOOGLE"
                : "VERIFIKASI NIK/NAMA & KK/HP"}
          </h2>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>

              {(iframeError || error.includes("IFRAME") || error.includes("Cookie") || error.includes("network-request-failed")) && (
                <div className="mt-2 pt-3 border-t border-red-200/60 flex flex-col gap-2">
                  <span className="text-xs text-red-800 font-black flex items-center gap-1">
                    💡 Rekomendasi Solusi:
                  </span>
                  <p className="text-xs text-red-600 font-medium leading-relaxed">
                    Browser memblokir login Google karena domain dijalankan di frame eksternal. Silakan klik tombol di bawah untuk membukanya di tab terpisah, sehingga Google login berjalan dengan aman.
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, "_blank")}
                    className="mt-1 w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    Buka di Tab Baru <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {loginMode === "admin" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                  EMAIL/ USERNAME
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <User className="w-6 h-6 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 transition-all font-bold text-base"
                    placeholder="Contoh: admin123"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                  KATA SANDI
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="w-6 h-6 text-slate-400 group-focus-within:text-brand-pink transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 transition-all font-bold text-base"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-pink transition-colors p-2 rounded-full hover:bg-pink-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-blue hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-base"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          )}

          {loginMode === "warga" && (
            <div className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <ShieldCheck className="text-white w-6 h-6" />
                  </div>
                  <p className="text-sm font-black text-emerald-800">
                    Akses Cepat & Aman
                  </p>
                </div>
                <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                  Gunakan Google Login untuk akses penuh fitur warga: E-LAPAK26,
                  Surat Digital, Keuangan, dan Pengaduan.
                </p>
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-6 bg-white border-2 border-slate-100 text-slate-700 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-brand-green/30 transition-all active:scale-[0.98] shadow-sm text-base group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-slate-200 border-t-brand-green rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6 group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Masuk dengan Google
                  </>
                )}
              </button>
            </div>
          )}

          {loginMode === "verifikasi" && (
            <div className="space-y-6">
              <form onSubmit={handleWargaLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                    IDENTITAS (NIK / NAMA)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <User className="w-6 h-6 text-slate-400 group-focus-within:text-brand-pink transition-colors" />
                    </div>
                    <input
                      type={showNik ? "text" : "password"}
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 transition-all font-bold text-base"
                      placeholder="NIK atau Nama Lengkap"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNik(!showNik)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNik ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                    KUNCI (KK / NO. HP)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Lock className="w-6 h-6 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                    </div>
                    <input
                      type={showKK ? "text" : "password"}
                      value={kodeKeluarga}
                      onChange={(e) => setKodeKeluarga(e.target.value)}
                      className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 transition-all font-bold text-base"
                      placeholder="Nomor KK atau No. HP"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKK(!showKK)}
                      className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showKK ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-pink hover:bg-pink-500 text-white font-black py-5 rounded-[1.5rem] shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-base"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Verifikasi & Cek Profil"
                  )}
                </button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Atau</span>
                </div>
              </div>

              <button
                onClick={onSelfRegister}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-brand-blue font-black text-xs uppercase tracking-widest hover:border-brand-blue/40 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Warga Baru? Daftar Mandiri
              </button>
            </div>
          )}

          {/* Free Trial Banner - More Prominent CTA */}
          <div className="mt-8 flex flex-col items-center w-full px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full max-w-sm"
            >
              <button
                onClick={onShowFreeTrial}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-white to-slate-50 border-2 border-brand-pink/30 p-6 rounded-[2.5rem] transition-all hover:bg-white hover:border-brand-pink shadow-2xl shadow-brand-pink/10 hover:shadow-brand-pink/20 text-left"
              >
                {/* Decorative background light */}
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-pink/5 rounded-full blur-3xl group-hover:bg-brand-pink/10 transition-colors"></div>

                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-3xl bg-brand-pink flex items-center justify-center text-white shadow-xl shadow-brand-pink/30 group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="w-8 h-8 fill-white/20" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-amber-500 text-[10px] font-black uppercase tracking-widest text-white rounded-full shadow-lg shadow-amber-500/20 animate-pulse">
                        Terbatas!
                      </span>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-pink">
                        Promo Launching
                      </p>
                    </div>
                    <h3 className="text-[19px] font-black text-slate-800 leading-tight tracking-tight">
                      Gunakan{" "}
                    <span className="font-['Georgia'] bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmartRW</span>
                    {' '}
                    <span className="font-['Georgia'] bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      Dapatkan{" "}
                      <span className="text-brand-blue">Free Trial</span>{" "}
                      Sekarang!
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="px-5 py-2.5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-pink/20 group-hover:bg-brand-blue group-hover:shadow-brand-blue/20 transition-all flex items-center gap-2">
                        Daftar Gratis
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 italic">
                        Tanpa Kartu Kredit
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>

            <div className="flex flex-col items-center gap-3 mt-6 w-full max-w-sm">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onShowPricing}
                className="w-full py-4 bg-white/50 backdrop-blur-sm border-2 border-slate-200 text-slate-600 rounded-2xl flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:border-brand-blue hover:text-brand-blue transition-all"
              >
                <Tag className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Pilih Paket & List Fitur
                </span>
              </motion.button>

              <div className="grid grid-cols-2 gap-3 w-full">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://smartrwai.vercel.app/"
                  target="_blank"
                  className="py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-blue/5 hover:text-brand-blue hover:border-brand-blue/20 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Website
                  </span>
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://wa.me/087726741143"
                  target="_blank"
                  className="py-4 bg-slate-50 border border-slate-100 text-slate-500 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    WA Admin
                  </span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Embedded Pricing Section as Banner */}
      <div className="w-full max-w-7xl mt-12 mb-24 relative z-10 animate-fade-in-up px-4">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
           <div className="bg-slate-50 py-10 px-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-brand-blue shadow-xl shadow-slate-200 border border-slate-100">
                    <Package className="w-8 h-8" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Pilih Paket & List Fitur</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-1">SmartRW AI nexapps intelligent ecosystem</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-6 py-2 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-pink/20 whitespace-nowrap">
                <Sparkles className="w-3 h-3" />
                Daftar Trial Gratis 30 hari
              </div>
           </div>
           <div className="p-4 sm:p-10 scale-95 lg:scale-100 origin-top">
              <PricingSection onSelectPlan={onShowFreeTrial} hideHeader={true} />
           </div>
        </div>
      </div>
    </div>
  );
}

function UsersView({
  usersData,
  setIsLoadingDB,
  handleFirestoreError,
  tenantId,
  showNotification,
  settings,
  currentUser,
}: {
  usersData: any[];
  setIsLoadingDB: any;
  handleFirestoreError: any;
  tenantId: string;
  showNotification: (m: string, t?: any) => void;
  settings: any;
  currentUser: any;
}) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRTForm, setShowRTForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id_user = editingUser
      ? editingUser.uid || editingUser.id_user
      : `USR-${Date.now()}`;

    const userData = {
      id_user,
      nama: formData.get("nama") as string,
      name: formData.get("nama") as string, // Legacy compatibility
      email: formData.get("email") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as any,
      rt: formData.get("rt") as string,
      nik: formData.get("nik") as string,
      status: formData.get("status") as "AKTIF" | "NONAKTIF",
      isSuperAdmin: formData.get("isSuperAdmin") === "true",
      tenantId,
      created_at: editingUser?.created_at || new Date().toISOString(),
    };

    if (!userData.username || !userData.role || !userData.email) {
      showNotification("Username, Role, dan Email wajib diisi!", "error");
      return;
    }

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "users", id_user), userData);

      // Sync with public_usernames
      await setDoc(doc(db, "public_usernames", userData.username), {
        email: userData.email,
      });

      setShowForm(false);
      setEditingUser(null);
      showNotification(
        `Data pengguna ${editingUser ? "diperbarui" : "ditambahkan"}!`,
        "success",
      );
    } catch (error: any) {
      handleFirestoreError(
        error,
        editingUser ? "update" : "create",
        `/users/${id_user}`,
      );
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(
        doc(db, "users", userToDelete.uid || userToDelete.id_user),
      );
      showNotification("User berhasil dihapus.", "success");
    } catch (error: any) {
      handleFirestoreError(
        error,
        "delete",
        `/users/${userToDelete.uid || userToDelete.id_user}`,
      );
      showNotification("Gagal menghapus user.", "error");
    } finally {
      setIsLoadingDB(false);
      setUserToDelete(null);
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
          <div className="flex gap-2">
            {canCreate(currentUser?.role) && (
              <StyledButton
                label="Tambah User"
                onClick={() => {
                  setEditingUser(null);
                  setShowForm(true);
                }}
                colorType="primary"
                icon={<PlusCircle className="w-4 h-4" />}
              />
            )}
            {canCreate(currentUser?.role) && (
              <StyledButton
                label="Daftar RT"
                onClick={() => setShowRTForm(true)}
                colorType="success"
                icon={<UserPlus className="w-4 h-4" />}
              />
            )}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse border-transparent">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Nama Pengguna
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Username
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Peran
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  RT/RW
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  NIK
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {usersData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400 italic text-xs"
                  >
                    Belum ada data pengguna
                  </td>
                </tr>
              )}
              {usersData.map((user) => (
                <tr
                  key={
                    user.uid ||
                    user.id_user ||
                    user.nik ||
                    `user-${user.username}`
                  }
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold text-slate-700">
                      {user.nama || user.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[10px] text-slate-500 font-medium font-mono">
                      {user.username || user.email?.split("@")[0]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === "SUPER_ADMIN"
                          ? "bg-slate-900 text-white border-slate-900"
                          : user.role === "ADMIN" || user.role === "RW"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : user.role === "RT" || user.role === "SEKRETARIS"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-green-50 text-green-600 border-green-100"
                      }`}
                    >
                      {user.role || "GUEST"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-[11px] text-slate-600 font-bold font-mono">
                      {user.rt || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-600 font-bold font-mono">
                      {user.nik || user.nikMapping || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        user.status === "AKTIF" || !user.status
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {user.status || "AKTIF"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      {canUpdate(currentUser?.role) && (
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowForm(true);
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete(currentUser?.role) && (
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {userToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Pengguna"
            message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.nama || userToDelete.name}"?`}
            onConfirm={handleDeleteUser}
            onCancel={() => setUserToDelete(null)}
            confirmText="Hapus"
            cancelText="Batal"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRTForm && (
          <RTRegistrationForm
            onClose={() => setShowRTForm(false)}
            onSave={() => {}}
            showNotification={showNotification}
            handleFirestoreError={handleFirestoreError}
          />
        )}
      </AnimatePresence>

      {showForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {editingUser ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-slate-800">
                  {editingUser ? "Edit User" : "Tambah User baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:text-red-500 rounded-lg bg-white border border-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    required
                    defaultValue={editingUser?.nama || editingUser?.name || ""}
                    placeholder="Contoh: Bpk. Budi Santoso"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Email (Untuk Login)
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    defaultValue={editingUser?.email || ""}
                    placeholder="admin@rw26.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    defaultValue={editingUser?.username || ""}
                    placeholder="user123"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required={!editingUser}
                      defaultValue={editingUser?.password || ""}
                      placeholder="******"
                      className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Peran (Role)
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || "RT"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  >
                    {currentUser?.isSuperAdmin && (
                      <option value="SUPER_ADMIN">SUPER ADMIN</option>
                    )}
                    <option value="ADMIN">ADMIN (Full CRUD)</option>
                    <option value="OPERATOR">OPERATOR (Create, Update)</option>
                    <option value="VIEWER">VIEWER (Read Only)</option>
                    <option value="RW">RW</option>
                    <option value="RT">RT</option>
                    <option value="BENDAHARA">BENDAHARA</option>
                    <option value="SEKRETARIS">SEKRETARIS</option>
                    <option value="SATPAM">SATPAM</option>
                    <option value="KADER">KADER</option>
                    <option value="WARGA">WARGA</option>
                    <option value="TAMU">TAMU / GUEST</option>
                  </select>
                </div>

                {currentUser?.isSuperAdmin ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                      Akses Khusus
                    </label>
                    <select
                      name="isSuperAdmin"
                      defaultValue={
                        editingUser?.isSuperAdmin ? "true" : "false"
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                    >
                      <option value="false">Standard User</option>
                      <option value="true">Super Admin Power</option>
                    </select>
                  </div>
                ) : (
                  <input type="hidden" name="isSuperAdmin" value="false" />
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Nomor RT/RW
                  </label>
                  <input
                    type="text"
                    name="rt"
                    defaultValue={
                      editingUser?.rt ||
                      (settings?.RT && settings?.RW
                        ? `${settings.RT} / ${settings.RW}`
                        : settings?.RT || "")
                    }
                    placeholder="Contoh: 01 / 26"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    NIK (Optional)
                  </label>
                  <input
                    type="text"
                    name="nik"
                    defaultValue={
                      editingUser?.nik || editingUser?.nikMapping || ""
                    }
                    placeholder="16 Digit NIK"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingUser?.status || "AKTIF"}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-slate-500 font-black uppercase text-[10px] tracking-widest border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TenantsView({
  tenantsData,
  isLoadingDB,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
  setSelectedTenantId,
  selectedTenantId,
}: {
  tenantsData: any[];
  isLoadingDB: boolean;
  setIsLoadingDB: any;
  handleFirestoreError: any;
  showNotification: any;
  setSelectedTenantId: any;
  selectedTenantId: string | null;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<any>(null);
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRestoreDefaultTenants = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      
      const defaultTenants = [
        {
          id: "rw26_berjuang",
          name: "RW 26 Berjuang",
          parentId: "",
          adminEmail: "rw26@berjuang.com",
          adminPhone: "081234567890",
          status: "PREMIUM",
          isActive: true,
          maxWarga: 1000,
          addons: ["chat", "ai_bot", "financial_analytics", "surat_digital", "voting_online"],
          rwTarget: "26"
        },
        {
          id: "rt01_rw26_berjuang",
          name: "RT 01 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt01@rw26_berjuang.com",
          adminPhone: "081234567891",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "1",
          rwTarget: "26"
        },
        {
          id: "rt02_rw26_berjuang",
          name: "RT 02 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt02@rw26_berjuang.com",
          adminPhone: "081234567892",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "2",
          rwTarget: "26"
        },
        {
          id: "rt03_rw26_berjuang",
          name: "RT 03 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt03@rw26_berjuang.com",
          adminPhone: "081234567893",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "3",
          rwTarget: "26"
        },
        {
          id: "rt04_rw26_berjuang",
          name: "RT 04 / RW 26 Berjuang",
          parentId: "rw26_berjuang",
          adminEmail: "rt04@rw26_berjuang.com",
          adminPhone: "081234567894",
          status: "BASIC",
          isActive: true,
          maxWarga: 200,
          addons: ["chat"],
          rtTarget: "4",
          rwTarget: "26"
        }
      ];

      for (const t of defaultTenants) {
        const payload = {
          ...t,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(doc(db, "tenants", t.id), payload, { merge: true });
        
        batch.set(doc(db, "settings", t.id), {
          NAMA_RT: t.name,
          RT: (t.rtTarget || "").toString().padStart(2, "0"),
          RW: t.rwTarget || "26"
        }, { merge: true });
      }

      await batch.commit();
      showNotification("Berhasil memulihkan default tenants (rw26_berjuang & sub-tenant RT01-04)!", "success");
    } catch (error: any) {
      console.error("Failed to restore default tenants:", error);
      showNotification("Gagal memulihkan default tenants.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handlePermanentDeleteLegacyTenants = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      const targetIds = ["RW26", "RW_BERJUANG", "RW26_SMART", "rt01_rw26"];
      
      for (const tId of targetIds) {
        batch.delete(doc(db, "tenants", tId));
        batch.delete(doc(db, "settings", tId));
        batch.delete(doc(db, "tenant_settings", tId));
        batch.delete(doc(db, "voting_config", tId));
      }
      
      await batch.commit();
      showNotification("Selesai! Tenant RW26, RW_BERJUANG, RW26_SMART, rt01_rw26 telah berhasil dihapus permanen dari Backend.", "success");
    } catch (e: any) {
      showNotification(`Gagal menghapus tenant dari backend: ${e.message}`, "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const runMigration = async () => {
    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);
      let updatedCount = 0;

      tenantsData.forEach((tenantData) => {
        const paketStatus = (tenantData.status || "").toUpperCase();
        const docId = tenantData.id || tenantData.docId;

        if (!docId) return;

        let maxWarga = 50;

        // Specific overrides requested by user
        if (
          docId === "test" ||
          docId === "TRIAL_ARIFRAJ_MCI_4348" ||
          docId === "rw26_berjuang"
        ) {
          maxWarga = 50;
        } else if (paketStatus.includes("STARTER")) {
          maxWarga = 50;
        } else if (paketStatus.includes("FLASH")) {
          maxWarga = 300;
        } else if (paketStatus.includes("PRO")) {
          maxWarga = 1000;
        } else if (paketStatus.includes("PREMIUM")) {
          maxWarga = 1000;
        } else if (paketStatus.includes("ENTERPRISE")) {
          maxWarga = 20000;
        } else {
          // Fallback to resolving via global map if none of the above matches specifically
          const normalizedStatus = paketStatus
            .replace("V4.0 ", "")
            .replace("PLAN", "")
            .trim();
          const baseKey = PLAN_ALIASES[normalizedStatus] || normalizedStatus;
          maxWarga = (PLAN_FEATURES as any)[baseKey]?.maxWarga || 50;
        }

        batch.update(doc(db, "tenants", docId), { maxWarga });
        updatedCount++;
      });

      if (updatedCount > 0) {
        await batch.commit();
        showNotification(
          `Berhasil melakukan standardisasi pada ${updatedCount} tenant!`,
          "success",
        );
      } else {
        showNotification("Tidak ada data tenant yang ditemukan.", "info");
      }
    } catch (e) {
      console.error("Migration Error:", e);
      showNotification("Gagal melakukan standardisasi data.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const tenantId = formData.get("id") as string;
    const parentId = (formData.get("parentId") as string) || null;
    const name = formData.get("name") as string;
    const email = formData.get("adminEmail") as string;
    const password = formData.get("adminPassword") as string;
    const phone = formData.get("adminPhone") as string;
    const paket = formData.get("status") as string;
    const rtCount = parseInt((formData.get("rtCount") as string) || "1");
    const rwNumber = (formData.get("rwNumber") as string) || "26";
    const isActive = formData.get("isActive") === "true";

    if (!editingTenant && (!password || password.length < 6)) {
      showNotification("Password admin minimal 6 karakter.", "error");
      return;
    }

    // Limit calculation based on package
    const planKey =
      paket === "STARTER"
        ? "TRIAL"
        : paket === "FLASH"
          ? "BASIC"
          : paket === "PRO"
            ? "PRO"
            : paket === "PREMIUM"
              ? "PREMIUM"
              : paket === "ENTERPRISE"
                ? "ENTERPRISE"
                : "TRIAL";

    const addons = formData.getAll("addons[]") as string[];

    // Use shared logic to calculate features (including maxWarga from add-ons)
    const planConfig = getPlanFeatures({ status: paket, addons });
    const maxWarga = planConfig.maxWarga || 50;

    const tenant = {
      id: tenantId,
      parentId: parentId,
      name: name,
      address: formData.get("address") as string,
      adminEmail: email,
      adminPhone: phone,
      status: paket,
      isActive: isActive,
      maxWarga,
      addons,
      rtTarget: rtCount,
      rwTarget: rwNumber,
      createdAt: editingTenant
        ? editingTenant.createdAt || new Date().toISOString()
        : new Date().toISOString(),
    };

    setIsLoadingDB(true);
    try {
      const batch = writeBatch(db);

      // 1. Setup Tenant Doc
      batch.set(doc(db, "tenants", tenant.id), tenant, { merge: true });

      // 2. Sync Shared Admin/Settings on edit
      if (editingTenant) {
        // Sync Settings
        batch.set(
          doc(db, "settings", tenantId),
          {
            NAMA_RT: name,
            RT: rtCount.toString().padStart(2, "0"),
            RW: rwNumber,
          },
          { merge: true },
        );

        // Update admin user if password changed
        if (password && password.length >= 6) {
          // We'll update any user in this tenant that has role ADMIN and matches this email
          // Since we don't have the userId, we'll need to rely on the fact that
          // the Super Admin usually wants to reset the main admin's password.
          // However, without a query here we can't easily get the ID.
          // We'll assume the admin's email is unique and update the record if we find it in residents later?
          // Actually, let's just stick to the tenant and settings for now as they are the primary source of 'no change'.
        }
      }

      // 3. Sync Admin User Password/Email if changed
      let hasAdminUser = false;
      if (editingTenant) {
        const usersRef = collection(db, "users");
        const qAdmin = query(usersRef, where("tenantId", "==", tenantId));
        const userSnap = await getDocs(qAdmin);

        userSnap.forEach((userDoc) => {
          const userData = userDoc.data();
          const userRole = (userData.role || "").toUpperCase();

          if (
            userRole === "ADMIN" ||
            userRole === "SUPER_ADMIN" ||
            userRole === "OWNER" ||
            userData.email === editingTenant.adminEmail
          ) {
            hasAdminUser = true;
            const updateData: any = { email: email };
            if (password && password.length >= 6) {
              updateData.password = password;
            }
            batch.update(userDoc.ref, updateData);
          }
        });
      }

      // 4. Auto Setup Admin User (Only on creation or if trial has no admin yet)
      if (!editingTenant || (!hasAdminUser && editingTenant)) {
        const userId = `ADM-${Date.now()}`;
        batch.set(doc(db, "users", userId), {
          id_user: userId,
          nama: `Admin ${name}`,
          name: `Admin ${name}`,
          username: email.split("@")[0],
          email: email,
          password: password,
          role: "ADMIN",
          tenantId: tenantId,
          rt: "01",
          status: "AKTIF",
          hp: phone,
          created_at: new Date().toISOString(),
        });

        // 3. Auto Setup Default Settings
        batch.set(doc(db, "settings", tenantId), {
          NAMA_RT: name,
          RT: rtCount.toString().padStart(2, "0"),
          RW: rwNumber,
          NAMA_KETUA: "-",
          NOMINAL_IURAN: "50000",
          STATUS_WA: "Nonaktif",
          TEMPLATE_WA:
            "Halo {nama}, ini pengingat iuran Anda dari pengurus RW/RT. Mohon untuk segera melakukan pembayaran. Terima kasih.",
          TOKEN_WA: "",
        });
      }

      await batch.commit();

      showNotification(
        `Tenant ${name} berhasil ${editingTenant ? "diperbarui" : "didaftarkan"}!`,
        "success",
      );
      setShowAddForm(false);
      setEditingTenant(null);
    } catch (error: any) {
      handleFirestoreError(error, "write", `/tenants/${tenant.id}`);
      showNotification("Gagal menyimpan data tenant.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(
        doc(db, "tenants", tenantToDelete.id || tenantToDelete.docId),
      );
      showNotification(
        `Tenant ${tenantToDelete.name || tenantToDelete.id} berhasil dihapus.`,
        "success",
      );
    } catch (error: any) {
      handleFirestoreError(
        error,
        "delete",
        `/tenants/${tenantToDelete.id || tenantToDelete.docId}`,
      );
      showNotification("Gagal menghapus tenant.", "error");
    } finally {
      setIsLoadingDB(false);
      setTenantToDelete(null);
    }
  };

  return (
    <div className="tenants-wrapper">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Manajemen Tenant (Client RW/RT)
            </h3>
            <p className="text-sm text-slate-500">
              Ekosistem Multi-Tenant SmartRW AI System.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <StyledButton
            label="Pulihkan Default Tenants"
            onClick={handleRestoreDefaultTenants}
            colorType="secondary"
            icon={<RefreshCw className="w-4 h-4 text-emerald-600" />}
          />
          <StyledButton
            label="Hapus Permanen Tenants Lama"
            onClick={handlePermanentDeleteLegacyTenants}
            colorType="danger"
            icon={<RefreshCw className="w-4 h-4 text-white" />}
          />
          <StyledButton
            label="Standardisasi maxWarga"
            onClick={runMigration}
            colorType="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
          />
          {selectedTenantId && (
            <StyledButton
              label="Reset ke Super Admin"
              onClick={() => {
                setSelectedTenantId(null);
                showNotification("Kembali ke mode Super Admin pusat.", "info");
              }}
              colorType="secondary"
              icon={<Shield className="w-4 h-4" />}
            />
          )}
          <StyledButton
            label="Tambah Tenant Baru"
            onClick={() => {
              setEditingTenant(null);
              setShowAddForm(true);
            }}
            colorType="primary"
            icon={<PlusCircle className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Detail Tenant
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Admin Utama
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Paket
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Status Akses
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenantsData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-400 italic text-sm"
                  >
                    Belum ada tenant terdaftar.
                  </td>
                </tr>
              )}
              {tenantsData.map((tenant, idx) => (
                <tr
                  key={tenant.id || `tenant-${idx}`}
                  className={`hover:bg-blue-50/20 transition-colors ${tenant.isActive === false ? "bg-slate-50/50 grayscale-[0.5]" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${tenant.isActive === false ? "bg-slate-200 text-slate-400" : "bg-slate-100 text-slate-400"}`}
                      >
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold ${tenant.isActive === false ? "text-slate-400" : "text-slate-800"}`}
                        >
                          {tenant.name}
                        </p>
                        <p className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded inline-block">
                          ID: {tenant.id}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {(tenant.maxWarga || tenant.citizenLimit) && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                              <Users className="w-3 h-3" /> Max{" "}
                              {getPlanFeatures(
                                tenant,
                              ).maxWarga.toLocaleString()}{" "}
                              Warga
                            </div>
                          )}
                          {tenant.rwTarget && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full w-fit border border-slate-200">
                              RW: {tenant.rwTarget}
                            </div>
                          )}
                        </div>
                        {tenant.addons && tenant.addons.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {tenant.addons.map((addonCode: string) => {
                              const addonDetails = Object.values(
                                ADDON_CONFIG,
                              ).find((a) => a.featureKey === addonCode);
                              return addonDetails ? (
                                <span
                                  key={addonCode}
                                  className="text-[8px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100"
                                >
                                  +{addonDetails.name.split(" ")[0]}{" "}
                                  {/* Short name */}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-xs font-bold ${tenant.isActive === false ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {tenant.adminEmail || "-"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {tenant.address || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border ${
                        tenant.status === "TRIAL" || tenant.status === "Trial"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : tenant.status === "BASIC"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : tenant.status === "PRO" || tenant.status === "Pro"
                              ? "bg-purple-50 text-purple-700 border-purple-100"
                              : tenant.status === "PREMIUM"
                                ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                : tenant.status === "ENTERPRISE" ||
                                    tenant.status === "Enterprise"
                                  ? "bg-orange-50 text-orange-700 border-orange-100"
                                  : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {tenant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        tenant.isActive !== false
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm"
                          : "bg-rose-50 text-rose-600 border-rose-200 opacity-60"
                      }`}
                    >
                      {tenant.isActive !== false ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-[10px] uppercase font-black tracking-widest">
                      <button
                        onClick={() => {
                          setSelectedTenantId(tenant.id);
                          showNotification(
                            `Berhasil berpindah ke akses ${tenant.name}`,
                            "info",
                          );
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border font-bold active:scale-95 shadow-sm ${
                          selectedTenantId === tenant.id
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {selectedTenantId === tenant.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {selectedTenantId === tenant.id
                            ? "Akses Aktif"
                            : "Bypass Akses"}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingTenant(tenant);
                          setShowAddForm(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 font-bold active:scale-95 shadow-sm"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setTenantToDelete(tenant)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 font-bold active:scale-95 shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200"
          >
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {editingTenant ? "Edit Tenant" : "Daftarkan Tenant Baru"}
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-8 grid grid-cols-2 gap-5 overflow-y-auto max-h-[80vh]"
              onSubmit={handleSaveTenant}
            >
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">
                    Identitas Klien
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      ID Klien (Unique ID)
                    </label>
                    <input
                      name="id"
                      defaultValue={editingTenant?.id}
                      readOnly={!!editingTenant}
                      required
                      placeholder="Contoh: RT01_WARGA"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Nama Organisasi
                    </label>
                    <input
                      name="name"
                      defaultValue={editingTenant?.name}
                      required
                      placeholder="Contoh: RT 01 / RW 26"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Tenant Induk / RW (Opsional)
                    </label>
                    <select
                      name="parentId"
                      defaultValue={editingTenant?.parentId || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold text-slate-700"
                    >
                      <option value="">Mandiri (Parent Tenant)</option>
                      {tenantsData.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-800 tracking-widest block">
                    Informasi Admin Utama
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Email Admin
                    </label>
                    <input
                      name="adminEmail"
                      defaultValue={editingTenant?.adminEmail}
                      required
                      type="email"
                      placeholder="Email Admin"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm mt-auto"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      Password{" "}
                      {editingTenant ? "(Kosongkan jika tidak ubah)" : ""}
                    </label>
                    <div className="relative mt-auto">
                      <input
                        name="adminPassword"
                        required={!editingTenant}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password Admin (Min 6 Karakter)"
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                      No. HP Admin
                    </label>
                    <input
                      name="adminPhone"
                      defaultValue={editingTenant?.adminPhone}
                      required
                      placeholder="No. HP Admin"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Removed edit tenant admin email block as it's now covered above */}

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Paket Sistem
                </label>
                <select
                  name="status"
                  defaultValue={editingTenant?.status || "STARTER"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="STARTER">Starter / Free (Max 50 Warga)</option>
                  <option value="FLASH">Flash / RT (Max 300 Warga)</option>
                  <option value="PRO">Pro / RW (Max 1000 Warga)</option>
                  <option value="PREMIUM">Premium (Max 1000 Warga)</option>
                  <option value="ENTERPRISE">
                    Enterprise (Max 20.000 Warga)
                  </option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Nomor RW
                </label>
                <input
                  name="rwNumber"
                  defaultValue={editingTenant?.rwTarget || "26"}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Target Jumlah RT
                </label>
                <input
                  name="rtCount"
                  type="number"
                  defaultValue={editingTenant?.rtTarget || 5}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Alamat / Keterangan Lokasi
                </label>
                <textarea
                  name="address"
                  defaultValue={editingTenant?.address}
                  rows={2}
                  placeholder="Alamat lengkap organisasi..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                  Status Akses
                </label>
                <select
                  name="isActive"
                  defaultValue={
                    editingTenant?.isActive !== false ? "true" : "false"
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Tidak Aktif (Suspended)</option>
                </select>
              </div>

              <div className="col-span-2 mt-2 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-black uppercase text-slate-800 tracking-widest block">
                    Add-ons (Fitur Ekstra)
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(ADDON_CONFIG).map((addon) => (
                    <label
                      key={addon.id}
                      className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="addons[]"
                        value={addon.featureKey}
                        defaultChecked={editingTenant?.addons?.includes?.(
                          addon.featureKey,
                        )}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-[10px] font-bold text-slate-700">
                        {addon.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-2 flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoadingDB}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-300"
                >
                  {isLoadingDB
                    ? "Memproses..."
                    : editingTenant
                      ? "Simpan Perubahan"
                      : "Daftarkan & Setup Tenant"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Benefits Comparison Guide Section */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group mt-6">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none">
          <Shield className="w-48 h-48 rotate-12 group-hover:rotate-0" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">
                Panduan Paket & Benefits
              </h4>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                Struktur Kapasitas & Fitur Nexapps
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.entries(PLAN_FEATURES).map(
              ([key, features]: [string, any]) => {
                const isEnterprise = key === "ENTERPRISE";
                const isPremium = key === "PREMIUM";
                const isPro = key === "PRO";

                return (
                  <div
                    key={key}
                    className={`p-5 rounded-3xl border flex flex-col relative overflow-hidden transition-all ${
                      isEnterprise
                        ? "bg-slate-900 border-slate-800 text-white shadow-xl"
                        : isPremium
                          ? "bg-indigo-50 border-indigo-100 shadow-lg shadow-indigo-50"
                          : "bg-white border-slate-100"
                    }`}
                  >
                    <div className="mb-4">
                      <p
                        className={`text-[22px] font-black uppercase tracking-widest mb-1 ${isEnterprise ? "text-orange-400" : "text-indigo-600"}`}
                      >
                        {key === "TRIAL"
                          ? "STARTER"
                          : key === "RT"
                            ? "LITE"
                            : key === "BASIC"
                              ? "FLASH"
                              : key}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {features.oldPrice && (
                          <span className="text-[15px] line-through opacity-50">
                            {features.oldPrice}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <h5 className="text-2xl font-black tracking-tighter leading-none">
                            {features.price}
                          </h5>
                          {!isEnterprise && features.price !== "Free" && (
                            <span className="text-[15px] opacity-40 font-bold uppercase tracking-tight">
                              /bln
                            </span>
                          )}
                        </div>
                        {features.price === "Free" && (
                          <h5 className="text-xl font-black tracking-tighter leading-none text-brand-blue mt-1">
                            Rp. 0/Bln
                          </h5>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 p-2 bg-black/5 rounded-xl border border-black/5">
                      <Users className="w-3 h-3 opacity-40" />
                      <span className="text-[15px] font-black tracking-tight">
                        {features.maxWarga} Warga
                      </span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {features.coreFeatures.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${isEnterprise ? "text-emerald-400" : "text-emerald-500"}`}
                          />
                          <span className="text-[15px] font-bold leading-none">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        const waText = encodeURIComponent(
                          "Hi Ka, Saya mau Upgrade Paket E-RTRW boleh dibantu, Trima Kasih",
                        );
                        window.open(
                          `https://wa.me/087726741143?text=${waText}`,
                          "_blank",
                        );
                      }}
                      className={`mt-auto w-full py-2.5 rounded-xl text-[15px] font-black uppercase tracking-widest transition-all ${
                        isEnterprise
                          ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg"
                          : isPremium
                            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      {key === "TRIAL" ? "Sewa" : "Upgrade"}
                    </button>
                  </div>
                );
              },
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
              <strong className="block mb-1">Informasi Hak Akses:</strong>
              Sebagai Super Admin, Anda memiliki otorisasi penuh untuk melakukan
              upgrade atau downgrade paket tenant kapanpun. Setiap perubahan
              paket akan langsung mengubah <strong>Citizen Limit</strong> dan
              membuka akses ke modul fitur tambahan yang terkunci sebelumnya
              bagi pengurus wilayah (Client) tersebut.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {tenantToDelete && (
          <ConfirmModal
            isOpen={true}
            title="Hapus Tenant"
            message={`Apakah Anda yakin ingin menghapus infrastruktur tenant "${tenantToDelete.name || tenantToDelete.id}"? Semua data organisasi akan terputus dan tidak dapat dikembalikan.`}
            onConfirm={handleDeleteTenant}
            onCancel={() => setTenantToDelete(null)}
            confirmText="Hapus Permanen"
            cancelText="Batal"
            isLoading={isLoadingDB}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PosyanduView({
  balitaData,
  setBalitaData,
  ibuHamilData,
  setIbuHamilData,
  posyanduKegiatanData,
  setPosyanduKegiatanData,
  posbinduKegiatanData,
  setPosbinduKegiatanData,
  pemeriksaanBalitaData,
  setPemeriksaanBalitaData,
  pemeriksaanPosbinduData,
  setPemeriksaanPosbinduData,
  imunisasiData,
  setImunisasiData,
  wargaData,
  currentUser,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
}: any) {
  const roleUpper = currentUser?.role?.toUpperCase() || "";
  const isViewer = ["WARGA", "VIEWER", "TAMU"].includes(roleUpper);
  const isWarga = roleUpper === "WARGA";

  const filteredBalita = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (balitaData || []).filter(
        (b: any) =>
          b.nikOrangTua === currentUser.nik || b.nik === currentUser.nik,
      );
    }
    return balitaData || [];
  }, [balitaData, isWarga, currentUser?.nik]);

  const filteredIbuHamil = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (ibuHamilData || []).filter((i: any) => i.nik === currentUser.nik);
    }
    return ibuHamilData || [];
  }, [ibuHamilData, isWarga, currentUser?.nik]);

  const filteredPosbindu = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (pemeriksaanPosbinduData || []).filter(
        (p: any) => p.nik === currentUser.nik,
      );
    }
    return pemeriksaanPosbinduData || [];
  }, [pemeriksaanPosbinduData, isWarga, currentUser?.nik]);

  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "balita"
    | "ibuhamil"
    | "kegiatan"
    | "posbindu"
    | "timeline"
    | "ibuhamil_detail"
  >("dashboard");
  const [showBalitaForm, setShowBalitaForm] = useState(false);
  const [showIbuHamilForm, setShowIbuHamilForm] = useState(false);
  const [showKegiatanForm, setShowKegiatanForm] = useState(false);
  const [showPosbinduForm, setShowPosbinduForm] = useState(false);
  const [showPemeriksaanForm, setShowPemeriksaanForm] = useState(false);
  const [showImunisasiForm, setShowImunisasiForm] = useState(false);
  const [selectedBalita, setSelectedBalita] = useState<any>(null);
  const [selectedIbuHamil, setSelectedIbuHamil] = useState<any>(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingPosbinduItem, setEditingPosbinduItem] = useState<any>(null);
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
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of data as any[]) {
          const nik = row["NIK"] || row["nik"] || row["Nik"] || row["NIK Anak"];
          const nama = row["Nama"] || row["nama"] || row["Nama Anak"];

          if (nik && nama) {
            const id = `BAL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newBalita = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglLahir:
                row["Tgl Lahir"] ||
                row["Tanggal Lahir"] ||
                row["tgl_lahir"] ||
                new Date().toISOString().split("T")[0],
              jenisKelamin:
                row["Jenis Kelamin"] ||
                row["L/P"] ||
                row["jenis_kelamin"] ||
                "L",
              namaIbu: row["Nama Ibu"] || row["nama_ibu"] || "",
              namaAyah: row["Nama Ayah"] || row["nama_ayah"] || "",
              rt: row["RT"] || row["rt"] || "01",
              rw: row["RW"] || row["rw"] || "01",
              bbLahir: parseFloat(row["BB Lahir"] || row["bb_lahir"] || "0"),
              pbLahir: parseFloat(row["PB Lahir"] || row["pb_lahir"] || "0"),
            };

            await setDoc(doc(db, "posyandu_balita", id), newBalita);
            successCount++;
          }
        }

        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data balita berhasil diimpor!`);
        } else {
          showNotification(
            "Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.",
            "error",
          );
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportIbuHamilExcel = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        setIsLoadingDB(true);
        for (const row of data as any[]) {
          const nik = row["NIK"] || row["nik"] || row["NIK Ibu"];
          const nama = row["Nama"] || row["nama"] || row["Nama Ibu Hamil"];

          if (nik && nama) {
            const id = `HML-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            const newIbuHamil = {
              tenantId,
              id,
              nik: String(nik),
              nama,
              tglHPL:
                row["Tgl HPL"] ||
                row["HPL"] ||
                row["tgl_hpl"] ||
                new Date().toISOString().split("T")[0],
              usiaKehamilan: parseFloat(
                row["Usia Hamil"] ||
                  row["Usia Kehamilan"] ||
                  row["usia_kehamilan"] ||
                  "0",
              ),
              riwayatKesehatan:
                row["Riwayat Kesehatan"] || row["Kesehatan"] || "",
              rt: row["RT"] || row["rt"] || "01",
              rw: row["RW"] || row["rw"] || "01",
            };

            await setDoc(doc(db, "ibu_hamil", id), newIbuHamil);
            successCount++;
          }
        }

        setIsLoadingDB(false);
        if (successCount > 0) {
          showNotification(`${successCount} data ibu hamil berhasil diimpor!`);
        } else {
          showNotification(
            "Format excel mungkin tidak sesuai. Pastikan ada kolom NIK dan Nama.",
            "error",
          );
        }
      } catch (error) {
        setIsLoadingDB(false);
        console.error("Import error:", error);
        showNotification("Gagal membaca file Excel", "error");
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRefIbuHamil.current) fileInputRefIbuHamil.current.value = "";
  };

  const exportPosyanduPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("LAPORAN BULANAN POSYANDU", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);

    // Balita Table
    const tableData = balitaData.map((b: any) => [
      b.nama,
      b.jk,
      calculateAgeMonths(b.tglLahir) + " Bln",
      b.namaOrangTua,
      b.statusStunting,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Nama Balita", "JK", "Usia", "Wali", "Status Gizi"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
    });

    doc.save(`Laporan_Posyandu_${new Date().toISOString().split("T")[0]}.pdf`);
    showNotification("Laporan PDF berhasil diunduh!");
  };

  const exportKegiatanPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("JADWAL & AGENDA POSYANDU", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = posyanduKegiatanData.map((k: any) => [
      formatTgl(k.tanggal),
      k.lokasi,
      k.keterangan || "-",
      k.kaderId?.split("@")[0] || "-",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Tanggal", "Lokasi", "Keterangan", "Petugas"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    });

    doc.save(`Jadwal_Posyandu_${new Date().toISOString().split("T")[0]}.pdf`);
    showNotification("Jadwal PDF berhasil diunduh!");
  };

  const exportKegiatanExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      posyanduKegiatanData.map((k: any) => ({
        Tanggal: formatTgl(k.tanggal),
        Lokasi: k.lokasi,
        Keterangan: k.keterangan || "-",
        Petugas: k.kaderId?.split("@")[0] || "-",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jadwal Posyandu");
    XLSX.writeFile(
      wb,
      `Jadwal_Posyandu_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Jadwal Excel berhasil diunduh!");
  };

  const exportPosyanduExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      balitaData.map((b: any) => ({
        "Nama Balita": b.nama,
        "Jenis Kelamin": b.jk,
        "Usia (Bulan)": calculateAgeMonths(b.tglLahir),
        "Nama Orang Tua": b.namaOrangTua,
        "Status Gizi": b.statusStunting,
        NIK: b.nik,
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Balita");
    XLSX.writeFile(
      wb,
      `Laporan_Posyandu_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Laporan Excel berhasil diunduh!");
  };

  const exportBalitaKardPDF = (balita: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("KARTU KESEHATAN ANAK (BALITA)", 14, 22);

    doc.setFontSize(11);
    doc.text(`Nama Anak: ${balita.nama}`, 14, 32);
    doc.text(`NIK: ${balita.nik || "-"}`, 14, 38);
    doc.text(`Jenis Kelamin: ${balita.jk}`, 14, 44);
    doc.text(`Tanggal Lahir: ${formatTgl(balita.tglLahir)}`, 14, 50);
    doc.text(
      `Nama Ibu: ${balita.namaIbu || balita.namaOrangTua || "-"}`,
      14,
      56,
    );
    doc.text(`Status Gizi: ${balita.statusStunting || "Normal"}`, 14, 62);

    const history = [
      ...pemeriksaanBalitaData
        .filter((p: any) => p.balitaId === balita.id)
        .map((p: any) => [
          formatTgl(p.tanggal),
          "Pemeriksaan",
          `BB: ${p.beratBadan}kg, TB: ${p.tinggiBadan}cm`,
          p.pemeriksa || "-",
        ]),
      ...imunisasiData
        .filter((i: any) => i.balitaId === balita.id)
        .map((i: any) => [
          formatTgl(i.tanggal),
          "Imunisasi",
          i.jenisImunisasi,
          "Kesehatan Warga",
        ]),
    ].sort((a: any, b: any) => b[0].localeCompare(a[0]));

    autoTable(doc, {
      startY: 70,
      head: [["Tanggal", "Tipe", "Keterangan", "Petugas"]],
      body: history,
      theme: "grid",
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
    });

    doc.save(`Kartu_Kesehatan_${balita.nama}.pdf`);
    showNotification("Kartu Kesehatan berhasil diunduh!");
  };

  const exportIbuHamilKardPDF = (mil: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("KARTU KESEHATAN IBU HAMIL", 14, 22);

    doc.setFontSize(11);
    doc.text(`Nama Ibu: ${mil.nama}`, 14, 32);
    doc.text(`NIK: ${mil.nik}`, 14, 38);
    doc.text(`Usia Kehamilan: ${mil.usiaKehamilan} Minggu`, 14, 44);
    doc.text(`Estimasi HPL: ${formatTgl(mil.tglHPL)}`, 14, 50);
    doc.text(`Catatan: ${mil.riwayatKesehatan || "-"}`, 14, 56);

    autoTable(doc, {
      startY: 65,
      head: [["Keterangan", "Detail"]],
      body: [
        ["Nama Ibu", mil.nama],
        ["NIK", mil.nik],
        ["Usia Hamil", `${mil.usiaKehamilan} Minggu`],
        ["Estimasi HPL", formatTgl(mil.tglHPL)],
        ["Lokasi", `RT ${mil.rt} / RW ${mil.rw}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] },
    });

    doc.save(`Kesehatan_IbuHamil_${mil.nama}.pdf`);
    showNotification("Kartu Kesehatan berhasil diunduh!");
  };

  const formatTgl = (tgl: string) => {
    if (!tgl) return "-";
    try {
      return new Date(tgl).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return tgl;
    }
  };

  const calculateAgeMonths = (tglLahir: string) => {
    if (!tglLahir) return 0;
    const birth = new Date(tglLahir);
    const today = new Date();
    return (
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth())
    );
  };

  const determineGiziStatus = (
    bb: number,
    tb: number,
    jk: string,
    ageMonths: number,
  ) => {
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

    const nikOrangTua = formData.get("orangTuaId") as string;
    const orangTua = wargaData.find((w: any) => w.nik === nikOrangTua);

    const data = {
      id,
      tenantId,
      nama: formData.get("nama"),
      tglLahir: formData.get("tglLahir"),
      jk: formData.get("jk"),
      orangTuaId: nikOrangTua,
      namaOrangTua: orangTua?.nama || formData.get("namaOrangTua"),
      alamat: orangTua?.blok || formData.get("alamat"),
      rt: orangTua?.rt || formData.get("rt"),
      rw: orangTua?.rw || formData.get("rw"),
      statusStunting: formData.get("statusStunting") || "Normal",
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "balita", id), data);
      showNotification(
        `Data Balita ${editingItem ? "diperbarui" : "ditambahkan"}!`,
      );
      setShowBalitaForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "write", "balita");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveIbuHamil = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || `MIL-${Date.now()}`;

    const nikInput = formData.get("nik") as string;
    const warga = wargaData.find(
      (w: any) => w.nik === nikInput || w.nama === nikInput,
    );

    const data = {
      id,
      tenantId,
      nik: warga?.nik || nikInput || "-",
      nama: warga?.nama || nikInput || "-",
      tglHPL: formData.get("tglHPL"),
      usiaKehamilan: parseInt((formData.get("usiaKehamilan") as string) || "0"),
      riwayatKesehatan: formData.get("riwayatKesehatan"),
      rt: warga?.rt || formData.get("rt") || "-",
      rw: warga?.rw || formData.get("rw") || "-",
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "ibu_hamil", id), data);
      showNotification(
        `Data Ibu Hamil ${editingItem ? "diperbarui" : "ditambahkan"}!`,
      );
      setShowIbuHamilForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "write", "ibu_hamil");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveKegiatan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingItem?.id || `KGT-${Date.now()}`;

    const data = {
      id,
      tenantId,
      tanggal: formData.get("tanggal"),
      lokasi: formData.get("lokasi"),
      kaderId: currentUser.email,
      keterangan: formData.get("keterangan"),
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "posyandu_kegiatan", id), data);
      showNotification("Kegiatan Kesehatan Warga disimpan!");
      setShowKegiatanForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "write", "posyandu_kegiatan");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSavePemeriksaan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `PMK-${Date.now()}`;

    const bb = parseFloat(formData.get("beratBadan") as string);
    const tb = parseFloat(formData.get("tinggiBadan") as string);
    const balita = balitaData.find((b: any) => b.id === selectedBalita.id);
    const ageMonths = calculateAgeMonths(balita.tglLahir);

    const data = {
      id,
      tenantId,
      balitaId: selectedBalita.id,
      kegiatanId: selectedKegiatan?.id || "",
      tanggal: formData.get("tanggal"),
      beratBadan: bb,
      tinggiBadan: tb,
      lingkarKepala: parseFloat(
        (formData.get("lingkarKepala") as string) || "0",
      ),
      statusGizi: determineGiziStatus(bb, tb, balita.jk, ageMonths),
      catatan: formData.get("catatan"),
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "pemeriksaan_balita", id), data);
      showNotification("Hasil pemeriksaan berhasil dicatat!");
      setShowPemeriksaanForm(false);
    } catch (err) {
      handleFirestoreError(err, "write", "pemeriksaan");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSaveImunisasi = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `IMU-${Date.now()}`;

    const data = {
      id,
      tenantId,
      balitaId: selectedBalita.id,
      jenisImunisasi: formData.get("jenisImunisasi"),
      tanggal: formData.get("tanggal"),
      status: formData.get("status") || "Selesai",
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, "imunisasi", id), data);
      showNotification("Catatan imunisasi disimpan!");
      setShowImunisasiForm(false);
    } catch (err) {
      handleFirestoreError(err, "write", "imunisasi");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!confirm("Hapus data ini?")) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, col, id));
      showNotification("Data berhasil dihapus.");
    } catch (err) {
      handleFirestoreError(err, "delete", col);
    } finally {
      setIsLoadingDB(false);
    }
  };

  // Dashboard Stats
  const stats = {
    totalBalita: filteredBalita.length,
    balitaSehat: filteredBalita.filter(
      (b: any) => b.statusStunting === "Normal",
    ).length,
    balitaRisiko: filteredBalita.filter(
      (b: any) => b.statusStunting === "Risiko Stunting",
    ).length,
    balitaStunting: filteredBalita.filter(
      (b: any) => b.statusStunting === "Stunting",
    ).length,

    totalIbuHamil: filteredIbuHamil.length,
    ibuHamilRisiko: filteredIbuHamil.filter((i: any) =>
      (i.riwayatKesehatan || "").toLowerCase().includes("risiko"),
    ).length,

    totalLansia: (isWarga ? [] : wargaData).filter((w: any) => {
      const age = calculateAge(w.tglLahir);
      return typeof age === "number" && (age as number) >= 60;
    }).length,

    totalPosbindu: filteredPosbindu.length,
    posbinduHipertensi: filteredPosbindu.filter(
      (p: any) =>
        p.tekananDarah &&
        parseInt(p.tekananDarah.toString().split("/")[0]) >= 140,
    ).length,
    posbinduAsamUrat: filteredPosbindu.filter(
      (p: any) => p.asamUrat && parseFloat(p.asamUrat) > 7,
    ).length,
    posbinduGulaDarah: filteredPosbindu.filter(
      (p: any) => p.gulaDarah && parseFloat(p.gulaDarah) > 200,
    ).length,

    posyanduTerakhir: posyanduKegiatanData.sort((a: any, b: any) =>
      b.tanggal.localeCompare(a.tanggal),
    )[0],
    stuntingCount: filteredBalita.filter(
      (b: any) => b.statusStunting === "Stunting",
    ).length,
    risikoStunting: filteredBalita.filter(
      (b: any) => b.statusStunting === "Risiko Stunting",
    ).length,
  };

  const exportIbuHamilExcel = () => {
    const data = filteredIbuHamil.map((mil: any) => ({
      Nama: mil.nama,
      NIK: mil.nik,
      "Usia Hamil (Minggu)": mil.usiaKehamilan,
      HPL: mil.tglHPL,
      "Riwayat Kesehatan": mil.riwayatKesehatan || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Monitor Ibu Hamil");
    XLSX.writeFile(
      wb,
      `Data_Ibu_Hamil_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Data Excel berhasil diunduh!");
  };

  const exportIbuHamilPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MONITOR IBU HAMIL", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredIbuHamil.map((mil: any) => [
      mil.nama,
      mil.nik,
      mil.usiaKehamilan + " Minggu",
      formatTgl(mil.tglHPL),
      mil.riwayatKesehatan || "-",
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Nama", "NIK", "Usia Hamil", "HPL", "Kesehatan"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] },
    });

    doc.save(`Monitor_Ibu_Hamil_${new Date().toISOString().split("T")[0]}.pdf`);
    showNotification("Laporan PDF berhasil diunduh!");
  };

  const exportBalitaExcel = () => {
    const data = filteredBalita.map((b: any) => ({
      "Nama Balita": b.nama,
      NIK: b.nik || "-",
      "Jenis Kelamin": b.jk,
      "Tgl Lahir": b.tglLahir,
      "Usia (Bulan)": calculateAgeMonths(b.tglLahir),
      "Orang Tua": b.namaOrangTua,
      Alamat: `Blok ${b.alamat} / RT ${b.rt}`,
      "Status Gizi": b.statusStunting || "Normal",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Balita");
    XLSX.writeFile(
      wb,
      `Data_Balita_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Data Excel Balita berhasil diunduh!");
  };

  const exportBalitaPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("DATA BALITA POSYANDU", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredBalita.map((b: any) => [
      b.nama,
      calculateAgeMonths(b.tglLahir) + " Bulan",
      b.namaOrangTua,
      b.statusStunting || "Normal",
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Nama Balita", "Usia", "Orang Tua", "Status Gizi"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] },
    });

    doc.save(`Data_Balita_${new Date().toISOString().split("T")[0]}.pdf`);
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
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              Kesehatan
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Manajemen Kesehatan Ibu & Anak
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {([
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "balita", label: "Balita", icon: Users },
            { id: "ibuhamil", label: "Ibu Hamil", icon: HeartPulse },
            { id: "posbindu", label: "Posbindu", icon: Activity },
            { id: "kegiatan", label: "Kegiatan", icon: Calendar },
          ] as { id: typeof activeSubTab; label: string; icon: any }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === tab.id
                  ? "bg-white text-brand-pink shadow-lg shadow-pink-100 border border-pink-50"
                  : "text-slate-500 hover:bg-white/50"
              }`}
            >
              <tab.icon
                className={`w-5 h-5 ${activeSubTab === tab.id ? "animate-bounce-slow" : ""}`}
              />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === "dashboard" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Baby className="w-20 h-20 text-brand-pink" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">
                Total Balita
              </p>
              <p className="text-4xl font-black text-slate-800 mb-5">
                {stats.totalBalita}
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-green rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">
                    SEHAT
                  </span>
                  <span className="text-emerald-600 font-black text-lg">
                    {stats.balitaSehat}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-yellow rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">
                    RISIKO
                  </span>
                  <span className="text-amber-600 font-black text-lg">
                    {stats.balitaRisiko}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-pink rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">
                    STUNTING
                  </span>
                  <span className="text-brand-pink font-black text-lg">
                    {stats.balitaStunting}
                  </span>
                </div>
              </div>
              {!isViewer && (
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    onClick={() => setActiveSubTab("balita")}
                    className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                  >
                    Lihat Daftar
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowBalitaForm(true);
                    }}
                    className="py-2.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                  >
                    Tambah Data
                  </button>
                </div>
              )}
              {isViewer && (
                <div className="mt-5">
                  <button
                    onClick={() => setActiveSubTab("balita")}
                    className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                  >
                    Buka Laporan Balita
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-pink-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <HeartPulse className="w-20 h-20 text-brand-pink" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">
                Total Ibu Hamil
              </p>
              <p className="text-4xl font-black text-slate-800 mb-5">
                {stats.totalIbuHamil}
              </p>
              <div className="p-4 bg-soft-pink rounded-2xl border border-pink-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
                    Risiko Tinggi
                  </span>
                  <span className="text-brand-pink font-black text-2xl">
                    {stats.ibuHamilRisiko}
                  </span>
                </div>
              </div>
              {!isViewer && (
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    onClick={() => setActiveSubTab("ibuhamil")}
                    className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100"
                  >
                    Lihat Daftar
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowIbuHamilForm(true);
                    }}
                    className="py-2.5 bg-brand-pink/10 text-brand-pink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all"
                  >
                    Tambah Data
                  </button>
                </div>
              )}
              {isViewer && (
                <div className="mt-5">
                  <button
                    onClick={() => setActiveSubTab("ibuhamil")}
                    className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100"
                  >
                    Buka Laporan Ibu Hamil
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-purple-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-20 h-20 text-brand-purple" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">
                Total Lansia
              </p>
              <p className="text-4xl font-black text-slate-800 mb-5">
                {stats.totalLansia}
              </p>
              <div className="p-4 bg-soft-purple rounded-2xl border border-purple-100">
                <p className="text-xs font-black text-brand-purple uppercase tracking-widest">
                  Monitoring Rutin
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Stethoscope className="w-20 h-20 text-brand-blue" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">
                Pemeriksaan Posbindu
              </p>
              <p className="text-4xl font-black text-slate-800 mb-5">
                {stats.totalPosbindu}
              </p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                    Hipertensi
                  </p>
                  <p className="text-xl font-black text-red-500">
                    {stats.posbinduHipertensi}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                    Gula Darah
                  </p>
                  <p className="text-xl font-black text-brand-blue">
                    {stats.posbinduGulaDarah}
                  </p>
                </div>
              </div>
              {!isViewer && (
                <div className="grid grid-cols-2 gap-2 mt-5">
                  <button
                    onClick={() => setActiveSubTab("posbindu")}
                    className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100"
                  >
                    Lihat Daftar
                  </button>
                  <button
                    onClick={() => {
                      setEditingPosbinduItem(null);
                      setShowPosbinduForm(true);
                    }}
                    className="py-2.5 bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all"
                  >
                    Tambah Data
                  </button>
                </div>
              )}
              {isViewer && (
                <div className="mt-5">
                  <button
                    onClick={() => setActiveSubTab("posbindu")}
                    className="w-full py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100"
                  >
                    Buka Laporan Posbindu
                  </button>
                </div>
              )}
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
                  <BarChart
                    data={[
                      {
                        name: "Normal",
                        count: filteredBalita.filter(
                          (b) => b.statusStunting === "Normal",
                        ).length,
                      },
                      { name: "Risiko", count: stats.risikoStunting },
                      { name: "Stunting", count: stats.stuntingCount },
                    ]}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 14, fill: "#94a3b8" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 14, fill: "#94a3b8" }}
                    />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {[0, 1, 2].map((i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? "#10b981"
                              : i === 1
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Jadwal Kesehatan Warga Terakhir / Mendatang
              </h3>
              {stats.posyanduTerakhir ? (
                <div className="flex-1 flex flex-col justify-center text-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-3 opacity-50" />
                  <p className="text-xl font-black text-slate-800">
                    {formatTgl(stats.posyanduTerakhir.tanggal)}
                  </p>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tight">
                    {stats.posyanduTerakhir.lokasi}
                  </p>
                  <div className="mt-4 flex gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-200">
                      Petugas: {stats.posyanduTerakhir.kaderId?.split("@")[0]}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 italic text-sm">
                  Belum ada kegiatan dijadwalkan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "posbindu" && (
        <div className="bg-white/80  rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari warga..."
                    className="w-full md:w-96 pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-brand-pink/10 focus:border-brand-pink outline-none shadow-inner transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                  />
                </div>
                {!isViewer && (
                  <div className="flex gap-2 justify-center w-full sm:w-auto">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-blue-100 transition-all active:scale-90"
                      title="Impor Data"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const doc = new jsPDF();
                        doc.text("Laporan Posbindu", 10, 10);
                        autoTable(doc, {
                          head: [["NIK", "Nama", "TD", "GDS"]],
                          body: pemeriksaanPosbinduData.map((p) => [
                            p.nik,
                            p.nama,
                            p.tekananDarah,
                            p.gulaDarah,
                          ]),
                        });
                        doc.save(
                          `Laporan_Posbindu_${new Date().toISOString().split("T")[0]}.pdf`,
                        );
                      }}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-pink hover:bg-pink-50 shadow-sm transition-all active:scale-90"
                      title="Export PDF"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        const ws = XLSX.utils.json_to_sheet(
                          pemeriksaanPosbinduData,
                        );
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Posbindu");
                        XLSX.writeFile(
                          wb,
                          `Data_Posbindu_${new Date().toISOString().split("T")[0]}.xlsx`,
                        );
                      }}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-green hover:bg-green-50 shadow-sm transition-all active:scale-90"
                      title="Export Excel"
                    >
                      <FileSpreadsheet className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              {!isViewer && (
                <button
                  onClick={() => {
                    setEditingPosbinduItem(null);
                    setShowPosbinduForm(true);
                  }}
                  className="px-6 py-3 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-100 hover:bg-pink-600 flex items-center gap-2 transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" /> Tambah Pemeriksaan
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3">Nama</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Tekanan Darah</th>
                  <th className="px-6 py-3">Gula Darah</th>
                  {!isWarga && <th className="px-6 py-3">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPosbindu
                  .filter(
                    (item: any) =>
                      item.nama
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      item.nik
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  )
                  .map((item: any, idx: number) => (
                    <tr key={`posbindu-${item.id || idx}-${idx}`}>
                      <td className="px-6 py-3 font-bold">{item.nama}</td>
                      <td className="px-6 py-3">{item.tanggal}</td>
                      <td className="px-6 py-3">{item.tekananDarah}</td>
                      <td className="px-6 py-3">{item.gulaDarah} mg/dL</td>
                      {!isWarga && (
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPosbinduItem(item);
                                setShowPosbinduForm(true);
                              }}
                              className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 font-bold transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                deleteItem("pemeriksaan_posbindu", item.id)
                              }
                              className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPosbinduForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-black text-slate-800 mb-6">
              {editingPosbinduItem ? "Edit" : "Tambah"} Pemeriksaan Posbindu
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  tenantId,
                  nama: formData.get("nama"),
                  nik: formData.get("nik"),
                  tanggalLahir: formData.get("tanggalLahir"),
                  gender: formData.get("gender"),
                  alamat: formData.get("alamat"),
                  merokok: formData.get("merokok") === "on" ? "true" : "false",
                  aktivitasFisik: formData.get("aktivitasFisik"),
                  tanggal: new Date().toISOString().split("T")[0],
                  beratBadan: formData.get("beratBadan"),
                  tinggiBadan: formData.get("tinggiBadan"),
                  tekananDarah: formData.get("tekananDarah"),
                  gulaDarah: formData.get("gulaDarah"),
                  kolesterol: formData.get("kolesterol"),
                  asamUrat: formData.get("asamUrat"),
                };

                try {
                  if (editingPosbinduItem) {
                    await setDoc(
                      doc(db, "pemeriksaan_posbindu", editingPosbinduItem.id),
                      data,
                      { merge: true },
                    );
                  } else {
                    const newId = `PB-${Date.now()}`;
                    await setDoc(doc(db, "pemeriksaan_posbindu", newId), {
                      ...data,
                      id: newId,
                    });
                  }
                  showNotification("Data Posbindu berhasil disimpan!");
                  setShowPosbinduForm(false);
                } catch (err) {
                  console.error("Save Posbindu Error:", err);
                  handleFirestoreError(err, "write", "pemeriksaan_posbindu");
                }
              }}
              className="space-y-4"
            >
              <input
                name="nik"
                placeholder="NIK"
                defaultValue={editingPosbinduItem?.nik}
                className="w-full p-3 border rounded-xl"
                required
              />
              <input
                name="nama"
                placeholder="Nama"
                defaultValue={editingPosbinduItem?.nama}
                className="w-full p-3 border rounded-xl"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="tanggalLahir"
                  placeholder="Tanggal Lahir"
                  defaultValue={editingPosbinduItem?.tanggalLahir}
                  type="date"
                  className="w-full p-3 border rounded-xl"
                />
                <select
                  name="gender"
                  defaultValue={editingPosbinduItem?.gender}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="">Jenis Kelamin</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <input
                name="alamat"
                placeholder="Alamat (RT/RW)"
                defaultValue={editingPosbinduItem?.alamat}
                className="w-full p-3 border rounded-xl"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="beratBadan"
                  placeholder="BB (kg)"
                  defaultValue={editingPosbinduItem?.beratBadan}
                  type="number"
                  className="w-full p-3 border rounded-xl"
                />
                <input
                  name="tinggiBadan"
                  placeholder="TB (cm)"
                  defaultValue={editingPosbinduItem?.tinggiBadan}
                  type="number"
                  className="w-full p-3 border rounded-xl"
                />
              </div>
              <input
                name="tekananDarah"
                placeholder="Tekanan Darah (Cth: 120/80)"
                defaultValue={editingPosbinduItem?.tekananDarah}
                className="w-full p-3 border rounded-xl"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="gulaDarah"
                  placeholder="GDS"
                  defaultValue={editingPosbinduItem?.gulaDarah}
                  type="number"
                  className="p-3 border rounded-xl"
                />
                <input
                  name="kolesterol"
                  placeholder="Kol"
                  defaultValue={editingPosbinduItem?.kolesterol}
                  type="number"
                  className="p-3 border rounded-xl"
                />
                <input
                  name="asamUrat"
                  placeholder="AU"
                  defaultValue={editingPosbinduItem?.asamUrat}
                  type="number"
                  className="p-3 border rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    name="merokok"
                    type="checkbox"
                    defaultChecked={editingPosbinduItem?.merokok === "true"}
                  />{" "}
                  Merokok
                </label>
                <select
                  name="aktivitasFisik"
                  defaultValue={editingPosbinduItem?.aktivitasFisik}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="">Aktivitas Fisik</option>
                  <option value="Ringan">Ringan (Jarang gerak)</option>
                  <option value="Sedang">Sedang (Jalan rutin)</option>
                  <option value="Berat">Berat (Olahraga rutin)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPosbinduForm(false)}
                  className="flex-1 p-3 border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-blue-600 text-white rounded-xl"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === "balita" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari balita..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-pink-500 outline-none"
                />
              </div>
              {!isViewer && (
                <div className="flex gap-2 justify-center w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-blue-100 transition-all active:scale-90"
                    title="Impor Database (Excel/CSV)"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={exportBalitaPDF}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-pink hover:bg-pink-50 shadow-sm transition-all active:scale-90"
                    title="Export PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={exportBalitaExcel}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-green hover:bg-green-50 shadow-sm transition-all active:scale-90"
                    title="Export Excel"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {!isViewer && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowBalitaForm(true);
                }}
                className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-brand-blue/90 flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Daftar Balita
              </button>
            )}
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
                {filteredBalita
                  .filter((b) =>
                    (b.nama || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((balita, idx) => {
                    const age = calculateAgeMonths(balita.tglLahir);
                    return (
                      <tr
                        key={`balita-row-${balita.id || idx}-${idx}`}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {balita.nama}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">
                            {balita.jk}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600">
                            {formatTgl(balita.tglLahir)}
                          </p>
                          <p className="text-[10px] text-pink-600 font-bold">
                            {age} Bulan
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-slate-600">
                            {balita.namaOrangTua}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Blok {balita.alamat} / RT {balita.rt}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
                              balita.statusStunting === "Normal"
                                ? "bg-green-50 text-green-600 border-green-100"
                                : balita.statusStunting === "Risiko Stunting"
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : "bg-red-50 text-red-600 border-red-100"
                            }`}
                          >
                            {balita.statusStunting}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedBalita(balita);
                                setActiveSubTab("timeline");
                              }}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="Lihat Detail (Timeline)"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => exportBalitaKardPDF(balita)}
                              className="p-1.5 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors border border-transparent hover:border-pink-100"
                              title="Download Kartu Kesehatan (PDF)"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {!isWarga && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingItem(balita);
                                    setShowBalitaForm(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteItem("balita", balita.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
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

      {activeSubTab === "timeline" && selectedBalita && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
                  {selectedBalita.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {selectedBalita.nama}
                  </h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                    {selectedBalita.jk} •{" "}
                    {calculateAgeMonths(selectedBalita.tglLahir)} Bulan •{" "}
                    {formatTgl(selectedBalita.tglLahir)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Anak dari: {selectedBalita.namaOrangTua}
                  </p>
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
                  onClick={() => setActiveSubTab("balita")}
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
                  <div className="w-20 h-20 bg-white/20  rounded-full flex items-center justify-center mb-4 border border-white/30">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 uppercase tracking-widest">
                    Digital Health Card
                  </h3>
                  <p className="text-sm text-pink-100 font-medium max-w-xs mb-8">
                    Kartu kesehatan digital ini berisi informasi lengkap
                    pertumbuhan dan riwayat imunisasi anak.
                  </p>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Status Gizi Saat Ini
                    </p>
                    <p className="text-2xl font-black">
                      {selectedBalita.statusStunting || "Normal"}
                    </p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedBalita.statusStunting === "Risiko Stunting" ? "bg-orange-500" : selectedBalita.statusStunting === "Stunting" ? "bg-red-500" : "bg-emerald-500"}`}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "ibuhamil_detail" && selectedIbuHamil && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-2xl font-black border-4 border-white shadow-sm">
                  {selectedIbuHamil.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {selectedIbuHamil.nama}
                  </h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">
                    NIK: {selectedIbuHamil.nik} •{" "}
                    {selectedIbuHamil.usiaKehamilan} Minggu
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">
                    HPL (Perkiraan): {formatTgl(selectedIbuHamil.tglHPL)}
                  </p>
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
                  onClick={() => setActiveSubTab("ibuhamil")}
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
                  <div className="w-20 h-20 bg-white/20  rounded-full flex items-center justify-center mb-4 border border-white/30">
                    <HeartPulse className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black mb-2 uppercase tracking-widest">
                    Pregnancy Health Card
                  </h3>
                  <p className="text-sm text-blue-100 font-medium max-w-xs mb-8">
                    Dokumen ringkasan kesehatan ibu hamil dan perkiraan
                    kelahiran (HPL) siap untuk dicetak.
                  </p>
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
                  <h4 className="text-lg font-black leading-tight mb-1">
                    Status Kehamilan
                  </h4>
                  <p className="text-xs font-bold text-pink-200 uppercase tracking-widest opacity-80 mb-6">
                    Trimester{" "}
                    {selectedIbuHamil.usiaKehamilan <= 12
                      ? "I"
                      : selectedIbuHamil.usiaKehamilan <= 24
                        ? "II"
                        : "III"}
                  </p>

                  <div className="w-full bg-pink-400/30 h-3 rounded-full mb-3">
                    <div
                      className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                      style={{
                        width: `${Math.min((selectedIbuHamil.usiaKehamilan / 42) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className="bg-white/20 px-2 py-0.5 rounded">
                      {selectedIbuHamil.usiaKehamilan} Minggu
                    </span>
                    <span className="opacity-60">Target: 42 Minggu</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200 text-white">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Catatan Riwayat
                  </p>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 font-medium leading-relaxed italic">
                    "
                    {selectedIbuHamil.riwayatKesehatan ||
                      "Belum ada catatan medis khusus."}
                    "
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "ibuhamil" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ibu hamil..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-pink-500 outline-none"
                />
              </div>
              {!isViewer && (
                <div className="flex gap-2 justify-center w-full sm:w-auto">
                  <input
                    type="file"
                    ref={fileInputRefIbuHamil}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportIbuHamilExcel}
                  />
                  <button
                    onClick={() => fileInputRefIbuHamil.current?.click()}
                    className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-blue-100 transition-all active:scale-90"
                    title="Impor Database (Excel/CSV)"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                  <button
                    onClick={exportIbuHamilPDF}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-pink hover:bg-pink-50 shadow-sm transition-all active:scale-90"
                    title="Export PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button
                    onClick={exportIbuHamilExcel}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-green hover:bg-green-50 shadow-sm transition-all active:scale-90"
                    title="Export Excel"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {!isViewer && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowIbuHamilForm(true);
                }}
                className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-brand-blue/90 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Daftar Ibu Hamil
              </button>
            )}
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
                {filteredIbuHamil
                  .filter((mil: any) =>
                    (mil.nama || "")
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((mil: any, idx: number) => (
                    <tr
                      key={`mil-row-${mil.id || idx}-${idx}`}
                      className="hover:bg-slate-50 transition-all group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          {mil.nama}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                          NIK: {mil.nik}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-black text-pink-600">
                          {mil.usiaKehamilan} Minggu
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        {formatTgl(mil.tglHPL)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">
                          {mil.riwayatKesehatan || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => {
                              setSelectedIbuHamil(mil);
                              setActiveSubTab("ibuhamil_detail");
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => exportIbuHamilKardPDF(mil)}
                            className="p-1.5 text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100 border border-pink-100 transition-colors"
                            title="Download Kartu Kesehatan (PDF)"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          {!isWarga && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingItem(mil);
                                  setShowIbuHamilForm(true);
                                }}
                                className="p-1.5 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-100 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteItem("ibu_hamil", mil.id)}
                                className="p-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-colors"
                                title="Hapus"
                              >
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

      {activeSubTab === "kegiatan" && (
        <div className="bg-white/80  rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight font-elegant">
                Jadwal & Agenda{" "}
                <span className="text-brand-pink">Kesehatan</span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={exportKegiatanPDF}
                  className="p-2 bg-white border border-slate-200 text-brand-pink rounded-xl hover:bg-pink-50 transition-all active:scale-90"
                  title="Export PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={exportKegiatanExcel}
                  className="p-2 bg-white border border-slate-200 text-brand-blue rounded-xl hover:bg-blue-50 transition-all active:scale-90"
                  title="Export Excel"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
              </div>
            </div>
            {!isWarga && !isViewer && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowKegiatanForm(true);
                }}
                className="px-6 py-3 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-100 hover:bg-pink-600 transition-all flex items-center gap-2 active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                Buat Agenda
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {posyanduKegiatanData
              .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
              .map((kgt) => (
                <div
                  key={kgt.id}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100">
                      <Calendar className="w-5 h-5" />
                    </div>
                    {!isWarga && !isViewer && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => {
                            setEditingItem(kgt);
                            setShowKegiatanForm(true);
                          }}
                          className="p-1 text-blue-600 hover:bg-white rounded border border-transparent hover:border-blue-100"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteItem("posyandu_kegiatan", kgt.id)}
                          className="p-1 text-red-600 hover:bg-white rounded border border-transparent hover:border-red-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-slate-800">
                    {formatTgl(kgt.tanggal)}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    {kgt.lokasi}
                  </p>
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <p className="text-[10px] text-slate-500 line-clamp-2">
                      {kgt.keterangan || "Tidak ada catatan tambahan."}
                    </p>
                    <p className="text-[9px] font-bold text-blue-600 uppercase">
                      Petugas: {kgt.kaderId?.split("@")[0]}
                    </p>
                  </div>
                </div>
              ))}
            {posyanduKegiatanData.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 italic">
                Belum ada agenda posyandu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH BALITA */}
      {showBalitaForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {editingItem ? "Edit Data Balita" : "Registrasi Balita Baru"}
              </h3>
              <button
                onClick={() => setShowBalitaForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveBalita}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Nama Lengkap Balita
                  </label>
                  <input
                    type="text"
                    name="nama"
                    required
                    defaultValue={editingItem?.nama}
                    placeholder="Masukkan nama Balita..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tgl Lahir
                  </label>
                  <input
                    type="date"
                    name="tglLahir"
                    required
                    defaultValue={editingItem?.tglLahir}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jk"
                    defaultValue={editingItem?.jk || "Laki-Laki"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Orang Tua (Pilih dari Data Warga)
                  </label>
                  <input
                    type="text"
                    name="orangTuaId"
                    list="wargaList"
                    required
                    defaultValue={editingItem?.orangTuaId}
                    placeholder="Ketik NIK atau Nama Orang Tua..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                  <datalist id="wargaList">
                    {wargaData.map((w: any, idx: number) => (
                      <option
                        key={`w-list-opt-${w.id || w.nik || idx}-${idx}`}
                        value={w.nik}
                      >
                        {w.nama} - RT {w.rt}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Status Stunting
                  </label>
                  <select
                    name="statusStunting"
                    defaultValue={editingItem?.statusStunting || "Normal"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none border-t-4 border-t-blue-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Risiko Stunting">Risiko Stunting</option>
                    <option value="Stunting">Stunting</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBalitaForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all"
                >
                  {editingItem ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH PEMERIKSAAN */}
      {showPemeriksaanForm && selectedBalita && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-600" />
                Pemeriksaan: {selectedBalita.nama}
              </h3>
              <button
                onClick={() => setShowPemeriksaanForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSavePemeriksaan}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tanggal Periksa
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="beratBadan"
                    required
                    placeholder="0.0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="tinggiBadan"
                    required
                    placeholder="0.0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Catatan Tambahan
                  </label>
                  <textarea
                    name="catatan"
                    rows={2}
                    placeholder="Kondisi kesehatan balita saat ini..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPemeriksaanForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Simpan Hasil
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH IMUNISASI */}
      {showImunisasiForm && selectedBalita && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-green-600" />
                Catat Imunisasi: {selectedBalita.nama}
              </h3>
              <button
                onClick={() => setShowImunisasiForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveImunisasi}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Jenis Imunisasi
                  </label>
                  <select
                    name="jenisImunisasi"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-green-500"
                  >
                    <option value="Hepatitis B-0">
                      Hepatitis B-0 (0-24 Jam)
                    </option>
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tanggal Pemberian
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowImunisasiForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                  {editingItem ? "Simpan Perubahan" : "Simpan Data"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH KEGIATAN */}
      {showKegiatanForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
              <h3 className="font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                {editingItem
                  ? "Edit Jadwal Kesehatan Warga"
                  : "Buat Jadwal Kesehatan Warga"}
              </h3>
              <button
                onClick={() => setShowKegiatanForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveKegiatan}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={
                      editingItem?.tanggal ||
                      new Date().toISOString().split("T")[0]
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Lokasi Kegiatan
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    required
                    defaultValue={
                      editingItem?.lokasi || "Kesehatan Warga RT 01"
                    }
                    placeholder="Cth: Balai Warga RT 01..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Keterangan / Agenda
                  </label>
                  <textarea
                    name="keterangan"
                    rows={3}
                    defaultValue={editingItem?.keterangan}
                    placeholder="Cth: Penimbangan rutin dan imunisasi campak..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowKegiatanForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
                >
                  Simpan Agenda
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL: REGISTER IBU HAMIL */}
      {showIbuHamilForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
              <h3 className="font-bold">
                {editingItem ? "Edit Data Ibu Hamil" : "Register Ibu Hamil"}
              </h3>
              <button
                onClick={() => setShowIbuHamilForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveIbuHamil}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Pilih dari Data Warga (NIK / Nama)
                  </label>
                  <input
                    type="text"
                    name="nik"
                    list="wargaList"
                    required
                    defaultValue={editingItem?.nik}
                    placeholder="Ketik NIK atau Nama..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    HPL (Perkiraan Lahir)
                  </label>
                  <input
                    type="date"
                    name="tglHPL"
                    required
                    defaultValue={editingItem?.tglHPL}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Usia Kehamilan (Minggu)
                  </label>
                  <input
                    type="number"
                    name="usiaKehamilan"
                    defaultValue={editingItem?.usiaKehamilan || 8}
                    min="1"
                    max="42"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Riwayat Kesehatan / Catatan
                  </label>
                  <textarea
                    name="riwayatKesehatan"
                    rows={3}
                    defaultValue={editingItem?.riwayatKesehatan}
                    placeholder="Cth: Hipertensi, Alergi obat tertentu..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowIbuHamilForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all active:scale-95"
                >
                  {editingItem ? "Simpan Perubahan" : "Simpan Data"}
                </button>
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
  showNotification,
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "setoran"
    | "tarik"
    | "nasabah"
    | "kategori"
    | "nasabah_detail"
  >("dashboard");
  const [showKategoriForm, setShowKategoriForm] = useState(false);
  const [showSetoranForm, setShowSetoranForm] = useState(false);
  const [showTarikForm, setShowTarikForm] = useState(false);
  const [showNasabahForm, setShowNasabahForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedNasabahId, setSelectedNasabahId] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let successCount = 0;
        for (const row of data as any[]) {
          // Expecting columns matching common pattern: NIK, Nama, Total/Nominal, Tanggal
          const nik = row.NIK || row.nik;
          const total = parseFloat(
            row.Total || row.total || row.Setoran || row.setoran || 0,
          );

          if (nik && total > 0) {
            const id = `STR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            await setDoc(doc(db, "sampah_setoran", id), {
              tenantId,
              id,
              nasabahId: String(nik),
              namaKategori: row.Kategori || row.kategori || "Impor Masal",
              berat: parseFloat(row.Berat || row.berat || 0),
              total: total,
              tanggal:
                row.Tanggal ||
                row.tanggal ||
                new Date().toISOString().split("T")[0],
              petugas: currentUser?.email?.split("@")[0] || "Admin",
            });
            successCount++;
          }
        }

        if (successCount > 0) {
          showNotification(
            `Berhasil mengimpor ${successCount} data transaksi!`,
            "success",
          );
        } else {
          showNotification(
            "Tidak ada data valid yang ditemukan untuk diimpor.",
            "info",
          );
        }
        // Reset input
        e.target.value = "";
      } catch (error) {
        console.error(error);
        showNotification(
          "Gagal memproses file Excel. Pastikan format benar.",
          "error",
        );
      }
    };
    reader.readAsBinaryString(file);
  };

  const roleUpper = currentUser?.role?.toUpperCase() || "";
  const canEdit = !["VIEWER", "WARGA", "TAMU"].includes(roleUpper);
  const isWarga = roleUpper === "WARGA";

  const filteredSampahSetoran = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (sampahSetoranData || []).filter((s: any) => s.nasabahId === currentUser.nik);
    }
    return sampahSetoranData || [];
  }, [sampahSetoranData, isWarga, currentUser?.nik]);

  const filteredSampahTarikSaldo = useMemo(() => {
    if (isWarga && currentUser?.nik) {
      return (sampahTarikSaldoData || []).filter((t: any) => t.nasabahId === currentUser.nik);
    }
    return sampahTarikSaldoData || [];
  }, [sampahTarikSaldoData, isWarga, currentUser?.nik]);

  // Nasabah Summary (Warga with their balances)
  const nasabahSummary = useMemo(() => {
    let summary = wargaData
      .map((w: any) => {
        const setoran = sampahSetoranData
          .filter((s: any) => s.nasabahId === w.nik)
          .reduce(
            (acc: number, curr: any) => acc + (parseFloat(curr.total) || 0),
            0,
          );
        const tarikan = sampahTarikSaldoData
          .filter((t: any) => t.nasabahId === w.nik)
          .reduce(
            (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
            0,
          );
        return {
          ...w,
          saldo: setoran - tarikan,
          totalSetoran: setoran,
        };
      })
      .filter(
        (n: any) => n.totalSetoran > 0 || n.saldo > 0 || n.isNasabah === true,
      );
      
    if (isWarga && currentUser?.nik) {
      summary = summary.filter((n: any) => n.nik === currentUser.nik);
    }
    return summary;
  }, [wargaData, sampahSetoranData, sampahTarikSaldoData, isWarga, currentUser?.nik]);

  // Auto-select self as nasabah for WARGA
  useEffect(() => {
    if (isWarga && currentUser?.nik && activeSubTab === "dashboard") {
      // Find matching nasabah by NIK
      const match = nasabahSummary.find((n: any) => n.nik === currentUser.nik || n.email === currentUser.email);
      if (match) {
        setSelectedNasabahId(match.nik);
      }
    }
  }, [isWarga, currentUser?.nik, currentUser?.email, nasabahSummary, activeSubTab]);

  // Statistics
  const stats = useMemo(() => {
    const activeSetoran = isWarga ? filteredSampahSetoran : sampahSetoranData;
    const activeTarikan = isWarga ? filteredSampahTarikSaldo : sampahTarikSaldoData;

    return {
      totalSampah: activeSetoran.reduce(
        (acc: number, curr: any) => acc + (parseFloat(curr.berat) || 0),
        0,
      ),
      totalTabungan:
        activeSetoran.reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.total) || 0),
          0,
        ) -
        activeTarikan.reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        ),
      transaksiBulanIni: activeSetoran.filter((s: any) =>
        s.tanggal?.startsWith(new Date().toISOString().slice(0, 7)),
      ).length,
      nasabahAktif: new Set(activeSetoran.map((s: any) => s.nasabahId)).size,
    };
  }, [sampahSetoranData, sampahTarikSaldoData, filteredSampahSetoran, filteredSampahTarikSaldo, isWarga]);

  const selectedNasabah = selectedNasabahId
    ? nasabahSummary.find((n: any) => n.nik === selectedNasabahId)
    : null;

  const handleSaveKategori = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      tenantId,
      id: editingItem?.id || `KAT-${Date.now()}`,
      nama: formData.get("nama"),
      satuan: formData.get("satuan"),
      hargaBeli: parseFloat(formData.get("hargaBeli") as string),
    };

    try {
      await setDoc(doc(db, "sampah_kategori", data.id), data);
      showNotification(`Kategori ${data.nama} berhasil disimpan`);
      setShowKategoriForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_kategori");
    }
  };

  const handleSaveSetoran = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const katId = formData.get("kategoriId") as string;
    const kategori = sampahKategoriData.find((k: any) => k.id === katId);
    const nasabahId = formData.get("nasabahId") as string;
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);

    const berat = parseFloat(formData.get("berat") as string);
    const harga = kategori?.hargaBeli || 0;
    const total = berat * harga;

    const data = {
      tenantId,
      id: editingItem?.id || `STR-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || "Unknown",
      kategoriId: katId,
      namaKategori: kategori?.nama || "Unknown",
      berat,
      harga,
      total,
      tanggal: formData.get("tanggal"),
      status: "Selesai",
      keterangan: formData.get("keterangan"),
    };

    try {
      await setDoc(doc(db, "sampah_setoran", data.id), data);
      showNotification(
        `Setoran senilai Rp${total.toLocaleString()} berhasil dicatat`,
      );
      setShowSetoranForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_setoran");
    }
  };

  const handleSaveTarik = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nasabahId =
      editingItem?.nasabahId || (formData.get("nasabahId") as string);
    const nasabah = wargaData.find((w: any) => w.nik === nasabahId);
    const nominal = parseFloat(formData.get("nominal") as string);

    const data = {
      tenantId,
      id: editingItem?.id || `TRK-${Date.now()}`,
      nasabahId,
      namaNasabah: nasabah?.nama || "Unknown",
      nominal,
      tanggal: formData.get("tanggal"),
      keterangan: formData.get("keterangan"),
    };

    try {
      if (editingItem) {
        await updateDoc(doc(db, "sampah_tarik_saldo", editingItem.id), data);
        showNotification(`Penarikan berhasil diperbarui`);
      } else {
        await setDoc(doc(db, "sampah_tarik_saldo", data.id), data);
        showNotification(
          `Penarikan Rp${nominal.toLocaleString()} berhasil dicatat`,
        );
      }
      setShowTarikForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(err, "create", "sampah_tarik_saldo");
    }
  };

  const handleSaveNasabah = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inik = formData.get("nik") as string;
    const inama = formData.get("nama") as string;
    const irt = formData.get("rt") as string;
    const irw = formData.get("rw") as string;

    if (!inik || !inama) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, "warga", editingItem.nik), {
          nama: inama,
          rt: irt,
          rw: irw,
          isNasabah: true,
        });
        showNotification("Data nasabah (warga) berhasil diperbarui");
      } else {
        const newWarga = {
          tenantId,
          nik: inik,
          nama: inama,
          rt: irt,
          rw: irw,
          blok: "",
          kelurahan: "",
          kecamatan: "",
          kota_kab: "",
          status: "Warga Tetap",
          hp: "",
          email: "",
          foto: "",
          ktpUrl: "",
          posisi: "",
          profesi: "",
          pendidikanTerakhir: "",
          jk: "Laki-Laki",
          tglLahir: "",
          tempatLahir: "",
          kawin: "Belum Kawin",
          kewarganegaraan: "WNI",
          isNasabah: true,
        };
        await setDoc(doc(db, "data_warga", inik), newWarga);
        showNotification("Nasabah (Warga) baru berhasil ditambahkan!");
      }
      setShowNasabahForm(false);
      setEditingItem(null);
    } catch (err) {
      handleFirestoreError(
        err,
        editingItem ? "update" : "create",
        "data_warga",
      );
    }
  };

  const deleteItemsByNasabah = async (nik: string) => {
    setConfirmConfig({
      title: "Hapus Semua Transaksi",
      message: `Yakin ingin menghapus SEMUA riwayat transaksi (Setoran & Penarikan) untuk nasabah dengan NIK ${nik}? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        try {
          const setoranToDelete = sampahSetoranData.filter(
            (s: any) => s.nasabahId === nik,
          );
          const tarikToDelete = sampahTarikSaldoData.filter(
            (t: any) => t.nasabahId === nik,
          );

          for (const s of setoranToDelete) {
            await deleteDoc(doc(db, "sampah_setoran", s.id));
          }
          for (const t of tarikToDelete) {
            await deleteDoc(doc(db, "sampah_tarik_saldo", t.id));
          }

          showNotification(`Semua riwayat transaksi nasabah berhasil dihapus.`);
        } catch (err) {
          handleFirestoreError(err, "delete", "bank_sampah_mass");
        }
        setConfirmConfig(null);
      },
    });
  };

  const deleteItem = async (collectionName: string, id: string) => {
    setConfirmConfig({
      title: "Hapus Data",
      message:
        "Apakah Anda yakin ingin menghapus data ini? Data yang dihapus tidak dapat dikembalikan.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, collectionName, id));
          showNotification("Data berhasil dihapus");
        } catch (err) {
          handleFirestoreError(err, "delete", collectionName);
        }
        setConfirmConfig(null);
      },
    });
  };

  const exportAllSetoranExcel = () => {
    const data = sampahSetoranData.map((s) => ({
      Nasabah: s.namaNasabah,
      Kategori: s.namaKategori,
      "Berat (kg)": s.berat,
      Harga: s.harga,
      Total: s.total,
      Tanggal: s.tanggal,
      Keterangan: s.keterangan || "-",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Setoran Bank Sampah");
    XLSX.writeFile(
      wb,
      `Setoran_Sampah_All_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Excel Berhasil!");
  };

  const exportAllSetoranPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("LAPORAN SETORAN BANK SAMPAH", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = sampahSetoranData.map((s: any) => [
      s.namaNasabah,
      s.namaKategori,
      s.berat + " kg",
      "Rp " + s.total.toLocaleString(),
      s.tanggal,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["Nasabah", "Kategori", "Berat", "Total", "Tanggal"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    doc.save(
      `Laporan_Setoran_Sampah_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification("Eksport PDF Berhasil!");
  };

  const exportBukuTabunganPDF = (nasabah: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("BUKU TABUNGAN BANK SAMPAH", 14, 22);

    doc.setFontSize(12);
    doc.text(`Nama Nasabah: ${nasabah.nama}`, 14, 32);
    doc.text(`NIK: ${nasabah.nik}`, 14, 38);
    doc.text(`Blok/RT: ${nasabah.blok} / ${nasabah.rt}`, 14, 44);

    const transactions = [
      ...sampahSetoranData
        .filter((s: any) => s.nasabahId === nasabah.nik)
        .map((s) => ({ ...s, type: "Setoran", amount: s.total })),
      ...sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === nasabah.nik)
        .map((t) => ({ ...t, type: "Penarikan", amount: -t.nominal })),
    ].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
    );

    let currentSaldo = 0;
    const tableData = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return [
        t.tanggal,
        t.type,
        t.type === "Setoran" ? t.namaKategori : "-",
        t.type === "Setoran" ? t.berat + " kg" : "-",
        t.amount > 0 ? "Rp " + t.amount.toLocaleString() : "-",
        t.amount < 0 ? "Rp " + Math.abs(t.amount).toLocaleString() : "-",
        "Rp " + currentSaldo.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: 55,
      head: [["Tanggal", "Jenis", "Item", "Berat", "Masuk", "Keluar", "Saldo"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    doc.save(
      `Buku_Tabungan_${nasabah.nama}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification(`Buku Tabungan ${nasabah.nama} berhasil diunduh!`);
  };

  const exportBukuTabunganExcel = (nasabah: any) => {
    const transactions = [
      ...sampahSetoranData
        .filter((s: any) => s.nasabahId === nasabah.nik)
        .map((s) => ({ ...s, type: "Setoran", amount: s.total })),
      ...sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === nasabah.nik)
        .map((t) => ({ ...t, type: "Penarikan", amount: -t.nominal })),
    ].sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime(),
    );

    let currentSaldo = 0;
    const data = transactions.map((t: any) => {
      currentSaldo += t.amount;
      return {
        Tanggal: t.tanggal,
        Jenis: t.type,
        Item: t.type === "Setoran" ? t.namaKategori : "-",
        Berat: t.type === "Setoran" ? t.berat : 0,
        Masuk: t.amount > 0 ? t.amount : 0,
        Keluar: t.amount < 0 ? Math.abs(t.amount) : 0,
        Saldo: currentSaldo,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Buku Tabungan");
    XLSX.writeFile(
      wb,
      `Tabungan_${nasabah.nama}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Excel Tabungan Berhasil!");
  };

  const exportNasabahSummaryExcel = () => {
    const data = nasabahSummary.map((n) => {
      const totalDitarik = sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === n.nik)
        .reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        );
      return {
        "Nama Nasabah": n.nama,
        NIK: n.nik,
        "Total Tabungan": n.totalSetoran,
        "Telah Ditarik": totalDitarik,
        "Saldo Saat Ini": n.saldo,
        Alamat: `Blok ${n.blok} / RT ${n.rt}`,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan Nasabah");
    XLSX.writeFile(
      wb,
      `Ringkasan_Nasabah_Sampah_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    showNotification("Eksport Ringkasan Nasabah Excel Berhasil!");
  };

  const exportNasabahSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("RINGKASAN SALDO NASABAH BANK SAMPAH", 14, 22);
    doc.setFontSize(10);
    doc.text(`Tenant: ${tenantId}`, 14, 30);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = nasabahSummary.map((n: any) => {
      const totalDitarik = sampahTarikSaldoData
        .filter((t: any) => t.nasabahId === n.nik)
        .reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.nominal) || 0),
          0,
        );
      return [
        n.nama,
        n.nik,
        "Rp " + n.totalSetoran.toLocaleString(),
        "Rp " + totalDitarik.toLocaleString(),
        "Rp " + n.saldo.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [
        ["Nama Nasabah", "NIK", "Total Tabungan", "Tarik Saldo", "Saldo Sisa"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    doc.save(
      `Ringkasan_Nasabah_Sampah_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification("Eksport Ringkasan Nasabah PDF Berhasil!");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Recycle className="w-8 h-8 text-emerald-600" />
            Bank Sampah
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Ubah sampah menjadi tabungan bermanfaat
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {([
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "setoran", label: "Setoran", icon: PlusCircle },
            { id: "tarik", label: "Tarik Saldo", icon: HandCoins },
            { id: "nasabah", label: "Nasabah", icon: Users },
            {
              id: "kategori",
              label: "Kategori",
              icon: Settings,
              adminOnly: true,
            },
          ] as { id: typeof activeSubTab; label: string; icon: any; adminOnly?: boolean }[])
            .filter((tab) => !tab.adminOnly || canEdit)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSubTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
        </div>
      </div>

      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-emerald-300/50">
              <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <Recycle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Total Sampah
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {stats.totalSampah.toFixed(1)}{" "}
                <span className="text-sm font-bold text-slate-400">kg</span>
              </p>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-blue-300/50">
              <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Total Tabungan
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                Rp {stats.totalTabungan.toLocaleString()}
              </p>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-orange-300/50">
              <div className="w-12 h-12 bg-orange-500/10 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Setoran Bulan Ini
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {stats.transaksiBulanIni}
              </p>
            </div>
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-purple-300/50">
              <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                Nasabah Aktif
              </p>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {stats.nasabahAktif}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
              <div className="px-2 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <History className="w-4 h-4 text-emerald-600" />
                  Setoran Terakhir
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Nasabah</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4 text-right">Berat</th>
                      <th className="px-6 py-4 text-right">Total</th>
                      <th className="px-6 py-4">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {sampahSetoranData
                      .slice(0, 5)
                      .map((item: any, idx: number) => (
                        <tr
                          key={`sampah-item-${item.id || idx}-${idx}`}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-black">
                            {item.namaNasabah}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-black uppercase tracking-tight">
                              {item.namaKategori}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400 font-black">
                            {item.berat} kg
                          </td>
                          <td className="px-6 py-4 text-right font-black">
                            Rp {item.total.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-[11px] font-bold">
                            {item.tanggal}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price List Card */}
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-500/5 dark:bg-emerald-500/10">
                <h3 className="font-black text-emerald-800 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-tight text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Harga Hari Ini
                </h3>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[300px]">
                {sampahKategoriData.map((kat: any) => (
                  <div
                    key={kat.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        {kat.nama}
                      </p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                        {kat.hargaBeli.toLocaleString()} / {kat.satuan}
                      </p>
                    </div>
                    <p className="text-emerald-600 font-black">
                      Rp {kat.hargaBeli.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "setoran" && (
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
              <StyledButton
                label="Catat Setoran"
                onClick={() => setShowSetoranForm(true)}
                colorType="success"
                icon={<PlusCircle className="w-4 h-4" />}
              />
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
                {filteredSampahSetoran
                  .filter((s: any) =>
                    s.namaNasabah
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((item: any, idx: number) => (
                    <tr
                      key={`sampah-setoran-row-${item.id || idx}-${idx}`}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.namaNasabah}
                      </td>
                      <td className="px-6 py-4">{item.namaKategori}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        {item.berat} kg
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400">
                        Rp {item.harga.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-emerald-600">
                        Rp {item.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const n = nasabahSummary.find(
                                (nas: any) => nas.nik === item.nasabahId,
                              );
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              } else {
                                showNotification(
                                  "Data nasabah tidak ditemukan",
                                  "error",
                                );
                              }
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowSetoranForm(true);
                                }}
                                className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("sampah_setoran", item.id)
                                }
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                title="Hapus Transaksi"
                              >
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

      {activeSubTab === "tarik" && (
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
              <StyledButton
                label="Tarik Saldo"
                onClick={() => setShowTarikForm(true)}
                colorType="primary"
                icon={<HandCoins className="w-4 h-4" />}
              />
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
                {filteredSampahTarikSaldo
                  .filter((t: any) =>
                    t.namaNasabah
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                  )
                  .map((item: any, idx: number) => (
                    <tr
                      key={`sampah-tarik-row-${item.id || idx}-${idx}`}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {item.namaNasabah}
                      </td>
                      <td className="px-6 py-4 text-right font-black text-blue-600">
                        Rp {item.nominal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs italic">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const n = nasabahSummary.find(
                                (nas: any) => nas.nik === item.nasabahId,
                              );
                              if (n) {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              } else {
                                showNotification(
                                  "Data nasabah tidak ditemukan",
                                  "error",
                                );
                              }
                            }}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowTarikForm(true);
                                }}
                                className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteItem("sampah_tarik_saldo", item.id)
                                }
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                title="Hapus Penarikan"
                              >
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

      {activeSubTab === "nasabah_detail" && selectedNasabah && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl font-black border-4 border-white shadow-sm uppercase">
                  {selectedNasabah.nama.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {selectedNasabah.nama}
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Nasabah ID: {selectedNasabah.nik}
                  </p>
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
                  onClick={() => setActiveSubTab("nasabah")}
                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
              <div className="md:col-span-1 space-y-4">
                <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-xl shadow-emerald-100">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                    Saldo Saat Ini
                  </p>
                  <p className="text-2xl font-black">
                    Rp {selectedNasabah.saldo.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Statistik Nasabah
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Setoran</span>
                      <span className="font-bold text-emerald-600">
                        Rp {selectedNasabah.totalSetoran.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Tarik</span>
                      <span className="font-bold text-red-600">
                        Rp{" "}
                        {(
                          selectedNasabah.totalSetoran - selectedNasabah.saldo
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-3">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  Transaksi
                </h3>
                <div className="space-y-3">
                  {[
                    ...sampahSetoranData
                      .filter((s: any) => s.nasabahId === selectedNasabah.nik)
                      .map((s) => ({ ...s, type: "setoran" })),
                    ...sampahTarikSaldoData
                      .filter((t: any) => t.nasabahId === selectedNasabah.nik)
                      .map((t) => ({ ...t, type: "tarik" })),
                  ]
                    .sort(
                      (a, b) =>
                        new Date(b.tanggal).getTime() -
                        new Date(a.tanggal).getTime(),
                    )
                    .map((item: any, idx) => (
                      <div
                        key={`sampah-detail-hist-${item.id || idx}-${item.type}`}
                        className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 rounded-lg ${item.type === "setoran" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                          >
                            {item.type === "setoran" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <HandCoins className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {item.type === "setoran"
                                ? `Setoran: ${item.namaKategori}`
                                : "Penarikan Saldo"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.tanggal}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`text-sm font-black ${item.type === "setoran" ? "text-emerald-600" : "text-red-500"}`}
                        >
                          {item.type === "setoran" ? "+" : "-"} Rp{" "}
                          {(item.total || item.nominal || 0).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  {selectedNasabah.totalSetoran === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8 italic font-medium">
                      Belum ada transaksi.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "nasabah" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800">{isWarga ? "Pendaftaran Nasabah" : "Daftar Nasabah & Saldo"}</h3>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!isWarga && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nasabah..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 ring-emerald-500/20"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                {!isWarga && (
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                  />
                )}
                {!isWarga && (
                  <StyledButton
                    label="Nasabah"
                    onClick={() => {
                      setEditingItem(null);
                      setShowNasabahForm(true);
                    }}
                    colorType="success"
                    icon={<PlusCircle className="w-4 h-4" />}
                  />
                )}
                {isWarga && nasabahSummary.length === 0 && (
                  <StyledButton
                    label="Daftar Jadi Nasabah"
                    onClick={() => {
                      setEditingItem(null);
                      setShowNasabahForm(true);
                    }}
                    colorType="success"
                    icon={<PlusCircle className="w-4 h-4" />}
                  />
                )}
                {!isWarga && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-100 transition-all active:scale-95"
                      title="Impor Database (Excel/CSV)"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      onClick={exportNasabahSummaryPDF}
                      className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100"
                      title="Export PDF Semua Nasabah"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={exportNasabahSummaryExcel}
                      className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100"
                      title="Export Excel Semua Nasabah"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </>
                )}
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
                  <th className="px-6 py-3 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium whitespace-nowrap">
                {nasabahSummary
                  .filter(
                    (n: any) =>
                      n.nama
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      n.nik?.includes(searchQuery),
                  )
                  .map((n: any, idx: number) => {
                    const totalDitarik = sampahTarikSaldoData
                      .filter((t: any) => t.nasabahId === n.nik)
                      .reduce(
                        (acc: number, curr: any) =>
                          acc + (parseFloat(curr.nominal) || 0),
                        0,
                      );
                    return (
                      <tr
                        key={`nasabah-row-${n.nik || idx}-${idx}`}
                        className="hover:bg-slate-50 group"
                      >
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {n.nama}
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {n.nik}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-600">
                          Rp {n.totalSetoran.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-orange-600">
                          Rp {totalDitarik.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-3 py-1.5 rounded-lg font-black ${n.saldo > 0 ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}
                          >
                            Rp {n.saldo.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1.5 transition-all">
                            <button
                              onClick={() => {
                                setSelectedNasabahId(n.nik);
                                setActiveSubTab("nasabah_detail");
                              }}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canEdit && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingItem(n);
                                    setShowNasabahForm(true);
                                  }}
                                  className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                                  title="Edit Nasabah"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteItemsByNasabah(n.nik)}
                                  className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                                  title="Hapus Semua Riwayat"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
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

      {activeSubTab === "kategori" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">
              Kategori Sampah & Harga
            </h3>
            {canEdit && (
              <StyledButton
                label="Tambah Kategori"
                onClick={() => setShowKategoriForm(true)}
                colorType="success"
                icon={<PlusCircle className="w-4 h-4" />}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {sampahKategoriData.map((kat: any) => (
              <div
                key={kat.id}
                className="p-5 rounded-2xl border border-slate-100 bg-slate-50 group transition-all hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                    <Recycle className="w-5 h-5 text-emerald-600" />
                  </div>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(kat);
                          setShowKategoriForm(true);
                        }}
                        className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem("sampah_kategori", kat.id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">
                  {kat.nama}
                </h4>
                <p className="text-emerald-600 font-black text-xl">
                  Rp {kat.hargaBeli.toLocaleString()}
                  <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">
                    per {kat.satuan}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      {showKategoriForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {editingItem ? "Edit Kategori" : "Tambah Kategori Sampah"}
              </h3>
              <button
                onClick={() => {
                  setShowKategoriForm(false);
                  setEditingItem(null);
                }}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveKategori}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editingItem?.nama}
                  placeholder="Cth: Botol Plastik, Kardus, dll"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Satuan
                  </label>
                  <select
                    name="satuan"
                    defaultValue={editingItem?.satuan || "kg"}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Harga Beli (Rp)
                  </label>
                  <input
                    type="number"
                    name="hargaBeli"
                    required
                    defaultValue={editingItem?.hargaBeli}
                    placeholder="Cth: 2500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <StyledButton
                  label="Batal"
                  onClick={() => {
                    setShowKategoriForm(false);
                    setEditingItem(null);
                  }}
                  colorType="secondary"
                  className="flex-1"
                />
                <StyledButton
                  label="Simpan Kategori"
                  onClick={() => {}}
                  type="submit"
                  colorType="success"
                  className="flex-1"
                />
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showSetoranForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden my-auto"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-600" /> Catat Setoran
                Baru
              </span>
              <button
                onClick={() => setShowSetoranForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveSetoran}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Pilih Nasabah (Warga)
                  </label>
                  <select
                    name="nasabahId"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Nasabah --</option>
                    {wargaData.map((w: any, idx: number) => (
                      <option
                        key={`nasabah-opt-${w.id || w.nik || idx}-${idx}`}
                        value={w.nik}
                      >
                        {w.nama} ({w.blok})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Kategori Sampah
                  </label>
                  <select
                    name="kategoriId"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {sampahKategoriData.map((k: any, idx: number) => (
                      <option
                        key={`cat-sampah-${k.id || idx}-${idx}`}
                        value={k.id}
                      >
                        {k.nama} (Rp {k.hargaBeli}/{k.satuan})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Berat / Jumlah
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    name="berat"
                    required
                    placeholder="Cth: 2.5"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="col-span-full">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    Keterangan Tambahan
                  </label>
                  <textarea
                    name="keterangan"
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                    placeholder="Opsional..."
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <StyledButton
                  label="Batal"
                  onClick={() => setShowSetoranForm(false)}
                  colorType="secondary"
                  className="flex-1"
                />
                <StyledButton
                  label="Simpan Setoran"
                  onClick={() => {}}
                  type="submit"
                  colorType="success"
                  className="flex-1"
                />
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showTarikForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-blue-600" />{" "}
                {editingItem ? "Edit Tarik Saldo" : "Tarik Saldo Nasabah"}
              </span>
              <button
                onClick={() => {
                  setShowTarikForm(false);
                  setEditingItem(null);
                }}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveTarik}>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Pilih Nasabah (Aktif)
                </label>
                <select
                  name="nasabahId"
                  required
                  defaultValue={editingItem?.nasabahId}
                  disabled={!!editingItem}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">-- Pilih Nasabah --</option>
                  {nasabahSummary
                    .filter(
                      (n: any) =>
                        n.saldo > 0 ||
                        (editingItem && editingItem.nasabahId === n.nik),
                    )
                    .map((n: any, idx: number) => (
                      <option
                        key={`tarik-nasabah-${n.nik || idx}-${idx}`}
                        value={n.nik}
                      >
                        {n.nama} (Saldo: Rp {n.saldo.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nominal yang Ditarik (Rp)
                </label>
                <input
                  type="number"
                  name="nominal"
                  required
                  defaultValue={editingItem?.nominal}
                  placeholder="Cth: 50000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={
                    editingItem?.tanggal ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Keterangan
                </label>
                <textarea
                  name="keterangan"
                  rows={2}
                  defaultValue={editingItem?.keterangan}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-500"
                  placeholder="Contoh: Keperluan harian..."
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTarikForm(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transform active:scale-95 transition-all"
                >
                  {editingItem ? "Simpan Perubahan" : "Konfirmasi Tarik"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showNasabahForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800 font-bold uppercase text-[10px] tracking-widest">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />{" "}
                {editingItem
                  ? "Edit Data Nasabah (Warga)"
                  : "Tambah Nasabah (Warga)"}
              </span>
              <button
                onClick={() => setShowNasabahForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveNasabah}>
              <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mb-4 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Data nasabah ini terhubung dengan data Warga.{" "}
                  {editingItem ? "Mengedit" : "Menambahkan"} nama di sini akan
                  ikut {editingItem ? "mengubah" : "menambahkan"} data warga
                  tersebut.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  NIK {editingItem ? "(Hanya Baca)" : ""}
                </label>
                <input
                  type="text"
                  name="nik"
                  required
                  defaultValue={editingItem?.nik}
                  readOnly={!!editingItem}
                  placeholder="Masukkan 16 digit NIK..."
                  minLength={16}
                  maxLength={16}
                  className={`w-full px-4 py-2.5 ${editingItem ? "bg-slate-100 cursor-not-allowed text-slate-500" : "bg-slate-50 focus:bg-white"} border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-emerald-500`}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  defaultValue={editingItem?.nama}
                  list="wargaListNasabah"
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const warga = wargaData.find(
                      (w: any) => w.nama === selectedName,
                    );
                    if (warga) {
                      const form = e.target.closest("form");
                      if (form) {
                        if (!editingItem)
                          (
                            form.elements.namedItem("nik") as HTMLInputElement
                          ).value = warga.nik;
                        (
                          form.elements.namedItem("rt") as HTMLInputElement
                        ).value = warga.rt || "01";
                        (
                          form.elements.namedItem("rw") as HTMLInputElement
                        ).value = warga.rw || "26";
                      }
                    }
                  }}
                  placeholder="Masukkan Nama Lengkap"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                />
                <datalist id="wargaListNasabah">
                  {wargaData.map((w: any, idx: number) => (
                    <option
                      key={`nasabah-list-${w.id || w.nik || idx}-${idx}`}
                      value={w.nama}
                    />
                  ))}
                </datalist>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    RT
                  </label>
                  <input
                    type="text"
                    name="rt"
                    required
                    defaultValue={editingItem?.rt || "01"}
                    placeholder="01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                    RW
                  </label>
                  <input
                    type="text"
                    name="rw"
                    required
                    defaultValue={editingItem?.rw || "26"}
                    placeholder="26"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNasabahForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transform active:scale-95 transition-all"
                >
                  {editingItem ? "Simpan Perubahan" : "Tambah Nasabah"}
                </button>
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

function InventarisView({
  inventarisData,
  setInventarisData,
  inventarisLogs,
  setInventarisLogs,
  inventarisKategori,
  inventarisLokasi,
  inventarisSupplier,
  userRole,
  currentUser,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
  handleFileUpload,
}: any) {
  const roleUpperGlobal = currentUser?.role?.toUpperCase() || "";
  const isViewer = ["WARGA", "VIEWER", "TAMU"].includes(roleUpperGlobal);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLogHistory, setShowLogHistory] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // States untuk form transaksi dinamis
  const [txType, setTxType] = useState("Barang Masuk");
  const [txJumlah, setTxJumlah] = useState(1);
  const [txHarga, setTxHarga] = useState(0);
  const [txStokFisik, setTxStokFisik] = useState(0);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const canEdit = useMemo(() => {
    if (!userRole) return false;
    const roleUpper = userRole.toUpperCase();
    return (
      roleUpper === "ADMIN" ||
      roleUpper === "RW" ||
      roleUpper === "RT" ||
      roleUpper === "BENDAHARA" ||
      roleUpper === "SEKRETARIS" ||
      currentUser?.isSuperAdmin
    );
  }, [userRole, currentUser?.isSuperAdmin]);

  const filteredData = inventarisData.filter(
    (item: any) =>
      item.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kategori?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit) return;

    const formData = new FormData(e.currentTarget);
    const itemId = editingItem ? editingItem.id : `INV-BRG-${Date.now()}`;
    const fotoFile = (
      e.currentTarget.elements.namedItem("foto_aset") as HTMLInputElement
    )?.files?.[0];

    setIsLoadingDB(true);
    setUploading(true);

    try {
      let fotoUrl = editingItem?.foto_url || "";
      if (fotoFile && handleFileUpload) {
        fotoUrl = await handleFileUpload(fotoFile, "inventaris", (pct) =>
          setUploadPct(pct),
        );
      }

      const itemData = {
        id: itemId,
        nama_barang: formData.get("nama_barang") as string,
        kategori: formData.get("kategori") as string,
        satuan: formData.get("satuan") as string,
        merk: formData.get("merk") as string,
        spesifikasi: formData.get("spesifikasi") as string,
        stok: parseInt(formData.get("stok") as string) || 0,
        minimum_stok: parseInt(formData.get("minimum_stok") as string) || 0,
        status: formData.get("status") as string,
        lokasi: formData.get("lokasi") as string,
        supplier: formData.get("supplier") as string,
        tanggal_perolehan: formData.get("tanggal_perolehan") as string,
        harga_perolehan:
          parseInt(formData.get("harga_perolehan") as string) || 0,
        foto_url: fotoUrl,
        tenantId,
        rt: currentUser?.rt || "01",
      };
      // Auto-save Kategori & Lokasi ke Master Data jika belum ada
      if (itemData.kategori) {
        const kExists = inventarisKategori.find(
          (k) =>
            k.nama_kategori?.toLowerCase() === itemData.kategori?.toLowerCase(),
        );
        if (!kExists) {
          const kId = `KAT-${Date.now()}`;
          await setDoc(doc(db, "inventaris_kategori", kId), {
            id: kId,
            nama_kategori: itemData.kategori,
            tenantId,
          });
        }
      }
      if (itemData.lokasi) {
        const lExists = inventarisLokasi.find(
          (l) =>
            l.nama_lokasi?.toLowerCase() === itemData.lokasi?.toLowerCase(),
        );
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, "inventaris_lokasi", lId), {
            id: lId,
            nama_lokasi: itemData.lokasi,
            tenantId,
          });
        }
      }
      if (itemData.supplier) {
        const sExists = inventarisSupplier.find(
          (s) => s.nama?.toLowerCase() === itemData.supplier?.toLowerCase(),
        );
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, "inventaris_supplier", sId), {
            id: sId,
            nama: itemData.supplier,
            kontak: "",
            alamat: "",
            tenantId,
          });
        }
      }

      if (editingItem) {
        await updateDoc(doc(db, "inventaris", itemId), itemData);
        setInventarisData((prev: any) =>
          prev.map((item: any) => (item.id === itemId ? itemData : item)),
        );
        showNotification("Data inventaris diperbarui!", "success");
      } else {
        await setDoc(doc(db, "inventaris", itemId), itemData);
        setInventarisData((prev: any) => [itemData, ...prev]);
        showNotification("Barang baru ditambahkan ke inventaris!", "success");
      }
      setShowAddForm(false);
      setEditingItem(null);
    } catch (error: any) {
      handleFirestoreError(
        error,
        editingItem ? "update" : "create",
        "inventaris",
      );
    } finally {
      setIsLoadingDB(false);
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleSaveLog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canEdit || !selectedItem) return;

    const formData = new FormData(e.currentTarget);
    const logId = `LOG-${Date.now()}`;
    const tanggal = formData.get("tanggal") as string;

    // Base log
    const logData: any = {
      id: logId,
      itemId: selectedItem.id,
      itemName: selectedItem.nama_barang,
      aktivitas: txType,
      pencatat: currentUser.name,
      tanggal,
      tenantId,
      rt: currentUser?.rt || "01",
    };

    const itemUpdate: any = {};
    const currentStok = selectedItem.stok || 0;

    if (txType === "Barang Masuk") {
      const jumlah = parseInt(formData.get("jumlah") as string) || 0;
      const harga = parseInt(formData.get("harga") as string) || 0;
      logData.supplier = formData.get("supplier") as string;
      logData.jumlah = jumlah;
      logData.harga = harga;
      logData.total = jumlah * harga;
      itemUpdate.stok = currentStok + jumlah;
    } else if (txType === "Barang Keluar") {
      const jumlah = parseInt(formData.get("jumlah") as string) || 0;
      logData.jumlah = jumlah;
      logData.tujuan = formData.get("tujuan") as string;
      logData.keterangan = formData.get("keterangan") as string;
      itemUpdate.stok = Math.max(0, currentStok - jumlah);
    } else if (txType === "Mutasi Barang") {
      logData.dari_lokasi = selectedItem.lokasi;
      logData.ke_lokasi = formData.get("ke_lokasi") as string;
      logData.keterangan = formData.get("keterangan") as string;
      itemUpdate.lokasi = logData.ke_lokasi;
    } else if (txType === "Stock Opname") {
      const stok_fisik = parseInt(formData.get("stok_fisik") as string) || 0;
      logData.stok_sistem = currentStok;
      logData.stok_fisik = stok_fisik;
      logData.selisih = stok_fisik - currentStok;
      logData.catatan = formData.get("catatan") as string;
      itemUpdate.stok = stok_fisik;
    }

    setIsLoadingDB(true);
    try {
      if (itemUpdate.stok !== undefined || itemUpdate.lokasi !== undefined) {
        await updateDoc(doc(db, "inventaris", selectedItem.id), itemUpdate);
        setInventarisData((prev: any) =>
          prev.map((item: any) =>
            item.id === selectedItem.id ? { ...item, ...itemUpdate } : item,
          ),
        );
      }
      if (logData.supplier && txType === "Barang Masuk") {
        const sExists = inventarisSupplier.find(
          (s: any) => s.nama?.toLowerCase() === logData.supplier?.toLowerCase(),
        );
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, "inventaris_supplier", sId), {
            id: sId,
            nama: logData.supplier,
            kontak: "",
            alamat: "",
            tenantId,
          });
        }
      }
      if (logData.ke_lokasi && txType === "Mutasi Barang") {
        const lExists = inventarisLokasi.find(
          (l: any) =>
            l.nama_lokasi?.toLowerCase() === logData.ke_lokasi?.toLowerCase(),
        );
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, "inventaris_lokasi", lId), {
            id: lId,
            nama_lokasi: logData.ke_lokasi,
            tenantId,
          });
        }
      }

      await setDoc(doc(db, "inventaris_logs", logId), logData);
      showNotification("Transaksi berhasil dicatat!", "success");
      setShowLogForm(false);
      setTxType("Barang Masuk");
      setTxJumlah(1);
      setTxHarga(0);
      setTxStokFisik(0);
    } catch (error: any) {
      handleFirestoreError(error, "create", "inventaris_logs");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteItem = async (id: string, nama: string) => {
    if (!id || id === "undefined") {
      console.error("Critical: Attempted to delete item with invalid ID");
      showNotification("Kesalahan: ID barang tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification(
        "Anda tidak memiliki izin untuk menghapus aset.",
        "error",
      );
      return;
    }

    if (
      !window.confirm(
        `Hapus barang "${nama}" dari inventaris? Tindakan ini tidak dapat dibatalkan.`,
      )
    )
      return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, "inventaris", id));
      showNotification(`Aset "${nama}" berhasil dihapus.`, "success");
    } catch (error: any) {
      console.error("Firestore Delete Asset Error:", error);
      handleFirestoreError(error, "delete", `inventaris/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!logId || logId === "undefined") {
      console.error("Critical: Attempted to delete log with invalid ID");
      showNotification("Kesalahan: ID riwayat tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification(
        "Anda tidak memiliki izin untuk menghapus riwayat.",
        "error",
      );
      return;
    }

    if (
      !window.confirm(
        "Hapus riwayat aktivitas ini? Tindakan ini tidak dapat dibatalkan.",
      )
    )
      return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, "inventaris_logs", logId));
      showNotification("Catatan aktivitas berhasil dihapus.", "success");
    } catch (error: any) {
      console.error("Firestore Delete Log Error:", error);
      handleFirestoreError(error, "delete", `inventaris_logs/${logId}`);
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
            Aset & Inventaris
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-lg">
            Kelola dan pantau aset yang dimiliki oleh organisasi, perbarui
            kondisi, serta catat lokasi penyimpanannya di satu tempat.
          </p>
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
              onClick={() => {
                setEditingItem(null);
                setShowAddForm(true);
              }}
              className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Aset Baru
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  Aset / Barang
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Stok
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Kategori & Lokasi
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Perolehan
                </th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-400 text-sm italic"
                  >
                    Tidak ada data inventaris
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, idx: number) => (
                  <tr
                    key={`inv-row-${item.id || idx}-${idx}`}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img
                            src={item.foto_url}
                            alt={item.nama_barang}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800 tracking-tight">
                            {item.nama_barang}
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Merk: {item.merk || "-"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-xs font-black font-mono ${item.stok <= (item.minimum_stok || 0) ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"}`}
                        >
                          {item.stok} {item.satuan}
                        </span>
                        {item.minimum_stok > 0 && (
                          <span className="text-[9px] text-slate-400">
                            Min: {item.minimum_stok}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          item.status === "aktif"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : item.status === "rusak"
                              ? "bg-orange-50 text-orange-700 border-orange-100"
                              : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[11px] font-bold text-slate-700">
                        {item.kategori || "-"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.lokasi || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-700">
                        {item.tanggal_perolehan &&
                        !isNaN(new Date(item.tanggal_perolehan).getTime())
                          ? new Date(item.tanggal_perolehan).toLocaleDateString(
                              "id-ID",
                            )
                          : "-"}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">
                        Rp {(item.harga_perolehan || 0).toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowLogForm(true);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100 text-[10px] font-bold uppercase tracking-wider"
                          title="Catat Aktivitas"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          Catat
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowLogHistory(true);
                          }}
                          className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                          title="Riwayat"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowAddForm(true);
                            }}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                            title="Edit Aset"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  {editingItem ? (
                    <Edit className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-slate-800">
                  {editingItem ? "Edit Aset" : "Tambah Aset Baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 hover:text-red-500 bg-white border border-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Foto Aset
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                      {editingItem?.foto_url ? (
                        <img
                          src={editingItem.foto_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        name="foto_aset"
                        accept="image/*"
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">
                        Format JPG/PNG, Max 2MB. Foto baru akan menggantikan
                        yang lama.
                      </p>
                    </div>
                  </div>
                  {uploading && (
                    <div className="mt-3">
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${uploadPct}%` }}
                        ></div>
                      </div>
                      <p className="text-[9px] font-black text-blue-600 text-right mt-1">
                        Mengunggah: {uploadPct}%
                      </p>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Nama Aset / Barang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_barang"
                    required
                    defaultValue={editingItem?.nama_barang}
                    placeholder="Contoh: Tenda 3x4"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Tgl Perolehan
                  </label>
                  <input
                    type="date"
                    name="tanggal_perolehan"
                    defaultValue={editingItem?.tanggal_perolehan}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Harga Perolehan
                  </label>
                  <input
                    type="number"
                    name="harga_perolehan"
                    defaultValue={editingItem?.harga_perolehan || 0}
                    placeholder="Rp"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kategori"
                    list="kategoriList"
                    required
                    defaultValue={editingItem?.kategori}
                    placeholder="Pilih / Ketik Kategori..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                  <datalist id="kategoriList">
                    {inventarisKategori.map((k) => (
                      <option key={k.id} value={k.nama_kategori} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lokasi"
                    list="lokasiList"
                    required
                    defaultValue={editingItem?.lokasi}
                    placeholder="Pilih / Ketik Lokasi..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                  <datalist id="lokasiList">
                    {inventarisLokasi.map((l) => (
                      <option key={l.id} value={l.nama_lokasi} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Stok <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    required
                    min="0"
                    defaultValue={editingItem?.stok ?? 0}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Satuan (Unit)
                  </label>
                  <input
                    type="text"
                    name="satuan"
                    defaultValue={editingItem?.satuan || "Pcs"}
                    placeholder="Contoh: Pcs, Set"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Minimum Stok
                  </label>
                  <input
                    type="number"
                    name="minimum_stok"
                    min="0"
                    defaultValue={editingItem?.minimum_stok ?? 0}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    defaultValue={editingItem?.status || "aktif"}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold"
                  >
                    <option value="aktif">Aktif / Baik</option>
                    <option value="rusak">Rusak</option>
                    <option value="hilang">Hilang</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Merk
                  </label>
                  <input
                    type="text"
                    name="merk"
                    defaultValue={editingItem?.merk}
                    placeholder="Contoh: Krisbow"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Supplier Baru / Pilih Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    list="supplierList"
                    defaultValue={editingItem?.supplier}
                    placeholder="Ketik nama supplier..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                  <datalist id="supplierList">
                    {inventarisSupplier.map((s) => (
                      <option key={s.id} value={s.nama} />
                    ))}
                  </datalist>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                    Spesifikasi
                  </label>
                  <input
                    type="text"
                    name="spesifikasi"
                    defaultValue={editingItem?.spesifikasi}
                    placeholder="Detail teknis..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-600"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CATAT AKTIVITAS */}
      {showLogForm && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-green-600" />
                Catat Transaksi: {selectedItem.nama_barang}
              </h3>
              <button
                onClick={() => setShowLogForm(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveLog} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                  Jenis Transaksi <span className="text-red-500">*</span>
                </label>
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium"
                />
              </div>

              {txType === "Barang Masuk" && (
                <div className="space-y-4 p-4 border border-blue-100 bg-blue-50/30 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Supplier Baru/Pilih{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      list="supplierListTx"
                      required
                      placeholder="Supplier..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold"
                    />
                    <datalist id="supplierListTx">
                      {inventarisSupplier.map((s) => (
                        <option key={s.id} value={s.nama} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Jumlah Masuk <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="jumlah"
                        required
                        min="1"
                        value={txJumlah}
                        onChange={(e) =>
                          setTxJumlah(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Harga Satuan
                      </label>
                      <input
                        type="number"
                        name="harga"
                        min="0"
                        value={txHarga}
                        onChange={(e) =>
                          setTxHarga(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Total Estimasi Nilai
                    </label>
                    <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono text-slate-700">
                      Rp {(txJumlah * txHarga).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              )}

              {txType === "Barang Keluar" && (
                <div className="space-y-4 p-4 border border-orange-100 bg-orange-50/30 rounded-xl">
                  <div className="flex items-center justify-between text-xs font-bold text-orange-600 bg-white px-3 py-2 border border-orange-100 rounded-lg">
                    <span>Stok Tersedia Saat Ini:</span>
                    <span className="font-mono text-sm">
                      {selectedItem.stok} {selectedItem.satuan}
                    </span>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Jumlah Keluar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="jumlah"
                      required
                      min="1"
                      max={selectedItem.stok}
                      defaultValue={1}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Tujuan (User/Divisi){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tujuan"
                      required
                      placeholder="Cth: Bpk Andi RT 01..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Keterangan / Tujuan Penggunaan
                    </label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      placeholder="Cth: Untuk perbaikan pipa di lapangan..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {txType === "Mutasi Barang" && (
                <div className="space-y-4 p-4 border border-purple-100 bg-purple-50/30 rounded-xl">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Dari Lokasi Saat Ini
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedItem.lokasi || "-"}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-500 cursor-not-allowed outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Pindah Ke Lokasi Baru{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ke_lokasi"
                      list="keLokasiList"
                      required
                      placeholder="Gudang B..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none font-bold"
                    />
                    <datalist id="keLokasiList">
                      {inventarisLokasi.map((l) => (
                        <option key={l.id} value={l.nama_lokasi} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Keterangan Mutasi
                    </label>
                    <textarea
                      name="keterangan"
                      rows={2}
                      placeholder="Alasan pemindahan..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {txType === "Stock Opname" && (
                <div className="space-y-4 p-4 border border-teal-100 bg-teal-50/30 rounded-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Stok Sistem (Saat Ini)
                      </label>
                      <input
                        type="number"
                        disabled
                        value={selectedItem.stok}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-500 cursor-not-allowed outline-none font-mono font-bold"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                        Stok Fisik (Realita){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="stok_fisik"
                        required
                        min="0"
                        value={txStokFisik}
                        onChange={(e) =>
                          setTxStokFisik(parseInt(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-teal-500 ring-2 ring-transparent focus:ring-teal-100 outline-none font-mono font-black text-teal-700"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>Selisih Stok</span>
                        <span
                          className={`text-xs ${txStokFisik - selectedItem.stok < 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {txStokFisik - selectedItem.stok}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                      Catatan Pengecekan
                    </label>
                    <textarea
                      name="catatan"
                      rows={2}
                      placeholder="Cth: 2 kursi patah diletakkan di luar, 1 kursi hilang..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RIWAYAT AKTIVITAS */}
      {showLogHistory && selectedItem && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Riwayat: {selectedItem.nama_barang}
              </h3>
              <button
                onClick={() => setShowLogHistory(false)}
                className="p-1.5 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              {inventarisLogs.filter((l: any) => l.itemId === selectedItem.id)
                .length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  Belum ada riwayat aktivitas untuk barang ini.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {inventarisLogs
                    .filter((l: any) => l.itemId === selectedItem.id)
                    .sort((a: any, b: any) =>
                      b.tanggal.localeCompare(a.tanggal),
                    )
                    .map((log: any) => (
                      <div
                        key={log.id}
                        className="p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              log.aktivitas === "Barang Masuk"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : log.aktivitas === "Barang Keluar"
                                  ? "bg-orange-50 text-orange-600 border-orange-100"
                                  : log.aktivitas === "Mutasi Barang"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : log.aktivitas === "Stock Opname"
                                      ? "bg-teal-50 text-teal-600 border-teal-100"
                                      : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {log.aktivitas}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-slate-400">
                              {log.tanggal}
                            </span>
                          </div>
                        </div>

                        {log.aktivitas === "Barang Masuk" && (
                          <p className="text-sm text-slate-700 mt-2">
                            Masuk{" "}
                            <strong className="font-mono">{log.jumlah}</strong>{" "}
                            unit dari <strong>{log.supplier}</strong> (Nilai: Rp{" "}
                            {(log.total || 0).toLocaleString("id-ID")})
                          </p>
                        )}
                        {log.aktivitas === "Barang Keluar" && (
                          <p className="text-sm text-slate-700 mt-2">
                            Keluar{" "}
                            <strong className="font-mono">{log.jumlah}</strong>{" "}
                            unit untuk <strong>{log.tujuan}</strong> <br />
                            {log.keterangan && (
                              <span className="text-xs text-slate-500">
                                {log.keterangan}
                              </span>
                            )}
                          </p>
                        )}
                        {log.aktivitas === "Mutasi Barang" && (
                          <p className="text-sm text-slate-700 mt-2">
                            Dipindah dari <strong>{log.dari_lokasi}</strong> ke{" "}
                            <strong>{log.ke_lokasi}</strong> <br />
                            {log.keterangan && (
                              <span className="text-xs text-slate-500">
                                {log.keterangan}
                              </span>
                            )}
                          </p>
                        )}
                        {log.aktivitas === "Stock Opname" && (
                          <p className="text-sm text-slate-700 mt-2">
                            Stok Sistem:{" "}
                            <strong className="font-mono">
                              {log.stok_sistem}
                            </strong>{" "}
                            &rarr; Stok Fisik:{" "}
                            <strong className="font-mono">
                              {log.stok_fisik}
                            </strong>{" "}
                            (Selisih:{" "}
                            <span
                              className={
                                log.selisih < 0
                                  ? "text-red-500 font-bold"
                                  : "text-green-500 font-bold"
                              }
                            >
                              {log.selisih}
                            </span>
                            ) <br />
                            {log.catatan && (
                              <span className="text-xs text-slate-500">
                                {log.catatan}
                              </span>
                            )}
                          </p>
                        )}
                        {![
                          "Barang Masuk",
                          "Barang Keluar",
                          "Mutasi Barang",
                          "Stock Opname",
                        ].includes(log.aktivitas) && (
                          <p className="text-sm text-slate-700 font-medium my-1">
                            {log.keterangan || "-"}
                          </p>
                        )}

                        <p className="text-[10px] text-slate-400 italic mt-1">
                          Dicatat oleh: {log.pencatat}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowLogHistory(false)}
                className="px-6 py-2 bg-white border border-slate-200 text-slate-600 font-bold text-xs rounded-lg uppercase tracking-widest"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
