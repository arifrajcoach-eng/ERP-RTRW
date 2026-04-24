import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { db, storage } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Settings, Save, Upload, FileText, PlusCircle, CheckCircle } from 'lucide-react';

export default function KopTemplateManagementView({ currentUser, settings, showNotification, handleFirestoreError }: { currentUser: any, settings: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void, handleFirestoreError: any }) {
  const [activeSub, setActiveSub] = useState('branding');
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manajemen KOP & Template</h2>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveSub('branding')} className={`px-4 py-2 rounded-lg ${activeSub === 'branding' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Branding</button>
        <button onClick={() => setActiveSub('template')} className={`px-4 py-2 rounded-lg ${activeSub === 'template' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Template</button>
      </div>

      {activeSub === 'branding' && <BrandingForm currentUser={currentUser} settings={settings} showNotification={showNotification} handleFirestoreError={handleFirestoreError} />}
      {activeSub === 'template' && <TemplateList currentUser={currentUser} showNotification={showNotification} handleFirestoreError={handleFirestoreError} />}
    </div>
  );
}

function TemplateSuratFisik({ formData, logoUrl }: { formData: any, logoUrl: string }) {
  return (
    <div className="w-[210mm] min-h-[297mm] p-[15mm] bg-white text-black shadow-lg mx-auto text-sm font-serif">
        {/* Kop Surat */}
        <div className="flex items-center gap-4 relative">
             {logoUrl && <img src={logoUrl} crossOrigin="anonymous" alt="Logo" className="w-20 h-20 object-contain" />}
             <div className="flex-1 text-center">
                 <h2 className="text-lg font-bold uppercase">{formData.nama_rt || `RUKUN TETANGGA ${formData.rt || '...'} / RUKUN WARGA ${formData.rw || '...'}`}</h2>
                 <p className="text-sm">KELURAHAN {formData.kelurahan?.toUpperCase() || '...'} - KECAMATAN {formData.kecamatan?.toUpperCase() || '...'}</p>
                 <p className="text-sm font-bold">{formData.kabupaten?.toUpperCase().includes('KABUPATEN') || formData.kabupaten?.toUpperCase().includes('KOTA') ? '' : 'KABUPATEN '}{formData.kabupaten?.toUpperCase() || 'BEKASI'}</p>
                 <p className="text-[10px]">Sekretariat : {formData.alamat || '...'} | Email: {formData.email || '...'} | Instagram: {formData.instagram || '...'}</p>
             </div>
             {/* Spacer to balance the logo */}
             <div className="w-20"></div>
        </div>
        <div className="border-b-4 border-black mt-2"></div>
        <div className="border-b-2 border-black mt-0.5"></div>
        
        {/* Surat */}
        <div className="text-center mt-6">
            <h3 className="text-lg font-bold underline">SURAT PENGANTAR</h3>
            <p>Nomor : ...... / RT {formData.rt || '....'} / RW {formData.rw || '....'} / Tahun 202...</p>
        </div>
        
        <div className="mt-6">
            <p className="mb-4">Yang bertanda tangan di bawah ini Ketua RT {formData.rt || '...'} / RW {formData.rw || '...'} Kelurahan {formData.kelurahan || '...'} Kecamatan {formData.kecamatan || '...'} {(formData.kabupaten?.toUpperCase().includes('KABUPATEN') || formData.kabupaten?.toUpperCase().includes('KOTA')) ? '' : 'Kabupaten '}{formData.kabupaten || '...'}</p>
            <p className="mb-4">Dengan ini menerangkan bahwa :</p>
            <div className="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
               <div>Nama</div><div>:</div><div>...........................................................................</div>
               <div>Tempat Tgl, Lahir</div><div>:</div><div>...........................................................................</div>
               <div>Jenis Kelamin</div><div>:</div><div>...........................................................................</div>
               <div>Pekerjaan</div><div>:</div><div>...........................................................................</div>
               <div>Kewarganegaraan</div><div>:</div><div>...........................................................................</div>
               <div>No. KTP/NIK</div><div>:</div><div>....................................... Tanggal : ..........................</div>
               <div>Status Perkawinan</div><div>:</div><div>...........................................................................</div>
               <div>Alamat</div><div>:</div><div>...........................................................................</div>
               <div>Maksud / Keperluan</div><div>:</div><div>...........................................................................</div>
            </div>
            <p className="mt-6">Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
        </div>

        {/* Tanda Tangan */}
        <div className="mt-12 flex justify-between">
            <div className="text-center">
                <p>Mengetahui,</p>
                <p>Ketua RW {formData.rw || '....'}</p>
                <div className="h-20" />
                <p className="underline font-bold">{formData.nama_ketua_rw || '...................................'}</p>
            </div>
            <div className="text-center">
                <p>{(() => {
                    const kab = formData.kabupaten || 'Bekasi';
                    const prefix = kab.toUpperCase().includes('KABUPATEN') || kab.toUpperCase().includes('KOTA') ? '' : 'Kabupaten ';
                    return prefix + kab.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                  })()}, ......................... 202...</p>
                <p>Ketua RT {formData.rt || '....'}</p>
                <div className="h-20" />
                <p className="underline font-bold">{formData.nama_ketua_rt || '...................................'}</p>
            </div>
        </div>

        {/* Footer Arsip*/}
        <div className="mt-12 border-t border-black pt-2 text-[10px] text-gray-500">
             <div className="flex justify-between">
                <div>TL. Berkas / Surat No : ......</div>
                <div>Hal : ......</div>
                <div>Tgl : ......</div>
             </div>
             <div className="mt-2 flex gap-4">
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> Berkas Sesuai</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> Berkas ke Kecamatan</div>
                <div className="flex items-center gap-1">Paraf Arsiparis <div className="w-20 h-4 border border-black"></div></div>
             </div>
        </div>
    </div>
  );
}

