import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
  FileDown,
  Globe,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Sparkles,
  Tag,
  Ticket,
  Gift,
  HelpCircle,
} from "lucide-react";
import BelanjaView from "./components/toko/BelanjaView";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import AuditLogView from "./components/AuditLogView";
import EnterpriseGovDashboard from "./components/EnterpriseGovDashboard";
import SOSOverlay from "./components/SOSOverlay";
import PengaturanView from "./components/PengaturanView";
import PanduanAdminView from "./components/PanduanAdminView";
import ETokoView from "./components/toko/ETokoView";
import { EVotingView } from "./components/EVotingView";
import { AIDocumentSuiteMenu } from "./components/AIDocumentSuiteMenu";
import { MapPicker } from "./components/MapPicker";
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
import { safeLocalStorage, safeSessionStorage } from "./lib/safeStorage";
import { clearUserProfileCache, authInitTimeout } from "./lib/authSessionManager";
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
  serverTimestamp,
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
import { ErrorBoundary } from './components/ErrorBoundary';
import { ComplaintView } from "./components/ComplaintView";
import { SatpamDashboard } from "./components/SatpamDashboard";
import { BookingView } from "./components/BookingView";
import { AnalyticsPremiumView } from "./components/AnalyticsPremiumView";
import { OrganisasiView } from "./components/OrganisasiView";
import UsersView from "./components/UsersView";
import TenantsView from "./components/TenantsView";
import { StyledButton } from "./components/StyledButton";
import { ConfirmModal } from "./components/ui/ConfirmModal";
import KependudukanView from "./components/KependudukanView";
import InventarisView from "./components/InventarisView";
import { MessageSquare, Bot, Send, Mail, Share2 } from "lucide-react";
import { getTranslatedLabel } from "./lib/langUtils";
import { getTenantId } from "./lib/appUtils";
import CommandPalette from "./components/CommandPalette";
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

const APP_LOGO = "/logosmartrwai.png";

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
  const displayLogo = (!logoUrl || logoUrl === '/logosmartrwai.png' || logoUrl === '/logosmartrwai-1.png') ? APP_LOGO : logoUrl;

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

// --- INITIAL DATA ---
const INITIAL_WARGA_DATA: any[] = [];
const INITIAL_KAS_DATA: any[] = [];
const INITIAL_SURAT_DATA: any[] = [];
const INITIAL_IURAN_DATA: any[] = [];
const INITIAL_INVENTARIS_DATA: any[] = [];

// NOTE: Kategori Inventaris dikelola secara dinamis melalui Firestore (koleksi: inventaris_kategori).
// Anda dapat menambahkannya melalui fitur "Kategori" pada menu Inventaris di aplikasi.

// Removed redundant plan constants and functions

// Removed duplicate generateSuratHTML

