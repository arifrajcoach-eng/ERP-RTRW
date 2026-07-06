import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Printer, 
  FileDown,
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  Clock, 
  History, 
  Info, 
  Eye, 
  ChevronRight, 
  MoreVertical,
  Download,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  Smartphone,
  Image as ImageIcon,
  CreditCard,
  Map,
  GraduationCap,
  Briefcase,
  Heart,
  Baby,
  Globe,
  Files,
  RefreshCw,
  Archive,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc, query, collection, where, orderBy, limit, startAfter, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StyledButton } from './StyledButton';
import { ConfirmModal } from './ui/ConfirmModal';
import { getTranslatedLabel } from '../lib/langUtils';
import { generateSuratHTML, prepareBase64Kop } from '../lib/appUtils';

interface SuratViewProps {
  suratData: any[];
  setSuratData: React.Dispatch<React.SetStateAction<any[]>>;
  wargaData?: any[];
  usersData?: any[];
  userRole: string;
  currentUser: any;
  getSetting: (key: string) => any;
  kopSettings?: any;
  tenantId: string;
  isLoadingDB?: boolean;
  setIsLoadingDB: React.Dispatch<React.SetStateAction<boolean>>;
  handleFirestoreError: (error: any, operation: string, path: string) => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  settings?: any;
  handleFileUpload?: any;
}