function BrandingForm({ currentUser, settings, showNotification, handleFirestoreError }: { currentUser: any, settings: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void, handleFirestoreError: any }) {
  const [formData, setFormData] = useState({
    nama_rt: settings?.nama_rt || '',
    rt: settings?.rt || '',
    rw: settings?.rw || '',
    nama_ketua_rt: settings?.nama_ketua_rt || '',
    nama_ketua_rw: settings?.nama_ketua_rw || '',
    alamat: settings?.alamat || '',
    telepon: settings?.telepon || '',
    email: settings?.email || '',
    instagram: settings?.instagram || '',
    kelurahan: settings?.kelurahan || '',
    kecamatan: settings?.kecamatan || '',
    kabupaten: settings?.kabupaten || ''
  });
  const [logoUrl, setLogoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const tenantId = currentUser.tenantId || 'RW26_SMART';
  const previewRef = useRef<HTMLDivElement>(null);

  const handleCetak = () => {
    if (!previewRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showNotification("Gagal membuka jendela cetak. Pastikan pop-up diizinkan.", 'error');
      return;
    }

    const previewHtml = previewRef.current.innerHTML;

    printWindow.document.write(`
      <html>
        <head>
          <title>Uji Coba Cetak Branding - ${formData.nama_rt || 'SmartRW'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { 
              font-family: 'Times New Roman', Times, serif;
              background: #f3f4f6;
              margin: 0;
              padding: 0;
            }
            .no-print { 
              background: #2563eb; 
              color: white; 
              padding: 1rem; 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              position: sticky;
              top: 0;
              z-index: 50;
            }
            .btn {
              padding: 0.5rem 1rem;
              border-radius: 0.5rem;
              font-weight: bold;
              cursor: pointer;
              border: none;
            }
            .btn-white { background: white; color: #2563eb; }
            .btn-blue { background: #1d4ed8; color: white; }
            .container { padding: 2rem; }
            .print-container {
              width: 210mm;
              margin: 0 auto;
              background: white;
              box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
              min-height: 297mm;
            }
            @media print {
              @page { margin: 1.5cm; }
              body { background: white; }
              .no-print, .container { padding: 0; margin: 0; }
              .container { padding: 0; }
              .print-container { box-shadow: none; margin: 0; width: 100%; }
              .no-print { display: none; }
            }
            /* Copy essential preview styles */
            .header-info h1, .header-info h2, .header-info h3 { margin: 0; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="no-print">
            <h1 style="margin:0; font-size:1.25rem;">Pratinjau Cetak Uji Coba</h1>
            <div style="display:flex; gap:0.5rem;">
              <button onclick="window.print()" class="btn btn-white">Cetak Sekarang</button>
              <button onclick="window.close()" class="btn btn-blue">Tutup</button>
            </div>
          </div>
          <div class="container">
            <div class="print-container">
              ${previewHtml}
            </div>
          </div>
          <script>
            function checkImages() {
              const images = document.getElementsByTagName('img');
              let loadedCount = 0;
              if (images.length === 0) return;
              for (let i = 0; i < images.length; i++) {
                if (images[i].complete) {
                  loadedCount++;
                } else {
                  images[i].addEventListener('load', () => {
                    loadedCount++;
                  });
                  images[i].addEventListener('error', () => {
                    loadedCount++;
                  });
                }
              }
            }
            window.onload = checkImages;
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {

    const unsub = onSnapshot(doc(db, 'tenant_settings', tenantId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFormData({
            nama_rt: data.nama_rt || '',
            rt: data.rt || '',
            rw: data.rw || '',
            nama_ketua_rt: data.nama_ketua_rt || '',
            nama_ketua_rw: data.nama_ketua_rw || '',
            alamat: data.alamat || '',
            telepon: data.telepon || '',
            email: data.email || '',
            instagram: data.instagram || '',
            kelurahan: data.kelurahan || '',
            kecamatan: data.kecamatan || '',
            kabupaten: data.kabupaten || ''
        });
        setLogoUrl(data.logo_url || '');
      }
    });
    return unsub;
  }, [tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
        ...prev,
        [e.target.name]: e.target.value
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validation
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      showNotification("Ukuran file maksimal 1MB", 'error');
      return;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      showNotification("Hanya file .png, .jpg, atau .jpeg yang diizinkan", 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0); // Optional: You can remove this or use a simulated progress if uploadBytes doesn't supply it.
    try {
      // 2. Upload to Firebase
      const storagePath = `branding/${tenantId}/logo_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      
      // Try using uploadBytes which returns a Promise directly
      const snapshot = await uploadBytes(storageRef, file);
      setUploadProgress(100);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // 3. Update Firestore
      await setDoc(doc(db, 'tenant_settings', tenantId), { logo_url: downloadURL }, { merge: true });
      setLogoUrl(downloadURL);
      showNotification("Logo berhasil diunggah", 'success');
    } catch (error: any) {
      console.error("Upload error:", error);
      showNotification(`Gagal mengunggah logo: ${error.message || 'Error tidak diketahui'}`, 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // Reset input
    }
  };

  const handleRemoveLogo = async () => {
    if (!confirm("Hapus logo ini?")) return;
    setUploading(true);
    try {
      await setDoc(doc(db, 'tenant_settings', tenantId), { logo_url: '' }, { merge: true });
      setLogoUrl('');
      showNotification("Logo berhasil dihapus", 'success');
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, 'update', `tenant_settings/${tenantId}`);
      showNotification("Gagal menghapus logo", 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenant_settings', tenantId), { ...formData, logo_url: logoUrl, tenantId }, { merge: true });
      showNotification("Branding berhasil disimpan", 'success');
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, 'update', `tenant_settings/${tenantId}`);
      showNotification("Gagal menyimpan branding.", 'error');
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Pengaturan Branding RT/RW</h3>
        
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo RT/RW</label>
            {logoUrl ? (
              <div className="flex items-center gap-4 mb-3">
                <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain border rounded p-1 bg-white" />
                <button 
                  onClick={handleRemoveLogo}
                  className="text-xs text-red-600 font-bold hover:underline"
                  disabled={uploading}
                >
                  Hapus Logo
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 mb-2">
                <Upload size={20} />
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" disabled={uploading} />
            {uploading && (
              <div className="mt-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Mengunggah: {Math.round(uploadProgress)}%</p>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-1 italic">* Format .png/.jpg maksimal 1MB</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Papan Nama RT/RW</label>
                <input name="nama_rt" value={formData.nama_rt} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: RUKUN TETANGGA 03 / RUKUN WARGA 26" />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nomor RT</label>
                <input name="rt" value={formData.rt} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="03" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nomor RW</label>
                <input name="rw" value={formData.rw} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="26" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nama Ketua RT</label>
                <input name="nama_ketua_rt" value={formData.nama_ketua_rt} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nama Lengkap Ketua RT" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nama Ketua RW</label>
                <input name="nama_ketua_rw" value={formData.nama_ketua_rw} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nama Lengkap Ketua RW" />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Nomor Telepon</label>
                <input name="telepon" value={formData.telepon} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: 08123456789" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Alamat Lengkap</label>
                <input name="alamat" value={formData.alamat} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Alamat lengkap Sekretariat" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="email@rt-rw.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Instagram</label>
                <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="@akun_instagram" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Kelurahan</label>
                <input name="kelurahan" value={formData.kelurahan} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Sukamaju" />
            </div>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Kecamatan</label>
                <input name="kecamatan" value={formData.kecamatan} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Sukajaya" />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Kabupaten/Kota</label>
                <input name="kabupaten" value={formData.kabupaten} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Bekasi" />
            </div>
        </div>

        <button 
           onClick={handleSaveBranding}
           disabled={saving}
           className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          {saving ? 'Menyimpan...' : 'Simpan Branding'}
        </button>
        <button 
           onClick={handleCetak}
           className="mt-6 ml-4 bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Cetak Uji Coba
        </button>
      </div>

      <div className="bg-slate-100 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Live Preview</h3>
        <div ref={previewRef} className="p-4 bg-white overflow-x-auto">
          <TemplateSuratFisik formData={formData} logoUrl={logoUrl} />
        </div>
      </div>
    </div>
  );
}

function TemplateList({ currentUser, showNotification, handleFirestoreError }: { currentUser: any, showNotification: (msg: string, type?: 'success' | 'error' | 'info') => void, handleFirestoreError: any }) {
  const [selectedCategory, setSelectedCategory] = useState('surat');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const tenantId = currentUser.tenantId || 'RW26_SMART';
  
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenant_settings', tenantId), (snap) => {
      if (snap.exists()) {
        setActiveTemplateId(snap.data().active_template || 'surat_pengantar');
      }
    });
    return unsub;
  }, [tenantId]);

  const handleSelectTemplate = async (id: string) => {
    try {
      await setDoc(doc(db, 'tenant_settings', tenantId), { active_template: id }, { merge: true });
      showNotification(`Template ${id} diaktifkan sebagai default`, 'success');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, 'update', `tenant_settings/${tenantId}`);
      showNotification("Gagal mengaktifkan template", 'error');
    }
  };

  
  const templates = {
    surat: [
      { id: 'surat_pengantar', name: 'Surat Pengantar RT', desc: 'Template standar surat pengantar RT/RW', lastUsed: '24 Apr 2026' },
      { id: 'surat_domisili', name: 'Surat Keterangan Domisili', desc: 'Template surat pernyataan domisili warga', lastUsed: '20 Apr 2026' },
      { id: 'surat_sku', name: 'Surat Keterangan Usaha', desc: 'Template surat keterangan usaha (SKU)', lastUsed: '15 Apr 2026' },
    ],
    kwitansi: [
      { id: 'kwitansi_iuran', name: 'Kwitansi Iuran Bulanan', desc: 'Template kwitansi bukti bayar iuran', lastUsed: '24 Apr 2026' },
      { id: 'kwitansi_sosial', name: 'Kwitansi Dana Sosial', desc: 'Template bukti sumbangan dana sosial', lastUsed: '10 Apr 2026' },
    ],
    laporan: [
      { id: 'laporan_kas', name: 'Laporan Kas Bulanan', desc: 'Format laporan rekapitulasi kas RT', lastUsed: '01 Apr 2026' },
      { id: 'laporan_warga', name: 'Rekapitulasi Data Warga', desc: 'Format laporan data statistik warga', lastUsed: '05 Apr 2026' },
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
          {['surat', 'kwitansi', 'laporan'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedCategory === cat ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 italic">
          Template aktif saat ini: <span className="font-bold text-blue-600">{activeTemplateId || '-'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates[selectedCategory as keyof typeof templates].map((tpl) => (
          <div 
            key={tpl.id} 
            className={`bg-white border-2 rounded-xl p-4 hover:shadow-md transition-all group relative ${
              activeTemplateId === tpl.id ? 'border-blue-500 shadow-sm' : 'border-slate-200'
            }`}
          >
            {activeTemplateId === tpl.id && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
                <CheckCircle size={14} />
              </div>
            )}
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg transition-colors ${
                activeTemplateId === tpl.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
              }`}>
                <FileText size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Ver. 1.0</span>
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{tpl.name}</h4>
            <p className="text-xs text-slate-500 mb-4">{tpl.desc}</p>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 italic">Terakhir: {tpl.lastUsed}</span>
              <div className="flex gap-3">
                 <button 
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`text-[10px] font-bold ${activeTemplateId === tpl.id ? 'text-green-600' : 'text-blue-600 hover:underline'}`}
                  disabled={activeTemplateId === tpl.id}
                 >
                   {activeTemplateId === tpl.id ? 'Aktif' : 'Aktifkan'}
                 </button>
                 <button className="text-[10px] font-bold text-slate-600 hover:underline">Edit</button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Template Card */}
        <button className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-600 min-h-[160px]">
          <PlusCircle size={24} />
          <span className="text-xs font-bold font-sans">Tambah Template</span>
        </button>
      </div>
    </div>
  );
}