// Global utility helpers
export function getTrialStatus(tenant: any, currentUser?: any) {
  if (!tenant) {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30, daysRemainingFrozen: 0 };
  }
  
  if (currentUser?.isSuperAdmin || tenant.parentId === "MASTER" || tenant.id === "MASTER") {
    return { phase: "PAID" as const, daysRemainingActive: 9999, daysRemainingFrozen: 0 };
  }

  const isPaidPremium = ["FLASH", "PRO", "PREMIUM", "ENTERPRISE", "GOLD", "DIAMOND", "PRIME", "GOV", "RW", "BASIC"].some((st: string) => tenant.status?.toUpperCase()?.includes(st));

  const isStarter = !isPaidPremium && (!tenant.status || 
                    ["STARTER", "TRIAL", "ACTIVE"].includes(tenant.status?.toUpperCase()));

  if (!isStarter) {
    return { phase: "PAID" as const, daysRemainingActive: 9999, daysRemainingFrozen: 0 };
  }

  let createdAt = tenant.createdAt;
  if (!createdAt) {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30, daysRemainingFrozen: 0 };
  }

  const startDate = typeof createdAt === "string" 
    ? new Date(createdAt) 
    : (createdAt.toDate ? createdAt.toDate() : new Date(createdAt.seconds * 1000));
  
  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 30) {
    return { phase: "DELETED" as const, daysRemainingActive: 0, daysRemainingFrozen: 0 };
  } else {
    return { phase: "ACTIVE" as const, daysRemainingActive: 30 - diffDays, daysRemainingFrozen: 0 };
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
  console.log("App Component: Mounting...");
  
  // --- CORE SYSTEM STATES ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbStatus, setDbStatus] = useState<
    "ONLINE" | "OFFLINE" | "UNAVAILABLE" | "INITIALIZING"
  >("INITIALIZING");
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email?: string;
    tenantId?: string;
    isSuperAdmin?: boolean;
    [key: string]: any;
  } | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState(true);

  // Synchronous security repair for the main platform owner
  useEffect(() => {
    const emailLow = currentUser?.email?.toLowerCase() || auth.currentUser?.email?.toLowerCase();
    const isOwnerEmail = emailLow === "arifrajcoach@gmail.com" || emailLow === "arifrajmci@gmail.com";
    
    if (isOwnerEmail) {
      const isIncorrect =
        currentUser?.role !== "SUPER_ADMIN" ||
        currentUser?.isSuperAdmin !== true ||
        currentUser?.tenantId !== "MASTER";
      if (isIncorrect) {
        console.log("Forcing SUPER_ADMIN privileges for platform owner", emailLow);
        setCurrentUser((prev) => {
          const base = prev || {
            name: "Admin Master",
            email: emailLow,
            rt: "01",
            status: "AKTIF",
            created_at: new Date().toISOString(),
          };
          return {
            ...base,
            role: "SUPER_ADMIN",
            isSuperAdmin: true,
            tenantId: "MASTER",
          };
        });
      }
    }
  }, [currentUser, isAuthInitializing]);
  const [isAuthHanging, setIsAuthHanging] = useState(false);

  // --- SECONDARY UI STATES ---
  const [wargaAuth, setWargaAuth] = useState<any>(() => {
    try {
      const saved = safeLocalStorage.getItem("smartrw_warga_auth");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn("Failed to parse smartrw_warga_auth from safeLocalStorage:", e);
      return null;
    }
  }); // For custom citizen login

  useEffect(() => {
    if (quotaExceeded) {
      showNotification("Kuota Firestore habis. Harap hubungi admin untuk meningkatkan paket atau mengaktifkan tagihan.", "error");
    }
  }, [quotaExceeded]);

  // Auto-sync citizen session persistence
  useEffect(() => {
    try {
      if (wargaAuth) {
        safeLocalStorage.setItem("smartrw_warga_auth", JSON.stringify(wargaAuth));
      } else {
        safeLocalStorage.removeItem("smartrw_warga_auth");
      }
    } catch (e) {
      console.error("Error writing smartrw_warga_auth to storage:", e);
    }
  }, [wargaAuth]);

  // Auto-login citizen if session is persisted
  useEffect(() => {
    if (!wargaAuth) {
       try {
         const saved = safeLocalStorage.getItem("smartrw_warga_auth");
         if (saved) {
           const parsed = JSON.parse(saved);
           if (parsed) {
             setWargaAuth(parsed);
           }
         }
       } catch (e) {
         console.warn("Failed to auto-login from smartrw_warga_auth:", e);
       }
    }
  }, []);

  const [impersonatedTenantId, setImpersonatedTenantId] = useState<
    string | null
  >(safeLocalStorage.getItem("impersonatedTenantId"));
  const [showQRModal, setShowQRModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("TRIAL");
  const [prefilledEmail, setPrefilledEmail] = useState("");
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(true); // Default show for announcement
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // --- REFS ---
  const alertedSOSRef = useRef<Set<string>>(new Set());
  const appStartTime = useRef(Date.now());

  // Safety Timeout for Auth Initialization (Watchdog)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthInitializing) {
        console.warn("Auth initialization is hanging for >5s. Triggering fallback bypass.");
        setIsAuthHanging(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isAuthInitializing]);

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
        } else if (error?.code === "resource-exhausted") {
          setQuotaExceeded(true);
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
          const cachedProfile = safeSessionStorage.getItem(`user_profile_${user.uid}`);
          if (cachedProfile) {
            try {
              const parsed = JSON.parse(cachedProfile);
              setCurrentUser({ uid: user.uid, ...parsed });
              setIsAuthInitializing(false);
              // We'll continue to fetch in background to ensure data is fresh
              console.log("App: Using cached profile, fetching fresh data in background...");
            } catch (e) {
              console.warn("App: Failed to parse cached profile:", e);
              safeSessionStorage.removeItem(`user_profile_${user.uid}`);
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
                try {
                  userDoc = await getDoc(userDocRef);
                } catch (retryErr) {
                  console.error("Retry failed:", retryErr);
                  setCurrentUser({ uid: user.uid, name: user.email || "User", role: "Viewer", tenantId: "GUEST" });
                  setIsAuthInitializing(false);
                  return;
                }
              } else if (err.message?.includes("quota") || err.code === "resource-exhausted") {
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
            const userEmailLow = user.email?.toLowerCase();
            const isMasterEmail = userEmailLow === "arifrajcoach@gmail.com" || userEmailLow === "arifrajmci@gmail.com";
            const isTrihUser = userEmailLow?.includes("trihprw26") || userEmailLow?.includes("handoko");
            let needsUpdate = false;
            const allowedStatuses = ["STARTER", "FLASH", "PRO", "PREMIUM", "ENTERPRISE", "TRIAL", "ACTIVE", "AKTIF"];
            const userStatus = (userData.status || "TRIAL").toUpperCase();
            
            if (!allowedStatuses.includes(userStatus) && !isMasterEmail) {
              // Auto-repair: If they are supposed to be active (e.g. from Verified Data Warga) but status is wrong
              if (userData.role === "Warga" || userData.role === "PENDUDUK") {
                userData.status = "ACTIVE";
                needsUpdate = true;
              } else {
                await signOut(auth);
                setCurrentUser(null);
                showNotification("Akun Anda belum aktif atau paket tidak valid. Hubungi Admin.", "error");
                return;
              }
            }

            if (isMasterEmail) {
              const isAdminStatusWrong = userData.role !== "SUPER_ADMIN" || !userData.isSuperAdmin || userData.status !== "ACTIVE";
              userData.isSuperAdmin = true;
              userData.role = "SUPER_ADMIN";
              userData.status = "ACTIVE";
              
              // NEW: Try to sync tenant from data_warga if currently MASTER to prefer residence
              if (userData.tenantId === "MASTER" || !userData.tenantId) {
                 try {
                    const wargaRef = collection(db, "data_warga");
                    const qw = query(wargaRef, where("email", "==", user.email));
                    const snap = await getDocs(qw);
                    if (!snap.empty) {
                       const verified = snap.docs.find(d => d.data().terverifikasi === true);
                       if (verified) {
                          userData.tenantId = verified.data().tenantId;
                          userData.nik = verified.data().nik || userData.nik;
                       }
                    }
                 } catch (e) {
                    console.warn("Soft error syncing residence for admin:", e);
                 }
              }

              if (!userData.tenantId) userData.tenantId = "MASTER"; 
              if (!userData.name || userData.name === "User") userData.name = user.displayName || "Admin Master";
              if (isAdminStatusWrong) needsUpdate = true;
            }

            if (isTrihUser && userData.tenantId !== "rw26_berjuang") {
              userData.tenantId = "rw26_berjuang";
              userData.role = "RW";
              needsUpdate = true;
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
            
            safeSessionStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(userData));
            setCurrentUser({ uid: user.uid, ...userData });
          } else if (user.isAnonymous) {
            const overrideAdmin = user.uid === "MKe94buSU4SMg8jiRbCcOLwJp9H3";
            setCurrentUser({
              name: overrideAdmin ? (user.displayName || "Admin Master (Override)") : "Warga (Anonymous)",
              role: overrideAdmin ? "SUPER_ADMIN" : "Warga",
              uid: user.uid,
              tenantId: overrideAdmin ? "MASTER" : "",
              isSuperAdmin: overrideAdmin,
            });
          } else {
            let preRegDoc;
            let querySnapshot;
            let preRegUserData = null;
            let docToDeleteRef = null;

            try {
              const preRegDocRef = doc(db, "users", "PRE_" + (user.email?.toLowerCase() || "NONE"));
              preRegDoc = await getDoc(preRegDocRef);
              
              if (preRegDoc.exists()) {
                preRegUserData = preRegDoc.data();
                docToDeleteRef = preRegDocRef;
              } else if (user.email) {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("email", "==", user.email));
                querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const matchedUser = querySnapshot.docs[0];
                  if (matchedUser.id !== user.uid) {
                    preRegUserData = matchedUser.data();
                    docToDeleteRef = doc(db, "users", matchedUser.id);
                  }
                }

                // If not found in users, try data_warga (robust email variations)
                if (!preRegUserData) {
                  const targetEmail = user.email.toLowerCase().trim();
                  const emailVariations = [
                    user.email.trim(),
                    targetEmail,
                    user.email.toUpperCase().trim()
                  ].filter((v, i, a) => a.indexOf(v) === i);

                  const wargaRef = collection(db, "data_warga");
                  const qWarga = query(wargaRef, where("email", "in", emailVariations));
                  const wargaSnapshot = await getDocs(qWarga);
                  if (!wargaSnapshot.empty) {
                    const matchedWarga = wargaSnapshot.docs[0].data();
                    if (matchedWarga.terverifikasi === true) {
                      preRegUserData = matchedWarga;
                    }
                  }
                }
              }
            } catch (err: any) {
              console.warn("Permission denied checking preReg / email user docs:", err);
              setCurrentUser({ uid: user.uid, name: user.email || "User", role: "Viewer", tenantId: "GUEST" });
              setIsAuthInitializing(false);
              return;
            }

            if (preRegUserData) {
              const isMasterEmail = user.email?.toLowerCase() === "arifrajcoach@gmail.com" || user.email?.toLowerCase() === "arifrajmci@gmail.com";
              const newUser = { ...preRegUserData, id_user: user.uid, uid: user.uid };
              if (isMasterEmail) {
                newUser.isSuperAdmin = true;
                newUser.role = "SUPER_ADMIN";
                if (!newUser.tenantId) newUser.tenantId = "MASTER";
                if (!newUser.name || newUser.name === "User") newUser.name = user.displayName || "Admin Master";
              }
              await setDoc(doc(db, "users", user.uid), newUser);
              if (docToDeleteRef) await deleteDoc(docToDeleteRef);
              setCurrentUser({ uid: user.uid, ...newUser } as any);
            } else {
              const isMasterEmail = user.email?.toLowerCase() === "arifrajcoach@gmail.com" || user.email?.toLowerCase() === "arifrajmci@gmail.com";
              const isTrihUser = user.email?.toLowerCase().includes("trihprw26") || user.email?.toLowerCase().includes("handoko");
              if (isMasterEmail || isTrihUser) {
                const newUser = {
                  id_user: user.uid,
                  name: isMasterEmail ? "Admin Master" : "Admin RW Berjuang",
                  role: isMasterEmail ? "SUPER_ADMIN" : "RW",
                  email: user.email,
                  tenantId: isMasterEmail ? "MASTER" : (safeLocalStorage.getItem("lastActiveTenantId") || "rw26_berjuang"),
                  isSuperAdmin: isMasterEmail,
                  rt: "01",
                  status: "AKTIF",
                  created_at: new Date().toISOString(),
                };
                await setDoc(userDocRef, newUser);
                setCurrentUser(newUser as any);
              } else {
                await signOut(auth);
                setCurrentUser(null);
                showNotification("Akun Google Anda belum terdaftar. Silakan hubungi Admin.", "error");
              }
            }
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          if (error?.code !== "permission-denied") {
            setCurrentUser({ name: user.email || "User", role: "Viewer", uid: user.uid });
          } else {
            setCurrentUser(null);
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
        clearUserProfileCache();
        await signOut(auth);
      }
      
      // Clear cache and reset state to prevent session leakage and stale data
      safeSessionStorage.clear();
      
      // Clear localStorage but preserve essential auth/identity settings from Firebase
      // while clearing application specific data that might get corrupted
      const keysToPreserve = [
        "firebase:auth", 
        "firebaseLocalStorageDb", 
        "lastActiveTenantId",
        "impersonatedTenantId",
        "currentTenant",
        "parentTenant",
        "theme"
      ];
      
      Object.keys(localStorage).forEach(key => {
        if (!keysToPreserve.some(p => key.startsWith(p))) {
          safeLocalStorage.removeItem(key);
        }
      });

      setWargaData([]);
      setKasData([]);
      setSuratData([]);
      setIuranData([]);
      setInventarisData([]);

      setActiveTab("dashboard");
      // Force reload to completely clear memory and reset any static/global variables
      setTimeout(() => window.location.reload(), 100);
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

  const [wargaData, setWargaData] = useState<any[]>(INITIAL_WARGA_DATA);

  const [kasData, setKasData] = useState<any[]>(INITIAL_KAS_DATA);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [suratData, setSuratData] = useState<any[]>(INITIAL_SURAT_DATA);

  const [iuranData, setIuranData] = useState<any[]>([]);
  const [ppobData, setPpobData] = useState<any[]>([]);

  const [inventarisData, setInventarisData] = useState<any[]>(INITIAL_INVENTARIS_DATA);

  const [inventarisLogs, setInventarisLogs] = useState<any[]>([]);
  const [inventarisKategori, setInventarisKategori] = useState<any[]>([]);
  const [inventarisLokasi, setInventarisLokasi] = useState<any[]>([]);
  const [inventarisSupplier, setInventarisSupplier] = useState<any[]>([]);

  const [balitaData, setBalitaData] = useState<any[]>([]);
  const [kelahiranData, setKelahiranData] = useState<any[]>([]);
  const [kematianData, setKematianData] = useState<any[]>([]);
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
  const [useCustomSOSCoords, setUseCustomSOSCoords] = useState<boolean>(() => {
    return safeLocalStorage.getItem("custom_sos_lat") !== null;
  });
  const [customSOSLat, setCustomSOSLat] = useState<string>(() => {
    return safeLocalStorage.getItem("custom_sos_lat") || "";
  });
  const [customSOSLng, setCustomSOSLng] = useState<string>(() => {
    return safeLocalStorage.getItem("custom_sos_lng") || "";
  });
  const [isCalibratingSOS, setIsCalibratingSOS] = useState(false);

  const [usersData, setUsersData] = useState<any[]>([]);
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [parentSettings, setParentSettings] = useState<Record<string, any>>({});
  const [kopSettings, setKopSettings] = useState<Record<string, any>>({});

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = safeLocalStorage.getItem("theme");
      if (stored && ["light", "dark", "oceanic", "pink-baby"].includes(stored)) {
        return stored;
      }
      return "light";
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
      "dark-prime",
      "pro-max",
      "navy-luxury"
    );
    document.documentElement.classList.add(theme);
    safeLocalStorage.setItem("theme", theme);
  }, [theme]);

  const cycleTheme = () => {
    const themes = [
      "light",
      "dark",
      "oceanic",
      "pink-baby",
      "pro-max",
      "navy-luxury",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    const displayName = nextTheme.charAt(0).toUpperCase() + nextTheme.slice(1);
    setNotification({
      message: `Tema diubah ke ${displayName}`,
      type: "info",
    });
    setTimeout(() => setNotification(null), 2000);
  };

  // Keep toggleDarkMode for compatibility
  const toggleDarkMode = cycleTheme;

  const activeEmergency = emergenciesData.find((e) => {
    if (e.status !== "ACTIVE" || e.id === hiddenEmergencyId) return false;
    const emTime = e.timestamp ? new Date(e.timestamp).getTime() : (e.createdAt?.toMillis?.() || Date.now());
    
    // Identify if the active emergency belongs to the currently logged in user
    const currentUserId = auth.currentUser?.uid || wargaAuth?.uid;
    const currentNik = wargaAuth?.nik;
    const isMine = (currentUserId && e.userId === currentUserId) || (currentNik && e.userId === currentNik);
    
    // Identify if the emergency is in the user's selected/current tenant
    const myTenantId = currentUser?.tenantId || wargaAuth?.tenantId || selectedTenantId;
    const isMineTenant = e.tenantId === myTenantId;
    
    const isNewSinceAppStart = emTime > appStartTime.current - 30000; // 30s buffer for clock drift
    const isRecent = (Date.now() - emTime) < 300000; // 5 minutes max age for automatic display to prevent popping up stale SOS
    const isAuthorized = currentUser?.isSuperAdmin || ["RW", "RT", "SATPAM"].includes(currentUser?.role || "");
    
    console.log("App.tsx: Evaluating activeEmergency:", JSON.stringify(e));
    
    // Always show if it's the user's own active SOS (allowing them to see & stop/resolve it)
    if (isMine) return true;
    
    // For other users, show only if it is live (triggered while app was open) or highly recent (under 5 minutes old)
    // AND the user belongs to the same tenant or holds administrative authority
    const isTargetUser = isMineTenant || isAuthorized;
    const isLiveOrRecent = isNewSinceAppStart || isRecent;
    
    return isTargetUser && isLiveOrRecent;
  });

  useEffect(() => {
    // Redundant - audio logic is in SOSOverlay
  }, [activeEmergency?.id]);

  // Real-time GPS Tracking logic for active SOS triggered by this user
  useEffect(() => {
    let watchId: number | null = null;
    const currentUserId = auth.currentUser?.uid || wargaAuth?.uid;

    if (activeEmergency?.userId === currentUserId && activeEmergency?.status === "ACTIVE") {
      const savedLat = safeLocalStorage.getItem("custom_sos_lat");
      const savedLng = safeLocalStorage.getItem("custom_sos_lng");

      if (savedLat && savedLng) {
        console.log("GPS Terkalibrasi Aktif: Melewati tracking real-time untuk mencegah penimpaan dengan lokasi yang tidak akurat.");
        // Skip watching position if custom calibrated coords exist
        return;
      }

      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userLocation = `📍 Sinyal GPS Real-Time (Akurasi: ~${position.coords.accuracy.toFixed(0)}m): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            
            try {
              if (activeEmergency.id) {
                const emRef = doc(db, "emergencies", activeEmergency.id);
                await updateDoc(emRef, {
                  latitude: lat,
                  longitude: lng,
                  location: {
                    lat: lat,
                    lng: lng
                  },
                  userLocation: userLocation,
                  updatedAt: new Date().toISOString()
                });
                
                const logRef = doc(db, "emergency_logs", activeEmergency.id);
                 await updateDoc(logRef, {
                  latitude: lat,
                  longitude: lng,
                  location: {
                    lat: lat,
                    lng: lng
                  },
                  userLocation: userLocation,
                  updatedAt: new Date().toISOString()
                }).catch(() => {});
              }
            } catch (err) {
              console.warn("Gagal update GPS real-time:", err);
            }
          },
          (err) => {
            console.warn("GPS tracking error:", err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    }

    return () => {
      if (watchId !== null && typeof navigator !== "undefined" && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [activeEmergency?.id, activeEmergency?.status, activeEmergency?.userId, auth.currentUser?.uid, wargaAuth?.uid]);

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

  // LOOP ALARM SOUND STATE AND REF HOOKS (Ensures 12 cycles strictly with setInterval)
  const [localSOSLoopCount, setLocalSOSLoopCount] = useState(0);
  const [isLocalAlarmActive, setIsLocalAlarmActive] = useState(false);
  const [isLocalAlarmMuted, setIsLocalAlarmMuted] = useState(false);
  const localAlarmIntervalRef = useRef<any>(null);
  const localAudioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isLocalAlarmActive) {
      if (localAlarmIntervalRef.current) {
        clearInterval(localAlarmIntervalRef.current);
        localAlarmIntervalRef.current = null;
      }
      return;
    }

    let loopCount = 0;
    const playAlarmTick = () => {
      if (loopCount >= 12) {
        setIsLocalAlarmActive(false);
        if (localAlarmIntervalRef.current) {
          clearInterval(localAlarmIntervalRef.current);
          localAlarmIntervalRef.current = null;
        }
        return;
      }

      loopCount++;
      setLocalSOSLoopCount(loopCount);

      if (isLocalAlarmMuted) return;

      try {
        if (!localAudioCtxRef.current || localAudioCtxRef.current.state === "closed") {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          localAudioCtxRef.current = new AudioContextClass();
        }
        const audioCtx = localAudioCtxRef.current;
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.5);
        oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 3);
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 2.5);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);
        
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 3);
      } catch (e) {
        console.error("Audio API loop play error: ", e);
      }
    };

    // Play first cycle immediately
    playAlarmTick();

    // Loop exactly every 4 seconds (the sound is 3 seconds long, leaving a 1s pause)
    localAlarmIntervalRef.current = setInterval(playAlarmTick, 4000);

    return () => {
      if (localAlarmIntervalRef.current) {
        clearInterval(localAlarmIntervalRef.current);
        localAlarmIntervalRef.current = null;
      }
    };
  }, [isLocalAlarmActive, isLocalAlarmMuted]);

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

    // Standard multi-tenant isolation: exact match on tenantId or rw property
    if (lowW === lowRw) return true;
    
    if (isSpecialTenant(globalRw)) {
      return normalizeRwValue(w.rw) === globalRw;
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
    
    // Sort transactions by date descending
    const parseIndonesianDate = (dateStr: string) => {
      if (!dateStr) return 0;
      let time = new Date(dateStr).getTime();
      if (!isNaN(time)) return time;

      const monthsMap: Record<string, string> = {
        januari: "january",
        februari: "february",
        maret: "march",
        april: "april",
        mei: "may",
        juni: "june",
        juli: "july",
        agustus: "august",
        september: "september",
        oktober: "october",
        november: "november",
        desember: "december",
        tgl: "",
        jan: "jan",
        feb: "feb",
        mar: "mar",
        apr: "apr",
        jun: "jun",
        jul: "jul",
        agt: "aug",
        agu: "aug",
        sep: "sep",
        okt: "oct",
        des: "dec"
      };
      
      let normalized = dateStr.toLowerCase();
      const sortedKeys = Object.keys(monthsMap).sort((a, b) => b.length - a.length);
      sortedKeys.forEach(key => {
        normalized = normalized.replace(new RegExp(key, 'g'), monthsMap[key]);
      });
      
      time = new Date(normalized).getTime();
      return isNaN(time) ? 0 : time;
    };

    return [...result].sort((a: any, b: any) => {
      const timeB = parseIndonesianDate(b.tanggal);
      const timeA = parseIndonesianDate(a.tanggal);
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.id || "").localeCompare(a.id || "");
    });
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
      currentUser?.tenantId || wargaAuth?.tenantId || "";
    
    // If SuperAdmin, default to an empty string to force selection if not already selected
    let tId = "";
    if (currentUser?.isSuperAdmin) {
       tId = selectedTenantId || "";
    } else {
       tId = baseTenantId;
    }
    
    if (tId === "GUEST") tId = "";
    
    const list = new Set<string>();
    if (tId) {
      list.add(tId);
    }
    
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
    
    if (tId) addChildren(tId);

    // Give children context for their parent safely with loop detection
    // Only include ancestors if not a SuperAdmin filtering a specific tenant
    if (tId && !(currentUser?.isSuperAdmin && selectedTenantId)) {
      let current = tenantsData.find(t => t.id === tId);
      const visitedParents = new Set<string>();
      while (current && current.parentId) {
        if (visitedParents.has(current.id)) {
          console.warn("[App] Loop detected in tenant parenthood structure for tId:", tId);
          break; // Guard against infinite iteration
        }
        visitedParents.add(current.id);
        if (!list.has(current.parentId)) {
          list.add(current.parentId);
        }
        current = tenantsData.find(t => t.id === current?.parentId);
      }
    }
    
    return Array.from(list);
  }, [currentUser, wargaAuth, selectedTenantId, tenantsData]);

  // Securely resolve current active tenant ID for single context operations
  const activeTenantId = currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "");

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
      const userTenantId = u.tenantId || "";
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
      rt: linkedWarga?.rt || wargaAuth?.rt || currentUser?.rt || (activeTenantId?.toLowerCase()?.includes('rt') ? activeTenantId.toLowerCase().split('_')[0].replace('rt', '') : ""),
      rw: linkedWarga?.rw || wargaAuth?.rw || currentUser?.rw || (activeTenantId?.toLowerCase()?.includes('rw') ? activeTenantId.toLowerCase().split('_')[1].replace('rw', '') : ""),
      tenantId: linkedWarga?.tenantId || wargaAuth?.tenantId || currentUser?.tenantId || activeTenantId || "",
      terverifikasi: linkedWarga?.terverifikasi === true || wargaAuth?.terverifikasi === true || currentUser?.status === "Disetujui" || false
    };
  }, [linkedWarga, wargaAuth, currentUser]);

  // Automatically pull calibrated GPS coordinates from citizen profile database when available
  useEffect(() => {
    if (mergedWargaProfile?.latitude && mergedWargaProfile?.longitude) {
      const dbLat = mergedWargaProfile.latitude.toString();
      const dbLng = mergedWargaProfile.longitude.toString();
      const savedLat = safeLocalStorage.getItem("custom_sos_lat");
      const savedLng = safeLocalStorage.getItem("custom_sos_lng");
      
      if (dbLat !== savedLat || dbLng !== savedLng) {
        setCustomSOSLat(dbLat);
        setCustomSOSLng(dbLng);
        setUseCustomSOSCoords(true);
        safeLocalStorage.setItem("custom_sos_lat", dbLat);
        safeLocalStorage.setItem("custom_sos_lng", dbLng);
        console.log("SmaRtRw AI: Loaded pinpoint calibration coordinates from profile database:", dbLat, dbLng);
      }
    }
  }, [mergedWargaProfile?.latitude, mergedWargaProfile?.longitude]);

  // Enforce Max Warga limit locally for UI based on Plan
  const cappedWargaData = useMemo(() => {
    if (!currentTenant) return filteredWargaDataCentral.slice(0, 50);
    const planFeatures = getPlanFeatures(currentTenant);
    const maxWargaLimit = planFeatures.maxWarga;
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
    if (roleUpperApp === "VIEWER" || (!currentUser && wargaAuth)) {
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
    if (!currentUser && !wargaAuth) return;

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

    // Trigger Hook to loop exactly 12 times with accurate intervals
    setIsLocalAlarmActive(true);
    setLocalSOSLoopCount(0);

    try {
      const id = `SOS-${Date.now()}`;
      let userLocation = "Lokasi Tidak Diketahui";
      let lat = 0;
      let lng = 0;

      // Check if custom, calibrated coordinates are defined in safeLocalStorage BEFORE tracking
      const savedLat = safeLocalStorage.getItem("custom_sos_lat");
      const savedLng = safeLocalStorage.getItem("custom_sos_lng");
      
      if (savedLat && savedLng) {
        lat = parseFloat(savedLat);
        lng = parseFloat(savedLng);
        userLocation = `📍 Sinyal GPS Terkalibrasi (Kustom): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      } else {
        // Only Try to get geolocation if no custom coords exist
        if (typeof navigator !== "undefined" && "geolocation" in navigator) {
          try {
            // HIGH-PRECISION LOCK: Wait and pick the best accuracy sample
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                let bestPos: GeolocationPosition | null = null;
                const watchId = navigator.geolocation.watchPosition(
                  (pos) => {
                    if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
                      bestPos = pos;
                    }
                    // Exit early if accuracy is already excellent
                    if (pos.coords.accuracy <= 20) {
                      navigator.geolocation.clearWatch(watchId);
                      resolve(pos);
                    }
                  },
                  () => {}, // ignore partial failures
                  { enableHighAccuracy: true, maximumAge: 0 }
                );

                // Timeout-based selection: Stop watching after 8 seconds and use best found
                setTimeout(() => {
                  navigator.geolocation.clearWatch(watchId);
                  if (bestPos) resolve(bestPos);
                  else {
                    reject(new Error("Timeout waiting for high-accuracy GPS"));
                  }
                }, 8000);
              },
            );
            lat = position.coords.latitude;
            lng = position.coords.longitude;
            userLocation = `📍 Sinyal GPS Presisi (Akurasi: ~${position.coords.accuracy.toFixed(1)}m): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          } catch (geoErr) {
            console.warn("High-accuracy geolocation failed, attempting low accuracy...", geoErr);
            try {
               const position = await new Promise<GeolocationPosition>(
                (resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 8000,
                    maximumAge: 60000,
                  });
                },
               );
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              userLocation = `📍 Sinyal GPS Standar : ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            } catch (geoErr2) {
              console.warn("Geolocation failed completely, triggering IP lookup fallback...", geoErr2);
              try {
                const ipRes = await fetch("https://ipapi.co/json/");
                if (ipRes.ok) {
                  const ipData = await ipRes.json();
                  if (ipData && ipData.latitude && ipData.longitude) {
                    lat = ipData.latitude;
                    lng = ipData.longitude;
                    userLocation = `📍 Sinyal GPS IP Fallback (${ipData.city || 'Kota'}, IP: ${ipData.ip || ''}): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                  } else {
                    throw new Error("No lat/lng from IP API");
                  }
                } else {
                  throw new Error("API failed");
                }
              } catch (ipErr) {
                console.warn("IP Geolocation fallback failed as well", ipErr);
                lat = 0;
                lng = 0;
                userLocation = `📍 Akses Lokasi Ditolak. Harap kalibrasi GPS secara kustom atau aktifkan izin lokasi browser.`;
              }
            }
          }
        } else {
          // Fallback if browser does not support geolocation
          try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData && ipData.latitude && ipData.longitude) {
                lat = ipData.latitude;
                lng = ipData.longitude;
                userLocation = `📍 Sinyal GPS IP Fallback (${ipData.city || 'Kota'}): ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              } else {
                throw new Error("No coordinates");
               }
            } else {
              throw new Error("Fail");
            }
          } catch {
            lat = 0;
            lng = 0;
            userLocation = `📍 Fitur Lokasi (GPS) Tidak Tersedia di Perangkat/Browser Ini.`;
          }
        }
      }

      // Consolidate values using mergedWargaProfile to support both admin/operator and custom citizen login sessions safely
      const profile = mergedWargaProfile;
      const addressStr = `Alamat: Blok ${profile.blok || "-"}, RT ${profile.rt || "-"}/RW ${profile.rw || "-"}`;
      const userPhone = profile.hp || profile.telepon || "";
      const userEmail = profile.email || "";
      const isMinePhoto = (currentUser as any)?.photoUrl || profile.foto || profile.ktpUrl || "";

      const sosData = {
        tenantId: profile.tenantId || "",
        id,
        userId: auth.currentUser?.uid || wargaAuth?.uid || "anonymous",
        userName: profile.nama || "Warga",
        userLocation: userLocation,
        userAddress: addressStr,
        rt: profile.rt || "-",
        rw: profile.rw || "-",
        userPhone: userPhone || "-",
        userEmail: userEmail || "-",
        userPhoto: isMinePhoto || "",
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString(),
        status: "ACTIVE",
      };

      // Set Document in Central emergencies collection
      await setDoc(doc(db, "emergencies", id), sosData);

      // SINKRONISASI KE EMERGENCY_LOGS JALUR CEPAT UNTUK DASHBOARD SATPAM
      try {
        await setDoc(doc(db, "emergency_logs", id), {
          id,
          tenantId: profile.tenantId || "",
          userId: auth.currentUser?.uid || wargaAuth?.uid || "anonymous",
          userName: profile.nama || "Warga",
          userPhone: userPhone || "-",
          location: {
            lat: lat,
            lng: lng
          },
          status: "pending",
          timestamp: new Date().toISOString()
        });
      } catch (errSync) {
        console.warn("Could not sync with central emergency_logs: ", errSync);
      }

      showNotification("Sinyal Darurat Terkirim!", "error");
    } catch (err) {
      handleFirestoreError(err, "create", "emergencies");
    } finally {
      setIsSOSTriggering(false);
    }
  };

  const handleResolveSOS = async (id: string) => {
    if (!currentUser && !wargaAuth) return;
    try {
      // Deactivate local alarm loop when resolved
      setIsLocalAlarmActive(false);

      const resolverName = currentUser?.name || wargaAuth?.nama || "Warga";
      await updateDoc(doc(db, "emergencies", id), {
        status: "RESOLVED",
        resolvedBy: resolverName,
        resolvedAt: new Date().toISOString(),
      });

      // SINKRONISASI KE EMERGENCY_LOGS UNTUK SATPAM
      try {
        await updateDoc(doc(db, "emergency_logs", id), {
          status: "resolved",
          resolvedBy: resolverName,
          resolvedAt: new Date().toISOString(),
        });
      } catch (errSync) {
        console.warn("Could not sync resolve with emergency_logs:", errSync);
      }

      showNotification("Sinyal Darurat Dinonaktifkan", "success");
    } catch (err) {
      handleFirestoreError(err, "update", "emergencies");
    }
  };

  // Utility to chunk array for Firestore 'in' queries (max 10 items)
  const chunkArray = useCallback((arr: any[], size: number) => {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  }, []);

  // --- FIREBASE SYNC (REAL-TIME CORE DATA) ---
  useEffect(() => {
    if (!currentUser && !wargaAuth) {
      setIsLoadingDB(false);
      return;
    }
    const tIds = activeTenantIds.filter(id => id && id !== "GUEST");
    const rawTId = currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "");
    const tId = rawTId === "GUEST" ? "" : rawTId;

    if (!tId) {
       setIsLoadingDB(false);
       return;
    }
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
    let unsubEmergencies: (() => void)[] = [];
    if (tIds.length > 0) {
      const chunks = chunkArray(tIds, 10);
      chunks.forEach(chunk => {
        unsubEmergencies.push(onSnapshot(
          query(collection(db, "emergencies"), where("tenantId", "in", chunk)),
          (snap) => {
            setEmergenciesData(prev => {
               const filtered = prev.filter(p => !chunk.includes((p as any).tenantId));
               return [...filtered, ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))];
            });
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
        ));
      });
    }

    return () => {
      unsubSettings();
      unsubCurrentTenant();
      unsubEmergencies.forEach(u => u());
    };
  }, [currentUser?.uid, selectedTenantId, currentTenant?.parentId, chunkArray]);

  const [activeParentTenantId, setActiveParentTenantId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tId = currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "");
    if (!tId) return;
    
    const found = tenantsData.find(t => t.id === tId)?.parentId;
    if (found) {
      setActiveParentTenantId(found);
    } else {
      // Direct fetch for citizens who might not have read access to the whole tenants collection
      getDoc(doc(db, "tenants", tId)).then(snap => {
        if (snap.exists()) {
          setActiveParentTenantId(snap.data().parentId || null);
        } else {
          // Robust fallback derivation for sub-tenants following the rtXX_rwYY_... pattern
          const derivedParent = tId.replace(/^rt\d+_/, "");
          if (derivedParent !== tId) {
            setActiveParentTenantId(derivedParent);
          }
        }
      }).catch(() => {
        const derivedParent = tId.replace(/^rt\d+_/, "");
        if (derivedParent !== tId) {
          setActiveParentTenantId(derivedParent);
        }
      });
    }
  }, [currentUser?.uid, wargaAuth?.tenantId, selectedTenantId, tenantsData]);

  // Real-time listener for parent general settings (inheriting database fallbacks)
  useEffect(() => {
    const parentIdToFetch = activeParentTenantId || currentTenant?.parentId;
    if (!parentIdToFetch) {
      setParentSettings({});
      return;
    }
    const unsub = onSnapshot(doc(db, "settings", parentIdToFetch), (snap) => {
      if (snap.exists()) {
        setParentSettings(snap.data());
      } else {
        setParentSettings({});
      }
    }, (err) => {
      console.warn("[App] Gagal memuat pengaturan induk:", err);
    });
    return () => unsub();
  }, [activeParentTenantId, currentTenant?.parentId]);

  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tId = currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "");
    if (!tId) return;
    
    const unsubKopSettings = onSnapshot(doc(db, "tenant_settings", tId), (snap) => {
      let currentKop = snap.exists() ? snap.data() : {};
      
      const parentIdToFetch = activeParentTenantId;
      
      if (parentIdToFetch) {
        getDoc(doc(db, "tenant_settings", parentIdToFetch)).then(parentSnap => {
          if (parentSnap.exists()) {
            const parentData = parentSnap.data();
            const mergedKop = { ...parentData };
            Object.keys(currentKop).forEach(key => {
              const val = currentKop[key];
              const isInvalid = !val || val === "..." || val === "-" || val === "RT ... / RW ...";
              if (!isInvalid) {
                mergedKop[key] = val;
              }
            });
            setKopSettings(mergedKop);
          } else {
            setKopSettings(currentKop);
          }
        }).catch(e => {
          console.warn("[App] Parent settings fetch failed:", e);
          setKopSettings(currentKop);
        });
      } else {
        setKopSettings(currentKop);
      }
    }, (err) => {
      console.warn("[App] Firestore error for tenant_settings:", err.message);
    });

    return () => unsubKopSettings();
  }, [currentUser?.uid, wargaAuth?.tenantId, selectedTenantId, activeParentTenantId]);

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
    const unsubs: (() => void)[] = [];
    
    // Safety check: Prevent SuperAdmin from viewing all residents across all tenants by default.
    // They must explicitly select a tenant first.
    if (tIds.length > 0 && !(currentUser?.isSuperAdmin && !selectedTenantId)) {
      const chunks = chunkArray(tIds, 10);
      chunks.forEach(chunk => {
        const constraints: any[] = [where("tenantId", "in", chunk)];
        if (currentUser?.role?.toUpperCase() === "RT") {
          const rtToFilter = currentUser?.rt || (currentUser?.tenantId?.match(/rt(\d+)/i)?.[1]) || "01";
          constraints.push(where("rt", "==", getQueryRtNormalized(rtToFilter)));
        }
        unsubs.push(onSnapshot(query(collection(db, "data_warga"), ...constraints), (snap) => {
          setWargaData(prev => {
            const filtered = prev.filter(p => !chunk.includes(p.tenantId));
            return [...filtered, ...snap.docs.map(doc => ({ docId: doc.id, ...doc.data() } as any))];
          });
        }));
      });
    } else {
      setWargaData([]);
    }

    if (currentUser?.isSuperAdmin || ["ADMIN", "RW", "RT"].includes(currentUser?.role || "")) {
      if (currentUser?.isSuperAdmin) {
        unsubs.push(onSnapshot(query(collection(db, "users")), (snap) => {
          setUsersData(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any)));
        }));
      } else if (currentUser?.tenantId) {
        unsubs.push(onSnapshot(query(collection(db, "users"), where("tenantId", "==", currentUser?.tenantId || wargaAuth?.tenantId || "")), (snap) => {
          setUsersData(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any)));
        }));
      } else if (tIds.length > 0) {
        const chunks = chunkArray(tIds, 10);
        chunks.forEach(chunk => {
          unsubs.push(onSnapshot(query(collection(db, "users"), where("tenantId", "in", chunk)), (snap) => {
            setUsersData(prev => {
              const filtered = prev.filter(p => !chunk.includes(p.tenantId));
              return [...filtered, ...snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any))];
            });
          }));
        });
      }
    }

    return () => unsubs.forEach(u => u());
  }, [activeTab, activeTenantIds, currentUser?.uid, chunkArray]);

  // 2. Financial Sync (Kas, Iuran, PPOB)
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;

    const tIds = activeTenantIds;
    const rt = (currentUser?.role?.toUpperCase() === "RT" || currentUser?.role?.toUpperCase() === "WARGA" || !!wargaAuth) 
      ? getQueryRtNormalized(currentUser?.rt || wargaAuth?.rt) 
      : null;
    const unsubs: (() => void)[] = [];
    
    if (tIds.length > 0) {
      const chunks = chunkArray(tIds, 10);
      chunks.forEach(chunk => {
        const kq = rt 
          ? query(collection(db, "kas"), where("tenantId", "in", chunk), where("rt", "==", rt), limit(1000)) 
          : query(collection(db, "kas"), where("tenantId", "in", chunk), limit(1000));
        
        unsubs.push(onSnapshot(kq, (snap) => {
          console.log("Firestore update for kas, tenant(s):", chunk, "count:", snap.size);
          setKasData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))]);
        }, (err) => {
          console.warn("Failed to subscribe to kas:", err);
        }));
        
        const iuranQ = hasFullAccess ? 
          (rt ? query(collection(db, "iuran"), where("tenantId", "in", chunk), where("rt", "==", rt)) : query(collection(db, "iuran"), where("tenantId", "in", chunk))) :
          query(collection(db, "iuran"), where("tenantId", "in", chunk), where("userId", "==", auth.currentUser?.uid || ""));
        
        unsubs.push(onSnapshot(query(iuranQ, limit(1000)), (snap) => setIuranData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))])));
      });
    }

    return () => unsubs.forEach(u => u());
  }, [activeTenantIds, currentUser?.uid, hasFullAccess, chunkArray]);

  // 3. Posyandu & Health Sync
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    if (activeTab !== "posyandu") return;

    const tIds = activeTenantIds;
    if (tIds.length === 0) return;
    const collections = ["balita", "ibu_hamil", "posyandu_kegiatan", "posbindu_kegiatan", "pemeriksaan_balita", "pemeriksaan_posbindu", "imunisasi"];
    const unsubs: (() => void)[] = [];
    const chunks = chunkArray(tIds, 10);
    
    chunks.forEach(chunk => {
      collections.forEach(col => {
        const q = query(collection(db, col), where("tenantId", "in", chunk), limit(500));
        unsubs.push(onSnapshot(q, (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          if (col === "balita") setBalitaData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "ibu_hamil") setIbuHamilData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "posyandu_kegiatan") setPosyanduKegiatanData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "posbindu_kegiatan") setPosbinduKegiatanData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "pemeriksaan_balita") setPemeriksaanBalitaData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "pemeriksaan_posbindu") setPemeriksaanPosbinduData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
          else if (col === "imunisasi") setImunisasiData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
        }));
      });
    });

    return () => unsubs.forEach(unsub => unsub());
  }, [activeTab, activeTenantIds, currentUser?.uid, chunkArray]);

  // 4. Inventory, Trash Bank, Store & more
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tIds = activeTenantIds;
    if (tIds.length === 0) return;
    const tIdsChunks = chunkArray(tIds, 10);
    const unsubs: (() => void)[] = [];

    // Inventaris
    if (activeTab === "inventaris") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "inventaris"), where("tenantId", "in", chunk), limit(500)), (snap) => setInventarisData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))] )));
         unsubs.push(onSnapshot(query(collection(db, "inventaris_logs"), where("tenantId", "in", chunk), limit(500)), (snap) => setInventarisLogs(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))] )));
      });
    }

    // Bank Sampah
    if (activeTab === "bank-sampah") {
      ["sampah_kategori", "sampah_setoran", "sampah_tarik_saldo"].forEach(c => {
        tIdsChunks.forEach(chunk => {
           unsubs.push(onSnapshot(query(collection(db, c), where("tenantId", "in", chunk), limit(1000)), (snap) => {
              const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
              if (c === "sampah_kategori") setSampahKategoriData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
              else if (c === "sampah_setoran") setSampahSetoranData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
              else setSampahTarikSaldoData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
           }));
        });
      });
    }

    // Kependudukan
    if (activeTab === "kependudukan") {
      ["kelahiran", "kematian"].forEach(c => {
        tIdsChunks.forEach(chunk => {
           unsubs.push(onSnapshot(query(collection(db, c), where("tenantId", "in", chunk), limit(1000)), (snap) => {
              const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
              if (c === "kelahiran") setKelahiranData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
              else setKematianData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...data]);
           }));
        });
      });
    }

    // Shop/Store
    if (activeTab === "etoko") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "toko_products"), where("tenantId", "in", chunk), limit(1000)), snap => setTokoProducts(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))])));
         unsubs.push(onSnapshot(query(collection(db, "toko_orders"), where("tenantId", "in", chunk), limit(1000)), snap => setTokoOrders(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))])));
         unsubs.push(onSnapshot(query(collection(db, "toko_reviews"), where("tenantId", "in", chunk), limit(500)), snap => setTokoReviews(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))])));
      });
    }

    return () => unsubs.forEach(u => u());
  }, [activeTab, activeTenantIds, currentUser?.uid, chunkArray]);

  // 5. Surat, Voting, Booking & Misc Sync
  useEffect(() => {
    if (!currentUser && !wargaAuth) return;
    const tIds = activeTenantIds;
    if (tIds.length === 0) return;
    const unsubs: (() => void)[] = [];
    const tIdsChunks = chunkArray(tIds, 10);

    // Surat - Sync for all pengurus tabs and also for active citizens (wargaAuth)
    if (activeTab === "surat" || activeTab === "dashboard" || activeTab === "ai-bot" || !!wargaAuth || activeTab === "profile") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "surat"), where("tenantId", "in", chunk), limit(500)), snap => {
            setSuratData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))]);
         }));
      });
    }

    // Voting
    if (activeTab === "voting") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "voting_candidates"), where("tenantId", "in", chunk), limit(500)), snap => setVotingCandidates(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(d => ({ docId: d.id, ...d.data() } as any))])));
      });
      if (activeTenantId) {
        unsubs.push(onSnapshot(doc(db, "voting_config", activeTenantId), snap => snap.exists() && setVotingConfig(snap.data())));
      }
      if (["ADMIN", "SUPER_ADMIN", "RT", "RW"].includes(currentUser?.role?.toUpperCase())) {
         tIdsChunks.forEach(chunk => {
            unsubs.push(onSnapshot(query(collection(db, "voting_votes"), where("tenantId", "in", chunk), limit(1000)), snap => setUserVotes(prev => [...prev.filter(p => !chunk.includes((p as any).tenantId)), ...snap.docs.map(d => ({ id: d.id, ...d.data() } as any))])));
         });
      } else {
         if (currentUser?.id) {
           unsubs.push(onSnapshot(query(collection(db, "voting_votes"), where("voterId", "==", currentUser?.id || wargaAuth?.nik || ""), limit(50)), snap => setUserVotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))));
         }
      }
    }

    // Booking
    if (activeTab === "booking" || activeTab === "dashboard" || activeTab === "ai-bot") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "bookings"), where("tenantId", "in", chunk), limit(500)), snap => setBookingsData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(d => ({ id: d.id, ...d.data() } as any))])));
      });
    }

    // Complaints
    if (activeTab === "complaint" || activeTab === "dashboard" || activeTab === "ai-bot") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "complaints"), where("tenantId", "in", chunk), limit(500)), snap => setComplaintsData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(d => ({ id: d.id, ...d.data() } as any))])));
      });
    }

    // Verifikasi
    if (activeTab === "verifikasi" || activeTab === "dashboard") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "verifikasi_warga"), where("tenantId", "in", chunk), limit(500)), snap => setVerifikasiWargaData(prev => [...prev.filter(p => !chunk.includes(p.tenantId)), ...snap.docs.map(d => ({ id: d.id, ...d.data() } as any))])));
      });
    }

    // Audit Logs
    if (activeTab === "audit") {
      tIdsChunks.forEach(chunk => {
         unsubs.push(onSnapshot(query(collection(db, "audit_logs"), where("tenantId", "in", chunk), orderBy("timestamp", "desc"), limit(100)), snap => setAuditLogs(prev => {
            const newDocs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
            return [...prev.filter(p => !chunk.includes(p.tenantId)), ...newDocs].sort((a,b) => b.timestamp - a.timestamp).slice(0, 100);
         })));
      });
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

  // 6b. Automation: Day 31 Free-Tier Expiration, Data Zero-Wipe & Lead Storage
  useEffect(() => {
    const handleDay31WipeForActiveTenant = async () => {
      // 1. Handled loaded current tenant
      if (currentTenant && currentTenant.id !== "MASTER" && currentTenant.id !== "rw26_berjuang") {
        const trialStatus = getTrialStatus(currentTenant, currentUser);
        if (trialStatus.phase === "DELETED" && !currentTenant.isWiped) {
          console.log(`[AUTO-WIPE] Expiration detected for active tenant: ${currentTenant.id}. Purging tables...`);
          try {
            await runDataPurge(currentTenant);
          } catch (err) {
            console.error("[AUTO-WIPE] Active tenant purge failed:", err);
          }
        }
      }

      // 2. Super-admin background sweep for all registered stale trials
      if (currentUser?.isSuperAdmin && tenantsData.length > 0) {
        for (const tenant of tenantsData) {
          if (tenant.id === "MASTER" || tenant.id === "rw26_berjuang") continue;
          const statusResult = getTrialStatus(tenant, null);
          if (statusResult.phase === "DELETED" && !tenant.isWiped) {
            console.log(`[AUTO-WIPE] background sweep purging stale tenant: ${tenant.id}`);
            try {
              await runDataPurge(tenant);
            } catch (pErr) {
              console.error(`[AUTO-WIPE] Background tenant purge failed for ${tenant.id}:`, pErr);
            }
          }
        }
      }
    };

    const runDataPurge = async (t: any) => {
      const collectionsToWipe = [
        "data_warga",
        "kas",
        "iuran",
        "inventaris",
        "inventaris_logs",
        "toko_products",
        "toko_orders",
        "toko_reviews",
        "surat",
        "voting_candidates",
        "voting_votes",
        "bookings",
        "complaints",
        "verifikasi_warga",
        "audit_logs",
        "balita",
        "ibu_hamil",
        "posyandu_kegiatan",
        "posbindu_kegiatan",
        "pemeriksaan_balita",
        "pemeriksaan_posbindu",
        "imunisasi",
        "sampah_kategori",
        "sampah_setoran",
        "sampah_tarik_saldo",
        "kelahiran",
        "kematian",
        "emergencies",
        "kop_templates"
      ];

      for (const colName of collectionsToWipe) {
        try {
          const q = query(collection(db, colName), where("tenantId", "==", t.id));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const batch = writeBatch(db);
            snap.docs.forEach((docSnap) => {
              batch.delete(docSnap.ref);
            });
            await batch.commit();
            console.log(`[AUTO-WIPE] Purged ${snap.size} documents from ${colName} for tenant ${t.id}`);
          }
        } catch (e) {
          console.warn(`[AUTO-WIPE] Error clean collection ${colName} for ${t.id}:`, e);
        }
      }

      // Record to free_tier_followups
      await setDoc(doc(db, "free_tier_followups", t.id), {
        tenantId: t.id,
        tenantName: t.name || t.nama || "",
        adminEmail: t.adminEmail || t.email || "",
        phone: t.phone || t.adminPhone || t.telepon || "",
        createdAt: t.createdAt || new Date().toISOString(),
        expiredAt: new Date().toISOString(),
        followUpStatus: "NEW",
        isWiped: true,
        isFollowedUp: false,
        source: "AUTO_WIPE_DAY_31"
      });

      // Update tenant status to EXPIRED & isWiped
      await updateDoc(doc(db, "tenants", t.id), {
        status: "EXPIRED",
        isWiped: true,
        wipedAt: new Date().toISOString()
      });

      // If active currentTenant, synchronize state
      if (currentTenant && currentTenant.id === t.id) {
        setCurrentTenant((prev: any) => ({
          ...prev,
          status: "EXPIRED",
          isWiped: true,
          wipedAt: new Date().toISOString()
        }));
      }
    };

    handleDay31WipeForActiveTenant();
  }, [currentTenant?.id, currentTenant?.isWiped, tenantsData.length, currentUser?.isSuperAdmin]);

  // --- CENTRAL CONFIG HELPERS ---
  const getSetting = (key: string) => {
    return settings[key] || parentSettings[key] || "";
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

  // --- TENANT SPECIFIC LOCALSTORAGE PERSISTENCE (SECURE CONTEXT) ---

  // Effect to load data from tenant-specific cache when active tenant changing
  useEffect(() => {
    if (!activeTenantId) return;

    // Load Warga
    const savedWarga = safeLocalStorage.getItem(`${activeTenantId}_wargaData`);
    if (savedWarga) {
      try {
        setWargaData(JSON.parse(savedWarga));
      } catch (e) {
        setWargaData(INITIAL_WARGA_DATA);
      }
    } else {
      setWargaData(INITIAL_WARGA_DATA);
    }

    // Load Kas
    const savedKas = safeLocalStorage.getItem(`${activeTenantId}_kasData`);
    console.log("Loading Kas from localStorage, tenant:", activeTenantId, "found:", !!savedKas);
    if (savedKas) {
      try {
        setKasData(JSON.parse(savedKas));
      } catch (e) {
        console.error("Error parsing Kas from localStorage:", e);
        setKasData(INITIAL_KAS_DATA);
      }
    } else {
      setKasData(INITIAL_KAS_DATA);
    }

    // Load Surat
    const savedSurat = safeLocalStorage.getItem(`${activeTenantId}_suratData`);
    if (savedSurat) {
      try {
        setSuratData(JSON.parse(savedSurat));
      } catch (e) {
        setSuratData(INITIAL_SURAT_DATA);
      }
    } else {
      setSuratData(INITIAL_SURAT_DATA);
    }

    // Load Iuran
    const savedIuran = safeLocalStorage.getItem(`${activeTenantId}_iuranData`);
    if (savedIuran) {
      try {
        setIuranData(JSON.parse(savedIuran));
      } catch (e) {
        setIuranData([]);
      }
    } else {
      setIuranData([]);
    }

    // Load Inventaris
    const savedInventaris = safeLocalStorage.getItem(`${activeTenantId}_inventarisData`);
    if (savedInventaris) {
      try {
        setInventarisData(JSON.parse(savedInventaris));
      } catch (e) {
        setInventarisData(INITIAL_INVENTARIS_DATA);
      }
    } else {
      setInventarisData(INITIAL_INVENTARIS_DATA);
    }
  }, [activeTenantId]);

  // Effects to sync data to tenant-specific localStorage cache
  useEffect(() => {
    if (activeTenantId && wargaData && wargaData !== INITIAL_WARGA_DATA) {
      safeLocalStorage.setItem(`${activeTenantId}_wargaData`, JSON.stringify(wargaData));
    }
  }, [wargaData, activeTenantId]);

  useEffect(() => {
    if (activeTenantId && kasData && kasData !== INITIAL_KAS_DATA) {
      safeLocalStorage.setItem(`${activeTenantId}_kasData`, JSON.stringify(kasData));
    }
  }, [kasData, activeTenantId]);

  useEffect(() => {
    if (activeTenantId && suratData && suratData !== INITIAL_SURAT_DATA) {
      safeLocalStorage.setItem(`${activeTenantId}_suratData`, JSON.stringify(suratData));
    }
  }, [suratData, activeTenantId]);

  useEffect(() => {
    if (activeTenantId && iuranData && iuranData.length > 0) {
      safeLocalStorage.setItem(`${activeTenantId}_iuranData`, JSON.stringify(iuranData));
    }
  }, [iuranData, activeTenantId]);

  useEffect(() => {
    if (activeTenantId && inventarisData && inventarisData !== INITIAL_INVENTARIS_DATA) {
      safeLocalStorage.setItem(`${activeTenantId}_inventarisData`, JSON.stringify(inventarisData));
    }
  }, [inventarisData, activeTenantId]);

  // Remove legacy insecure global cache keys
  useEffect(() => {
    const legacyKeys = ["rw26_wargaData", "rw26_kasData", "rw26_suratData", "rw26_iuranData", "rw26_inventarisData"];
    legacyKeys.forEach(k => {
      try {
        safeLocalStorage.removeItem(k);
      } catch(e) {}
    });
  }, []);

  useEffect(() => {
    // DEV AUTO-ACTIVATE: Ensure our main developer has all features enabled
    const autoActivate = async () => {
      const isDevEmail =
        currentUser?.email?.toLowerCase() === "arifrajcoach@gmail.com" ||
        auth.currentUser?.email?.toLowerCase() === "arifrajcoach@gmail.com";
      if (
        isDevEmail &&
        currentTenant &&
        currentTenant.status !== "PREMIUM" &&
        currentTenant.status !== "ENTERPRISE"
      ) {
        const tId = currentUser?.tenantId || wargaAuth?.tenantId || "";
        if (tId === "MASTER") return; // Skip virtual tenant update
        console.log("Auto-activating PREMIUM for dev account...");
        try {
          await updateDoc(doc(db, "tenants", tId), {
            status: "PREMIUM",
            updatedAt: new Date().toISOString(),
          });
          // Also set as super admin for this login session
          if (!currentUser?.isSuperAdmin) {
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
            tenantId: warga.tenantId || currentTenant?.id || "",
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
    const mode = settings?.themeMode || "rt_rw";
    return [
      { id: "dashboard", label: "DASHBOARD", icon: LayoutDashboard },
      {
        id: "warga",
        label: getTranslatedLabel("Data Warga", mode),
        icon: Users,
      },
      {
        id: "kependudukan",
        label: "Info Lahir & Wafat",
        icon: ClipboardList,
      },
      // --- KEBUTUHAN WARGA ---
      {
        id: "buku-tamu",
        label: "Buku Tamu",
        icon: BookCopy,
        plan: "bukuTamu",
      },
      {
        id: "sos-monitor",
        label: "MONITOR SOS",
        icon: ShieldAlert,
        className: "mt-0 pt-0 pb-0",
      },
      {
        id: "complaint",
        label: mode === "apartemen" ? "LAPOR PAK" : "LAPOR PAK",
        icon: AlertTriangle,
        plan: "complaint",
      },
      {
        id: "booking",
        label: mode === "apartemen" ? "Booking Fasilitas" : "Booking Fasum",
        icon: Calendar,
        plan: "booking",
      },
      {
        id: "etoko",
        label: "E-LAPAK +26",
        icon: ShoppingBag,
        plan: "eLapak",
      },
      {
        id: "voting",
        label: mode === "apartemen" ? "Voting Penghuni" : "E-Pemilu",
        icon: Vote,
        plan: "ePemilu",
        minPlan: "PRO",
      },
      { id: "organisasi", label: "Struktur Organisasi", icon: Network },
      {
        id: "ai-bot",
        label: "AI Agent",
        icon: Bot,
        plan: "ai",
      },
      // --- FITUR OPERATOR ---
      {
        id: "verifikasi",
        label: getTranslatedLabel("Verifikasi Warga", mode).toUpperCase(),
        icon: ShieldCheck,
        plan: "verifikasi",
      },
      {
        id: "keuangan",
        label: getTranslatedLabel("Keuangan", mode),
        icon: CreditCard,
        plan: "keuangan",
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
        label: getTranslatedLabel("Surat", mode),
        icon: FileText,
        plan: "surat",
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
      },
      {
        id: "audit",
        label: "GOVERNANCE",
        icon: Shield,
      },
      {
        id: "analitik",
        label: "ANALYTICS AI",
        icon: Activity,
        plan: "analytics",
      },
      { id: "panduan-admin", label: "Panduan Admin", icon: HelpCircle },
      { id: "pengaturan", label: "Pengaturan", icon: Settings },
    ]
      .filter((item) => {
        const role = (currentUser?.role || "TAMU").toUpperCase();
        const isSuperAdmin = !!currentUser?.isSuperAdmin;
        const isVerified = linkedWarga?.terverifikasi === true;
        const planConfig = getPlanFeatures(currentTenant);
        const isStarterPlan =
          (currentTenant?.status || "TRIAL") === "TRIAL" ||
          (currentTenant?.status || "TRIAL") === "STARTER";

        const planLevels: Record<string, number> = {
          'TRIAL': 0, 'STARTER': 0,
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

        const isPlatformOwner =
          currentUser?.email?.toLowerCase() === "arifrajcoach@gmail.com" ||
          auth.currentUser?.email?.toLowerCase() === "arifrajcoach@gmail.com";
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
        if ((role === "ADMIN" || role === "RT") && isStarterPlan) {
          if (["inventaris", "posyandu", "bank-sampah"].includes(item.id))
            return false;
        }

        const rolePermissions: { [key: string]: string[] } = {
          SUPER_ADMIN: [
            "dashboard",
            "warga",
            "kependudukan",
            "buku-tamu",
            "complaint",
            "booking",
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
            "analitik",
            "organisasi",
            "panduan-admin",
          ],
          KELURAHAN_ADMIN: [
            "dashboard",
            "warga",
            "kependudukan",
            "complaint",
            "booking",
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
            "analitik",
            "organisasi",
            "panduan-admin",
          ],
          ADMIN: [
            "dashboard",
            "warga",
            "kependudukan",
            "buku-tamu",
            "complaint",
            "booking",
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
            "analitik",
            "organisasi",
            "panduan-admin",
          ],
          RW: [
            "dashboard",
            "warga",
            "kependudukan",
            "buku-tamu",
            "complaint",
            "booking",
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
            "analitik",
            "pengaturan",
            "organisasi",
            "panduan-admin",
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
            "analitik",
            "kependudukan",
            "organisasi",
            "panduan-admin",
            "audit",
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
            "analitik",
            "complaint",
            "booking",
            "kependudukan",
            "organisasi",
            "panduan-admin",
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
            "analitik",
            "kependudukan",
            "organisasi",
            "panduan-admin",
          ],
          BENDAHARA: ["dashboard", "keuangan", "bank-sampah", "chat", "ai-bot", "analitik", "panduan-admin"],
          SATPAM: ["dashboard", "buku-tamu", "sos-monitor"],
          KADER: ["dashboard", "posyandu", "bank-sampah", "chat", "panduan-admin"],
          WARGA: [
            "dashboard",
            "keuangan",
            "posyandu",
            "bank-sampah",
            "etoko",
            "voting",
            "surat",
            "complaint",
            "booking",
            "inventaris",
            "organisasi",
            "kependudukan",
            "sos-monitor",
          ],
          TAMU: ["dashboard", "etoko"],
          VIEWER: ["dashboard", "etoko"],
        };

        const allowed = rolePermissions[role] || ["dashboard"];
        if (item.id === "organisasi" && role !== "WARGA" && role !== "TAMU" && role !== "VIEWER") return true;
        
        let hasAccess = allowed.includes(item.id);
        if (item.id === "inventaris" && role === "WARGA") {
          const allowedGlobally = settings?.allow_warga_inventaris === "true" || settings?.allow_warga_inventaris === true;
          const allowedIndividually = currentUser?.allow_warga_inventaris === true || currentUser?.allow_warga_inventaris === "true";
          if (!allowedGlobally && !allowedIndividually) {
            hasAccess = false;
          }
        }
        return hasAccess;
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

  if (isAuthInitializing && !isAuthHanging) {
    return (
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.08)_0%,radial-gradient(circle_at_center,rgba(255,105,180,0.03)_30%,rgba(15,23,42,1)_80%))] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
        {/* Glow effect background element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative mb-10 pt-4 scale-95 sm:scale-100 transition-all">
          {/* Outer high-tech dotted pulsing ring (clockwise spin-zoom) */}
          <div className="w-32 h-32 rounded-full border border-dashed border-brand-blue/30 animate-spin-zoom absolute top-0 left-0" />
          
          {/* Middle neon thin glowing ring (counter-clockwise spin-zoom) */}
          <div className="w-32 h-32 rounded-full border-t border-b-2 border-brand-pink/50 border-r border-l-0 animate-spin-zoom-reverse absolute top-0 left-0 shadow-[0_0_15px_rgba(255,105,180,0.15)]" />
          
          {/* Innermost pulsing ambient scale ring */}
          <div className="w-32 h-32 rounded-full border border-brand-blue/20 bg-slate-900/40 backdrop-blur-md flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
            <div className="relative p-3 bg-slate-950/80 rounded-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <AppLogo
                size={14}
                className="w-14 h-14 object-contain scale-100 hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-sm px-4">
          <div className="flex items-center justify-center gap-1.5 mb-2.5">
            <span className="h-[2px] w-4 bg-brand-blue/40 rounded-full"></span>
            <h1 className="text-white font-black tracking-[0.25em] text-[13px] uppercase font-sans">
              SmaRt<span className="text-brand-blue">RW</span> <span className="text-brand-pink">AI</span>
            </h1>
            <span className="h-[2px] w-4 bg-brand-pink/40 rounded-full"></span>
          </div>

          <h2 className="text-slate-200 font-extrabold tracking-[0.18em] text-[10px] uppercase font-sans mb-1.5">
            Menyiapkan Ekosistem Digital
          </h2>
          <p className="text-slate-400/60 text-[9px] uppercase tracking-[0.12em] font-medium max-w-[280px] mx-auto leading-relaxed mb-10">
            Memeriksa Sesi & Sinkronisasi Keamanan Wilayah...
          </p>
          
          {/* Safe bypass controls */}
          <div className="pt-2">
            <button 
              onClick={() => {
                safeLocalStorage.clear();
                safeSessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-slate-900/60 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-full text-[9px] font-bold uppercase transition-all tracking-wider border border-slate-800/80 hover:border-red-900/30 cursor-pointer shadow-sm active:scale-95"
            >
              Reset Sesi & Perbaiki Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log("App: Auth Initialized. User:", currentUser?.uid, "WargaAuth:", !!wargaAuth);

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
        tenantId={currentUser?.tenantId || safeLocalStorage.getItem("lastActiveTenantId") || "rw26_berjuang"}
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
      (currentUser?.role === "Warga" &&
        currentUser?.name === "Warga (Anonymous)"))
  ) {
    return (
      <>
        <LoginView
          setWargaAuth={setWargaAuth}
          setCurrentUser={setCurrentUser}
          wargaData={filteredWargaDataCentral}
          verifikasiWargaData={verifikasiWargaData}
          isLoadingDB={isLoadingDB}
          onSelfRegister={() => setIsSelfRegistering(true)}
          onShowFreeTrial={(planId) => {
            setSelectedPlan(planId || 'TRIAL');
            setShowFreeTrialModal(true);
          }}
          onShowPricing={() => setShowPricingModal(true)}
          settings={settings}
          tenantId={currentUser?.tenantId || ""}
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
              Hari Ke-31: Penghapusan Otomatis Selesai
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-8 text-left">
              Masa aktif Paket Starter / Uji Coba untuk wilayah <strong className="text-slate-200 uppercase">{currentTenant.name || "Anda"}</strong> telah berakhir dan masuk hari ke-31 tanpa adanya upgrade ke Paket Berbayar (Flash, Pro, Premium, atau Enterprise).
              <br /><br />
              Sesuai dengan kebijakan privasi platform dan pembersihan data otomatis berkala, <strong>seluruh database riwayat warga, pembukuan kas, iuran, mading, posyandu, dan surat pengantar wilayah Anda telah dihapus secara permanen secara otomatis</strong> dari server kami.
              <br /><br />
              Email administratif dan database tenant Anda telah disimpan dalam basis data follow-up SmaRtRw AI agar kami bisa menghubungi Anda melalui email dan WA untuk penawaran spesial upgrade.
            </p>

            <div className="w-full bg-slate-950/40 border border-slate-800/60 p-5 rounded-2xl mb-8 text-left space-y-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Status Data Wilayah Anda:
              </h4>
              <ul className="text-[11px] text-slate-400 space-y-1 bg-transparent font-sans list-disc list-inside">
                <li>Hari 1-30: Masa uji coba penuh aktif.</li>
                <li className="text-red-400 font-bold">Hari 31+: Penghapusan data otomatis dan permanen (Wipe Total).</li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => window.open(`https://wa.me/6287726741143?text=Halo%20Admin%20SmaRtRw%20AI,%20kami%20terbawa%20penghapusan%20data%20karena%20telat%20upgrade%20untuk%20tenant%20${currentTenant.id}.%20Apakah%20kami%20bisa%20daftar%20baru?`, "_blank")}
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


  }

  if (wargaAuth && !currentUser?.isSuperAdmin) {
    return (
      <div className="relative w-full min-h-screen md:h-screen overflow-y-auto md:overflow-hidden bg-slate-50">
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

        {/* SOS EMERGENCY OVERLAY FOR WARGA */}
        <AnimatePresence>
          {activeEmergency && (
            <SOSOverlay
              key={activeEmergency.id}
              emergency={activeEmergency}
              onResolve={(id) => {
                handleResolveSOS(id);
              }}
              onCloseLocal={() => setHiddenEmergencyId(activeEmergency.id)}
              onStopSiren={() => setIsLocalAlarmActive(false)}
              setActiveTab={() => {}}
              canResolve={(() => {
                const isOwner = auth.currentUser?.uid === activeEmergency.userId ||
                                (wargaAuth && (wargaAuth.uid === activeEmergency.userId || wargaAuth.nik === activeEmergency.userId));
                return isOwner;
              })()}
            />
          )}
        </AnimatePresence>

        {/* PANIC BUTTON (SOS) - BOTTOM RIGHT (DRAGGABLE FOR WARGA) */}
        <motion.button
          drag
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={{ left: -1500, right: 100, top: -1500, bottom: 100 }}
          whileDrag={{ scale: 1.1, cursor: "grabbing" }}
          whileTap={{ scale: 0.9 }}
          draggable={false}
          onTap={() => {
            if (activeEmergency) {
              const isOwner = auth.currentUser?.uid === activeEmergency.userId ||
                              (wargaAuth && (wargaAuth.uid === activeEmergency.userId || wargaAuth.nik === activeEmergency.userId));

              if (isOwner) {
                if (window.confirm("Hentikan sinyal darurat aktif?")) {
                  handleResolveSOS(activeEmergency.id);
                }
                return;
              }
            }
            handleTriggerSOS();
          }}
          disabled={isSOSTriggering}
          className={`fixed bottom-6 right-6 z-[60] w-16 h-16 ${activeEmergency ? 'bg-emerald-600 shadow-emerald-300 hover:bg-emerald-700' : 'bg-red-600 shadow-red-300 hover:bg-red-700'} text-white rounded-full flex items-center justify-center shadow-2xl group ring-4 ring-white cursor-grab touch-none`}
          title={activeEmergency ? "STOP SOS" : "TOMBOL DARURAT (SOS)"}
        >
          {isSOSTriggering ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : activeEmergency ? (
            <CheckCircle className="w-8 h-8" />
          ) : (
            <Siren className="w-8 h-8" />
          )}
        </motion.button>

        {/* SOS CONFIRMATION MODAL FOR WARGA */}
        <AnimatePresence>
          {isSOSConfirmOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 ">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] p-8 text-center shadow-2xl border border-red-100 dark:border-red-950"
              >
                <div className="w-24 h-24 bg-red-100 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50 dark:ring-red-950/20">
                  <Siren className="w-12 h-12 text-red-600 " />
                </div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter mb-4">
                  Kirim Sinyal Darurat?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-base font-medium leading-relaxed mb-6 px-2">
                  Tindakan ini akan memberitahukan seluruh pengurus dan warga RW / RT secara instan. Gunakan hanya untuk keadaan mendesak.
                </p>

                {/* ADVANCED GPS ACCURACY CALIBRATION FOR OFF-TRACK COORDINATES */}
                <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-left font-sans">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      Akurasi Lokasi SOS
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCalibratingSOS(!isCalibratingSOS)}
                      className="text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase tracking-tight underline border-none bg-transparent cursor-pointer"
                    >
                      {isCalibratingSOS ? "Tutup" : "Kalibrasi GPS"}
                    </button>
                  </div>
                  
                  {!isCalibratingSOS ? (
                    <div>
                      {useCustomSOSCoords ? (
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            GPS Terkalibrasi Aktif
                          </p>
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                            Lat: {customSOSLat} | Lng: {customSOSLng}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                            GPS Otomatis (Browser)
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                            Mengikuti sistem pencarian satelit perangkat Anda. Jika meleset / geser ke wilayah Slipi/Katalia, harap lakukan **Kalibrasi GPS**.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-col gap-2">
                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Pilih Lokasi Akurat Anda</label>
                        <MapPicker 
                          lat={parseFloat(customSOSLat) || 0} 
                          lng={parseFloat(customSOSLng) || 0} 
                          onChange={(newLat, newLng) => {
                            setCustomSOSLat(newLat.toString());
                            setCustomSOSLng(newLng.toString());
                          }}
                        />
                        {(customSOSLat && customSOSLng) && (
                          <div className="grid grid-cols-2 gap-2 mt-1">
                             <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-800">
                               <p className="text-[8px] font-bold text-slate-400 uppercase">Latitude</p>
                               <p className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{customSOSLat}</p>
                             </div>
                             <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-800">
                               <p className="text-[8px] font-bold text-slate-400 uppercase">Longitude</p>
                               <p className="text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 truncate">{customSOSLng}</p>
                             </div>
                          </div>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 leading-tight">
                        💡 **Tips**: Geser pin merah di peta untuk menentukan koordinat presisi rumah Anda. Ini menjadi lokasi acuan jika terjadi SOS darurat!
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            if (!customSOSLat || !customSOSLng) {
                              alert("Harap isi Latitude dan Longitude!");
                              return;
                            }
                            const latNum = parseFloat(customSOSLat);
                            const lngNum = parseFloat(customSOSLng);
                            
                            safeLocalStorage.setItem("custom_sos_lat", customSOSLat.trim());
                            safeLocalStorage.setItem("custom_sos_lng", customSOSLng.trim());
                            setUseCustomSOSCoords(true);
                            setIsCalibratingSOS(false);
                            
                            // Back up to Cloud Database synchronously
                            try {
                              const citizenDocId = mergedWargaProfile?.docId;
                              if (citizenDocId) {
                                await updateDoc(doc(db, "data_warga", citizenDocId), {
                                  latitude: latNum,
                                  longitude: lngNum
                                });
                              }
                              if (currentUser?.uid) {
                                await updateDoc(doc(db, "users", currentUser.uid), {
                                  latitude: latNum,
                                  longitude: lngNum
                                });
                              }
                            } catch (err) {
                              console.warn("Failed to backup GPS coordinates to database:", err);
                            }

                            setNotification({
                              message: "Lokasi GPS berhasil dikalibrasi & disimpan ke awan!",
                              type: "success"
                            });
                            setTimeout(() => setNotification(null), 2500);
                          }}
                          className="flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all text-center border-none cursor-pointer"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            safeLocalStorage.removeItem("custom_sos_lat");
                            safeLocalStorage.removeItem("custom_sos_lng");
                            setCustomSOSLat("");
                            setCustomSOSLng("");
                            setUseCustomSOSCoords(false);
                            setIsCalibratingSOS(false);
                            
                            // Remove from Cloud Database as well
                            try {
                              const citizenDocId = mergedWargaProfile?.docId;
                              if (citizenDocId) {
                                await updateDoc(doc(db, "data_warga", citizenDocId), {
                                  latitude: null,
                                  longitude: null
                                });
                              }
                              if (currentUser?.uid) {
                                await updateDoc(doc(db, "users", currentUser.uid), {
                                  latitude: null,
                                  longitude: null
                                });
                              }
                            } catch (err) {
                              console.warn("Failed to clear GPS coordinates from database:", err);
                            }

                            setNotification({
                              message: "Kembali menggunakan GPS otomatis bawaan browser.",
                              type: "info"
                            });
                            setTimeout(() => setNotification(null), 2500);
                          }}
                          className="py-1.5 px-2 bg-slate-250 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-all text-center border-none cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={confirmSOS}
                    className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-200 dark:shadow-none"
                  >
                    Ya, Kirim SOS Sekarang
                  </button>
                  <button
                    onClick={() => setIsSOSConfirmOpen(false)}
                    className="w-full py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black uppercase text-sm tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                  >
                    Batal
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* HIGH CONTRAST DUAL-STATE SIREN CONTROLLER BANNER */}
        {isLocalAlarmActive && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-auto">
            <div className="bg-amber-400 border-2 border-amber-500 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.5)] p-4 flex items-center justify-between gap-4 animate-bounce">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
                <div className="text-left font-sans max-w-[200px] sm:max-w-xs overflow-hidden">
                  <p className="text-xs font-black text-rose-700 uppercase tracking-tight flex items-center gap-1 animate-pulse truncate">
                    🚨 SOS: {activeEmergency?.userName || mergedWargaProfile?.nama || "Warga Tetangga"}
                  </p>
                  <p className="text-[10px] font-bold text-slate-900 truncate">
                    {activeEmergency?.userAddress || `Blok ${mergedWargaProfile?.blok || "-"}, RT ${mergedWargaProfile?.rt || "-"}/RW ${mergedWargaProfile?.rw || "-"}`}
                  </p>
                  <p className="text-[9px] font-bold text-slate-800 leading-none mt-0.5">Siklus Sirine: {localSOSLoopCount} / 12</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {(() => {
                  const rawLat = activeEmergency?.latitude ?? activeEmergency?.location?.latitude ?? activeEmergency?.location?.lat ?? activeEmergency?.lat ?? 0;
                  const rawLng = activeEmergency?.longitude ?? activeEmergency?.location?.longitude ?? activeEmergency?.location?.lng ?? activeEmergency?.lng ?? 0;
                  const lat = typeof rawLat === "string" ? parseFloat(rawLat) : Number(rawLat || 0);
                  const lng = typeof rawLng === "string" ? parseFloat(rawLng) : Number(rawLng || 0);
                  const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

                  const mapsUrl = hasCoords
                    ? `https://www.google.com/maps?q=loc:${lat},${lng}&z=19`
                    : `https://www.google.com/maps?q=${encodeURIComponent((activeEmergency?.userName ? activeEmergency.userName + " " : "") + (activeEmergency?.userAddress || "RW 26"))}`;

                  const handleShare = () => {
                    const text = `🚨 DARURAT SOS! 🚨\nSistem SmaRtRw AI Mengirim Peringatan:\n\nWarga: ${activeEmergency?.userName || mergedWargaProfile?.nama || "Warga Tetangga"}\nAlamat: ${activeEmergency?.userAddress || "Lihat Profil"}\nKoordinat: ${mapsUrl}\n\nMohon segera di cek!`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Darurat SOS!',
                        text: text,
                        url: mapsUrl
                      }).catch(() => {});
                    } else {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
                    }
                  };

                  return (
                    <>
                      <button
                        onClick={handleShare}
                        className="p-2 sm:p-2.5 bg-white text-blue-600 rounded-xl shadow-md border border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                        title="Bagikan Lokasi SOS"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-2.5 bg-white text-rose-700 rounded-xl shadow-md border border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                        title={hasCoords ? "Cek Lokasi Kejadian (GPS Coords)" : "Cek Lokasi Kejadian (Pencarian Alamat)"}
                        onClick={() => {
                          if (!hasCoords) {
                            showNotification?.("Membuka koordinat berbasis pencarian alamat karena GPS real-time tidak tersedia.", "info");
                          }
                        }}
                      >
                        <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${hasCoords ? "text-rose-700 animate-pulse" : "text-amber-600"}`} />
                      </a>
                    </>
                  );
                })()}
                <button
                  onClick={() => setIsLocalAlarmMuted(!isLocalAlarmMuted)}
                  className={`p-2 sm:p-2.5 ${isLocalAlarmMuted ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' : 'bg-red-700 hover:bg-red-800 text-white border-red-800'} rounded-xl shadow-md border transition-all flex items-center justify-center shrink-0`}
                  title={isLocalAlarmMuted ? "Aktifkan Sirene" : "Bisukan Sirene"}
                >
                  {isLocalAlarmMuted ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button
                  onClick={() => setIsLocalAlarmActive(false)}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer border border-slate-900 shrink-0"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans print:h-auto print:bg-white text-sm relative transition-colors duration-300">
      {/* HIGH CONTRAST DUAL-STATE SIREN CONTROLLER BANNER FOR PENGURUS */}
      {isLocalAlarmActive && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-auto">
          <div className="bg-amber-400 border-2 border-amber-500 rounded-2xl shadow-[0_10px_40px_rgba(245,158,11,0.5)] p-4 flex items-center justify-between gap-4 animate-bounce">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-ping shrink-0" />
              <div className="text-left font-sans max-w-[200px] sm:max-w-xs overflow-hidden">
                <p className="text-xs font-black text-rose-700 uppercase tracking-tight flex items-center gap-1 animate-pulse truncate">
                  🚨 SOS: {activeEmergency?.userName || mergedWargaProfile?.nama || "Warga Tetangga"}
                </p>
                <p className="text-[10px] font-bold text-slate-900 truncate">
                  {activeEmergency?.userAddress || `Blok ${mergedWargaProfile?.blok || "-"}, RT ${mergedWargaProfile?.rt || "-"}/RW ${mergedWargaProfile?.rw || "-"}`}
                </p>
                <p className="text-[9px] font-bold text-slate-800 leading-none mt-0.5">Siklus Sirine: {localSOSLoopCount} / 12</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {(() => {
                  const rawLat = activeEmergency?.latitude ?? activeEmergency?.location?.latitude ?? activeEmergency?.location?.lat ?? activeEmergency?.lat ?? 0;
                  const rawLng = activeEmergency?.longitude ?? activeEmergency?.location?.longitude ?? activeEmergency?.location?.lng ?? activeEmergency?.lng ?? 0;
                  const lat = typeof rawLat === "string" ? parseFloat(rawLat) : Number(rawLat || 0);
                  const lng = typeof rawLng === "string" ? parseFloat(rawLng) : Number(rawLng || 0);
                  const hasCoords = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;

                  const mapsUrl = hasCoords
                    ? `https://www.google.com/maps?q=loc:${lat},${lng}&z=19`
                    : `https://www.google.com/maps?q=${encodeURIComponent((activeEmergency?.userName ? activeEmergency.userName + " " : "") + (activeEmergency?.userAddress || "RW 26"))}`;

                  const handleShare = () => {
                    const text = `🚨 DARURAT SOS! 🚨\nSistem SmaRtRw AI Mengirim Peringatan:\n\nWarga: ${activeEmergency?.userName || mergedWargaProfile?.nama || "Warga Tetangga"}\nAlamat: ${activeEmergency?.userAddress || "Lihat Profil"}\nKoordinat: ${mapsUrl}\n\nMohon segera di cek!`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Darurat SOS!',
                        text: text,
                        url: mapsUrl
                      }).catch(() => {});
                    } else {
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
                    }
                  };

                  return (
                    <>
                      <button
                        onClick={handleShare}
                        className="p-2 sm:p-2.5 bg-white text-blue-600 rounded-xl shadow-md border border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                        title="Bagikan Lokasi SOS"
                      >
                        <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-2.5 bg-white text-rose-700 rounded-xl shadow-md border border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                        title={hasCoords ? "Cek Lokasi Kejadian (GPS Coords)" : "Cek Lokasi Kejadian (Pencarian Alamat)"}
                        onClick={() => {
                          if (!hasCoords) {
                            showNotification?.("Membuka koordinat berbasis pencarian alamat karena GPS real-time tidak tersedia.", "info");
                          }
                        }}
                      >
                        <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${hasCoords ? "text-rose-700 animate-pulse" : "text-amber-600"}`} />
                      </a>
                    </>
                  );
                })()}
                <button
                  onClick={() => setIsLocalAlarmMuted(!isLocalAlarmMuted)}
                  className={`p-2 sm:p-2.5 ${isLocalAlarmMuted ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700' : 'bg-red-700 hover:bg-red-800 text-white border-red-800'} rounded-xl shadow-md border transition-all flex items-center justify-center shrink-0`}
                  title={isLocalAlarmMuted ? "Aktifkan Sirene" : "Bisukan Sirene"}
                >
                  {isLocalAlarmMuted ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <BellOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button
                  onClick={() => setIsLocalAlarmActive(false)}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer border border-slate-900 shrink-0"
                >
                  Stop
                </button>
              </div>
          </div>
        </div>
      )}

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
            onStopSiren={() => setIsLocalAlarmActive(false)}
            setActiveTab={setActiveTab}
            canResolve={(() => {
              const role = (currentUser?.role || "").toUpperCase();
              const isPrivileged = 
                role === "ADMIN" || 
                role === "PENGURUS" || 
                role === "SATPAM" || 
                currentUser?.isSuperAdmin;
              const isOwner = auth.currentUser?.uid === activeEmergency.userId ||
                              (wargaAuth && (wargaAuth.uid === activeEmergency.userId || wargaAuth.nik === activeEmergency.userId));
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
              <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmaRtRw</span>
              <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
            </span>
          </h2>
          <p className="font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-6 transition-colors" style={{ fontSize: "11px" }}>
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
        <div style={{ height: '322.733px' }} className="p-8 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 relative overflow-hidden group rounded-tr-3xl md:rounded-none">
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
                  className="w-14 h-14"
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
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-pink uppercase font-bold">
                    {currentTenant?.name || settings?.nama_rt}
                  </span>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="flex items-center gap-1 justify-center">
                      <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent font-black">SmaRtRw</span>
                      <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent font-black drop-shadow-[0_1px_1px_rgba(251,113,133,0.3)] ml-0.5">AI</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase mt-1 opacity-60">
                      {getTranslatedLabel("Sistem RT/RW", settings?.themeMode)}
                    </span>
                  </div>
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
                    Powered by Nexapps
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

        <div style={{ height: '137.08px', paddingTop: '-8px', marginBottom: '-39px' }} className="-mt-6 flex-shrink-0 px-6 py-5 bg-slate-50/30 dark:bg-slate-800/30 border-b border-slate-100/50 dark:border-slate-800/50">
          <div style={{ paddingTop: '0px', marginTop: '12px', marginLeft: '0px' }} className="flex items-center gap-2.5 mb-3">
            <div className="relative flex">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-green shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-brand-green animate-ping opacity-20"></div>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest !mt-[-4px]">
              System Active
            </p>
          </div>
          <div style={{ marginTop: '-10px' }} className="p-3 bg-white/80 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-brand-blue/20">
            {getPlanFeatures(currentTenant).multiRegion ? (
              <div className="space-y-1.5">
                <label className="text-[9px] text-brand-blue font-black uppercase tracking-widest pl-1 mt-0 pt-0 pb-0">
                  Wilayah Kerja
                </label>
                <div className="relative">
                  <select
                    value={globalSelectedRw}
                    onChange={(e) => setGlobalSelectedRw(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold py-2 pl-3 pr-8 outline-none text-slate-700 dark:text-slate-200 appearance-none shadow-inner cursor-pointer mt-[2px]"
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
                <p className="text-[11px] text-brand-blue font-black uppercase tracking-wider mb-0.5">
                  Tenant ID
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-800 dark:text-slate-200 font-mono font-black truncate bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50 flex-1">
                    {(currentUser?.tenantId || wargaAuth?.tenantId) || ""}
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

            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-xl p-1.5 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                <AppLogo size={6} className="w-6 h-6" logoUrl={currentTenant?.logo_url || settings?.logo_url} />
              </div>
            </div>
            
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

              <button 
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 group text-slate-500 shadow-sm"
              >
                <Search className="w-3.5 h-3.5 group-hover:text-brand-blue" />
                <span className="text-xs font-medium mr-1 dark:text-slate-400">Search</span>
                <kbd className="text-[10px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded shadow-sm text-slate-400 font-sans">⌘ K</kbd>
              </button>

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
            
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 capitalize tracking-tight hidden lg:block font-elegant" style={{ fontFamily: "Verdana", fontStyle: "italic" }}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-400 dark:from-white dark:to-slate-500" style={{ fontFamily: "Verdana", fontStyle: "italic" }}>
                {activeTab === "etoko"
                  ? "E-LAPAK +26"
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
                  {currentUser?.name || wargaAuth?.nama || "User"}
                  {currentUser?.isSuperAdmin && (
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-brand-blue" />
                      <div className="absolute inset-0 bg-brand-blue/20 blur-[2px] rounded-full scale-110"></div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <span
                    className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full border shadow-sm inline-block transition-all
                      ${currentUser?.isSuperAdmin
                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20"
                        : "bg-brand-blue/5 text-brand-blue border-brand-blue/10"
                      }`}
                  >
                    {currentUser?.isSuperAdmin ? "Authority Role" : (currentUser?.role || wargaAuth?.role || "Warga")}
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
                        alt={currentUser?.name || wargaAuth?.nama || "User"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                      />
                    ) : (
                      <span className="drop-shadow-md">{(currentUser?.name || wargaAuth?.nama || "U").charAt(0)}</span>
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
        <div className={`flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible print:h-auto print:p-0 relative z-10 ${activeTab === 'super-admin' ? 'p-0' : 'p-3 md:p-6'}`}>
          {activeTab === "dashboard" && (
            <DashboardView
              allowedMenuItems={renderableNavItems}
              kasData={filteredKasDataCentral}
              wargaData={filteredWargaDataCentral}
              suratData={filteredSuratDataCentral}
              iuranData={filteredIuranDataCentral}
              emergenciesData={emergenciesData}
              handleTriggerSOS={handleTriggerSOS}
              onResolveSOS={handleResolveSOS}
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
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
              currentUser={currentUser || wargaAuth}
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
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
              tenantId={currentUser?.isSuperAdmin && selectedTenantId ? selectedTenantId : (currentUser?.tenantId || wargaAuth?.tenantId || "")}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              currentUser={currentUser || wargaAuth}
              settings={settings}
              tenantsData={tenantsData}
            />
          )}
          {activeTab === "buku-tamu" && (
            <BukuTamuView
              tamuData={bukuTamuData}
              setTamuData={setBukuTamuData}
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
              currentUser={currentUser || wargaAuth}
              tenantId={
                (currentUser?.tenantId && currentUser?.tenantId !== "unknown")
                  ? currentUser?.tenantId
                  : (wargaAuth?.tenantId || "rw26_berjuang")
              }
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
            />
          )}
          {activeTab === "sos-monitor" && (
            <SatpamDashboard tenantId={
                (currentUser?.tenantId && currentUser?.tenantId !== "unknown")
                  ? currentUser?.tenantId
                  : (wargaAuth?.tenantId || "rw26_berjuang")
              } />
          )}
          {activeTab === "organisasi" && (
            <OrganisasiView
              currentUser={currentUser || wargaAuth}
              currentTenant={currentTenant}
              settings={settings}
              showNotification={showNotification}
            />
          )}
          {activeTab === "verifikasi" && (
            (currentUser?.role === "WARGA" || wargaAuth?.role === "WARGA") ? (
              <WargaProfileView
                wargaData={mergedWargaProfile}
                verifikasiData={verifikasiWargaData}
                suratData={suratData}
                setSuratData={setSuratData}
                setWargaAuth={handleLogout}
                tenantId={mergedWargaProfile?.tenantId || "rw26_berjuang"}
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
                tenantId={activeTenantId || "rw26_berjuang"}
                isLoadingDB={isLoadingDB}
                setIsLoadingDB={setIsLoadingDB}
                showNotification={showNotification}
                handleFirestoreError={handleFirestoreError}
                currentUser={currentUser}
              />
            )
          )}
          {activeTab === "ai-bot" && (
            <AIChatBot currentUser={{
              ...currentUser,
              ...mergedWargaProfile,
              uid: currentUser?.uid || mergedWargaProfile?.uid || mergedWargaProfile?.nik || null,
              id: currentUser?.uid || mergedWargaProfile?.uid || mergedWargaProfile?.nik || null
            }} plan={currentTenant?.status} />
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
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
              currentUser={currentUser || wargaAuth}
              getSetting={getSetting}
              tenantId={activeTenantId || "rw26_berjuang"}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              plan={currentTenant?.status}
              isPengurus={["ADMIN", "SUPER_ADMIN", "OWNER", "RW", "RT", "BENDAHARA", "SEKRETARIS", "KADER"].includes(
                (currentUser?.role || wargaAuth?.role || "").toUpperCase(),
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
                wargaAuth={wargaAuth}
                tenantId={activeTenantId || "rw26_berjuang"}
                setIsLoadingDB={setIsLoadingDB}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
                getSetting={getSetting}
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
                wargaAuth={wargaAuth}
                tenantId={activeTenantId || "rw26_berjuang"}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
                getSetting={getSetting}
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
          {activeTab === "inventaris" && (() => {
            const role = (currentUser?.role || "TAMU").toUpperCase();
            const allowedGlobally = settings?.allow_warga_inventaris === "true" || settings?.allow_warga_inventaris === true;
            const allowedIndividually = currentUser?.allow_warga_inventaris === true || currentUser?.allow_warga_inventaris === "true";
            
            if (role === "WARGA" && !allowedGlobally && !allowedIndividually) {
              return (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-md mx-auto my-12 shadow-sm">
                  <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Akses Ditolak</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Anda tidak memiliki izin dari Admin untuk mengakses fitur Inventaris di wilayah ini. Hubungi pengurus RT/RW Anda untuk mengaktifkan akses.
                  </p>
                </div>
              );
            }
            return (
              <InventarisView
                inventarisData={inventarisData}
                setInventarisData={setInventarisData}
                inventarisLogs={inventarisLogs}
                setInventarisLogs={setInventarisLogs}
                inventarisKategori={inventarisKategori}
                inventarisLokasi={inventarisLokasi}
                inventarisSupplier={inventarisSupplier}
                userRole={currentUser?.role || wargaAuth?.role || "Warga"}
                currentUser={currentUser || wargaAuth}
                tenantId={activeTenantId || "rw26_berjuang"}
                setIsLoadingDB={setIsLoadingDB}
                handleFirestoreError={handleFirestoreError}
                showNotification={showNotification}
                handleFileUpload={handleFileUpload}
                setConfirmConfig={setConfirmConfig}
              />
            );
          })()}
          {activeTab === "kependudukan" && (currentUser || wargaAuth) && (
            <KependudukanView
              kelahiranData={kelahiranData}
              kematianData={kematianData}
              currentUser={currentUser || wargaAuth}
              tenantId={activeTenantId || "rw26_berjuang"}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              setIsLoadingDB={setIsLoadingDB}
              wargaData={filteredWargaDataCentral}
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
                userRole={currentUser?.role || wargaAuth?.role || "Warga"}
                currentUser={currentUser || wargaAuth}
                getSetting={getSetting}
                kopSettings={kopSettings}
                tenantId={activeTenantId || "rw26_berjuang"}
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
              currentUser={currentUser || wargaAuth}
              onAdd={() => setShowFreeTrialModal(true)} 
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
            />
          )}

          {activeTab === "users" && (
            <UsersView
              usersData={filteredUsersDataCentral}
              wargaData={filteredWargaDataCentral}
              setIsLoadingDB={setIsLoadingDB}
              handleFirestoreError={handleFirestoreError}
              tenantId={activeTenantId || "rw26_berjuang"}
              showNotification={showNotification}
              settings={settings}
              currentUser={currentUser || wargaAuth}
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
              tenantId={activeTenantId || "rw26_berjuang"}
              currentTenant={currentTenant}
              wargaData={filteredWargaDataCentral}
              settings={settings}
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              handleFirestoreError={handleFirestoreError}
              currentUser={currentUser || wargaAuth}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "panduan-admin" && <PanduanAdminView />}
          {activeTab === "voting" && (
            isLoadingDB ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                Memuat...
              </div>
            ) : getPlanFeatures(currentTenant || {}).ePemilu ? (
              <EVotingView
                userRole={currentUser?.role || wargaAuth?.role || "Warga"}
                tenantId={activeTenantId}
                candidates={votingCandidates}
                config={votingConfig}
                userVotes={userVotes}
                currentUser={currentUser || wargaAuth}
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
            )
          )}
          {activeTab === "etoko" && (
            <ETokoView
              userRole={currentUser?.role || wargaAuth?.role || "Warga"}
              tenantId={activeTenantId || "rw26_berjuang"}
              products={tokoProducts}
              orders={tokoOrders}
              reviews={tokoReviews}
              currentUser={currentUser || wargaAuth}
              wargaAuth={wargaAuth}
              handleFirestoreError={handleFirestoreError}
              handleFileUpload={handleFileUpload}
              showNotification={showNotification}
              accessMode={getPlanFeatures(currentTenant).eLapak}
              setShowUpgradeModal={setShowUpgradeModal}
              onBackToMain={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "analitik" &&
            (getPlanFeatures(currentTenant).analytics ? (
              <AnalyticsPremiumView
                tenantId={activeTenantId || currentUser?.tenantId || wargaAuth?.tenantId || ""}
                kasData={filteredKasDataCentral}
                wargaData={filteredWargaDataCentral}
                iuranData={filteredIuranDataCentral}
                kelahiranData={kelahiranData}
                kematianData={kematianData}
                suratData={suratData}
                complaintData={complaintsData}
                organizationName={currentTenant?.nama || currentTenant?.name || "RW DIGITAL"}
                showNotification={showNotification}
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

          {activeTab === "monitoring" && (
            <EnterpriseGovDashboard
              tenantId={activeTenantId || currentUser?.tenantId || wargaAuth?.tenantId || ""}
              wargaData={wargaData}
              currentUser={currentUser || wargaAuth}
              wargaAuth={wargaAuth}
            />
          )}
          {activeTab === "audit" && (
            <AuditLogView logs={auditLogs} />
          )}
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
      {(currentUser || wargaAuth) && (
        <motion.button
          drag
          dragMomentum={false}
          dragElastic={0.15}
          dragConstraints={{ left: -1500, right: 100, top: -1500, bottom: 100 }}
          whileDrag={{ scale: 1.1, cursor: "grabbing" }}
          whileTap={{ scale: 0.9 }}
          draggable={false}
          onTap={() => {
            if (activeEmergency) {
              const role = (currentUser?.role || "").toUpperCase();
              const canResolve =
                role === "ADMIN" ||
                role === "PENGURUS" ||
                role === "SATPAM" ||
                currentUser?.isSuperAdmin ||
                activeEmergency?.userId === auth.currentUser?.uid ||
                (wargaAuth && (wargaAuth.uid === activeEmergency?.userId || wargaAuth.nik === activeEmergency?.userId));

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
          className={`fixed bottom-6 right-6 z-[60] w-16 h-16 ${activeEmergency ? 'bg-emerald-600 shadow-emerald-300 hover:bg-emerald-700' : 'bg-red-600 shadow-red-300 hover:bg-red-700'} text-white rounded-full flex items-center justify-center shadow-2xl group ring-4 ring-white cursor-grab touch-none`}
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
              <button 
                onClick={() => {
                  setIsSOSConfirmOpen(false);
                  setActiveTab("settings");
                  showNotification("Harap buka menu SOS di dashboard untuk kalibrasi.", "info");
                }}
                className="mt-6 text-[10px] font-black text-slate-400 hover:text-brand-blue uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <MapPin className="w-3 h-3" /> Masalah Akurasi GPS? Kalibrasi Kustom
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      <CommandPalette 
        isOpen={isCommandPaletteOpen}
        setIsOpen={setIsCommandPaletteOpen}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        themeMode={settings?.themeMode}
        currentTenant={currentTenant}
      />
      <RegistrationQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        tenantId={currentTenant?.id || currentUser?.tenantId || ""}
        tenantName={currentTenant?.nama || getTranslatedLabel("Sistem RT/RW", settings?.themeMode)}
      />
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
              <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmaRtRw</span>{" "}
              <span className="bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span> <br />
              <span className="text-brand-pink">Telah Hadir!</span>
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Nikmati kemudahan pengelolaan {getTranslatedLabel("RT/RW", settings?.themeMode)} dengan teknologi AI terbaru.
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
function Legacy_AnalyticsPremiumView({
  tenantId,
  kasData,
  wargaData,
  iuranData,
  organizationName = "RW DIGITAL",
  showNotification,
}: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTopSuiteMenu, setShowTopSuiteMenu] = useState(false);
  const [suitePaperSize, setSuitePaperSize] = useState<"a4" | "letter">("a4");
  const [suiteIncludeStamp, setSuiteIncludeStamp] = useState(true);
  const [shareFormat, setShareFormat] = useState<"full" | "highlights">("full");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const handleShareWhatsApp = () => {
    if (!report) return;
    let shareText = report;
    if (shareFormat === "highlights") {
      const highlights = report
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        .slice(0, 5)
        .join('\n');
      shareText = highlights || report.substring(0, 400) + "...";
    }

    let truncatedReport = shareText;
    if (shareText.length > 1500) {
      truncatedReport = shareText.substring(0, 1500) + "... (baca selengkapnya di sistem SmaRtRw AI)";
    }
    const text = `📢 *LAPORAN BULANAN (AI FEATURE)*\nRW: *${organizationName}*\nAsisten AI: *Chaty*\n\nBerikut adalah rangkuman analisis bulanan:\n\n${truncatedReport}\n\n---\n_Laporan dikirim otomatis via SmaRtRw AI Hub_`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleShareTelegram = () => {
    if (!report) return;
    let shareText = report;
    if (shareFormat === "highlights") {
      const highlights = report
        .split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))
        .slice(0, 5)
        .join('\n');
      shareText = highlights || report.substring(0, 400) + "...";
    }

    let truncatedReport = shareText;
    if (shareText.length > 1500) {
      truncatedReport = shareText.substring(0, 1500) + "...";
    }
    const text = `📢 *LAPORAN BULANAN (AI FEATURE)*\nRW: *${organizationName}*\n\n${truncatedReport}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent("https://smartrw.ai")}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleDispatchEmail = () => {
    if (!report) return;
    setIsEmailSending(true);
    setEmailSentSuccess(false);
    setTimeout(() => {
      setIsEmailSending(false);
      setEmailSentSuccess(true);
      showNotification?.("Laporan berhasil disebarkan melalui Newsletter pengurus & warga!", "success");
      setTimeout(() => {
        setEmailSentSuccess(false);
      }, 3500);
    }, 2000);
  };

  const handleCopyClipboard = () => {
    if (!report) return;
    navigator.clipboard.writeText(report);
    showNotification?.("Seluruh teks laporan berhasil disalin ke clipboard!", "success");
  };

  const handlePrintPDF = (format: "official" | "executive") => {
    try {
      const isLetter = suitePaperSize === "letter";
      const doc = new jsPDF('p', 'mm', isLetter ? 'letter' : 'a4');
      const pageWidth = isLetter ? 215.9 : 210;
      const pageHeight = isLetter ? 279.4 : 297;
      const margin = format === "executive" ? 18 : 15;
      const contentWidth = pageWidth - (margin * 2);

      if (format === "executive") {
        // Draw Navy background header block
        doc.setFillColor(15, 23, 42); // slate-900 / navy
        doc.rect(0, 0, pageWidth, 42, "F");

        // Premium typography in white/gold for executive
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        const titleText = (organizationName || "SmaRtRw AI").toUpperCase();
        doc.text(titleText, margin, 18);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(165, 180, 252); // light indigo
        doc.text("LAPORAN BULANAN EKSEKUTIF - SMART ELEKTORAL & ADMINISTRASI", margin, 24);

        // Subtitle details
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225); // slate-300
        doc.text(`ID Wilayah: ${tenantId || '-'}  |  Sistem Intelijen Laporan Chaty`, margin, 32);
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, margin, 36);

        // Top accent line in positive purple/teal accent
        doc.setDrawColor(160, 179, 255);
        doc.setLineWidth(1);
        doc.line(margin, 42, pageWidth - margin, 42);
      } else {
        // Setup Header Font properties for Official / Classic
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        
        // Draw Title / Organization
        const titleText = (organizationName || "SmaRtRw AI").toUpperCase();
        doc.text(titleText, margin, 20);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("Sistem Pengelolaan Lingkungan RT/RW Pintar Terintegrasi", margin, 25);
        
        // Draw line divider below header
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, 28, pageWidth - margin, 28);
        
        // Report Document Type title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text("LAPORAN BULANAN OTOMATIS (AI FEATURE)", margin, 38);
        
        // Date and metadata info
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tenant ID: ${tenantId || '-'}`, margin, 44);
        doc.text(`Waktu Cetak: ${new Date().toLocaleString('id-ID')}`, margin, 49);
        
        // Line divisor for body beginning
        doc.line(margin, 52, pageWidth - margin, 52);
      }
      
      // Split the dynamic report body text by width constraint
      doc.setFont("helvetica", "normal");
      doc.setFontSize(format === "executive" ? 9.5 : 10);
      doc.setTextColor(format === "executive" ? 30 : 51, format === "executive" ? 41 : 65, format === "executive" ? 59 : 85);
      
      const splitLines = doc.splitTextToSize(report, contentWidth);
      
      let currentY = format === "executive" ? 54 : 59;
      const lineHeight = format === "executive" ? 5.8 : 6.2;
      
      splitLines.forEach((line: string) => {
        // Check page boundary
        if (currentY + lineHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin + 12;
          
          if (format === "executive") {
            // Executive secondary page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(99, 102, 241); // Indigo
            doc.text(`SmaRtRw AI - Laporan Eksekutif Bulanan (Halaman ${doc.getNumberOfPages()})`, margin, margin);
            doc.setDrawColor(224, 231, 255);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
          } else {
            // Secondary page header
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Laporan Bulanan RT/RW - Halaman ${doc.getNumberOfPages()}`, margin, margin);
            doc.setDrawColor(226, 232, 240);
            doc.line(margin, margin + 2, pageWidth - margin, margin + 2);
          }
          
          currentY += 8;
          
          // Restore content fonts
          doc.setFont("helvetica", "normal");
          doc.setFontSize(format === "executive" ? 9.5 : 10);
          doc.setTextColor(format === "executive" ? 30 : 51, format === "executive" ? 41 : 65, format === "executive" ? 59 : 85);
        }
        
        doc.text(line, margin, currentY);
        currentY += lineHeight;
      });
      
      // Page numbering
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin - 25, pageHeight - 10);
      }

      // Legal authentication stamp
      if (suiteIncludeStamp) {
        doc.setPage(totalPages);
        const stampX = pageWidth - margin - 45;
        const stampY = Math.min(currentY + 12, pageHeight - 38);
        doc.setDrawColor(79, 70, 229); // Indigo brand
        doc.setLineWidth(0.6);
        doc.circle(stampX + 20, stampY + 12, 10);
        doc.circle(stampX + 20, stampY + 12, 8.5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(79, 70, 229);
        doc.text("SMARTRW AI ASSISTANT", stampX + 11.5, stampY + 10.5);
        doc.text("VERIFIED LEGAL SEAL", stampX + 12, stampY + 13.5);
        doc.setFontSize(4);
        doc.setFont("helvetica", "normal");
        doc.text(`ID: ${(tenantId || "SRW-SEC").substring(0, 10).toUpperCase()}`, stampX + 12.5, stampY + 16.5);
      }
      
      showNotification?.("Sedang memproses & mengunduh PDF Laporan Bulanan AI...", "info");
      doc.save(`Laporan_${format === "executive" ? "Eksekutif" : "Bulanan"}_AI_${tenantId}.pdf`);
      showNotification?.("Laporan Bulanan AI berhasil disimpan sebagai PDF!", "success");
    } catch (err) {
      console.error("Gagal mencetak PDF:", err);
      showNotification?.("Gagal mengunduh dokumen PDF.", "error");
    }
  };

  const handleExportText = () => {
    try {
      if (!report) return;
      const element = document.createElement("a");
      const file = new Blob([report], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `Laporan_Bulanan_AI_${tenantId}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showNotification?.("Laporan berhasil diunduh sebagai teks mentah!", "success");
    } catch (err) {
      console.error("Gagal mengekspor teks:", err);
      showNotification?.("Gagal mengunduh berkas teks.", "error");
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
          ANALYTICS AI
        </h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* PREMIUM INTERACTIVE DOCUMENT SUITE MENU */}
          <div className="relative">
            <button
              id="top-document-suite-btn"
              onClick={() => setShowTopSuiteMenu(!showTopSuiteMenu)}
              className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 sm:px-6 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-indigo-100 border border-indigo-500/10 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-300 animate-pulse" />
              <span>AI Document Suite</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showTopSuiteMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showTopSuiteMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowTopSuiteMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 sm:right-0 max-sm:mr-[-135px] max-sm:ml-0 top-full mt-2 w-80 bg-slate-950/95 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-5 shadow-2xl z-40 text-left"
                  >
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[10px] font-black tracking-widest text-[#a0b3ff] uppercase flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-indigo-400 animate-bounce" />
                          AI DOCUMENT SUITE
                        </h4>
                        <span className="flex items-center gap-1 text-[8px] px-1.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full font-mono font-black">
                          PREMIUM ACTIVE
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-200/60 leading-normal font-sans normal-case tracking-normal">
                        Rancang dan konversikan data kas & warga menjadi dokumen laporan premium bersertifikasi.
                      </p>
                    </div>

                    {/* CONFIGURATION SECTION */}
                    <div className="bg-slate-900/60 rounded-xl p-3 border border-indigo-500/10 space-y-3 mb-4">
                      {/* Paper Size selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-indigo-200/70 uppercase tracking-widest">Kerapatan / Ukuran:</span>
                        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-indigo-500/20">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSuitePaperSize("a4"); }}
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${suitePaperSize === "a4" ? "bg-indigo-600 text-white" : "text-indigo-200/50 hover:text-indigo-200"}`}
                          >
                            A4
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSuitePaperSize("letter"); }}
                            className={`px-2 py-0.5 rounded text-[8px] font-black uppercase transition-all ${suitePaperSize === "letter" ? "bg-indigo-600 text-white" : "text-indigo-200/50 hover:text-indigo-200"}`}
                          >
                            Ltr
                          </button>
                        </div>
                      </div>

                      {/* Include Stamp digital indicator */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-[#a1a1aa] uppercase tracking-widest">Stempel Wilayah:</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSuiteIncludeStamp(!suiteIncludeStamp); }}
                          className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${suiteIncludeStamp ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-600/10 text-rose-400 border border-rose-500/20"}`}
                        >
                          {suiteIncludeStamp ? "Sertifikasi On" : "Asli Saja"}
                        </button>
                      </div>

                      {/* Status indicator / Word count */}
                      <div className="flex items-center justify-between border-t border-indigo-500/15 pt-2">
                        <span className="text-[9px] font-black text-indigo-200/70 uppercase tracking-widest">Status Laporan:</span>
                        <span className="text-[9px] font-mono font-bold text-white normal-case">
                          {report ? `${report.split(/\s+/).filter(Boolean).length} kata` : "Belum disusun"}
                        </span>
                      </div>
                    </div>

                    {/* CORE BUILD/GEN ACTION PANEL */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowTopSuiteMenu(false);
                          generateReport();
                        }}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#db2777] text-white p-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-95 transition-all duration-300 shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menyusun dng Chaty...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                            <span>{report ? "Susun Ulang AI" : "Susun Laporan Bulanan"}</span>
                          </>
                        )}
                      </button>

                      {/* If report is already generated, expose premium export shortcuts right inside the dropdown! */}
                      {report && (
                        <div className="space-y-2 border-t border-indigo-500/15 pt-2 mt-2">
                          <div className="text-[8px] font-black text-indigo-200/40 uppercase tracking-widest mb-1">
                            Aksi Cepat Dokumen:
                          </div>

                          {/* Print PDF Official */}
                          <button
                            onClick={() => {
                              setShowTopSuiteMenu(false);
                              handlePrintPDF("official");
                            }}
                            className="w-full text-left p-2 rounded-xl bg-indigo-950/40 hover:bg-slate-900 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-center gap-2 group cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                              <Printer className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">Format Resmi Wilayah</div>
                              <div className="text-[8px] text-indigo-200/40 normal-case font-sans">Formal dengan kop & stempel</div>
                            </div>
                          </button>

                          {/* Print PDF Executive */}
                          <button
                            onClick={() => {
                              setShowTopSuiteMenu(false);
                              handlePrintPDF("executive");
                            }}
                            className="w-full text-left p-2 rounded-xl bg-pink-950/20 hover:bg-slate-900 border border-pink-500/10 hover:border-pink-500/30 transition-all flex items-center gap-2 group cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-all">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">Format Eksekutif Navy</div>
                              <div className="text-[8px] text-indigo-200/40 normal-case font-sans">Gaya premium modern bertema laut</div>
                            </div>
                          </button>

                          {/* Copy clipboard */}
                          <button
                            onClick={() => {
                              setShowTopSuiteMenu(false);
                              handleCopyClipboard();
                            }}
                            className="w-full text-left p-2 rounded-xl bg-[#090d16] hover:bg-slate-900 border border-indigo-500/10 transition-all flex items-center gap-2 group cursor-pointer"
                          >
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                              <FileCheck className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-white uppercase tracking-wider">Salin Clipboard</div>
                              <div className="text-[8px] text-indigo-200/40 normal-case font-sans">Copy seluruh draf laporan</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <span className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-1.5 sm:gap-2">
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
          <div className="mt-6 flex justify-center sm:justify-start">
            <AIDocumentSuiteMenu
              report={report}
              isSpeaking={isSpeaking}
              onToggleSpeak={handleToggleSpeak}
              onPrintPDF={handlePrintPDF}
              onExportText={handleExportText}
              onShareWhatsApp={handleShareWhatsApp}
              onShareTelegram={handleShareTelegram}
              onDispatchEmail={handleDispatchEmail}
              isEmailSending={isEmailSending}
              emailSentSuccess={emailSentSuccess}
              showNotification={showNotification}
              suitePaperSize={suitePaperSize}
              setSuitePaperSize={setSuitePaperSize}
              suiteIncludeStamp={suiteIncludeStamp}
              setSuiteIncludeStamp={setSuiteIncludeStamp}
              shareFormat={shareFormat}
              setShareFormat={setShareFormat}
            />
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
// AuditLogView moved to separate file


// --- ENTERPRISE: GOVERNMENT DASHBOARD ---
// EnterpriseGovDashboard moved to separate file




// SOSOverlay moved to separate file


// AVAILABLE_VOUCHERS moved to separate file or integrated into component






















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

  const [currentTenantId, setCurrentTenantId] = useState(tenantId || "rw26_berjuang");
  const [tenantNameForDisplay, setTenantNameForDisplay] = useState("");
  const [tenantExists, setTenantExists] = useState(true);

  useEffect(() => {
    if (currentTenantId) {
      const trimmed = currentTenantId.trim();
      getDoc(doc(db, "tenants", trimmed)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTenantNameForDisplay(data.name || data.nama || trimmed);
          setTenantExists(true);
        } else {
          setTenantNameForDisplay("");
          setTenantExists(false);
        }
      }).catch((err) => {
        console.warn("Error fetching tenant display name:", err);
        setTenantNameForDisplay("");
        setTenantExists(false);
      });
    } else {
      setTenantNameForDisplay("");
      setTenantExists(false);
    }
  }, [currentTenantId]);

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
    if (!tenantExists || !currentTenantId) {
      showNotification("Kode Area Wilayah (Tenant ID) tidak valid atau tidak terdaftar.", "error");
      return;
    }
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
        tenantId: currentTenantId || "",
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
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
                <AppLogo size={8} className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  Formulir Pendaftaran Warga Baru
                </h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">
                  Lengkapi data Anda untuk verifikasi sistem
                </p>
              </div>
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
          {/* Section 0: Konfigurasi Wilayah */}
          <div className="p-6 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2rem] space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-black italic shadow-inner">
                📌
              </span>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Konfigurasi Kode Wilayah (Tenant ID)
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-normal">
              Pastikan Kode Wilayah di bawah sesuai dengan nama komplek/perumahan RT/RW Anda agar data tidak masuk ke wilayah lain.
            </p>
            <div className="relative group">
              <input
                required
                placeholder="Contoh: demo_rt100_rw100 atau rw26_berjuang"
                value={currentTenantId}
                onChange={(e) => setCurrentTenantId(e.target.value.toLowerCase().trim())}
                className="w-full p-4 pl-6 bg-white border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-mono font-bold text-base text-slate-800"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold px-1">
              {tenantExists ? (
                <span className="text-emerald-600 flex items-center gap-1 font-black">
                  ✅ Wilayah Terdaftar: <span className="uppercase underline decoration-2">{tenantNameForDisplay || currentTenantId}</span>
                </span>
              ) : (
                <span className="text-rose-500 flex items-center gap-1 font-black">
                  ⚠️ Kode Wilayah "{currentTenantId}" tidak terdaftar di sistem. Harap periksa kembali.
                </span>
              )}
            </div>
          </div>

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
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
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
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
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
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Nama Lengkap
                </label>
                <input
                  required
                  placeholder="Nama sesuai KTP"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold uppercase text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Tempat Lahir
                </label>
                <input
                  required
                  placeholder="Kota kelahiran"
                  value={formData.tempatLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tempatLahir: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Tanggal Lahir
                </label>
                <input
                  required
                  type="date"
                  value={formData.tglLahir}
                  onChange={(e) =>
                    setFormData({ ...formData, tglLahir: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Jenis Kelamin
                </label>
                <select
                  value={formData.jk}
                  onChange={(e) =>
                    setFormData({ ...formData, jk: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold text-slate-900"
                >
                  <option value="Laki-Laki">Laki-Laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
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
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold text-slate-900"
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Pendidikan Terakhir
                </label>
                <select
                  value={formData.pendidikan}
                  onChange={(e) =>
                    setFormData({ ...formData, pendidikan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Agama
                </label>
                <select
                  value={formData.agama}
                  onChange={(e) =>
                    setFormData({ ...formData, agama: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Status Perkawinan
                </label>
                <select
                  value={formData.statusKawin}
                  onChange={(e) =>
                    setFormData({ ...formData, statusKawin: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Posisi dalam Keluarga
                </label>
                <select
                  value={formData.posisiKeluarga}
                  onChange={(e) =>
                    setFormData({ ...formData, posisiKeluarga: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
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
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Golongan Darah
                </label>
                <input
                  placeholder="A/B/O/AB/Tdk Tahu"
                  value={formData.golDarah}
                  onChange={(e) =>
                    setFormData({ ...formData, golDarah: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold uppercase text-slate-900"
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
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  No. Blok Rumah
                </label>
                <input
                  required
                  placeholder="Contoh: A-12"
                  value={formData.blok}
                  onChange={(e) =>
                    setFormData({ ...formData, blok: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold uppercase text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  RT
                </label>
                <select
                  value={formData.rt}
                  onChange={(e) =>
                    setFormData({ ...formData, rt: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                >
                  {Array.from({ length: 100 }, (_, i) => String(i + 1).padStart(2, "0")).map(
                    (rt) => (
                      <option key={rt} value={rt}>
                        RT {rt}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  RW
                </label>
                <select
                  value={formData.rw}
                  onChange={(e) =>
                    setFormData({ ...formData, rw: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                >
                  {Array.from({ length: 100 }, (_, i) => String(i + 1).padStart(2, "0")).map((rw) => (
                    <option key={rw} value={rw}>
                      RW {rw}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Status Warga
                </label>
                <select
                  value={formData.statusWarga}
                  onChange={(e) =>
                    setFormData({ ...formData, statusWarga: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                >
                  <option value="Warga Tetap">Warga Tetap</option>
                  <option value="Warga Kontrak">Warga Kontrak</option>
                  <option value="Warga Kost">Warga Kost</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
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
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Kelurahan
                </label>
                <input
                  required
                  placeholder="Kelurahan"
                  value={formData.kelurahan}
                  onChange={(e) =>
                    setFormData({ ...formData, kelurahan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Kecamatan
                </label>
                <input
                  required
                  placeholder="Kecamatan"
                  value={formData.kecamatan}
                  onChange={(e) =>
                    setFormData({ ...formData, kecamatan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Kota / Kabupaten
                </label>
                <input
                  required
                  placeholder="Kota"
                  value={formData.kota}
                  onChange={(e) =>
                    setFormData({ ...formData, kota: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">
                  Profesi / Pekerjaan
                </label>
                <input
                  required
                  placeholder="Pekerjaan saat ini"
                  value={formData.pekerjaan}
                  onChange={(e) =>
                    setFormData({ ...formData, pekerjaan: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold text-slate-900"
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
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">
                    Foto KTP
                  </h4>
                  <p className="text-[10px] text-slate-800 mb-4 px-4 font-medium italic">
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
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-2">
                    Foto Kartu Keluarga
                  </h4>
                  <p className="text-[10px] text-slate-800 mb-4 px-4 font-medium italic">
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
  setCurrentUser,
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
  setCurrentUser?: any;
  wargaData: any[];
  verifikasiWargaData: any[];
  isLoadingDB: boolean;
  onSelfRegister: () => void;
  onShowFreeTrial: (planId?: string) => void;
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
    // If Auth state says no user, but we are loading, it means they were rejected
    // or signed out by backend rules. Cancel the spinner so it doesn't freeze.
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user && isLoading) {
        setIsLoading(false);
      }
    });
    return () => unsub();
  }, [isLoading]);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setLoginMode("admin");
    }
  }, [initialEmail]);

  const [nik, setNik] = useState("");
  const [kodeKeluarga, setKodeKeluarga] = useState("");

  const [tenantInput, setTenantInput] = useState(() => {
    return tenantId || safeLocalStorage.getItem("lastActiveTenantId") || "rw26_berjuang";
  });
  const [tenantNameForDisplay, setTenantNameForDisplay] = useState("");
  const [tenantExists, setTenantExists] = useState(true);

  useEffect(() => {
    if (tenantInput) {
      const trimmed = tenantInput.trim().toLowerCase();
      getDoc(doc(db, "tenants", trimmed)).then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setTenantNameForDisplay(data.name || data.nama || trimmed);
          setTenantExists(true);
        } else {
          setTenantNameForDisplay("");
          setTenantExists(false);
        }
      }).catch((err) => {
        console.warn("Error fetching tenant display name in login:", err);
        setTenantNameForDisplay("");
        setTenantExists(false);
      });
    } else {
      setTenantNameForDisplay("");
      setTenantExists(false);
    }
  }, [tenantInput]);

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

    const cleanTenant = String(tenantInput || "").trim().toLowerCase();
    if (!cleanTenant) {
      setError("Kode Area Wilayah (Tenant ID) harus diisi agar pencarian data tepat sasaran.");
      setIsLoading(false);
      return;
    }
    if (!tenantExists) {
      setError(`Kode Area Wilayah "${cleanTenant}" tidak valid atau tidak terdaftar di sistem.`);
      setIsLoading(false);
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
      const cTenantId = String(w.tenantId || "").trim().toLowerCase();
      if (cTenantId !== cleanTenant) return false;

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

      if (!cleanId || !cleanPass) return false;

      const idIsNIK = cNik === cleanIdLower || (idDigits && cNikDigits === idDigits);
      const idIsNama = cNama === cleanIdLower;
      const passIsKK = cKK === cleanPassLower || (passDigits && cKKDigits === passDigits);
      const passIsHP = cHp === cleanPassLower || (passDigits && cHpDigits === passDigits);

      // Combinations: NIK+KK, Nama+KK, NIK+HP
      return (idIsNIK && passIsKK) || (idIsNama && passIsKK) || (idIsNIK && passIsHP);
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
        // A. Try direct Document ID lookup (NIK is standard docId, prefixed with tenant)
        const potentialIds = [cleanId, cleanPass].filter((k) => k.length >= 6);
        const searchTenantIds = [cleanTenant];
        if (cleanTenant.startsWith("rt") && cleanTenant.includes("_")) {
          const parent = cleanTenant.substring(cleanTenant.indexOf("_") + 1);
          if (parent && !searchTenantIds.includes(parent)) {
            searchTenantIds.push(parent);
          }
        }

        for (const idCandidate of potentialIds) {
          if (found) break;

          const candidateRefs: any[] = [];
          // RESTRICTED: Only search within the intended tenant context
          searchTenantIds.forEach((t) => {
            candidateRefs.push(doc(db, "data_warga", `${t}_${idCandidate}`));
            candidateRefs.push(doc(db, "verifikasi_warga", `${t}_${idCandidate}`));
          });

          for (const dRef of candidateRefs) {
            if (found) break;
            try {
              const dSnap = await getDoc(dRef);
              if (dSnap.exists()) {
                const candidate = { docId: dSnap.id, ...(dSnap.data() as any || {}) } as any;
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

                const docIsId = idCandidate === cleanId;
                const cNikDigits = cNik.replace(/\D/g, "");
                const cKKDigits = cKK.replace(/\D/g, "");
                const cHpDigits = cHp.replace(/\D/g, "");
                const otherVal = docIsId ? cleanPassLower : cleanIdLower;
                const otherDigits = otherVal.replace(/\D/g, "");

                const idIsNIK = cNik === cleanIdLower || (idDigits && cNikDigits === idDigits);
                const idIsNama = cNama === cleanIdLower;
                
                const passIsKK = cKK === cleanPassLower || (passDigits && cKKDigits === passDigits);
                const passIsHP = cHp === cleanPassLower || (passDigits && cHpDigits === passDigits);

                // We need to know which one was supposed to be ID and which one Key
                // Based on pair requirements:
                // 1. cleanId(ID)=NIK/Nama + cleanPass(Pass)=KK
                // 2. cleanId(ID)=NIK + cleanPass(Pass)=HP
                
                const matches = (idIsNIK && passIsKK) || (idIsNama && passIsKK) || (idIsNIK && passIsHP);

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

        // B. Query Discovery - Search only within intended tenant context
        if (!found) {
          const searchTenantIds = [cleanTenant];
          if (cleanTenant.startsWith("rt") && cleanTenant.includes("_")) {
            const parent = cleanTenant.substring(cleanTenant.indexOf("_") + 1);
            if (parent && !searchTenantIds.includes(parent)) {
              searchTenantIds.push(parent);
            }
          }

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

                const activeFilters = searchTenantIds.filter(Boolean);

                // 1. Check in data_warga (Scoped search ONLY)
                let sWarga = null;
                if (activeFilters.length > 0) {
                  try {
                    sWarga = await getDocs(query(
                      collection(db, "data_warga"),
                      where(field, "==", value),
                      where("tenantId", "in", activeFilters),
                      limit(10)
                    ));
                  } catch (e) {
                    console.warn("Scoped data_warga query failed:", e);
                  }
                }

                // 2. Check in verifikasi_warga (Scoped search ONLY)
                let sVerif = null;
                if (activeFilters.length > 0) {
                  try {
                    sVerif = await getDocs(query(
                      collection(db, "verifikasi_warga"),
                      where(field, "==", value),
                      where("tenantId", "in", activeFilters),
                      limit(10)
                    ));
                  } catch (e) {
                    console.warn("Scoped verifikasi_warga query failed:", e);
                  }
                }

                // 3. Check in surat (Scoped search ONLY)
                let sSurat = null;
                if (activeFilters.length > 0) {
                  try {
                    sSurat = await getDocs(query(
                      collection(db, "surat"),
                      where(field === "nama" ? "pemohon" : field, "==", value),
                      where("tenantId", "in", activeFilters),
                      limit(5)
                    ));
                  } catch (e) {
                    console.warn("Scoped surat query failed:", e);
                  }
                }

                const allSnaps = [sWarga, sVerif, sSurat];

                for (const snap of allSnaps) {
                  if (found) break;
                  if (!snap.empty) {
                    for (const d of snap.docs) {
                      const cand = { docId: d.id, ...d.data() } as any;
                      const isTokenId = token === cleanId;
                      const otherVal = isTokenId ? cleanPassLower : cleanIdLower;
                      const otherDigits = otherVal.replace(/\D/g, "");

                      const cNik = String(cand.nik || "").trim().toLowerCase();
                      const cNama = String(cand.nama || cand.pemohon || "").trim().toLowerCase();
                      const cHp = String(cand.hp || cand.phone || "").trim().toLowerCase();
                      const cKK = String(cand.kk || cand.kodeKeluarga || "").trim().toLowerCase();

                      const idVal = isTokenId ? token.toLowerCase() : otherVal;
                      const idDigitsVal = isTokenId ? token.replace(/\D/g, "") : otherDigits;
                      const passVal = isTokenId ? otherVal : token.toLowerCase();
                      const passDigitsVal = isTokenId ? otherDigits : token.replace(/\D/g, "");

                      const idIsNIK = cNik === idVal || (idDigitsVal && cNik.replace(/\D/g, "") === idDigitsVal);
                      const idIsNama = cNama === idVal;
                      const passIsKK = cKK === passVal || (passDigitsVal && cKK.replace(/\D/g, "") === passDigitsVal);
                      const passIsHP = cHp === passVal || (passDigitsVal && cHp.replace(/\D/g, "") === passDigitsVal);

                      const matches = (idIsNIK && passIsKK) || (idIsNama && passIsKK) || (idIsNIK && passIsHP);

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
        const resolvedTenantId = found.tenantId || cleanTenant || "rw26_berjuang";
        safeLocalStorage.setItem("lastActiveTenantId", resolvedTenantId);

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
          'Data tidak ditemukan! Jika Anda adalah warga baru atau belum terdaftar di sistem SmaRtRw AI, silakan klik tombol "DAFTAR MANDIRI" di bawah untuk mendaftarkan data Anda.',
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
        // If it's a 16-digit NIK, provide a helpful error
        if (/^\d{16}$/.test(inputEmail)) {
          throw new Error("NIK_DETECTED");
        }
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
        } else {
          throw new Error("Username tidak ditemukan.");
        }
      }

      try {
        clearUserProfileCache();
        if (auth.currentUser) {
          await signOut(auth);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, targetPass);
        const user = userCredential.user;
        const userProfileRef = doc(db, "users", user.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        const userData = userProfileSnap.data();
        
        // Save the intended tenant ID to local storage to maintain session context across reloads
        if (tenantInput) {
            safeLocalStorage.setItem("lastActiveTenantId", tenantInput);
        }
        
        // SuperAdmin (MASTER) or specific admin accounts bypass tenant ID restriction check
        const isMaster = userData?.role?.toUpperCase() === "SUPER_ADMIN" || userData?.tenantId === "MASTER" || userData?.isSuperAdmin === true;

        if (userData && !isMaster && userData.tenantId !== tenantInput) {
            await signOut(auth);
            throw new Error(`Tenant ID tidak sesuai. Akun Anda terdaftar di wilayah ${userData.tenantId}, bukan ${tenantInput}. Harap periksa Kode Area Wilayah.`);
        }
        
        // Ensure the spinner stops
        setIsLoading(false);
      } catch (loginErr: any) {
          if (
            loginErr.code === "auth/user-not-found" ||
            loginErr.code === "auth/invalid-credential" ||
            loginErr.code === "auth/wrong-password"
          ) {
            let wasCreated = false;
            try {
              // [FIX] signInAnonymously dihapus - auth state pollution
              await createUserWithEmailAndPassword(
                auth,
                loginEmail,
                targetPass,
              );
              wasCreated = true;
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
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = `Gagal masuk (${err.code || "ERR"}). Periksa kembali email dan password Anda.`;

      if (err.message === "NIK_DETECTED") {
        msg = "PENGGUNAAN NIK TERDETEKSI: Jika Anda ingin masuk sebagai Warga menggunakan NIK, silakan pilih tab 'NIK & KK' (Verifikasi Warga) di atas.";
      } else if (err.message === "Username tidak ditemukan.") {
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
            'AKUN ADMIN: Silakan gunakan tombol "Masuk dengan Google" atau pastikan password sudah diset di Firebase Console.';
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
      console.log("Starting GitHub Login with Google...");
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Auth result received. User UID:", user.uid, "Email:", user.email);
      console.log("Auth state check (auth.currentUser):", auth.currentUser ? "SIGNED IN" : "NOT SIGNED IN");

      const isArif = 
        user.email?.toLowerCase() === "arifrajcoach@gmail.com" || 
        user.email?.toLowerCase() === "arifrajmci@gmail.com";
      let tenantId = "";
      if (isArif) {
        tenantId = "MASTER";
      }

      // 1. Check if user entry exists by standard UID
      const userRef = doc(db, "users", user.uid);
      let userDoc = null;
      let permissionDeniedOnUserDoc = false;
      try {
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          userDoc = snap;
        }
      } catch (e: any) {
        console.warn("Permission denied or error reading users doc (safe to ignore if new user):", e);
        // We'll proceed to check data_warga or other registry
        permissionDeniedOnUserDoc = true;
      }

      let preRegisteredRole = "Viewer";
      let preRegisteredTenant = tenantId;
      let isPreRegistered = false;
      let userDataExtra = {};
      let isVerifiedResident = false;

      // 2. ALWAYS verify against Data Warga first
      if (user.email) {
        const targetEmail = user.email.toLowerCase().trim();
        const emailVariations = [
          user.email.trim(),
          targetEmail,
          user.email.toUpperCase().trim()
        ].filter((v, i, a) => a.indexOf(v) === i);

        const wargaRef = collection(db, "data_warga");
        
        let wargaSnapshot;
        try {
          const qw = query(wargaRef, where("email", "in", emailVariations));
          wargaSnapshot = await getDocs(qw);
          
          let docs = wargaSnapshot.docs;
          
          if (docs.length > 0) {
            // Sort to find best match: verified first, then non-trial
            const sortedDocs = [...docs].sort((a, b) => {
              const da = a.data();
              const db = b.data();
              if (da.terverifikasi && !db.terverifikasi) return -1;
              if (!da.terverifikasi && db.terverifikasi) return 1;
              const isTrialA = (da.tenantId || "").startsWith("TRIAL_");
              const isTrialB = (db.tenantId || "").startsWith("TRIAL_");
              if (!isTrialA && isTrialB) return -1;
              if (isTrialA && !isTrialB) return 1;
              return 0;
            });

            const matchedWargaDoc = sortedDocs[0];
            const matchedWarga = matchedWargaDoc.data();
            
            if (matchedWarga.terverifikasi === true) {
              isPreRegistered = true;
              isVerifiedResident = true;
              preRegisteredRole = "Warga";
              preRegisteredTenant = matchedWarga.tenantId; // FORCE the tenant from verified record
              userDataExtra = {
                nik: matchedWarga.nik || "",
                linkedResidentId: matchedWargaDoc.id,
              };
              console.log("Verified Resident Found via Email! Tenant:", preRegisteredTenant);
            } else {
              // Registered but not verified
              await signOut(auth);
              setError(
                `Email Anda (${user.email}) terdaftar di Data Warga, namun status Anda belum 'Terverifikasi' oleh Admin Wilayah. Silakan hubungi Ketua RT/RW di wilayah Anda untuk memverifikasi data Anda agar dapat login.`,
              );
              setIsLoading(false);
              return;
            }
          }
        } catch (e: any) {
          console.error("Error querying data_warga:", e);
          // If we fail to check data_warga AND user doc was denied, we have a real problem
          if (permissionDeniedOnUserDoc) {
             throw new Error(`Gagal memuat profil user. Missing or insufficient permissions. Silakan lapor admin.`);
          }
        }
      }

      const isTrihUser =
        user.email?.toLowerCase().includes("trihprw26") ||
        user.email?.toLowerCase().includes("handoko");

      // 3. Search if pre-registered in users collection (for Admin/trial roles)
      if (!isArif && !isVerifiedResident && !isTrihUser) {
        const usersRef = collection(db, "users");
        let querySnapshot;
        try {
          const q = query(usersRef, where("email", "==", user.email));
          querySnapshot = await getDocs(q);
        } catch (e: any) {
          console.error("Error querying users for pre-reg:", e);
          throw new Error(`Gagal mengecek data registrasi Admin. ${e.message}`);
        }

        if (!querySnapshot.empty) {
          isPreRegistered = true;
          const matchedUser = querySnapshot.docs[0];
          const matchedData = matchedUser.data();
          preRegisteredRole = matchedData.role || "Viewer";
          preRegisteredTenant = matchedData.tenantId || tenantId;

          if (matchedUser.id !== user.uid) {
            try {
              await deleteDoc(doc(db, "users", matchedUser.id));
              console.log("Deleted old user doc:", matchedUser.id);
            } catch (e: any) {
              console.warn("Soft Error: Gagal menghapus data migrasi lama, mengabaikan...", e);
            }
          }
        } else if (!(userDoc && userDoc.exists())) {
          // No user doc and not found in any registration source
          await signOut(auth);
          setError(
            "Email Google Anda belum terdaftar di sistem. Silakan hubungi Admin Wilayah untuk mendaftarkan email Anda di form Data Warga.",
          );
          setIsLoading(false);
          return;
        }
      }

      // Final gate if no user document was found and after all search sources
      if (!(userDoc && userDoc.exists()) && !isPreRegistered && !isArif && !isTrihUser) {
        await signOut(auth);
        setError(
          "Akun Google Anda belum terdaftar di sistem. Silakan hubungi Admin Wilayah untuk mendaftarkan email Anda di form Data Warga.",
        );
        setIsLoading(false);
        return;
      }

      // 4. Setup User Profile
      const userData = {
        uid: user.uid,
        email: user.email,
        role: isArif
          ? "SUPER_ADMIN"
          : isVerifiedResident 
            ? "Warga"
            : (userDoc && userDoc.exists())
              ? userDoc.data()?.role 
              : preRegisteredRole,
        isSuperAdmin: isArif,
        status: (isArif || isVerifiedResident) ? "ACTIVE" : "STARTER", 
        name: isArif
          ? (user.displayName || "Admin Master")
          : (userDoc && userDoc.exists())
            ? userDoc.data()?.name || user.displayName || "User"
            : user.displayName || "User",
        tenantId: isVerifiedResident
          ? preRegisteredTenant // Priority: If verified resident, use that tenant from data_warga
          : isArif
            ? (userDoc && userDoc.exists() && userDoc.data()?.tenantId ? userDoc.data().tenantId : "MASTER")
            : (userDoc && userDoc.exists())
              ? userDoc.data()?.tenantId || preRegisteredTenant
              : preRegisteredTenant,
        createdAt: (userDoc && userDoc.exists())
          ? userDoc.data()?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        ...userDataExtra
      };

      // Always ensure the role and tenant are set
      try {
        await setDoc(userRef, userData, { merge: true });
      } catch (e: any) {
        console.error("Error setting user profile:", e);
        throw new Error(`Gagal menyimpan profil pengguna ke database (UID: ${user.uid}). ${e.message}`);
      }
      setCurrentUser(userData as any);
      setIsLoading(false);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        console.error("Google Login Error:", err);
      } else {
        console.log("Google Login cancelled by user/interrupted:", err.code);
      }

      if (err.code === "auth/popup-blocked") {
        setError(
          "Gagal login: Popup diblokir. Silakan buka aplikasi di tab baru (jika di dalam preview) atau izinkan popup browser Anda.",
        );
      } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        setError("Login Google dibatalkan atau ditutup.");
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
              size={22}
              className="w-[90px] h-[90px] relative z-10 transition-transform group-hover:scale-110 duration-500"
              logoUrl={settings?.org_logo_url || settings?.logo_url}
            />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-800 leading-none mb-2 font-elegant">
            <span className="font-bold flex items-center justify-center gap-1">
            <span className="bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmaRtRw</span>
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
                  ? "VERIFIKASI WARGA (Tanpa Google). Gunakan kombinasi: NIK + KK, Nama + KK, atau NIK + HP."
                  : `Akses khusus ${getTranslatedLabel("Pengurus", settings?.themeMode).toLowerCase()} yang telah terdaftar.`}
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
            <form onSubmit={handleSubmit} className="space-y-6 h-[450px]">
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
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                  KODE AREA WILAYAH (TENANT ID)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <MapPin className="w-6 h-6 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={tenantInput}
                    onChange={(e) => setTenantInput(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 transition-all font-bold text-base"
                    placeholder="Contoh: demo_rt100_rw100"
                  />
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
                  Gunakan Google Login untuk akses penuh fitur {getTranslatedLabel("Warga", settings?.themeMode).toLowerCase()}: E-LAPAK +26,
                  Surat Digital, Keuangan, dan Pengaduan.
                </p>
              </div>

              {/* [NEW] Tenant ID input for Google Login to improve system disambiguation */}
              <div className="px-1">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">
                  KODE AREA WILAYAH (OPSIONAL)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={tenantInput}
                    onChange={(e) => setTenantInput(e.target.value.toLowerCase().trim())}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-sm"
                    placeholder="Contoh: rw26_berjuang"
                  />
                </div>
                <p className="text-[9px] text-slate-400 px-3 mt-1.5 leading-tight italic">
                  💡 Tips: Masukkan Kode Wilayah jika Anda terdaftar di lebih dari satu area.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-6 bg-white border-2 border-slate-100 text-slate-700 rounded-[2rem] font-black flex items-center justify-center gap-4 hover:bg-slate-50 hover:border-brand-green/30 transition-all active:scale-[0.98] shadow-sm text-base group disabled:opacity-75 disabled:cursor-not-allowed"
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
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">
                    KODE AREA WILAYAH (TENANT ID)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-pink transition-colors">
                      <span className="text-lg">📍</span>
                    </div>
                    <input
                      required
                      type="text"
                      value={tenantInput}
                      onChange={(e) => setTenantInput(e.target.value.toLowerCase().trim())}
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border-[2.11111px] border-double border-[#30891a] rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 transition-all font-mono font-bold text-base"
                      placeholder="Contoh: demo_rt100_rw100"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black px-3 mt-2">
                    {tenantExists ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        ✅ Wilayah Terdaftar: <span className="underline decoration-2">{tenantNameForDisplay || tenantInput}</span>
                      </span>
                    ) : (
                      <span className="text-rose-500 flex items-center gap-1">
                        ⚠️ Kode Wilayah "{tenantInput || '(kosong)'}" tidak terdaftar.
                      </span>
                    )}
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
                type="button"
                onClick={onSelfRegister}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-sky-50 via-sky-100/50 to-sky-100/70 border border-sky-200 hover:border-sky-350 rounded-[1.25rem] text-sky-800 hover:text-sky-900 font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm shadow-sky-100/50 hover:shadow-md hover:shadow-sky-200/60 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
              >
                <span className="p-1 px-1.5 bg-sky-200/60 group-hover:bg-sky-200 rounded-lg transition-colors flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-sky-600 group-hover:scale-110 transition-transform duration-300" />
                </span>
                <span className="flex items-center gap-1.5 font-bold">
                  Warga Baru? <span className="text-sky-600 font-black">Daftar Mandiri ✨</span>
                </span>
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
                onClick={() => onShowFreeTrial()}
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
                    <span className="font-['Georgia'] bg-gradient-to-r from-sky-500 via-blue-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(34,211,238,0.3)]">SmaRtRw</span>
                    {' '}
                    <span className="font-['Georgia'] bg-gradient-to-r from-rose-400 via-red-300 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(251,113,133,0.5)] font-black">AI</span>
                    </h3>
                    <p className="text-sm font-bold text-slate-500 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">
                      Dapatkan{" "}
                      <span className="text-brand-blue">Starter</span>{" "}
                      Sekarang!
                    </p>

                    <div className="flex items-center gap-2">
                      <div className="px-5 py-2.5 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-pink/20 group-hover:bg-brand-blue group-hover:shadow-brand-blue/20 transition-all flex items-center gap-2">
                        Mulai Sekarang
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
                whileHover={{ 
                  scale: 1.05, 
                  y: -3,
                  boxShadow: "0 20px 25px -5px rgba(56, 189, 248, 0.25), 0 8px 10px -6px rgba(56, 189, 248, 0.25)"
                }}
                whileTap={{ scale: 0.97 }}
                onClick={onShowPricing}
                className="w-full py-4 bg-gradient-to-r from-sky-400 via-sky-400 to-sky-500 hover:from-sky-450 hover:to-sky-550 border-2 border-sky-300 text-white rounded-3xl flex items-center justify-center gap-2.5 shadow-lg shadow-sky-200/50 hover:shadow-sky-300/40 transition-all duration-300 relative overflow-hidden group cursor-pointer font-bold"
              >
                {/* Visual depth decorative mesh/waves */}
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_60%)] -z-10 group-hover:scale-125 transition-transform duration-700" />
                
                {/* Infinite rotating light background sheen */}
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-40 group-hover:animate-shine" />
                
                <span className="p-1 px-1.5 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: '#ffffff' }} />
                </span>
                
                <span className="text-[11px] font-black uppercase tracking-widest drop-shadow-sm flex items-center gap-1" style={{ color: '#fffafa' }}>
                  Pilih Paket & List Fitur <span className="text-sky-950 group-hover:translate-x-0.5 transition-transform duration-300">⚡</span>
                </span>
              </motion.button>

              <div className="grid grid-cols-2 gap-3 w-full">
                <motion.a
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 15px 20px -7px rgba(16, 185, 129, 0.45)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  href="https://smartrwai.vercel.app/"
                  target="_blank"
                  className="py-4 bg-gradient-to-tr from-emerald-250 via-teal-100 to-green-300 hover:from-emerald-350 hover:via-teal-200 hover:to-green-400 border border-emerald-300/60 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group cursor-pointer font-bold shadow-md shadow-emerald-100/50"
                >
                  {/* Interactive shine sheen overlay */}
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)] -z-10 group-hover:scale-125 transition-transform duration-700" />
                  
                  <span className="p-1 px-1.5 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all duration-300">
                    <Globe className="w-3.5 h-3.5 text-[#022869] group-hover:scale-110 transition-transform" />
                  </span>
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#022869] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    Website ✨
                  </span>
                </motion.a>

                <motion.a
                  whileHover={{ 
                    scale: 1.05, 
                    y: -2,
                    boxShadow: "0 15px 20px -7px rgba(16, 185, 129, 0.45)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/087726741143"
                  target="_blank"
                  className="py-4 bg-gradient-to-tr from-emerald-250 via-teal-100 to-green-300 hover:from-emerald-350 hover:via-teal-200 hover:to-green-400 border border-emerald-300/60 rounded-[1.25rem] flex items-center justify-center gap-2.5 transition-all duration-300 relative overflow-hidden group cursor-pointer font-bold shadow-md shadow-emerald-100/50"
                >
                  {/* Interactive shine sheen overlay */}
                  <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_60%)] -z-10 group-hover:scale-125 transition-transform duration-700" />
                  
                  <span className="p-1 px-1.5 bg-[#01360e]/10 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-all duration-300">
                    <Phone className="w-3.5 h-3.5 text-[#022869] group-hover:scale-110 transition-transform" />
                  </span>
                  
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#022869] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">
                    WA Admin ✨
                  </span>
                </motion.a>
              </div>

              {/* Health Check & Recovery Button for recurring login issues */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (window.confirm("Perbaiki kendala login? Tindakan ini akan membersihkan cache browser dan memuat ulang sistem (Data Anda tetap aman).")) {
                    const keysToKeep = [
                      "firebase:auth",
                      "impersonatedTenantId",
                      "currentTenant",
                      "parentTenant",
                      "firebaseLocalStorageDb",
                      "lastActiveTenantId",
                      "theme"
                    ];
                    const keys = Object.keys(localStorage);
                    keys.forEach((key) => {
                      if (!keysToKeep.some(k => key.includes(k))) {
                        safeLocalStorage.removeItem(key);
                      }
                    });
                    safeSessionStorage.clear();
                    window.location.reload();
                  }
                }}
                className="w-full mt-2 py-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all group"
              >
                <RefreshCw className="w-4 h-4 group-hover:animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Health Check & Auto Recovery
                </span>
              </motion.button>
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
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-1">SmaRtRw AI nexapps intelligent ecosystem</p>
                 </div>
              </div>
              <div className="flex items-center gap-2 px-6 py-2 bg-brand-pink text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-brand-pink/20 whitespace-nowrap">
                <Sparkles className="w-3 h-3" />
                Mulai Paket Starter 30 hari
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

// UsersView is now imported from ./components/UsersView


// TenantsView is now imported from ./components/TenantsView

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
  wargaAuth,
  tenantId,
  setIsLoadingDB,
  handleFirestoreError,
  showNotification,
  getSetting,
}: any) {
  const roleUpper = currentUser?.role?.toUpperCase() || "";
  const isViewer = ["WARGA", "VIEWER", "TAMU"].includes(roleUpper);
  const isWarga = roleUpper === "WARGA";

  const filteredBalita = useMemo(() => {
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      return (balitaData || []).filter(
        (b: any) =>
          b.nikOrangTua === activeNik || b.nik === activeNik,
      );
    }
    return balitaData || [];
  }, [balitaData, isWarga, currentUser?.nik, wargaAuth?.nik]);

  const filteredIbuHamil = useMemo(() => {
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      return (ibuHamilData || []).filter((i: any) => i.nik === activeNik);
    }
    return ibuHamilData || [];
  }, [ibuHamilData, isWarga, currentUser?.nik, wargaAuth?.nik]);

  const filteredPosbindu = useMemo(() => {
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      return (pemeriksaanPosbinduData || []).filter(
        (p: any) => p.nik === activeNik,
      );
    }
    return pemeriksaanPosbinduData || [];
  }, [pemeriksaanPosbinduData, isWarga, currentUser?.nik, wargaAuth?.nik]);

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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN BULANAN POSYANDU", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    // Balita Table
    const tableData = balitaData.map((b: any) => [
      b.nama,
      b.jk,
      calculateAgeMonths(b.tglLahir) + " Bln",
      b.namaOrangTua,
      b.statusStunting,
    ]);

    autoTable(doc, {
      startY: 49,
      head: [["Nama Balita", "JK", "Usia", "Wali", "Status Gizi"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Laporan_Posyandu_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`);
    showNotification("Laporan PDF berhasil diunduh!");
  };

  const exportKegiatanPDF = () => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("JADWAL & AGENDA POSYANDU", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 39);

    const tableData = posyanduKegiatanData.map((k: any) => [
      formatTgl(k.tanggal),
      k.lokasi,
      k.keterangan || "-",
      k.kaderId?.split("@")[0] || "-",
    ]);

    autoTable(doc, {
      startY: 44,
      head: [["Tanggal", "Lokasi", "Keterangan", "Petugas"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Jadwal_Posyandu_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`);
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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KARTU KESEHATAN ANAK (BALITA)", 14, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Anak: ${balita.nama}`, 14, 42);
    doc.text(`NIK: ${balita.nik || "-"}`, 14, 47);
    doc.text(`Jenis Kelamin: ${balita.jk}`, 14, 52);
    doc.text(`Tanggal Lahir: ${formatTgl(balita.tglLahir)}`, 14, 57);
    doc.text(
      `Nama Ibu: ${balita.namaIbu || balita.namaOrangTua || "-"}`,
      14,
      62,
    );
    doc.text(`Status Gizi: ${balita.statusStunting || "Normal"}`, 14, 67);

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
      startY: 72,
      head: [["Tanggal", "Tipe", "Keterangan", "Petugas"]],
      body: history,
      theme: "grid",
      headStyles: { fillColor: [236, 72, 153], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Kartu_Kesehatan_${balita.nama}_${cleanTenantName}_${cleanTagline}.pdf`);
    showNotification("Kartu Kesehatan berhasil diunduh!");
  };

  const exportIbuHamilKardPDF = (mil: any) => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KARTU KESEHATAN IBU HAMIL", 14, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Ibu: ${mil.nama}`, 14, 42);
    doc.text(`NIK: ${mil.nik}`, 14, 47);
    doc.text(`Usia Kehamilan: ${mil.usiaKehamilan} Minggu`, 14, 52);
    doc.text(`Estimasi HPL: ${formatTgl(mil.tglHPL)}`, 14, 57);
    doc.text(`Catatan: ${mil.riwayatKesehatan || "-"}`, 14, 62);

    autoTable(doc, {
      startY: 67,
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

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Kesehatan_IbuHamil_${mil.nama}_${cleanTenantName}_${cleanTagline}.pdf`);
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
      kaderId: currentUser?.email || wargaAuth?.nik || "Guest",
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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi and Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("MONITOR IBU HAMIL", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    const tableData = filteredIbuHamil.map((mil: any) => [
      mil.nama,
      mil.nik,
      mil.usiaKehamilan + " Minggu",
      formatTgl(mil.tglHPL),
      mil.riwayatKesehatan || "-",
    ]);

    autoTable(doc, {
      startY: 49,
      head: [["Nama", "NIK", "Usia Hamil", "HPL", "Kesehatan"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Monitor_Ibu_Hamil_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`);
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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DATA BALITA POSYANDU", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    const tableData = filteredBalita.map((b: any) => [
      b.nama,
      calculateAgeMonths(b.tglLahir) + " Bulan",
      b.namaOrangTua,
      b.statusStunting || "Normal",
    ]);

    autoTable(doc, {
      startY: 49,
      head: [["Nama Balita", "Usia", "Orang Tua", "Status Gizi"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [219, 39, 119], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Data_Balita_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`);
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
                        const kop = (getSetting && getSetting("KOP_SURAT")) || {};
                        const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
                        const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

                        // Header
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(14);
                        doc.text(tenantName.toUpperCase(), 14, 18);
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(9);
                        doc.setTextColor(71, 85, 105);
                        doc.text(tagline, 14, 23);
                        doc.setDrawColor(203, 213, 225);
                        doc.line(14, 26, 196, 26);

                        doc.setTextColor(15, 23, 42);
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(12);
                        doc.text("LAPORAN POSBINDU", 14, 34);

                        autoTable(doc, {
                          startY: 40,
                          head: [["NIK", "Nama", "TD (Tensi)", "GDS (Gula Darah)"]],
                          body: pemeriksaanPosbinduData.map((p) => [
                            p.nik,
                            p.nama,
                            p.tekananDarah || p.tensi || "-",
                            p.gulaDarah || "-",
                          ]),
                          theme: "grid",
                          headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
                        });

                        // Closing Quote
                        const finalY = (doc as any).lastAutoTable.finalY || 100;
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(9.5);
                        doc.setTextColor(30, 41, 59);
                        doc.text(
                          '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
                          105,
                          finalY + 15,
                          { align: "center", maxWidth: 180 }
                        );

                        const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
                        const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
                        doc.save(
                          `Laporan_Posbindu_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
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
  wargaAuth,
  tenantId,
  handleFirestoreError,
  showNotification,
  getSetting,
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
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      return (sampahSetoranData || []).filter((s: any) => s.nasabahId === activeNik);
    }
    return sampahSetoranData || [];
  }, [sampahSetoranData, isWarga, currentUser?.nik, wargaAuth?.nik]);

  const filteredSampahTarikSaldo = useMemo(() => {
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      return (sampahTarikSaldoData || []).filter((t: any) => t.nasabahId === activeNik);
    }
    return sampahTarikSaldoData || [];
  }, [sampahTarikSaldoData, isWarga, currentUser?.nik, wargaAuth?.nik]);

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
      
    if (isWarga && (currentUser?.nik || wargaAuth?.nik)) {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      summary = summary.filter((n: any) => n.nik === activeNik);
    }
    return summary;
  }, [wargaData, sampahSetoranData, sampahTarikSaldoData, isWarga, currentUser?.nik, wargaAuth?.nik]);

  // Auto-select self as nasabah for WARGA
  useEffect(() => {
    if (isWarga && (currentUser?.nik || wargaAuth?.nik) && activeSubTab === "dashboard") {
      const activeNik = currentUser?.nik || wargaAuth?.nik;
      // Find matching nasabah by NIK
      const match = nasabahSummary.find((n: any) => n.nik === activeNik || n.email === currentUser?.email);
      if (match) {
        setSelectedNasabahId(match.nik);
      }
    }
  }, [isWarga, currentUser?.nik, wargaAuth?.nik, currentUser?.email, nasabahSummary, activeSubTab]);

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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LAPORAN SETORAN BANK SAMPAH", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

    const tableData = sampahSetoranData.map((s: any) => [
      s.namaNasabah,
      s.namaKategori,
      s.berat + " kg",
      "Rp " + s.total.toLocaleString(),
      s.tanggal,
    ]);

    autoTable(doc, {
      startY: 49,
      head: [["Nasabah", "Kategori", "Berat", "Total", "Tanggal"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Laporan_Setoran_Sampah_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    showNotification("Eksport PDF Berhasil!");
  };

  const exportBukuTabunganPDF = (nasabah: any) => {
    const doc = new jsPDF();
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("BUKU TABUNGAN BANK SAMPAH", 14, 34);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Nama Nasabah: ${nasabah.nama}`, 14, 42);
    doc.text(`NIK: ${nasabah.nik}`, 14, 47);
    doc.text(`Blok/RT: ${nasabah.blok} / ${nasabah.rt}`, 14, 52);

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
      startY: 57,
      head: [["Tanggal", "Jenis", "Item", "Berat", "Masuk", "Keluar", "Saldo"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Buku_Tabungan_${nasabah.nama}_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
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
    const kop = (getSetting && getSetting("KOP_SURAT")) || {};
    const tenantName = kop.nama_rt || kop.nama_organisasi || (getSetting && getSetting("nama_organisasi")) || "SmaRtRw AI";
    const tagline = kop.tagline || (getSetting && getSetting("tagline")) || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(tenantName.toUpperCase(), 14, 18);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(tagline, 14, 23);
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 26, 196, 26);

    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("RINGKASAN SALDO NASABAH BANK SAMPAH", 14, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Tenant: ${tenantId}`, 14, 39);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 44);

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
      startY: 49,
      head: [
        ["Nama Nasabah", "NIK", "Total Tabungan", "Tarik Saldo", "Saldo Sisa"],
      ],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
    });

    // Closing Quote
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(
      '"Mari selalu menjaga rukun tetangga dengan saling berbagi, mewujudkan harmoni dan kebersamaan di lingkungan kita."',
      105,
      finalY + 15,
      { align: "center", maxWidth: 180 }
    );

    const cleanTenantName = tenantName.replace(/[^a-zA-Z0-9]/g, "_");
    const cleanTagline = tagline.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(
      `Ringkasan_Nasabah_Sampah_${cleanTenantName}_${cleanTagline}_${new Date().toISOString().split("T")[0]}.pdf`,
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 active:scale-95 ${
                  activeSubTab === tab.id
                    ? "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 font-black tracking-wide hover:brightness-105"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
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
                    {(isWarga ? filteredSampahSetoran : sampahSetoranData)
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
    </div>
  );
}