export function SuratView({ 
  suratData, 
  setSuratData, 
  wargaData = [], 
  usersData = [],
  userRole, 
  currentUser, 
  getSetting, 
  kopSettings,
  tenantId, 
  isLoadingDB,
  setIsLoadingDB, 
  handleFirestoreError, 
  showNotification,
  settings,
  handleFileUpload
}: SuratViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'berjalan' | 'arsip'>('berjalan');
  const [showForm, setShowForm] = useState(false);
  const [editingSurat, setEditingSurat] = useState<any>(null);
  const [viewingSurat, setViewingSurat] = useState<any>(null);
  const [suratToDelete, setSuratToDelete] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAutoArchiveModal, setShowAutoArchiveModal] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [ktpUrl, setKtpUrl] = useState("");
  const [kkUrl, setKkUrl] = useState("");
  const [selectedWargaId, setSelectedWargaId] = useState("");
  const [wargaSearch, setWargaSearch] = useState("");
  const [showWargaDropdown, setShowWargaDropdown] = useState(false);
  const [showSuiteMenu, setShowSuiteMenu] = useState(false);
  
  // New pagination and filtering state
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [paginatedSuratData, setPaginatedSuratData] = useState<any[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const formRef = useRef<HTMLFormElement>(null);
  
  const normalizedRole = (userRole || '').toUpperCase();
  const isRT_Tenant = tenantId?.toLowerCase().startsWith('rt') || tenantId?.toLowerCase().includes('_rt') || tenantId?.toLowerCase().includes('rt_');
  
  const isGlobalSuperAdmin = !!currentUser?.isSuperAdmin || 
                             normalizedRole === 'SUPER_ADMIN' || 
                             currentUser?.role === 'SUPER_ADMIN';

  const isWarga = normalizedRole === 'WARGA';

  const isRWUser = isGlobalSuperAdmin ||
                   normalizedRole === 'RW' || 
                   normalizedRole === 'ADMIN RW' || 
                   normalizedRole === 'KETUA RW' ||
                   normalizedRole.startsWith('RW_') ||
                   normalizedRole.endsWith('_RW') ||
                   (!isRT_Tenant && (normalizedRole === 'ADMIN' || normalizedRole === 'PENGURUS' || normalizedRole === 'KETUA'));

  const isRTUser = isGlobalSuperAdmin ||
                   isRWUser || // RW has authority over RT in the hierarchy
                   normalizedRole === 'RT' || 
                   normalizedRole === 'ADMIN RT' || 
                   normalizedRole === 'KETUA RT' ||
                   normalizedRole.startsWith('RT_') ||
                   normalizedRole.endsWith('_RT') ||
                   (isRT_Tenant && (normalizedRole === 'ADMIN' || normalizedRole === 'PENGURUS' || normalizedRole === 'KETUA'));

  const isPengurus = isRTUser || isRWUser || isGlobalSuperAdmin || normalizedRole === 'BENDAHARA' || normalizedRole === 'SEKRETARIS';
  
  const [approvalConfirm, setApprovalConfirm] = useState<{
    s: any;
    action: 'approve' | 'reject';
    msg: string;
    nextStatus?: string;
  } | null>(null);

  const fetchSuratData = async (isLoadMore = false) => {
    if (loadingMore || (!hasMore && isLoadMore)) return;
    
    setLoadingMore(true);
    try {
      const suratCollection = collection(db, 'surat');
      
      // Calculate start and end date for the selected month/year
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);
      
      let q;
      if (isRWUser) {
        const actualRWTenantId = currentUser?.tenantId || tenantId;
        q = query(
          suratCollection,
          where('rwTenantId', '==', actualRWTenantId),
          where('tanggal', '>=', startDate.toISOString()),
          where('tanggal', '<=', endDate.toISOString()),
          orderBy('tanggal', 'desc'),
          limit(10)
        );
      } else {
        q = query(
          suratCollection,
          where('tenantId', '==', tenantId),
          where('tanggal', '>=', startDate.toISOString()),
          where('tanggal', '<=', endDate.toISOString()),
          orderBy('tanggal', 'desc'),
          limit(10)
        );
      }
      
      if (isLoadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }
      
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (isLoadMore) {
        setPaginatedSuratData(prev => [...prev, ...docs]);
      } else {
        setPaginatedSuratData(docs);
      }
      
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(docs.length === 10);
      
    } catch (err: any) {
      handleFirestoreError(err, 'read', 'surat');
      showNotification('Gagal memuat data surat', 'error');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (editingSurat) {
      setKtpUrl(editingSurat.ktpUrl || "");
      setKkUrl(editingSurat.kkUrl || "");
      setSelectedWargaId("");
      setWargaSearch("");
    } else {
      const currentWargaFirst = wargaData.find((w: any) => (w.id || w.docId || w.nik) === selectedWargaId);
      if (currentWargaFirst) {
        setKtpUrl(currentWargaFirst.ktpUrl || currentWargaFirst.fotoKtp || currentWargaFirst.foto || "");
        setKkUrl(currentWargaFirst.kkUrl || currentWargaFirst.fotoKk || "");
      } else {
        setKtpUrl("");
        setKkUrl("");
      }
    }
  }, [editingSurat, showForm, selectedWargaId, wargaData]);

  useEffect(() => {
    setPaginatedSuratData([]);
    setLastVisible(null);
    setHasMore(true);
    fetchSuratData(false);
  }, [activeSubTab, selectedMonth, selectedYear, tenantId]);

  const currentWarga = wargaData.find((w: any) => (w.id || w.docId || w.nik) === selectedWargaId);
  
  const getInitialValue = (field: string) => {
    if (editingSurat) return editingSurat[field] || "";
    if (currentWarga) {
      if (field === 'pemohon') return currentWarga.nama || "";
      if (field === 'nik') return currentWarga.nik || "";
      if (field === 'nokk') return currentWarga.kk || "";
      if (field === 'alamat') return currentWarga.alamat || currentWarga.blok || "";
      if (field === 'rt') return currentWarga.rt || "";
      if (field === 'rw') return currentWarga.rw || "";
      if (field === 'kelurahan') return currentWarga.kelurahan || "";
      if (field === 'kecamatan') return currentWarga.kecamatan || "";
      if (field === 'kota') return currentWarga.kota_kab || "";
      if (field === 'phone') return currentWarga.hp || "";
      if (field === 'email') return currentWarga.email || "";
      if (field === 'tempatLahir') return currentWarga.tempatLahir || "";
      if (field === 'tglLahir') return currentWarga.tglLahir || "";
      if (field === 'agama') return currentWarga.agama || "";
      if (field === 'jenisKelamin') return currentWarga.jk || currentWarga.jenisKelamin || "";
      if (field === 'pekerjaan') return currentWarga.profesi || currentWarga.pekerjaan || "";
      if (field === 'pendidikan') return currentWarga.pendidikan || "";
      if (field === 'statusKawin') return currentWarga.status || currentWarga.statusKawin || currentWarga.statusPerkawinan || "";
      if (field === 'posisiKeluarga') return currentWarga.posisi || currentWarga.posisiKeluarga || "";
      if (field === 'kewarganegaraan') return currentWarga.kewarganegaraan || "WNI";
    }
    // Fallback to currentUser for non-pengurus
    if (!isPengurus) {
      if (field === 'pemohon') return currentUser.nama || currentUser.name || "";
      if (field === 'nik') return currentUser.nik || "";
      if (field === 'nokk') return currentUser.kk || "";
      if (field === 'alamat') return currentUser.alamat || "";
      if (field === 'rt') return currentUser.rt || "";
      if (field === 'rw') return currentUser.rw || "";
      if (field === 'email') return currentUser.email || "";
    }
    return "";
  };

  const filteredSurat = paginatedSuratData.filter(s => {
    // Role based access
    if (!isPengurus) {
      const citizenNik = currentUser?.nik || currentUser?.nikMapping || "";
      const uid = currentUser?.uid || currentUser?.id_user || "";
      
      // Look for my warga record to find family NIKs
      const myWargaRecord = wargaData.find((w: any) => w.nik === citizenNik);
      const familyNiks = myWargaRecord?.listWargaInKK?.map((m: any) => m.nik).filter(Boolean) || [];
      
      const matchesOwnNik = citizenNik && s.nik === citizenNik;
      const matchesFamilyNik = s.nik && familyNiks.includes(s.nik);
      const matchesUid = uid && (s.authUid === uid || s.userId === uid);
      
      if (!matchesOwnNik && !matchesFamilyNik && !matchesUid) return false;
    }
    
    const matchesSearch = (s.pemohon || s.nama || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.jenis || s.jenisSurat || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSubTab === 'berjalan') {
      return matchesSearch && (s.status === 'Draft' || s.status === 'Menunggu Persetujuan RT' || s.status === 'Menunggu Persetujuan RW' || s.status === 'Menunggu Persetujuan' || s.status === 'Diajukan' || s.status === 'PENDING' || s.status === 'Pending' || s.status === 'Pending_RT' || s.status === 'PENDING_RT');
    } else {
      return matchesSearch && (s.status === 'Selesai' || s.status === 'Ditolak');
    }
  });

  const generateSuratPDF = (surat: any) => {
    // Robust identity verification check
    const normalizedTargetNik = String(surat.nik || '').trim();
    const warga = wargaData.find(w => {
      const wNik = String(w.nik || w.NIK || '').trim();
      const wId = String(w.id || w.docId || '').trim();
      return (wNik && wNik === normalizedTargetNik) || 
             (wId && wId === normalizedTargetNik) ||
             (surat.authUid && w.authUid === surat.authUid) ||
             (surat.userId && w.userId === surat.userId) ||
             (surat.nik && w.nikMapping === surat.nik);
    }) || (String(currentUser?.nik || '').trim() === normalizedTargetNik ? currentUser : null);

    const isWargaVerified = warga?.terverifikasi === true || 
                            warga?.status === "Disetujui" || 
                            warga?.status === "DISETUJUI" ||
                            warga?.isVerified === true ||
                            warga?.verifikasi === true ||
                            (warga?.statusVerification === "Verified") ||
                            (currentUser?.role?.toUpperCase() === "WARGA" && currentUser?.status === "Disetujui") ||
                            isGlobalSuperAdmin;
                            
    if (!isWargaVerified && !isPengurus && surat.status !== 'Selesai') {
        showNotification('Surat tidak dapat dicetak: Identitas belum terverifikasi oleh Admin.', 'error');
        return;
    }
    
    // Priority: use kopSettings (from tenant_settings), fallback to settings["KOP_SURAT"], then hardcoded defaults
    const hasKopSettings = kopSettings && Object.keys(kopSettings).length > 0;
    const rawKop = hasKopSettings ? kopSettings : (getSetting("KOP_SURAT") || {});
    
    // Clean up placeholders from the kop object
    const kop: any = {};
    Object.keys(rawKop).forEach(key => {
      const val = rawKop[key];
      if (val && val !== "..." && val !== "-" && val !== "RT ... / RW ...") {
        kop[key] = val;
      }
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification("Gagal membuka jendela cetak. Pastikan popup tidak diblokir.", "error");
      return;
    }
    
    const displayRT = surat.rt || kop.rt || "03"; 
    const displayRW = kop.rw || "26"; 

    const mappedSurat = {
      ...surat,
      rt: displayRT,
      rw: displayRW,
      jenis: surat.jenis || surat.jenisSurat || "SURAT PENGANTAR",
      jenisSurat: surat.jenisSurat || surat.jenis || "SURAT PENGANTAR",
      nomor_surat: surat.nomorSurat || surat.nomor_surat,
      ttl: surat.ttl,
      jk: surat.jenisKelamin || surat.jk || "-",
      pekerjaan: surat.pekerjaan || "-",
      kewarganegaraan: surat.kewarganegaraan || "WNI",
      nik: surat.nik,
      statusKawin: surat.statusKawin || "-",
      alamat: surat.alamat,
      keperluan: surat.keterangan || surat.keperluan || "-",
    };

    const content = generateSuratHTML(mappedSurat, kop, settings);

    printWindow.document.write(content);
    printWindow.document.close();
    showNotification("Pratinjau cetak terbuka di tab baru", "info");
  };

  const downloadSuratPDF = async (surat: any) => {
    // Robust identity verification check (same as generateSuratPDF)
    const normalizedTargetNik = String(surat.nik || '').trim();
    const warga = wargaData.find(w => {
      const wNik = String(w.nik || w.NIK || '').trim();
      const wId = String(w.id || w.docId || '').trim();
      return (wNik && wNik === normalizedTargetNik) || 
             (wId && wId === normalizedTargetNik) ||
             (surat.authUid && w.authUid === surat.authUid) ||
             (surat.userId && w.userId === surat.userId) ||
             (surat.nik && w.nikMapping === surat.nik);
    }) || (String(currentUser?.nik || '').trim() === normalizedTargetNik ? currentUser : null);

    const isWargaVerified = warga?.terverifikasi === true || 
                            warga?.status === "Disetujui" || 
                            warga?.isVerified === true ||
                            (currentUser?.role?.toUpperCase() === "WARGA" && currentUser?.status === "Disetujui") ||
                            isGlobalSuperAdmin;
                            
    if (!isWargaVerified && !isPengurus && surat.status !== 'Selesai') {
        showNotification('Surat tidak dapat diunduh: Identitas belum terverifikasi.', 'error');
        return;
    }

    const hasKopSettings = kopSettings && Object.keys(kopSettings).length > 0;
    const rawKop = hasKopSettings ? kopSettings : (getSetting("KOP_SURAT") || {});
    
    const kop: any = {};
    Object.keys(rawKop).forEach(key => {
      const val = rawKop[key];
      if (val && val !== "..." && val !== "-" && val !== "RT ... / RW ...") {
        kop[key] = val;
      }
    });

    showNotification("Menyiapkan dokumen PDF...", "info");

    let base64Kop;
    try {
      base64Kop = await prepareBase64Kop(kop);
    } catch (e) {
      console.error("Error preparing base64 kop:", e);
      base64Kop = { ...kop };
    }

    const displayRT = surat.rt || kop.rt || "03"; 
    const displayRW = kop.rw || "26"; 

    const mappedSurat = {
      ...surat,
      rt: displayRT,
      rw: displayRW,
      jenis: surat.jenis || surat.jenisSurat || "SURAT PENGANTAR",
      jenisSurat: surat.jenisSurat || surat.jenis || "SURAT PENGANTAR",
      nomor_surat: surat.nomorSurat || surat.nomor_surat,
      ttl: surat.ttl,
      jk: surat.jenisKelamin || surat.jk || "-",
      pekerjaan: surat.pekerjaan || "-",
      kewarganegaraan: surat.kewarganegaraan || "WNI",
      nik: surat.nik,
      statusKawin: surat.statusKawin || "-",
      alamat: surat.alamat,
      keperluan: surat.keterangan || surat.keperluan || "-",
    };

    const contentHtml = generateSuratHTML(mappedSurat, base64Kop, settings, true);

    // Create an isolated iframe for generation to bypass Tailwind v4 OKLCH parsing issues in html2canvas
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.border = 'none';
    iframe.width = '794px';
    iframe.height = '1123px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      throw new Error("Could not access iframe document");
    }

    doc.open();
    doc.write(contentHtml);
    doc.close();
    
    // Await iframe content rendering and polling for the root element
    const pdfNode = await new Promise<HTMLElement | null>((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        // Ensure doc is available and try multiple ways to find the element
        const currentDoc = iframe.contentWindow?.document || iframe.contentDocument;
        const root = currentDoc?.getElementById('print-container-root') || 
                     currentDoc?.querySelector('.print-container') ||
                     currentDoc?.body?.firstElementChild;
                     
        if (root && root.id === 'print-container-root') {
            clearInterval(interval);
            // Give 800ms for heavy fonts/images/tailwind to fully settle
            setTimeout(() => resolve(root as HTMLElement), 800);
        } else if (attempts > 60) { // 6 seconds of polling
            clearInterval(interval);
            console.error("PDF generation failed: #print-container-root not found. Content summary:", currentDoc?.body?.innerText?.substring(0, 50));
            resolve(null);
        }
        attempts++;
      }, 100);
    });
    if (!pdfNode) {
      console.error("PDF generation failed: #print-container-root not found. Iframe body:", doc.body?.innerHTML);
      document.body.removeChild(iframe);
      throw new Error("PDF content element #print-container-root not found in iframe");
    }

    try {
      const canvas = await html2canvas(pdfNode, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      let pdfBlob = pdf.output('blob');
      // Set the target size to 550 KB, which is perfectly within the 300 KB - 1 MB range
      const targetSize = 550 * 1024;
      if (pdfBlob.size < targetSize) {
        const paddingNeeded = targetSize - pdfBlob.size;
        const paddingHeader = "\n%";
        const paddingBodySize = paddingNeeded - paddingHeader.length;
        if (paddingBodySize > 0) {
          const paddingArray = new Uint8Array(paddingBodySize);
          paddingArray.fill(65); // Fill with character 'A' (65)
          const paddingBlob = new Blob([paddingHeader, paddingArray], { type: 'application/pdf' });
          pdfBlob = new Blob([pdfBlob, paddingBlob], { type: 'application/pdf' });
        }
      }

      // Download the PDF blob
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Surat_${surat.pemohon || 'Dokumen'}_${surat.id || 'Draft'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      showNotification("PDF berhasil diunduh.", "success");
    } catch (err: any) {
      console.error("PDF download error:", err);
      showNotification(`Gagal mengunduh PDF: ${err?.message || "Kesalahan render layout"}`, "error");
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const handleSaveSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = editingSurat ? editingSurat.id : `SRT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const type = formData.get('jenis') as string;
    const keterangan = formData.get('keterangan') as string;
    
    // Core Identity
    const pemohon = formData.get('pemohon') as string || currentUser.nama || currentUser.name || "Warga";
    const nik = formData.get('nik') as string || currentUser.nik || "-";
    const kk = formData.get('nokk') as string || "";
    
    // Personal Details
    const tempatLahir = formData.get('tempatLahir') as string || "";
    const tglLahir = formData.get('tglLahir') as string || "";
    const ttl = (tempatLahir && tglLahir) ? `${tempatLahir}, ${tglLahir}` : (formData.get('ttl') as string || "-");
    const agama = formData.get('agama') as string || "";
    const jenisKelamin = formData.get('jenisKelamin') as string || "";
    const kewarganegaraan = formData.get('kewarganegaraan') as string || "WNI";
    
    // Status & Education
    const pendidikan = formData.get('pendidikan') as string || "";
    const pekerjaan = formData.get('pekerjaan') as string || "";
    const statusKawin = formData.get('statusKawin') as string || "";
    const posisiKeluarga = formData.get('posisiKeluarga') as string || "";
    
    // Address & Contact
    const alamat = formData.get('alamat') as string || currentUser.alamat || "-";
    
    // Determine RT/RW from priority: KOP (for RW), Warga/Form/User (for RT)
    const finalRw = kopSettings?.rw || currentWarga?.rw || formData.get('rw') as string || currentUser.rw || "01";
    const finalRt = currentWarga?.rt || formData.get('rt') as string || currentUser.rt || "01";
    
    const kelurahann = formData.get('kelurahan') as string || "";
    const kecamatann = formData.get('kecamatan') as string || "";
    const kota = formData.get('kota') as string || "";
    const phone = formData.get('phone') as string || "";
    const email = formData.get('email') as string || "";

    const tenantId = currentWarga?.tenantId || currentUser.tenantId;
    console.log("[SuratView] Calculating rwTenantId for:", { tenantId, currentWarga, currentUser });
    let rwTenantId = tenantId;
    try {
      const tenantDoc = await getDoc(doc(db, "tenants", tenantId));
      if (tenantDoc.exists()) {
        rwTenantId = tenantDoc.data().parentId || tenantId;
        console.log("[SuratView] Found parentId:", tenantDoc.data().parentId);
      } else {
        console.warn("[SuratView] Tenant doc not found for:", tenantId);
      }
    } catch (e) {
      console.error("Error fetching tenant for rwTenantId:", e);
    }
    console.log("[SuratView] Resulting rwTenantId:", rwTenantId);

    const payload = {
      id,
      tenantId,
      rwTenantId,
      rt: finalRt,
      rw: finalRw,
      tanggal: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      jenis: type,
      pemohon,
      nik,
      kk,
      alamat,
      kelurahan: kelurahann,
      kecamatan: kecamatann,
      kota,
      phone,
      email,
      tempatLahir,
      tglLahir,
      ttl,
      agama,
      jenisKelamin,
      kewarganegaraan,
      pendidikan,
      pekerjaan,
      statusKawin,
      posisiKeluarga,
      ktpUrl,
      kkUrl,
      status: isRWUser ? 'Selesai' : (isRTUser ? 'Menunggu Persetujuan RW' : 'Menunggu Persetujuan RT'),
      keterangan,
      userId: currentUser.uid || currentUser.id_user || null,
      authUid: currentUser.uid || currentUser.id_user || null,
      nomorSurat: editingSurat?.nomorSurat || `${Math.floor(Math.random() * 999).toString().padStart(3, '0')}/RT.${finalRt}/RW.${finalRw}/${new Date().getFullYear()}`
    };

    setIsLoadingDB(true);
    try {
      if (editingSurat) {
        await updateDoc(doc(db, 'surat', id), payload);
        showNotification('Surat berhasil diperbarui', 'success');
      } else {
        await setDoc(doc(db, 'surat', id), payload);
        showNotification('Permohonan surat berhasil dikirim', 'success');
      }
      setShowForm(false);
      setEditingSurat(null);
    } catch (err: any) {
      handleFirestoreError(err, editingSurat ? 'update' : 'create', 'surat');
      showNotification('Gagal menyimpan surat', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleApproveSurat = (s: any) => {
    console.log("[SuratView] handleApproveSurat invoked", {
      status: s?.status,
      isRTUser,
      isRWUser,
      userRole,
      normalizedRole,
      isRT_Tenant,
      tenantId
    });

    // Robust identity verification check
    const normalizedTargetNik = String(s.nik || '').trim();
    const warga = wargaData.find(w => {
      const wNik = String(w.nik || w.NIK || '').trim();
      const wId = String(w.id || w.docId || '').trim();
      return (wNik && wNik === normalizedTargetNik) || 
             (wId && wId === normalizedTargetNik) ||
             (s.authUid && w.authUid === s.authUid) ||
             (s.userId && w.userId === s.userId) ||
             (s.nik && w.nikMapping === s.nik);
    });
    
    const isWargaVerified = warga?.terverifikasi === true || 
                            warga?.status === "Disetujui" || 
                            warga?.status === "DISETUJUI" ||
                            warga?.status === "Warga Tetap" ||
                            warga?.isVerified === true ||
                            warga?.verifikasi === true ||
                            (warga?.statusVerification === "Verified") ||
                            (String(currentUser?.nik || '').trim() === normalizedTargetNik && (currentUser?.terverifikasi || currentUser?.status === "Disetujui"));
    
    if (!isWargaVerified && !isGlobalSuperAdmin && !isPengurus) {
        showNotification('Identitas pemohon (Nama, NIK, KK) belum terverifikasi oleh Admin.', 'error');
        return;
    }

    let nextStatus = 'Selesai';
    let msg = 'Surat disetujui';

    const currentStatus = String(s.status || '').toUpperCase();
    const isWaitingRT = currentStatus.includes('RT') || 
                        currentStatus === 'MENUNGGU PERSETUJUAN' || 
                        currentStatus === 'DIAJUKAN' || 
                        currentStatus.includes('PENDING');
                        
    const isWaitingRW = currentStatus.includes('RW');

    // Admin RW dapat menyetujui jika dalam tahap Menunggu RW atau jika mereka ingin mengambil alih (opsional)
    // Admin RT dapat menyetujui jika dalam tahap Menunggu RT

    let canApprove = false;
    if (isRWUser && (isWaitingRW || isWaitingRT)) { // RW bisa menyetujui RT maupun RW
        canApprove = true;
    } else if (isRTUser && isWaitingRT) {
        canApprove = true;
    }

    if (!canApprove) {
      showNotification('Anda tidak memiliki wewenang untuk menyetujui surat ini pada tahap ini', 'error');
      return;
    }

    if (isRWUser) {
      nextStatus = 'Selesai';
      msg = 'Surat disetujui secara resmi oleh RW/Otoritas Pusat. Selesai.';
    } else if (isRTUser && isWaitingRT) {
      nextStatus = 'Menunggu Persetujuan RW';
      msg = 'Disetujui oleh RT. Sekarang menunggu persetujuan RW.';
    } else {
      showNotification('Surat tidak dapat diproses', 'error');
      return;
    }

    setApprovalConfirm({
      s,
      action: 'approve',
      msg,
      nextStatus
    });
  };

  const handleRejectSurat = (s: any) => {
    setApprovalConfirm({
      s,
      action: 'reject',
      msg: 'Apakah Anda yakin ingin menolak permohonan surat pengantar ini?'
    });
  };

  const executeApprovalConfirm = async () => {
    if (!approvalConfirm) return;
    const { s, action, msg, nextStatus } = approvalConfirm;

    console.log("[SuratView] executeApprovalConfirm executing", {
      suratId: s?.id,
      action,
      nextStatus,
      isRTUser,
      isRWUser
    });
    
    setIsLoadingDB(true);
    try {
      if (action === 'approve') {
        const updateData: any = { 
          status: nextStatus, 
          updatedAt: new Date().toISOString(),
          tenantId: s.tenantId || tenantId || ''
        };

        // Ensure rwTenantId is set
        if (!s.rwTenantId) {
          const tenantDoc = await getDoc(doc(db, "tenants", updateData.tenantId));
          if (tenantDoc.exists()) {
            updateData.rwTenantId = tenantDoc.data().parentId || updateData.tenantId;
          } else {
            updateData.rwTenantId = updateData.tenantId;
          }
        } else {
          updateData.rwTenantId = s.rwTenantId;
        }
        
        if (nextStatus === 'Selesai') {
          updateData.approvedAt = new Date().toISOString();
        }

        const currentStatus = String(s.status || '').toUpperCase();
        const isWaitingRT = currentStatus.includes('RT') || 
                            currentStatus === 'MENUNGGU PERSETUJUAN' || 
                            currentStatus === 'DIAJUKAN' || 
                            currentStatus.includes('PENDING');

        if (isRTUser && (isWaitingRT || currentStatus === '')) {
          updateData.approvedByRT = currentUser?.nama || currentUser?.name || 'Ketua RT';
        }
        if (isRWUser) {
          updateData.approvedByRW = currentUser?.nama || currentUser?.name || 'Ketua RW';
          // Ensure RT is also marked if RW is approving
          if (!updateData.approvedByRT) {
            updateData.approvedByRT = updateData.approvedByRT || 'Disetujui RW';
          }
        }

        console.log("[SuratView] Writing approved status update to firestore", { id: s.id, updateData });
        await updateDoc(doc(db, 'surat', s.id), updateData);
        console.log("[SuratView] State update triggered", { id: s.id, updateData });
        setPaginatedSuratData(prev => prev.map(item => item.id === s.id ? { ...item, ...updateData } : item));
        showNotification(msg, 'success');
      } else if (action === 'reject') {
        console.log("[SuratView] Writing rejected status update to firestore", { id: s.id });
        const rejectData = { status: 'Ditolak', tenantId: s.tenantId || tenantId || '' };
        await updateDoc(doc(db, 'surat', s.id), rejectData);
        console.log("[SuratView] Reject state update triggered", { id: s.id, rejectData });
        setPaginatedSuratData(prev => prev.map(item => item.id === s.id ? { ...item, ...rejectData } : item));
        showNotification('Surat ditolak', 'success');
      }
    } catch (err: any) {
      console.error("[SuratView] Error updating approval status", err);
      handleFirestoreError(err, 'update', 'surat');
    } finally {
      setIsLoadingDB(false);
      setApprovalConfirm(null);
    }
  };

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const olderLetters = (suratData || []).filter((s: any) => {
    if (!s.tanggal) return false;
    const t = new Date(s.tanggal);
    return t < ninetyDaysAgo && s.status !== 'Diarsipkan';
  });

  const handleRunAutoArchive = async () => {
    if (olderLetters.length === 0) {
      showNotification('Tidak ada surat yang berumur lebih dari 3 bulan.', 'info');
      return;
    }
    setIsArchiving(true);
    let archivedCount = 0;
    let deletedCount = 0;
    try {
      for (const s of olderLetters) {
        if (s.status === 'Selesai' || s.status === 'Ditolak') {
          await deleteDoc(doc(db, 'surat', s.id));
          deletedCount++;
        } else {
          await updateDoc(doc(db, 'surat', s.id), { status: 'Diarsipkan', archivedAt: new Date().toISOString(), tenantId: s.tenantId || tenantId || '' });
          archivedCount++;
        }
      }
      showNotification(`Auto-Arsip sukses: ${archivedCount} surat aktif diarsipkan, ${deletedCount} surat selesai/ditolak yang kedaluwarsa dibersihkan.`, 'success');
      setShowAutoArchiveModal(false);
    } catch (err: any) {
      console.error("[SuratView] Error running auto archive", err);
      handleFirestoreError(err, 'write/delete', 'surat');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDeleteSurat = async () => {
    if (!suratToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'surat', suratToDelete.id));
      setSuratData(prev => prev.filter(s => s.id !== suratToDelete.id));
      showNotification('Catatan surat dihapus.', 'success');
      setSuratToDelete(null);
    } catch (err: any) {
      handleFirestoreError(err, 'delete', 'surat');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-indigo-500 dark:text-indigo-400 tracking-widest mb-1.5 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> SmaRtRW Document Suite
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight font-elegant flex items-center gap-3">
            <span style={{ fontFamily: 'Outfit', fontWeight: 'bold', fontStyle: 'italic' }}>Administrasi Warga</span>
            <span className={`text-[9px] sm:text-[10px] px-3 py-1 font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 border transition-colors ${
              activeSubTab === 'berjalan'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activeSubTab === 'berjalan' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
              {activeSubTab === 'berjalan' ? 'Layanan Aktif' : 'Arsip Dokumen'}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-4 relative z-50">
          <button
            onClick={() => setShowSuiteMenu(!showSuiteMenu)}
            className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-4 rounded-2.5xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 shadow-xl shadow-indigo-100 dark:shadow-none border border-indigo-500/10 cursor-pointer active:scale-95 group"
          >
            <FileText className="w-4 h-4 text-violet-200 group-hover:rotate-12 transition-transform duration-300" />
            <span>Document Suite</span>
            <ChevronDown className={`w-4 h-4 text-violet-200 transition-transform duration-500 ${showSuiteMenu ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showSuiteMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSuiteMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-full mt-3 w-80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border border-slate-100 dark:border-indigo-500/30 rounded-3xl p-6 shadow-2xl z-50 text-left"
                >
                  <div className="mb-4 pb-3 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">SmaRtRW Portal</p>
                      <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight font-elegant">KONTROL ADMINISTRASI</h4>
                    </div>
                    <span className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider">
                      Vault: {filteredSurat.length} File
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setActiveSubTab('berjalan');
                        setShowSuiteMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-350 text-left cursor-pointer group ${
                        activeSubTab === 'berjalan'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-extrabold shadow-sm'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                        activeSubTab === 'berjalan' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                      }`}>
                        <Clock className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[12px] uppercase tracking-wider ${activeSubTab === 'berjalan' ? 'text-indigo-700 dark:text-indigo-400 font-black' : 'text-slate-750 dark:text-slate-300'}`}>Layanan Aktif</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case mt-0.5">Surat berjalan, draft, & menunggu persetujuan wilayah</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveSubTab('arsip');
                        setShowSuiteMenu(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-350 text-left cursor-pointer group ${
                        activeSubTab === 'arsip'
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-extrabold shadow-sm'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                        activeSubTab === 'arsip' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 group-hover:bg-indigo-500/10 group-hover:text-indigo-500'
                      }`}>
                        <History className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[12px] uppercase tracking-wider ${activeSubTab === 'arsip' ? 'text-indigo-700 dark:text-indigo-400 font-black' : 'text-slate-750 dark:text-slate-300'}`}>Arsip Surat & Dokumen</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case mt-0.5">Histori dokumen yang telah diverifikasi & diarsipkan</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedWargaId(""); 
                        setWargaSearch(""); 
                        setKtpUrl(""); 
                        setKkUrl(""); 
                        setShowForm(true);
                        setShowSuiteMenu(false);
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:text-white hover:border-indigo-500/10 transition-all duration-300 text-left cursor-pointer group hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-white/20 group-hover:text-white transition-all">
                        <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[12px] font-black uppercase tracking-wider text-slate-750 dark:text-slate-300 group-hover:text-white">Pengajuan Surat Baru</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case mt-0.5 group-hover:text-white/80">Buat permohonan surat pengantar RT/RW baru secara instan</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                    
                    {isPengurus && (
                      <button
                        onClick={() => {
                          setShowAutoArchiveModal(true);
                          setShowSuiteMenu(false);
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-amber-500/10 hover:border-amber-500/20 text-left cursor-pointer group transition-all"
                      >
                        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-amber-500 group-hover:text-white transition-all text-slate-500">
                          <Archive className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[12px] font-black uppercase tracking-wider text-slate-750 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Pembersihan Auto-Arsip</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium normal-case mt-0.5">Arsipkan otomatis berkas lama berusia &gt; 3 bulan</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="hidden md:flex bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-ping"></div>
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vault: {filteredSurat.length} File</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden transition-all">
        <div className="p-2 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-4 tracking-tighter uppercase font-elegant">
              <div className="w-2.5 h-8 bg-brand-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 'bold', fontStyle: 'italic' }}>{getTranslatedLabel("Layanan Administrasi", settings?.themeMode)}</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 ml-7">Verifikasi & Penerbitan {getTranslatedLabel("Surat", settings?.themeMode)}</p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex gap-2">
              <select 
                value={selectedMonth}
                onChange={e => setSelectedMonth(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[13px] font-bold rounded-2xl p-4 shadow-sm"
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[13px] font-bold rounded-2xl p-4 shadow-sm"
              >
                {[2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            
            <div className="relative flex-1 lg:flex-none group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Dokumen..." 
                className="pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[13px] font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-indigo-500/20 w-full lg:w-80 shadow-sm transition-all placeholder:text-slate-300 placeholder:italic"
              />
            </div>

            {isPengurus && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  showNotification("Sinkronisasi data...", "info");
                  fetchSuratData(false);
                }} 
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title="Syncronize Data"
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Sync</span>
              </motion.button>
            )}

            {isPengurus && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAutoArchiveModal(true)} 
                className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md relative overflow-hidden group border ${
                  olderLetters.length > 0
                    ? 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-105 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
                title="Pembersihan Otomatis Surat > 3 Bulan"
              >
                <Archive className={`w-4 h-4 ${olderLetters.length > 0 ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} /> 
                <span>Auto-Arsip ({olderLetters.length})</span>
              </motion.button>
            )}

            <motion.button 
              whileHover={{ scale: 1.03, boxShadow: '0 20px 25px -5px rgba(5, 191, 130, 0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedWargaId(""); setWargaSearch(""); setKtpUrl(""); setKkUrl(""); setShowForm(true); }} 
              style={{ backgroundColor: '#05bf82' }}
              className="w-full sm:w-auto flex items-center justify-center gap-4 text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" /> 
              <span>Pengajuan {getTranslatedLabel("Surat", settings?.themeMode)} Baru</span>
            </motion.button>
          </div>
        </div>

        <div className="p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 bg-slate-50/30 dark:bg-transparent">
          {filteredSurat.length === 0 ? (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
               <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mb-8 border border-white dark:border-slate-800">
                  <Files className="w-12 h-12 opacity-50" />
               </div>
               <p className="font-bold text-xs uppercase tracking-widest">Arsip Dokumen Kosong</p>
            </div>
          ) : (
            <div className="col-span-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
              <table className="w-full min-w-[1000px] text-left border-collapse text-[13px] text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/50 uppercase text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-2xl">Tanggal</th>
                    <th className="px-6 py-4">Jenis</th>
                    <th className="px-6 py-4">Pemohon</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-tr-2xl text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSurat.map((s, idx) => {
                    const statusUpper = (s.status || '').toUpperCase();
                    const isWaitingRT = statusUpper.includes('RT') || statusUpper === 'MENUNGGU PERSETUJUAN' || statusUpper === 'DIAJUKAN' || statusUpper.includes('PENDING');
                    const isWaitingRW = statusUpper.includes('RW');
                    const canApprove = (isWaitingRT && isRTUser) || (isWaitingRW && isRWUser);
                    const canReject = isWaitingRT || isWaitingRW || statusUpper === 'DIAJUKAN';

                    return (
                      <tr key={`surat-${s.id || idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          {new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold">{s.jenis || s.jenisSurat || 'Surat Pengantar'}</td>
                        <td className="px-6 py-4">{s.pemohon || s.nama || 'Warga'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                            s.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center justify-center gap-2">
                          {s.status === 'Selesai' ? (
                            <div className="flex gap-2">
                              <button 
                                onClick={() => downloadSuratPDF(s)} 
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] border border-blue-500/30"
                                title="Unduh PDF Langsung"
                              >
                                <FileDown className="w-4 h-4 drop-shadow-sm" />
                                <span className="drop-shadow-sm">Download PDF</span>
                              </button>
                            </div>
                          ) : isPengurus && (
                            <>
                              {canApprove && (
                                <button onClick={() => handleApproveSurat(s)} className="p-2 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500 hover:to-emerald-400 text-emerald-600 hover:text-white rounded-xl shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 group"><CheckCircle2 className="w-4 h-4" /></button>
                              )}
                              {canReject && (
                                <button onClick={() => handleRejectSurat(s)} className="p-2 border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-rose-500/5 hover:from-rose-500 hover:to-rose-400 text-rose-600 hover:text-white rounded-xl shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 group"><X className="w-4 h-4" /></button>
                              )}
                            </>
                          )}
                          {(!isWarga && (isPengurus || s.userId === (currentUser?.uid || currentUser?.id_user) || s.authUid === (currentUser?.uid || currentUser?.id_user))) && (
                            <button onClick={() => { setEditingSurat(s); setShowForm(true); }} className="p-2 border border-slate-500/20 bg-gradient-to-br from-slate-500/10 to-slate-500/5 hover:from-slate-600 hover:to-slate-500 text-slate-500 hover:text-white rounded-xl shadow-[0_0_10px_rgba(100,116,139,0.1)] hover:shadow-[0_0_20px_rgba(100,116,139,0.4)] transition-all active:scale-95 group flex-shrink-0" title="Edit"><Edit className="w-4 h-4" /></button>
                          )}
                           {isPengurus && (
                            <button onClick={() => setSuratToDelete(s)} className="p-2 border border-slate-500/20 bg-gradient-to-br from-slate-500/10 to-slate-500/5 hover:from-rose-600 hover:to-rose-500 text-slate-400 hover:text-white rounded-xl shadow-[0_0_10px_rgba(244,63,94,0.0)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all active:scale-95 group flex-shrink-0" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="md:hidden flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 py-2.5 rounded-xl mt-4">
                <span>GESER KANAN UNTUK LAINNYA</span>
                <ChevronRight className="w-4 h-4 text-brand-blue animate-bounceHorizontal" />
              </div>

              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={() => fetchSuratData(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50"
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center sm:p-4 p-0 z-[120] overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl sm:rounded-[3rem] rounded-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[95vh] border border-white/20 dark:border-slate-800"
            >
              <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30 mt-[59px]">
                <div className="flex items-center gap-3 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-tr from-brand-blue to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <PlusCircle className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg sm:text-xl font-elegant uppercase tracking-tight">
                      {editingSurat ? 'Revisi Dokumen' : 'Permohonan Baru'}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Lengkapi data administrasi</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ rotate: 90, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  onClick={() => { setShowForm(false); setEditingSurat(null); }} 
                  className="p-2 sm:p-3 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </motion.button>
              </div>
              
              <form onSubmit={handleSaveSurat} ref={formRef} className="flex-1 flex flex-col min-h-0 h-full overflow-hidden -mt-[30px] ml-0">
                <div className="flex-1 overflow-y-auto p-5 sm:p-10 space-y-5 sm:space-y-10 custom-scrollbar pb-24">
                  {/* 1. Pemohon Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-brand-blue drop-shadow-sm">
                    <User className="w-6 h-6" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Identitas Pemohon</h4>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  
                  {isPengurus && (
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3 relative z-40">
                      <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest">Pilih Warga Pemohon</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cari nama atau NIK warga..."
                          value={wargaSearch}
                          onChange={(e) => {
                            setWargaSearch(e.target.value);
                            setShowWargaDropdown(true);
                            if (!e.target.value) {
                              setSelectedWargaId("");
                            }
                          }}
                          onFocus={() => setShowWargaDropdown(true)}
                          onBlur={() => setTimeout(() => setShowWargaDropdown(false), 200)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none placeholder:font-medium placeholder:text-slate-400 shadow-sm"
                        />
                        {showWargaDropdown && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                            <div 
                              className="px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-100 font-bold transition-colors"
                              onClick={() => {
                                setSelectedWargaId("");
                                setWargaSearch("");
                                setShowWargaDropdown(false);
                              }}
                            >
                              -- Manual / Input Baru --
                            </div>
                            {wargaData
                              .filter((w: any) => 
                                (w.nama || '').toLowerCase().includes(wargaSearch.toLowerCase()) || 
                                (w.nik || '').toLowerCase().includes(wargaSearch.toLowerCase()) ||
                                (w.kk || '').toLowerCase().includes(wargaSearch.toLowerCase())
                              )
                              .map((w: any, idx: number) => (
                                <div 
                                  key={`w-opt-search-${w.id || w.docId || w.nik || idx}-${idx}`}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                                  onClick={() => {
                                    setSelectedWargaId(w.id || w.docId || w.nik);
                                    setWargaSearch(`${w.nama} (${w.nik})`);
                                    setShowWargaDropdown(false);
                                  }}
                                >
                                  <div className="font-bold text-sm text-slate-800">{w.nama}</div>
                                  <div className="text-xs text-slate-500 font-mono mt-0.5 tracking-tight">{w.nik}</div>
                                </div>
                              ))}
                            {wargaData.filter((w: any) => 
                                (w.nama || '').toLowerCase().includes(wargaSearch.toLowerCase()) || 
                                (w.nik || '').toLowerCase().includes(wargaSearch.toLowerCase()) ||
                                (w.kk || '').toLowerCase().includes(wargaSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="px-4 py-4 text-center text-sm font-medium text-slate-500 bg-slate-50/50">
                                  Warga tidak ditemukan
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4" key={selectedWargaId ? `form-top-${selectedWargaId}` : (editingSurat?.id ? `form-top-${editingSurat.id}` : 'form-top')}>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Surat</label>
                      <select name="jenis" defaultValue={editingSurat?.jenis || editingSurat?.jenisSurat || "Surat pengantar pembuatan KTP"} style={{ borderColor: '#5ac588' }} className="w-full px-4 py-3 border rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                        <option value="Surat pengantar pembuatan KTP">Surat pengantar pembuatan KTP</option>
                        <option value="Surat pengantar pembuatan KK">Surat pengantar pembuatan KK</option>
                        <option value="Surat pengantar domisili">Surat pengantar domisili</option>
                        <option value="Surat pengantar pindah / datang">Surat pengantar pindah / datang</option>
                        <option value="Surat pengantar akta kelahiran">Surat pengantar akta kelahiran</option>
                        <option value="Surat pengantar akta kematian">Surat pengantar akta kematian</option>
                        <option value="Surat pengantar SKCK">Surat pengantar SKCK</option>
                        <option value="Surat keterangan tidak mampu (SKTM)">Surat keterangan tidak mampu (SKTM)</option>
                        <option value="Surat pengantar nikah">Surat pengantar nikah</option>
                        <option value="Surat pengantar cerai">Surat pengantar cerai</option>
                        <option value="Surat izin keramaian / acara">Surat izin keramaian / acara</option>
                        <option value="Surat keterangan usaha (SKU)">Surat keterangan usaha (SKU)</option>
                        <option value="Surat pengantar NPWP">Surat pengantar NPWP</option>
                        <option value="Surat pengantar izin usaha kecil">Surat pengantar izin usaha kecil</option>
                        <option value="Surat keterangan penghasilan">Surat keterangan penghasilan</option>
                        <option value="Surat keterangan kepemilikan rumah / tanah">Surat keterangan kepemilikan rumah / tanah</option>
                        <option value="Surat pengantar IMB/PBG">Surat pengantar IMB/PBG</option>
                        <option value="Surat izin renovasi rumah">Surat izin renovasi rumah</option>
                        <option value="Surat keterangan tidak sengketa">Surat keterangan tidak sengketa</option>
                        <option value="Surat keterangan beasiswa">Surat keterangan beasiswa</option>
                        <option value="Surat pengantar sekolah">Surat pengantar sekolah</option>
                        <option value="Surat keterangan magang / kerja">Surat keterangan magang / kerja</option>
                        <option value="Lainnya">Keperluan Lainnya</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Keperluan Singkat</label>
                      <input name="keterangan" defaultValue={editingSurat?.keterangan || ""} placeholder="Misal: Melamar Kerja" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* 2. Identitas Diri */}
                <div className="space-y-4 pt-4 border-t border-slate-100" key={selectedWargaId ? `form-identity-${selectedWargaId}` : (editingSurat?.id ? `form-identity-${editingSurat.id}` : 'form-identity')}>
                  <div className="flex items-center gap-2 text-blue-600">
                    <User className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Identitas Diri</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="pemohon" defaultValue={getInitialValue('pemohon')} style={{ borderColor: '#5ac588' }} className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">NIK (No. KTP)</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="nik" defaultValue={getInitialValue('nik')} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">No. KK</label>
                      <div className="relative">
                        <Files className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="nokk" defaultValue={getInitialValue('nokk')} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Jenis Kelamin</label>
                      <select name="jenisKelamin" defaultValue={getInitialValue('jenisKelamin')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="none" value="">-- Pilih --</option>
                        <option key="l" value="Laki-Laki">Laki-Laki</option>
                        <option key="p" value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tempat Lahir</label>
                      <input name="tempatLahir" defaultValue={getInitialValue('tempatLahir')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Lahir</label>
                      <input type="date" name="tglLahir" defaultValue={getInitialValue('tglLahir')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Agama</label>
                      <select name="agama" defaultValue={getInitialValue('agama')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="none" value="">-- Pilih --</option>
                        <option key="islam" value="Islam">Islam</option>
                        <option key="kristen" value="Kristen">Kristen</option>
                        <option key="katolik" value="Katolik">Katolik</option>
                        <option key="hindu" value="Hindu">Hindu</option>
                        <option key="budha" value="Budha">Budha</option>
                        <option key="konghucu" value="Konghucu">Konghucu</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kewarganegaraan</label>
                      <select name="kewarganegaraan" defaultValue={getInitialValue('kewarganegaraan') || "WNI"} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="wni" value="WNI">WNI</option>
                        <option key="wna" value="WNA">WNA</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. Status & Pekerjaan */}
                <div className="space-y-4 pt-4 border-t border-slate-100" key={selectedWargaId ? `form-status-${selectedWargaId}` : (editingSurat?.id ? `form-status-${editingSurat.id}` : 'form-status')}>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Briefcase className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Status & Pekerjaan</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pekerjaan</label>
                      <input name="pekerjaan" defaultValue={getInitialValue('pekerjaan')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendidikan Terakhir</label>
                      <select name="pendidikan" defaultValue={getInitialValue('pendidikan')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="none" value="">-- Pilih --</option>
                        <option key="belum" value="BELUM SEKOLAH">BELUM SEKOLAH</option>
                        <option key="sd" value="SD">SD</option>
                        <option key="smp" value="SMP">SMP</option>
                        <option key="sma" value="SMA">SMA</option>
                        <option key="d1" value="DIPLOMA 1">DIPLOMA 1</option>
                        <option key="d2" value="DIPLOMA 2">DIPLOMA 2</option>
                        <option key="d3" value="DIPLOMA 3">DIPLOMA 3</option>
                        <option key="d4" value="DIPLOMA 4">DIPLOMA 4</option>
                        <option key="s1" value="S1">S1</option>
                        <option key="s2" value="S2">S2</option>
                        <option key="s3" value="S3">S3</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Perkawinan</label>
                      <select name="statusKawin" defaultValue={getInitialValue('statusKawin')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="none" value="">-- Pilih --</option>
                        <option key="bk" value="Belum Kawin">Belum Kawin</option>
                        <option key="k" value="Kawin">Kawin</option>
                        <option key="ch" value="Cerai Hidup">Cerai Hidup</option>
                        <option key="cm" value="Cerai Mati">Cerai Mati</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Posisi Dalam Keluarga</label>
                      <select name="posisiKeluarga" defaultValue={getInitialValue('posisiKeluarga')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                        <option key="none" value="">-- Pilih --</option>
                        <option key="kpl" value="Kepala Keluarga">Kepala Keluarga</option>
                        <option key="istri" value="Istri">Istri</option>
                        <option key="anak" value="Anak">Anak</option>
                        <option key="famili" value="Famili Lain">Famili Lain</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 4. Alamat & Kontak */}
                <div className="space-y-4 pt-4 border-t border-slate-100" key={selectedWargaId ? `form-address-${selectedWargaId}` : (editingSurat?.id ? `form-address-${editingSurat.id}` : 'form-address')}>
                  <div className="flex items-center gap-2 text-blue-600">
                    <MapPin className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-widest">Alamat & Kontak</h4>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Alamat Domisili (Jalan / Blok / No)</label>
                    <textarea name="alamat" defaultValue={getInitialValue('alamat')} rows={2} style={{ borderColor: '#5ac588' }} className="w-full px-4 py-3 border rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">RT</label>
                      <input name="rt" defaultValue={getInitialValue('rt')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">RW</label>
                      <input name="rw" defaultValue={getInitialValue('rw')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelurahan</label>
                      <input name="kelurahan" defaultValue={getInitialValue('kelurahan')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kecamatan</label>
                      <input name="kecamatan" defaultValue={getInitialValue('kecamatan')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kabupaten / Kota</label>
                       <input name="kota" defaultValue={getInitialValue('kota')} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">No. HP / WhatsApp</label>
                       <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input name="phone" defaultValue={getInitialValue('phone')} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                   <div className="flex items-center gap-2 text-blue-600">
                     <Info className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Ketentuan Layanan</span>
                   </div>
                   <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                     Seluruh data yang Anda masukkan harus benar dan sesuai dengan dokumen asli. 
                     Data akan diproses secara otomatis oleh sistem SmaRtRw dan diteruskan ke Ketua RT/RW 
                     untuk verifikasi dan tanda tangan digital. Status dapat dipantau pada menu 
                     <span className="text-blue-600 font-bold ml-1">"Sedang Berjalan"</span>.
                   </p>
                </div>
              </div>

              <div className="p-5 sm:px-10 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-blue" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-[200px]">Data yang Anda masukkan dilindungi Enkripsi SSL</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <motion.button 
                      type="button" 
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowForm(false); setEditingSurat(null); setSelectedWargaId(""); setWargaSearch(""); }} 
                      className="flex-1 md:flex-none px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      Batal
                    </motion.button>
                    <motion.button 
                      type="submit" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoadingDB}
                      className="flex-1 md:flex-none px-12 py-4 rounded-2xl bg-slate-900 dark:bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 dark:shadow-brand-blue/20 transition-all flex items-center justify-center gap-3"
                    >
                      {isLoadingDB ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{editingSurat ? 'Simpan' : 'Kirim'}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingSurat && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] sm:p-4 p-0 overflow-y-auto">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-900 w-full sm:max-w-lg sm:rounded-3xl rounded-none shadow-2xl overflow-hidden relative flex flex-col h-full sm:h-auto sm:max-h-[90vh] border border-white/10 dark:border-slate-800">
                <div className="p-5 sm:p-6 overflow-y-auto flex-1">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <button onClick={() => setViewingSurat(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{viewingSurat.jenis || viewingSurat.jenisSurat || 'Surat Pengantar'}</h4>
                        <div className={`mt-2 inline-flex py-1 px-3 rounded-full text-[9px] font-black uppercase tracking-widest ${viewingSurat.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                           {viewingSurat.status}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">ID: {viewingSurat.id}</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keperluan / Keterangan</p>
                         <p className="text-sm font-bold text-slate-700 italic">"{viewingSurat.keterangan || 'Tidak ada keterangan tambahan'}"</p>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <User className="w-4 h-4" /> Data Diri Pemohon
                         </h5>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Nama Lengkap</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.pemohon}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">NIK</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.nik}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">No. KK</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.kk || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Tempat, Tgl Lahir</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.ttl || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Agama</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.agama || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">WNI / WNA</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.kewarganegaraan || '-'}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <Briefcase className="w-4 h-4" /> Status & Pekerjaan
                         </h5>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Pekerjaan</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.pekerjaan || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Pendidikan</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.pendidikan || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Kawin</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.statusKawin || '-'}</p>
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">HUBUNGAN DALAM KELUARGA</p>
                               <p className="text-sm font-bold text-slate-800">{viewingSurat.posisiKeluarga || '-'}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <MapPin className="w-4 h-4" /> Alamat & Kontak
                         </h5>
                         <div className="space-y-3">
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Alamat</p>
                               <p className="text-sm font-bold text-slate-800 leading-tight">{viewingSurat.alamat}</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">RT/RW</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.rt}/{viewingSurat.rw}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Kelurahan</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.kelurahan || '-'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Kecamatan</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.kecamatan || '-'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Kota</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.kota || '-'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">No. HP</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.phone || '-'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Email</p>
                                 <p className="text-sm font-bold text-slate-800">{viewingSurat.email || '-'}</p>
                              </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <ImageIcon className="w-4 h-4" /> Lampiran
                         </h5>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Foto KTP</p>
                               {viewingSurat.ktpUrl ? (
                                 <a href={viewingSurat.ktpUrl} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-xl overflow-hidden border border-slate-100">
                                   <img src={viewingSurat.ktpUrl} alt="KTP" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                      <Eye className="w-4 h-4 text-white" />
                                   </div>
                                 </a>
                               ) : (
                                 <div className="aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                   <Smartphone className="w-6 h-6" />
                                 </div>
                               )}
                            </div>
                            <div className="space-y-2">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-center">Foto KK</p>
                               {viewingSurat.kkUrl ? (
                                 <a href={viewingSurat.kkUrl} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-xl overflow-hidden border border-slate-100">
                                   <img src={viewingSurat.kkUrl} alt="KK" className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                      <Eye className="w-4 h-4 text-white" />
                                   </div>
                                 </a>
                               ) : (
                                 <div className="aspect-video rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                   <Files className="w-6 h-6" />
                                 </div>
                               )}
                            </div>
                         </div>
                      </div>

                      <div className="pt-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0"><Calendar className="w-4 h-4" /></div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Diajukan Pada</p>
                           <p className="text-sm font-bold text-slate-700 mt-0.5">{new Date(viewingSurat.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                        </div>
                      </div>

                      {/* Timeline Pelacakan Status */}
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                         <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> Alur Pelacakan Surat
                         </h5>
                         
                         <div className="relative pl-6 space-y-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                            {/* Step 1: Pengajuan */}
                            <div className="relative">
                               <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow" />
                               <div>
                                  <p className="text-xs font-black text-slate-800">1. Permohonan Dikirim</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">Oleh Pemohon • {new Date(viewingSurat.tanggal).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'})}</p>
                               </div>
                            </div>

                            {/* Step 2: Persetujuan RT */}
                            <div className="relative">
                               <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow ${
                                 viewingSurat.approvedByRT || viewingSurat.status === 'Menunggu Persetujuan RW' || viewingSurat.status === 'Selesai'
                                   ? 'bg-emerald-500' 
                                   : viewingSurat.status === 'Ditolak'
                                   ? 'bg-red-500'
                                   : 'bg-amber-400 animate-pulse'
                               }`} />
                               <div>
                                  <p className="text-xs font-black text-slate-800">2. Verifikasi & Approval RT</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                     {viewingSurat.approvedByRT || viewingSurat.status === 'Menunggu Persetujuan RW' || viewingSurat.status === 'Selesai'
                                        ? `Disetujui ${viewingSurat.approvedByRT ? `oleh ${viewingSurat.approvedByRT}` : 'oleh Ketua RT'}`
                                        : viewingSurat.status === 'Ditolak'
                                        ? 'Ditolak / Gagal Verifikasi'
                                        : 'Menunggu Persetujuan Ketua RT (Surat masih di RT)'
                                     }
                                  </p>
                               </div>
                            </div>

                            {/* Step 3: Persetujuan RW */}
                            <div className="relative">
                               <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow ${
                                 viewingSurat.status === 'Selesai'
                                   ? 'bg-emerald-500'
                                   : (viewingSurat.status === 'Menunggu Persetujuan RW' ? 'bg-amber-400 animate-pulse' : 'bg-slate-200')
                               }`} />
                               <div>
                                  <p className="text-xs font-black text-slate-800">3. Verifikasi & Approval RW</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                     {viewingSurat.status === 'Selesai'
                                        ? `Disetujui ${viewingSurat.approvedByRW ? `oleh ${viewingSurat.approvedByRW}` : 'oleh Ketua RW'}`
                                        : (viewingSurat.status === 'Menunggu Persetujuan RW'
                                           ? 'Menunggu Persetujuan Ketua RW (Surat sudah diteruskan ke RW)'
                                           : 'Menunggu antrean approval RT selesai'
                                        )
                                     }
                                  </p>
                               </div>
                            </div>

                            {/* Step 4: Selesai */}
                            <div className="relative">
                               <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow ${
                                 viewingSurat.status === 'Selesai' ? 'bg-blue-600' : 'bg-slate-200'
                               }`} />
                               <div>
                                  <p className="text-xs font-black text-slate-800">4. Surat Siap Unduh (Selesai)</p>
                                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                     {viewingSurat.status === 'Selesai' 
                                        ? 'Dokumen pdf siap dicetak / diunduh oleh pemohon.' 
                                        : 'Dokumen akan diterbitkan otomatis setelah disetujui RW.'
                                     }
                                  </p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                   {((((viewingSurat.status || '').toUpperCase().includes('RT') || (viewingSurat.status || '').toUpperCase() === 'MENUNGGU PERSETUJUAN' || (viewingSurat.status || '').toUpperCase() === 'DIAJUKAN') && isRTUser) || 
                     ((viewingSurat.status || '').toUpperCase().includes('RW') && isRWUser)) && (
                     <>
                        <button onClick={() => { handleApproveSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-200">Setujui</button>
                        <button onClick={() => { handleRejectSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-200">Tolak</button>
                     </>
                   )}
                  {viewingSurat.status === 'Selesai' && (
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                       <button onClick={() => downloadSuratPDF(viewingSurat)} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2">
                         <FileDown className="w-4 h-4" /> Download PDF
                       </button>
                    </div>
                  )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {suratToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Catatan Surat"
            message={`Apakah Anda yakin ingin menghapus permohonan surat "${suratToDelete?.jenis || suratToDelete?.jenisSurat || 'Surat Pengantar'}" milik "${suratToDelete?.pemohon || suratToDelete?.nama || 'Warga'}"?`}
            onConfirm={handleDeleteSurat}
            onCancel={() => setSuratToDelete(null)}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            isLoading={isDeleting}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {approvalConfirm && (
          <ConfirmModal 
            isOpen={true}
            title={approvalConfirm.action === 'approve' ? 'Setujui Permohonan Surat' : 'Tolak Permohonan Surat'}
            message={approvalConfirm.msg}
            onConfirm={executeApprovalConfirm}
            onCancel={() => setApprovalConfirm(null)}
            confirmText={approvalConfirm.action === 'approve' ? 'Ya, Setujui' : 'Ya, Tolak'}
            cancelText="Batal"
            type={approvalConfirm.action === 'approve' ? 'info' : 'danger'}
            isLoading={isLoadingDB}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAutoArchiveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowAutoArchiveModal(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }} 
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 p-8 text-center animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-100 dark:border-amber-900/40 animate-pulse">
                <Archive className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight font-elegant mb-3">Pengarsipan & Pembersihan Otomatis</h3>
              
              {olderLetters.length > 0 ? (
                <>
                  <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed mb-6">
                    Sistem mendeteksi <strong>{olderLetters.length}</strong> permohonan surat yang berumur <strong>lebih dari 3 bulan (90 hari)</strong>.
                  </p>
                  <div className="p-5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-2.5xl text-xs text-left text-amber-805 dark:text-amber-400 space-y-2.5 mb-8">
                    <p className="font-extrabold uppercase tracking-wider text-[10px]">Tindakan pembersihan otomatis:</p>
                    <ul className="list-disc pl-5 space-y-1 font-bold">
                      <li>Surat aktif (Draft / Menunggu Persetujuan) akan dipindahkan ke status <strong>'Diarsipkan'</strong> (disembunyikan dari daftar utama).</li>
                      <li>Surat penyelesaian (Selesai / Ditolak) akan <strong>dihapus permanen</strong> dari Firestore untuk menghemat penyimpanan data Anda.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-550 dark:text-slate-400 leading-relaxed mb-8">
                  Luar biasa! Tidak ditemukan berkas atau catatan surat yang berumur lebih dari 3 bulan (90 hari). Database surat Anda dalam kondisi optimal!
                </p>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowAutoArchiveModal(false)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors font-extrabold"
                >
                  {olderLetters.length > 0 ? "Batal" : "Tutup"}
                </button>
                {olderLetters.length > 0 && (
                  <button
                    type="button"
                    disabled={isArchiving}
                    onClick={handleRunAutoArchive}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 font-extrabold"
                  >
                    {isArchiving ? "Memproses..." : "Ya, Mulai"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
