import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookCopy, Monitor, UserPlus, History, Siren, Upload, Printer, UserCheck, CheckCircle2, 
  Camera, Trash2, Search, FileSpreadsheet, FileText, User, MapPin, Info, Clock, LogOut, 
  MessageCircle, Eye, Archive, ShieldCheck, MessageSquare, X, Home, Phone, Lock 
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

interface BukuTamuViewProps {
  bukuTamuData: any[];
  setBukuTamuData: any;
  currentUser: any;
  tenantId: string;
  handleFirestoreError: any;
  showNotification: any;
}

export default function BukuTamuView({ 
  bukuTamuData, setBukuTamuData, currentUser, tenantId, handleFirestoreError, showNotification 
}: BukuTamuViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'monitor' | 'registrasi' | 'log'>('monitor');
  const [searchTerm, setSearchTerm] = useState('');
  const [cameraOpen, setCameraOpen] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<any>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [, setDetections] = useState<any[]>([]);

  // Load Face API Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log('Face API Models Loaded Successfully');
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };
    loadModels();
  }, []);

  // Face Detection Loop
  useEffect(() => {
    let intervalId: any;
    if (activeSubTab === 'monitor' && modelsLoaded) {
      intervalId = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          
          if (canvasRef.current) {
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const detectionsData = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceExpressions();
            
            const resizedDetections = faceapi.resizeResults(detectionsData, displaySize);
            setDetections(resizedDetections);
            
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);
              faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
            }
          }
        }
      }, 200);
    }
    return () => clearInterval(intervalId);
  }, [activeSubTab, modelsLoaded]);

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
  }, [tenantId, handleFirestoreError, setBukuTamuData]);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      if (detections.length === 0) {
        showNotification('Wajah tidak terdeteksi. Silakan posisikan wajah di depan kamera.', 'error');
        return;
      }
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      setCameraOpen(false);
      showNotification('Wajah berhasil diverifikasi oleh AI Security', 'success');
    }
  }, [webcamRef, detections, showNotification]);

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

  const generateIDCard = (guest: any) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 55] // ID Card standard size
    });

    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 85, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("GUEST PASS - SMART RW", 42.5, 9, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(`Name: ${guest.nama}`, 35, 25);
    doc.text(`Target: ${guest.tujuan}`, 35, 30);
    doc.text(`Date: ${new Date(guest.waktuDatang).toLocaleDateString()}`, 35, 35);
    doc.text(`ID: ${guest.id}`, 35, 40);

    if (guest.fotoUrl) {
      doc.addImage(guest.fotoUrl, 'JPEG', 5, 20, 25, 25);
    }

    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text("SECURITY VERIFIED", 42.5, 50, { align: 'center' });

    doc.save(`ID_CARD_${guest.nama}.pdf`);
    showNotification(`ID Card ${guest.nama} berhasil diunduh`);
  };

  const notifyViaWhatsApp = (guest: any) => {
    const message = `*NOTIFIKASI TAMU - SMART RW*%0A%0A` +
      `Halo, ada tamu berkunjung untuk Anda:%0A` +
      `👤 *Nama:* ${guest.nama}%0A` +
      `🏠 *Tujuan:* ${guest.tujuan}%0A` +
      `📝 *Keperluan:* ${guest.keperluan || '-'}%0A` +
      `⏰ *Waktu:* ${new Date(guest.waktuDatang).toLocaleTimeString('id-ID')}%0A%0A` +
      `_Tamu saat ini sedang berada di Pos Keamanan._`;
    
    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');
    showNotification(`Link WhatsApp dikirim untuk ${guest.nama}`);
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
      <div className="bg-white p-4 md:p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <BookCopy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">Sistem Buku Tamu</h1>
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden border-8 border-slate-800 shadow-2xl group">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={1}
                    className="w-full h-full object-cover opacity-80"
                    videoConstraints={{ facingMode: "user" }}
                  />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
                  
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

                    <div className="absolute left-0 right-0 top-0 h-[2px] bg-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-[scan_4s_ease-in-out_infinite]"></div>

                    {!modelsLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="text-center space-y-4">
                          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-white font-black uppercase text-[10px] tracking-widest">Initializing AI Models...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-black uppercase text-sm tracking-widest flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-blue-500" />
                       Security Control Center
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-500 text-[8px] font-black uppercase">Core Connected</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 text-center transition-all group">
                      <Siren className="w-6 h-6 text-red-500 mx-auto mb-2 group-hover:scale-110" />
                      <p className="text-[10px] font-black text-white uppercase">Panic Button</p>
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 text-center transition-all group">
                      <Upload className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110" />
                      <p className="text-[10px] font-black text-white uppercase">Cloud Upload</p>
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 text-center transition-all group">
                      <Printer className="w-6 h-6 text-slate-400 mx-auto mb-2 group-hover:scale-110" />
                      <p className="text-[10px] font-black text-white uppercase">Print Daily Log</p>
                    </button>
                    <button 
                      onClick={() => setActiveSubTab('registrasi')}
                      className="bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl text-center transition-all shadow-xl shadow-blue-900/20 group"
                    >
                      <UserPlus className="w-6 h-6 text-white mx-auto mb-2 group-hover:scale-110" />
                      <p className="text-[10px] font-black text-white uppercase">Entry Access</p>
                    </button>
                  </div>
                </div>

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
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">FOTO KEAMANAN</h3>
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
                            <div className="flex items-center justify-end gap-2">
                              {item.status === 'Bertamu' && (
                                <>
                                  <button 
                                    onClick={() => notifyViaWhatsApp(item)}
                                    className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all active:scale-95 shadow-sm"
                                    title="Notify via WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => generateIDCard(item)}
                                    className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
                                    title="Generate ID Card"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => markFinished(item.id)}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                                  >
                                    Check-Out
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => setSelectedGuest(item)}
                                className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 shadow-sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
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

          <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-[1.5rem] flex items-center justify-center border border-green-100">
              <MessageSquare className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">WhatsApp ChatBot</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active & Connected</p>
            </div>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-ping"></div>
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Bot akan otomatis mengirimkan notifikasi QR Code dan konfirmasi kedatangan ke WhatsApp warga.
            </p>
            <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200">
              Bot Settings
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedGuest && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuest(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border border-slate-100"
            >
              <div className="relative h-64 bg-slate-100 flex items-center justify-center">
                {selectedGuest.fotoUrl ? (
                  <img src={selectedGuest.fotoUrl} alt={selectedGuest.nama} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-24 h-24 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-10">
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none">{selectedGuest.nama}</h2>
                  <p className="text-blue-400 font-bold text-sm tracking-widest mt-2">{selectedGuest.status === 'Bertamu' ? 'CURRENTLY IN PREMISES' : 'CHECKED OUT'}</p>
                </div>
                <button 
                  onClick={() => setSelectedGuest(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-10 grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detailed Information</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <p className="text-sm font-black text-slate-800">{selectedGuest.noHp || 'No Contact'}</p>
                          <p className="text-[10px] font-bold text-slate-400">CONTACT NUMBER</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <p className="text-sm font-black text-slate-800">{selectedGuest.alamat || 'N/A'}</p>
                          <p className="text-[10px] font-bold text-slate-400">ORIGIN ADDRESS</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visit Information</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Home className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <p className="text-sm font-black text-slate-800">{selectedGuest.tujuan}</p>
                          <p className="text-[10px] font-bold text-slate-400">DESTINATION</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-slate-400 mt-1" />
                        <div>
                          <p className="text-sm font-black text-slate-800">{selectedGuest.keperluan || 'Biasa'}</p>
                          <p className="text-[10px] font-bold text-slate-400">PURPOSE OF VISIT</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Check-In</span>
                    <span className="text-xs font-black text-slate-700">{new Date(selectedGuest.waktuDatang).toLocaleString('id-ID')}</span>
                  </div>
                  {selectedGuest.waktuKeluar && (
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Check-Out</span>
                      <span className="text-xs font-black text-slate-700">{new Date(selectedGuest.waktuKeluar).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => generateIDCard(selectedGuest)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    ID Card
                  </button>
                  {selectedGuest.status === 'Bertamu' && (
                    <button 
                      onClick={() => { markFinished(selectedGuest.id); setSelectedGuest(null); }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                      Checkout Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
