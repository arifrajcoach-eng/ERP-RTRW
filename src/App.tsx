import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Siren, ShieldAlert, MapPin, LifeBuoy, Users, BookOpen, FileText, LayoutDashboard, CreditCard, PlusCircle, MinusCircle, Calendar, Search, Settings, Edit, Edit2, Edit3, Trash2, X, Download, Menu, Upload, LogOut, Lock, User, Printer, AlertTriangle, Eye, EyeOff, ChevronRight, Database, Shield, CheckCircle, XCircle, AlertCircle, Info, Package, History, ClipboardList, Baby, Stethoscope, Scale, Activity, HeartPulse, Recycle, Wallet, TrendingUp, HandCoins, Vote, ShoppingBag, ShoppingCart, Minus, LayoutGrid, Phone, FileSpreadsheet, BookCopy, Store, ShieldCheck, UserCheck, Image, Camera, Plus, BellOff, Monitor, UserPlus, Archive, CheckCircle2, Clock, RefreshCw, Files, ArrowRight, Smartphone, Zap, Droplets, Train, QrCode, BarChart3, Video, FileCheck, Globe } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell, PieChart, Pie } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where, getDoc, onSnapshot, getDocFromServer, writeBatch, limit } from 'firebase/firestore';
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
import { QRCodeSVG } from 'qrcode.react';
import KopTemplateManagementView from './components/KopTemplateManagementView';
import { RTRegistrationForm } from './components/RTRegistrationForm';
import ChatWargaView from './components/ChatWargaView';
import AIChatBot from './components/AIChatBot';
import UpgradeModal from './components/UpgradeModal';
import { GuestBookFormPublic } from './components/GuestBookFormPublic';
import { GuestBookQRCode } from './components/GuestBookQRCode';
import { MessageSquare, Bot } from 'lucide-react';

const APP_LOGO = "/logo_rw.png";

const AppLogo = ({ className, size = 12 }: { className?: string, size?: number }) => {
  const [hasError, setHasError] = useState(false);
  return !hasError ? (
    <img 
      src={APP_LOGO} 
      alt="Logo" 
      className={className || `w-${size} h-${size}`}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      draggable={false}
    />
  ) : (
    <div className={`${className || `w-${size} h-${size}`} bg-brand-blue/10 rounded-xl flex items-center justify-center p-2`}>
      <Shield className="w-full h-full text-brand-blue" />
    </div>
  );
};

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
  { id: "TRX-009", tanggal: "15 Apr 2026", tipe: "Keluar", transaksi: "Transaksi", nama: "Kurir", keterangan: "Kirim Berkas RW", debit: 0, kredit: 25000 },
  { id: "TRX-010", tanggal: "18 Apr 2026", tipe: "Masuk", transaksi: "Donasi", nama: "Hamba Allah", keterangan: "Kas Mesjid", debit: 500000, kredit: 0 },
  { id: "TRX-011", tanggal: "19 Apr 2026", tipe: "Masuk", transaksi: "Iuran Warga", nama: "Bpk. Ahmad", keterangan: "Iuran Keamanan Apr", debit: 50000, kredit: 0 },
  { id: "TRX-012", tanggal: "20 Apr 2026", tipe: "Keluar", transaksi: "Kebersihan", nama: "Petugas Sampah", keterangan: "Gaji Petugas Apr", debit: 0, kredit: 750000 },
];

const INITIAL_SURAT_DATA = [
  { id: "SRT-1004", tanggal: "19 Apr 2026", pemohon: "Ibu Siti Aminah", jenisSurat: "Surat Domisili", status: "Diajukan" },
  { id: "SRT-1003", tanggal: "17 Apr 2026", pemohon: "Bpk. Ahmad Suhendar", jenisSurat: "Pengantar Kelurahan", status: "Selesai" },
  { id: "SRT-1002", tanggal: "16 Apr 2026", pemohon: "Sdr. Bayu Pratama", jenisSurat: "Surat Keterangan Usaha", status: "Diajukan" },
  { id: "SRT-1001", tanggal: "10 Apr 2026", pemohon: "Bpk. Joko Anas", jenisSurat: "Surat Domisili", status: "Selesai" },
];

const INITIAL_IURAN_DATA = [];

const INITIAL_INVENTARIS_DATA = [
  { id: "INV-BRG-001", nama_barang: "Kursi Lipat Merek Chitose", kategori: "Aset Tenda & Kursi", jumlah: 50, kondisi: "Baik", lokasi: "Gudang RT 01", tanggal_pengadaan: "2024-01-10", keterangan: "Pengadaan Mandiri" },
  { id: "INV-BRG-002", nama_barang: "Tenda 3x4 Meter", kategori: "Aset Tenda & Kursi", jumlah: 2, kondisi: "Baik", lokasi: "Gudang RW", tanggal_pengadaan: "2023-05-15", keterangan: "Bantuan Desa" },
  { id: "INV-BRG-003", nama_barang: "Sound System Portable", kategori: "Elektronik", jumlah: 1, kondisi: "Rusak Ringan", lokasi: "Pos Kamling", tanggal_pengadaan: "2022-11-20", keterangan: "Mic kadang putus" },
];

// NOTE: Kategori Inventaris dikelola secara dinamis melalui Firestore (koleksi: inventaris_kategori).
// Anda dapat menambahkannya melalui fitur "Kategori" pada menu Inventaris di aplikasi.


const PLAN_FEATURES: Record<string, any> = {
  TRIAL: {
    maxWarga: 50,
    price: "Gratis",
    coreFeatures: ["Pencatatan Warga", "Keuangan Dasar", "Surat Standar"],
    keuangan: "DASAR",
    surat: "STANDAR",
    multiRT: false, posyandu: false, bankSampah: false, ePemilu: false, eLapak: "READ", cctv: false, sos: false, analytics: false, multiRegion: false, governance: 'LOW', predictiveAI: false
  },
  BASIC: {
    maxWarga: 150,
    price: "Rp 25rb",
    coreFeatures: ["Keuangan Lengkap", "Custom Layanan Surat", "E-Lapak Basic"],
    keuangan: "FULL",
    surat: "FULL",
    multiRT: true, posyandu: false, bankSampah: false, ePemilu: false, eLapak: "FULL", cctv: false, sos: false, analytics: false, multiRegion: false, governance: 'LOW', predictiveAI: false
  },
  PRO: {
    maxWarga: 500,
    price: "Rp 149rb",
    coreFeatures: ["Bank Sampah & Posyandu", "PPOB & E-Voting", "AI Insights Dasar"],
    keuangan: "PPOB",
    surat: "CUSTOM",
    multiRT: true, posyandu: true, bankSampah: true, ePemilu: true, eLapak: "FULL", cctv: false, sos: false, analytics: false, multiRegion: false, governance: 'MEDIUM', predictiveAI: false
  },
  PREMIUM: {
    maxWarga: 5000,
    price: "Rp 499rb",
    coreFeatures: ["Integrasi CCTV & SOS", "Strategic AI Agent", "Predictive Analytics"],
    keuangan: "FULL_AUTO",
    surat: "SMART",
    multiRT: true, posyandu: true, bankSampah: true, ePemilu: true, eLapak: "FULL", cctv: true, sos: true, analytics: true, multiRegion: false, governance: 'MEDIUM', predictiveAI: true
  },
  ENTERPRISE: {
    maxWarga: 20000,
    price: "Custom",
    coreFeatures: ["Multi-Region Monit", "Governance & Audit", "Strategic AI"],
    keuangan: "ENTERPRISE",
    surat: "DYNAMIC",
    multiRT: true, posyandu: true, bankSampah: true, ePemilu: true, eLapak: "FULL", cctv: true, sos: true, analytics: true, multiRegion: true, governance: 'HIGH', predictiveAI: true
  }
};

const PLAN_ALIASES: Record<string, string> = {
  ACTIVE: 'TRIAL',
  FREE: 'TRIAL',
  LITE: 'BASIC',
  RT: 'BASIC',
  FLASH: 'PRO',
  RW: 'PRO',
  GOLD: 'PREMIUM',
  DIAMOND: 'ENTERPRISE',
  GOV: 'ENTERPRISE'
};

const getPlanFeatures = (status: string | undefined) => {
  if (!status) return PLAN_FEATURES.TRIAL;
  const normalizedStatus = status.toUpperCase().replace('V4.0 ', '').replace('PLAN', '').trim();
  const basePlan = PLAN_ALIASES[normalizedStatus] || normalizedStatus;
  return PLAN_FEATURES[basePlan] || PLAN_FEATURES.TRIAL;
};

// Shared Helper for Document Generation
const generateSuratHTML = (surat: any, kop: any, settings: any) => {
  const displayRT = surat.rt || kop.rt || '...';
  const displayRW = surat.rw || kop.rw || '...';
  
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cetak Surat - ${surat.nomor_surat || surat.id}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
          body { 
            font-family: 'Times New Roman', Times, serif; 
            background: #fff;
            margin: 0; 
            padding: 0; 
          }
          .print-container {
            width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 15mm;
            font-size: 0.875rem;
          }
          @media print {
            @page { margin: 1.5cm; }
            body { background: white; }
            .print-container { padding: 0; margin: 0; width: 100%; box-shadow: none; }
          }
          .details td { padding: 2px 0; vertical-align: top; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <!-- Kop Surat -->
          <div class="flex items-center relative py-1">
                <div class="flex items-center w-48">
                    ${surat.show_logo !== 'no' && kop.logo_url ? `<img src="${kop.logo_url}" alt="Logo" class="w-[90px] h-[90px] object-contain mr-4 ml-4" />` : ''}
                </div>
                <div class="flex-1 text-center px-4 flex flex-col justify-center items-center">
                    <h2 class="font-['Arial'] text-lg font-bold uppercase w-[393.992px] h-[23.9844px]">RUKUN TETANGGA ${displayRT} / RUKUN WARGA ${displayRW}</h2>
                    <p class="font-['Arial'] text-[16px] leading-[24.8571px] font-bold w-[398.875px] h-[23.9792px]">KELURAHAN ${kop.kelurahan?.toUpperCase() || '...'} - KECAMATAN ${kop.kecamatan?.toUpperCase() || '...'}</p>
                    <p class="font-['Arial'] text-[16px] leading-[20px] font-bold">${(kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase().includes('KABUPATEN') || (kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase().includes('KOTA') ? '' : 'KABUPATEN '}${(kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase()}</p>
                    <p class="w-[347.242px] h-[23.2461px] text-[8px] leading-[11.14px]">Sekretariat : ${kop.alamat || '...'} | Email: ${kop.email || '...'} | Instagram: ${kop.instagram || '...'}</p>
                </div>
                <div class="flex items-center justify-start w-48">
                    ${surat.show_logo !== 'no' && kop.logo_rw_url ? `<img src="${kop.logo_rw_url}" alt="Logo RW" class="w-[100px] h-[95px] object-contain ml-4" />` : ''}
                </div>
           </div>
          <div class="border-b-4 border-black mt-2"></div>
          <div class="border-b-2 border-black mt-0.5"></div>
          
          <div class="text-center mt-6">
              <h3 class="text-lg font-bold underline">${surat.jenisSurat || 'SURAT PENGANTAR'}</h3>
              <p>Nomor : ${surat.nomor_surat || '...... / RT .... / RW .... / Tahun 202...'}</p>
          </div>
          
          <div class="mt-6 leading-relaxed">
              <p class="mb-4">Yang bertanda tangan di bawah ini Ketua RT ${surat.rt || kop.rt || '...'} / RW ${surat.rw || kop.rw || '...'} Kelurahan ${ (kop.kelurahan || '...').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) } Kecamatan ${ (kop.kecamatan || '...').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) } ${ ((kop.kabupaten || settings.kabupaten || 'Bekasi').toLowerCase().includes('kabupaten') || (kop.kabupaten || settings.kabupaten || 'Bekasi').toLowerCase().includes('kota') ? '' : 'Kabupaten ') + (kop.kabupaten || settings.kabupaten || 'Bekasi').toLowerCase().replace(/\b\w/g, s => s.toUpperCase()) }</p>
              <p class="mb-4">Dengan ini menerangkan bahwa :</p>
              <div class="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                 <div>Nama</div><div>:</div><div><strong>${surat.pemohon}</strong></div>
                 <div>Tempat Tgl, Lahir</div><div>:</div><div>${surat.ttl || '-'}</div>
                 <div>Jenis Kelamin</div><div>:</div><div>${surat.jk || '-'}</div>
                 <div>Pekerjaan</div><div>:</div><div>${surat.pekerjaan || '-'}</div>
                 <div>Kewarganegaraan</div><div>:</div><div>${surat.kewarganegaraan || 'WNI'}</div>
                 <div>No. KTP/NIK</div><div>:</div><div>${surat.nik || '-'}</div>
                 <div>Status Perkawinan</div><div>:</div><div>${surat.statusKawin || '-'}</div>
                 <div>Alamat</div><div>:</div><div>${surat.alamat || '-'}</div>
                 <div class="mt-2">Maksud / Keperluan</div><div class="mt-2">:</div><div class="mt-2 font-bold">${surat.keperluan || '-'}</div>
              </div>
              <p class="mt-6">Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          <div class="mt-12 flex justify-between">
              <div class="text-center ml-12">
                  <p>Mengetahui,</p>
                  <p>Ketua RW ${surat.rw || kop.rw || '....'}</p>
                  <div class="h-20 flex items-center justify-center relative">
                      ${kop.signature_rw_url ? `<img src="${kop.signature_rw_url}" alt="TTD RW" class="absolute h-20 w-full object-contain pointer-events-none" />` : ''}
                  </div>
                  <p class="font-bold underline">( ${surat.ketua_rw_nama || kop.nama_ketua_rw || '...................................'} )</p>
              </div>
              <div class="text-center mr-12">
                  <p>${(() => {
                      const kab = kop.kabupaten || settings.kabupaten || 'Bekasi';
                      const prefix = kab.toUpperCase().includes('KABUPATEN') || kab.toUpperCase().includes('KOTA') ? '' : 'Kabupaten ';
                      return prefix + kab.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    })()}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>${surat.jabatan_ttd || 'Ketua RT'} ${surat.rt || kop.rt || '....'}</p>
                  <div class="h-20 flex items-center justify-center relative">
                      ${kop.signature_rt_url ? `<img src="${kop.signature_rt_url}" alt="TTD RT" class="absolute h-20 w-full object-contain pointer-events-none" />` : ''}
                  </div>
                  <p class="font-bold underline">( ${surat.ketua || kop.nama_ketua_rt || '...................................'} )</p>
              </div>
          </div>

          <div class="mt-12 border-t border-black pt-2 text-[10px] text-gray-800">
               <div class="font-mono">
                  <div class="grid grid-cols-3 gap-2 w-full">
                    <!-- Kiri: TL. Berkas, Berkas Sesuai -->
                    <div class="flex flex-col">
                      <span>TL. Berkas / Surat No :</span>
                      <span class="mt-1">Berkas Sesuai</span>
                      <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                    </div>
                    <!-- Tengah: Hal, Berkas Kecamatan -->
                    <div class="flex flex-col">
                      <span>Hal:</span>
                      <span class="mt-1">Berkas Kecamatan</span>
                      <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                    </div>
                    <!-- Kanan: Tgl, Paraf Arsiparis -->
                    <div class="flex flex-col">
                      <span>Tgl :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
                      <span class="mt-1">Paraf Arsiparis</span>
                      <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                    </div>
                  </div>
               </div>
          </div>
        </div>
        <script>
          function checkImages() {
            const images = document.getElementsByTagName('img');
            let loadedCount = 0;
            if (images.length === 0) {
              setTimeout(() => { window.print(); window.close(); }, 500);
              return;
            }
            for (let i = 0; i < images.length; i++) {
              if (images[i].complete) {
                loadedCount++;
              } else {
                images[i].addEventListener('load', () => {
                  loadedCount++;
                  if (loadedCount === images.length) setTimeout(() => { window.print(); window.close(); }, 500);
                });
                images[i].addEventListener('error', () => {
                  loadedCount++;
                  if (loadedCount === images.length) setTimeout(() => { window.print(); window.close(); }, 500);
                });
              }
            }
            if (loadedCount === images.length) {
              setTimeout(() => { window.print(); window.close(); }, 500);
            }
          }
          window.onload = checkImages;
        </script>
      </body>
    </html>
  `;
};

// Global utility helpers
const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
  // Format anticipated: "YYYY-MM-DD"
  const parts = tglLahir.split('-');
  if (parts.length !== 3) return "-";
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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
          console.warn("Firestore client is operating in offline mode.");
        } else if (error?.code === 'unavailable') {
          console.warn("Firestore client is offline.");
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

          if (userDoc.exists()) {
            let userData = userDoc.data() as any;
            
            // --- AUTO MIGRATION & REPAIR LOGIC ---
            const isTrihUser = user.email?.toLowerCase().includes('trihprw26');
            let needsUpdate = false;
            
            // Fix missing or wrong tenantId for known client
            if (isTrihUser && userData.tenantId !== 'RW_BERJUANG') {
              userData.tenantId = 'RW_BERJUANG';
              needsUpdate = true;
            }
            
            // Force Super Admin status for the specific master email
            const isMasterEmail = user.email?.toLowerCase() === 'arifrajcoach@gmail.com';
            if (isMasterEmail) {
              const isAdminStatusWrong = userData.role !== 'SUPER_ADMIN' || !userData.isSuperAdmin || userData.tenantId !== 'MASTER';
              
              userData.isSuperAdmin = true;
              userData.role = 'SUPER_ADMIN';
              userData.tenantId = 'MASTER';
              if (!userData.name || userData.name === 'User') {
                userData.name = 'Bpk. Arif (Super Admin)';
              }
              if (isAdminStatusWrong) needsUpdate = true;
            }
            
            // Persistent update to database if repair was needed
            if (needsUpdate) {
              try {
                await updateDoc(userDocRef, { 
                    isSuperAdmin: userData.isSuperAdmin || false, 
                    role: userData.role,
                    name: userData.name,
                    tenantId: userData.tenantId
                });
              } catch(e) {
                console.warn("Could not sync profile repairs to DB.", e);
              }
            }
            setCurrentUser(userData);
          } else if (user.isAnonymous) {
            // Anonymous Citizen Bypass for Super Admin
            const overrideAdmin = user.uid === 'MKe94buSU4SMg8jiRbCcOLwJp9H3';
            setCurrentUser({ 
              name: overrideAdmin ? "Bpk. Arif (Super Admin Override)" : "Warga (Anonymous)", 
              role: overrideAdmin ? "SUPER_ADMIN" : "Warga", 
              uid: user.uid,
              tenantId: overrideAdmin ? "MASTER" : "RW26_SMART",
              isSuperAdmin: overrideAdmin 
            });
          } else {
            // If No Firestore doc yet, use default based on email (for easy migration)
            let role = 'RT';
            let name = user.email?.split('@')[0] || 'User';
            
            const isMasterEmail = user.email?.toLowerCase() === 'arifrajcoach@gmail.com';
            
            // Set default tenantId based on username or email
            let tenantId = 'RW26_SMART';
            if (user.email?.toLowerCase().includes('trihprw26')) {
              tenantId = 'RW_BERJUANG';
            } else if (user.email?.includes('@')) {
              // Extract potential tenantId from email if it's a custom domain or structured
              const domain = user.email.split('@')[1];
              if (domain !== 'gmail.com' && domain !== 'rw26.com') {
                tenantId = domain.replace(/\./g, '_');
              }
            }
            
            const isSuperAdmin = isMasterEmail;
            
            if (isMasterEmail) { 
              role = 'SUPER_ADMIN'; 
              name = 'Bpk. Arif (Super Admin)'; 
              tenantId = 'MASTER'; // Super Admin sees overall or master data
            }
            
            const newUser = { 
              id_user: user.uid,
              name: name,
              nama: name, 
              username: user.email?.split('@')[0] || 'user',
              role: role, 
              email: user.email, 
              tenantId: tenantId, 
              isSuperAdmin: !!isSuperAdmin,
              rt: "01",
              status: "AKTIF",
              created_at: new Date().toISOString()
            };
            // Auto-create the doc BEFORE setting state to avoid race condition with rules
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser as any);
          }
        } catch (error: any) {
          if (error?.message?.includes('offline') || error?.code === 'unavailable') {
            console.warn("Client is offline, using fallback auth profile.");
            setCurrentUser({ name: user.email || 'User', role: 'Viewer' });
          } else {
            console.error("Error fetching user profile:", error);
            if (error?.code !== 'permission-denied') {
              setCurrentUser({ name: user.email || 'User', role: 'Viewer' });
            } else {
              // Handle profile read denial explicitly
              setCurrentUser(null);
              setDbError("Profil Anda belum aktif atau tidak memiliki izin akses. Hubungi Admin.");
            }
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
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [suratData, setSuratData] = useState(() => {
    const saved = localStorage.getItem('rw26_suratData');
    return saved ? JSON.parse(saved) : INITIAL_SURAT_DATA;
  });

  const [iuranData, setIuranData] = useState<any[]>([]);
  const [ppobData, setPpobData] = useState<any[]>([]);

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
  const [votingCandidates, setVotingCandidates] = useState<any[]>([]);
  const [votingConfig, setVotingConfig] = useState<any>({ status: 'CLOSED', aturan: '' });
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [tokoProducts, setTokoProducts] = useState<any[]>([]);
  const [tokoOrders, setTokoOrders] = useState<any[]>([]);
  const [isSOSTriggering, setIsSOSTriggering] = useState(false);
  const [hiddenEmergencyId, setHiddenEmergencyId] = useState<string | null>(null);

  const [usersData, setUsersData] = useState<any[]>([]);
  const [tenantsData, setTenantsData] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [kopSettings, setKopSettings] = useState<Record<string, any>>({});

  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<any>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const activeEmergency = emergenciesData.find(e => e.status === 'ACTIVE' && e.id !== hiddenEmergencyId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Additional generic cleanup or logic for emergencies can go here.
    // The actual audio playing logic has been moved to SOSOverlay.

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEmergency]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const [isSOSConfirmOpen, setIsSOSConfirmOpen] = useState(false);
  const [wargaAuth, setWargaAuth] = useState<any>(null); // For custom citizen login
  const [isSelfRegistering, setIsSelfRegistering] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'Viewer' || (!currentUser && wargaAuth)) {
      if (activeTab === 'dashboard' || activeTab === 'transaksi' || activeTab === 'kas' || activeTab === 'posyandu') {
        setActiveTab('warga');
      }
    }
  }, [currentUser, wargaAuth, activeTab]);

  const handleTriggerSOS = async () => {
    if (!currentUser) return;
    
    // Feedback getar saat tombol SOS awal ditekan
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
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
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([1000, 500, 1000, 500]);
      } catch (e) {}
    }

    // Play immediate war sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sawtooth';
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
        rt: linkedWarga?.rt || '-',
        rw: linkedWarga?.rw || '-',
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
    // We allow fetching for authenticated users OR anonymous citizens
    if (!currentUser && !wargaAuth) {
      setIsLoadingDB(false);
      return;
    }

    const tId = currentUser?.tenantId || wargaAuth?.tenantId || 'RW26_SMART';
    const tIds = tId === 'RW_BERJUANG' ? ['RW_BERJUANG', 'trihprw26'] : [tId];

    const isViewer = currentUser?.role === 'Viewer';
    const isCitizen = currentUser?.role === 'Warga' || (!currentUser && !!wargaAuth);
    const hasFullAccess = !isCitizen && !isViewer;

    setIsLoadingDB(true);
    let loadedSections = 0;
    const requiredSections = hasFullAccess ? 4 : 2; // Hanya tunggu data utama: Warga, Kas, Surat, Iuran

    // Safety fallback agar aplikasi tidak freeze selamanya
    const fallbackTimer = setTimeout(() => {
      setIsLoadingDB(false);
    }, 4500);

    const onDataLoaded = () => {
      loadedSections++;
      if (loadedSections >= requiredSections) {
        setIsLoadingDB(false);
        clearTimeout(fallbackTimer);
      }
    };

    // 0. Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', tId), 
      (snap) => {
        if (snap.exists()) {
          setSettings(snap.data());
        }
      },
      (err) => { handleFirestoreError(err, 'get', `settings/${tId}`); onDataLoaded(); }
    );

    const unsubCurrentTenant = tId === 'MASTER' 
      ? (() => {
          setCurrentTenant({ 
            id: 'MASTER', 
            name: 'SUPER ADMIN RW26', 
            status: 'ENTERPRISE', 
            maxWarga: 999999 
          });
          onDataLoaded();
          return () => {};
        })()
      : onSnapshot(doc(db, 'tenants', tId), 
          (snap) => {
            if (snap.exists()) {
              setCurrentTenant(snap.data());
            } else {
              setCurrentTenant(null);
            }
            onDataLoaded();
          },
          (err) => { 
            handleFirestoreError(err, 'get', `tenants/${tId}`); 
            setCurrentTenant(null);
            onDataLoaded();
          }
        );

    // 0.5 Kop Settings Listener
    const unsubKopSettings = onSnapshot(doc(db, 'tenant_settings', tId), 
      (snap) => {
        if (snap.exists()) {
          setKopSettings(snap.data());
        }
      },
      (err) => { handleFirestoreError(err, 'get', `tenant_settings/${tId}`); onDataLoaded(); }
    );

    // 1. Warga Listener
    const getWargaQuery = () => {
      const base = collection(db, 'data_warga');
      
      // Jika Super Admin, tapi ingin melihat data spesifik tenant, atau hanya data MASTER
      // Jika di Dashboard utama (MASTER), kita ambil hanya data yang berlabel MASTER atau tenantId yang aktif
      const constraints = [where('tenantId', 'in', tIds)];
      
      if (currentUser?.role === 'RT') {
        constraints.push(where('rt', '==', currentUser.rt || '01'));
      }
      
      return query(base, ...constraints);
    };

    const unsubWarga = onSnapshot(getWargaQuery(), 
      (snap) => {
        const data = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
        setWargaData(data);
        onDataLoaded();
      },
      (err) => {
        handleFirestoreError(err, 'list', 'data_warga');
        onDataLoaded();
      }
    );

    // 2. Kas Listener
    let unsubKas = () => {};
    if (hasFullAccess) {
      const getKasQuery = () => {
        const base = collection(db, 'kas');
        const constraints = [where('tenantId', 'in', tIds)];
        if (currentUser?.role === 'RT') {
          constraints.push(where('rt', '==', currentUser.rt || '01'));
        }
        return query(base, ...constraints);
      };

      unsubKas = onSnapshot(getKasQuery(), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setKasData(data);
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'kas');
          onDataLoaded();
        }
      );
    }

    // 3. Surat Listener
    let unsubSurat = () => {};
    if (hasFullAccess) {
      unsubSurat = onSnapshot(query(collection(db, 'surat'), where('tenantId', 'in', tIds)), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    } else if (isCitizen && (wargaAuth || currentUser?.role === 'Warga')) {
      // Citizen listener: only their own letters
      const uid = auth.currentUser?.uid;
      if (uid) {
        unsubSurat = onSnapshot(query(collection(db, 'surat'), where('tenantId', 'in', tIds), where('authUid', '==', uid)), 
          (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSuratData(data);
            onDataLoaded();
          },
          (err) => {
            handleFirestoreError(err, 'list', 'surat');
            onDataLoaded();
          }
        );
      } else {
        onDataLoaded();
      }
    }

    // 4. Iuran Listener
    let unsubIuran = () => {};
    if (hasFullAccess) {
      unsubIuran = onSnapshot(query(collection(db, 'iuran'), where('tenantId', 'in', tIds)), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    } else if (isCitizen && (wargaAuth || currentUser?.role === 'Warga')) {
      const uid = auth.currentUser?.uid;
      if (uid) {
        unsubIuran = onSnapshot(query(collection(db, 'iuran'), where('tenantId', 'in', tIds), where('userId', '==', uid)), 
          (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setIuranData(data);
            onDataLoaded();
          },
          (err) => {
            handleFirestoreError(err, 'list', 'iuran');
            onDataLoaded();
          }
        );
      }
    }

    // 4.6 PPOB Listener
    let unsubPpob = () => {};
    if (hasFullAccess) {
      unsubPpob = onSnapshot(query(collection(db, 'ppob_trx'), where('tenantId', 'in', tIds)), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const filtered = currentUser?.role === 'RT'
            ? data.filter((i: any) => i.rt === currentUser.rt)
            : data;
          setPpobData(filtered);
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'ppob_trx'); onDataLoaded(); }
      );
    } else if (isCitizen && (wargaAuth || currentUser?.role === 'Warga')) {
      const uid = auth.currentUser?.uid;
      if (uid) {
        unsubPpob = onSnapshot(query(collection(db, 'ppob_trx'), where('tenantId', 'in', tIds), where('userId', '==', uid)), 
          (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPpobData(data);
            onDataLoaded();
          },
          (err) => { handleFirestoreError(err, 'list', 'ppob_trx'); onDataLoaded(); }
        );
      }
    }

    // 4.5 Inventaris Listener
    let unsubInventaris = () => {};
    let unsubInventarisLogs = () => {};
    let unsubInventarisKategori = () => {};
    let unsubInventarisLokasi = () => {};
    let unsubInventarisSupplier = () => {};

    if (hasFullAccess) {
      const getInventarisQuery = () => {
        const base = collection(db, 'inventaris');
        const constraints = [where('tenantId', 'in', tIds)];
        if (currentUser?.role === 'RT') {
          constraints.push(where('rt', '==', currentUser.rt || '01'));
        }
        return query(base, ...constraints);
      };

      unsubInventaris = onSnapshot(getInventarisQuery(), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInventarisData(data);
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'inventaris');
          onDataLoaded();
        }
      );

      // 4.6 Inventaris Logs Listener
      const getInventarisLogsQuery = () => {
        const base = collection(db, 'inventaris_logs');
        const constraints = [where('tenantId', 'in', tIds)];
        if (currentUser?.role === 'RT') {
          constraints.push(where('rt', '==', currentUser.rt || '01'));
        }
        return query(base, ...constraints);
      };

      unsubInventarisLogs = onSnapshot(getInventarisLogsQuery(), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInventarisLogs(data);
        },
        (err) => {
          handleFirestoreError(err, 'list', 'inventaris_logs');
        }
      );

      // 4.7 Inventaris Kategori/Lokasi/Supplier
      unsubInventarisKategori = onSnapshot(query(collection(db, 'inventaris_kategori'), where('tenantId', 'in', tIds)), 
        (snap) => setInventarisKategori(snap.docs.map(doc => ({ ...doc.data() })))
      );
      unsubInventarisLokasi = onSnapshot(query(collection(db, 'inventaris_lokasi'), where('tenantId', 'in', tIds)), 
        (snap) => setInventarisLokasi(snap.docs.map(doc => ({ ...doc.data() })))
      );
      unsubInventarisSupplier = onSnapshot(query(collection(db, 'inventaris_supplier'), where('tenantId', 'in', tIds)), 
        (snap) => setInventarisSupplier(snap.docs.map(doc => ({ ...doc.data() })))
      );
    }

    // 4.8 Posyandu Listeners
    let unsubBalita = () => {};
    let unsubIbuHamil = () => {};
    let unsubPosyanduKegiatan = () => {};
    let unsubPosbinduKegiatan = () => {};
    let unsubPemeriksaanBalita = () => {};
    let unsubPemeriksaanPosbindu = () => {};
    let unsubImunisasi = () => {};

    if (hasFullAccess) {
      const getRTFilter = (coll: string) => {
        const base = collection(db, coll);
        const constraints = [where('tenantId', 'in', tIds)];
        if (currentUser?.role === 'RT') {
          constraints.push(where('rt', '==', currentUser.rt || '01'));
        }
        return query(base, ...constraints);
      };

      unsubBalita = onSnapshot(getRTFilter('balita'), 
        (snap) => {
          setBalitaData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'balita'); onDataLoaded(); }
      );
      unsubIbuHamil = onSnapshot(getRTFilter('ibu_hamil'), 
        (snap) => {
          setIbuHamilData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'ibu_hamil'); onDataLoaded(); }
      );
      unsubPosyanduKegiatan = onSnapshot(getRTFilter('posyandu_kegiatan'), 
        (snap) => {
          setPosyanduKegiatanData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'posyandu_kegiatan'); onDataLoaded(); }
      );
      unsubPosbinduKegiatan = onSnapshot(getRTFilter('posbindu_kegiatan'), 
        (snap) => {
          setPosbinduKegiatanData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'posbindu_kegiatan'); onDataLoaded(); }
      );
      unsubPemeriksaanBalita = onSnapshot(getRTFilter('pemeriksaan_balita'), 
        (snap) => {
          setPemeriksaanBalitaData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'pemeriksaan_balita'); onDataLoaded(); }
      );
      unsubPemeriksaanPosbindu = onSnapshot(getRTFilter('pemeriksaan_posbindu'), 
        (snap) => {
          setPemeriksaanPosbinduData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'pemeriksaan_posbindu'); onDataLoaded(); }
      );
      unsubImunisasi = onSnapshot(getRTFilter('imunisasi'), 
        (snap) => {
          setImunisasiData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'imunisasi'); onDataLoaded(); }
      );
    }

    // 4.9 Bank Sampah Listeners
    let unsubSampahKategori = () => {};
    let unsubSampahSetoran = () => {};
    let unsubSampahTarikSaldo = () => {};
    if (hasFullAccess) {
      const getRTFilter = (coll: string) => {
        const base = collection(db, coll);
        const constraints = [where('tenantId', 'in', tIds)];
        if (currentUser?.role === 'RT') {
          constraints.push(where('rt', '==', currentUser.rt || '01'));
        }
        return query(base, ...constraints);
      };

      unsubSampahKategori = onSnapshot(getRTFilter('sampah_kategori'), 
        (snap) => {
          setSampahKategoriData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'sampah_kategori'); onDataLoaded(); }
      );
      unsubSampahSetoran = onSnapshot(getRTFilter('sampah_setoran'), 
        (snap) => {
          setSampahSetoranData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'sampah_setoran'); onDataLoaded(); }
      );
      unsubSampahTarikSaldo = onSnapshot(getRTFilter('sampah_tarik_saldo'), 
        (snap) => {
          setSampahTarikSaldoData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          onDataLoaded();
        },
        (err) => { handleFirestoreError(err, 'list', 'sampah_tarik_saldo'); onDataLoaded(); }
      );
    }

    const unsubEmergencies = onSnapshot(query(collection(db, 'emergencies'), where('tenantId', 'in', tIds)), 
      (snap) => {
        setEmergenciesData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'emergencies'); onDataLoaded(); }
    );

    const unsubVotingCandidates = onSnapshot(query(collection(db, 'voting_candidates'), where('tenantId', 'in', tIds)), 
      (snap) => {
        setVotingCandidates(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'voting_candidates'); onDataLoaded(); }
    );

    const unsubVotingConfig = onSnapshot(doc(db, 'voting_config', tId), 
      (snap) => {
        if (snap.exists()) setVotingConfig(snap.data());
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'voting_config'); onDataLoaded(); }
    );

    const unsubUserVotes = onSnapshot(query(collection(db, 'voting_votes'), where('tenantId', 'in', tIds)), 
      (snap) => {
        setUserVotes(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'voting_votes'); onDataLoaded(); }
    );
    
    const unsubTokoProducts = onSnapshot(query(collection(db, 'toko_products'), where('tenantId', 'in', tIds)), 
      (snap) => {
        setTokoProducts(snap.docs.map(doc => ({ ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'toko_products'); onDataLoaded(); }
    );

    const getTokoOrdersQuery = () => {
      const base = collection(db, 'toko_orders');
      const constraints = [where('tenantId', 'in', tIds)];
      
      // Citizens can only list their own orders to avoid permission errors
      if (isCitizen) {
        constraints.push(where('customerId', '==', auth.currentUser?.uid || 'NONE'));
      }
      
      return query(base, ...constraints);
    };

    const unsubTokoOrders = onSnapshot(getTokoOrdersQuery(), 
      (snap) => {
        setTokoOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        onDataLoaded();
      },
      (err) => { handleFirestoreError(err, 'list', 'toko_orders'); onDataLoaded(); }
    );

    const getVerifikasiQuery = () => {
      const base = collection(db, 'verifikasi_warga');
      
      // Prevent unauthorized list operations
      if (!auth.currentUser) {
         return null;
      }

      const isOperatorRole = currentUser && (currentUser.isSuperAdmin || ['RW', 'RT', 'ADMIN', 'BENDAHARA', 'SEKRETARIS'].includes(currentUser.role));
      
      if (!isOperatorRole) {
        // If it's a citizen (logged in via anonymous auth or linked)
        const uid = auth.currentUser.uid;
        // We ONLY filter by authUid for citizens to satisfy rules
        return query(base, where('authUid', '==', uid));
      }

      if (currentUser?.isSuperAdmin) return query(base);
      
      const constraints = [where('tenantId', 'in', tIds)];
      return query(base, ...constraints);
    };

    const verifikasiQuery = getVerifikasiQuery();
    const unsubVerifikasi = verifikasiQuery ? onSnapshot(verifikasiQuery, 
      (snap) => {
        setVerifikasiWargaData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        if (!currentUser && wargaAuth) onDataLoaded(); 
      },
      (err) => { 
        handleFirestoreError(err, 'list', 'verifikasi_warga'); 
        if (!currentUser && wargaAuth) onDataLoaded();
      }
    ) : () => { if (!currentUser && wargaAuth) onDataLoaded(); };

    // 5. Users Listener
    let unsubUsers = () => {};
    if (currentUser?.role === 'ADMIN' || currentUser?.isSuperAdmin || currentUser?.role === 'RW' || currentUser?.role === 'RT') {
      const usersQuery = currentUser.isSuperAdmin 
        ? query(collection(db, 'users'))
        : (currentUser.tenantId === 'RW_BERJUANG' 
            ? query(collection(db, 'users'), where('tenantId', 'in', ['RW_BERJUANG', 'trihprw26']))
            : query(collection(db, 'users'), where('tenantId', '==', currentUser.tenantId || 'RW26_SMART'))
          );

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
          const data = snap.docs.map(doc => ({ id: doc.id, docId: doc.id, ...doc.data() }));
          setTenantsData(data);
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'tenants');
          onDataLoaded();
        }
      );
    }

    // 7. Audit Log Listener (Enterprise)
    let unsubAudit = () => {};
    if (hasFullAccess && getPlanFeatures(currentTenant?.status).governance === 'HIGH') {
      unsubAudit = onSnapshot(query(collection(db, 'audit_logs'), where('tenantId', 'in', tIds), limit(100)), 
        (snap) => {
          const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAuditLogs(data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          onDataLoaded();
        },
        (err) => {
          handleFirestoreError(err, 'list', 'audit_logs');
          onDataLoaded();
        }
      );
    }

    return () => {
      unsubWarga();
      unsubKas();
      unsubSurat();
      unsubIuran();
      unsubPpob();
      unsubInventaris();
      unsubInventarisLogs();
      unsubInventarisKategori();
      unsubInventarisLokasi();
      unsubInventarisSupplier();
      unsubBalita();
      unsubIbuHamil();
      unsubPosyanduKegiatan();
      unsubPosbinduKegiatan();
      unsubPemeriksaanBalita();
      unsubPemeriksaanPosbindu();
      unsubImunisasi();
      unsubSampahKategori();
      unsubSampahSetoran();
      unsubSampahTarikSaldo();
      unsubEmergencies();
      unsubVotingCandidates();
      unsubVotingConfig();
      unsubUserVotes();
      unsubTokoProducts();
      unsubTokoOrders();
      unsubVerifikasi();
      unsubUsers();
      unsubTenants();
      unsubSettings();
      unsubCurrentTenant();
      unsubKopSettings();
      unsubAudit();
    };
  }, [currentUser, wargaAuth]);

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
    const errInfo = {
      error: err instanceof Error ? err.message : String(err),
      operationType: op,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: currentUser?.tenantId || 'unknown',
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      }
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    showNotification(`Akses Gagal: ${op.toUpperCase()} pada ${path}. Sesi anda mungkin habis atau izin ditolak.`);
    throw new Error(JSON.stringify(errInfo));
  };

  // Helper for uploading files. In this environment, Firebase Storage (bucket) might not be fully initialized.
  // We use Base64 encoding and image compression as a fallback so the app works without the Storage bucket.
  const handleFileUpload = async (file: File, folder: string, onProgress?: (pct: number) => void) => {
    console.log(`Starting base64 encoding for ${folder}:`, file.name);
    
    if (onProgress) onProgress(10);
    
    return new Promise<string>((resolve, reject) => {
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (onProgress) onProgress(50);
        const result = e.target?.result as string;
        
        if (isImage) {
          // Compress image to fit well within Firestore's 1MB document limit
          const img = new window.Image();
          img.onload = () => {
             const canvas = document.createElement('canvas');
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
             const ctx = canvas.getContext('2d');
             if (ctx) {
                 ctx.drawImage(img, 0, 0, width, height);
                 if (onProgress) onProgress(100);
                 resolve(canvas.toDataURL('image/jpeg', 0.6)); // Compress to 60% JPEG
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
              const errMsg = "File PDF/Dokumen terlalu besar. Maksimal 700KB untuk upload karena keterbatasan database.";
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
  useEffect(() => { localStorage.setItem('rw26_wargaData', JSON.stringify(wargaData)); }, [wargaData]);
  useEffect(() => { localStorage.setItem('rw26_kasData', JSON.stringify(kasData)); }, [kasData]);
  useEffect(() => { localStorage.setItem('rw26_suratData', JSON.stringify(suratData)); }, [suratData]);
  useEffect(() => { localStorage.setItem('rw26_iuranData', JSON.stringify(iuranData)); }, [iuranData]);

  const handleLinkToWarga = async (nik: string, pin: string) => {
    setIsLoadingDB(true);
    try {
      const searchKey = nik.trim().toLowerCase();
      const pinKey = pin.trim();
      
      const warga = wargaData.find(w => 
        (w.nik && w.nik.toLowerCase() === searchKey) || 
        (w.nama && w.nama.toLowerCase() === searchKey)
      );
      
      if (!warga) {
        showNotification("Data warga tidak ditemukan. Gunakan NIK atau Nama Lengkap.", "error");
        setIsLoadingDB(false);
        return;
      }
      
      const isMatch = (warga.no_kk && warga.no_kk === pinKey) || 
                      (warga.telepon && warga.telepon === pinKey) || 
                      (warga.hp && warga.hp === pinKey);
      
      if (!isMatch) {
         showNotification("Kunci (KK atau No. HP) salah.", "error");
         setIsLoadingDB(false);
         return;
      }

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const nameToUse = warga.nama || auth.currentUser.displayName || 'Warga';
        
        await setDoc(userRef, {
          role: 'Warga',
          nik: warga.nik || '',
          name: nameToUse,
          linkedResidentId: warga.id || warga.id_warga || warga.nik || '',
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        showNotification(`Berhasil! Selamat datang Bpk/Ibu ${nameToUse}.`, "success");
      }
    } catch (err) {
      handleFirestoreError(err, 'update', 'users');
    } finally {
      setIsLoadingDB(false);
    }
  };

  // 1A. Handle Public Self-Registration via QR
  const queryParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const regTenantId = queryParams.get('reg');

  // --- VIEW SELECTION (Must be after all hooks) ---
  
  if (window.location.pathname.startsWith('/guestbook/')) {
    const tenantId = window.location.pathname.split('/')[2];
    return <GuestBookFormPublic tenantId={tenantId} />;
  }

  if (isAuthInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-soft-blue border-t-brand-blue rounded-full animate-spin mb-6"></div>
          <AppLogo size={8} className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight font-elegant mb-2">RW26 <span className="text-brand-pink">BERJUANG</span></h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Menyiapkan Sesi Keamanan...</p>
      </div>
    );
  }

  if (regTenantId) {
    return (
      <SelfRegistrationView 
        tenantId={regTenantId} 
        onClose={() => window.location.href = '/'}
        handleFileUpload={handleFileUpload}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
      />
    );
  }

  if (isSelfRegistering) {
    return (
      <SelfRegistrationView 
        tenantId={currentUser?.tenantId || 'RW26_SMART'}
        onClose={() => setIsSelfRegistering(false)}
        handleFileUpload={handleFileUpload}
        showNotification={showNotification}
        handleFirestoreError={handleFirestoreError}
      />
    );
  }

  if (!wargaAuth && (!currentUser || (currentUser.role === 'Warga' && currentUser.name === 'Warga (Anonymous)'))) {
    return <LoginView setWargaAuth={setWargaAuth} wargaData={wargaData} verifikasiWargaData={verifikasiWargaData} isLoadingDB={isLoadingDB} onSelfRegister={() => setIsSelfRegistering(true)} />;
  }

  if (wargaAuth && !currentUser?.isSuperAdmin) {
    return (
      <WargaProfileView 
        wargaData={wargaAuth} 
        verifikasiData={verifikasiWargaData} 
        suratData={suratData}
        setSuratData={setSuratData}
        setWargaAuth={setWargaAuth} 
        tenantId={wargaAuth.tenantId || 'RW26_SMART'} 
        isLoadingDB={isLoadingDB}
        setIsLoadingDB={setIsLoadingDB} 
        handleFileUpload={handleFileUpload} 
        showNotification={showNotification} 
        handleFirestoreError={handleFirestoreError}
        kopSettings={kopSettings}
        getSetting={getSetting}
        usersData={usersData}
        generateSuratHTML={generateSuratHTML}
        settings={settings}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans print:h-auto print:bg-white text-sm relative">
      {/* SOS EMERGENCY OVERLAY */}
      <AnimatePresence>
        {activeEmergency && (
          <SOSOverlay 
            emergency={activeEmergency} 
            onResolve={handleResolveSOS} 
            onCloseLocal={() => setHiddenEmergencyId(activeEmergency.id)}
            canResolve={currentUser.role !== 'Viewer' || auth.currentUser?.uid === activeEmergency.userId}
          />
        )}
      </AnimatePresence>

      {isLoadingDB && (
        <div className="fixed inset-0 z-[9999] bg-white/95 flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-md">
          <div className="absolute inset-0 bg-mesh opacity-50 -z-10 animate-pulse"></div>
          <div className="relative mb-8 pt-4">
            <div className="w-24 h-24 border-8 border-brand-blue/10 border-t-brand-blue border-r-brand-pink rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <AppLogo size={12} className="w-12 h-12 drop-shadow-lg" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full shadow-sm border border-slate-100 text-[10px] font-bold text-brand-blue animate-bounce">LOADING</div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-1 uppercase font-elegant">RW26 <span className="text-brand-pink">BERJUANG</span></h2>
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-6">Berdampak & Memberdayakan</p>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-700 font-elegant tracking-tight">Powered by Nexapps</h3>
            <p className="text-slate-500 max-w-xs mx-auto font-medium text-sm leading-relaxed">Mohon tunggu sebentar, kami sedang menyiapkan lingkungan yang ceria untuk Anda...</p>
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
      <aside className={`fixed md:relative z-50 md:z-auto w-72 md:w-64 bg-white border-r border-slate-100 flex flex-col h-full print:hidden transition-all duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl md:shadow-none'} rounded-r-[2.5rem] md:rounded-none`}>
        <div className="p-8 border-b border-slate-50 flex-shrink-0 flex items-center justify-between bg-white relative overflow-hidden group rounded-tr-[2.5rem] md:rounded-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl group-hover:bg-brand-pink/10 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center p-2 mb-4 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-500">
              <AppLogo size={12} className="w-12 h-12" />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800 flex items-center justify-center gap-1 leading-none font-elegant uppercase">
              <span className="text-brand-blue">RW26</span>
              <span className="text-brand-pink">BERJUANG</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-red-500 md:hidden bg-slate-50 rounded-lg transition-colors absolute top-4 right-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-shrink-0 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-brand-green  shadow-[0_0_8px_rgba(0,250,154,0.5)]"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI ACTIVE</p>
          </div>
          <div className="p-2 bg-soft-blue rounded-xl border border-blue-100">
             {getPlanFeatures(currentTenant?.status).multiRegion ? (
              <div className="space-y-1">
                <p className="text-[8px] text-brand-blue font-black uppercase tracking-widest">Wilayah Kerja:</p>
                <select className="w-full bg-white border border-blue-100 rounded-lg text-[10px] font-bold p-1 outline-none text-slate-700">
                  <option>🏢 KELURAHAN (PUSAT)</option>
                  <option>🏠 RW 05 (AKTIF)</option>
                  <option>🏠 RW 01</option>
                  <option>🏠 RW 02</option>
                </select>
              </div>
             ) : (
               <>
                <p className="text-[9px] text-brand-blue font-bold uppercase tracking-tight">ID Klien:</p>
                <p className="text-[10px] text-slate-700 font-mono font-bold truncate">{currentUser.tenantId || 'RW26_SMART'}</p>
               </>
             )}
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto pb-20 scrollbar-hide">
          {[
            { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
            { id: 'warga', label: 'Data Warga', icon: Users },
            { id: 'buku-tamu', label: 'Buku Tamu', icon: BookCopy },
            { id: 'verifikasi', label: 'VERIFIKASI', icon: ShieldCheck },
            { id: 'keuangan', label: 'Keuangan', icon: CreditCard, plan: 'keuangan', minPlan: 'BASIC' },
            { id: 'posyandu', label: 'Kesehatan', icon: Baby, plan: 'posyandu', minPlan: 'PRO' },
            { id: 'bank-sampah', label: 'Bank Sampah', icon: Recycle, plan: 'bankSampah', minPlan: 'PRO' },
            { id: 'etoko', label: 'E-LAPAK26', icon: ShoppingBag, plan: 'eLapak', minPlan: 'BASIC' },
            { id: 'voting', label: 'E-Pemilu', icon: Vote, plan: 'ePemilu', minPlan: 'PRO' },
            { id: 'inventaris', label: 'Inventaris', icon: Package },
            { id: 'surat', label: 'Surat', icon: FileText, plan: 'surat', minPlan: 'BASIC' },
            { id: 'kop-template', label: 'KOP & Template', icon: FileSpreadsheet },
            { id: 'users', label: 'Manage User', icon: User },
            { id: 'super-admin', label: 'Manajemen Tenant', icon: Shield },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
            { id: 'chat', label: 'Grup Chat', icon: MessageSquare, plan: 'chatMode', minPlan: 'BASIC' },
            { id: 'ai-bot', label: 'AI Agent', icon: Bot, plan: 'ai', minPlan: 'PREMIUM' },
            { id: 'monitoring', label: 'MONITORING', icon: LayoutGrid, plan: 'multiRegion', minPlan: 'ENTERPRISE' },
            { id: 'audit', label: 'GOVERNANCE', icon: Shield, plan: 'governance', minPlan: 'ENTERPRISE' },
          ].filter(item => {
            const role = currentUser?.role || 'TAMU';
            const isSuperAdmin = !!currentUser?.isSuperAdmin;

            if (isSuperAdmin) return true;

            const rolePermissions: { [key: string]: string[] } = {
              'SUPER_ADMIN': ['dashboard', 'warga', 'buku-tamu', 'verifikasi', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'inventaris', 'surat', 'kop-template', 'users', 'super-admin', 'pengaturan', 'chat', 'ai-bot', 'monitoring', 'audit'],
              'KELURAHAN_ADMIN': ['dashboard', 'warga', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'inventaris', 'surat', 'users', 'chat', 'ai-bot', 'monitoring', 'audit'],
              'ADMIN': ['dashboard', 'warga', 'buku-tamu', 'verifikasi', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'inventaris', 'surat', 'kop-template', 'users', 'pengaturan', 'chat', 'ai-bot', 'monitoring', 'audit'],
              'RW': ['dashboard', 'warga', 'buku-tamu', 'verifikasi', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'inventaris', 'surat', 'kop-template', 'users', 'chat', 'ai-bot', 'monitoring', 'audit'],
              'RT': ['dashboard', 'warga', 'buku-tamu', 'verifikasi', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'inventaris', 'surat', 'kop-template', 'users', 'chat', 'ai-bot'],
              'SEKRETARIS': ['dashboard', 'warga', 'buku-tamu', 'verifikasi', 'inventaris', 'surat', 'kop-template', 'chat', 'ai-bot'],
              'BENDAHARA': ['dashboard', 'keuangan', 'bank-sampah', 'chat', 'ai-bot'],
              'SATPAM': ['dashboard', 'buku-tamu'],
              'KADER': ['dashboard', 'posyandu', 'bank-sampah', 'chat', 'ai-bot'],
              'WARGA': ['dashboard', 'verifikasi', 'keuangan', 'posyandu', 'bank-sampah', 'etoko', 'voting', 'surat', 'chat', 'ai-bot'],
              'TAMU': ['dashboard', 'etoko'],
              'Viewer': ['dashboard', 'etoko']
            };

            const allowed = rolePermissions[role] || ['dashboard'];
            return allowed.includes(item.id);
          }).map((item: any) => {
            const planConfig = getPlanFeatures(currentTenant?.status);
            const isLocked = item.plan && (!currentTenant || (planConfig as any)[item.plan] === false);
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isLocked) {
                    setShowUpgradeModal(true);
                  } else {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-3xl transition-all duration-300 relative group overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/30 scale-[1.02]' 
                    : isLocked ? 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue font-black'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 w-1.5 h-6 bg-brand-yellow rounded-r-full"
                  />
                )}
                <div className={`relative transition-all duration-300 ${activeTab === item.id ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}>
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isLocked && (
                    <div className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white p-0.5 rounded-full border border-white">
                      <Lock className="w-2 h-2" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left flex flex-col">
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isLocked ? 'text-slate-400' : ''}`}>
                    {item.label}
                  </span>
                  {isLocked && (
                    <span className="text-[7px] font-black text-amber-600 bg-amber-50 px-1 py-0.5 rounded border border-amber-100 self-start mt-0.5 animate-pulse">
                      LEVEL: {item.minPlan || 'PRO'}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden print:overflow-visible w-full">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 md:px-10 shrink-0 print:hidden sticky top-0 z-30">
          <div className="flex items-center space-x-4">
             <button 
               onClick={() => setIsSidebarOpen(true)}
               className="p-3 -ml-2 text-slate-500 hover:text-brand-blue md:hidden bg-slate-50 rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100"
             >
               <Menu className="w-6 h-6" />
             </button>
             <div className="hidden sm:flex items-center gap-2">
               <span className="bg-soft-yellow text-amber-600 text-[10px] px-2.5 py-1 rounded-full border border-amber-100 uppercase font-black tracking-widest shadow-sm">
                 V4.0 Active
               </span>
               <div className="flex items-center gap-2 bg-soft-green text-brand-green text-[10px] px-3 py-1 rounded-full border border-brand-green/20 uppercase font-black tracking-widest shadow-sm">
                 <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse shadow-[0_0_8px_rgba(0,250,154,0.5)]"></div>
                 Connected
               </div>
             </div>
             <div className="h-6 w-px bg-slate-100 mx-2 hidden md:block"></div>
             <h2 className="text-xl font-black text-slate-800 capitalize tracking-tight hidden md:block">
               {activeTab === 'etoko' ? 'E-LAPAK26' : (activeTab === 'posyandu' ? 'Kesehatan' : activeTab.replace('-', ' '))}
             </h2>
          </div>
          <div className="flex items-center space-x-3 md:space-x-6">
             <div className="flex items-center space-x-3 md:space-x-4 pl-4 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                 <p className="text-sm font-black leading-none text-slate-800 flex items-center justify-end gap-2 mb-1">
                   {currentUser.name}
                   {currentUser.isSuperAdmin && <ShieldCheck className="w-4 h-4 text-brand-blue" />}
                 </p>
                 <span className={`text-[9px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full border shadow-sm inline-block ${
                   currentUser.isSuperAdmin 
                     ? 'bg-slate-900 text-white border-slate-900' 
                     : 'bg-brand-blue/10 text-brand-blue border-brand-blue/20'
                 }`}>
                   {currentUser.isSuperAdmin ? 'SUPER ADMIN' : currentUser.role}
                 </span>
               </div>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-brand-blue p-0.5 shadow-xl shadow-brand-blue/20 border-2 border-white ring-1 ring-slate-100 overflow-hidden group hover:scale-105 transition-transform duration-300 cursor-pointer">
                 <div className="w-full h-full rounded-[0.9rem] overflow-hidden flex items-center justify-center text-white text-lg font-black bg-gradient-to-tr from-brand-blue to-cyan-400">
                   {userPhoto ? (
                     <img src={userPhoto} alt={currentUser.name} className="w-full h-full object-cover" />
                   ) : (
                     currentUser.name.charAt(0)
                   )}
                 </div>
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
          {activeTab === 'dashboard' && (
            <DashboardView 
              kasData={kasData} 
              wargaData={wargaData} 
              suratData={suratData} 
              iuranData={iuranData} 
              emergenciesData={emergenciesData} 
              handleTriggerSOS={handleTriggerSOS} 
              userRole={currentUser.role} 
              setActiveTab={setActiveTab} 
              posyanduKegiatanData={posyanduKegiatanData} 
              inventarisData={inventarisData} 
              sampahSetoranData={sampahSetoranData} 
              bukuTamuData={bukuTamuData} 
              verifikasiWargaData={verifikasiWargaData} 
              sampahTarikSaldoData={sampahTarikSaldoData} 
              votingConfig={votingConfig} 
              userVotes={userVotes} 
              tokoOrders={tokoOrders} 
              handleLinkToWarga={handleLinkToWarga}
              currentTenant={currentTenant}
              setShowUpgradeModal={setShowUpgradeModal}
              setShowQRModal={setShowQRModal}
            />
          )}
          {activeTab === 'warga' && <WargaView wargaData={wargaData} currentTenant={currentTenant} setWargaData={setWargaData} userRole={currentUser.role} tenantId={currentUser.tenantId || 'RW26_SMART'} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} currentUser={currentUser} />}
          {activeTab === 'buku-tamu' && (
            <BukuTamuView 
              bukuTamuData={bukuTamuData} 
              setBukuTamuData={setBukuTamuData}
              wargaData={wargaData}
              currentUser={currentUser}
              tenantId={currentUser?.tenantId && currentUser.tenantId !== 'unknown' ? currentUser.tenantId : 'RW26_SMART'}
              handleFirestoreError={handleFirestoreError}
              showNotification={showNotification}
            />
          )}
          {activeTab === 'verifikasi' && <VerifikasiAdminView verifikasiData={verifikasiWargaData} wargaData={wargaData} tenantId={currentUser.tenantId || 'RW26_SMART'} isLoadingDB={isLoadingDB} setIsLoadingDB={setIsLoadingDB} showNotification={showNotification} handleFirestoreError={handleFirestoreError} currentUser={currentUser} />}
          {activeTab === 'chat' && <ChatWargaView tenantId={currentUser.tenantId || 'RW26_SMART'} currentUser={currentUser} handleFirestoreError={handleFirestoreError} currentTenant={currentTenant} />}
          {activeTab === 'ai-bot' && <AIChatBot currentUser={currentUser} />}
          {activeTab === 'keuangan' && (
            <FinansialDashboardView 
              ppobData={ppobData} setPpobData={setPpobData}
              iuranData={iuranData} setIuranData={setIuranData} 
              kasData={kasData} setKasData={setKasData} 
              wargaData={wargaData} 
              userRole={currentUser.role} 
              currentUser={currentUser} 
              getSetting={getSetting} 
              tenantId={currentUser.tenantId || 'RW26_SMART'} 
              setIsLoadingDB={setIsLoadingDB} 
              handleFirestoreError={handleFirestoreError} 
              handleFileUpload={handleFileUpload} 
              showNotification={showNotification} 
            />
          )}
          { activeTab === 'posyandu' && (
            getPlanFeatures(currentTenant?.status).posyandu ? (
              <PosyanduView 
                balitaData={balitaData} setBalitaData={setBalitaData}
                ibuHamilData={ibuHamilData} setIbuHamilData={setIbuHamilData}
                posyanduKegiatanData={posyanduKegiatanData} setPosyanduKegiatanData={setPosyanduKegiatanData}
                posbinduKegiatanData={posbinduKegiatanData} setPosbinduKegiatanData={setPosbinduKegiatanData}
                pemeriksaanBalitaData={pemeriksaanBalitaData} setPemeriksaanBalitaData={setPemeriksaanBalitaData}
                pemeriksaanPosbinduData={pemeriksaanPosbinduData} setPemeriksaanPosbinduData={setPemeriksaanPosbinduData}
                imunisasiData={imunisasiData} setImunisasiData={setImunisasiData}
                wargaData={wargaData} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'}
                setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification}
              />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Fitur Terbatas</h3>
                <p className="text-slate-500 mt-2">Fitur Kesehatan/Posyandu tersedia untuk paket PRO, PREMIUM, dan ENTERPRISE.</p>
                <button onClick={() => setShowUpgradeModal(true)} className="mt-6 px-8 py-3 bg-brand-pink text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Upgrade Paket</button>
              </div>
            )
          )}
          { activeTab === 'bank-sampah' && (
            getPlanFeatures(currentTenant?.status).bankSampah ? (
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
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Fitur Terbatas</h3>
                <p className="text-slate-500 mt-2">Fitur Bank Sampah lingkungan tersedia untuk paket PRO, PREMIUM, dan ENTERPRISE.</p>
                <button onClick={() => setShowUpgradeModal(true)} className="mt-6 px-8 py-3 bg-brand-green text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Upgrade Paket</button>
              </div>
            )
          )}
          {activeTab === 'inventaris' && <InventarisView 
             inventarisData={inventarisData} setInventarisData={setInventarisData} 
             inventarisLogs={inventarisLogs} setInventarisLogs={setInventarisLogs} 
             inventarisKategori={inventarisKategori} inventarisLokasi={inventarisLokasi} inventarisSupplier={inventarisSupplier}
             userRole={currentUser.role} currentUser={currentUser} tenantId={currentUser.tenantId || 'RW26_SMART'} 
             setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} 
             handleFileUpload={handleFileUpload}
          />}
          {activeTab === 'surat' && <SuratView suratData={suratData} setSuratData={setSuratData} wargaData={wargaData} usersData={usersData} userRole={currentUser.role} currentUser={currentUser} getSetting={getSetting} kopSettings={kopSettings} tenantId={currentUser.tenantId || 'RW26_SMART'} isLoadingDB={isLoadingDB} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} settings={settings} handleFileUpload={handleFileUpload} />}
          {activeTab === 'kop-template' && <KopTemplateManagementView currentUser={currentUser} settings={settings} showNotification={showNotification} handleFirestoreError={handleFirestoreError} />}
          {/* Updated tab 'kas' was here, merged into 'keuangan' */}

          {activeTab === 'users' && <UsersView usersData={usersData} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} tenantId={currentUser.tenantId || 'RW26_SMART'} showNotification={showNotification} settings={settings} />}
          {activeTab === 'super-admin' && <TenantsView tenantsData={tenantsData} isLoadingDB={isLoadingDB} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} />}
          {activeTab === 'pengaturan' && <PengaturanView tenantId={currentUser.tenantId || 'RW26_SMART'} currentTenant={currentTenant} wargaData={wargaData} settings={settings} userRole={currentUser.role} handleFileUpload={handleFileUpload} showNotification={showNotification} currentUser={currentUser} setActiveTab={setActiveTab} />}
          { activeTab === 'voting' && (
            getPlanFeatures(currentTenant?.status).ePemilu ? (
              <EVotingView 
                userRole={currentUser.role} 
                tenantId={currentUser.tenantId || 'RW26_SMART'}
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
                <h3 className="text-lg font-bold text-slate-800">Fitur Terbatas</h3>
                <p className="text-slate-500 mt-2">Fitur E-Voting tersedia untuk paket PRO, PREMIUM, dan ENTERPRISE.</p>
                <button onClick={() => setShowUpgradeModal(true)} className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest">Upgrade Paket</button>
              </div>
            )
          )}
          {activeTab === 'etoko' && <ETokoView 
            userRole={currentUser.role} 
            tenantId={currentUser.tenantId || 'RW26_SMART'}
            products={tokoProducts}
            orders={tokoOrders}
            currentUser={currentUser}
            wargaAuth={wargaAuth}
            handleFirestoreError={handleFirestoreError}
            handleFileUpload={handleFileUpload}
            showNotification={showNotification}
            accessMode={getPlanFeatures(currentTenant?.status).eLapak}
          />}
          {activeTab === 'analitik' && (
            getPlanFeatures(currentTenant?.status).analytics ? (
              <AnalyticsPremiumView tenantId={currentUser.tenantId} kasData={kasData} wargaData={wargaData} iuranData={iuranData} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Analitik Premium</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Visualisasi tren, prediksi iuran, dan insight aktivitas warga berbasis AI hanya tersedia di paket 🚀 PREMIUM.</p>
                <button onClick={() => setShowUpgradeModal(true)} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">Upgrade ke Premium</button>
              </div>
            )
          )}
          {activeTab === 'cctv' && (
             getPlanFeatures(currentTenant?.status).cctv ? (
               <CCTVView tenantId={currentUser.tenantId} settings={settings} onUpdateSettings={setSettings} />
             ) : (
               <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Video className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-lg font-bold">Integrasi CCTV</h3>
                 <p className="text-slate-500 mt-2">Pantauan kamera keamanan lingkungan langsung dari dashboard tersedia di paket PREMIUM.</p>
                 <button onClick={() => setShowUpgradeModal(true)} className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">Upgrade Paket</button>
               </div>
             )
          )}
          {activeTab === 'monitoring' && (
            getPlanFeatures(currentTenant?.status).multiRegion ? (
              <EnterpriseGovDashboard tenantId={currentUser.tenantId} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                 <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Globe className="w-8 h-8 text-indigo-600" />
                 </div>
                 <h3 className="text-lg font-bold">Smart Monitoring Region</h3>
                 <p className="text-slate-500 mt-2">Fitur monitoring multi-wilayah hanya tersedia untuk paket 🏛️ ENTERPRISE.</p>
              </div>
            )
          )}
          {activeTab === 'audit' && (
            getPlanFeatures(currentTenant?.status).governance === 'HIGH' ? (
              <AuditLogView logs={auditLogs} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Shield className="w-8 h-8 text-slate-400" />
                 </div>
                 <h3 className="text-lg font-bold">Governance & Audit Log</h3>
                 <p className="text-slate-500 mt-2">Transparansi tata kelola dan log aktivitas admin tersedia di paket 🏛️ ENTERPRISE.</p>
              </div>
            )
          )}
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
              <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Kirimi Sinyal Darurat?</h2>
              <p className="text-slate-600 text-base font-medium leading-relaxed mb-8 px-2">
                Tindakan ini akan memberitahukan seluruh pengurus dan warga RW26 secara instan. Gunakan hanya untuk keadaan mendesak.
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
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <RegistrationQRModal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
        tenantId={currentTenant?.id || currentUser?.tenantId || 'RW26_SMART'}
        tenantName={currentTenant?.nama || 'RT/RW Digital'}
      />
    </div>
  );
}

function RegistrationQRModal({ isOpen, onClose, tenantId, tenantName }: { isOpen: boolean, onClose: () => void, tenantId: string, tenantName: string }) {
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
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>

            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-blue-600" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">QR Self-Registration</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed px-4">
              Tunjukkan QR Code ini kepada tamu atau warga baru. Mereka cukup scan untuk mengisi formulir pendaftaran secara mandiri.
            </p>

            <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 flex items-center justify-center mb-8 mx-auto w-fit">
              <QRCodeSVG value={regUrl} size={200} level="H" includeMargin={false} />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl mb-8 flex flex-col items-center">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Target Tenant</span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-tighter">{tenantName} ({tenantId})</span>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(regUrl);
                  alert('Link pendaftaran berhasil disalin!');
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
function AnalyticsPremiumView({ tenantId, kasData, wargaData, iuranData }: any) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState('');

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          dataSummary: {
            financial: kasData.slice(-20),
            warga: wargaData.length,
            iuran: iuranData.slice(-20)
          }
        })
      });
      const result = await response.json();
      setReport(result.report);
      
      // Save to Firestore
      try {
        const reportId = `report_${new Date().getFullYear()}_${new Date().getMonth() + 1}`;
        await setDoc(doc(db, 'monthly_reports', reportId), {
          tenantId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          content: result.report,
          createdAt: new Date().toISOString(),
          generatedBy: 'AI_SYSTEM'
        });
      } catch (err) {
        console.error('Failed to save report to firestore');
      }
    } catch (e) {
      alert('Gagal membuat laporan AI');
    } finally {
      setIsGenerating(false);
    }
  };

  const data = useMemo(() => {
    // Group financial by month for predictive trend
    const monthlyTotal: Record<string, number> = {};
    kasData.forEach((k: any) => {
      const month = k.tanggal.split(' ')[1] || 'Jan';
      monthlyTotal[month] = (monthlyTotal[month] || 0) + (k.debit || 0);
    });
    return Object.entries(monthlyTotal)
      .map(([name, val]) => ({ name, actual: val, prediction: val * 1.05 + 500000 }))
      .slice(-6);
  }, [kasData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter">ANALYTICS PREDIKTIF AI</h2>
        <div className="flex gap-3">
          <button 
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            {isGenerating ? 'Sedang Menyusun...' : (
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
          <button onClick={() => setReport('')} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full">
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
             <button className="px-6 py-3 bg-white text-indigo-900 rounded-xl font-bold text-[10px] uppercase tracking-widest">Cetak PDF</button>
             <button className="px-6 py-3 bg-indigo-100/10 text-white border border-indigo-500 rounded-xl font-bold text-[10px] uppercase tracking-widest">Bagikan ke Grup Pengurus</button>
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip />
                <Area type="monotone" dataKey="prediction" stroke="#8b5cf6" strokeWidth={3} fill="#8b5cf6" fillOpacity={0.05} strokeDasharray="5 5" name="Prediksi AI" />
                <Area type="monotone" dataKey="actual" stroke="#4f46e5" strokeWidth={4} fill="#4f46e5" fillOpacity={0.1} name="Realisasi" />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
            <Bot className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
            <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-4">AI Insight Hari Ini</h4>
            <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <p className="text-sm font-bold leading-relaxed italic">"Berdasarkan tren 3 bulan terakhir, pembayaran iuran memuncak di minggu ke-2. Kami merekomendasikan pengiriman pengingat di tanggal 5 setiap bulannya untuk efisiensi tertagih +15%."</p>
              </div>
              <p className="text-[10px] font-medium opacity-60">Insight dihasilkan otomatis pukul 08:00 WIB</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Metrik Efisiensi</h4>
            <div className="space-y-4">
              {[
                { label: 'Kepatuhan Iuran', val: '92%', change: '+4.5%', color: 'emerald' },
                { label: 'Respon Admin', val: '12m', change: '-5m', color: 'blue' },
                { label: 'Kepuasan Warga', val: '4.8', change: '+0.2', color: 'amber' },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-slate-800">{stat.val}</p>
                  </div>
                  <span className={`text-[10px] font-black text-${stat.color}-600 bg-${stat.color}-50 px-2 py-1 rounded-lg`}>{stat.change}</span>
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
const logAction = async (userId: string, userName: string, action: string, resource: string, details: string, tenantId: string) => {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, 'audit_logs', logId), {
      userId,
      userName,
      action,
      resource,
      details,
      tenantId,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Audit Log failed', err);
  }
};

// --- ENTERPRISE: AUDIT LOG VIEW ---
function AuditLogView({ logs }: { logs: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">🛡️ AUDIT LOG & GOVERNANCE</h2>
        <button className="bg-slate-100 text-slate-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
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
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-[10px]">
                        {log.userName?.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      log.action.includes('HAPUS') ? 'bg-red-50 text-red-600' : 
                      log.action.includes('TAMBAH') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-medium text-slate-500 uppercase text-[10px] tracking-widest">{log.resource}</td>
                  <td className="px-8 py-6 text-slate-500 max-w-xs truncate">{log.details}</td>
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
function EnterpriseGovDashboard({ tenantId }: { tenantId: string }) {
  const [activeRegion, setActiveRegion] = useState('RW 05');
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulated hierarchical data
  const regionalData = [
    { name: 'RW 05', status: 'SANGAT AKTIF', budget: 12500000, compliance: 95, health: 88 },
    { name: 'RW 01', status: 'AKTIF', budget: 8900000, compliance: 82, health: 75 },
    { name: 'RW 02', status: 'PERLU ATENSI', budget: 4200000, compliance: 55, health: 60 },
    { name: 'RW 03', status: 'STABIL', budget: 10100000, compliance: 88, health: 92 },
  ];

  const generateRegionalInsight = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/regional-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regionsData: regionalData })
      });
      const result = await response.json();
      setInsight(result.insight);
    } catch (e) {
      alert('Gagal mengambil insight AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">🏛️ DASHBOARD KELURAHAN</h1>
            <span className="bg-indigo-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200">Enterprise</span>
          </div>
          <p className="text-slate-500 font-medium">Monitoring Real-time & Decision Support Wilayah Terintegrasi.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={generateRegionalInsight}
            disabled={isLoading}
            className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-3"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
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
          <button onClick={() => setInsight('')} className="absolute top-8 right-8 text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 font-mono">Goverment AI System v1.0</h3>
          <div className="prose prose-invert max-w-none">
             <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 leading-relaxed font-medium text-slate-300">
               {insight.split('\n').map((line, i) => (
                 <p key={i} className="mb-4">{line}</p>
               ))}
             </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {regionalData.map(reg => (
          <div 
            key={reg.name} 
            className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
              activeRegion === reg.name ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-100' : 'bg-white border-slate-50 hover:border-slate-200'
            }`}
            onClick={() => setActiveRegion(reg.name)}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${
                reg.status.includes('SANGAT') ? 'bg-emerald-50 text-emerald-600' : 
                reg.status.includes('PERLU') ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
              }`}>
                <MapPin className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                 reg.status.includes('SANGAT') ? 'bg-emerald-100 text-emerald-700' : 
                 reg.status.includes('PERLU') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {reg.status}
              </span>
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">{reg.name}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Kawasan Cluster A-C</p>
            
            <div className="space-y-4 pt-6 border-t border-slate-50">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</span>
                  <span className="font-bold text-slate-700">{reg.compliance}%</span>
               </div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600" style={{ width: `${reg.compliance}%` }}></div>
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
               <BarChart data={regionalData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip />
                   <Bar dataKey="budget" fill="#4f46e5" radius={[12, 12, 12, 12]} barSize={60}>
                     {regionalData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.status.includes('PERLU') ? '#ef4444' : '#4f46e5'} fillOpacity={0.8} />
                     ))}
                   </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <Globe className="absolute -top-12 -right-12 w-64 h-64 opacity-10" />
           <div>
             <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8 font-mono">Hierarchical Info</h3>
             <div className="space-y-8">
               <div>
                  <p className="text-4xl font-black tracking-tighter mb-2">1,248</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Warga Kelurahan</p>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-2xl font-black tracking-tighter mb-1">12</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">Total RW</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black tracking-tighter mb-1">45</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-indigo-200">Total RT</p>
                  </div>
               </div>
             </div>
           </div>
           
           <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Sistem Kelurahan Online</span>
              </div>
              <p className="text-xs font-medium text-indigo-100 leading-relaxed italic opacity-80">
                "Pantauan iuran mencapai 88.5% secara merata. Dibandingkan tahun lalu, terjadi peningkatan digitalisasi sebesar 42% di seluruh wilayah RW."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function CCTVView({ tenantId, settings, onUpdateSettings }: any) {
  const [links, setLinks] = useState<string[]>(settings?.cctvLinks || []);
  const [newLink, setNewLink] = useState('');

  const addLink = () => {
    if (!newLink) return;
    const updated = [...links, newLink];
    setLinks(updated);
    setNewLink('');
    // in real app update settings in firestore
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">🛡️ INTEGRASI CCTV LINGKUNGAN</h2>
          <p className="text-slate-500 font-medium text-sm">Pantauan real-time area strategis melalui link IP Camera / Streaming.</p>
        </div>
        <div className="flex gap-2">
           <input 
             value={newLink}
             onChange={(e) => setNewLink(e.target.value)}
             placeholder="Masukkan Link URL CCTV..."
             className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm w-full md:w-64"
           />
           <button onClick={addLink} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 flex-shrink-0">
             <Plus className="w-5 h-5" />
           </button>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
           <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Belum ada kamera yang ditautkan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {links.map((url, i) => (
            <div key={i} className="group relative bg-slate-900 aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl ring-4 ring-white">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800 animate-pulse">
                <Video className="w-12 h-12 text-slate-600" />
              </div>
              {/* Emulating CCTV embed */}
              <iframe 
                src={url} 
                className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all"
                title={`Kamera ${i+1}`}
              />
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE - CAM 0{i+1}</span>
              </div>
              <button 
                onClick={() => setLinks(links.filter((_, idx) => idx !== i))}
                className="absolute top-6 right-6 p-3 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
         <div className="p-3 bg-indigo-100 rounded-2xl flex-shrink-0">
           <Info className="w-6 h-6 text-indigo-600" />
         </div>
         <p className="text-sm font-medium text-indigo-900 opacity-80 leading-relaxed">
           <strong>Catatan Privasi:</strong> Nexapps tidak menyimpan data video di server. Tautan CCTV bersifat langsung (embed) dari penyedia masing-masing. Pastikan link yang Anda masukkan aman dan terproteksi kata sandi.
         </p>
      </div>
    </div>
  );
}


function SOSOverlay({ emergency, onResolve, onCloseLocal, canResolve }: any) {
  // Save to log when viewed (implied)
  useEffect(() => {
    if (emergency && !emergency.logged) {
      // Logic would be here in a real production app to log the view
    }
  }, [emergency]);

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let audioCtx: AudioContext | null = null;
    
    if (!isMuted) {
      const playPulse = () => {
        // Vibrate for all supported devices
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([1000, 500, 1000, 500]);
          } catch (e) {}
        }

        // Sound Notification using Web Audio API (Suara Sinyal Perang)
        try {
          if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }

          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          // Sinyal Perang: Sweeping frequency
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(300, audioCtx.currentTime); 
          oscillator.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 1.5); 
          oscillator.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 3); 

          // Volume curve
          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);
          gainNode.gain.setValueAtTime(1, audioCtx.currentTime + 2.5);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 3);

          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 3);
        } catch (e) {
          console.error("Audio API warning/not supported", e);
        }
      };

      // Play immediately
      playPulse();
      // Repeat every 3 seconds to match the siren length
      interval = setInterval(playPulse, 3000);
    } else {
      // Stop vibration if muted
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate(0); } catch(e){}
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close(); } catch(e){}
      }
    };
  }, [isMuted]);

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
                      <div className="flex flex-wrap gap-2 mt-2">
                        <p className="text-sm font-black bg-white/20 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                          {emergency.userAddress}
                        </p>
                        <p className="text-sm font-black bg-white/30 px-3 py-1.5 rounded-xl inline-block w-fit uppercase tracking-tight">
                          RT: {emergency.rt || '-'} / RW: {emergency.rw || '-'}
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

         {/* Maps Navigation Button */}
         {emergency.latitude && emergency.longitude && (
           <button 
             onClick={() => window.open(`https://www.google.com/maps?q=${emergency.latitude},${emergency.longitude}`, '_blank')}
             className="px-10 py-5 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-red-50 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
           >
             <MapPin className="w-6 h-6" />
             CEK LOKASI KEJADIAN
           </button>
         )}

         {/* Global Resolve Button */}
         {canResolve && (
            <button 
              onClick={() => onResolve(emergency.id)}
              className="px-10 py-5 bg-white text-red-600 rounded-2xl font-black uppercase text-sm w-full tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-2xl mb-4 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6 border-2 border-red-600 rounded-full" />
              STOP SOS & KEMBALI KE MENU UTAMA
            </button>
         )}

         {/* Local actions: Mute and Hide */}
         <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
           {!isMuted && (
              <button 
                onClick={() => setIsMuted(true)}
                className="px-6 py-4 bg-red-700/50  border border-red-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <BellOff className="w-5 h-5" /> Stop Suara/Getar
              </button>
           )}

         </div>
         
         <p className="mt-8 text-[10px] font-bold opacity-60 uppercase tracking-widest">
           Sinyal ini terkirim ke seluruh warga RW26 BERJUANG
         </p>
      </div>
    </motion.div>
  );
}

function ETokoView({ 
  userRole, 
  tenantId, 
  products, 
  orders, 
  currentUser, 
  wargaAuth, 
  handleFirestoreError,
  handleFileUpload,
  showNotification,
  accessMode
}: { 
  userRole: string, 
  tenantId: string, 
  products: any[], 
  orders: any[], 
  currentUser: any, 
  wargaAuth: any,
  handleFirestoreError: any,
  handleFileUpload: (file: File, folder: string) => Promise<string>,
  showNotification: any,
  accessMode?: "LIHAT" | "JUAL" | "PRIORITAS" | boolean
}) {
  const [view, setView] = useState<'buyer' | 'seller'>('buyer');
  const [activeTab, setActiveTab] = useState<'shop' | 'orders'>('shop');
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedRT, setSelectedRT] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editProdFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'TRANSFER'>('COD');
  
  // Admin states
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    stock: 0,
    category: 'Sembako',
    description: '',
    image: ''
  });

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'RW' || userRole === 'RT';
  const categories = [
    'Semua', 
    'Sembako', 
    'Rumah tangga', 
    'Makanan & minuman', 
    'Fashion', 
    'Elektronik', 
    'ATK & lainnya',
    '🔧 Servis (AC, listrik, bangunan)',
    '🧺 Laundry & kebersihan',
    '🚚 Transport / kurir',
    '🎓 Les & jasa profesional'
  ];

  const rtOptions = ['Semua', ...Array.from(new Set(products.map(p => p.rtId).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchesRT = selectedRT === 'Semua' || p.rtId === selectedRT;
    return matchesSearch && matchesCategory && matchesRT;
  });

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    showNotification(`${product.name} ditambahkan ke keranjang`, "success");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

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
      await setDoc(doc(db, 'toko_orders', orderId), {
        id: orderId,
        tenantId,
        items: cart,
        total: cartTotal,
        customerName: wargaAuth?.nama || currentUser?.name || 'Warga',
        customerId: voterId,
        phone: wargaAuth?.telepon || '-',
        address: wargaAuth?.alamat || '-',
        paymentMethod: paymentMethod,
        status: 'PENDING',
        timestamp: new Date().toISOString()
      });

      // Update stock (ideally via cloud function/batch, but here for demo)
      const batch = writeBatch(db);
      cart.forEach(item => {
        const prodRef = doc(db, 'toko_products', item.id);
        const original = products.find(p => p.id === item.id);
        if (original) {
          batch.update(prodRef, { stock: Math.max(0, (original.stock || 0) - item.qty) });
        }
      });
      await batch.commit();

      setCart([]);
      setShowCart(false);
      setActiveTab('orders');
      showNotification("Pesanan berhasil dikirim!", "success");
    } catch (err) {
      handleFirestoreError(err, 'create', 'toko_orders');
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
      await setDoc(doc(db, 'toko_products', id), {
        ...productForm,
        id,
        tenantId,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setEditingProduct(null);
      setIsAddingProduct(false);
      setProductForm({ name: '', price: 0, stock: 0, category: 'Sembako', description: '', image: '' });
      showNotification("Produk berhasil disimpan", "success");
    } catch (err) {
      handleFirestoreError(err, 'write', 'toko_products');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      await deleteDoc(doc(db, 'toko_products', id));
      showNotification("Produk dihapus", "success");
    } catch (err) {
      handleFirestoreError(err, 'delete', 'toko_products');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'toko_orders', orderId), { status });
      showNotification(`Pesanan ${status === 'COMPLETED' ? 'Selesai' : 'Dibatalkan'}`, "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'toko_orders');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter">E-LAPAK26</h2>
          <p className="text-slate-500 font-medium">Beli kebutuhan harian lebih mudah & dukung UMKM warga</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {isAdmin && (
            <div className="bg-slate-100 p-1 rounded-2xl flex border border-slate-200">
              <button 
                onClick={() => setView('buyer')} 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'buyer' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-500'}`}
              >
                Pembeli
              </button>
              <button 
                onClick={() => setView('seller')} 
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'seller' ? 'bg-white shadow-sm text-brand-blue' : 'text-slate-500'}`}
              >
                Penjual
              </button>
            </div>
          )}
          
          {view === 'buyer' && (
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

      {view === 'buyer' ? (
        <div className="space-y-8">
          {/* Navigation Tab */}
          <div className="flex border-b border-slate-200 gap-8">
            <button 
              onClick={() => setActiveTab('shop')}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'shop' ? 'text-brand-blue' : 'text-slate-400'}`}
            >
              Belanja Umum
              {activeTab === 'shop' && <motion.div layoutId="tokotab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'orders' ? 'text-brand-blue' : 'text-slate-400'}`}
            >
              Pesanan Saya
              {activeTab === 'orders' && <motion.div layoutId="tokotab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-blue rounded-full" />}
            </button>
          </div>

          {activeTab === 'shop' && (
            <>
              {/* Filter & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-brand-blue/30 transition-all font-bold"
                  />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <select 
                    value={selectedRT}
                    onChange={(e) => setSelectedRT(e.target.value)}
                    className="px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white text-slate-700 border border-slate-200 outline-none focus:border-brand-blue"
                  >
                    {rtOptions.map((rt, i) => <option key={`toko-rt-${rt}-${i}`} value={rt}>{rt === 'Semua' ? 'Semua RT' : `RT ${rt}`}</option>)}
                  </select>
                  {categories.map((c, i) => (
                    <button
                      key={`toko-cat-${c}-${i}`}
                      onClick={() => setSelectedCategory(c)}
                      className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === c ? 'bg-brand-blue text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(p => (
                  <motion.div 
                    layout
                    key={p.id} 
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl transition-all flex flex-col"
                  >
                    <div className="relative h-48 bg-slate-50 cursor-pointer" onClick={() => { setSelectedProduct(p); setShowProductModal(true); }}>
                      <img src={p.image || 'https://via.placeholder.com/300?text=Produk'} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 bg-white/90  px-3 py-1 rounded-full border border-slate-100 flex items-center gap-1">
                        <span className="text-[10px] font-black text-brand-blue uppercase">{p.category}</span>
                        <span className="text-[10px] font-bold text-slate-400">|</span>
                        <span className="text-[10px] font-bold text-slate-700">{p.rtId || 'RT?'}</span>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col" onClick={() => { setSelectedProduct(p); setShowProductModal(true); }}>
                      <h3 className="text-lg font-black text-slate-800 mb-1 cursor-pointer">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-medium mb-4 line-clamp-2">{p.description || 'Kualitas terjamin untuk warga RW 26.'}</p>
                      
                      <div className="mt-auto space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Harga</p>
                            <p className="text-xl font-black text-slate-800">Rp {p.price?.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stok</p>
                             <p className={`text-sm font-black ${p.stock <= 5 ? 'text-red-500' : 'text-slate-800'}`}>{p.stock}</p>
                          </div>
                        </div>
                        
                        <button 
                          disabled={p.stock <= 0}
                          onClick={(e) => { e.stopPropagation(); addToCart(p); }}
                          className={`w-full py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${p.stock <= 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'}`}
                        >
                          {p.stock <= 0 ? 'Stok Habis' : <><ShoppingBag className="w-4 h-4" /> Tambah Keranjang</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
                  <Package className="w-16 h-16 opacity-20 mb-4" />
                  <p className="text-sm font-black uppercase tracking-widest">Produk tidak ditemukan</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.filter(o => o.customerId === (wargaAuth?.nik || currentUser?.uid)).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${order.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800">{order.id}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {new Date(order.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 px-4">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item: any) => (
                        <span key={item.id} className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                          {item.qty}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-black text-slate-800">Rp {order.total?.toLocaleString('id-ID')}</p>
                    <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${
                      order.status === 'COMPLETED' ? 'text-green-600 border-green-200 bg-green-50' : 
                      order.status === 'CANCELLED' ? 'text-red-600 border-red-200 bg-red-50' : 
                      'text-blue-600 border-blue-200 bg-blue-50'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.customerId === (wargaAuth?.nik || currentUser?.uid)).length === 0 && (
                <div className="py-20 text-center text-slate-400">
                  <ShoppingBag className="w-16 h-16 opacity-10 mx-auto mb-4" />
                  <p className="font-bold text-sm uppercase tracking-widest">Belum ada pesanan</p>
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
              <ClipboardList className="w-6 h-6 text-brand-blue" /> Pesanan Masuk
            </h3>
            <div className="space-y-4">
              {orders.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-slate-800">{order.customerName}</h4>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>{order.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {order.id} • {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-xl font-black text-brand-blue">Rp {order.total?.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 opacity-60">Rincian Barang</p>
                    <div className="space-y-2">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm font-medium">
                          <span className="text-slate-600">{item.qty}x {item.name}</span>
                          <span className="text-slate-800">Rp {(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 gap-4">
                     <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {order.phone}</div>
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.address}</div>
                     </div>
                     {order.status === 'PENDING' && (
                       <div className="flex gap-2">
                         <button 
                           onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                           className="px-4 py-2 text-red-600 font-bold text-xs hover:bg-red-50 rounded-xl transition-all"
                         >
                           Tolak
                         </button>
                         <button 
                           onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
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
                  setProductForm({ name: '', price: 0, stock: 0, category: 'Sembako', description: '', image: '' });
                }}
                className="p-2 bg-brand-blue text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                    <img src={p.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                    <p className="text-[10px] font-black text-brand-blue uppercase">{p.price?.toLocaleString()} • Stok: {p.stock}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Keranjang Belanja</h3>
                <button onClick={() => setShowCart(false)} className="p-2 bg-slate-100 rounded-xl"><X className="w-6 h-6" /></button>
              </div>

              <div className="flex-1 overflow-auto p-8 space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={item.image || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 leading-tight">{item.name}</h4>
                      <p className="text-sm font-black text-brand-blue mb-2">Rp {item.price?.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                          <button onClick={() => updateCartQty(item.id, -1)} className="p-2 hover:bg-slate-200 transition-all"><Minus className="w-3 h-3" /></button>
                          <span className="w-8 text-center text-xs font-black">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.id, 1)} className="p-2 hover:bg-slate-200 transition-all"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <ShoppingBag className="w-20 h-20 opacity-10 mb-4" />
                    <p className="font-black uppercase tracking-widest">Keranjang Kosong</p>
                  </div>
                )}
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 space-y-6">
                <div className="space-y-2">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran</p>
                   <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => setPaymentMethod('COD')} className={`p-3 text-xs font-black uppercase rounded-xl border ${paymentMethod === 'COD' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 bg-white'}`}>COD</button>
                     <button onClick={() => setPaymentMethod('TRANSFER')} className={`p-3 text-xs font-black uppercase rounded-xl border ${paymentMethod === 'TRANSFER' ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-slate-200 bg-white'}`}>Transfer</button>
                   </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pembayaran</p>
                    <p className="text-3xl font-black text-slate-800">Rp {cartTotal.toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  disabled={cart.length === 0 || isLoading}
                  onClick={handleCheckout}
                  className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {isLoading ? 'Memproses...' : <><CreditCard className="w-5 h-5" /> Checkout Sekarang</>}
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
                <img src={selectedProduct.image || 'https://via.placeholder.com/600'} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button onClick={() => setShowProductModal(false)} className="absolute top-4 right-4 p-2 bg-slate-900/50 backdrop-blur-md rounded-full text-white hover:bg-slate-900/70 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2">{selectedProduct.name}</h2>
                <p className="text-xl font-black text-brand-blue mb-4">Rp {selectedProduct.price.toLocaleString()}</p>
                <p className="text-slate-600 mb-6">{selectedProduct.description || 'Tidak ada deskripsi tersedia.'}</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => { addToCart(selectedProduct); setShowProductModal(false); }}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                  >
                    Tambah Ke Keranjang
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Editor Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddingProduct(false)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 overflow-auto max-h-[90vh]"
          >
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-8 flex items-center gap-3">
              <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl"><Edit className="w-6 h-6" /></div>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Produk</label>
                  <input 
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    placeholder="Contoh: Beras Raja Lele"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Harga (Rp)</label>
                    <input 
                      required
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Stok</label>
                    <input 
                      required
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategori</label>
                   <select 
                     value={productForm.category}
                     onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                     className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold appearance-none cursor-pointer"
                   >
                     {categories.filter(c => c !== 'Semua').map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Foto Produk</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center group relative">
                      {productForm.image ? (
                        <>
                          {productForm.image.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-8 h-8 text-brand-blue" />
                          ) : (
                            <img src={productForm.image} className="w-full h-full object-cover" />
                          )}
                          <button 
                            type="button"
                            onClick={() => setProductForm({...productForm, image: ''})}
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
                               const url = await handleFileUpload(file, 'toko_products');
                               setProductForm(prev => ({...prev, image: url}));
                               showNotification("Foto produk berhasil diupload", "success");
                             } catch (err) {
                               console.error("Upload error in component:", err);
                             } finally {
                               setIsLoading(false);
                               if (e.target) e.target.value = '';
                             }
                           }
                         }}
                       />
                       <button 
                         type="button"
                         disabled={isLoading}
                         onClick={() => {
                           if (fileInputRef.current) {
                             fileInputRef.current.value = '';
                             fileInputRef.current.click();
                           }
                         }}
                         className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/30 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                       >
                         {isLoading ? 'Mengupload...' : <><Upload className="w-4 h-4" /> Pilih Foto Produk</>}
                       </button>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Deskripsi Singkat</label>
                  <textarea 
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full h-32 p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold resize-none"
                    placeholder="Tuliskan spesifikasi produk..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsAddingProduct(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest">Batal</button>
                  <button type="submit" disabled={isLoading} className="flex-[2] py-4 bg-brand-blue text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200">
                    {isLoading ? 'Menyimpan...' : (editingProduct ? 'Simpan Perubahan' : 'Posting Produk')}
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
  showNotification 
}: { 
  userRole: string, 
  tenantId: string, 
  candidates: any[], 
  config: any, 
  userVotes: any[], 
  currentUser: any, 
  wargaAuth: any,
  handleFirestoreError: any,
  handleFileUpload: (file: File, folder: string) => Promise<string>,
  showNotification: any
}) {
  const [electionScope, setElectionScope] = useState<'RW' | 'RT'>('RW');
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
  const [isEditingAturan, setIsEditingAturan] = useState(false);
  
  // Scope Scaffolding
  const userRt = wargaAuth?.rt || currentUser?.rt || '01';
  const scopeId = electionScope === 'RW' ? `CONFIG-RW` : `CONFIG-RT-${userRt}`;
  
  const currentAturan = config?.[scopeId]?.aturan || (electionScope === 'RW' ? config.aturan : '');
  const currentStatus = config?.[scopeId]?.status || (electionScope === 'RW' ? config.status : 'CLOSED');

  const [tempAturan, setTempAturan] = useState(currentAturan);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempAturan(currentAturan);
  }, [currentAturan]);

  // Data Filtering
  const filteredCandidates = candidates.filter(c => {
    if (electionScope === 'RW') return c.type === 'RW' || !c.type;
    return c.type === 'RT' && c.rt === userRt;
  });

  const filteredVotes = userVotes.filter(v => {
    const candidate = candidates.find(c => c.id === v.candidateId);
    if (!candidate) return false;
    if (electionScope === 'RW') return candidate.type === 'RW' || !candidate.type;
    return candidate.type === 'RT' && candidate.rt === userRt;
  });

  const voterId = wargaAuth?.nik || currentUser?.uid;
  const hasVoted = filteredVotes.some(v => v.voterId === voterId);
  const isAtLeastRW = userRole === 'ADMIN' || userRole === 'RW' || userRole === 'SUPER_ADMIN' || tenantId === 'MASTER';
  const canManage = electionScope === 'RW' ? isAtLeastRW : (isAtLeastRW || (userRole === 'RT' && userRt === (wargaAuth?.rt || currentUser?.rt)));

  const totalFilteredVotes = filteredVotes.length;

  const handleVote = async (candidateId: string) => {
    if (!voterId) {
      showNotification("Silakan login untuk dapat memberikan suara.", "error");
      return;
    }
    if (hasVoted) {
      showNotification(`Anda sudah memberikan suara untuk Pemilu ${electionScope}`, "error");
      return;
    }
    if (currentStatus !== 'OPEN') {
      showNotification("Voting sedang ditutup", "error");
      return;
    }

    setIsLoading(true);
    try {
      const voteId = `VOTE-${electionScope}-${Date.now()}-${voterId}`;
      await setDoc(doc(db, 'voting_votes', voteId), {
        id: voteId,
        candidateId,
        voterId,
        tenantId,
        scope: electionScope,
        rt: electionScope === 'RT' ? userRt : null,
        timestamp: new Date().toISOString(),
        voterName: wargaAuth?.nama || currentUser?.name || 'Warga'
      });
      showNotification(`Suara Anda untuk Pemilu ${electionScope} berhasil dikirim!`, "success");
      setShowConfirm(null);
    } catch (err) {
      handleFirestoreError(err, 'create', 'voting_votes');
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = async () => {
    if (!newCandidateName) return;
    setIsLoading(true);
    try {
      const id = `CAN-${Date.now()}`;
      await setDoc(doc(db, 'voting_candidates', id), {
        id,
        tenantId,
        type: electionScope,
        rt: electionScope === 'RT' ? userRt : null,
        name: newCandidateName,
        description: newCandidateDesc || 'Calon baru.',
        profile: newCandidateProfile || 'Belum ada profil.',
        photo: newCandidatePhoto || 'https://via.placeholder.com/150'
      });
      setNewCandidateName('');
      setNewCandidateDesc('');
      setNewCandidateProfile('');
      setNewCandidatePhoto('');
      showNotification(`Kandidat ${electionScope} berhasil ditambahkan`, "success");
    } catch (err) {
      handleFirestoreError(err, 'create', 'voting_candidates');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCandidate = async (id: string) => {
    if (!confirm("Hapus calon ini?")) return;
    try {
      await deleteDoc(doc(db, 'voting_candidates', id));
      showNotification("Calon berhasil dihapus", "success");
    } catch (err) {
      handleFirestoreError(err, 'delete', 'voting_candidates');
    }
  };

  const startEditCandidate = (c: any) => {
    setEditingCandidate(c.id);
    setEditName(c.name);
    setEditDesc(c.description);
    setEditProfile(c.profile);
    setEditPhoto(c.photo || '');
  };

  const saveEditCandidate = async (id: string) => {
    try {
      await updateDoc(doc(db, 'voting_candidates', id), {
        name: editName,
        description: editDesc,
        profile: editProfile,
        photo: editPhoto
      });
      setEditingCandidate(null);
      showNotification("Data calon diperbarui", "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'voting_candidates');
    }
  };

  const saveAturan = async () => {
    try {
      await setDoc(doc(db, 'voting_config', tenantId), {
        [scopeId]: {
          aturan: tempAturan,
          status: currentStatus,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
      setIsEditingAturan(false);
      showNotification(`Aturan Pemilu ${electionScope} diperbarui`, "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'voting_config');
    }
  };

  const toggleVotingStatus = async () => {
    const nextStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await setDoc(doc(db, 'voting_config', tenantId), {
        [scopeId]: {
          status: nextStatus,
          aturan: currentAturan
        }
      }, { merge: true });
      showNotification(`Pemilu ${electionScope} ${nextStatus === 'OPEN' ? 'Dibuka' : 'Ditutup'}`, "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'voting_config');
    }
  };

  const resetVotes = async () => {
    if (!confirm(`Hapus SEMUA suara pada Pemilu ${electionScope}? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const batch = writeBatch(db);
      filteredVotes.forEach(v => {
        batch.delete(doc(db, 'voting_votes', v.id));
      });
      await batch.commit();
      showNotification(`Semua suara Pemilu ${electionScope} berhasil direset`, "success");
    } catch (err) {
      handleFirestoreError(err, 'delete', 'voting_votes_reset');
    }
  };

  const getCandidateVotes = (id: string) => {
    return filteredVotes.filter(v => v.candidateId === id).length;
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Scope Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 mb-8 shadow-sm max-w-sm">
          <button 
            onClick={() => setElectionScope('RW')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${electionScope === 'RW' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pemilu RW
          </button>
          <button 
            onClick={() => setElectionScope('RT')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${electionScope === 'RT' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-slate-500 hover:bg-slate-50'}`}
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
              <div className={`w-2 h-2 rounded-full ${currentStatus === 'OPEN' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Status: {currentStatus === 'OPEN' ? 'Voting Berlangsung' : 'Voting Ditutup'}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex gap-2">
              <button 
                onClick={toggleVotingStatus}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStatus === 'OPEN' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}
              >
                {currentStatus === 'OPEN' ? 'Tutup Voting' : 'Buka Voting'}
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
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ketentuan Pemilihan {electionScope}</h3>
            </div>
            {canManage && (
              <button 
                onClick={() => isEditingAturan ? saveAturan() : setIsEditingAturan(true)}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${isEditingAturan ? 'bg-brand-blue text-white border-brand-blue' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
              >
                {isEditingAturan ? 'Simpan' : 'Edit'}
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
              <pre className="text-slate-600 text-sm whitespace-pre-wrap font-sans leading-relaxed">{currentAturan || 'Belum ada aturan yang ditetapkan.'}</pre>
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
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nama Lengkap Calon</label>
                  <input 
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    placeholder="Contoh: Bpk. Nama Lengkap"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motto / Deskripsi Singkat</label>
                  <input 
                    value={newCandidateDesc}
                    onChange={(e) => setNewCandidateDesc(e.target.value)}
                    placeholder="Contoh: Bersama Membangun RW 26"
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Foto / Berkas Kandidat</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-slate-200 flex items-center justify-center group relative">
                      {newCandidatePhoto ? (
                        <>
                          {newCandidatePhoto.toLowerCase().endsWith('.pdf') ? (
                            <FileText className="w-8 h-8 text-brand-blue" />
                          ) : (
                            <img src={newCandidatePhoto} className="w-full h-full object-cover" />
                          )}
                          <button 
                            type="button"
                            onClick={() => setNewCandidatePhoto('')}
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
                              const url = await handleFileUpload(file, 'voting_candidates');
                              setNewCandidatePhoto(url);
                              showNotification("Berkas berhasil diupload", "success");
                            } catch (err) {
                              console.error("Upload error in component:", err);
                            } finally {
                              setIsLoading(false);
                              if (e.target) e.target.value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                            fileInputRef.current.click();
                          }
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-brand-blue/30 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 animate-spin" /> Mengupload...
                          </span>
                        ) : (
                          <><Upload className="w-4 h-4" /> Pilih Foto / Berkas</>
                        )}
                      </button>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight ml-1">PNG, JPG, PDF (Maks. 5MB)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Visi, Misi & Profil Lengkap</label>
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
                  {isLoading ? 'Memproses...' : <><PlusCircle className="w-5 h-5" /> Daftarkan Calon</>}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCandidates.map((candidate, idx) => {
            const votes = getCandidateVotes(candidate.id);
            const percentage = totalFilteredVotes > 0 ? (votes / totalFilteredVotes) * 100 : 0;
            
            return (
              <motion.div 
                key={candidate.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-brand-blue/5 transition-all duration-500 relative flex flex-col"
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img src={candidate.photo || 'https://via.placeholder.com/400'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  
                  {/* Result Overlay */}
                  {(hasVoted || canManage) && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl flex flex-col items-center border border-white/20">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Suara</span>
                        <span className="text-2xl font-black text-brand-blue leading-none mt-1">{votes}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-2">
                       Kandidat Nomor {idx + 1}
                    </p>
                    <h4 className="text-2xl font-black text-white leading-tight mb-1 uppercase tracking-tight">{candidate.name}</h4>
                    <p className="text-xs font-medium text-white/80 line-clamp-2 italic">{candidate.description}</p>
                  </div>
                </div>

                <div className="p-8 space-y-6 flex-1 flex flex-col">
                  {/* Stats bar if voted */}
                  {hasVoted && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Persentase Suara</span>
                        <span className="text-sm font-black text-brand-blue">{percentage.toFixed(1)}%</span>
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
                      disabled={hasVoted || currentStatus !== 'OPEN'}
                      className={`w-full py-4.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                        hasVoted 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed font-bold' 
                          : currentStatus !== 'OPEN'
                          ? 'bg-red-50 text-red-300 border border-red-50 cursor-not-allowed font-bold'
                          : 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 hover:scale-[1.03] active:scale-95 font-bold'
                      }`}
                    >
                      {hasVoted ? 'Sudah Memilih' : currentStatus !== 'OPEN' ? 'Voting Ditutup' : 'Pilih Kandidat'}
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
            )
          })}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Belum Ada Kandidat</h3>
            <p className="text-slate-400 mt-2 max-w-xs mx-auto text-sm font-medium">Panitia belum mendaftarkan calon kandidat untuk Pemilu {electionScope}.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" onClick={() => setShowConfirm(null)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative z-10 border border-white/20"
          >
            <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Vote className="w-10 h-10 text-brand-blue" />
            </div>
            <h3 className="text-3xl font-black text-slate-800 text-center uppercase tracking-tighter mb-4 leading-none">Konfirmasi Suara</h3>
            <p className="text-center text-slate-500 text-base font-medium mb-10 px-4">
              Apakah Anda yakin ingin memberikan suara untuk <span className="text-brand-blue font-bold">{candidates.find(c => c.id === showConfirm)?.name}</span> pada Pemilu {electionScope}?
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleVote(showConfirm)}
                disabled={isLoading}
                className="w-full py-5 bg-brand-blue text-white rounded-2.5xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-brand-blue/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 font-bold"
              >
                {isLoading ? <Clock className="w-5 h-5 animate-spin mx-auto" /> : 'Ya, Saya Yakin'}
              </button>
              <button 
                onClick={() => setShowConfirm(null)}
                className="w-full py-5 bg-slate-50 text-slate-600 rounded-2.5xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all font-bold"
              >
                Mungkin Nanti
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Pilihan Anda bersifat Rahasia & Anonim
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

const QuotaProgress = ({ label, current, max, color = 'blue', isText = false }: { label: string, current: any, max: any, color?: string, isText?: boolean }) => {
  const percentage = isText ? 100 : Math.min(100, (current / max) * 100);
  const colorMap: Record<string, string> = {
    blue: 'bg-brand-blue',
    pink: 'bg-brand-pink',
    yellow: 'bg-brand-yellow',
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600'
  };
  
  return (
    <div className="space-y-1.5 flex-1">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
        <span className={`text-[10px] font-black ${isText ? 'text-indigo-600' : 'text-slate-600'}`}>
          {isText ? current : <>{current} / <span className="text-slate-400">{max}</span></>}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${colorMap[color] || 'bg-brand-blue'}`}
        />
      </div>
    </div>
  );
};

function DashboardView({ 
  kasData, 
  wargaData, 
  suratData, 
  iuranData, 
  emergenciesData, 
  handleTriggerSOS, 
  userRole, 
  setActiveTab, 
  posyanduKegiatanData, 
  inventarisData, 
  sampahSetoranData, 
  bukuTamuData, 
  verifikasiWargaData, 
  sampahTarikSaldoData,
  votingConfig,
  userVotes,
  tokoOrders,
  handleLinkToWarga,
  currentTenant,
  setShowUpgradeModal,
  setShowQRModal
}: { 
  kasData: any[], 
  wargaData: any[], 
  suratData: any[], 
  iuranData: any[], 
  emergenciesData: any[], 
  handleTriggerSOS: () => void, 
  userRole: string, 
  setActiveTab: (tab: string) => void, 
  posyanduKegiatanData: any[], 
  inventarisData: any[], 
  sampahSetoranData: any[], 
  bukuTamuData: any[], 
  verifikasiWargaData: any[], 
  sampahTarikSaldoData: any[],
  votingConfig: any,
  userVotes: any[],
  tokoOrders: any[],
  handleLinkToWarga: (nik: string, pin: string) => void,
  currentTenant: any,
  setShowUpgradeModal: (v: boolean) => void,
  setShowQRModal: (v: boolean) => void
}) {
  const [kasPeriod, setKasPeriod] = useState('yearly');
  const [piePeriod, setPiePeriod] = useState('30days');
  const [linkForm, setLinkForm] = useState({ nik: '', pin: '' });

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

  // STATS CALCULATION
  const totalWarga = wargaData.length;
  const uniqueKK = new Set(wargaData.map((w: any) => w.kk).filter(kk => kk)).size;
  const kepalaKeluarga = uniqueKK;
  const saldoTotal = kasData.reduce((acc, curr) => acc + (curr.debit || 0) - (curr.kredit || 0), 0);
  const suratPending = suratData.filter(s => s.status === 'Diajukan').length;

  // Finance calculations for AreaChart
  const yearContext = "2026"; // Contextual year for this app

  const dataYearly = months.map(m => {
    const monthlyData = kasData.filter(k => k.tanggal.includes(m.label));
    return {
      name: m.label,
      masuk: monthlyData.reduce((acc, curr) => acc + (curr.debit || 0), 0),
      keluar: monthlyData.reduce((acc, curr) => acc + (curr.kredit || 0), 0)
    };
  });

  const getMonthlyDetailData = (monthId: string) => {
    const monthIdx = months.findIndex(m => m.id === monthId);
    if (monthIdx === -1) return [];
    
    const daysInMonth = new Date(parseInt(yearContext), monthIdx + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayPrefix = day < 10 ? `0${day}` : `${day}`;
      const filterStr = `${dayPrefix} ${monthId}`;
      const dailyData = kasData.filter(k => k.tanggal.startsWith(filterStr));
      return {
        name: dayPrefix,
        masuk: dailyData.reduce((acc, curr) => acc + (curr.debit || 0), 0),
        keluar: dailyData.reduce((acc, curr) => acc + (curr.kredit || 0), 0)
      };
    });
  };

  const currentChartData = kasPeriod === 'yearly' 
    ? dataYearly 
    : getMonthlyDetailData(kasPeriod);

  // Demographic calculations
  const totalLaki = wargaData.filter(w => w.jk === 'Laki-Laki').length;
  const totalPerempuan = wargaData.filter(w => w.jk === 'Perempuan').length;
  
  const getAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const ages = wargaData.map(w => getAge(w.tglLahir));
  const totalBalita = ages.filter(a => a <= 5).length;
  const totalAnak = ages.filter(a => a > 5 && a <= 12).length;
  const totalRemaja = ages.filter(a => a > 12 && a <= 18).length;
  const totalDewasa = ages.filter(a => a > 18 && a <= 60).length;
  const totalLansia = ages.filter(a => a > 60).length;

  const dataByRT = useMemo(() => {
    const rts: Record<string, number> = {};
    wargaData.forEach(w => {
      const rt = w.rt || '??';
      rts[rt] = (rts[rt] || 0) + 1;
    });
    return Object.entries(rts)
      .map(([name, value]) => ({ name: `RT ${name}`, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wargaData]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

  // Recent activity calculation
  const recentActivities = [
    ...kasData.slice(0, 10).map(k => ({ 
      title: k.tipe === 'Masuk' ? 'Pemasukan Keuangan' : 'Pengeluaran Keuangan',
      desc: k.keterangan || k.transaksi,
      date: k.tanggal,
      amount: k.debit || k.kredit,
      type: k.tipe === 'Masuk' ? 'in' : 'out',
      dateObj: new Date(k.tanggal)
    })),
    ...suratData.slice(0, 10).map(s => ({ 
      title: 'Surat Pengantar',
      desc: `${s.pemohon} - ${s.jenisSurat} (${s.keperluan || '-'})`,
      date: s.tanggal,
      status: s.status,
      type: 'doc',
      dateObj: new Date(s.tanggal)
    })),
    ...bukuTamuData.slice(0, 10).map(b => ({ 
      title: 'Aktivitas Buku Tamu',
      desc: `${b.nama} berkunjung ke ${b.tujuan} (${b.keperluan || 'Tamu'})`,
      date: b.waktuDatang ? new Date(b.waktuDatang).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      status: b.status,
      type: 'tamu',
      dateObj: new Date(b.waktuDatang || 0)
    })),
    ...posyanduKegiatanData.slice(0, 10).map(p => ({
      title: 'Kesehatan Warga',
      desc: `Kegiatan: ${p.namaKegiatan || 'Pemeriksaan Rutin'} di ${p.lokasi || 'Posyandu'}`,
      date: p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      status: 'Selesai',
      type: 'kesehatan',
      dateObj: new Date(p.tanggal || 0)
    })),
    ...sampahSetoranData.slice(0, 10).map(s => ({
      title: 'Bank Sampah',
      desc: `Setoran ${s.namaKategori || 'Sampah'}: ${s.namaNasabah || 'Nasabah'} (${s.berat}kg)`,
      date: s.tanggal ? new Date(s.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      amount: s.total,
      type: 'sampah_in',
      dateObj: new Date(s.tanggal || 0)
    })),
    ...userVotes.slice(-10).map(v => ({
      title: 'E-Pemilu RW 26',
      desc: `${v.voterName} telah memberikan suara`,
      date: v.timestamp ? new Date(v.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      status: 'Suara Masuk',
      type: 'voting',
      dateObj: new Date(v.timestamp || 0)
    })),
    ...tokoOrders.slice(-10).map(o => ({
      title: 'Pesanan E-LAPAK26',
      desc: `${o.customerName} memesan ${o.items.length} item`,
      date: o.timestamp ? new Date(o.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-',
      amount: o.total,
      type: 'toko',
      dateObj: new Date(o.timestamp || 0)
    })),
    {
      title: 'Kesehatan Warga',
      desc: 'Update: Vaksinasi booster warga RT 02 selesai',
      date: 'Hari Ini',
      type: 'kesehatan',
      dateObj: new Date()
    }
  ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 15);

  // Frequency Stats for Activity Bar Chart
  const getActData = (period: string) => {
    const filteredSurat = period === 'yearly' ? suratData : suratData.filter(s => s.tanggal.includes('Apr'));
    const filteredKas = period === 'yearly' ? kasData : kasData.filter(k => k.tanggal.includes('Apr'));

    return [
      { name: 'Pemasukan Kas', value: filteredKas.filter(k => k.tipe === 'Masuk').length * 15 },
      { name: 'Surat Pengantar', value: filteredSurat.length * 8 },
      { name: 'Pengeluaran Kas', value: filteredKas.filter(k => k.tipe === 'Keluar').length * 12 },
      { name: 'Data Warga', value: wargaData.length * 2 },
    ];
  };

  const pieData30Days = getActData('30days');
  const pieDataYearly = getActData('yearly');

  return (
    <div className="space-y-6">
      {/* SOS Alert & Plan Info */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        {activeSOS ? (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setActiveTab('dashboard')}
            className="flex-1 bg-red-600 p-6 rounded-[2.5rem] shadow-red-200 shadow-xl border-4 border-red-500 overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
              <Siren size={80} />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center animate-pulse border border-white/30">
                <Siren className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 text-white">DARURAT: {activeSOS.lokasi || 'LINGKUNGAN'}</h3>
                <p className="font-bold text-white/90 text-xs uppercase tracking-widest">{activeSOS.keterangan || 'Bantuan segera dibutuhkan.'}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex-1 p-6 rounded-[2.5rem] border-2 flex flex-col sm:flex-row items-center gap-6 shadow-sm overflow-hidden relative ${
              currentTenant?.status === 'PRO' ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border flex-shrink-0 ${
              currentTenant?.status === 'ENTERPRISE' || currentTenant?.status === 'GOV' || currentTenant?.status === 'DIAMOND' 
                ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-200' :
              currentTenant?.status === 'PREMIUM' 
                ? 'bg-indigo-900 border-indigo-800 shadow-lg shadow-indigo-200' :
              currentTenant?.status === 'PRO' 
                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100' : 
              'bg-brand-blue/5 border-brand-blue/10'
            }`}>
              <Zap className={`w-7 h-7 ${currentTenant?.status === 'PRO' || currentTenant?.status === 'PREMIUM' || currentTenant?.status === 'ENTERPRISE' || currentTenant?.status === 'GOV' ? 'text-white' : 'text-brand-blue'}`} />
            </div>
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Status Paket</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                  currentTenant?.status === 'ENTERPRISE' || currentTenant?.status === 'GOV' || currentTenant?.status === 'DIAMOND' ? 'bg-slate-900 text-white border-slate-800 shadow-slate-200' :
                  currentTenant?.status === 'PREMIUM' ? 'bg-indigo-900 text-white border-indigo-700 shadow-indigo-200' :
                  currentTenant?.status === 'PRO' ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-100' : 
                  currentTenant?.status === 'BASIC' ? 'bg-amber-100 text-amber-600 border-amber-200' : 
                  'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {currentTenant?.status === 'ENTERPRISE' || currentTenant?.status === 'GOV' || currentTenant?.status === 'DIAMOND' ? '🏛️ ENTERPRISE SYSTEM' : 
                   currentTenant?.status === 'PREMIUM' ? '🚀 PREMIUM PLAN (Unlimited AI)' : 
                   currentTenant?.status === 'PRO' ? '💎 STAR PRO PLAN' : 
                   currentTenant?.status === 'BASIC' ? '⚡ BASIC PLAN' : '🛡️ FREE TRIAL'}
                </span>
                {(currentTenant?.status === 'PRO' || currentTenant?.status === 'PREMIUM' || currentTenant?.status === 'ENTERPRISE') && (
                  <span className="text-[10px] font-black text-emerald-600 animate-pulse flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> AKTIF
                  </span>
                )}
              </div>
              <div className="flex flex-col lg:flex-row gap-6">
                <QuotaProgress 
                  label="Warga Terdaftar" 
                  current={totalWarga} 
                  max={getPlanFeatures(currentTenant?.status)?.maxWarga || 50} 
                  color="blue"
                />
                <QuotaProgress 
                  label="Otoritas" 
                  current={getPlanFeatures(currentTenant?.status)?.multiRT ? 'RW (Multi RT)' : 'RT (Single)'} 
                  max={getPlanFeatures(currentTenant?.status)?.multiRT ? 'Multi-RT' : 'Single RT'} 
                  color={currentTenant?.status === 'PRO' ? 'indigo' : 'pink'}
                  isText
                />
              </div>
            </div>
          </motion.div>
        )}

        {!(currentTenant?.status === 'PRO' || currentTenant?.status === 'PREMIUM' || currentTenant?.status === 'ENTERPRISE' || currentTenant?.status === 'GOV') && (
          <motion.div 
            whileHover={{ y: -4 }}
            className="md:w-72 bg-gradient-to-br from-indigo-600 to-brand-blue p-6 rounded-[2.5rem] text-white flex flex-col justify-between shadow-xl shadow-indigo-200 relative overflow-hidden group border-4 border-white/10"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">🔥 Boost System</p>
              <h4 className="font-black text-lg leading-tight mb-4 tracking-tighter">UPGRADE KE PRO UNTUK FITUR OTOMATIS</h4>
            </div>
            <button 
              onClick={() => setActiveTab('super-admin')}
              className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg relative z-10"
            >
              UPGRADE SEKARANG
            </button>
          </motion.div>
        )}
      </div>

      {userRole === 'Viewer' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-blue to-blue-700 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-200/50 text-white mb-10 relative overflow-hidden group border-4 border-white/10"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-pink/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 mb-6 transition-all">
                <ShieldCheck className="w-5 h-5 text-brand-yellow" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Verifikasi Identitas Warga</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-6 leading-[1.1]">Hubungkan Akun Google dengan Profil Warga</h2>
              <p className="text-blue-100 font-medium mb-8 leading-relaxed text-sm sm:text-base opacity-90">
                Halo! Anda masuk sebagai Tamu (Akses Terbatas). Untuk mengaktifkan fitur layanan lengkap seperti **Surat Digital**, **Keuangan**, dan **E-Lapak26**, silakan tautkan akun Google ini dengan data kependudukan Anda.
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-blue-200">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-blue bg-white/20 flex items-center justify-center text-[10px] backdrop-blur-sm">👤</div>)}
                </div>
                <p>+50 Warga sudah menautkan akun mereka</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 shadow-inner">
               <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-blue-100 uppercase tracking-widest mb-3 ml-1">NIK atau Nama Lengkap (Sesuai KTP)</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <input 
                        value={linkForm.nik}
                        onChange={(e) => setLinkForm({...linkForm, nik: e.target.value})}
                        placeholder="Contoh: 3201..."
                        className="w-full pl-12 pr-6 py-5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:bg-white/20 focus:border-white/40 outline-none transition-all font-bold text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-blue-100 uppercase tracking-widest mb-3 ml-1">Kunci Keamanan (No. KK atau No. HP)</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300" />
                      <input 
                        type="password"
                        value={linkForm.pin}
                        onChange={(e) => setLinkForm({...linkForm, pin: e.target.value})}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-6 py-5 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:bg-white/20 focus:border-white/40 outline-none transition-all font-bold text-base"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLinkToWarga(linkForm.nik, linkForm.pin)}
                    className="w-full py-5 bg-brand-yellow text-slate-900 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-2xl hover:bg-yellow-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
                  >
                    <span>Tautkan & Aktifkan Fitur!</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-blue-200 mt-4 font-bold opacity-60">
                    Data Anda aman & terenkripsi oleh sistem keamanan Nexapps.
                  </p>
               </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Quick Access Shortcuts */}
      <div className="flex xl:grid xl:grid-cols-10 gap-3 px-1 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        {[
          { id: 'sos', label: 'SOS', icon: Siren, color: 'brand-pink', bg: 'soft-pink', action: handleTriggerSOS, minPlan: 'PREMIUM' },
          { id: 'warga', label: 'WARGA', icon: Users, color: 'brand-blue', bg: 'soft-blue', action: () => setActiveTab('warga') },
          { id: 'buku-tamu', label: 'TAMU', icon: BookCopy, color: 'teal-500', bg: 'teal-50', action: () => setActiveTab('buku-tamu') },
          { id: 'self-qr', label: 'QR MANDIRI', icon: QrCode, color: 'blue-600', bg: 'blue-50', action: () => setShowQRModal(true) },
          { id: 'keuangan', label: 'KEUANGAN', icon: CreditCard, color: 'brand-blue', bg: 'soft-blue', action: () => setActiveTab('keuangan'), minPlan: 'BASIC' },
          { id: 'sampah', label: 'BANK SAMPAH', icon: Recycle, color: 'brand-green', bg: 'soft-green', action: () => setActiveTab('bank-sampah'), minPlan: 'PRO' },
          { id: 'kesehatan', label: 'Kesehatan', icon: Baby, color: 'brand-pink', bg: 'soft-pink', action: () => setActiveTab('posyandu'), minPlan: 'PRO' },
          { id: 'inventaris', label: 'INVENTARIS', icon: Package, color: 'brand-purple', bg: 'soft-purple', action: () => setActiveTab('inventaris') },
          { id: 'surat', label: 'SURAT', icon: FileText, color: 'cyan-500', bg: 'cyan-50', action: () => setActiveTab('surat'), minPlan: 'BASIC' },
          { id: 'voting', label: 'E-PEMILU', icon: Vote, color: 'brand-yellow', bg: 'soft-yellow', action: () => setActiveTab('voting'), minPlan: 'PRO' },
          { id: 'toko', label: 'E-LAPAK26', icon: ShoppingBag, color: 'orange-500', bg: 'orange-50', action: () => setActiveTab('etoko'), minPlan: 'BASIC' },
          { id: 'verifikasi', label: 'VERIFIKASI', icon: ShieldCheck, color: 'emerald-500', bg: 'soft-green', action: () => setActiveTab('verifikasi') },
          { id: 'chat', label: 'CHAT', icon: MessageSquare, color: 'blue-500', bg: 'blue-50', action: () => setActiveTab('chat'), minPlan: 'BASIC' },
          { id: 'ai-bot', label: 'AI ASISTEN', icon: Bot, color: 'indigo-500', bg: 'indigo-50', action: () => setActiveTab('ai-bot'), minPlan: 'PREMIUM' },
        ].map(item => {
          const planConfig = getPlanFeatures(currentTenant?.status);
          const isTRIAL = currentTenant?.status !== 'BASIC' && currentTenant?.status !== 'PRO' && currentTenant?.status !== 'PREMIUM' && currentTenant?.status !== 'ENTERPRISE';
          const isAtLeastBASIC = !isTRIAL;
          const isAtLeastPRO = currentTenant?.status === 'PRO' || currentTenant?.status === 'PREMIUM' || currentTenant?.status === 'ENTERPRISE';
          const isAtLeastPREMIUM = currentTenant?.status === 'PREMIUM' || currentTenant?.status === 'ENTERPRISE';
          
          const isLocked = item.minPlan === 'BASIC' ? !isAtLeastBASIC :
                         item.minPlan === 'PRO' ? !isAtLeastPRO :
                         item.minPlan === 'PREMIUM' ? !isAtLeastPREMIUM : 
                         item.minPlan === 'ENTERPRISE' ? currentTenant?.status !== 'ENTERPRISE' : false;

          return (
            <button 
              key={item.id}
              onClick={() => isLocked ? setShowUpgradeModal(true) : item.action()}
              className={`flex-shrink-0 w-24 xl:w-auto snap-start bg-white/80 p-4 rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/50 transition-all flex flex-col items-center justify-center gap-3 group active:scale-95 ${isLocked ? 'grayscale opacity-50' : ''}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-${item.bg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner relative`}>
                <item.icon className={`w-8 h-8 text-${item.color}`} />
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-900/40 rounded-2xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-xl shadow-slate-200/40 flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute right-4 top-4 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl group-hover:bg-brand-blue/10 transition-colors flex items-center justify-center text-white">
            <div className="w-10 h-10 opacity-10 -rotate-12 group-hover:rotate-0 group-hover:opacity-20 transition-all duration-500">
              <AppLogo size={10} className="w-full h-full" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Total Warga</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-soft-blue flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 leading-none mb-1">
                {totalWarga}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">KK: {kepalaKeluarga} Terdaftar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-xl shadow-slate-200/40 flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute right-4 top-4 w-24 h-24 bg-brand-green/5 rounded-full blur-2xl group-hover:bg-brand-green/10 transition-colors flex items-center justify-center text-white">
            <div className="w-10 h-10 opacity-10 -rotate-12 group-hover:rotate-0 group-hover:opacity-20 transition-all duration-500">
              <AppLogo size={10} className="w-full h-full" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Saldo Kas RW</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-soft-green flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-brand-green" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800 leading-none mb-1">
                Rp {formatRupiah(saldoTotal)}
              </p>
              <p className="text-[10px] font-bold text-brand-green uppercase tracking-tighter animate-pulse">Sinkronisasi Realtime</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-xl shadow-slate-200/40 flex flex-col justify-center relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute right-4 top-4 w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl group-hover:bg-brand-pink/10 transition-colors flex items-center justify-center text-white">
            <div className="w-10 h-10 opacity-10 -rotate-12 group-hover:rotate-0 group-hover:opacity-20 transition-all duration-500">
              <AppLogo size={10} className="w-full h-full" />
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Permohonan Surat</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-soft-pink flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand-pink" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 leading-none mb-1">
                {suratPending}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Butuh Persetujuan</p>
            </div>
          </div>
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
                data={currentChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMasuk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#94a3b8'}} />
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

      {/* PRO Analytics Section */}
      {getPlanFeatures(currentTenant?.status).analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-[3.5rem] border border-indigo-100 shadow-2xl shadow-indigo-100/30 overflow-hidden relative mb-6"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
            <BarChart3 size={180} className="text-indigo-600" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                Distribusi Multi-RT (RW Monitoring)
              </h3>
              <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-2">Data Real-time Agregasi Lingkungan • Pro Plan Active</p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-[2rem] border border-slate-100">
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total RT</p>
                <p className="text-xl font-black text-indigo-600">{dataByRT.length}</p>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Iuran Kolektif</p>
                <p className="text-xl font-black text-emerald-600">82%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            <div className="lg:col-span-1 h-[280px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataByRT}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dataByRT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Populasi</p>
                <p className="text-3xl font-black text-slate-800">{totalWarga}</p>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dataByRT.map((rt, idx) => (
                <div key={rt.name} className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{rt.name}</span>
                      </div>
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                        {Math.round((rt.value / totalWarga) * 100)}%
                      </span>
                   </div>
                   <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-black text-slate-800 leading-none mb-1">{rt.value}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Jiwa Terdata</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter mb-0.5">Rp {formatRupiah(Math.floor(Math.random() * 5000000) + 1000000)}</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimasi Kas</p>
                        </div>
                      </div>
                   </div>
                   <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden border border-white">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(rt.value / totalWarga) * 100}%` }}
                        className="h-full transition-all" 
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                      />
                   </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Aktivitas Terbaru Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <span className="bg-blue-600 w-1.5 h-4 rounded-full mr-2"></span>
          Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          {recentActivities.length > 0 ? recentActivities.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).slice(0, 8).map((act: any, idx) => (
            <div key={`recent-act-${act.type}-${act.date}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  ['in', 'sampah_in'].includes(act.type) ? 'bg-green-50 text-green-600' : 
                  ['out', 'sampah_out'].includes(act.type) ? 'bg-red-50 text-red-600' : 
                  act.type === 'doc' ? 'bg-blue-50 text-blue-600' :
                  act.type === 'verifikasi' ? 'bg-emerald-50 text-emerald-600' :
                  act.type === 'kesehatan' ? 'bg-pink-50 text-pink-600' :
                  act.type === 'tamu' ? 'bg-orange-50 text-orange-600' :
                  act.type === 'toko' ? 'bg-amber-50 text-amber-600' :
                  act.type === 'voting' ? 'bg-purple-50 text-purple-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {['in', 'sampah_in'].includes(act.type) ? <PlusCircle className="w-4 h-4" /> : 
                   ['out', 'sampah_out'].includes(act.type) ? <MinusCircle className="w-4 h-4" /> : 
                   act.type === 'doc' ? <FileText className="w-4 h-4" /> :
                   act.type === 'verifikasi' ? <ShieldCheck className="w-4 h-4" /> :
                   act.type === 'kesehatan' ? <Baby className="w-4 h-4" /> :
                   act.type === 'tamu' ? <UserCheck className="w-4 h-4" /> :
                   act.type === 'toko' ? <ShoppingBag className="w-4 h-4" /> :
                   act.type === 'voting' ? <Vote className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{act.title}</p>
                  <p className="text-[10px] text-slate-400">{act.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${
                  ['in', 'sampah_in'].includes(act.type) ? 'text-green-600' : 
                  ['out', 'sampah_out'].includes(act.type) ? 'text-red-600' : 
                  'text-slate-600'
                }`}>
                  {act.amount !== undefined ? `Rp ${new Intl.NumberFormat('id-ID').format(act.amount)}` : (act.status || '-')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{act.date}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <History className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-slate-500 font-bold text-sm">Belum ada aktivitas</p>
              <p className="text-slate-400 text-xs mt-1">Aktivitas terbaru akan muncul di sini</p>
            </div>
          )}
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
    <div className="fixed inset-0 bg-slate-900/60  flex justify-center items-center z-[100] p-4 print:hidden">
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

function BukuTamuView({ bukuTamuData, setBukuTamuData, wargaData = [], currentUser, tenantId, handleFirestoreError, showNotification }: { bukuTamuData: any[], setBukuTamuData: any, wargaData: any[], currentUser: any, tenantId: string, handleFirestoreError: any, showNotification: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'registrasi' | 'log'>('monitor');
  const [showQRModal, setShowQRModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraOpen, setCameraOpen] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const webcamRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    noHp: '',
    tujuan: '',
    keperluan: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'buku_tamu'), where('tenantId', '==', tenantId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBukuTamuData(data);
    }, (error) => handleFirestoreError(error, 'list', 'buku_tamu'));
    return () => unsubscribe();
  }, [tenantId]);

  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      setCameraOpen(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.tujuan) {
      showNotification('Nama dan Tujuan wajib diisi', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const guestId = `GUEST-${Date.now()}`;
      const newEntry = {
        ...formData,
        id: guestId,
        tenantId,
        fotoUrl: photo || '',
        waktuDatang: new Date().toISOString(),
        status: 'Bertamu',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'buku_tamu', guestId), newEntry);
      showNotification('Tamu berhasil didaftarkan');
      setActiveSubTab('monitor');
      setFormData({ nama: '', alamat: '', noHp: '', tujuan: '', keperluan: '' });
      setPhoto(null);
      setCameraOpen(true);
    } catch (error) {
      handleFirestoreError(error, 'create', 'buku_tamu');
    } finally {
      setIsLoading(false);
    }
  };

  const markFinished = async (id: string) => {
    try {
      await updateDoc(doc(db, 'buku_tamu', id), {
        status: 'Selesai',
        waktuKeluar: new Date().toISOString(),
      });
      showNotification('Kunjungan tamu berakhir');
    } catch (error) {
      handleFirestoreError(error, 'update', 'buku_tamu');
    }
  };

  const exportToExcel = () => {
    const dataToExport = bukuTamuData.map(item => ({
      'Nama Tamu': item.nama,
      'No HP': item.noHp,
      'Alamat': item.alamat,
      'Tujuan': item.tujuan,
      'Keperluan': item.keperluan,
      'Waktu Datang': new Date(item.waktuDatang).toLocaleString('id-ID'),
      'Waktu Keluar': item.waktuKeluar ? new Date(item.waktuKeluar).toLocaleString('id-ID') : '-',
      'Status': item.status
    }));
    
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Log Buku Tamu");
    XLSX.writeFile(wb, `Buku_Tamu_${tenantId}_${new Date().toLocaleDateString()}.xlsx`);
    showNotification('Data berhasil diekspor ke Excel');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Log Buku Tamu - ${tenantId}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Periode: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Nama", "Tujuan", "Waktu Datang", "Status"];
    const tableRows: any[] = [];

    bukuTamuData.forEach(item => {
      const guestData = [
        item.nama,
        item.tujuan,
        new Date(item.waktuDatang).toLocaleString('id-ID'),
        item.status
      ];
      tableRows.push(guestData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });
    doc.save(`Buku_Tamu_${tenantId}.pdf`);
    showNotification('Data berhasil diekspor ke PDF');
  };

  const today = new Date().toISOString().split('T')[0];
  const guestsToday = bukuTamuData.filter(item => item.waktuDatang.startsWith(today)).length;
  const activeGuests = bukuTamuData.filter(item => item.status === 'Bertamu').length;

  const filteredData = bukuTamuData.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tujuan.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.waktuDatang).getTime() - new Date(a.waktuDatang).getTime());

  return (
    <div className="space-y-6">
      {/* Header with Sub-Tabs */}
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <BookCopy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">Buku Tamu Digital</h1>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase">Intelligence Security Monitor v2.0</p>
          </div>
        </div>

        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'monitor', label: 'CCTV Monitor', icon: Monitor },
            { id: 'registrasi', label: 'Registrasi Tamu', icon: UserPlus },
            { id: 'log', label: 'Log Aktivitas', icon: History }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeSubTab === tab.id ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline uppercase">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all bg-amber-50 text-amber-600 hover:bg-amber-100 ml-1 border border-amber-100 shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline uppercase">Self-Scan QR</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-8 max-w-sm w-full shadow-2xl relative border-[6px] border-amber-400"
            >
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white shadow-xl rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:rotate-90 transition-all border border-slate-100"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center p-2">
                <div className="w-20 h-20 bg-amber-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-amber-50">
                  <QrCode className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-1 uppercase tracking-tight">QR BUKU TAMU</h3>
                <p className="text-[10px] font-black text-amber-500 mb-6 uppercase tracking-[0.3em]">Mandiri Digital v1.0</p>
                
                <div className="bg-white p-6 rounded-[2.5rem] mb-6 flex justify-center shadow-2xl ring-1 ring-slate-100">
                  <GuestBookQRCode tenantId={tenantId} />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
                  <p className="text-[10px] font-black text-slate-500 uppercase leading-relaxed text-center">
                    Tamu dapat memindai kode ini untuk mengisi buku tamu secara mandiri tanpa harus menyentuh monitor admin.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => window.print()}
                    className="py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                  >
                    Cetak
                  </button>
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all font-black"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            {activeSubTab === 'monitor' && (
              <motion.div 
                key="monitor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                {/* CCTV Simulation Feed */}
                <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl group">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1}
                    className="w-full h-full object-cover opacity-80"
                    videoConstraints={{ facingMode: "user" }}
                    disablePictureInPicture={true}
                    forceScreenshotSourceSize={false}
                    imageSmoothing={true}
                    mirrored={false}
                    onUserMedia={() => {}}
                    onUserMediaError={() => {}}
                  />
                  
                  {/* CCTV Overlays */}
                  <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                            <span className="text-white text-sm font-black font-mono tracking-widest uppercase">REC</span>
                          </div>
                          <span className="text-green-500 text-[10px] font-bold font-mono">CAM_ENTRANCE_01</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-white/60 text-xs font-mono">{new Date().toLocaleTimeString()}</span>
                        <div className="text-white/40 text-[10px] font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-[10px] font-mono border border-white/10">AF: LOCKED</div>
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white/80 text-[10px] font-mono border border-white/10">ISO: AUTO</div>
                      </div>
                      <div className="text-white/30 text-[10px] font-mono uppercase tracking-[0.3em]">SmartRW Cloud Security System</div>
                    </div>

                    {/* Scanning Line Animation */}
                    <div className="absolute left-0 right-0 top-0 h-[2px] bg-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-[scan_4s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/30">
                      <UserCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Tamu Saat Ini</h4>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-white leading-none">{activeGuests}</p>
                        <span className="text-green-500 text-xs font-bold uppercase tracking-tighter">Personel</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-600/20 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/30">
                      <History className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Hari Ini</h4>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-black text-white leading-none">{guestsToday}</p>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-tighter">Registrasi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'registrasi' && (
              <motion.div 
                key="registrasi"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white p-10 rounded-[3rem] shadow-2xl border border-blue-50"
              >
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Registrasi Tamu</h3>
                      <p className="text-slate-400 font-bold text-xs">Lengkapi formulir untuk mencatat kedatangan tamu</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Pilih Warga (Auto-fill)</label>
                        <select 
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none cursor-pointer"
                          onChange={(e) => {
                            const selectedWarga = wargaData.find(w => w.id === e.target.value);
                            if (selectedWarga) {
                                setFormData({
                                    ...formData,
                                    nama: selectedWarga.nama || '',
                                    noHp: selectedWarga.hp || '',
                                    alamat: selectedWarga.blok || ''
                                });
                            }
                          }}
                        >
                            <option value="">-- Pilih Warga --</option>
                            {wargaData.map(w => (
                                <option key={w.id} value={w.id}>{w.nama} - {w.blok}</option>
                            ))}
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nama Lengkap</label>
                          <input 
                            type="text" 
                            required
                            value={formData.nama}
                            onChange={(e) => setFormData({...formData, nama: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                            placeholder="Contoh: Budi Santoso"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nomor HP / WhatsApp</label>
                          <input 
                            type="text" 
                            value={formData.noHp}
                            onChange={(e) => setFormData({...formData, noHp: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                            placeholder="0812..."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Alamat Domisili / Asal</label>
                        <input 
                          type="text" 
                          value={formData.alamat}
                          onChange={(e) => setFormData({...formData, alamat: e.target.value})}
                          className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                          placeholder="Alamat asal tamu"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Tujuan (Blok/No/Nama)</label>
                          <input 
                            type="text" 
                            required
                            value={formData.tujuan}
                            onChange={(e) => setFormData({...formData, tujuan: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                            placeholder="Blok H-24 / Pak RT"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Keperluan / Keterangan</label>
                          <input 
                            type="text" 
                            value={formData.keperluan}
                            onChange={(e) => setFormData({...formData, keperluan: e.target.value})}
                            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all shadow-inner outline-none"
                            placeholder="Kunjungan Keluarga / Kurir"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase text-sm tracking-[0.2em] hover:bg-blue-700 transition-all active:scale-95 shadow-2xl shadow-blue-200 disabled:bg-slate-400 flex items-center justify-center gap-3 group"
                      >
                        <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        {isLoading ? 'MEMPROSES VERIFIKASI...' : 'SIMPAN & KONFIRMASI MASUK'}
                      </button>
                    </form>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">FOTO KEMANAN</h3>
                      <p className="text-slate-400 font-bold text-xs">Sistem identifikasi wajah otomatis</p>
                    </div>

                    <div className="relative aspect-video bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 border-dashed border-slate-300 flex flex-col items-center justify-center shadow-inner group">
                      {cameraOpen ? (
                        <>
                          <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            screenshotQuality={1}
                            className="absolute inset-0 w-full h-full object-cover"
                            videoConstraints={{ facingMode: "user" }}
                            disablePictureInPicture={true}
                            forceScreenshotSourceSize={false}
                            imageSmoothing={true}
                            mirrored={false}
                            onUserMedia={() => {}}
                            onUserMediaError={() => {}}
                          />
                          <div className="absolute inset-0 border-[20px] border-white/5 pointer-events-none"></div>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500/50 rounded-[2rem] pointer-events-none border-dashed animate-pulse"></div>
                          
                          <button 
                            type="button"
                            onClick={capture}
                            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-white rounded-full border-4 border-blue-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-10"
                          >
                            <Camera className="w-10 h-10 text-blue-600" />
                          </button>
                        </>
                      ) : photo ? (
                        <div className="w-full h-full relative p-2">
                          <img src={photo} alt="Capture" className="w-full h-full object-cover rounded-[2rem] shadow-lg" />
                          <div className="absolute top-6 left-6 px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">ID CAPTURED</div>
                          <button 
                            type="button"
                            onClick={() => setPhoto(null)}
                            className="absolute top-6 right-6 p-3 bg-red-600 text-white rounded-2xl shadow-xl hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCameraOpen(true)}
                            className="absolute bottom-6 right-6 px-4 py-2 bg-blue-600 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-black uppercase tracking-tighter hover:bg-blue-700"
                          >
                            <Camera className="w-5 h-5" />
                            Ulangi Foto
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-10 cursor-pointer" onClick={() => setCameraOpen(true)}>
                          <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all border border-blue-100 shadow-sm">
                            <Camera className="w-12 h-12 text-blue-600" />
                          </div>
                          <h4 className="text-slate-800 font-black uppercase text-sm mb-1">KAMERA BELUM AKTIF</h4>
                          <p className="text-slate-400 font-bold text-[10px] tracking-widest">KLIK UNTUK MEMULAI PROSES IDENTIFIKASI</p>
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                        <Lock className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                        Data privasi terjaga. Foto ini hanya digunakan untuk kepentingan verifikasi keamanan lingkungan SmartRW.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeSubTab === 'log' && (
              <motion.div 
                key="log"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Data Log Aktivitas</h3>
                    <p className="text-xs font-bold text-slate-400">Total {bukuTamuData.length} catatan dalam basis data</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 flex-1 max-w-4xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari tamu/tujuan..."
                        className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all shadow-inner outline-none"
                      />
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={exportToExcel}
                        className="flex items-center gap-2 px-5 py-4 bg-green-50 text-green-700 rounded-2xl border border-green-200 font-black text-[10px] uppercase tracking-widest hover:bg-green-100 transition-all active:scale-95"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Excel
                      </button>
                      <button 
                        onClick={exportToPDF}
                        className="flex items-center gap-2 px-5 py-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Tamu</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tujuan & Alamat</th>
                        <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status / Waktu</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontrol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100">
                                {item.fotoUrl ? (
                                  <img src={item.fotoUrl} alt={item.nama} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                                    <User className="w-8 h-8" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <p className="font-black text-slate-800 leading-tight uppercase tracking-tight">{item.nama}</p>
                                <p className="text-[11px] font-bold text-slate-400 group-hover:text-blue-500 transition-colors">{item.noHp || 'No Contact'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1.5">
                              <p className="text-sm font-black text-slate-700 flex items-center gap-2 uppercase">
                                <MapPin className="w-4 h-4 text-red-500" />
                                {item.tujuan}
                              </p>
                              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" />
                                {item.keperluan || 'Biasa'}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="space-y-2">
                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  item.status === 'Bertamu' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'Bertamu' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                                  {item.status}
                                </span>
                                <div className="space-y-0.5">
                                  <p className="text-[10px] font-black text-slate-700 flex items-center gap-1.5 uppercase">
                                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                                    Masuk: {new Date(item.waktuDatang).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                  {item.waktuKeluar && (
                                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                                      <LogOut className="w-3.5 h-3.5 text-slate-300" />
                                      Keluar: {new Date(item.waktuKeluar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  )}
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            {item.status === 'Bertamu' && (
                              <button 
                                onClick={() => markFinished(item.id)}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                              >
                                Check-Out
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredData.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                              <Archive className="w-10 h-10 text-slate-200" />
                            </div>
                            <h4 className="text-slate-800 font-black uppercase text-sm mb-1">DATA TIDAK DITEMUKAN</h4>
                            <p className="text-slate-400 font-bold text-[10px] tracking-widest">COBA KATA KUNCI LAIN ATAU CEK TAB REGISTRASI</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Alerts / Tips */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black uppercase leading-tight">Security Protocol</h4>
                <p className="text-white/70 text-xs font-bold leading-relaxed">Semua tamu diwajibkan melapor ke pos keamanan sebelum memasuki lingkungan RT/RW.</p>
                <div className="pt-2">
                   <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest inline-block">Trusted System</div>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aktivitas Terakhir</h4>
             <div className="space-y-4">
               {bukuTamuData.slice(0, 3).map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700 group-hover:border-blue-500 transition-colors">
                      {item.fotoUrl ? <img src={item.fotoUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-600 m-2.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black truncate uppercase">{item.nama}</p>
                      <p className="text-[9px] text-slate-500 truncate font-bold">Ke: {item.tujuan}</p>
                    </div>
                    <div className="text-[9px] font-mono text-slate-600">{new Date(item.waktuDatang).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}</div>
                 </div>
               ))}
               {bukuTamuData.length === 0 && <p className="text-slate-600 text-[10px] font-black uppercase text-center py-4">Belum ada data</p>}
             </div>
             <button 
              onClick={() => setActiveSubTab('log')}
              className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
             >
               Lihat Semua
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WargaView({ wargaData, currentTenant, setWargaData, userRole, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification, currentUser }: { wargaData: any[], currentTenant?: any, setWargaData: any, userRole: string, tenantId: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void, currentUser: any }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingWarga, setEditingWarga] = useState<any>(null);
  const [viewWarga, setViewWarga] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const isRTAdmin = currentUser?.role === 'RT';
  const myRT = currentUser?.rtId || '01';
  const [filterRT, setFilterRT] = useState(isRTAdmin ? myRT : "Semua");
  const [filterRW, setFilterRW] = useState("Semua");
  const [filterKategoriUmur, setFilterKategoriUmur] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaIds, setSelectedWargaIds] = useState<string[]>([]);
  const [wargaToDelete, setWargaToDelete] = useState<any>(null);
  const [isDeletingWarga, setIsDeletingWarga] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic for detecting duplicates ---
  const findDuplicates = () => {
    const nikCount: Record<string, string[]> = {};
    wargaData.forEach(w => {
      if (!w.nik) return;
      if (!nikCount[w.nik]) nikCount[w.nik] = [];
      nikCount[w.nik].push(w.docId);
    });
    
    const duplicateNiks = Object.keys(nikCount).filter(nik => nikCount[nik].length > 1);
    const docsToDelete: string[] = [];
    duplicateNiks.forEach(nik => {
      // Keep the first one, delete the rest
      const ids = nikCount[nik];
      docsToDelete.push(...ids.slice(1));
    });
    return { duplicateNiks, docsToDelete };
  };

  const { duplicateNiks, docsToDelete } = findDuplicates();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleCleanupDuplicates = async () => {
    if (docsToDelete.length === 0) return;
    if (!window.confirm(`Ditemukan ${duplicateNiks.length} NIK ganda dengan total ${docsToDelete.length} dokumen redundant. Hapus data redundant?`)) return;

    setIsCleaning(true);
    try {
      const batch = writeBatch(db);
      docsToDelete.forEach(id => {
        batch.delete(doc(db, "data_warga", id));
      });
      await batch.commit();
      showNotification(`Berhasil membersihkan ${docsToDelete.length} data ganda.`, 'success');
    } catch (error: any) {
      console.error("Cleanup error:", error);
      showNotification("Gagal membersihkan data ganda.", 'error');
    } finally {
      setIsCleaning(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedWargaIds.length === filteredWargaData.length) {
      setSelectedWargaIds([]);
    } else {
      setSelectedWargaIds(filteredWargaData.map(w => w.docId));
    }
  };

  const toggleSelectWarga = (docId: string) => {
    if (selectedWargaIds.includes(docId)) {
      setSelectedWargaIds(selectedWargaIds.filter(id => id !== docId));
    } else {
      setSelectedWargaIds([...selectedWargaIds, docId]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWargaIds.length === 0) return;
    
    if (!window.confirm(`Yakin ingin menghapus ${selectedWargaIds.length} data terpilih?`)) return;

    setIsDeletingWarga(true);
    try {
      const uniqueIds = Array.from(new Set(selectedWargaIds));
      const totalCount = uniqueIds.length;
      const chunks = [];
      for (let i = 0; i < totalCount; i += 500) {
        chunks.push(uniqueIds.slice(i, i + 500));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach(id => {
          if (id) {
            batch.delete(doc(db, "data_warga", id));
          }
        });
        await batch.commit();
        await new Promise(r => setTimeout(r, 400));
      }

      setSelectedWargaIds([]);
      showNotification(`Berhasil menghapus ${totalCount} data warga.`, "success");
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      handleFirestoreError(error, "delete", "/data_warga");
      showNotification("Gagal menghapus data warga. Pastikan Anda memiliki akses yang cukup.", "error");
    } finally {
      setIsDeletingWarga(false);
    }
  };

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
    // 1. Filter out invalid data (missing NIK or Nama)
    const validData = data.filter((row: any) => {
      const nik = row['NIK'] || row['nik'];
      const nama = row['Nama Lengkap'] || row['nama'];
      return nik && nik.toString().trim() !== "" && nama && nama.toString().trim() !== "";
    });

    if (validData.length === 0) {
      showNotification("Tidak ada data warga valid yang ditemukan (NIK dan Nama wajib ada).", "error");
      return;
    }

    if (currentTenant) {
      const maxWarga = currentTenant.maxWarga || 50;
      if (wargaData.length >= maxWarga) {
        showNotification(`Batas slot warga tercapai (Maks: ${maxWarga}). Silakan upgrade paket.`, "error");
        return;
      }
      
      if (wargaData.length + validData.length > maxWarga) {
        const allowedCount = maxWarga - wargaData.length;
        showNotification(`Kuota terbatas! Hanya ${allowedCount} dari ${validData.length} data yang akan diimpor sesuai sisa slot paket Anda.`, "info");
        // Kita tidak return, tapi biarkan proses berlanjut dengan data yang dipotong (slice) di bawah
      }
    }

    const uniqueNIKs = new Set();
    const finalDataToImport = [];
    const maxLimit = currentTenant ? (currentTenant.maxWarga || 50) - wargaData.length : 10000;

    for (const row of validData) {
      if (finalDataToImport.length >= maxLimit) break;
      
      const nik = (row['NIK'] || row['nik'] || "").toString().trim();
      if (!uniqueNIKs.has(nik)) {
        uniqueNIKs.add(nik);
        finalDataToImport.push(row);
      }
    }

    if (finalDataToImport.length < validData.length) {
      console.warn(`Ditemukan ${validData.length - finalDataToImport.length} data duplikat atau melebihi kuota.`);
    }

    const targetTenantId = currentTenant?.id || tenantId;
    
    const newData = finalDataToImport.map((row: any) => ({
      tenantId: targetTenantId,
      nama: (row['Nama Lengkap'] || row['nama'] || "").toString(),
      nik: (row['NIK'] || row['nik'] || "").toString(),
      kk: (row['No. KK'] || row['no_kk'] || row['kk'] || "").toString(),
      tempatLahir: (row['Tempat Lahir'] || row['tempat_lahir'] || "").toString(),
      tglLahir: (row['Tgl Lahir'] || row['tgl_lahir'] || "").toString(),
      jk: (row['Jenis Kelamin'] || row['jk'] || "").toString(),
      posisi: (row['Posisi dalam Keluarga'] || row['posisi'] || "").toString(),
      profesi: (row['Profesi / Pekerjaan'] || row['profesi'] || "").toString(),
      pendidikanTerakhir: (row['Pendidikan Terakhir'] || row['pendidikanTerakhir'] || "").toString(),
      kawin: (row['Status Kawin'] || row['kawin'] || "").toString(),
      kewarganegaraan: (row['Kewarganegaraan'] || row['kewarganegaraan'] || "").toString(),
      agama: (row['Agama'] || row['agama'] || "Islam").toString(),
      rt: (row['RT'] || row['rt'] || "01").toString(),
      rw: (row['RW'] || row['rw'] || "05").toString(),
      blok: (row['Alamat/Blok'] || row['alamat'] || row['blok'] || "").toString(),
      kelurahan: (row['Kelurahan'] || row['kelurahan'] || "").toString(),
      kecamatan: (row['Kecamatan'] || row['kecamatan'] || "").toString(),
      kota_kab: (row['Kota/Kabupaten'] || row['kota_kab'] || "").toString(),
      status: (row['Status Warga'] || row['status'] || "Warga Tetap").toString(),
      hp: (row['No. HP (WA)'] || row['hp'] || "").toString(),
      email: (row['Email'] || row['email'] || "").toString(),
      foto: row['Foto Profil'] || "",
      ktpUrl: row['Foto KTP'] || "",
      tglDaftar: new Date().toISOString().split('T')[0]
    }));

    try {
      // 2. Use batch to write data efficiently
      const batchSize = 100; // Dikurangi dari 400 ke 100 untuk mencegah timeout pada koneksi lambat
      
      console.log("Batching items:", newData.length);
      for (let i = 0; i < newData.length; i += batchSize) {
        const chunk = newData.slice(i, i + batchSize);
        const batch = writeBatch(db);
        chunk.forEach((item: any) => {
          // Use tenantId prefix to ensure uniqueness across multi-tenant environment
          const docId = `${item.tenantId}_${item.nik}`;
          const docRef = doc(db, 'data_warga', docId);
          batch.set(docRef, item);
        });
        await batch.commit();
        // Beri jeda 500ms antar batch agar tidak memberatkan server/koneksi
        await new Promise(r => setTimeout(r, 500));
      }
      console.log("Batch committed successfully");

      showNotification(`Berhasil mengimpor ${newData.length} data warga.`, 'success');
    } catch (error: any) {
      console.error("Firebase Import Error Detail:", error);
      showNotification("Gagal sinkronisasi data ke Firebase: " + (error.message || error), 'error');
    }
  };

  // Form State for Adding/Editing
  const [formData, setFormData] = useState<any>({
    nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI", agama: "Islam", targetTenant: tenantId === 'MASTER' ? 'RW_BERJUANG' : tenantId
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

    if (currentTenant) {
      const maxWarga = currentTenant.maxWarga || 50;
      if (wargaData.length >= maxWarga) {
        showNotification(`Batas slot warga tercapai (Maks: ${maxWarga}). Silakan upgrade paket langganan Anda.`, 'error');
        return;
      }
    }
    
    const selectedTenantInfo = formData.targetTenant || (tenantId === 'MASTER' ? 'RW_BERJUANG' : tenantId) || 'RW26_SMART';
    const { targetTenant: _, ...formDataWithoutTargetTenant } = formData;
    const newWarga = { ...formDataWithoutTargetTenant, tenantId: selectedTenantInfo, tglDaftar: new Date().toISOString().split('T')[0] };
    
    setIsLoadingDB(true);
    try {
      const docId = `${selectedTenantInfo}_${newWarga.nik}`;
      await setDoc(doc(db, 'data_warga', docId), newWarga);
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
      const selectedTenantInfo = formData.targetTenant || editingWarga.tenantId || (tenantId === 'MASTER' ? 'RW_BERJUANG' : tenantId);
      const originalId = editingWarga.docId || `${editingWarga.tenantId || tenantId}_${editingWarga.nik}`;
      const newId = `${selectedTenantInfo}_${formData.nik}`;

      const { targetTenant: _, ...formDataWithoutTargetTenant } = formData;
      const dataToSave = { ...formDataWithoutTargetTenant, tenantId: selectedTenantInfo };

      if (originalId !== newId) {
        // Jika ID berubah (atau sebelumnya menggunakan auto-id), pindahkan data ke ID NIK yang benar
        await setDoc(doc(db, 'data_warga', newId), dataToSave);
        await deleteDoc(doc(db, 'data_warga', originalId));
      } else {
        await updateDoc(doc(db, 'data_warga', originalId), dataToSave);
      }

      setShowEditForm(false);
      setEditingWarga(null);
      resetForm();
      showNotification("Perubahan data warga berhasil disimpan!", 'success');
    } catch (error: any) {
      const targetId = editingWarga.docId || editingWarga.nik;
      handleFirestoreError(error, 'update', `/data_warga/${targetId}`);
      showNotification("Gagal memperbarui data warga.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteWarga = async () => {
    if (!wargaToDelete) return;
    
    setIsDeletingWarga(true);
    try {
      const docId = wargaToDelete.docId || wargaToDelete.nik;
      await deleteDoc(doc(db, 'data_warga', docId));
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
      nama: "", nik: "", kk: "", rt: "01", rw: "05", blok: "", kelurahan: "", kecamatan: "", kota_kab: "", status: "Warga Tetap", hp: "", email: "", foto: "", ktpUrl: "", posisi: "", profesi: "", pendidikanTerakhir: "", jk: "Laki-Laki", tglLahir: "", tempatLahir: "", kawin: "Belum Kawin", kewarganegaraan: "WNI", agama: "Islam", targetTenant: tenantId === 'MASTER' ? 'RW_BERJUANG' : tenantId
    });
  };

  // Membuat daftar opsi dinamis untuk RT dan RW berdasarkan data yang ada
  const foundRTs = Array.from(new Set(wargaData.map(w => w.rt))).filter(rt => rt).sort();
  const foundRWs = Array.from(new Set(wargaData.map(w => w.rw))).filter(rw => rw).sort();
  
  // Gunakan RT/RW yang ada di data, jika kosong sediakan default 01-10 / 01-20
  const uniqueRTs = ["Semua", ...(foundRTs.length > 0 ? foundRTs : Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')))];
  const uniqueRWs = ["Semua", ...(foundRWs.length > 0 ? foundRWs : Array.from({ length: 10 }, (_, i) => String(i + 1).padStart(2, '0')))];

  // Terapkan filter pada data - Optimized with useMemo for large datasets
  const filteredWargaData = useMemo(() => {
    // 1. De-duplicate by NIK first to ensure clean list
    const uniqueMap: Record<string, any> = {};
    wargaData.forEach(w => {
      if (!w.nik) {
        // For records without NIK, we rely on docId or just let them stay if unique enough
        const id = w.docId || w.id || Math.random().toString();
        uniqueMap[id] = w;
        return;
      }
      
      const existing = uniqueMap[w.nik];
      if (!existing) {
        uniqueMap[w.nik] = w;
      } else {
        // Priority: Verified > more complete data (e.g. has KK or Blok)
        const isBetter = w.terverifikasi && !existing.terverifikasi;
        const moreInfo = (w.blok && !existing.blok) || (w.kk && !existing.kk);
        if (isBetter || (moreInfo && w.terverifikasi === existing.terverifikasi)) {
           uniqueMap[w.nik] = w;
        }
      }
    });

    const uniqueWarga = Object.values(uniqueMap);

    return uniqueWarga.filter((w: any) => {
      // Filter RT/RW - Normalize to string and trim leading zeros for comparison
      const normalize = (val: string) => val ? val.toString().replace(/^0+/, '') : "";
      const filterRTNormalized = filterRT === "Semua" ? "Semua" : filterRT.replace(/^0+/, '');
      const filterRWNormalized = filterRW === "Semua" ? "Semua" : filterRW.replace(/^0+/, '');
      
      const matchRT = filterRT === "Semua" || normalize(w.rt || "") === filterRTNormalized;
      const matchRW = filterRW === "Semua" || normalize(w.rw || "") === filterRWNormalized;
      
      // Filter Kategori Umur
      let matchUmur = true;
      if (filterKategoriUmur !== "Semua") {
        const ageResult = calculateAge(w.tglLahir);
        const age = typeof ageResult === 'number' ? ageResult : -1;
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
        w.nama?.toLowerCase().includes(searchLower) ||
        w.nik?.includes(searchQuery) ||
        w.kk?.includes(searchQuery) ||
        w.hp?.includes(searchQuery);

      return matchRT && matchRW && matchUmur && matchSearch;
    });
  }, [wargaData, filterRT, filterRW, filterKategoriUmur, searchQuery]);

  const handleExportExcel = () => {
    const headers = [
      'Nama Lengkap', 'NIK', 'No. KK', 'Agama', 'Tempat Lahir', 'Tgl Lahir', 'Jenis Kelamin', 
      'Posisi dalam Keluarga', 'Profesi / Pekerjaan', 'Pendidikan Terakhir', 'Status Kawin', 'Kewarganegaraan', 
      'RT', 'RW', 'Alamat/Blok', 'Kelurahan', 'Kecamatan', 'Kota/Kabupaten', 'Status Warga', 'No. HP (WA)', 'Email'
    ];
    const rows = filteredWargaData.map(w => 
      [
        `"${w.nama || ''}"`, `"${w.nik || ''}"`, `"${w.kk || ''}"`, `"${w.agama || ''}"`, `"${w.tempatLahir || ''}"`, `"${w.tglLahir || ''}"`, `"${w.jk || ''}"`,
        `"${w.posisi || ''}"`, `"${w.profesi || ''}"`, `"${w.pendidikanTerakhir || ''}"`, `"${w.kawin || ''}"`, `"${w.kewarganegaraan || ''}"`,
        `"${w.rt || ''}"`, `"${w.rw || ''}"`, `"${w.blok || ''}"`, `"${w.kelurahan || ''}"`, `"${w.kecamatan || ''}"`, `"${w.kota_kab || ''}"`, `"${w.status || ''}"`, `"${w.hp || ''}"`, `"${w.email || ''}"`
      ].join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Warga_Lengkap_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    filteredWargaData.forEach((warga, index) => {
      if (index > 0) doc.addPage();
      
      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("BIODATA WARGA", pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`RW26 BERJUANG - ${tenantId}`, pageWidth / 2, 26, { align: 'center' });
      doc.line(14, 30, pageWidth - 14, 30);

      let currentY = 40;
      
      // Fields to display
      const fields = [
        { label: "Nama Lengkap", value: warga.nama },
        { label: "NIK", value: warga.nik },
        { label: "No. KK", value: warga.kk },
        { label: "Tempat Lahir", value: warga.tempatLahir },
        { label: "Tanggal Lahir", value: warga.tglLahir },
        { label: "Jenis Kelamin", value: warga.jk },
        { label: "Agama", value: warga.agama },
        { label: "Profesi", value: warga.profesi },
        { label: "Pendidikan", value: warga.pendidikanTerakhir },
        { label: "Status Kawin", value: warga.kawin },
        { label: "Kewarganegaraan", value: warga.kewarganegaraan },
        { label: "Posisi Keluarga", value: warga.posisi },
        { label: "Status Warga", value: warga.status },
        { label: "RT / RW", value: `${warga.rt || '-'} / ${warga.rw || '-'}` },
        { label: "Alamat", value: warga.blok },
        { label: "Kelurahan", value: warga.kelurahan },
        { label: "Kecamatan", value: warga.kecamatan },
        { label: "Kota/Kabupaten", value: warga.kota_kab },
        { label: "No. HP (WA)", value: warga.hp },
        { label: "Email", value: warga.email },
      ];

      doc.setFontSize(10);
      fields.forEach((field) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${field.label}`, 14, currentY);
        doc.setFont("helvetica", "normal");
        // Handle long values with text wrapping if necessary, but here we just show labels carefully
        const val = field.value || '-';
        doc.text(`: ${val}`, 55, currentY);
        currentY += 8;
      });

      // Signature area (optional but common for official biodata)
      currentY += 20;
      const signatureY = currentY;
      doc.setFontSize(10);
      doc.text("Ketua RT / RW", 140, signatureY);
      doc.text("( ____________________ )", 135, signatureY + 25);

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 285);
      doc.setTextColor(0);
    });

    doc.save(`Biodata_Warga_Lengkap_${tenantId}.pdf`);
  };

  // Reset page when filter changes
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setter(e.target.value);
    setCurrentPage(1); // Kembali ke halaman 1 saat filter/pencarian berubah
  };

  // Logika Pagination - Optimized with useMemo
  const totalPages = Math.ceil(filteredWargaData.length / itemsPerPage);
  const paginatedWarga = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredWargaData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWargaData, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      // Optional: scroll table to top
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const isMaster = tenantId === 'MASTER';
  const currentMaxWarga = isMaster ? 999999 : (currentTenant?.maxWarga || 50);
  const isNearLimit = !isMaster && wargaData.length >= currentMaxWarga * 0.8;
  const isAtLimit = !isMaster && wargaData.length >= currentMaxWarga;

  return (
    <div className="space-y-6">
      {(isNearLimit || isAtLimit) && (
        <div className={`p-4 rounded-2xl border-l-4 ${isAtLimit ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-500'} flex items-start gap-4 shadow-sm`}>
          <AlertTriangle className={`w-6 h-6 ${isAtLimit ? 'text-red-500' : 'text-orange-500'} flex-shrink-0 mt-1`} />
          <div>
            <h4 className={`text-base font-black ${isAtLimit ? 'text-red-800' : 'text-orange-800'}`}>
              {isAtLimit ? 'Batas Slot Warga Tercapai' : 'Slot Warga Hampir Penuh'}
            </h4>
            <p className={`text-sm ${isAtLimit ? 'text-red-700' : 'text-orange-700'} mt-1 font-medium`}>
              Anda telah menggunakan {wargaData.length} dari {currentMaxWarga} slot warga pada paket ini. 
              {isAtLimit ? ' Anda tidak dapat menambahkan data warga. ' : ' Anda dapat menambahkan beberapa data lagi. '} 
              Hubungi Admin Utama / Super Admin untuk upgrade agar kapasitas bertambah.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col relative print:border-none print:shadow-none print:overflow-visible">
      <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:justify-between lg:items-center bg-white print:hidden gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-soft-blue flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5 text-brand-blue" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 leading-none">Data Warga</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Kelola Informasi Komunitas</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Kolom Pencarian */}
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama/NIK/KK/HP..."
              value={searchQuery}
              onChange={handleFilterChange(setSearchQuery)}
              className="pl-11 pr-4 py-3 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 w-full transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <select 
                value={filterRW}
                onChange={handleFilterChange(setFilterRW)}
                className="px-3 py-2 bg-white rounded-xl text-xs font-black text-slate-700 border border-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer uppercase"
              >
                {uniqueRWs.map(rw => <option key={`rw-${rw}`} value={rw}>{rw === 'Semua' ? 'RW' : 'RW ' + rw}</option>)}
              </select>
              <select 
                value={filterRT}
                onChange={handleFilterChange(setFilterRT)}
                className="px-3 py-2 bg-white rounded-xl text-xs font-black text-slate-700 border border-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 cursor-pointer uppercase"
              >
                {uniqueRTs.map(rt => <option key={`rt-${rt}`} value={rt}>{rt === 'Semua' ? 'RT' : 'RT ' + rt}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => { resetForm(); setShowAddForm(true); }}
                className="flex items-center gap-2 bg-brand-yellow hover:bg-yellow-400 text-slate-900 px-5 py-3 rounded-2xl text-xs font-black transition-all shadow-lg shadow-brand-yellow/30 active:scale-95 uppercase tracking-wider"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tambah</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <select 
            value={filterKategoriUmur}
            onChange={handleFilterChange(setFilterKategoriUmur)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 focus:outline-none transition-all cursor-pointer"
          >
            <option value="Semua">Semua Usia</option>
            <option value="Balita">Balita (0-5)</option>
            <option value="Remaja">Remaja (6-17)</option>
            <option value="Dewasa">Dewasa (18-59)</option>
            <option value="Lansia">Lansia (60+)</option>
          </select>
          <div className="h-4 w-px bg-slate-200"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none bg-white px-3 py-1 rounded-full border border-slate-100">
            {filteredWargaData.length} Warga Ditemukan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-pink hover:text-brand-pink text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95" title="Download PDF">
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">PDF</span>
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-green hover:text-brand-green text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95" title="Download Excel">
            <Download className="w-4 h-4" />
            <span className="hidden lg:inline">EXCEL</span>
          </button>
          
          {userRole !== 'Viewer' && (
            <>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-brand-blue hover:text-brand-blue text-slate-600 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                title="Upload Data"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">UPLOAD</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".csv, .xlsx, .xls" className="hidden" />
              
              {selectedWargaIds.length > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  disabled={isDeletingWarga}
                  className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 animate-pulse"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>HAPUS ({selectedWargaIds.length})</span>
                </button>
              )}
            </>
          )}
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
              <th className="px-6 py-3 print:px-2">
                <input 
                  type="checkbox" 
                  checked={selectedWargaIds.length > 0 && selectedWargaIds.length === filteredWargaData.length}
                  onChange={toggleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 print:px-2">Nama Lengkap</th>
              <th className="px-6 py-3 print:px-2">NIK & No. KK</th>
              <th className="px-6 py-3 print:px-2">Tempat/Tgl Lahir</th>
              <th className="px-6 py-3 print:px-2">Jenis Kelamin</th>
              <th className="px-6 py-3 print:px-2">Agama</th>
              <th className="px-6 py-3 print:px-2">Posisi Keluarga</th>
              <th className="px-6 py-3 print:px-2">Profesi</th>
              <th className="px-6 py-3 print:px-2">Pendidikan/Status Kawin</th>
              <th className="px-6 py-3 print:px-2 text-center">RT/RW</th>
              <th className="px-6 py-3 print:px-2">Alamat/Blok</th>
              <th className="px-6 py-3 print:px-2">Kel/Kec/Kota</th>
              <th className="px-6 py-3 print:px-2">Kontak</th>
              <th className="px-6 py-3 print:px-2">Kewarganegaraan</th>
              <th className="px-6 py-3 text-center print:px-2">Status</th>
              <th className="px-6 py-3 text-right print:hidden">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 print:divide-slate-300">
            {paginatedWarga.length > 0 ? paginatedWarga.map((warga, idx) => {
              return (
              <tr key={warga.docId || warga.nik || idx} className="hover:bg-slate-50 transition-colors print:break-inside-avoid whitespace-nowrap">
                <td className="px-6 py-3 print:px-2">
                  <input 
                    type="checkbox" 
                    checked={selectedWargaIds.includes(warga.docId)}
                    onChange={() => toggleSelectWarga(warga.docId)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-3 font-semibold text-slate-800 print:px-2">
                  <div className="flex items-center gap-1.5">
                    {warga.nama}
                    {warga.terverifikasi && (
                      <div className="bg-green-100 text-green-600 p-0.5 rounded-full" title="Terverifikasi Mandiri">
                        <CheckCircle className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div className="font-mono text-slate-700">{warga.nik || '-'}</div>
                  <div className="font-mono text-slate-400">KK: {warga.kk || '-'}</div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div>{warga.tempatLahir || '-'}, {warga.tglLahir || '-'}</div>
                  <div className="text-[10px] text-slate-400">Umur: {calculateAge(warga.tglLahir)}</div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.jk}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.agama || '-'}</td>
                <td className="px-6 py-3 text-xs text-slate-500 font-medium print:px-2">{warga.posisi}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.profesi}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div>{warga.pendidikanTerakhir || '-'}</div>
                  <div className="text-slate-400">{warga.kawin || '-'}</div>
                </td>
                <td className="px-6 py-3 text-slate-500 font-mono text-xs print:px-2 print:text-black text-center">{warga.rt}/{warga.rw}</td>
                <td className="px-6 py-3 text-xs print:px-2">{warga.blok}</td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">
                  <div>{warga.kelurahan || '-'}</div>
                  <div>{warga.kecamatan || '-'} / {warga.kota_kab || '-'}</div>
                </td>
                <td className="px-6 py-3 text-slate-500 text-xs print:px-2">
                  <div className="font-mono">{warga.hp || '-'}</div>
                  <div className="text-slate-400">{warga.email || '-'}</div>
                </td>
                <td className="px-6 py-3 text-xs text-slate-500 print:px-2">{warga.kewarganegaraan || 'WNI'}</td>
                <td className="px-6 py-3 text-center print:px-2">
                  <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${warga.status === 'Warga Tetap' ? 'border-green-200 bg-green-50 text-green-700' : 'border-blue-200 bg-blue-50 text-blue-700'} print:border-0 print:p-0 print:bg-transparent print:text-slate-800`}>
                    {warga.status}
                  </span>
                </td>
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
                      {(userRole === 'ADMIN' || userRole === 'RT' || userRole === 'Admin' || userRole === 'SUPER_ADMIN') && (
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
      <div className="p-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 bg-slate-50 print:hidden gap-3">
        <div className="flex items-center gap-3">
          <p>Menampilkan {paginatedWarga.length > 0 ? startIndex + 1 : 0} - {startIndex + paginatedWarga.length} dari {filteredWargaData.length} warga</p>
          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <span>Tampilkan:</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-white border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {[10, 25, 50, 100, 500].map(val => (
                <option key={val} value={val}>{val}</option>
              ))}
            </select>
          </div>
        </div>
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
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 ">
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
                  <option value="SMA Sederajat">SMA Sederajat</option>
                  <option value="DIPLOMA 2">DIPLOMA 2</option>
                  <option value="DIPLOMA 3">DIPLOMA 3</option>
                  <option value="DIPLOMA 4">DIPLOMA 4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                  <option value="S3">S3</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Agama</label>
                <select required name="agama" value={(formData as any).agama} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
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
                    <option value="Suami (Kepala Keluarga)">Suami (Kepala Keluarga)</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Cucu">Cucu</option>
                    <option value="Family Lain">Family Lain</option>
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

              {isMaster && (
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Pilih Tenant (Khusus Super Admin)</label>
                  <select name="targetTenant" value={formData.targetTenant} onChange={handleInputChange} className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm text-slate-700 bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold">
                    <option value="RW26_SMART">RW26 SMART (Default)</option>
                    <option value="RW_BERJUANG">RW_BERJUANG (Tri)</option>
                    <option value="trihprw26">trihprw26</option>
                  </select>
                </div>
              )}

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
          <div className="fixed inset-0 bg-slate-900/60  flex justify-center items-center z-50 p-4 print:hidden">
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
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Tempat, Tgl Lahir</p>
                    <p className="font-medium text-slate-800">{viewWarga.tempatLahir || '-'}, {viewWarga.tglLahir || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Jenis Kelamin</p>
                    <p className="font-medium text-slate-800">{viewWarga.jk || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Profesi</p>
                    <p className="font-medium text-slate-800">{viewWarga.profesi || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Pendidikan Terakhir</p>
                    <p className="font-medium text-slate-800">{viewWarga.pendidikanTerakhir || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Status Kawin</p>
                    <p className="font-medium text-slate-800">{viewWarga.kawin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Posisi Keluarga</p>
                    <p className="font-medium text-slate-800">{viewWarga.posisi || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Agama</p>
                    <p className="font-medium text-slate-800">{viewWarga.agama || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Kewarganegaraan</p>
                    <p className="font-medium text-slate-800">{viewWarga.kewarganegaraan || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">RT/RW</p>
                    <p className="font-medium text-slate-800 font-mono">{viewWarga.rt || '-'}/{viewWarga.rw || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Alamat Lengkap</p>
                    <p className="font-medium text-slate-800">
                      {viewWarga.blok || '-'} <br/>
                      Kel: {viewWarga.kelurahan || '-'}, Kec: {viewWarga.kecamatan || '-'} <br/>
                      {viewWarga.kota_kab || '-'}
                    </p>
                  </div>
                </div>

                {viewWarga.ktpUrl && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Dokumen KTP</p>
                    <div className="w-full h-40 bg-slate-100 rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-200">
                      <img src={viewWarga.ktpUrl} className="max-w-full max-h-full object-contain" alt="KTP" />
                    </div>
                  </div>
                )}
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
    </div>
  );
}

function IuranView({ iuranData, setIuranData, kasData, setKasData, wargaData = [], userRole, currentUser, getSetting, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification }: any) {
  const [activeSubTab, setActiveSubTab] = useState<'pembayaran' | 'rekap'>('pembayaran');
  const [showForm, setShowForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [buktiUrl, setBuktiUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [jenisPembayaran, setJenisPembayaran] = useState('Iuran Warga');
  
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const years = [2024, 2025, 2026, 2027];

  const canApprove = userRole === 'Admin' || userRole === 'RW' || userRole === 'RT' || userRole === 'Bendahara' || currentUser?.isSuperAdmin;
  const isPengurus = canApprove;
  
  const myTransactions = isPengurus ? iuranData : iuranData.filter((i: any) => i.nik === currentUser.nik || i.userId === currentUser.uid || i.userId === currentUser.id_user);
  
  const filteredTransactions = myTransactions.filter((i: any) => {
    if (selectedMonth === -1) return new Date(i.tanggal).getFullYear() === selectedYear;
    const d = new Date(i.tanggal);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const handleCreatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `IURAN-${Date.now()}`;
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    const keterangan = formData.get('keterangan') as string;
    
    let nik = currentUser.nik || '-';
    let nama = currentUser.nama || currentUser.name || "Anonim";
    let alamat = wargaData.find((w:any) => w.nik === nik)?.alamat || "-";
    
    if (isPengurus) {
      const selectedWargaId = formData.get('wargaId') as string;
      const w = wargaData.find((warga:any) => warga.id === selectedWargaId);
      if (w) {
        nik = w.nik || '-';
        nama = w.nama;
        alamat = w.alamat || "-";
      } else {
        const inputNama = formData.get('namaPenyetor') as string;
        if (inputNama) nama = inputNama;
      }
    }

    const payload = {
      id,
      tenantId,
      rt: currentUser.rt || '01',
      tanggal: dateObj.toISOString(),
      jenis: jenisPembayaran,
      nominal,
      keterangan,
      nik,
      namaPenyetor: nama,
      alamat,
      buktiUrl,
      status: isPengurus ? 'Lunas' : 'Menunggu Verifikasi',
      userId: currentUser.uid || currentUser.id_user || null,
    };

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'iuran', id), payload);
      setIuranData((prev: any) => {
        if (prev.some((i: any) => i.id === id)) return prev;
        return [payload, ...prev];
      });
      
      // Auto create Kas if status is Lunas
      if (payload.status === 'Lunas') {
        const kasId = `TRX-${Date.now()}`;
        const kasPayload = {
          id: kasId,
          tenantId,
          rt: payload.rt,
          tanggal: dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          tipe: 'Masuk',
          transaksi: payload.jenis,
          nama: payload.namaPenyetor,
          keterangan: payload.keterangan || `Pembayaran ${payload.jenis}`,
          debit: payload.nominal,
          kredit: 0,
          strukUrl: payload.buktiUrl,
          iuranId: id
        };
        await setDoc(doc(db, 'kas', kasId), kasPayload);
        setKasData((prev: any) => {
          if (prev.some((k:any) => k.id === kasId)) return prev;
          return [kasPayload, ...prev];
        });
      }
      
      showNotification('Pembayaran berhasil dicatat', 'success');
      setShowForm(false);
      setBuktiUrl('');
      setJenisPembayaran('Iuran Warga');
    } catch (e: any) {
      handleFirestoreError(e, 'create', 'iuran');
      showNotification('Gagal mencatat pembayaran', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleApprove = async (trx: any) => {
    if (!window.confirm("Verifikasi dan terima pembayaran ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'iuran', trx.id), { status: 'Lunas', verifiedBy: currentUser.nama || currentUser.name, verifiedAt: new Date().toISOString() });
      setIuranData((prev: any) => prev.map((t: any) => t.id === trx.id ? { ...t, status: 'Lunas' } : t));
      
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId,
        rt: trx.rt || '01',
        tanggal: new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: trx.jenis,
        nama: trx.namaPenyetor,
        keterangan: trx.keterangan || `Pembayaran ${trx.jenis}`,
        debit: trx.nominal,
        kredit: 0,
        strukUrl: trx.buktiUrl,
        iuranId: trx.id
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => {
        if (prev.some((k:any) => k.id === kasId)) return prev;
        return [kasPayload, ...prev];
      });
      
      showNotification('Pembayaran diverifikasi dan dicatat ke kas', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'iuran');
      showNotification('Gagal verifikasi', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };
  
  const handleReject = async (trx: any) => {
    if (!window.confirm("Tolak pembayaran ini?")) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'iuran', trx.id), { status: 'Ditolak' });
      setIuranData((prev: any) => prev.map((t: any) => t.id === trx.id ? { ...t, status: 'Ditolak' } : t));
      showNotification('Pembayaran ditolak', 'success');
    } catch (err: any) {
      handleFirestoreError(err, 'update', 'iuran');
      showNotification('Gagal menolak pembayaran', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="space-y-6">
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit">
        <button
          onClick={() => setActiveSubTab('pembayaran')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'pembayaran' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="uppercase">Riwayat Pembayaran</span>
        </button>
        {isPengurus && (
          <button
            onClick={() => setActiveSubTab('rekap')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'rekap' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Users className="w-4 h-4" />
            <span className="uppercase">Rekap Iuran Warga</span>
          </button>
        )}
      </div>

      {activeSubTab === 'pembayaran' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-600 w-1.5 h-4 rounded-full"></span>
              {isPengurus ? "Semua Transaksi Masuk" : "Riwayat Pembayaran Saya"}
            </h3>
            <div className="flex flex-wrap gap-2">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value={-1}>Semua Bulan</option>
                {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-white border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-blue-700 shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" /> Buat Pembayaran
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-5 py-4">Tanggal</th>
                  <th className="px-5 py-4">Penyetor</th>
                  <th className="px-5 py-4">Jenis Pembayaran</th>
                  <th className="px-5 py-4 text-right">Nominal</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Bukti</th>
                  <th className="px-5 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                {filteredTransactions.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 italic font-bold">Tidak ada data.</td></tr>
                )}
                {filteredTransactions.map((trx: any) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-xs">{new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-800">{trx.namaPenyetor}</div>
                      <div className="text-[10px] text-slate-400 max-w-[150px] truncate" title={trx.alamat}>{trx.alamat}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-bold text-blue-600">{trx.jenis}</div>
                      <div className="text-[10px] text-slate-400 italic max-w-[200px] truncate" title={trx.keterangan}>{trx.keterangan || '-'}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-black">
                      Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${trx.status === 'Lunas' ? 'bg-green-100 text-green-700' : trx.status === 'Ditolak' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {trx.strukUrl ? (
                        <a href={trx.strukUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 rounded px-2 py-1 hover:bg-slate-200 transition-colors text-[10px] font-bold" title="Lihat Bukti">
                          <Image className="w-3 h-3" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isPengurus && trx.status === 'Menunggu Verifikasi' && (
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleApprove(trx)} className="p-1.5 px-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg border border-green-100 transition-colors font-bold text-xs" title="Terima">
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleReject(trx)} className="p-1.5 px-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg border border-red-100 transition-colors font-bold text-xs" title="Tolak">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'rekap' && isPengurus && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-800 mb-2">Rekapitulasi Iuran Wajib Warga</h3>
          <p className="text-xs text-slate-500 mb-6 font-medium">Tabel di bawah menunjukkan status pembayaran iuran wajib bulanan untuk warga (Kepala Keluarga) di tahun {selectedYear}.</p>
          
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                <tr>
                  <th className="px-4 py-3 border border-slate-100 sticky left-0 bg-slate-50 z-10 w-48 shadow-[1px_0_0_#f1f5f9]">Data Kepala Keluarga</th>
                  {months.map((m, i) => (
                    <th key={i} className="px-2 py-3 border border-slate-100 text-center min-w-[60px]">{m.substring(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-medium text-slate-600 text-xs">
                {wargaData.filter((w:any) => w.posisi === 'Kepala Keluarga' || !w.posisi).map((w: any) => (
                  <tr key={w.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 border border-slate-100 sticky left-0 bg-white group-hover:bg-blue-50/10 z-10 shadow-[1px_0_0_#f1f5f9]">
                      <div className="font-bold text-slate-800">{w.nama}</div>
                      <div className="text-[9px] text-slate-400 truncate max-w-[180px]">{w.alamat}</div>
                    </td>
                    {months.map((m, i) => {
                      const paid = iuranData.some((trx: any) => {
                        if (trx.jenis !== 'Iuran Warga' || trx.status !== 'Lunas') return false;
                        if (trx.nik !== w.nik && trx.namaPenyetor !== w.nama) return false;
                        const d = new Date(trx.tanggal);
                        return d.getMonth() === i && d.getFullYear() === selectedYear;
                      });
                      return (
                        <td key={i} className={`px-2 py-2 border border-slate-100 text-center ${paid ? 'bg-green-50/50' : 'bg-slate-50/30'}`}>
                          {paid ? (
                            <div className="w-5 h-5 rounded-md bg-green-500 text-white flex items-center justify-center mx-auto shadow-sm shadow-green-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-auto"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><PlusCircle className="w-4 h-4" /></span>
                Buat Pembayaran Baru
              </h3>
              <button onClick={() => setShowForm(false)} className="bg-white p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleCreatePayment} className="p-6 overflow-y-auto space-y-5">
              {isPengurus && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <label className="block text-xs font-black text-blue-800 uppercase tracking-widest">Identitas Penyetor (Admin Mode)</label>
                  <select name="wargaId" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">-- Bukan warga terdaftar --</option>
                    {wargaData.map((w:any) => <option key={w.id} value={w.id}>{w.nama} ({w.nik})</option>)}
                  </select>
                  <input type="text" name="namaPenyetor" placeholder="Tulis manual nama penyetor (jika luar warga)" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Bayar</label>
                  <input name="tanggal" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nominal (Rp)</label>
                  <input name="nominal" required type="text" placeholder="Contoh: 50000" className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Jenis Pembayaran & Peruntukkan</label>
                <select value={jenisPembayaran} onChange={(e) => setJenisPembayaran(e.target.value)} name="jenis" className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
                  <option value="Iuran Warga">Iuran Wajib Bulanan Warga</option>
                  <option value="Retribusi Sampah / Keamanan">Retribusi Sampah / Keamanan</option>
                  <option value="Pajak Bumi Bangunan">Pembayaran Pajak (PBB)</option>
                  <option value="Listrik, Air & Fasum">Biaya Listrik, Air & Fasilititas Umum</option>
                  <option value="Donasi / ZIS / Qurban">Donasi / Zakat / Qurban</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Keterangan Detail (Opsional)</label>
                <input name="keterangan" type="text" placeholder="Misal: Bayar Iuran Warga bulan Mei 2026 via QRIS" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between items-center">
                  <span>Bukti Pembayaran / Struk (Wajib U/Warga)</span>
                </label>
                {buktiUrl ? (
                  <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner group">
                    <img src={buktiUrl} alt="Bukti" className="w-full h-full object-contain" />
                    <button type="button" onClick={() => setBuktiUrl('')} className="absolute top-3 right-3 p-2 bg-red-600/90 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="w-full">
                    <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploading(true);
                        const url = await handleFileUpload(e.target.files[0], 'iuran_bukti');
                        if (url) setBuktiUrl(url);
                        setUploading(false);
                      }
                    }} />
                    <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all flex flex-col items-center justify-center gap-3 bg-slate-50/50 outline-none group focus:ring-2 disabled:opacity-50 disabled:cursor-wait">
                      {uploading ? (
                        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div>
                      ) : (
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:shadow-blue-100 transition-all">
                          <Upload className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <span className="text-xs font-black block">{uploading ? 'Sedang Mengunggah...' : 'Upload/Foto Bukti Transaksi'}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-[200px] leading-tight block">Format Gambar (JPG/PNG). Bisa foto dari kamera HP.</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border border-slate-200">Batalkan</button>
                <button type="submit" disabled={uploading} className="flex-1 py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Simpan Pembayaran
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PPOBView({ ppobData, setPpobData, kasData, setKasData, currentUser, tenantId, setIsLoadingDB, handleFirestoreError, showNotification, isPengurus }: any) {
  const [selectedLayanan, setSelectedLayanan] = useState<string>('Pulsa');
  const [showSimulasiForm, setShowSimulasiForm] = useState(false);
  const [nominal, setNominal] = useState("");
  const [tujuan, setTujuan] = useState("");
  const adminFee = selectedLayanan === 'Tiket Kereta' ? 5000 : selectedLayanan === 'PLN' ? 2500 : selectedLayanan === 'PDAM' ? 2500 : selectedLayanan === 'BPJS' ? 2500 : 1500;
  
  const layanans = [
    { id: 'Pulsa', name: 'Pulsa & Paket Data', desc: 'Isi ulang pulsa All Operator', icon: <Smartphone className="w-5 h-5 text-blue-500" /> },
    { id: 'PLN', name: 'Token Listrik / PLN', desc: 'Beli token atau bayar tagihan', icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { id: 'PDAM', name: 'Air PDAM', desc: 'Bayar tagihan air', icon: <Droplets className="w-5 h-5 text-cyan-500" /> },
    { id: 'Tiket Kereta', name: 'Tiket Kereta Api', desc: 'Pesan KAI', icon: <Train className="w-5 h-5 text-orange-500" /> },
    { id: 'BPJS', name: 'BPJS Kesehatan', desc: 'Bayar iuran BPJS', icon: <ShieldAlert className="w-5 h-5 text-green-500" /> },
  ];

  const handleSimulasiBayar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || !tujuan) {
      showNotification('Harap isi nomor tujuan dan nominal', 'error');
      return;
    }
    
    // Skema Keuntungan: 
    // 80% dari Biaya Admin dikumpulkan sebagai Total Komisi yang bisa dibagikan
    const totalKomisiPool = Math.floor(adminFee * 0.8); 
    
    // Pemilik Aplikasi mendapatkan 15% dari Total Komisi tersebut
    const komisiOwner = Math.floor(totalKomisiPool * 0.15);
    
    // RT/RW mendapatkan sisanya (85% dari Total Komisi tersebut)
    const komisiRT = totalKomisiPool - komisiOwner;
    
    const trxId = `PPOB-${Date.now()}`;
    const payload = {
      id: trxId,
      tenantId,
      rt: currentUser?.rt || '01',
      tanggal: new Date().toISOString(),
      layanan: selectedLayanan,
      tujuan,
      nominal: parseInt(nominal.replace(/\D/g, '') || "0"),
      adminFee,
      komisiOwner, // Keuntungan untuk Anda
      komisiRT,    // Keuntungan untuk RT/RW
      totalBayar: parseInt(nominal.replace(/\D/g, '') || "0") + adminFee,
      status: 'Berhasil',
      userId: currentUser?.uid || currentUser?.id_user || null,
      namaPembeli: currentUser?.nama || currentUser?.name || 'Warga'
    };

    setIsLoadingDB(true);
    try {
      // 1. Simpan PPOB trx
      await setDoc(doc(db, 'ppob_trx', trxId), payload);
      setPpobData((prev: any) => [payload, ...prev]);

      // 2. Tambahkan komisi kas RT (Hanya bagian RT yang masuk ke buku kas RT)
      const kasId = `TRX-${Date.now()}`;
      const kasPayload = {
        id: kasId,
        tenantId,
        rt: payload.rt,
        tanggal: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        tipe: 'Masuk',
        transaksi: 'PPOB Komisi',
        nama: 'Aplikasi',
        keterangan: `Komisi Trx ${selectedLayanan} - ${payload.tujuan} (${payload.namaPembeli})`,
        debit: komisiRT,
        kredit: 0,
        strukUrl: '',
        ppobId: trxId
      };
      await setDoc(doc(db, 'kas', kasId), kasPayload);
      setKasData((prev: any) => [kasPayload, ...prev]);

      showNotification('Transaksi Berhasil! Kas RT bertambah dari komisi.', 'success');
      setShowSimulasiForm(false);
      setNominal("");
      setTujuan("");
    } catch (err: any) {
      handleFirestoreError(err, 'create', 'ppob_trx');
      showNotification('Transaksi Gagal', 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const myPPOB = isPengurus ? ppobData : ppobData.filter((i: any) => i.userId === currentUser?.uid || i.userId === currentUser?.id_user);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 md:p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <CreditCard className="w-32 h-32 transform rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Smartphone className="w-6 h-6" /> Layanan PPOB & Tiketing</h2>
          <p className="text-blue-100 text-sm font-medium">Beli pulsa, token listrik, bayar tagihan hingga tiket kereta dari aplikasi warga. Setiap transaksi akan memberikan keuntungan otomatis (komisi) yang masuk ke Saldo Kas RT/RW!</p>
        </div>
        <button onClick={() => setShowSimulasiForm(true)} className="relative z-10 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg active:scale-95 whitespace-nowrap">
          Lakukan Transaksi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-green-500 w-1.5 h-4 rounded-full"></span>
            Riwayat Transaksi PPOB
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white text-slate-400 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
              <tr>
                <th className="px-5 py-4">Waktu</th>
                <th className="px-5 py-4">Pembeli</th>
                <th className="px-5 py-4">Layanan</th>
                <th className="px-5 py-4">Tujuan</th>
                <th className="px-5 py-4 text-right">Nilai Trx</th>
                {isPengurus && (
                  <>
                    <th className="px-5 py-4 text-right text-green-600">Komisi RT</th>
                    <th className="px-5 py-4 text-right text-indigo-600">Profit Pemilik</th>
                  </>
                )}
                <th className="px-5 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
              {myPPOB.length === 0 && (
                <tr><td colSpan={isPengurus ? 8 : 6} className="px-5 py-12 text-center text-slate-400 italic font-bold">Belum ada transaksi.</td></tr>
              )}
              {myPPOB.map((trx: any) => (
                <tr key={trx.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 text-xs">{new Date(trx.tanggal).toLocaleString('id-ID', {day: '2-digit', month: 'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</td>
                  <td className="px-5 py-3 font-bold text-slate-800">{trx.namaPembeli}</td>
                  <td className="px-5 py-3 font-bold text-blue-600">{trx.layanan}</td>
                  <td className="px-5 py-3 text-xs">{trx.tujuan}</td>
                  <td className="px-5 py-3 text-right font-black">Rp {new Intl.NumberFormat('id-ID').format(trx.nominal)}</td>
                  {isPengurus && (
                    <>
                      <td className="px-5 py-3 text-right font-black text-green-600">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiRT || 0)}</td>
                      <td className="px-5 py-3 text-right font-black text-indigo-600">Rp {new Intl.NumberFormat('id-ID').format(trx.komisiOwner || 0)}</td>
                    </>
                  )}
                  <td className="px-5 py-3 text-center">
                    <span className="px-2 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest bg-green-100 text-green-700">
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSimulasiForm && (
        <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[100] p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                Transaksi PPOB & Tiket
              </h3>
              <button type="button" onClick={() => setShowSimulasiForm(false)} className="bg-white p-1.5 border border-slate-200 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSimulasiBayar} className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {layanans.map(l => (
                  <button type="button" key={l.id} onClick={() => setSelectedLayanan(l.id)} className={`p-4 border rounded-2xl flex flex-col items-center justify-center gap-2 transition-all ${selectedLayanan === l.id ? 'border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'}`}>
                    <div className={`p-2 rounded-xl ${selectedLayanan === l.id ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                      {l.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center">{l.name}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                  Target / Nomor Tujuan
                  <span className="text-blue-500">Cth: Nomor HP, No.Meter, dll.</span>
                </label>
                <input required type="text" value={tujuan} onChange={e => setTujuan(e.target.value)} placeholder="08xxxxxxxx / 1234xxxx" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
                  Nominal Transaksi (Rp)
                  <span className="text-blue-500">Nilai sebelum admin</span>
                </label>
                <input required type="text" value={nominal} onChange={e => setNominal(e.target.value.replace(/\D/g, ''))} placeholder="100000" className="w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" />
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="font-bold text-slate-600">Harga Layanan</span>
                  <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0'))}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="font-bold text-slate-600">Biaya Admin Platform</span>
                  <span className="font-bold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(adminFee)}</span>
                </div>
                <div className="border-t border-indigo-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-800 uppercase text-xs">Total Bayar</span>
                  <span className="font-black text-indigo-700 text-lg flex items-center gap-1">
                    Rp {new Intl.NumberFormat('id-ID').format(parseInt(nominal || '0') + adminFee)}
                  </span>
                </div>
                <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-2 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><Info className="w-3 h-3"/> Komisi RT/RW: Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.8 * 0.85))}</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-indigo-600"/> Profit Pemilik (Anda): Rp {new Intl.NumberFormat('id-ID').format(Math.floor(adminFee * 0.8 * 0.15))}</span>
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowSimulasiForm(false)} className="py-3 px-6 text-xs font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-colors border border-slate-200">Batalkan</button>
                <button type="submit" className="flex-1 py-3 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" /> Bayar Sekarang
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FinansialDashboardView(f_params: any) {
  const { ppobData, setPpobData, iuranData, setIuranData, kasData, setKasData, wargaData = [], userRole, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification, currentUser, getSetting } = f_params;
  const [activeTabId, setActiveTabId] = useState<'kas' | 'iuran' | 'ppob'>('iuran');

  const canApprove = userRole === 'Admin' || userRole === 'RW' || userRole === 'RT' || userRole === 'Bendahara' || currentUser?.isSuperAdmin;

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-200 w-fit flex-wrap gap-1">
        <button
          onClick={() => setActiveTabId('iuran')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTabId === 'iuran' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="uppercase tracking-widest hidden sm:inline">Pembayaran & Iuran Warga</span>
          <span className="uppercase tracking-widest sm:hidden">Iuran</span>
        </button>
        <button
          onClick={() => setActiveTabId('kas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTabId === 'kas' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Wallet className="w-4 h-4" />
          <span className="uppercase tracking-widest hidden sm:inline">Buku Kas RT/RW</span>
          <span className="uppercase tracking-widest sm:hidden">Kas</span>
        </button>
        <button
          onClick={() => setActiveTabId('ppob')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${activeTabId === 'ppob' ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="uppercase tracking-widest hidden sm:inline">Layanan Digital / PPOB</span>
          <span className="uppercase tracking-widest sm:hidden">PPOB</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTabId === 'kas' && (
          <KasView kasData={kasData} setKasData={setKasData} iuranData={iuranData} setIuranData={setIuranData} wargaData={wargaData} userRole={userRole} currentUser={currentUser} getSetting={getSetting} tenantId={tenantId} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />
        )}
        {activeTabId === 'iuran' && (
           <IuranView iuranData={iuranData} setIuranData={setIuranData} kasData={kasData} setKasData={setKasData} wargaData={wargaData} userRole={userRole} currentUser={currentUser} getSetting={getSetting} tenantId={tenantId} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} handleFileUpload={handleFileUpload} showNotification={showNotification} />
        )}
        {activeTabId === 'ppob' && (
           <PPOBView ppobData={ppobData} setPpobData={setPpobData} kasData={kasData} setKasData={setKasData} currentUser={currentUser} tenantId={tenantId} setIsLoadingDB={setIsLoadingDB} handleFirestoreError={handleFirestoreError} showNotification={showNotification} isPengurus={canApprove} />
        )}
      </div>
    </div>
  );
}



function SuratView({ suratData, setSuratData, wargaData = [], usersData = [], userRole, currentUser, getSetting, kopSettings, tenantId, isLoadingDB, setIsLoadingDB, handleFirestoreError, showNotification, settings, handleFileUpload }: { suratData: any[], setSuratData: any, wargaData?: any[], usersData?: any[], userRole: string, currentUser: any, getSetting: (k: string) => any, kopSettings: any, tenantId: string, isLoadingDB: boolean, setIsLoadingDB: any, handleFirestoreError: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void, settings: any, handleFileUpload: any }) {
  const [activeView, setActiveView] = useState<'manajemen' | 'arsip'>('manajemen');
  const [showSuratForm, setShowSuratForm] = useState(false);
  const [editingSurat, setEditingSurat] = useState<any | null>(null);
  const [suratToDelete, setSuratToDelete] = useState<any | null>(null);
  const [suratToReject, setSuratToReject] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterMonth, setFilterMonth] = useState("-1");
  const [showNik, setShowNik] = useState(false);
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
    setVal('kk', warga.kk);
    setVal('ttl', `${warga.tempatLahir}, ${warga.tglLahir}`);
    setVal('jk', warga.jk);
    setVal('kewarganegaraan', warga.kewarganegaraan || 'WNI');
    setVal('agama', warga.agama || 'Islam');
    setVal('pekerjaan', warga.profesi);
    setVal('statusKawin', warga.kawin);
    setVal('alamat', warga.blok);
    setVal('rt', warga.rt);
    setVal('rw', warga.rw);
    setVal('kelurahan', warga.kelurahan || 'Sukamaju');
    setVal('kecamatan', warga.kecamatan || 'Sukajaya');
    setVal('ketua', ketuaRT);
    setVal('ketua_rw_nama', ketuaRW);
    setVal('nomor_surat', nomorOtomatis);
    setVal('umur', warga.tglLahir ? Math.floor((new Date().getTime() - new Date(warga.tglLahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() : '');
    
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSetujui = async (id: string) => {
    const s = suratData.find(x => x.id === id);
    if (!s) return;
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { 
        status: "Disetujui",
        updatedAt: new Date().toISOString(),
        approvedBy: currentUser?.nama || currentUser?.name || 'Admin'
      });
      showNotification("Pengajuan surat telah disetujui.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
      showNotification("Gagal menyetujui pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleSelesaikan = async (id: string) => {
    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', id), { 
        status: "Selesai",
        updatedAt: new Date().toISOString()
      });
      showNotification("Surat telah ditandai sebagai Selesai.", 'info');
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleTolak = async () => {
    if (!suratToReject) return;
    if (!rejectReason.trim()) {
      showNotification("Sertakan alasan penolakan.", "error");
      return;
    }

    setIsLoadingDB(true);
    try {
      await updateDoc(doc(db, 'surat', suratToReject.id), { 
        status: "Ditolak", 
        catatanAlasan: rejectReason,
        updatedAt: new Date().toISOString(),
        rejectedBy: currentUser?.nama || currentUser?.name || 'Admin'
      });
      showNotification("Pengajuan surat telah ditolak.", 'info');
      setSuratToReject(null);
      setRejectReason("");
    } catch (error: any) {
      handleFirestoreError(error, 'update', `/surat/${suratToReject.id}`);
      showNotification("Gagal menolak pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDelete = async () => {
    if (!suratToDelete) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'surat', suratToDelete.id));
      setSuratData((prev: any[]) => prev.filter(s => s.id !== suratToDelete.id));
      showNotification("Pengajuan surat berhasil dihapus.", 'success');
      setSuratToDelete(null);
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/surat/${suratToDelete.id}`);
      showNotification("Gagal menghapus pengajuan surat.", 'error');
    } finally {
      setIsLoadingDB(false);
    }
  };

  useEffect(() => {
    if (showSuratForm && formRef.current) {
      if (editingSurat) {
        Object.keys(editingSurat).forEach(key => {
          const el = formRef.current?.elements.namedItem(key) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
          if (el) el.value = editingSurat[key];
        });
      } else {
        formRef.current.reset();
      }
    }
  }, [showSuratForm, editingSurat]);

  const handleEdit = (surat: any) => {
    setEditingSurat(surat);
    setShowSuratForm(true);
    // Note: Population of form will be handled via useEffect in the form component or a setup effect
  };

  const handleCetak = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat || !generateSuratHTML) return;

    const mergedSurat = { ...surat };
    
    // Attempt to merge warga data if available
    const wargaObj = wargaData?.find(w => w.nik === surat.nik);
    if (wargaObj) {
        mergedSurat.ttl = `${wargaObj.tempatLahir || '-'}, ${wargaObj.tglLahir || '-'}`;
        mergedSurat.jk = wargaObj.jk || '-';
        mergedSurat.pekerjaan = wargaObj.profesi || '-';
        mergedSurat.kewarganegaraan = wargaObj.kewarganegaraan || '-';
        mergedSurat.statusKawin = wargaObj.kawin || '-';
        mergedSurat.alamat = wargaObj.blok || (wargaObj.rt ? `RT ${wargaObj.rt} / RW ${wargaObj.rw}` : '-');
    }

    const html = generateSuratHTML(mergedSurat, kopSettings, settings);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      // Fallback to iframe if pop-up is blocked
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
  
      if (iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
        
        setTimeout(() => {
          if (iframe.contentWindow) {
             iframe.contentWindow.focus();
             iframe.contentWindow.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      }
    }
  };

  const exportSuratExcel = () => {
    const dataToExport = filteredSurat.map((item: any) => ({
      'ID Surat': item.id,
      'Tanggal': item.tanggal,
      'Pemohon': item.pemohon,
      'NIK': item.nik,
      'Jenis Surat': item.jenisSurat,
      'Keperluan': item.keperluan,
      'Status': item.status
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Surat');
    XLSX.writeFile(workbook, `Data_Surat_${tenantId}.xlsx`);
    showNotification('Data Surat berhasil diekspor ke Excel');
  };

  const handleSaveSurat = async (e: React.FormEvent<HTMLFormElement>) => {
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
      jabatan_ttd: formData.get('jabatan_ttd') as string || "Ketua RT",
      show_logo: formData.get('show_logo') as string || "yes",
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
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const handleFileUploadSurat = async (suratId: string, file: File) => {
    setUploading(true);
    setUploadPct(0);
    setIsLoadingDB(true);
    try {
      const url = await handleFileUpload(file, 'arsip_surat', (pct: number) => setUploadPct(pct));
      await updateDoc(doc(db, 'surat', suratId), { file_url: url });
      setSuratData((prev: any[]) => prev.map(s => s.id === suratId ? {...s, file_url: url} : s));
      showNotification("Berkas berhasil diupload", "success");
    } catch (error: any) {
      handleFirestoreError(error, 'write', `/surat/${suratId}`);
    } finally {
      setIsLoadingDB(false);
      setUploading(false);
    }
  };

  const completedCount = suratData.filter(s => s.status === 'Selesai').length;

  const monthMap: Record<string, string> = {
    "Jan": "0", "Feb": "1", "Mar": "2", "Apr": "3", "May": "4", "Mei": "4", "Jun": "5",
    "Jul": "6", "Aug": "7", "Agt": "7", "Sep": "8", "Oct": "9", "Okt": "9", "Nov": "10", "Dec": "11", "Des": "11"
  };

  const filteredSurat = suratData.filter(s => {
    if (activeView === 'manajemen') return s.status === 'Diajukan';
    
    // Arsip filters
    const matchesYear = filterYear === "Semua" || s.tanggal.includes(filterYear);
    
    const monthStr = s.tanggal.split(' ')[1];
    const sMonthIdx = monthMap[monthStr];
    const matchesMonth = filterMonth === "-1" || sMonthIdx === filterMonth;

    return s.status === 'Selesai' && matchesYear && matchesMonth;
  });

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pengajuan</p>
            <p className="text-2xl font-black text-slate-800 tracking-tighter">{suratData.length}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <FileText className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Belum Diproses</p>
            <p className="text-2xl font-black text-orange-600 tracking-tighter">{pendingCount}</p>
          </div>
          <div className="bg-orange-50 p-2 rounded-xl text-orange-600">
            <Activity className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sudah Selesai</p>
            <p className="text-2xl font-black text-green-600 tracking-tighter">{completedCount}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-xl text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Unified Workflow Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveView('manajemen')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'manajemen' ? 'bg-white shadow-sm text-blue-600 uppercase' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Manajemen (Active)
            </button>
            <button 
              onClick={() => setActiveView('arsip')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeView === 'arsip' ? 'bg-white shadow-sm text-blue-600 uppercase' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Arsip Digital
            </button>
          </div>
          
          <div className="flex gap-2">
            {activeView === 'arsip' && (
              <>
                <select 
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="Semua">Semua Tahun</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <select 
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-blue-500"
                >
                  <option value="-1">Semua Bulan</option>
                  {Object.entries(monthMap).map(([name, idx], i) => (
                    <option key={`${name}-${idx}-${i}`} value={idx}>{name}</option>
                  ))}
                </select>
              </>
            )}
            {userRole !== 'Viewer' && (
              <>
                <button onClick={exportSuratExcel} className="p-2 bg-white border border-slate-200 text-brand-blue rounded-xl hover:bg-blue-50 transition-all active:scale-90" title="Export Excel">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => setShowSuratForm(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Buat Surat Baru
                </button>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Status & Tanggal</th>
                <th className="px-6 py-4 text-left">Pemohon (NIK)</th>
                <th className="px-6 py-4 text-left">Maksud / Keperluan</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {filteredSurat.length > 0 ? filteredSurat.map((surat) => (
                <tr key={surat.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1.5">
                       <span className={`w-fit px-2 py-0.5 text-[8px] uppercase font-black rounded border ${
                        ['Selesai', 'Disetujui'].includes(surat.status) ? 'border-green-200 bg-green-50 text-green-700' : 
                        surat.status === 'Ditolak' ? 'border-red-200 bg-red-50 text-red-700' :
                        'border-orange-200 bg-orange-50 text-orange-700'
                      }`}>
                        {surat.status}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">{surat.tanggal}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{surat.pemohon}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{surat.nik}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-medium text-slate-600 line-clamp-2 max-w-xs">{surat.keperluan}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">{surat.jenisSurat}</p>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <div className="flex justify-end gap-1.5">
                      {userRole !== 'Viewer' && surat.status === 'Diajukan' && (
                        <>
                          <button disabled={isLoadingDB} onClick={() => handleSetujui(surat.id)} className="text-[10px] font-black uppercase text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 hover:bg-green-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait">Setujui</button>
                          <button disabled={isLoadingDB} onClick={() => setSuratToReject(surat)} className="text-[10px] font-black uppercase text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait">Tolak</button>
                        </>
                      )}

                      {userRole !== 'Viewer' && surat.status === 'Disetujui' && (
                        <button disabled={isLoadingDB} onClick={() => handleSelesaikan(surat.id)} className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50">Selesaikan</button>
                      )}
                      
                      <div className="flex gap-1">
                        {['Selesai', 'Disetujui'].includes(surat.status) && (
                          <button onClick={() => handleCetak(surat.id)} className="bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 p-2 rounded-lg border border-slate-100 transition-all" title="Cetak Surat (PDF)">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button disabled={isLoadingDB} onClick={() => handleEdit(surat)} className="bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 p-2 rounded-lg border border-slate-100 transition-all disabled:opacity-50 disabled:cursor-wait" title="Edit Data">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                         {uploading && (
                           <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300" style={{ width: `${uploadPct}%` }}></div>
                         )}
                         {surat.file_url && (
                           <a href={surat.file_url} target="_blank" rel="noreferrer" className="bg-green-50 hover:bg-green-100 text-green-600 p-2 rounded-lg border border-green-200 transition-all" title="Lihat Berkas">
                             <FileText className="w-3.5 h-3.5" />
                           </a>
                         )}
                        <button 
                          disabled={isLoadingDB || userRole === 'Viewer'} 
                          onClick={() => setSuratToDelete(surat)} 
                          className="bg-red-50 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg border border-red-100 transition-all disabled:opacity-50 disabled:cursor-wait active:scale-95 shadow-sm" 
                          title="Hapus Permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                        <FileText className="w-8 h-8 text-slate-200" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada data surat</p>
                        <p className="text-[10px] text-slate-300 italic">Data surat yang diproses atau diarsipkan akan muncul di sini.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Modal / Overlay Pembuatan Surat */}
      {showSuratForm && (
        <div className="fixed inset-0 bg-slate-900/60  flex justify-center items-center z-50 p-4 print:hidden">
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
            <form className="p-6 space-y-4 overflow-y-auto" onSubmit={handleSaveSurat} ref={formRef}>
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
                    <div className="relative">
                      <input name="nik" type={showNik ? "text" : "password"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="NIK" />
                      <button 
                        type="button"
                        onClick={() => setShowNik(!showNik)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showNik ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                      <option value="Buddha">Buddha</option>
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
                      <select name="rt" defaultValue={editingSurat?.rt || settings.RT || "01"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono">
                        {Array.from({ length: 50 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">RW</label>
                      <select name="rw" defaultValue={editingSurat?.rw || settings.RW || "26"} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-mono">
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
                      <option value="SURAT PENGANTAR (Umum)">SURAT PENGANTAR (Umum)</option>
                      <option value="SURAT PENGANTAR KTP (BARU / PERPANJANGAN)">SURAT PENGANTAR KTP (BARU / PERPANJANGAN)</option>
                      <option value="SURAT PENGANTAR KK (BARU / PERUBAHAN)">SURAT PENGANTAR KK (BARU / PERUBAHAN)</option>
                      <option value="SURAT PENGANTAR PINDAH DOMISILI">SURAT PENGANTAR PINDAH DOMISILI</option>
                      <option value="SURAT KETERANGAN DOMISILI">SURAT KETERANGAN DOMISILI</option>
                      <option value="SURAT KETERANGAN TEMPAT TINGGAL">SURAT KETERANGAN TEMPAT TINGGAL</option>
                      <option value="SURAT KETERANGAN KELAHIRAN">SURAT KETERANGAN KELAHIRAN</option>
                      <option value="SURAT KETERANGAN KEMATIAN">SURAT KETERANGAN KEMATIAN</option>
                      <option value="SURAT PENGANTAR NIKAH">SURAT PENGANTAR NIKAH</option>
                      <option value="SURAT PENGANTAR CERAI">SURAT PENGANTAR CERAI</option>
                      <option value="SURAT KETERANGAN TIDAK MAMPU (SKTM)">SURAT KETERANGAN TIDAK MAMPU (SKTM)</option>
                      <option value="SURAT PENGANTAR BANTUAN SOSIAL (BANSOS)">SURAT PENGANTAR BANTUAN SOSIAL (BANSOS)</option>
                      <option value="SURAT KETERANGAN PENGHASILAN">SURAT KETERANGAN PENGHASILAN</option>
                      <option value="SURAT KETERANGAN USAHA (SKU)">SURAT KETERANGAN USAHA (SKU)</option>
                      <option value="SURAT DOMISILI USAHA">SURAT DOMISILI USAHA</option>
                      <option value="SURAT PENGANTAR IZIN USAHA MIKRO">SURAT PENGANTAR IZIN USAHA MIKRO</option>
                      <option value="SURAT PENGANTAR SKCK">SURAT PENGANTAR SKCK</option>
                      <option value="SURAT IZIN KERAMAIAN">SURAT IZIN KERAMAIAN</option>
                      <option value="SURAT KETERANGAN DOMISILI SEKOLAH">SURAT KETERANGAN DOMISILI SEKOLAH</option>
                      <option value="SURAT PENGANTAR KERJA">SURAT PENGANTAR KERJA</option>
                      <option value="SURAT KETERANGAN MAGANG">SURAT KETERANGAN MAGANG</option>
                      <option value="SURAT PENGANTAR TAMU / LAPOR TAMU">SURAT PENGANTAR TAMU / LAPOR TAMU</option>
                      <option value="SURAT KETERANGAN KEPEMILIKAN RUMAH (NON-SERTIFIKAT)">SURAT KETERANGAN KEPEMILIKAN RUMAH (NON-SERTIFIKAT)</option>
                      <option value="SURAT PENGANTAR BANK / KREDIT">SURAT PENGANTAR BANK / KREDIT</option>
                      <option value="SURAT REKOMENDASI RT/RW (UMUM)">SURAT REKOMENDASI RT/RW (UMUM)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ketua RT (Nama TTD)</label>
                    <input name="ketua" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Nama Ketua RT" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Jabatan TTD (Label)</label>
                    <input name="jabatan_ttd" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Contoh: Ketua RT" defaultValue="Ketua RT" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ketua RW (Nama TTD)</label>
                    <input name="ketua_rw_nama" type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" placeholder="Nama Ketua RW" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Halaman Cetak (Logo)</label>
                    <select name="show_logo" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-blue-500 transition-all font-bold">
                       <option value="yes">Tampilkan Logo</option>
                       <option value="no">Sembunyikan Logo</option>
                    </select>
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
                  {editingSurat ? 'Simpan Data' : 'Ajukan Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AnimatePresence>
        {suratToDelete && (
          <ConfirmModal 
            isOpen={true}
            title="Hapus Pengajuan Surat"
            message={`Apakah Anda yakin ingin menghapus pengajuan surat oleh "${suratToDelete.pemohon}"?`}
            onConfirm={handleDelete}
            onCancel={() => setSuratToDelete(null)}
            confirmText="Hapus Permanen"
            cancelText="Batal"
            isLoading={isLoadingDB}
          />
        )}

        {suratToReject && (
          <div className="fixed inset-0 bg-slate-900/60 flex justify-center items-center z-[110] p-4">
            <motion.div 
               initial={{opacity:0, scale:0.95, y:20}} 
               animate={{opacity:1, scale:1, y:0}} 
               exit={{opacity:0, scale:0.95, y:20}}
               className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 space-y-6 border border-slate-200"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Tolak Pengajuan</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Berikan alasan tindak lanjut</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Penolakan</label>
                <textarea 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Berkas persyaratan tidak lengkap / Data tidak valid..."
                  className="w-full h-32 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 font-medium focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50/50 transition-all bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => {setSuratToReject(null); setRejectReason("");}} className="flex-1 py-3 text-slate-400 font-black uppercase text-[10px] tracking-widest bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Batal</button>
                <button onClick={handleTolak} disabled={isLoadingDB} className="flex-1 py-3 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:bg-slate-300">
                  {isLoadingDB ? 'Memproses...' : 'Tolak Surat'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KasView({ kasData, setKasData, iuranData, setIuranData, wargaData = [], userRole, currentUser, getSetting, rtId, tenantId, setIsLoadingDB, handleFirestoreError, handleFileUpload, showNotification }: { kasData: any[], setKasData: any, iuranData: any[], setIuranData: any, wargaData?: any[], userRole: string, currentUser: any, getSetting: (k: string) => any, rtId?: string, tenantId: string, setIsLoadingDB: any, handleFirestoreError: any, handleFileUpload: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
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
  const [editingKas, setEditingKas] = useState<any>(null);
  const [viewingKas, setViewingKas] = useState<any>(null);
  const [isDeletingKas, setIsDeletingKas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFileKas = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        processImportedKasData(data);
      };
      reader.readAsBinaryString(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processImportedKasData(results.data);
        },
        error: (error) => {
          console.error("CSV Import Error (Kas):", error);
          showNotification("Gagal mengimpor data kas. Pastikan format CSV benar.", 'error');
        }
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const processImportedKasData = async (data: any[]) => {
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newData = data.map((row: any, idx: number) => {
      const debit = parseInt(row['Debit'] || row['debit'] || row['Masuk'] || row['masuk'] || "0");
      const kredit = parseInt(row['Kredit'] || row['kredit'] || row['Keluar'] || row['keluar'] || "0");
      const tipe = debit > 0 ? "Masuk" : "Keluar";
      
      return {
        tenantId: tenantId,
        id: row['ID Transaksi'] || row['id'] || `TRX-IMP-${Date.now()}-${idx}`,
        tanggal: row['Tanggal'] || row['tanggal'] || formattedDate,
        tipe: row['Tipe'] || row['tipe'] || tipe,
        transaksi: row['Transaksi'] || row['transaksi'] || (debit > 0 ? "Pemasukan Lainnya" : "Pengeluaran Lainnya"),
        nama: row['Nama'] || row['nama'] || "Umum",
        keterangan: row['Keterangan'] || row['keterangan'] || "Import Data",
        debit: debit,
        kredit: kredit,
        strukUrl: ""
      };
    });

    if (newData.length > 0) {
      setIsLoadingDB(true);
      try {
        for (const item of newData) {
          await setDoc(doc(db, 'kas', item.id), item);
        }
        setKasData((prev: any) => [...newData, ...prev]);
        showNotification(`Berhasil mengimpor ${newData.length} data transaksi kas.`, 'success');
      } catch (error: any) {
        console.error("Firebase Import Error (Kas):", error);
        handleFirestoreError(error, 'create', '/kas/import');
        showNotification("Gagal sinkronisasi data kas ke Firebase.", 'error');
      } finally {
        setIsLoadingDB(false);
      }
    } else {
      showNotification("Tidak ada data transaksi valid yang ditemukan.", 'info');
    }
  };

  const exportSingleTrxPDF = (trx: any) => {
    const doc = new jsPDF();
    const settings = getSetting("KOP_SURAT") || {};
    
    // Header
    doc.setFontSize(16);
    doc.text(settings.nama_organisasi || "RW26 BERJUANG", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(settings.alamat || "Laporan Transaksi", 105, 26, { align: 'center' });
    doc.line(20, 32, 190, 32);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI TRANSAKSI", 105, 45, { align: 'center' });

    // Data
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const startY = 60;
    const lineH = 8;
    
    const data = [
      ["ID Transaksi", trx.id],
      ["Tanggal", trx.tanggal],
      ["Tipe", trx.tipe],
      ["Kategori", trx.transaksi],
      ["Nama", trx.nama],
      ["Keterangan", trx.keterangan],
      ["Nominal", formatRupiah(trx.debit || trx.kredit)],
    ];

    data.forEach((row, i) => {
      doc.text(row[0], 30, startY + (i * lineH));
      doc.text(": " + row[1], 70, startY + (i * lineH));
    });

    doc.line(20, startY + (data.length * lineH) + 5, 190, startY + (data.length * lineH) + 5);
    
    // Footer
    const footerY = 150;
    doc.text("Dicetak pada: " + new Date().toLocaleString('id-ID'), 20, footerY);
    doc.text("Bendahara,", 150, footerY);
    doc.text("( ____________________ )", 150, footerY + 30);

    doc.save(`Bukti_${trx.id}.pdf`);
    showNotification("PDF Berhasil diunduh");
  };

  const handleDeleteKas = async () => {
    if (!kasToDelete) return;
    
    setIsDeletingKas(true);
    try {
      await deleteDoc(doc(db, 'kas', kasToDelete.id));

      // Sync delete with Iuran if linked
      if (kasToDelete.iuranId) {
        await deleteDoc(doc(db, 'iuran', kasToDelete.iuranId));
        setIuranData((prev: any[]) => prev.filter(i => i.id !== kasToDelete.iuranId));
      }
    
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

  const handleSaveKas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const dateInput = formData.get('tanggal') as string;
    const dateObj = dateInput ? new Date(dateInput) : new Date();
    const formattedDate = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    
    const newId = editingKas ? editingKas.id : `TRX-${Date.now()}`;
    let nominal = parseInt((formData.get('nominal') as string).replace(/\D/g, '') || "0");
    
    // Auto nominal from settings if zero
    if (nominal === 0 && trxType === 'Masuk' && !editingKas) {
      const defaultNominal = parseInt(getSetting("NOMINAL_IURAN").replace(/\D/g, '') || "0");
      if (defaultNominal) nominal = defaultNominal;
    }
    
    const transaksi = formData.get('transaksi') as string;
    const nama = formData.get('nama') as string;
    const keterangan = formData.get('keterangan') as string;
    
    const newTrx = {
      tenantId: tenantId,
      rt: currentUser?.rt || '01',
      id: newId,
      tanggal: editingKas ? editingKas.tanggal : formattedDate,
      tipe: trxType,
      transaksi: transaksi,
      nama: nama,
      alamat: formData.get('alamat') as string || "-",
      keterangan: keterangan,
      debit: trxType === 'Masuk' ? nominal : 0,
      kredit: trxType === 'Keluar' ? nominal : 0,
      strukUrl: strukUrl
    };

    setIsLoadingDB(true);
    try {
      if (editingKas) {
        await updateDoc(doc(db, 'kas', editingKas.id), newTrx);
        setKasData((prev: any[]) => prev.map(t => t.id === editingKas.id ? newTrx : t));
      } else {
        await setDoc(doc(db, 'kas', newId), newTrx);
        setKasData((prev: any[]) => {
          const exists = prev.some(k => k.id === newTrx.id);
          if (exists) return prev;
          return [newTrx, ...prev];
        });
      }

      setShowMasukForm(false);
      setEditingKas(null);
      showNotification(`${trxType === 'Masuk' ? 'Pemasukan' : 'Pengeluaran'} berhasil disimpan.`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, editingKas ? 'update' : 'create', `/kas/${newId}`);
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
  // Deduplicate and filter by RT if provided (and user is not RW/Admin)
  const uniqueKasData = Array.from(new Map(kasData.map(item => [item.id, item])).values())
    .filter(item => {
      // If user is RT, they only see their RT data
      if (currentUser?.role === 'RT') {
        return item.rt === currentUser.rt;
      }
      // If it's a specific rtId filter from props
      if (rtId) return item.rt === rtId;
      return true;
    });
  
  const parseDateKas = (dString: string) => {
    if (!dString) return 0;
    const parts = dString.split(" ");
    if (parts.length === 3) {
       const mId = { jan:0, feb:1, mar:2, apr:3, mei:4, may:4, jun:5, jul:6, agt:7, aug:7, sep:8, okt:9, oct:9, nov:10, des:11, dec:11 };
       const m = parts[1].toLowerCase().replace(/[^a-z]/g, '');
       return new Date(parseInt(parts[2]), mId[m as keyof typeof mId] ?? 0, parseInt(parts[0])).getTime();
    }
    return new Date(dString).getTime() || 0;
  };

  const allProcessedData = [...uniqueKasData].sort((a, b) => {
    return parseDateKas(a.tanggal) - parseDateKas(b.tanggal);
  }).map(trx => {
    balance = balance + trx.debit - trx.kredit;
    return { ...trx, saldoAkhir: balance };
  });

  // Filter based on selected month and year
  const filteredData = allProcessedData.filter(trx => {
    const dTime = parseDateKas(trx.tanggal);
    const date = new Date(dTime);
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
            Transaksi
          </h3>
          <div className="flex gap-2">
            {userRole !== 'Viewer' && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImportFileKas} 
                  className="hidden" 
                  accept=".csv, .xlsx, .xls" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="flex items-center justify-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all shadow-md active:scale-95"
                  title="Upload Database Transaksi (CSV/Excel)"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
              </>
            )}
            <button onClick={() => { setTrxType('Masuk'); setShowMasukForm(true); }} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all hover:bg-green-700 shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" /> Catat Transaksi
            </button>
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
                <th className="px-6 py-3 text-center">Aksi</th>
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
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button 
                        onClick={() => setViewingKas(trx)} 
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded transition-all" 
                        title="Lihat Detail"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => exportSingleTrxPDF(trx)} 
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-all" 
                        title="Ekspor ke PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingKas(trx);
                          setTrxType(trx.tipe);
                          setStrukUrl(trx.strukUrl || "");
                          setShowMasukForm(true);
                        }} 
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-all" 
                        title="Edit Transaksi"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => setKasToDelete(trx)} 
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-all border border-red-100 hover:border-red-200" 
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
        <div className="fixed inset-0 bg-slate-900/60  flex justify-center items-center z-50 p-4 print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                {editingKas ? <Edit2 className="w-4 h-4 text-blue-600" /> : <PlusCircle className="w-4 h-4 text-blue-600" />}
                {editingKas ? 'Edit' : 'Catat'} Transaksi
              </h3>
              <button 
                onClick={() => {
                  setShowMasukForm(false);
                  setEditingKas(null);
                }} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleSaveKas} className="p-5 overflow-y-auto space-y-4">
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
                  <input name="tanggal" required type="date" defaultValue={editingKas ? new Date(editingKas.tanggal).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Tipe Transaksi</label>
                  <select name="tipe" value={trxType} onChange={(e) => setTrxType(e.target.value as any)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                    <option value="Masuk">Pemasukan (Masuk)</option>
                    <option value="Keluar">Pengeluaran (Keluar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nama Pembayar / Penerima</label>
                <input name="nama" list="wargaListKas" required defaultValue={editingKas?.nama} placeholder="Ketik Nama..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
                <datalist id="wargaListKas">
                  {wargaData.map((w, idx) => <option key={w.nik || `kas-warga-${idx}`} value={w.nama} />)}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Nominal (Rp)</label>
                <input name="nominal" required defaultValue={editingKas ? (editingKas.debit || editingKas.kredit) : ""} placeholder="0" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Transaksi / Kategori</label>
                <select name="transaksi" required defaultValue={editingKas?.transaksi} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium cursor-pointer">
                  <optgroup label="Pemasukan">
                    <option value="Kas Lingkungan">Kas Lingkungan</option>
                    <option value="Partisipasi Pembangunan">Partisipasi Pembangunan</option>
                    <option value="Dana Kelurahan/Pemerintah">Dana Kelurahan/Pemerintah</option>
                    <option value="Donasi & Bantuan Sosial">Donasi & Bantuan Sosial</option>
                    <option value="Sponsorship & Donatur">Sponsorship & Donatur</option>
                    <option value="Hasil Usaha RT/RW">Hasil Usaha RT/RW</option>
                  </optgroup>
                  <optgroup label="Pengeluaran">
                    <option value="Transaksi">Transaksi</option>
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
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Alamat (Opsional)</label>
                <input name="alamat" type="text" defaultValue={editingKas?.alamat} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Alamat terkait transaksi" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan Tambahan</label>
                <input name="keterangan" required type="text" defaultValue={editingKas?.keterangan} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="Cth: Pembayaran iuran / Biaya perbaikan" />
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
                <button 
                  type="button" 
                  onClick={() => {
                    setShowMasukForm(false);
                    setEditingKas(null);
                  }} 
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  {editingKas ? 'Simpan Perubahan' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {viewingKas && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Detail Transaksi
              </h3>
              <button 
                onClick={() => setViewingKas(null)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ID Transaksi</p>
                  <p className="text-sm font-bold text-slate-700">{viewingKas.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tanggal</p>
                  <p className="text-sm font-bold text-slate-700">{viewingKas.tanggal}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pihak Terkait</p>
                  <p className="text-sm font-bold text-slate-700">{viewingKas.nama}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipe</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${viewingKas.tipe === 'Masuk' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {viewingKas.tipe}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Kategori</p>
                  <p className="text-sm font-bold text-slate-700">{viewingKas.transaksi}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nominal</p>
                  <p className="text-lg font-black text-slate-800">{formatRupiah(viewingKas.debit || viewingKas.kredit)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Keterangan</p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{viewingKas.keterangan || "-"}</p>
              </div>

              {viewingKas.strukUrl && (
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Bukti Struk</p>
                   <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group">
                      <img src={viewingKas.strukUrl} alt="Struk" className="w-full h-full object-contain" />
                      <a 
                        href={viewingKas.strukUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                           <Eye className="w-4 h-4" /> Buka Full Gambar
                        </span>
                      </a>
                   </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => exportSingleTrxPDF(viewingKas)}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Cetak PDF
              </button>
              <button 
                onClick={() => setViewingKas(null)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {kasToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm w-full border border-slate-200 text-center p-6 space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                 <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Hapus Transaksi?</h3>
              <p className="text-sm text-slate-500 font-medium">Tindakan ini akan menghapus catatan transaksi secara permanen dari sistem dan menyinkronkan data keuangan terkait.</p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setKasToDelete(null)}
                   className="flex-1 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleDeleteKas}
                   disabled={isDeletingKas}
                   className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 transition-all disabled:opacity-50"
                 >
                   {isDeletingKas ? 'Menghapus...' : 'Ya, Hapus'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function PengaturanView({ tenantId, currentTenant, wargaData, settings, userRole, handleFileUpload, showNotification, currentUser, setActiveTab }: { tenantId: string, currentTenant?: any, wargaData?: any[], settings: any, userRole: string, handleFileUpload: any, showNotification: any, currentUser: any, setActiveTab: any }) {
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
      {/* Package Summary */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-0 opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Paket: {currentTenant?.status || 'Trial'}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Langganan Anda Saat Ini</p>
              {currentUser?.isSuperAdmin && (
                <button 
                  onClick={() => setActiveTab('super-admin')}
                  className="mt-2 text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Shield className="w-3 h-3" /> Kelola (Tambah Slot) di Manajemen Tenant
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-8 items-center min-w-[250px]">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Penggunaan Warga</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-800 leading-none">{wargaData?.length || 0}</span>
                <span className="text-sm font-bold text-slate-500">/ {currentTenant?.maxWarga || 50} Limit</span>
              </div>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full overflow-hidden flex" style={{ background: `conic-gradient(#3b82f6 ${((wargaData?.length || 0) / (currentTenant?.maxWarga || 50)) * 100}%, #e2e8f0 0)` }}>
                <div className="w-9 h-9 m-auto bg-slate-50 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-700">{Math.round(((wargaData?.length || 0) / (currentTenant?.maxWarga || 50)) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Informasi RT & Kop Surat</h4>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nama Instansi / RT (Kop)</label>
              <input name="nama_rt" defaultValue={settings.nama_rt} placeholder="Contoh: PENGURUS RUKUN TETANGGA 04" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">RT</label>
                <input name="rt" defaultValue={settings.rt} placeholder="04" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">RW</label>
                <input name="rw" defaultValue={settings.rw} placeholder="09" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Kelurahan</label>
              <input name="kelurahan" defaultValue={settings.kelurahan} placeholder="Kebalen" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Kecamatan</label>
              <input name="kecamatan" defaultValue={settings.kecamatan} placeholder="Babelan" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Kabupaten/Kota</label>
              <input name="kabupaten" defaultValue={settings.kabupaten} placeholder="KABUPATEN BEKASI" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Alamat Sekretariat</label>
              <textarea name="alamat" defaultValue={settings.alamat} rows={2} placeholder="Jl. Merdeka No. 123..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Logo RT/RW (Ganti Image)</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const url = await handleFileUpload(file, 'logo_rt_rw');
                        const input = document.getElementById('logo_url_input') as HTMLInputElement;
                        if (input) {
                          input.value = url;
                          showNotification("Logo berhasil diupload. Klik 'Simpan Pengaturan' untuk menerapkan.", "info");
                        }
                      } catch (err) {
                        showNotification("Gagal upload logo", "error");
                      }
                    }
                  }}
                  className="flex-1 text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer" 
                />
                <input name="logo_url" id="logo_url_input" type="hidden" defaultValue={settings.logo_url} />
                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {settings.logo_url ? <img src={settings.logo_url} className="w-full h-full object-contain" /> : <Image className="w-5 h-5 text-slate-400" />}
                </div>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 italic">*Maksimal 2MB. Logo akan tampil di kop surat pengantar.</p>
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

      <div className="bg-red-50 p-6 rounded-xl border border-red-200">
        <h4 className="text-sm font-bold text-red-800 mb-2">Peringatan: Reset Data Warga</h4>
        <p className="text-xs text-red-600 mb-4">Fitur ini akan menghapus <strong>SELURUH</strong> data warga di sistem. Data yang sudah dihapus tidak bisa dikembalikan. Gunakan dengan sangat hati-hati.</p>
        <button 
          onClick={async () => {
            if (confirm("Apakah Anda yakin ingin menghapus SELURUH data warga? Tindakan ini tidak dapat dibatalkan!")) {
              try {
                // Delete batch
                const { collection, getDocs, writeBatch, doc } = await import('firebase/firestore');
                const wargaSnapshot = await getDocs(collection(db, 'data_warga'));
                const batch = writeBatch(db);
                wargaSnapshot.forEach((docSnapshot) => batch.delete(docSnapshot.ref));
                await batch.commit();
                showNotification("Seluruh data warga berhasil dihapus.", "success");
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
          disabled={isGenerating || ((wargaData?.length || 0) + 20 > (currentTenant?.maxWarga || 50))}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-md disabled:bg-orange-300 flex items-center gap-2 disabled:cursor-not-allowed"
          title={((wargaData?.length || 0) + 20 > (currentTenant?.maxWarga || 50)) ? `Sisa slot paket tidak cukup (Butuh 20 slot)` : undefined}
        >
          {isGenerating ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <Database className="w-4 h-4" />}
          {isGenerating ? 'Memproses...' : 'Generate 120 Data Dummy'}
        </button>
      </div>
    </div>
  );
}

function VerifikasiAdminView({ verifikasiData, wargaData, tenantId, isLoadingDB: globalLoading, setIsLoadingDB, showNotification, handleFirestoreError, currentUser }: { verifikasiData: any[], wargaData: any[], tenantId: string, isLoadingDB: boolean, setIsLoadingDB: any, showNotification: any, handleFirestoreError: any, currentUser: any }) {
  const [filter, setFilter] = useState<'All' | 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak'>('Menunggu Persetujuan');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [catatan, setCatatan] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Sync selectedItem with latest verifikasiData to prevent stale state in modal
  useEffect(() => {
    if (selectedItem) {
      const latest = verifikasiData.find(v => v.id === selectedItem.id);
      if (latest && JSON.stringify(latest) !== JSON.stringify(selectedItem)) {
        setSelectedItem(latest);
      }
    }
  }, [verifikasiData, selectedItem]);

  const filteredData = useMemo(() => {
    // 1. Group by NIK and pick the one with latest submittedAt or status priority
    const uniqueMap: Record<string, any> = {};
    
    verifikasiData.forEach(item => {
      const nik = item.nik || 'unknown';
      const existing = uniqueMap[nik];
      
      if (!existing) {
        uniqueMap[nik] = item;
      } else {
        // Priority logic: Prefer 'Menunggu Persetujuan', then latest submittedAt
        const isNewer = (item.submittedAt || '') > (existing.submittedAt || '');
        const itemPrio = item.status === 'Menunggu Persetujuan' ? 2 : (!item.status || item.status === '-' ? 0 : 1);
        const existingPrio = existing.status === 'Menunggu Persetujuan' ? 2 : (!existing.status || existing.status === '-' ? 0 : 1);
        
        if (itemPrio > existingPrio || (itemPrio === existingPrio && isNewer)) {
          uniqueMap[nik] = item;
        }
      }
    });

    const dedupedData = Object.values(uniqueMap);

    // 2. Apply filters
    return dedupedData.filter((v: any) => {
      const matchFilter = filter === 'All' || v.status === filter;
      const matchSearch = String(v.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) || String(v.nik || '').includes(searchQuery);
      return matchFilter && matchSearch;
    });
  }, [verifikasiData, filter, searchQuery]);

  const handleApprove = async (item: any) => {
    if (actionLoading) return;
    
    // Safety check for NIK
    if (!item.nik) {
      showNotification("NIK tidak valid. Data tidak bisa disetujui.", "error");
      return;
    }

    setActionLoading(true);
    // Remove global setIsLoadingDB(true) to avoid full-screen overlay covering the modal
    try {
      const batch = writeBatch(db);
      const docId = item.id;
      if (!docId) throw new Error("ID data verifikasi tidak ditemukan.");

      // 1. Update status in verifikasi_warga
      const vRef = doc(db, 'verifikasi_warga', docId);
      const approveNote = catatan.trim() || 'Disetujui oleh admin';
      batch.update(vRef, {
        status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser.name || currentUser.displayName || 'Admin',
        catatan: approveNote
      });

      // 2. Update main warga record
      const standardDocId = `${tenantId}_${item.nik}`;
      const targetRef = doc(db, 'data_warga', standardDocId);
      const targetSnap = await getDoc(targetRef);
      
      const legacyRef = doc(db, 'data_warga', item.nik);
      const legacySnap = (item.nik !== standardDocId) ? await getDoc(legacyRef) : null;
      const legacyData = legacySnap?.exists() ? legacySnap.data() : null;

      const updatedData = {
        nama: item.nama || targetSnap.data()?.nama || legacyData?.nama || "",
        kk: item.kk || targetSnap.data()?.kk || legacyData?.kk || "",
        blok: item.alamat || item.blok || targetSnap.data()?.blok || legacyData?.blok || "",
        hp: item.hp || targetSnap.data()?.hp || legacyData?.hp || "",
        profesi: item.pekerjaan || item.profesi || targetSnap.data()?.profesi || legacyData?.profesi || "",
        pendidikanTerakhir: item.pendidikan || item.pendidikanTerakhir || targetSnap.data()?.pendidikanTerakhir || legacyData?.pendidikanTerakhir || "",
        kawin: item.statusKawin || item.kawin || targetSnap.data()?.kawin || legacyData?.kawin || "",
        foto: item.ktpUrl || targetSnap.data()?.foto || legacyData?.foto || "",
        ktpUrl: item.ktpUrl || targetSnap.data()?.ktpUrl || legacyData?.ktpUrl || "",
        rt: item.rt || targetSnap.data()?.rt || legacyData?.rt || "01",
        rw: item.rw || targetSnap.data()?.rw || legacyData?.rw || "05",
        tempatLahir: item.tempatLahir || targetSnap.data()?.tempatLahir || legacyData?.tempatLahir || "",
        tglLahir: item.tglLahir || targetSnap.data()?.tglLahir || legacyData?.tglLahir || "",
        jk: item.jk || targetSnap.data()?.jk || legacyData?.jk || "",
        agama: item.agama || targetSnap.data()?.agama || legacyData?.agama || "Islam",
        posisi: item.posisi || targetSnap.data()?.posisi || legacyData?.posisi || "",
        kewarganegaraan: item.kewarganegaraan || targetSnap.data()?.kewarganegaraan || legacyData?.kewarganegaraan || "WNI",
        terverifikasi: true,
        keteranganVerifikasi: approveNote,
        updatedAt: new Date().toISOString()
      };

      batch.set(targetRef, {
        tenantId: tenantId,
        status: 'Warga Tetap',
        ...updatedData
      }, { merge: true });

      if (legacySnap?.exists() && standardDocId !== item.nik) {
        batch.delete(legacyRef);
      }

      await batch.commit();
      showNotification(`Data ${item.nama} telah disetujui.`, "success");
      setSelectedItem(null);
      setCatatan('');
    } catch (err) {
      console.error("Approve Error:", err);
      handleFirestoreError(err, 'update', 'verifikasi_warga');
      showNotification("Gagal memproses persetujuan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item: any) => {
    if (actionLoading) return;
    
    const isAlreadyApproved = item.status === 'Disetujui';
    const isModalOpen = selectedItem && selectedItem.id === item.id;
    let reason = isModalOpen ? catatan.trim() : "";
    
    if (!reason) {
      if (isModalOpen) {
        showNotification("Harap isi Catatan Verifikasi di atas untuk alasan penolakan.", "warning");
        return;
      }
      
      const promptTitle = isAlreadyApproved 
        ? `ALASAN BATALKAN PERSETUJUAN (${item.nama}):` 
        : `ALASAN PENOLAKAN (${item.nama}):`;
      
      const promptReason = prompt(promptTitle, "");
      if (promptReason === null) return; // User cancelled
      if (promptReason.trim().length === 0) {
        showNotification("Alasan penolakan wajib diisi.", "warning");
        return;
      }
      reason = promptReason.trim();
    }

    const confirmMsg = isAlreadyApproved 
      ? `Batalkan persetujuan dan tolak pengajuan ${item.nama}?` 
      : `Tolak pengajuan data ${item.nama}?`;

    // Removed confirm for faster workflow as requested
    
    setActionLoading(true);
    try {
      const batch = writeBatch(db);
      const vRef = doc(db, 'verifikasi_warga', item.id);
      
      batch.update(vRef, {
        status: 'Ditolak',
        catatan: reason,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser?.name || currentUser?.displayName || 'Admin'
      });

      if (isAlreadyApproved) {
        const citizenDocId = `${tenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', citizenDocId);
        batch.update(wargaRef, {
          terverifikasi: false,
          keteranganVerifikasi: `Persetujuan dibatalkan: ${reason}`,
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();
      showNotification(`Pengajuan ${item.nama} telah ditolak.`, "info");
      setSelectedItem(null);
      setCatatan('');
    } catch (err) {
      console.error("Reject Error:", err);
      handleFirestoreError(err, 'update', 'verifikasi_warga');
      showNotification("Gagal memproses penolakan.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (actionLoading) return;
    if (!confirm("Hapus data verifikasi ini secara permanen?")) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'verifikasi_warga', itemId));
      showNotification("Data verifikasi berhasil dihapus permanen.", "success");
      if (selectedItem?.id === itemId) setSelectedItem(null);
    } catch (err) {
      handleFirestoreError(err, 'delete', 'verifikasi_warga');
    } finally {
      setActionLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Menunggu Persetujuan': 'bg-yellow-100 text-yellow-700',
    'Disetujui': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700'
  };

  const handleMassSync = async () => {
    const approvedNotSynced = verifikasiData.filter(v => v.status === 'Disetujui' && !v.isFinalized);
    if (approvedNotSynced.length === 0) {
      showNotification("Semua data terverifikasi sudah sinkron.", "info");
      return;
    }

    setIsLoadingDB(true);
    let successCount = 0;
    try {
      const batch = writeBatch(db);
      for (const item of approvedNotSynced) {
        const targetDocId = `${tenantId}_${item.nik}`;
        const wargaRef = doc(db, 'data_warga', targetDocId);
        const vRef = doc(db, 'verifikasi_warga', item.id);
        
        batch.set(wargaRef, {
          nama: item.nama || "",
          nik: item.nik,
          kk: item.kk || "",
          hp: item.hp || "",
          blok: item.blok || item.alamat || "",
          rt: item.rt || "01",
          rw: item.rw || "05",
          terverifikasi: true,
          tenantId: tenantId,
          lastSyncedAt: new Date().toISOString()
        }, { merge: true });

        batch.update(vRef, { isFinalized: true, finalizedAt: new Date().toISOString() });
        successCount++;
      }
      await batch.commit();
      showNotification(`Berhasil menyinkronkan ${successCount} data ke warga utama.`, "success");
    } catch (err) {
      handleFirestoreError(err, 'update', 'mass_sync');
    } finally {
      setIsLoadingDB(false);
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-full overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 w-full">
        <div className="w-full">
          <h1 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
            Verifikasi Data Mandiri
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Kelola pengajuan perbaikan data dari warga secara mandiri.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleMassSync}
            disabled={!verifikasiData.some(v => v.status === 'Disetujui' && !v.isFinalized)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:grayscale whitespace-nowrap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sinkronkan
          </button>
          
          <div className="hidden sm:block h-4 w-px bg-slate-200 mx-1 shrink-0" />
          
          <div className="flex overflow-x-auto gap-2 w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {['All', 'Menunggu Persetujuan', 'Disetujui', 'Ditolak'].map((f: any) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-orange-400 text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden w-full">
        <div className="p-4 border-b border-slate-50 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari NIK atau Nama..." 
            className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Warga</th>
                <th className="px-6 py-4">Agama</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Diajukan</th>
                <th className="px-6 py-4">Terakhir Oleh</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr key="empty-verifikasi">
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">Tidak ada pengajuan data.</td>
                </tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                          {item.ktpUrl ? <img src={item.ktpUrl} alt="KTP" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.nama}</p>
                          <p className="text-[10px] font-medium text-slate-400">NIK: {item.nik}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      {item.agama || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[item.status]}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs text-slate-400">
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-500 text-xs">
                      {item.approvedBy || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!item.isFinalized && (item.status === 'Menunggu Persetujuan' || item.status === 'Disetujui')) && (
                          <>
                            {item.status === 'Menunggu Persetujuan' && (
                              <button 
                                onClick={() => handleApprove(item)}
                                disabled={actionLoading}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100 disabled:opacity-50"
                                title="Setujui"
                              >
                                {actionLoading ? <div className="w-5 h-5 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                              </button>
                            )}
                            <button 
                              onClick={() => handleReject(item)}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
                              title={item.status === 'Disetujui' ? 'Batalkan & Tolak' : 'Tolak'}
                            >
                              {actionLoading ? <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div> : <XCircle className="w-5 h-5" />}
                            </button>
                          </>
                        )}
                          <button 
                            onClick={() => {
                              setCatatan('');
                              setSelectedItem(item);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent disabled:opacity-50"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/40 "
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Detail Verifikasi: {selectedItem.nama}</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(selectedItem.id)}
                    disabled={actionLoading}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="Hapus Permanen"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => { setSelectedItem(null); setCatatan(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-8 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                  {/* Left Column: Form Changes */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Perubahan Data</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Nama Lengkap Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.nama}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">KK Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kk}</p>
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Alamat / Blok Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.blok}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Agama Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.agama || 'Islam'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Jenis Kelamin</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.jk || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tempat Lahir</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.tempatLahir || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tanggal Lahir</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.tglLahir || '-'}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">HP Baru</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.hp}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Pekerjaan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.profesi}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Pendidikan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.pendidikanTerakhir}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Status Kawin</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kawin}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Posisi Keluarga</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.posisi}</p>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase mb-1 block">Kewarganegaraan</label>
                        <p className="text-slate-800 border-b border-slate-100 pb-1">{selectedItem.kewarganegaraan}</p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="text-[10px] text-slate-400 uppercase mb-2 block font-black">Catatan Verifikasi</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-blue-500 h-24"
                        placeholder="Berikan alasan jika menolak..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => handleApprove(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Disetujui'}
                        className="flex-1 bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Memproses...' : 'Setujui Data'}
                      </button>
                      <button 
                        onClick={() => handleReject(selectedItem)}
                        disabled={actionLoading || selectedItem.status === 'Ditolak' || selectedItem.isFinalized}
                        className="flex-1 bg-red-50 text-red-600 font-bold py-4 rounded-2xl border border-red-100 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                      >
                        {actionLoading ? (
                          <div className="w-5 h-5 border-2 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                        {actionLoading ? 'Memproses...' : (selectedItem.status === 'Disetujui' ? 'Batalkan & Tolak' : 'Tolak')}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Files */}
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-50 pb-2">Dokumen Pendukung</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase mb-2">Foto KTP / Profil</p>
                        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-56 flex items-center justify-center">
                          {selectedItem.ktpUrl ? (
                            <img src={selectedItem.ktpUrl} alt="KTP" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-[9px] text-slate-400 italic font-black">Tidak Ada File</p>
                            </div>
                          )}
                          {selectedItem.ktpUrl && (
                            <a href={selectedItem.ktpUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="text-white w-8 h-8" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase mb-2">Kartu Keluarga (KK)</p>
                        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 h-56 flex items-center justify-center">
                          {selectedItem.kkUrl ? (
                            <img src={selectedItem.kkUrl} alt="KK" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-[9px] text-slate-400 italic font-black">Tidak Ada File</p>
                            </div>
                          )}
                          {selectedItem.kkUrl && (
                            <a href={selectedItem.kkUrl} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="text-white w-8 h-8" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WargaProfileView({ wargaData, verifikasiData, suratData = [], setSuratData, setWargaAuth, tenantId, isLoadingDB, setIsLoadingDB, handleFileUpload, showNotification, handleFirestoreError, kopSettings, getSetting, usersData, generateSuratHTML, settings }: { wargaData: any, verifikasiData: any[], suratData?: any[], setSuratData: any, setWargaAuth: any, tenantId: string, isLoadingDB: boolean, setIsLoadingDB: any, handleFileUpload: any, showNotification: any, handleFirestoreError: any, kopSettings: any, getSetting: any, usersData: any[], generateSuratHTML: any, settings: any }) {
  const [activeCitizenTab, setActiveCitizenTab] = useState<'profil' | 'layanan' | 'riwayat'>('profil');
  const [uploadPct, setUploadPct] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(wargaData);
  const [files, setFiles] = useState<{ktp?: File, kk?: File}>({});
  const [uploading, setUploading] = useState(false);

  // Get active submission for data verification
  const activeSubmission = verifikasiData.find(v => v.nik === wargaData.nik);
  
  // Get citizen's letters
  const mySurat = suratData.filter(s => s.nik === wargaData.nik);

  const getAutoNomorSurat = (rt: string, rw: string) => {
    const year = new Date().getFullYear();
    const lastCount = suratData.length + 1;
    const num = `${lastCount}`.padStart(3, '0');
    // Simple Roman Month
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const month = romanMonths[new Date().getMonth()];
    return `${num}/RT.${rt}/RW.${rw}/${month}/${year}`;
  };

  const handleAjukanSurat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsLoadingDB(true);

    try {
      const suratId = `SRT-${Date.now()}`;
      const now = new Date();
      const formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      
      const rt = wargaData.rt || "01";
      const rw = wargaData.rw || "01";
      const nomorOtomatis = getAutoNomorSurat(rt, rw);
      
      // Get officials from usersData
      const ketuaRT = usersData.find(u => u.role === 'RT' && u.rt === rt)?.nama || "";
      const ketuaRW = usersData.find(u => u.role === 'RW')?.nama || "";

      const payload = {
        tenantId,
        id: suratId,
        authUid: auth.currentUser?.uid || "",
        tanggal: formattedDate,
        submittedAt: now.toISOString(),
        pemohon: wargaData.nama,
        nik: wargaData.nik,
        kk: wargaData.kk || "",
        ttl: `${wargaData.tempatLahir || ''}, ${wargaData.tglLahir || ''}`,
        jk: wargaData.jk || "",
        kewarganegaraan: wargaData.kewarganegaraan || "WNI",
        pekerjaan: wargaData.profesi || "",
        agama: wargaData.agama || "Islam",
        statusKawin: wargaData.statusKawin || wargaData.posisi || "Belum Kawin",
        alamat: `RT ${rt} / RW ${rw}, Blok ${wargaData.blok || '-'}`,
        rt,
        rw,
        kelurahan: wargaData.kelurahan || "Sukamaju",
        kecamatan: wargaData.kecamatan || "Sukajaya",
        keperluan: fd.get('keperluan') as string,
        jenisSurat: fd.get('jenisSurat') as string,
        status: "Diajukan",
        nomor_surat: nomorOtomatis,
        ketua: ketuaRT,
        ketua_rw_nama: ketuaRW,
        show_logo: "yes",
        jabatan_ttd: "Ketua RT"
      };

      await setDoc(doc(db, 'surat', suratId), payload);
      setSuratData([payload, ...suratData]);
      showNotification("Pengajuan surat berhasil dikirim!", "success");
      setActiveCitizenTab('riwayat');
    } catch (err) {
      handleFirestoreError(err, 'create', 'surat');
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleCetakSurat = (id: string) => {
    const surat = suratData.find(s => s.id === id);
    if (!surat || surat.status !== 'Selesai' || !generateSuratHTML) {
        showNotification("Surat belum selesai atau sistem cetak tidak siap.", "error");
        return;
    }
    
    const mergedSurat = { ...surat };
    if (wargaData) {
        mergedSurat.ttl = `${wargaData.tempatLahir || '-'}, ${wargaData.tglLahir || '-'}`;
        mergedSurat.jk = wargaData.jk || '-';
        mergedSurat.pekerjaan = wargaData.profesi || '-';
        mergedSurat.kewarganegaraan = wargaData.kewarganegaraan || '-';
        mergedSurat.statusKawin = wargaData.kawin || '-';
        mergedSurat.alamat = wargaData.blok || (wargaData.rt ? `RT ${wargaData.rt} / RW ${wargaData.rw}` : '-');
    }

    const html = generateSuratHTML(mergedSurat, kopSettings, settings);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      // Fallback to iframe if pop-up is blocked
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
  
      if (iframe.contentWindow) {
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(html);
        iframe.contentWindow.document.close();
        
        setTimeout(() => {
          if (iframe.contentWindow) {
             iframe.contentWindow.focus();
             iframe.contentWindow.print();
          }
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 1000);
        }, 500);
      }
    }
  };

  const handleSubmitPerbaikan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingDB(true);
    setUploading(true);
    setUploadPct(0);

    try {
      let ktpUrl = activeSubmission?.ktpUrl || wargaData.foto || "";
      let kkUrl = activeSubmission?.kkUrl || "";

      if (files.ktp) {
        ktpUrl = await handleFileUpload(files.ktp, 'ktp', (pct) => setUploadPct(pct));
      }
      if (files.kk) {
        kkUrl = await handleFileUpload(files.kk, 'kk', (pct) => setUploadPct(pct));
      }

      const id = activeSubmission?.id || wargaData.docId || wargaData.id || `VRF-${Date.now()}`;
      const submission = {
        ...formData,
        id,
        tenantId,
        authUid: auth.currentUser?.uid || activeSubmission?.authUid || "",
        ktpUrl,
        kkUrl,
        status: 'Menunggu Persetujuan',
        submittedAt: new Date().toISOString(),
        catatan: ''
      };

      await setDoc(doc(db, 'verifikasi_warga', id), submission, { merge: true });
      showNotification("Pengajuan perbaikan data berhasil dikirim. Menunggu verifikasi admin.", "success");
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, 'create', 'verifikasi_warga');
    } finally {
      setIsLoadingDB(false);
      setUploading(false);
    }
  };

  const handleDataSudahBenar = async () => {
    setIsLoadingDB(true);
    try {
      const id = activeSubmission?.id || wargaData.docId || wargaData.id || `VRF-${Date.now()}`;
      const submission = {
        ...wargaData,
        id,
        tenantId,
        authUid: auth.currentUser?.uid || activeSubmission?.authUid || "",
        status: 'Menunggu Persetujuan',
        submittedAt: new Date().toISOString(),
        catatan: 'Konfirmasi Data Mandiri (Tidak ada perubahan)'
      };
      await setDoc(doc(db, 'verifikasi_warga', id), submission, { merge: true });
      showNotification("Terima kasih! Konfirmasi data Anda telah dikirim ke admin untuk diverifikasi.", "success");
    } catch (err) {
      handleFirestoreError(err, 'create', 'verifikasi_warga');
      showNotification("Gagal mengirim konfirmasi data. Silakan coba lagi.", "error");
    } finally {
      setIsLoadingDB(false);
    }
  };

  const statusColors: Record<string, string> = {
    'Belum Diverifikasi': 'bg-slate-100 text-slate-600',
    'Menunggu Persetujuan': 'bg-yellow-100 text-yellow-700',
    'Disetujui': 'bg-green-100 text-green-700',
    'Ditolak': 'bg-red-100 text-red-700'
  };

  const currentStatus = activeSubmission?.status || 'Belum Diverifikasi';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pb-20">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 mt-4">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-white relative">
          <button 
            onClick={() => setWargaAuth(null)}
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20  flex items-center justify-center border border-white/30 overflow-hidden shadow-lg">
              {wargaData.foto ? (
                <img src={wargaData.foto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{wargaData.nama}</h1>
              <p className="text-blue-100 font-medium opacity-80 uppercase text-[10px] tracking-widest mt-1">NIK: {wargaData.nik}</p>
              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColors[currentStatus] || 'bg-slate-100 text-slate-600'}`}>
                {currentStatus === 'Disetujui' && <CheckCircle className="w-3 h-3" />}
                {currentStatus === 'Menunggu Persetujuan' && <Activity className="w-3 h-3" />}
                {currentStatus === 'Ditolak' && <AlertCircle className="w-3 h-3" />}
                {currentStatus}
              </div>
            </div>
          </div>
        </div>

        {activeSubmission?.catatan && activeSubmission.status === 'Ditolak' && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-1">Catatan Admin:</p>
              <p className="text-sm text-red-700 font-medium">{activeSubmission.catatan}</p>
            </div>
          </div>
        )}

        {/* Improved Unified Workflow Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-100">
           {[
             { id: 'profil', label: 'Profil & Data', icon: User },
             { id: 'layanan', label: 'Ajukan Surat', icon: PlusCircle },
             { id: 'riwayat', label: 'Riwayat & Arsip', icon: History }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => {setActiveCitizenTab(tab.id as any); setIsEditing(false);}}
               className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeCitizenTab === tab.id ? 'text-blue-600 bg-white border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
             >
               <tab.icon className="w-3.5 h-3.5" />
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        <div className="p-8">
          {activeCitizenTab === 'profil' && (
            !isEditing ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor KK</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.kk || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nomor HP</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.hp || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alamat sesuai KTP</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.blok ? `Blok ${wargaData.blok}, ` : ''}RT {wargaData.rt}/RW {wargaData.rw}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pekerjaan</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.profesi || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Agama</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.agama || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Pernikahan</p>
                    <p className="text-sm font-bold text-slate-700">{wargaData.statusKawin || wargaData.posisi || '-'}</p>
                  </div>
                </div>

                {/* Anggota Keluarga Section */}
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Anggota Keluarga (Satu KK)
                  </h3>
                  <div className="space-y-2">
                    {wargaData.kk ? (
                      wargaData.listWargaInKK?.length > 0 ? (
                        wargaData.listWargaInKK.map((m: any) => (
                          <div key={m.nik} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-bold text-slate-700">{m.nama}</p>
                              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{m.posisi} • {m.nik}</p>
                            </div>
                            <div className="text-[9px] font-black px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-500 uppercase">
                              Warga
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">Data anggota keluarga tidak ditemukan.</p>
                      )
                    ) : (
                      <p className="text-xs text-slate-400 italic">Nomor KK belum tersedia.</p>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleDataSudahBenar}
                    disabled={isLoadingDB || currentStatus === 'Disetujui'}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale active:scale-95"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Data Sudah Benar
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    disabled={isLoadingDB || currentStatus === 'Disetujui'}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold py-3.5 px-6 rounded-2xl transition-all border border-blue-100 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    <Edit className="w-5 h-5" />
                    Ajukan Perbaikan
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPerbaikan} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nama Lengkap</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.nama}
                      onChange={(e) => setFormData({...formData, nama: e.target.value})}
                     />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nomor KK</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.kk}
                      onChange={(e) => setFormData({...formData, kk: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tempat Lahir</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData({...formData, tempatLahir: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tanggal Lahir</label>
                     <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.tglLahir}
                      onChange={(e) => setFormData({...formData, tglLahir: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Jenis Kelamin</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.jk}
                      onChange={(e) => setFormData({...formData, jk: e.target.value})}
                     >
                       <option value="Laki-Laki">Laki-Laki</option>
                       <option value="Perempuan">Perempuan</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Agama</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.agama || "Islam"}
                      onChange={(e) => setFormData({...formData, agama: e.target.value})}
                     >
                       <option value="Islam">Islam</option>
                       <option value="Kristen">Kristen</option>
                       <option value="Katolik">Katolik</option>
                       <option value="Hindu">Hindu</option>
                       <option value="Buddha">Buddha</option>
                       <option value="Konghucu">Konghucu</option>
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Alamat (Blok/Unit)</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.blok}
                      onChange={(e) => setFormData({...formData, blok: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Nomor HP/WA</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.hp}
                      onChange={(e) => setFormData({...formData, hp: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Pekerjaan</label>
                     <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.profesi}
                      onChange={(e) => setFormData({...formData, profesi: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Pendidikan Terakhir</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.pendidikanTerakhir}
                      onChange={(e) => setFormData({...formData, pendidikanTerakhir: e.target.value})}
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
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Status Kawin</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.kawin}
                      onChange={(e) => setFormData({...formData, kawin: e.target.value})}
                     >
                       <option value="Belum Kawin">Belum Kawin</option>
                       <option value="Kawin">Kawin</option>
                       <option value="Cerai Hidup">Cerai Hidup</option>
                       <option value="Cerai Mati">Cerai Mati</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Posisi Keluarga</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.posisi}
                      onChange={(e) => setFormData({...formData, posisi: e.target.value})}
                     >
                        <option value="Suami (Kepala Keluarga)">Suami (Kepala Keluarga)</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Cucu">Cucu</option>
                        <option value="Family Lain">Family Lain</option>
                        <option value="Lainya">Lainya</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Kewarganegaraan</label>
                     <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                      value={formData.kewarganegaraan}
                      onChange={(e) => setFormData({...formData, kewarganegaraan: e.target.value})}
                     >
                       <option value="WNI">WNI</option>
                       <option value="WNA">WNA</option>
                     </select>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Upload Foto KTP (Jika ada perubahan)</label>
                     <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500">{files.ktp ? files.ktp.name : 'Pilih File atau Tarik ke sini'}</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles({...files, ktp: e.target.files?.[0]})} title="KTP" />
                        </label>
                     </div>
                  </div>
                  <div className="col-span-2">
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Upload Foto Kartu Keluarga</label>
                     <div className="mt-2 flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <p className="text-xs text-slate-500">{files.kk ? files.kk.name : 'Pilih File atau Tarik ke sini'}</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => setFiles({...files, kk: e.target.files?.[0]})} title="KK" />
                        </label>
                     </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600"
                  >
                    Batal
                  </button>
                  {uploading && (
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-300 shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
                        style={{ width: `${uploadPct}%` }}
                      ></div>
                    </div>
                  )}
                  <button 
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    {uploading ? `Mengunggah ${Math.round(uploadPct)}%` : 'Simpan & Ajukan'}
                  </button>
                </div>
              </form>
            )
          )}

          {activeCitizenTab === 'layanan' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-1">Layanan Surat Mandiri</h4>
                <p className="text-[11px] text-blue-600 leading-relaxed font-medium">Anda dapat mengajukan surat keterangan atau pengantar secara mandiri. Admin akan memverifikasi pengajuan Anda.</p>
              </div>

              <form onSubmit={handleAjukanSurat} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Jenis Surat yang Dibutuhkan</label>
                  <select name="jenisSurat" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-700">
                    <option value="SURAT PENGANTAR (Umum)">SURAT PENGANTAR (Umum)</option>
                    <option value="SURAT PENGANTAR KTP (BARU / PERPANJANGAN)">SURAT PENGANTAR KTP (BARU / PERPANJANGAN)</option>
                    <option value="SURAT PENGANTAR KK (BARU / PERUBAHAN)">SURAT PENGANTAR KK (BARU / PERUBAHAN)</option>
                    <option value="SURAT PENGANTAR PINDAH DOMISILI">SURAT PENGANTAR PINDAH DOMISILI</option>
                    <option value="SURAT KETERANGAN DOMISILI">SURAT KETERANGAN DOMISILI</option>
                    <option value="SURAT KETERANGAN TEMPAT TINGGAL">SURAT KETERANGAN TEMPAT TINGGAL</option>
                    <option value="SURAT KETERANGAN KELAHIRAN">SURAT KETERANGAN KELAHIRAN</option>
                    <option value="SURAT KETERANGAN KEMATIAN">SURAT KETERANGAN KEMATIAN</option>
                    <option value="SURAT PENGANTAR NIKAH">SURAT PENGANTAR NIKAH</option>
                    <option value="SURAT PENGANTAR CERAI">SURAT PENGANTAR CERAI</option>
                    <option value="SURAT KETERANGAN TIDAK MAMPU (SKTM)">SURAT KETERANGAN TIDAK MAMPU (SKTM)</option>
                    <option value="SURAT PENGANTAR BANTUAN SOSIAL (BANSOS)">SURAT PENGANTAR BANTUAN SOSIAL (BANSOS)</option>
                    <option value="SURAT KETERANGAN PENGHASILAN">SURAT KETERANGAN PENGHASILAN</option>
                    <option value="SURAT KETERANGAN USAHA (SKU)">SURAT KETERANGAN USAHA (SKU)</option>
                    <option value="SURAT DOMISILI USAHA">SURAT DOMISILI USAHA</option>
                    <option value="SURAT PENGANTAR IZIN USAHA MIKRO">SURAT PENGANTAR IZIN USAHA MIKRO</option>
                    <option value="SURAT PENGANTAR SKCK">SURAT PENGANTAR SKCK</option>
                    <option value="SURAT IZIN KERAMAIAN">SURAT IZIN KERAMAIAN</option>
                    <option value="SURAT KETERANGAN DOMISILI SEKOLAH">SURAT KETERANGAN DOMISILI SEKOLAH</option>
                    <option value="SURAT PENGANTAR KERJA">SURAT PENGANTAR KERJA</option>
                    <option value="SURAT KETERANGAN MAGANG">SURAT KETERANGAN MAGANG</option>
                    <option value="SURAT PENGANTAR TAMU / LAPOR TAMU">SURAT PENGANTAR TAMU / LAPOR TAMU</option>
                    <option value="SURAT KETERANGAN KEPEMILIKAN RUMAH (NON-SERTIFIKAT)">SURAT KETERANGAN KEPEMILIKAN RUMAH (NON-SERTIFIKAT)</option>
                    <option value="SURAT PENGANTAR BANK / KREDIT">SURAT PENGANTAR BANK / KREDIT</option>
                    <option value="SURAT REKOMENDASI RT/RW (UMUM)">SURAT REKOMENDASI RT/RW (UMUM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Maksud / Keperluan Surat</label>
                  <textarea 
                    name="keperluan" 
                    required 
                    rows={4} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-blue-500 font-bold text-slate-700"
                    placeholder="Contoh: Mengurus KTP baru, Persyaratan kerja, dll..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Ajukan Surat Sekarang
                </button>
              </form>
            </div>
          )}

          {activeCitizenTab === 'riwayat' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Arsip Surat Anda
              </h4>
              
              {mySurat.length > 0 ? (
                <div className="space-y-3">
                  {mySurat.map((surat: any) => (
                    <div key={surat.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-slate-400 font-mono mb-1">{surat.nomor_surat || surat.id}</p>
                          <p className="text-sm font-bold text-slate-800">{surat.jenisSurat}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-[9px] uppercase font-black rounded-lg border ${
                          surat.status === 'Selesai' ? 'border-green-200 bg-green-100 text-green-700' : 
                          surat.status === 'Ditolak' ? 'border-red-200 bg-red-100 text-red-700' :
                          'border-yellow-200 bg-yellow-100 text-yellow-700'
                        }`}>
                          {surat.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {surat.tanggal}
                        </div>
                        {surat.status === 'Selesai' && (
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleCetakSurat(surat.id)}
                               className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-1.5 hover:bg-slate-800 transition-all active:scale-95 shadow-md"
                             >
                               <Printer className="w-3 h-3" />
                               Cetak Surat
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
                  <FileText className="w-12 h-12 opacity-20 mb-3" />
                  <p className="text-xs font-bold uppercase tracking-widest">Belum ada riwayat surat</p>
                  <p className="text-[10px] mt-1 italic">Ajukan surat baru melalui menu Layanan.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
      
      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ERP RW 26 - Sistem Layanan Mandiri Warga</p>
      </div>
    </div>
  );
}

function SelfRegistrationView({ tenantId, onClose, handleFileUpload, showNotification, handleFirestoreError }: { tenantId: string, onClose: () => void, handleFileUpload: any, showNotification: any, handleFirestoreError: any }) {
  const [formData, setFormData] = useState({
    nik: '', nama: '', kk: '', hp: '', blok: '', rt: '01', rw: '26',
    pekerjaan: '', statusKawin: 'Belum Kawin', agama: 'Islam', tempatLahir: '', tglLahir: '', jk: 'Laki-Laki', 
    golDarah: '', kewarganegaraan: 'WNI', posisiKeluarga: 'Kepala Keluarga', statusWarga: 'Warga Tetap',
    email: '', kecamatan: '', kelurahan: '', kota: '', pendidikan: ''
  });
  const [files, setFiles] = useState<{ktp?: File, kk?: File}>({});
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(err => console.warn("SelfReg: Anonymous sign-in failed", err));
    }
  }, []);

  const handleSubmit = async (e: any) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("SelfRegistration: Submit initiated", { formData, filesCount: Object.keys(files).length });
    
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
      showNotification("Nomor HP/WhatsApp wajib diisi untuk koordinasi.", "error");
      return;
    }
    if (!files.ktp || !files.kk) {
      showNotification("Harap unggah berkas KTP dan KK sebagai syarat verifikasi.", "error");
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
          throw new Error("Gagal mengaktifkan sesi keamanan. Periksa koneksi internet.");
        }
      }

      let ktpUrl = "";
      let kkUrl = "";
      
      const uploadPath = `verifikasi/${formData.nik}_${Date.now()}`;
      
      console.log("SelfRegistration: Processing KTP...");
      setUploadPct(15);
      ktpUrl = await handleFileUpload(files.ktp, `${uploadPath}_ktp`, (pct: number) => setUploadPct(15 + (pct * 0.35)));
      
      console.log("SelfRegistration: Processing KK...");
      setUploadPct(50);
      kkUrl = await handleFileUpload(files.kk, `${uploadPath}_kk`, (pct: number) => setUploadPct(50 + (pct * 0.35)));

      console.log("SelfRegistration: Saving document to Firestore...");
      setUploadPct(90);
      const id = `VRF-${formData.nik}-${Date.now()}`;
      await setDoc(doc(db, 'verifikasi_warga', id), {
        ...formData, 
        id, 
        tenantId: tenantId || 'RW26_SMART', 
        ktpUrl, 
        kkUrl,
        status: 'Menunggu Persetujuan', 
        submittedAt: new Date().toISOString(), 
        type: 'REGISTRASI_BARU',
        authUid: auth.currentUser?.uid || null,
        ipAddress: 'client-side' // Placeholder
      });
      
      console.log("SelfRegistration: Success!");
      setUploadPct(100);
      showNotification("Pendaftaran Berhasil! Data Anda telah dikirim ke Pengurus untuk divalidasi.", "success");
      onClose();
    } catch (err: any) { 
      console.error("SelfRegistration Error:", err);
      const msg = err.message || "Gagal mengirim pendaftaran. Pastikan file tidak terlalu besar dan koneksi stabil.";
      showNotification(msg, "error");
      // Don't use handleFirestoreError here to avoid throwing again, just log it
      console.warn("Firestore Details:", JSON.stringify({ error: err.message, path: 'verifikasi_warga' }));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
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
                <h2 className="text-2xl font-black tracking-tight">Formulir Pendaftaran Warga Baru</h2>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Lengkapi data Anda untuk verifikasi sistem</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10">
              {/* Section 1: Identitas Utama */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center text-sm font-black italic shadow-inner">01</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Identitas Utama (Sesuai KTP/KK)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIK (16 Digit)</label>
                    <input required maxLength={16} placeholder="Contoh: 3201..." value={formData.nik} onChange={e => setFormData({...formData, nik: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor KK (16 Digit)</label>
                    <input required maxLength={16} placeholder="Sesuai Kartu Keluarga" value={formData.kk} onChange={e => setFormData({...formData, kk: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                    <input required placeholder="Nama sesuai KTP" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tempat Lahir</label>
                    <input required placeholder="Kota kelahiran" value={formData.tempatLahir} onChange={e => setFormData({...formData, tempatLahir: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                    <input required type="date" value={formData.tglLahir} onChange={e => setFormData({...formData, tglLahir: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 focus:ring-4 focus:ring-brand-blue/10 outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                    <select value={formData.jk} onChange={e => setFormData({...formData, jk: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold">
                      <option value="Laki-Laki">Laki-Laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kewarganegaraan</label>
                    <select value={formData.kewarganegaraan} onChange={e => setFormData({...formData, kewarganegaraan: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold">
                      <option value="WNI">WNI</option>
                      <option value="WNA">WNA</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pendidikan Terakhir</label>
                    <select value={formData.pendidikan} onChange={e => setFormData({...formData, pendidikan: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agama</label>
                    <select value={formData.agama} onChange={e => setFormData({...formData, agama: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Perkawinan</label>
                    <select value={formData.statusKawin} onChange={e => setFormData({...formData, statusKawin: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Posisi dalam Keluarga</label>
                    <select value={formData.posisiKeluarga} onChange={e => setFormData({...formData, posisiKeluarga: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                      <option value="Suami (Kepala Keluarga)">Suami (Kepala Keluarga)</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Cucu">Cucu</option>
                      <option value="Family Lain">Family Lain</option>
                      <option value="Lainya">Lainya</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Golongan Darah</label>
                    <input placeholder="A/B/O/AB/Tdk Tahu" value={formData.golDarah} onChange={e => setFormData({...formData, golDarah: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-blue/30 outline-none transition-all font-bold uppercase" />
                  </div>
                </div>
              </div>

              {/* Section 2: Domisili & Kontak */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-pink-100 text-brand-pink flex items-center justify-center text-sm font-black italic shadow-inner">02</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alamat & Kontak</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">No. Blok Rumah</label>
                      <input required placeholder="Contoh: A-12" value={formData.blok} onChange={e => setFormData({...formData, blok: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold uppercase" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RT</label>
                      <select value={formData.rt} onChange={e => setFormData({...formData, rt: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                        {['01','02','03','04','05','06','07','08'].map(rt => <option key={rt} value={rt}>RT {rt}</option>)}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RW</label>
                      <select value={formData.rw} onChange={e => setFormData({...formData, rw: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                        {['26'].map(rw => <option key={rw} value={rw}>RW {rw}</option>)}
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Warga</label>
                      <select value={formData.statusWarga} onChange={e => setFormData({...formData, statusWarga: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold">
                        <option value="Warga Tetap">Warga Tetap</option>
                        <option value="Warga Kontrak">Warga Kontrak</option>
                        <option value="Warga Kost">Warga Kost</option>
                      </select>
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor HP / WhatsApp</label>
                      <input required type="tel" placeholder="0812..." value={formData.hp} onChange={e => setFormData({...formData, hp: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input type="email" placeholder="nama@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kelurahan</label>
                      <input required placeholder="Kelurahan" value={formData.kelurahan} onChange={e => setFormData({...formData, kelurahan: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label>
                      <input required placeholder="Kecamatan" value={formData.kecamatan} onChange={e => setFormData({...formData, kecamatan: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kota / Kabupaten</label>
                      <input required placeholder="Kota" value={formData.kota} onChange={e => setFormData({...formData, kota: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profesi / Pekerjaan</label>
                      <input required placeholder="Pekerjaan saat ini" value={formData.pekerjaan} onChange={e => setFormData({...formData, pekerjaan: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white outline-none transition-all font-bold" />
                  </div>
                </div>
              </div>

              {/* Section 3: Berkas Pendukung */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-black italic shadow-inner">03</span>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Unggah Berkas Pendukung</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand-blue/40 transition-all group">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CreditCard className="w-6 h-6 text-brand-blue" />
                        </div>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Foto KTP</h4>
                        <p className="text-[10px] text-slate-400 mb-4 px-4 font-medium italic">Ambil foto KTP asli / scan yang terbaca jelas.</p>
                        <input 
                            type="file" 
                            id="uploadKTP"
                            accept="image/*,.pdf"
                            className="hidden" 
                            onChange={e => e.target.files && setFiles({...files, ktp: e.target.files[0]})}
                        />
                        <label htmlFor="uploadKTP" className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full text-[10px] font-bold text-slate-600 hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all">
                            {files.ktp ? `✓ ${files.ktp.name}` : 'Pilih Berkas'}
                        </label>
                      </div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand-pink/40 transition-all group">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Files className="w-6 h-6 text-brand-pink" />
                        </div>
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Foto Kartu Keluarga</h4>
                        <p className="text-[10px] text-slate-400 mb-4 px-4 font-medium italic">Ambil foto KK asli agar mempermudah validasi data.</p>
                        <input 
                            type="file" 
                            id="uploadKK"
                            accept="image/*,.pdf"
                            className="hidden" 
                            onChange={e => e.target.files && setFiles({...files, kk: e.target.files[0]})}
                        />
                        <label htmlFor="uploadKK" className="cursor-pointer bg-white border border-slate-200 px-6 py-2.5 rounded-full text-[10px] font-bold text-slate-600 hover:bg-brand-pink hover:text-white hover:border-brand-pink transition-all">
                            {files.kk ? `✓ ${files.kk.name}` : 'Pilih Berkas'}
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
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Aman • Terenkripsi • Privasi Terjamin</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <button type="button" disabled={uploading} onClick={onClose} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Batal</button>
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
                  ) : 'Kirim Pendaftaran'}
              </button>
            </div>
          </div>
        </motion.form>
    </div>
  );
}

function TenantRegistrationView({ onClose, showNotification, handleFirestoreError }: { onClose: () => void, showNotification: any, handleFirestoreError: any }) {
  const [formData, setFormData] = useState({ namaTenant: '', namaPJ: '', email: '' });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = `TENANT-${Date.now()}`;
      await setDoc(doc(db, 'tenant_registrations', id), { ...formData, status: 'Menunggu Persetujuan', submittedAt: new Date().toISOString() });
      showNotification("Pendaftaran tenant berhasil dikirim!", "success");
      onClose();
    } catch (err) { handleFirestoreError(err, 'create', 'tenant_registrations'); }
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Pendaftaran Tenant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Nama Tenant" value={formData.namaTenant} onChange={e => setFormData({...formData, namaTenant: e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Nama Penanggung Jawab" value={formData.namaPJ} onChange={e => setFormData({...formData, namaPJ: e.target.value})} className="w-full p-2 border rounded" />
          <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Kirim</button>
        </form>
      </div>
    </div>
  );
}

function LoginView({ setWargaAuth, wargaData, verifikasiWargaData, isLoadingDB, onSelfRegister }: { setWargaAuth: any, wargaData: any[], verifikasiWargaData: any[], isLoadingDB: boolean, onSelfRegister: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKK, setShowKK] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'warga' | 'verifikasi'>('admin'); // Default to admin for easier access
  const [nik, setNik] = useState('');
  const [kodeKeluarga, setKodeKeluarga] = useState('');

  // Trigger anonymous sign-in to allow fetching public/citizen data
  useEffect(() => {
    if (loginMode === 'warga' && !auth.currentUser) {
      console.log("Pre-authenticating anonymously for citizen lookup...");
      signInAnonymously(auth).catch(err => console.warn("Anonymous sign-in failed", err));
    }
  }, [loginMode]);

  const handleWargaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Ensure we have some data or at least tried to sync
    if (wargaData.length === 0 && isLoadingDB) {
      setTimeout(() => {
        setError('Sistem sedang menyinkronkan data. Silakan tunggu beberapa detik dan coba lagi.');
        setIsLoading(false);
      }, 1500);
      return;
    }

    // Identitas: NIK / Nama / No HP
    const cleanId = String(nik || '').trim();
    const idDigits = cleanId.replace(/\D/g, '');
    const cleanIdLower = cleanId.toLowerCase();
    
    // Kunci: KK / HP
    const cleanPass = String(kodeKeluarga || '').trim();
    const passDigits = cleanPass.replace(/\D/g, '');
    const cleanPassLower = cleanPass.toLowerCase();
    
    // 1. SEARCH IN MEMORY (Current Context)
    let found = wargaData.find(w => {
      const cNik = String(w.nik || '').trim().toLowerCase();
      const cNikDigits = cNik.replace(/\D/g, '');
      const cNama = String(w.nama || '').trim().toLowerCase();
      const cHp = String(w.hp || '').trim().toLowerCase();
      const cHpDigits = cHp.replace(/\D/g, '');
      const cKK = String(w.kk || w.no_kk || w.nomor_kk || w.kodeKeluarga || '').trim().toLowerCase();
      const cKKDigits = cKK.replace(/\D/g, '');

      const idMatch = cNik === cleanIdLower || (idDigits && cNikDigits === idDigits) || cNama === cleanIdLower || cHp === cleanIdLower || (idDigits && cHpDigits === idDigits);
      const secretMatch = cKK === cleanPassLower || (passDigits && cKKDigits === passDigits) || cHp === cleanPassLower || (passDigits && cHpDigits === passDigits) || cNik === cleanPassLower || (passDigits && cNikDigits === passDigits);
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
          const potentialIds = [cleanId, cleanPass].filter(k => k.length >= 6); 
          for (const idCandidate of potentialIds) {
             if (found) break;
             
             // Try common docId patterns (raw, and with default tenant prefix)
             const candidateRefs = [
                doc(db, 'data_warga', idCandidate),
                doc(db, 'data_warga', `RW26_SMART_${idCandidate}`),
                doc(db, 'verifikasi_warga', idCandidate)
             ];

             for (const dRef of candidateRefs) {
                const dSnap = await getDoc(dRef);
                if (dSnap.exists()) {
                   const candidate = { docId: dSnap.id, ...dSnap.data() } as any;
                   const cNik = String(candidate.nik || '').trim().toLowerCase();
                   const cNama = String(candidate.nama || '').trim().toLowerCase();
                   const cHp = String(candidate.hp || '').trim().toLowerCase();
                   const cKK = String(candidate.kk || candidate.kodeKeluarga || '').trim().toLowerCase();
                   
                   const otherInp = idCandidate === cleanId ? cleanPassLower : cleanIdLower;
                   const matches = cNik === otherInp || (otherInp.replace(/\D/g, '') && cNik.replace(/\D/g, '') === otherInp.replace(/\D/g, '')) || cNama === otherInp || cHp === otherInp || cKK === otherInp || (otherInp.replace(/\D/g, '') && cKK.replace(/\D/g, '') === otherInp.replace(/\D/g, ''));
                   if (matches) {
                      found = candidate;
                      break;
                   }
                }
             }
          }

          // B. Query Discovery (as fallback) - Search for all fields that match cleanId or cleanPass
          if (!found) {
             const tokens = [cleanId, cleanPass].filter(k => k.length >= 3);
             
             for (const token of tokens) {
               if (found) break;
               const isNumeric = /^\d+$/.test(token);
               const searchFields = ['nik', 'hp', 'nama'];
               
               for (const field of searchFields) {
                 if (found) break;
                 
                 const variants: any[] = [];
                 if (field === 'nama') {
                    const titleCase = token.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    variants.push(token, token.toUpperCase(), token.toLowerCase(), titleCase);
                 } else if (isNumeric) {
                    variants.push(token, Number(token));
                 } else {
                    variants.push(token);
                 }
                 
                 for (const value of variants) {
                   if (found) break;
                   const q = query(collection(db, 'data_warga'), 
                        where(field, '==', value), 
                        limit(5));
                   const snap = await getDocs(q);
                   
                   if (!snap.empty) {
                     for (const d of snap.docs) {
                        const cand = { docId: d.id, ...d.data() } as any;
                        const otherVal = token === cleanId ? cleanPass : cleanIdLower;
                        
                        const cNik = String(cand.nik || '').trim().toLowerCase();
                        const cNama = String(cand.nama || '').trim().toLowerCase();
                        const cHp = String(cand.hp || '').trim().toLowerCase();
                        const cKK = String(cand.kk || cand.kodeKeluarga || '').trim().toLowerCase();
                        
                        const matches = cNik === otherVal || cNama === otherVal || cHp === otherVal || cKK === otherVal;
                        if (matches) {
                          found = cand;
                          break;
                        }
                     }
                   }
                 }
               }
             }
          }
          
          // C. Try Verifikasi Warga (Discovery)
          if (!found) {
             const tokens = [cleanId, cleanPass].filter(k => k.length >= 3);
             for (const token of tokens) {
               if (found) break;
               const isNumeric = /^\d+$/.test(token);
               const searchFields = ['nik', 'hp', 'nama'];
               for (const field of searchFields) {
                 if (found) break;
                 const variants: any[] = [];
                 if (field === 'nama') {
                    const titleCase = token.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    variants.push(token, token.toUpperCase(), token.toLowerCase(), titleCase);
                 } else if (isNumeric) {
                    variants.push(token, Number(token));
                 } else {
                    variants.push(token);
                 }

                 for (const value of variants) {
                   if (found) break;
                   const q = query(collection(db, 'verifikasi_warga'), 
                        where(field, '==', value),
                        limit(5));
                   const snap = await getDocs(q);
                   if (!snap.empty) {
                      for (const d of snap.docs) {
                         const cand = { docId: d.id, ...d.data() } as any;
                         const otherVal = token === cleanId ? cleanPassLower : cleanIdLower;
                         const cNik = String(cand.nik || '').trim().toLowerCase();
                         const cNama = String(cand.nama || '').trim().toLowerCase();
                         const cHp = String(cand.hp || '').trim().toLowerCase();
                         const cKK = String(cand.kk || cand.kodeKeluarga || '').trim().toLowerCase();
                         if (cNik === otherVal || cNama === otherVal || cHp === otherVal || cKK === otherVal) {
                           found = cand;
                           break;
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
        
        // Update the document with authUid for security rules
        const docId = found.docId || found.id || found.nik;
        const vRef = doc(db, 'verifikasi_warga', docId);                
        await setDoc(vRef, { 
          authUid: uid,
          nik: found.nik,
          kk: found.kk || found.kodeKeluarga || "",
          nama: found.nama,
          status: found.status === 'Disetujui' || found.terverifikasi ? 'Disetujui' : 'Menunggu Persetujuan',
          tenantId: found.tenantId || "RW26_SMART",
          lastLogin: new Date().toISOString()
        }, { merge: true });
        
        // Find other family members
        const currentKK = String(found.kk || found.kodeKeluarga || '').trim();
        const familyMembers = currentKK ? wargaData.filter(w => 
          String(w.kk || '').trim() === currentKK || 
          String(w.kodeKeluarga || '').trim() === currentKK
        ) : [];
        const wargaAuthData = { ...found, authUid: uid, listWargaInKK: familyMembers };
        
        setTimeout(() => {
          setWargaAuth(wargaAuthData);
          setIsLoading(false);
        }, 800);
      } catch (err) {
        console.error("Login Error:", err);
        setError('Gagal masuk. Silakan coba lagi.');
        setIsLoading(false);
      }
    } else {
      setTimeout(() => {
        setError('Data tidak ditemukan! Jika Anda adalah warga baru atau belum terdaftar di sistem RW26, silakan klik tombol "DAFTAR MANDIRI" di bawah untuk mendaftarkan data Anda.');
        setIsLoading(false);
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent, quickEmail?: string, quickPass?: string) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const inputEmail = (quickEmail || email || "").trim();
    const targetPass = (quickPass || password || "").trim();

    try {
      // Logic for username OR email login
      let loginEmail = inputEmail;
      
      // If the input doesn't contain '@', search for a username in public_usernames
      if (!inputEmail.includes('@')) {
        const usernameRef = doc(db, 'public_usernames', inputEmail.toLowerCase());
        const usernameDoc = await getDoc(usernameRef);
        
        if (usernameDoc.exists()) {
          const userData = usernameDoc.data();
          if (userData.email) {
            loginEmail = userData.email;
          } else {
            throw new Error('Username valid, but no email set.');
          }
        } else if (inputEmail.toLowerCase() === 'trihprw26') {
          loginEmail = 'trihprw26@trihprw26.com';
        } else if (inputEmail.toLowerCase() === 'master') {
          loginEmail = 'arifrajcoach@gmail.com';
        } else if (inputEmail.toLowerCase() === 'rw26_smart') {
          loginEmail = 'admin@rw26.com';
        } else {
          throw new Error('Username tidak ditemukan.');
        }
      }

      await signInWithEmailAndPassword(auth, loginEmail, targetPass);
    } catch (err: any) {
      console.error("Login Error:", err);
      let msg = `Gagal masuk (${err.code || 'ERR'}). Periksa kembali email dan password Anda.`;
      
      if (err.message === 'Username tidak ditemukan.') {
        msg = 'Gagal masuk (ERR). Username tidak ditemukan.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        if (inputEmail.toLowerCase() === 'arifrajcoach@gmail.com' || inputEmail.toLowerCase() === 'master') {
          msg = 'AKUN ADMIN: Bpk. Arif, silakan gunakan tombol "Masuk dengan Google" atau pastikan password sudah diset di Firebase Console.';
        } else {
          msg = 'KREDENSIAL SALAH: Email/Username atau password tidak sesuai. Pastikan akun sudah terdaftar dan provider Email/Password sudah aktif di Firebase Console.';
        }
      } else if (err.code === 'auth/wrong-password') {
        msg = 'PASSWORD SALAH: Periksa kembali kata sandi Anda.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'FORMAT EMAIL SALAH: Masukkan format email yang benar.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'METODE LOGIN NON-AKTIF: Aktifkan "Email/Password" di Firebase Console > Authentication > Sign-in method.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'MASALAH JARINGAN (Timeout): Firebase tidak dapat dijangkau. Coba refresh halaman (F5) atau cek apakah domain ini sudah diizinkan di Firebase Console.';
      } else {
        msg = `Gagal masuk (${err.code || 'ERR'}). ${err.message || ''}`;
      }
      
      console.error("Login Details:", { code: err.code, message: err.message });
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const isArif = user.email?.toLowerCase() === 'arifrajcoach@gmail.com';
      let tenantId = 'RW26_SMART';
      if (user.email?.toLowerCase().includes('trihprw26')) {
        tenantId = 'RW_BERJUANG';
      } else if (isArif) {
        tenantId = 'MASTER';
      }

      // 1. Check if user entry exists by standard UID
      const userRef = doc(db, 'users', user.uid);
      let userDoc = await getDoc(userRef);
      
      let preRegisteredRole = 'Viewer';
      let preRegisteredTenant = tenantId;
      
      // 2. If standard UID document doesn't exist, search if Super Admin pre-registered this email
      if (!userDoc.exists() && user.email) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const matchedUser = querySnapshot.docs[0];
          const matchedData = matchedUser.data();
          preRegisteredRole = matchedData.role || 'Viewer';
          preRegisteredTenant = matchedData.tenantId || tenantId;
          
          // Delete the old pre-registered dummy doc to prevent duplicates, since we will use the actual auth UID
          if (matchedUser.id !== user.uid) {
            await deleteDoc(doc(db, 'users', matchedUser.id));
          }
        }
      }
      
      const userData = {
        email: user.email,
        role: isArif ? 'SUPER_ADMIN' : (userDoc.exists() ? userDoc.data()?.role : preRegisteredRole),
        isSuperAdmin: isArif,
        name: isArif ? 'Bpk. Arif (Super Admin)' : (userDoc.exists() ? userDoc.data()?.name : (user.displayName || 'User')),
        tenantId: userDoc.exists() ? userDoc.data()?.tenantId || preRegisteredTenant : preRegisteredTenant,
        createdAt: userDoc.exists() ? userDoc.data()?.createdAt || new Date().toISOString() : new Date().toISOString()
      };

      // Always ensure the role and tenant are set
      await setDoc(userRef, userData, { merge: true });
    } catch (err: any) {
      console.error("Google Login Error:", err);
      setError(`Gagal login dengan Google: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row lg:gap-16 items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 "></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-blue/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 " style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl "></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-[3rem] bg-white shadow-2xl shadow-brand-blue/20 mb-8 relative group isolate overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/20 via-brand-yellow/20 to-brand-pink/20 animate-spin-slow"></div>
            <div className="absolute inset-0.5 bg-white rounded-[2.9rem] -z-10"></div>
            <AppLogo size={18} className="w-18 h-18 relative z-10 transition-transform group-hover:scale-110 duration-500" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-800 uppercase leading-none mb-2 font-elegant">
            RW26 <span className="text-brand-pink">BERJUANG</span>
          </h1>
          <p className="text-brand-blue font-bold tracking-[0.2em] text-sm uppercase">BERDAMPAK &amp; MEMBERDAYAKAN</p>
          <div className="mt-2 flex flex-col items-center">
            <p className="text-slate-400/80 font-bold text-xs tracking-widest mt-0.5 text-center">Powered by Nexapps</p>
          </div>
        </div>
      </div>

        <div className="w-full max-w-md bg-white/90 rounded-[2.5rem] shadow-2xl shadow-slate-300/50 border border-white overflow-hidden relative z-10">
          <div className="flex border-b border-slate-100/50 bg-white/50 ">
            <button 
              onClick={() => { setLoginMode('admin'); setError(''); }}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${loginMode === 'admin' ? 'text-brand-blue bg-white border-b-2 border-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'}`}
            >
              Pengurus
            </button>
            <button 
              onClick={() => { setLoginMode('warga'); setError(''); }}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${loginMode === 'warga' ? 'text-brand-green bg-white border-b-2 border-brand-green shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'}`}
            >
              <span className="relative">
                Warga
                <span className="absolute -top-3 -right-2 px-1.5 py-0.5 bg-emerald-500 text-white rounded-full text-[6px] animate-pulse">GOOGLE</span>
              </span>
            </button>
            <button 
              onClick={() => { setLoginMode('verifikasi'); setError(''); }}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative ${loginMode === 'verifikasi' ? 'text-brand-pink bg-white border-b-2 border-brand-pink shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/80'}`}
            >
              <span className="relative">
                NIK & KK
                <span className="absolute -top-3 -right-2 px-1.5 py-0.5 bg-brand-pink text-white rounded-full text-[6px]">PROFIL</span>
              </span>
            </button>
          </div>
          <div className="p-8">
            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-white" />
              </div>
              <p className="text-[10px] font-bold text-brand-blue uppercase tracking-tight leading-tight">
                {loginMode === 'warga' ? 'KHUSUS AKUN GOOGLE. Jika ingin masuk pakai NIK & KK, silakan pilih tab "NIK & KK" di atas.' : (loginMode === 'verifikasi' ? 'MASUK VIA NIK (Tanpa Google). Masukkan NIK sebagai ID dan Nomor KK sebagai Kunci.' : 'Akses khusus pengurus RT/RW yang telah terdaftar.')}
              </p>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-6 font-elegant tracking-tight text-center">
              {loginMode === 'admin' ? 'LOGIN PENGURUS' : (loginMode === 'warga' ? 'MASUK GOOGLE' : 'MASUK VIA NIK & KK')}
            </h2>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {loginMode === 'admin' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">EMAIL/ USERNAME</label>
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
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">KATA SANDI</label>
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-blue hover:bg-blue-500 text-white font-black py-5 rounded-[1.5rem] shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-base"
                >
                  {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "Masuk"}
                </button>
              </form>
            )}

            {loginMode === 'warga' && (
              <div className="space-y-6">
                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 mb-6">
                   <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                         <ShieldCheck className="text-white w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-emerald-800">Akses Cepat & Aman</p>
                   </div>
                   <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                      Gunakan Google Login untuk akses penuh fitur warga: E-LAPAK26, Surat Digital, Keuangan, dan Pengaduan.
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
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Masuk dengan Google
                    </>
                  )}
                </button>
              </div>
            )}

            {loginMode === 'verifikasi' && (
              <div className="space-y-6">
                <form onSubmit={handleWargaLogin} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">ID WARGA (NIK/ NAMA)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <User className="w-6 h-6 text-slate-400 group-focus-within:text-brand-pink transition-colors" />
                      </div>
                      <input
                        type="text"
                        required
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] text-slate-800 focus:bg-white focus:outline-none focus:border-brand-pink/30 focus:ring-4 focus:ring-brand-pink/10 transition-all font-bold text-base"
                        placeholder="NIK atau Nama Lengkap"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-2">KUNCI (KK/ NO. HP)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="w-6 h-6 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                      </div>
                      <input
                        type={showKK ? "text" : "password"}
                        required
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
                        {showKK ? <EyeOff className="w-5 h-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-pink hover:bg-pink-500 text-white font-black py-5 rounded-[1.5rem] shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 text-base"
                  >
                    {isLoading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : "Verifikasi & Cek Profil"}
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
             
             {loginMode === 'admin' && (
               <div className="mt-8 pt-8 border-t-2 border-slate-100 border-dashed">
                 <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Awal Cepat Uji Coba</p>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                   <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'arifrajcoach@gmail.com', '4R1f080162a3')} className="w-full bg-slate-50 hover:bg-brand-blue hover:text-white text-slate-500 text-[10px] uppercase tracking-widest font-black py-4 rounded-2xl transition-colors shadow-sm">Super</button>
                   <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'admin@rw26.com', 'admin123')} className="w-full bg-slate-50 hover:bg-brand-pink hover:text-white text-slate-500 text-[10px] uppercase tracking-widest font-black py-4 rounded-2xl transition-colors shadow-sm">Admin</button>
                   <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'operator@rw26.com', 'operator123')} className="w-full bg-slate-50 hover:bg-brand-yellow hover:text-white text-slate-500 text-[10px] uppercase tracking-widest font-black py-4 rounded-2xl transition-colors shadow-sm">Kader</button>
                   <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'rt01@rw26.com', 'rt01123')} className="w-full bg-slate-50 hover:bg-purple-600 hover:text-white text-slate-500 text-[10px] uppercase tracking-widest font-black py-4 rounded-2xl transition-colors shadow-sm">RT01</button>
                   <button onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent, 'warga@rw26.com', 'warga123')} className="w-full bg-slate-50 hover:bg-brand-green hover:text-white text-slate-500 text-[10px] uppercase tracking-widest font-black py-4 rounded-2xl transition-colors shadow-sm">Warga</button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

function UsersView({ usersData, setIsLoadingDB, handleFirestoreError, tenantId, showNotification, settings }: { usersData: any[], setIsLoadingDB: any, handleFirestoreError: any, tenantId: string, showNotification: (m: string, t?: any) => void, settings: any }) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showRTForm, setShowRTForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id_user = editingUser ? editingUser.uid || editingUser.id_user : `USR-${Date.now()}`;
    
    const userData = {
      id_user,
      nama: formData.get('nama') as string,
      name: formData.get('nama') as string, // Legacy compatibility
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as any,
      rt: formData.get('rt') as string,
      nik: formData.get('nik') as string,
      status: formData.get('status') as "AKTIF" | "NONAKTIF",
      isSuperAdmin: formData.get('isSuperAdmin') === 'true',
      tenantId,
      created_at: editingUser?.created_at || new Date().toISOString()
    };

    if (!userData.username || !userData.role || !userData.email) {
      showNotification("Username, Role, dan Email wajib diisi!", 'error');
      return;
    }

    setIsLoadingDB(true);
    try {
      await setDoc(doc(db, 'users', id_user), userData);
      
      // Sync with public_usernames
      await setDoc(doc(db, 'public_usernames', userData.username), {
        email: userData.email,
      });

      setShowForm(false);
      setEditingUser(null);
      showNotification(`Data pengguna ${editingUser ? 'diperbarui' : 'ditambahkan'}!`, 'success');
    } catch (error: any) {
      handleFirestoreError(error, editingUser ? 'update' : 'create', `/users/${id_user}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'users', userToDelete.uid || userToDelete.id_user));
      showNotification("User berhasil dihapus.", 'success');
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/users/${userToDelete.uid || userToDelete.id_user}`);
      showNotification("Gagal menghapus user.", 'error');
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
              <button 
                onClick={() => { setEditingUser(null); setShowForm(true); }}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Tambah User
              </button>
              <button 
                onClick={() => setShowRTForm(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                Daftar RT
              </button>
            </div>
         </div>
         
         <div className="overflow-x-auto border border-slate-100 rounded-lg">
           <table className="w-full text-left border-collapse border-transparent">
             <thead>
               <tr className="bg-slate-50 border-b border-slate-100">
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Nama Pengguna</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Username</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Peran</th>
                 <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">RT/RW</th>
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
                 <tr key={user.uid || user.id_user || user.nik || `user-${user.username}`} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-4 py-3">
                     <p className="text-xs font-bold text-slate-700">{user.nama || user.name}</p>
                   </td>
                   <td className="px-4 py-3">
                     <p className="text-[10px] text-slate-500 font-medium font-mono">{user.username || user.email?.split('@')[0]}</p>
                   </td>
                   <td className="px-4 py-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        user.role === 'SUPER_ADMIN' ? 'bg-slate-900 text-white border-slate-900' :
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
                          onClick={() => setUserToDelete(user)}
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
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Email (Untuk Login)</label>
                      <input type="email" name="email" required defaultValue={editingUser?.email || ''} placeholder="admin@rw26.com" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold" />
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
                         <option value="SUPER_ADMIN">SUPER ADMIN</option>
                         <option value="ADMIN">ADMIN (RT/RW)</option>
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

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Akses Khusus</label>
                      <select name="isSuperAdmin" defaultValue={editingUser?.isSuperAdmin ? 'true' : 'false'} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-bold">
                         <option value="false">Standard User</option>
                         <option value="true">Super Admin Power</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Nomor RT/RW</label>
                      <input type="text" name="rt" defaultValue={editingUser?.rt || (settings?.RT && settings?.RW ? `${settings.RT} / ${settings.RW}` : settings?.RT || '')} placeholder="Contoh: 01 / 26" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-all font-mono font-bold" />
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
  const [tenantToDelete, setTenantToDelete] = useState<any>(null);

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
    const rwNumber = formData.get('rwNumber') as string || "26";
    const isActive = formData.get('isActive') === 'true';

    if (!editingTenant && (!password || password.length < 6)) {
      showNotification("Password admin minimal 6 karakter.", "error");
      return;
    }

    // Limit calculation based on package
    const planKey = paket.toUpperCase() === 'TRIAL' ? 'TRIAL' : 
                   paket === 'RT' ? 'RT' :
                   paket === 'Active' ? 'BASIC' : 
                   paket === 'Pro' ? 'PRO' : 
                   paket === 'Enterprise' ? 'ENTERPRISE' : 'TRIAL';
    
    let maxWarga = (PLAN_FEATURES as any)[planKey]?.maxWarga || 50;

    const tenant = {
      id: tenantId,
      name: name,
      address: formData.get('address') as string,
      adminEmail: email,
      status: paket,
      isActive: isActive,
      maxWarga,
      rtTarget: rtCount,
      rwTarget: rwNumber,
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
          RT: rtCount.toString().padStart(2, '0'),
          RW: rwNumber,
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

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'tenants', tenantToDelete.id || tenantToDelete.docId));
      showNotification(`Tenant ${tenantToDelete.name || tenantToDelete.id} berhasil dihapus.`, "success");
    } catch (error: any) {
      handleFirestoreError(error, 'delete', `/tenants/${tenantToDelete.id || tenantToDelete.docId}`);
      showNotification("Gagal menghapus tenant.", "error");
    } finally {
      setIsLoadingDB(false);
      setTenantToDelete(null);
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
              <p className="text-sm text-slate-500">Ekosistem Multi-Tenant RW26 BERJUANG System.</p>
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
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Paket</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status Akses</th>
                 <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {tenantsData.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic text-sm">Belum ada tenant terdaftar.</td>
                  </tr>
                )}
                {tenantsData.map((tenant, idx) => (
                  <tr key={tenant.id || `tenant-${idx}`} className={`hover:bg-blue-50/20 transition-colors ${tenant.isActive === false ? 'bg-slate-50/50 grayscale-[0.5]' : ''}`}>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tenant.isActive === false ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>
                             <Database className="w-5 h-5" />
                          </div>
                          <div>
                             <p className={`text-sm font-bold ${tenant.isActive === false ? 'text-slate-400' : 'text-slate-800'}`}>{tenant.name}</p>
                             <p className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1 rounded inline-block">ID: {tenant.id}</p>
                             <div className="flex gap-2 mt-1">
                               {(tenant.maxWarga || tenant.citizenLimit) && (
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                                   <Users className="w-3 h-3" /> Max {tenant.maxWarga || tenant.citizenLimit} Warga
                                 </div>
                               )}
                               {tenant.rwTarget && (
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full w-fit border border-slate-200">
                                   RW: {tenant.rwTarget}
                                 </div>
                               )}
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <p className={`text-xs font-bold ${tenant.isActive === false ? 'text-slate-400' : 'text-slate-600'}`}>{tenant.adminEmail || '-'}</p>
                       <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{tenant.address || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border ${
                         tenant.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                         tenant.status === 'RT' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                         tenant.status === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                         tenant.status === 'Pro' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                         tenant.status === 'Enterprise' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                         'bg-slate-50 text-slate-700 border-slate-200'
                       }`}>
                         {tenant.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                         tenant.isActive !== false ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' : 'bg-rose-50 text-rose-600 border-rose-200 opacity-60'
                       }`}>
                         {tenant.isActive !== false ? 'Aktif' : 'Nonaktif'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 text-[10px] uppercase font-black tracking-widest">
                          <button onClick={() => { setEditingTenant(tenant); setShowAddForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 font-bold active:scale-95 shadow-sm">
                             <Edit className="w-3.5 h-3.5" />
                             <span>Edit</span></button>
                          <button onClick={() => setTenantToDelete(tenant)} className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 font-bold active:scale-95 shadow-sm">
                             <Trash2 className="w-3.5 h-3.5" />
                             <span>Hapus</span></button>
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
                       <option value="RT">RT (Max 200 Warga)</option>
                       <option value="Active">Basic (Max 500 Warga)</option>
                       <option value="Pro">Professional (Max 2000 Warga)</option>
                       <option value="Enterprise">Enterprise (Max 10000 Warga)</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nomor RW</label>
                    <input name="rwNumber" defaultValue={editingTenant?.rwTarget || '26'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Target Jumlah RT</label>
                    <input name="rtCount" type="number" defaultValue={editingTenant?.rtTarget || 5} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Alamat / Keterangan Lokasi</label>
                    <textarea name="address" defaultValue={editingTenant?.address} rows={2} placeholder="Alamat lengkap organisasi..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                  </div>

                  <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Status Akses</label>
                    <select name="isActive" defaultValue={editingTenant?.isActive !== false ? 'true' : 'false'} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700">
                       <option value="true">Aktif</option>
                       <option value="false">Tidak Aktif (Suspended)</option>
                    </select>
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
               <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none">Panduan Paket & Benefits</h4>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Struktur Kapasitas & Fitur Nexapps</p>
             </div>
           </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(PLAN_FEATURES).map(([key, features]: [string, any]) => {
                const isEnterprise = key === 'ENTERPRISE';
                const isPremium = key === 'PREMIUM';
                const isPro = key === 'PRO';
                
                return (
                  <div key={key} className={`p-5 rounded-3xl border flex flex-col relative overflow-hidden transition-all ${
                    isEnterprise ? 'bg-slate-900 border-slate-800 text-white shadow-xl' : 
                    isPremium ? 'bg-indigo-50 border-indigo-100 shadow-lg shadow-indigo-50' : 
                    'bg-white border-slate-100'
                  }`}>
                    <div className="mb-4">
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isEnterprise ? 'text-orange-400' : 'text-indigo-600'}`}>
                        {key === 'TRIAL' ? 'STARTER' : (key === 'RT' ? 'LITE' : (key === 'BASIC' ? 'FLASH' : key))}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <h5 className="text-2xl font-black tracking-tighter leading-none">{features.price}</h5>
                        {!isEnterprise && <span className="text-[10px] opacity-40 font-bold uppercase tracking-tight">/bln</span>}
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2 p-2 bg-black/5 rounded-xl border border-black/5">
                      <Users className="w-3 h-3 opacity-40" />
                      <span className="text-[10px] font-black tracking-tight">{features.maxWarga} Warga</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {features.coreFeatures.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isEnterprise ? 'text-emerald-400' : 'text-emerald-500'}`} />
                          <span className="text-[10px] font-bold leading-none">{f}</span>
                        </div>
                      ))}
                    </div>

                    <button className={`mt-auto w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      isEnterprise ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg' :
                      isPremium ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' :
                      'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}>
                      {key === 'TRIAL' ? 'Sewa' : 'Upgrade'}
                    </button>
                  </div>
                );
              })}
            </div>





                 


           <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
                <strong className="block mb-1">Informasi Hak Akses:</strong>
                Sebagai Super Admin, Anda memiliki otorisasi penuh untuk melakukan upgrade atau downgrade paket tenant kapanpun. 
                Setiap perubahan paket akan langsung mengubah <strong>Citizen Limit</strong> dan membuka akses ke modul fitur tambahan yang terkunci sebelumnya bagi pengurus wilayah (Client) tersebut.
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
  balitaData, setBalitaData, 
  ibuHamilData, setIbuHamilData, 
  posyanduKegiatanData, setPosyanduKegiatanData, 
  posbinduKegiatanData, setPosbinduKegiatanData,
  pemeriksaanBalitaData, setPemeriksaanBalitaData,
  pemeriksaanPosbinduData, setPemeriksaanPosbinduData,
  imunisasiData, setImunisasiData,
  wargaData, currentUser, tenantId, setIsLoadingDB, handleFirestoreError, showNotification 
}: any) {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'balita' | 'ibuhamil' | 'kegiatan' | 'posbindu' | 'timeline' | 'ibuhamil_detail'>('dashboard');
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
        'Kesehatan Warga'
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
    
    const nikInput = formData.get('nik') as string;
    const warga = wargaData.find((w: any) => w.nik === nikInput || w.nama === nikInput);

    const data = {
      id,
      tenantId,
      nik: warga?.nik || nikInput || "-",
      nama: warga?.nama || nikInput || "-",
      tglHPL: formData.get('tglHPL'),
      usiaKehamilan: parseInt(formData.get('usiaKehamilan') as string || "0"),
      riwayatKesehatan: formData.get('riwayatKesehatan'),
      rt: warga?.rt || formData.get('rt') || "-",
      rw: warga?.rw || formData.get('rw') || "-"
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
      showNotification("Kegiatan Kesehatan Warga disimpan!");
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
    balitaSehat: balitaData.filter((b: any) => b.statusStunting === 'Normal').length,
    balitaRisiko: balitaData.filter((b: any) => b.statusStunting === 'Risiko Stunting').length,
    balitaStunting: balitaData.filter((b: any) => b.statusStunting === 'Stunting').length,
    
    totalIbuHamil: ibuHamilData.length,
    ibuHamilRisiko: ibuHamilData.filter((i: any) => (i.riwayatKesehatan || '').toLowerCase().includes('risiko')).length,
    
    totalLansia: wargaData.filter((w: any) => {
      const age = calculateAge(w.tglLahir);
      return typeof age === 'number' && (age as number) >= 60;
    }).length,
    
    totalPosbindu: pemeriksaanPosbinduData.length,
    posbinduHipertensi: pemeriksaanPosbinduData.filter((p: any) => p.tekananDarah && parseInt(p.tekananDarah.toString().split('/')[0]) >= 140).length,
    posbinduAsamUrat: pemeriksaanPosbinduData.filter((p: any) => p.asamUrat && parseFloat(p.asamUrat) > 7).length,
    posbinduGulaDarah: pemeriksaanPosbinduData.filter((p: any) => p.gulaDarah && parseFloat(p.gulaDarah) > 200).length,
    
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
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kesehatan</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manajemen Kesehatan Ibu & Anak</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'balita', label: 'Balita', icon: Users },
            { id: 'ibuhamil', label: 'Ibu Hamil', icon: HeartPulse },
            { id: 'posbindu', label: 'Posbindu', icon: Activity },
            { id: 'kegiatan', label: 'Kegiatan', icon: Calendar },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? 'bg-white text-brand-pink shadow-lg shadow-pink-100 border border-pink-50' 
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeSubTab === tab.id ? 'animate-bounce-slow' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Baby className="w-20 h-20 text-brand-pink" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Total Balita</p>
              <p className="text-4xl font-black text-slate-800 mb-5">{stats.totalBalita}</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-green rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">SEHAT</span>
                  <span className="text-emerald-600 font-black text-lg">{stats.balitaSehat}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-yellow rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">RISIKO</span>
                  <span className="text-amber-600 font-black text-lg">{stats.balitaRisiko}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-soft-pink rounded-xl">
                  <span className="text-slate-500 uppercase tracking-tighter">STUNTING</span>
                  <span className="text-brand-pink font-black text-lg">{stats.balitaStunting}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button 
                  onClick={() => setActiveSubTab('balita')}
                  className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all border border-slate-100"
                >
                  Lihat Daftar
                </button>
                <button 
                  onClick={() => { setEditingItem(null); setShowBalitaForm(true); }}
                  className="py-2.5 bg-brand-blue/10 text-brand-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all"
                >
                  Tambah Data
                </button>
              </div>
            </div>
            
            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-pink-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <HeartPulse className="w-20 h-20 text-brand-pink" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Total Ibu Hamil</p>
              <p className="text-4xl font-black text-slate-800 mb-5">{stats.totalIbuHamil}</p>
              <div className="p-4 bg-soft-pink rounded-2xl border border-pink-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">Risiko Tinggi</span>
                  <span className="text-brand-pink font-black text-2xl">{stats.ibuHamilRisiko}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button 
                  onClick={() => setActiveSubTab('ibuhamil')}
                  className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 hover:text-pink-600 transition-all border border-slate-100"
                >
                  Lihat Daftar
                </button>
                <button 
                  onClick={() => { setEditingItem(null); setShowIbuHamilForm(true); }}
                  className="py-2.5 bg-brand-pink/10 text-brand-pink rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-pink hover:text-white transition-all"
                >
                  Tambah Data
                </button>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-purple-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-20 h-20 text-brand-purple" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Total Lansia</p>
              <p className="text-4xl font-black text-slate-800 mb-5">{stats.totalLansia}</p>
              <div className="p-4 bg-soft-purple rounded-2xl border border-purple-100">
                <p className="text-xs font-black text-brand-purple uppercase tracking-widest">Monitoring Rutin</p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl shadow-blue-100/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Stethoscope className="w-20 h-20 text-brand-blue" />
              </div>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">Pemeriksaan Posbindu</p>
              <p className="text-4xl font-black text-slate-800 mb-5">{stats.totalPosbindu}</p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Hipertensi</p>
                  <p className="text-xl font-black text-red-500">{stats.posbinduHipertensi}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Gula Darah</p>
                  <p className="text-xl font-black text-brand-blue">{stats.posbinduGulaDarah}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button 
                  onClick={() => setActiveSubTab('posbindu')}
                  className="py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-50 hover:text-purple-600 transition-all border border-slate-100"
                >
                  Lihat Daftar
                </button>
                <button 
                  onClick={() => { setEditingPosbinduItem(null); setShowPosbinduForm(true); }}
                  className="py-2.5 bg-brand-purple/10 text-brand-purple rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-purple hover:text-white transition-all"
                >
                  Tambah Data
                </button>
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 14, fill: '#94a3b8'}} />
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
                Jadwal Kesehatan Warga Terakhir / Mendatang
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

      {activeSubTab === 'posbindu' && (
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
                <div className="flex gap-2 justify-center w-full sm:w-auto">
                  <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-brand-blue/90 shadow-lg shadow-blue-100 transition-all active:scale-90" title="Impor Data">
                    <Upload className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                       const doc = new jsPDF();
                       doc.text("Laporan Posbindu", 10, 10);
                       autoTable(doc, {
                           head: [['NIK', 'Nama', 'TD', 'GDS']],
                           body: pemeriksaanPosbinduData.map(p => [p.nik, p.nama, p.tekananDarah, p.gulaDarah])
                       });
                       doc.save(`Laporan_Posbindu_${new Date().toISOString().split('T')[0]}.pdf`);
                    }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-pink hover:bg-pink-50 shadow-sm transition-all active:scale-90"
                    title="Export PDF"
                  >
                    <FileText className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      const ws = XLSX.utils.json_to_sheet(pemeriksaanPosbinduData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Posbindu");
                      XLSX.writeFile(wb, `Data_Posbindu_${new Date().toISOString().split('T')[0]}.xlsx`);
                    }}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl text-brand-green hover:bg-green-50 shadow-sm transition-all active:scale-90"
                    title="Export Excel"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <button 
                onClick={() => { setEditingPosbinduItem(null); setShowPosbinduForm(true); }}
                className="px-6 py-3 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-100 hover:bg-pink-600 flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle className="w-5 h-5" /> Tambah Pemeriksaan
              </button>
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
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pemeriksaanPosbinduData
                  .filter((item: any) => item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) || item.nik?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 font-bold">{item.nama}</td>
                    <td className="px-6 py-3">{item.tanggal}</td>
                    <td className="px-6 py-3">{item.tekananDarah}</td>
                    <td className="px-6 py-3">{item.gulaDarah} mg/dL</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingPosbinduItem(item); setShowPosbinduForm(true); }} className="p-1 px-2 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 font-bold transition-all">Edit</button>
                        <button onClick={() => deleteItem('pemeriksaan_posbindu', item.id)} className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
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
            <h3 className="text-xl font-black text-slate-800 mb-6">{editingPosbinduItem ? 'Edit' : 'Tambah'} Pemeriksaan Posbindu</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                tenantId,
                nama: formData.get('nama'),
                nik: formData.get('nik'),
                tanggalLahir: formData.get('tanggalLahir'),
                gender: formData.get('gender'),
                alamat: formData.get('alamat'),
                merokok: formData.get('merokok') === 'on' ? 'true' : 'false',
                aktivitasFisik: formData.get('aktivitasFisik'),
                tanggal: new Date().toISOString().split('T')[0],
                beratBadan: formData.get('beratBadan'),
                tinggiBadan: formData.get('tinggiBadan'),
                tekananDarah: formData.get('tekananDarah'),
                gulaDarah: formData.get('gulaDarah'),
                kolesterol: formData.get('kolesterol'),
                asamUrat: formData.get('asamUrat'),
              };
              
              try {
                if (editingPosbinduItem) {
                  await setDoc(doc(db, 'pemeriksaan_posbindu', editingPosbinduItem.id), data, { merge: true });
                } else {
                  const newId = `PB-${Date.now()}`;
                  await setDoc(doc(db, 'pemeriksaan_posbindu', newId), { ...data, id: newId });
                }
                showNotification("Data Posbindu berhasil disimpan!");
                setShowPosbinduForm(false);
              } catch (err) {
                console.error("Save Posbindu Error:", err);
                handleFirestoreError(err, 'write', 'pemeriksaan_posbindu');
              }
            }} className="space-y-4">
              <input name="nik" placeholder="NIK" defaultValue={editingPosbinduItem?.nik} className="w-full p-3 border rounded-xl" required />
              <input name="nama" placeholder="Nama" defaultValue={editingPosbinduItem?.nama} className="w-full p-3 border rounded-xl" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="tanggalLahir" placeholder="Tanggal Lahir" defaultValue={editingPosbinduItem?.tanggalLahir} type="date" className="w-full p-3 border rounded-xl" />
                <select name="gender" defaultValue={editingPosbinduItem?.gender} className="w-full p-3 border rounded-xl">
                    <option value="">Jenis Kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                </select>
              </div>
              <input name="alamat" placeholder="Alamat (RT/RW)" defaultValue={editingPosbinduItem?.alamat} className="w-full p-3 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input name="beratBadan" placeholder="BB (kg)" defaultValue={editingPosbinduItem?.beratBadan} type="number" className="w-full p-3 border rounded-xl" />
                <input name="tinggiBadan" placeholder="TB (cm)" defaultValue={editingPosbinduItem?.tinggiBadan} type="number" className="w-full p-3 border rounded-xl" />
              </div>
              <input name="tekananDarah" placeholder="Tekanan Darah (Cth: 120/80)" defaultValue={editingPosbinduItem?.tekananDarah} className="w-full p-3 border rounded-xl" />
              <div className="grid grid-cols-3 gap-2">
                <input name="gulaDarah" placeholder="GDS" defaultValue={editingPosbinduItem?.gulaDarah} type="number" className="p-3 border rounded-xl" />
                <input name="kolesterol" placeholder="Kol" defaultValue={editingPosbinduItem?.kolesterol} type="number" className="p-3 border rounded-xl" />
                <input name="asamUrat" placeholder="AU" defaultValue={editingPosbinduItem?.asamUrat} type="number" className="p-3 border rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                    <input name="merokok" type="checkbox" defaultChecked={editingPosbinduItem?.merokok === 'true'} /> Merokok
                </label>
                <select name="aktivitasFisik" defaultValue={editingPosbinduItem?.aktivitasFisik} className="w-full p-3 border rounded-xl">
                    <option value="">Aktivitas Fisik</option>
                    <option value="Ringan">Ringan (Jarang gerak)</option>
                    <option value="Sedang">Sedang (Jalan rutin)</option>
                    <option value="Berat">Berat (Olahraga rutin)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowPosbinduForm(false)} className="flex-1 p-3 border rounded-xl">Batal</button>
                <button type="submit" className="flex-1 p-3 bg-blue-600 text-white rounded-xl">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSubTab === 'balita' && (
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
            </div>
            <button 
              onClick={() => { setEditingItem(null); setShowBalitaForm(true); }}
              className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-brand-blue/90 flex items-center gap-2 transition-all active:scale-95"
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
                {balitaData.filter(b => (b.nama || '').toLowerCase().includes(searchQuery.toLowerCase())).map(balita => {
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
                             onClick={() => { setSelectedBalita(balita); setActiveSubTab('timeline'); }}
                             className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Lihat Detail (Timeline)"
                           >
                              <Eye className="w-4 h-4" />
                           </button>
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
                    <div className="w-20 h-20 bg-white/20  rounded-full flex items-center justify-center mb-4 border border-white/30">
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
                    <div className="w-20 h-20 bg-white/20  rounded-full flex items-center justify-center mb-4 border border-white/30">
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
            </div>
            <button 
              onClick={() => { setEditingItem(null); setShowIbuHamilForm(true); }}
              className="px-4 py-2 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-brand-blue/90 transition-all flex items-center gap-2"
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
                {ibuHamilData.filter((mil: any) => (mil.nama || '').toLowerCase().includes(searchQuery.toLowerCase())).map((mil: any) => (
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
                            onClick={() => { setSelectedIbuHamil(mil); setActiveSubTab('ibuhamil_detail'); }}
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
        <div className="bg-white/80  rounded-3xl border border-white/50 shadow-xl shadow-slate-200/40 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-3">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight font-elegant">Jadwal & Agenda <span className="text-brand-pink">Kesehatan</span></h3>
               <div className="flex gap-2">
                 <button onClick={exportKegiatanPDF} className="p-2 bg-white border border-slate-200 text-brand-pink rounded-xl hover:bg-pink-50 transition-all active:scale-90" title="Export PDF">
                   <FileText className="w-5 h-5" />
                 </button>
                 <button onClick={exportKegiatanExcel} className="p-2 bg-white border border-slate-200 text-brand-blue rounded-xl hover:bg-blue-50 transition-all active:scale-90" title="Export Excel">
                   <FileSpreadsheet className="w-5 h-5" />
                 </button>
               </div>
             </div>
             <button 
               onClick={() => { setEditingItem(null); setShowKegiatanForm(true); }}
               className="px-6 py-3 bg-brand-pink text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-pink-100 hover:bg-pink-600 transition-all flex items-center gap-2 active:scale-95"
             >
               <PlusCircle className="w-5 h-5" />
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
                          {wargaData.map((w: any, idx: number) => <option key={`${w.nik || 'w'}-${idx}`} value={w.nik}>{w.nama} - RT {w.rt}</option>)}
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
                    <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all">{editingItem ? 'Simpan Perubahan' : 'Simpan Data'}</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH PEMERIKSAAN */}
      {showPemeriksaanForm && selectedBalita && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
                    <button type="submit" className="flex-1 py-3 bg-green-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95">{editingItem ? 'Simpan Perubahan' : 'Simpan Data'}</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* MODAL: TAMBAH KEGIATAN */}
      {showKegiatanForm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-slate-800">
                 <h3 className="font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {editingItem ? 'Edit Jadwal Kesehatan Warga' : 'Buat Jadwal Kesehatan Warga'}
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
                       <input type="text" name="lokasi" required defaultValue={editingItem?.lokasi || 'Kesehatan Warga RT 01'} placeholder="Cth: Balai Warga RT 01..." className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:border-blue-500" />
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
                    <button type="submit" className="flex-1 py-3 bg-pink-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-pink-700 shadow-lg shadow-pink-100 transition-all active:scale-95">{editingItem ? 'Simpan Perubahan' : 'Simpan Data'}</button>
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
      title: 'Hapus Semua Transaksi',
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
            Bank Sampah
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
                  className="w-full sm:w-auto p-2 px-3 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all active:scale-95 font-bold text-sm flex items-center justify-center gap-2"
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
                  {sampahSetoranData.filter((s: any) => s.namaNasabah?.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
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
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95" 
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <>
                              <button onClick={() => { setEditingItem(item); setShowSetoranForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteItem('sampah_setoran', item.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95" title="Hapus Transaksi">
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
                  className="w-full sm:w-auto p-2 px-3 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all active:scale-95 font-bold text-sm flex items-center justify-center gap-2"
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
                  {sampahTarikSaldoData.filter((t: any) => t.namaNasabah?.toLowerCase().includes(searchQuery.toLowerCase())).map((item: any) => (
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
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95" 
                            title="Lihat Detail Nasabah"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingItem(item); setShowTarikForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteItem('sampah_tarik_saldo', item.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95" title="Hapus Penarikan">
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
                    Transaksi
                  </h3>
                  <div className="space-y-3">
                    {[
                      ...sampahSetoranData.filter((s: any) => s.nasabahId === selectedNasabah.nik).map(s => ({ ...s, type: 'setoran' })),
                      ...sampahTarikSaldoData.filter((t: any) => t.nasabahId === selectedNasabah.nik).map(t => ({ ...t, type: 'tarik' }))
                    ].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()).map((item: any, idx) => (
                      <div key={`sampah-detail-hist-${item.id || idx}-${item.type}`} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all shadow-sm">
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
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm active:scale-95" 
                                title="Lihat/Mata"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => { setEditingItem(n); setShowNasabahForm(true); }} 
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
               <button onClick={() => setShowKategoriForm(true)} className="p-2 px-3 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all active:scale-95 font-bold text-sm flex items-center gap-2">
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
                       <button onClick={() => { setEditingItem(kat); setShowKategoriForm(true); }} className="p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm active:scale-95" title="Edit"><Edit className="w-4 h-4" /></button>
                       <button onClick={() => deleteItem('sampah_kategori', kat.id)} className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm active:scale-95" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4">
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

function InventarisView({ inventarisData, setInventarisData, inventarisLogs, setInventarisLogs, inventarisKategori, inventarisLokasi, inventarisSupplier, userRole, currentUser, tenantId, setIsLoadingDB, handleFirestoreError, showNotification, handleFileUpload }: any) {
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
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);

  const canEdit = useMemo(() => {
    if (!userRole) return false;
    const roleUpper = userRole.toUpperCase();
    return roleUpper === 'ADMIN' || roleUpper === 'RW' || roleUpper === 'RT' || roleUpper === 'BENDAHARA' || roleUpper === 'SEKRETARIS' || currentUser?.isSuperAdmin;
  }, [userRole, currentUser?.isSuperAdmin]);

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
    const fotoFile = (e.currentTarget.elements.namedItem('foto_aset') as HTMLInputElement)?.files?.[0];

    setIsLoadingDB(true);
    setUploading(true);
    
    try {
      let fotoUrl = editingItem?.foto_url || '';
      if (fotoFile && handleFileUpload) {
        fotoUrl = await handleFileUpload(fotoFile, 'inventaris', (pct) => setUploadPct(pct));
      }

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
        tanggal_perolehan: formData.get('tanggal_perolehan') as string,
        harga_perolehan: parseInt(formData.get('harga_perolehan') as string) || 0,
        foto_url: fotoUrl,
        tenantId,
        rt: currentUser?.rt || '01'
      };
      // Auto-save Kategori & Lokasi ke Master Data jika belum ada
      if (itemData.kategori) {
        const kExists = inventarisKategori.find(k => k.nama_kategori?.toLowerCase() === itemData.kategori?.toLowerCase());
        if (!kExists) {
          const kId = `KAT-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_kategori', kId), { id: kId, nama_kategori: itemData.kategori, tenantId });
        }
      }
      if (itemData.lokasi) {
        const lExists = inventarisLokasi.find(l => l.nama_lokasi?.toLowerCase() === itemData.lokasi?.toLowerCase());
        if (!lExists) {
          const lId = `LOK-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_lokasi', lId), { id: lId, nama_lokasi: itemData.lokasi, tenantId });
        }
      }
      if (itemData.supplier) {
        const sExists = inventarisSupplier.find(s => s.nama?.toLowerCase() === itemData.supplier?.toLowerCase());
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
      setUploading(false);
      setUploadPct(0);
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
      tenantId,
      rt: currentUser?.rt || '01'
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
        const sExists = inventarisSupplier.find((s:any) => s.nama?.toLowerCase() === logData.supplier?.toLowerCase());
        if (!sExists) {
          const sId = `SUP-${Date.now()}`;
          await setDoc(doc(db, 'inventaris_supplier', sId), { id: sId, nama: logData.supplier, kontak: '', alamat: '', tenantId });
        }
      }
      if (logData.ke_lokasi && txType === 'Mutasi Barang') {
        const lExists = inventarisLokasi.find((l:any) => l.nama_lokasi?.toLowerCase() === logData.ke_lokasi?.toLowerCase());
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
    if (!id || id === 'undefined') {
      console.error("Critical: Attempted to delete item with invalid ID");
      showNotification("Kesalahan: ID barang tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification("Anda tidak memiliki izin untuk menghapus aset.", "error");
      return;
    }
    
    if (!window.confirm(`Hapus barang "${nama}" dari inventaris? Tindakan ini tidak dapat dibatalkan.`)) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'inventaris', id));
      showNotification(`Aset "${nama}" berhasil dihapus.`, "success");
    } catch (error: any) {
      console.error("Firestore Delete Asset Error:", error);
      handleFirestoreError(error, 'delete', `inventaris/${id}`);
    } finally {
      setIsLoadingDB(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!logId || logId === 'undefined') {
      console.error("Critical: Attempted to delete log with invalid ID");
      showNotification("Kesalahan: ID riwayat tidak ditemukan.", "error");
      return;
    }

    if (!canEdit) {
      showNotification("Anda tidak memiliki izin untuk menghapus riwayat.", "error");
      return;
    }

    if (!window.confirm("Hapus riwayat aktivitas ini? Tindakan ini tidak dapat dibatalkan.")) return;

    setIsLoadingDB(true);
    try {
      await deleteDoc(doc(db, 'inventaris_logs', logId));
      showNotification("Catatan aktivitas berhasil dihapus.", "success");
    } catch (error: any) {
      console.error("Firestore Delete Log Error:", error);
      handleFirestoreError(error, 'delete', `inventaris_logs/${logId}`);
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
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Aset / Barang</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stok</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori & Lokasi</th>
                <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Perolehan</th>
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
                      <div className="flex items-center gap-3">
                        {item.foto_url ? (
                          <img src={item.foto_url} alt={item.nama_barang} className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                             <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800 tracking-tight">{item.nama_barang}</p>
                          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Merk: {item.merk || '-'}</p>
                        </div>
                      </div>
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
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-bold text-slate-700">{item.tanggal_perolehan ? new Date(item.tanggal_perolehan).toLocaleDateString('id-ID') : '-'}</p>
                      <p className="text-[10px] text-emerald-600 font-mono font-bold mt-0.5">Rp {(item.harga_perolehan || 0).toLocaleString('id-ID')}</p>
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
                          <button onClick={() => { setEditingItem(item); setShowAddForm(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100" title="Edit Aset">
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
                    {editingItem ? <Edit className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <h3 className="font-bold text-slate-800">{editingItem ? 'Edit Aset' : 'Tambah Aset Baru'}</h3>
               </div>
               <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:text-red-500 bg-white border border-slate-200 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
             </div>
             <form onSubmit={handleSaveItem} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Foto Aset</label>
                   <div className="flex items-center gap-4">
                     <div className="w-20 h-20 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                       {editingItem?.foto_url ? (
                         <img src={editingItem.foto_url} alt="Preview" className="w-full h-full object-cover" />
                       ) : (
                         <Camera className="w-8 h-8 text-slate-300" />
                       )}
                     </div>
                     <div className="flex-1">
                        <input type="file" name="foto_aset" accept="image/*" className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                        <p className="text-[9px] text-slate-400 mt-2 font-medium">Format JPG/PNG, Max 2MB. Foto baru akan menggantikan yang lama.</p>
                     </div>
                   </div>
                   {uploading && (
                      <div className="mt-3">
                         <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${uploadPct}%` }}></div>
                         </div>
                         <p className="text-[9px] font-black text-blue-600 text-right mt-1">Mengunggah: {uploadPct}%</p>
                      </div>
                   )}
                 </div>
                 <div className="col-span-2">
                   <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Nama Aset / Barang <span className="text-red-500">*</span></label>
                   <input type="text" name="nama_barang" required defaultValue={editingItem?.nama_barang} placeholder="Contoh: Tenda 3x4" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-bold" />
                 </div>
                 <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tgl Perolehan</label>
                    <input type="date" name="tanggal_perolehan" defaultValue={editingItem?.tanggal_perolehan} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-medium" />
                 </div>
                 <div className="col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Harga Perolehan</label>
                    <input type="number" name="harga_perolehan" defaultValue={editingItem?.harga_perolehan || 0} placeholder="Rp" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-blue-500 outline-none font-mono font-bold" />
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
                 <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95">Simpan Aset</button>
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
        <div className="fixed inset-0 z-[100] bg-slate-900/60  flex items-center justify-center p-4 overflow-y-auto">
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
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-mono text-slate-400">{log.tanggal}</span>
                            </div>
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

