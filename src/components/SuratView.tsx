import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Printer, 
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
  RefreshCw
} from 'lucide-react';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import { StyledButton } from './StyledButton';
import { ConfirmModal } from './ui/ConfirmModal';

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
  const [ktpUrl, setKtpUrl] = useState("");
  const [kkUrl, setKkUrl] = useState("");
  const [selectedWargaId, setSelectedWargaId] = useState("");
  const [wargaSearch, setWargaSearch] = useState("");
  const [showWargaDropdown, setShowWargaDropdown] = useState(false);
  
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

  const filteredSurat = suratData.filter(s => {
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
    
    const matchesSearch = s.pemohon?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.jenis?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeSubTab === 'berjalan') {
      return matchesSearch && (s.status === 'Draft' || s.status === 'Menunggu Persetujuan RT' || s.status === 'Menunggu Persetujuan RW' || s.status === 'Menunggu Persetujuan' || s.status === 'Diajukan');
    } else {
      return matchesSearch && (s.status === 'Selesai' || s.status === 'Ditolak');
    }
  });

  const generateSuratPDF = (surat: any) => {
    // Identity verification check
    const warga = wargaData.find(w => w.nik === surat.nik) || (currentUser?.nik === surat.nik ? currentUser : null);
    const isWargaVerified = warga?.terverifikasi === true || warga?.status === "Disetujui" || (currentUser?.role?.toUpperCase() === "WARGA" && currentUser?.status === "Disetujui");
    if (!isWargaVerified) {
        showNotification('Surat tidak dapat dicetak: Identitas belum terverifikasi oleh Admin.', 'error');
        return;
    }
    
    // Priority: use kopSettings (from tenant_settings), fallback to settings["KOP_SURAT"], then hardcoded defaults
    const kop = kopSettings || getSetting("KOP_SURAT") || {};
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification("Gagal membuka jendela cetak. Pastikan popup tidak diblokir.", "error");
      return;
    }

    // Map kopSettings to the variables used in the template
    // Default Bekasi logo if no logo provided. Using a more stable URL for default.
    const defaultLogo = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_Kabupaten_Bekasi.png/1200px-Logo_Kabupaten_Bekasi.png";
    const logoPemerintah = (kop.logo_url && kop.logo_url.startsWith('data:')) ? kop.logo_url : (kop.logo_url || defaultLogo);
    const logoOrganisasi = kop.logo_rw_url || ""; // Right logo (RT/RW logo)
    
    // User requirements: RT from data warga (surat.rt), RW from standard kop settings
    const displayRT = surat.rt || "03"; 
    const displayRW = kop.rw || "26"; // Standard RW from Kop Settings
    
    // Construct dynamic organization name according to RT of the citizen
    const orgName = `RUKUN TETANGGA ${displayRT} / RUKUN WARGA ${displayRW}`;
    
    const kelurahanText = kop.kelurahan && kop.kecamatan 
      ? `KELURAHAN ${kop.kelurahan.toUpperCase()} - KECAMATAN ${kop.kecamatan.toUpperCase()}`
      : "KELURAHAN KEBALEN - KECAMATAN BABELAN";
      
    const kabupaten = kop.kabupaten || "KABUPATEN BEKASI";
    const displayKabupaten = kabupaten.toUpperCase().includes('KABUPATEN') || kabupaten.toUpperCase().includes('KOTA') 
      ? kabupaten.toUpperCase() 
      : `KABUPATEN ${kabupaten.toUpperCase()}`;

    const alamatText = kop.alamat 
      ? `Sekretariat : ${kop.alamat} ${kop.email ? ' | Email: ' + kop.email : ''} ${kop.instagram ? ' | Instagram: ' + kop.instagram : ''}`
      : "Sekretariat : Jl. Katala 3 Blok K3 No. 1 RT 02 / RW 26 | Email: kebalenrw26@gmail.com | Instagram: @kebalenrw26";

    const content = `
      <html>
        <head>
          <title>Cetak ${surat.jenis}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
            body { font-family: 'Times New Roman', serif; padding: 40px; margin: 0; color: #000; background: #fff; line-height: 1.4; }
            .page { 
              width: 210mm; 
              min-height: 297mm; 
              margin: auto; 
              background: white; 
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .watermark {
              width: 100mm;
              height: 100mm;
              background-image: url('${kop.bg_kertas_url}');
              background-size: contain;
              background-position: center;
              background-repeat: no-repeat;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              filter: grayscale(100%) opacity(0.15);
              z-index: 0;
            }
            
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 4px double #000; padding-bottom: 10px; margin-bottom: 20px; position: relative; z-index: 1; }
            .logo-left { width: 80px; height: 80px; object-fit: contain; }
            .logo-right { width: 90px; height: 90px; object-fit: contain; }
            .header-text { text-align: center; flex: 1; padding: 0 10px; }
            .header-text h1 { margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
            .header-text h2 { margin: 2px 0; font-size: 15px; font-weight: bold; text-transform: uppercase; line-height: 1.2; }
            .header-text p { margin: 2px 0; font-size: 10px; font-weight: normal; }
            
            .title-section { text-align: center; margin-bottom: 25px; }
            .title-section h3 { margin: 0; text-decoration: underline; font-size: 16px; font-weight: bold; text-transform: uppercase; }
            .title-section p { margin: 5px 0; font-size: 13px; }
            
            .content-section { font-size: 13px; text-align: justify; }
            .content-section p { margin-bottom: 12px; }
            
            .data-table { width: 100%; border-collapse: collapse; margin: 15px 0 15px 30px; }
            .data-table td { padding: 4px 0; vertical-align: top; }
            .data-table td.label { width: 160px; }
            .data-table td.separator { width: 20px; text-align: center; }
            .data-table td.value { font-weight: normal; }
            
            .footer-date { text-align: right; margin-top: 30px; margin-bottom: 5px; font-size: 13px; padding-right: 40px; }
            .footer-section { display: flex; justify-content: space-between; padding: 0 40px; margin-top: 10px; }
            .footer-column { text-align: center; width: 220px; }
            .signature-space { height: 80px; position: relative; display: flex; align-items: center; justify-content: center; }
            .signature-img { max-height: 80px; max-width: 150px; object-fit: contain; position: absolute; pointer-events: none; }
            .signature-name { font-weight: bold; text-decoration: underline; }
            
            .verif-box-grid { margin-top: 50px; border-top: 1.5px solid #000; padding-top: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 10px; }
            .verif-item { display: flex; flex-direction: column; }
            .verif-box { border: 1.5px solid #000; padding: 5px; height: 35px; width: 70px; margin-top: 4px; }
            
            @media print {
              body { padding: 0; }
              .page { width: 100%; margin: 0; border: none; }
              @page { margin: 1.5cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${kop.bg_kertas_url ? `<div class="watermark"></div>` : ''}
            <div class="header">
              <img src="${logoPemerintah}" class="logo-left" />
              <div class="header-text">
                <h1>${orgName}</h1>
                <h2>${kelurahanText}</h2>
                <h2>${displayKabupaten}</h2>
                <p>${alamatText}</p>
              </div>
              ${logoOrganisasi ? `<img src="${logoOrganisasi}" class="logo-right" />` : '<div style="width:80px"></div>'}
            </div>
            
            <div class="title-section">
              <h3>SURAT PENGANTAR</h3>
              <p>Nomor : ${surat.nomorSurat || `...... / RT ${displayRT} / RW ${displayRW} / Tahun ${new Date().getFullYear()}`}</p>
            </div>
            
            <div class="content-section">
              <p>Yang bertanda tangan di bawah ini Ketua RT ${displayRT} / RW ${displayRW} Kelurahan ${surat.kelurahan || kop.kelurahan || 'Kebalen'} Kecamatan ${surat.kecamatan || kop.kecamatan || 'Babelan'} ${surat.kota || displayKabupaten}</p>
              <p>Dengan ini menerangkan bahwa :</p>
              
              <table class="data-table">
                <tr><td class="label">Nama</td><td class="separator">:</td><td class="value"><b>${surat.pemohon}</b></td></tr>
                <tr><td class="label">Tempat Tgl, Lahir</td><td class="separator">:</td><td class="value">${surat.ttl || '-'}</td></tr>
                <tr><td class="label">Jenis Kelamin</td><td class="separator">:</td><td class="value">${surat.jenisKelamin || '-'}</td></tr>
                <tr><td class="label">Pekerjaan</td><td class="separator">:</td><td class="value">${surat.pekerjaan || '-'}</td></tr>
                <tr><td class="label">Kewarganegaraan</td><td class="separator">:</td><td class="value">${surat.kewarganegaraan || 'WNI'}</td></tr>
                <tr><td class="label">No. KTP/NIK</td><td class="separator">:</td><td class="value">${surat.nik || '-'}</td></tr>
                <tr><td class="label">Status Perkawinan</td><td class="separator">:</td><td class="value">${surat.statusKawin || '-'}</td></tr>
                <tr><td class="label">Alamat</td><td class="separator">:</td><td class="value">${surat.alamat || '-'}</td></tr>
                <tr><td class="label">Maksud / Keperluan</td><td class="separator">:</td><td class="value">${surat.keterangan || '-'}</td></tr>
              </table>
              
              <p>Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
            </div>
            
            <div class="footer-date">
               ${(kop.kabupaten || 'Bekasi').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
            </div>
            
            <div class="footer-section">
              <div class="footer-column">
                <p>Mengetahui,</p>
                <p>Ketua RW ${displayRW}</p>
                <div class="signature-space">
                  ${kop.signature_rw_url ? `<img src="${kop.signature_rw_url}" class="signature-img" />` : ''}
                </div>
                <p class="signature-name">( ${kop.nama_ketua_rw || 'Tri Handoko P'} )</p>
              </div>
              <div class="footer-column">
                <p>&nbsp;</p>
                <p>Ketua RT ${displayRT}</p>
                <div class="signature-space">
                  ${kop.signature_rt_url ? `<img src="${kop.signature_rt_url}" class="signature-img" />` : ''}
                </div>
                <p class="signature-name">( ${kop.nama_ketua_rt || 'Fadhlan'} )</p>
              </div>
            </div>
            
            <div class="verif-box-grid">
               <div class="verif-item">
                 <span>Tl. Berkas / Surat No :</span>
                 <span style="margin-top: 15px">Berkas Sesuai</span>
                 <div class="verif-box"></div>
               </div>
               <div class="verif-item">
                 <span>Hal :</span>
                 <span style="margin-top: 15px">Berkas Kecamatan</span>
                 <div class="verif-box"></div>
               </div>
               <div class="verif-item">
                 <span>Tgl : ..............................</span>
                 <span style="margin-top: 15px">Paraf Arsiparis</span>
                 <div class="verif-box"></div>
               </div>
            </div>
          </div>
          
          <script>
            function checkImages() {
              const images = document.getElementsByTagName('img');
              let loadedCount = 0;
              if (images.length === 0) {
                setTimeout(() => { window.print(); window.close(); }, 800);
                return;
              }
              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  loadedCount++;
                } else {
                  images[i].addEventListener('load', () => {
                    loadedCount++;
                    if (loadedCount === images.length) setTimeout(() => { window.print(); window.close(); }, 800);
                  });
                  images[i].addEventListener('error', (e) => {
                    console.error('Image failing to load', e);
                    loadedCount++;
                    if (loadedCount === images.length) setTimeout(() => { window.print(); window.close(); }, 800);
                  });
                }
              }
              if (loadedCount === images.length) {
                setTimeout(() => { window.print(); window.close(); }, 800);
              }
            }
            window.onload = checkImages;
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    showNotification("Pratinjau cetak terbuka di tab baru", "info");
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

    const payload = {
      id,
      tenantId: currentWarga?.tenantId || currentUser.tenantId,
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

    // Check identity verification
    const warga = wargaData.find(w => w.nik === s.nik);
    if (!warga?.terverifikasi) {
        showNotification('Identitas pemohon (Nama, NIK, KK) belum terverifikasi oleh Admin.', 'error');
        return;
    }

    let nextStatus = 'Selesai';
    let msg = 'Surat disetujui';

    if (s.status === 'Menunggu Persetujuan RT' || s.status === 'Menunggu Persetujuan' || s.status === 'Diajukan') {
      if (!isRTUser) {
        console.warn("[SuratView] Blocked RT approval check: not RT user", { isRTUser });
        showNotification('Hanya RT yang dapat menyetujui tahap ini', 'error');
        return;
      }
      nextStatus = 'Menunggu Persetujuan RW';
      msg = 'Disetujui oleh RT. Sekarang menunggu persetujuan RW.';
    } else if (s.status === 'Menunggu Persetujuan RW') {
      if (!isRWUser) {
        console.warn("[SuratView] Blocked RW approval check: not RW user", { isRWUser });
        showNotification('Hanya RW yang dapat menyetujui tahap ini', 'error');
        return;
      }
      nextStatus = 'Selesai';
      msg = 'Surat disetujui oleh RW. Selesai.';
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
          updatedAt: new Date().toISOString() 
        };
        
        if (nextStatus === 'Selesai') {
          updateData.approvedAt = new Date().toISOString();
        }

        if (isRTUser && (s.status === 'Menunggu Persetujuan RT' || s.status === 'Menunggu Persetujuan' || s.status === 'Diajukan')) {
          updateData.approvedByRT = currentUser?.nama || currentUser?.name || 'Ketua RT';
        }
        if (isRWUser && s.status === 'Menunggu Persetujuan RW') {
          updateData.approvedByRW = currentUser?.nama || currentUser?.name || 'Ketua RW';
        }

        console.log("[SuratView] Writing approved status update to firestore", { id: s.id, updateData });
        await updateDoc(doc(db, 'surat', s.id), updateData);
        showNotification(msg, 'success');
      } else if (action === 'reject') {
        console.log("[SuratView] Writing rejected status update to firestore", { id: s.id });
        await updateDoc(doc(db, 'surat', s.id), { status: 'Ditolak' });
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

  const handleDeleteSurat = async () => {
    if (!suratToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'surat', suratToDelete.id));
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
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 w-fit shadow-xl backdrop-blur-3xl animate-in fade-in slide-in-from-left-4 duration-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSubTab('berjalan')}
            className={`group flex items-center gap-4 px-10 py-4 rounded-2xl text-[11px] font-black transition-all duration-500 uppercase tracking-widest relative overflow-hidden ${
              activeSubTab === 'berjalan' 
                ? 'bg-slate-900 dark:bg-brand-blue text-white shadow-2xl scale-100' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {activeSubTab === 'berjalan' && (
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            )}
            <Clock className={`w-5 h-5 transition-transform duration-500 ${activeSubTab === 'berjalan' ? 'scale-110' : 'group-hover:scale-110'}`} />
            Aktif
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveSubTab('arsip')}
            className={`group flex items-center gap-4 px-10 py-4 ml-2 rounded-2xl text-[11px] font-black transition-all duration-500 uppercase tracking-widest relative overflow-hidden ${
              activeSubTab === 'arsip' 
                ? 'bg-brand-blue dark:bg-slate-800 text-white shadow-2xl scale-100' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
             {activeSubTab === 'arsip' && (
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            )}
            <History className={`w-5 h-5 transition-transform duration-500 ${activeSubTab === 'arsip' ? 'scale-110' : 'group-hover:scale-110'}`} />
            Arsip
          </motion.button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl flex items-center gap-4">
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
              Layanan Administrasi
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2 ml-7">Verifikasi & Penerbitan Dokumen</p>
          </div>

          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari Dokumen..." 
                className="pl-14 pr-8 py-5 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-700 text-[13px] font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue/20 w-full lg:w-80 shadow-sm transition-all placeholder:text-slate-300 placeholder:italic"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.03, shadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setSelectedWargaId(""); setWargaSearch(""); setKtpUrl(""); setKkUrl(""); setShowForm(true); }} 
              className="w-full sm:w-auto flex items-center justify-center gap-4 bg-slate-900 dark:bg-brand-blue text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
              <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-700" /> 
              <span>Pengajuan Baru</span>
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
                  {filteredSurat.map((s, idx) => (
                    <tr key={`surat-${s.id || idx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        {new Date(s.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-bold">{s.jenis}</td>
                      <td className="px-6 py-4">{s.pemohon}</td>
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
                          <button 
                            onClick={() => generateSuratPDF(s)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/30"
                            title="Cetak Surat PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </button>
                        ) : isPengurus && (
                          <>
                            {false ? null : (
                               (((s.status.includes('Persetujuan RT') || s.status === 'Menunggu Persetujuan' || s.status === 'Diajukan') && isRTUser) || 
                               (s.status.includes('Persetujuan RW') && isRWUser)) && (
                                <button onClick={() => handleApproveSurat(s)} className="p-2 text-emerald-600 hover:text-emerald-700"><CheckCircle2 className="w-4 h-4" /></button>
                              )
                            )}
                            {(s.status.includes('Menunggu') || s.status === 'Diajukan') && (
                              <button onClick={() => handleRejectSurat(s)} className="p-2 text-rose-600 hover:text-rose-700"><X className="w-4 h-4" /></button>
                            )}
                          </>
                        )}
                        {(!isWarga && (isPengurus || s.userId === (currentUser?.uid || currentUser?.id_user) || s.authUid === (currentUser?.uid || currentUser?.id_user))) && (
                          <button onClick={() => { setEditingSurat(s); setShowForm(true); }} className="p-2 text-slate-400 hover:text-slate-600" title="Edit"><Edit className="w-4 h-4" /></button>
                        )}
                         {isGlobalSuperAdmin && (
                          <button onClick={() => setSuratToDelete(s)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Swipe/Scroll Reminder for Smartphone users */}
              <div className="md:hidden flex items-center justify-center gap-1.5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/20 py-2.5 rounded-xl mt-4">
                <span>GESER KANAN UNTUK LAINNYA</span>
                <ChevronRight className="w-4 h-4 text-brand-blue animate-bounceHorizontal" />
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex justify-center items-center z-[120] p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] border border-white/20 dark:border-slate-800"
            >
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
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
              
              <form onSubmit={handleSaveSurat} ref={formRef} className="p-6 sm:p-10 overflow-y-auto space-y-6 sm:space-y-10 custom-scrollbar">
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
                      <select name="jenis" defaultValue={editingSurat?.jenis || "Surat pengantar pembuatan KTP"} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
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
                        <input name="pemohon" defaultValue={getInitialValue('pemohon')} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" required />
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
                        <option key="sd" value="SD">SD</option>
                        <option key="smp" value="SMP">SMP</option>
                        <option key="sma" value="SMA/SMK">SMA/SMK</option>
                        <option key="d3" value="D3">D3</option>
                        <option key="s1" value="S1">S1</option>
                        <option key="s2" value="S2">S2</option>
                        <option key="s3" value="S3">S3</option>
                        <option key="ts" value="Tidak Sekolah">Tidak Sekolah</option>
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
                    <textarea name="alamat" defaultValue={getInitialValue('alamat')} rows={2} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
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
                     Data akan diproses secara otomatis oleh sistem SmartRW dan diteruskan ke Ketua RT/RW 
                     untuk verifikasi dan tanda tangan digital. Status dapat dipantau pada menu 
                     <span className="text-blue-600 font-bold ml-1">"Sedang Berjalan"</span>.
                   </p>
                </div>

                <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md pb-4">
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
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
                <div className="p-6 overflow-y-auto">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <button onClick={() => setViewingSurat(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{viewingSurat.jenis}</h4>
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
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Posisi Keluarga</p>
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
                   {(((viewingSurat.status === 'Menunggu Persetujuan RT' || viewingSurat.status === 'Menunggu Persetujuan' || viewingSurat.status === 'Diajukan') && isRTUser) || 
                     (viewingSurat.status === 'Menunggu Persetujuan RW' && isRWUser)) && (
                     <>
                        <button onClick={() => { handleApproveSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-200">Setujui</button>
                        <button onClick={() => { handleRejectSurat(viewingSurat); setViewingSurat(null); }} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-200">Tolak</button>
                     </>
                   )}
                   {viewingSurat.status === 'Selesai' && (
                      <button onClick={() => generateSuratPDF(viewingSurat)} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4" /> Cetak Dokumen PDF
                      </button>
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
            message={`Apakah Anda yakin ingin menghapus permohonan surat "${suratToDelete?.jenis}" milik "${suratToDelete?.pemohon}"?`}
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
    </div>
  );
}
