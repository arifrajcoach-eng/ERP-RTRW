import { auth, storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export const calculateAge = (tglLahir: string) => {
  if (!tglLahir) return "-";
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

export const handleFirestoreError = (err: any, op: string, path: string, currentUser?: any, showNotification?: (msg: string, type: 'success' | 'error' | 'info') => void) => {
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
  if (showNotification) {
      showNotification(`Akses Gagal: ${op.toUpperCase()} pada ${path}. Sesi anda mungkin habis atau izin ditolak.`, 'error');
  }
  throw new Error(JSON.stringify(errInfo));
};

export const handleFileUpload = async (file: File, folder: string, onProgress?: (pct: number) => void) => {
  try {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    if (onProgress) onProgress(0);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        }, 
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("Storage upload error:", error);
    throw error;
  }
};

export const generateSuratHTML = (surat: any, kop: any, settings: any) => {
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
          <div class="flex items-center gap-4 relative">
               \${surat.show_logo === 'yes' && kop.logo_url ? \`<img src="\${kop.logo_url}" crossorigin="anonymous" alt="Logo" class="w-20 h-20 object-contain" />\` : '<div class="w-20"></div>'}
               <div class="flex-1 text-center">
                   <h2 class="text-lg font-bold uppercase">\${kop.nama_rt || \`RUKUN TETANGGA \${kop.rt || '...'} / RUKUN WARGA \${kop.rw || '...'}\`}</h2>
                   <p class="text-sm">KELURAHAN \${kop.kelurahan?.toUpperCase() || '...'} - KECAMATAN \${kop.kecamatan?.toUpperCase() || '...'}</p>
                   <p class="text-sm font-bold">\${(kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase().includes('KABUPATEN') || (kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase().includes('KOTA') ? '' : 'KABUPATEN '}\${(kop.kabupaten || settings.kabupaten || 'BEKASI').toUpperCase()}</p>
                   <p class="text-[10px]">Sekretariat : \${kop.alamat || '...'} | Email: \${kop.email || '...'} | Instagram: \${kop.instagram || '...'}</p>
               </div>
               <div class="w-20"></div>
          </div>
          <div class="border-b-4 border-black mt-2"></div>
          <div class="border-b-2 border-black mt-0.5"></div>
          
          <div class="text-center mt-6">
              <h3 class="text-lg font-bold underline">\${surat.jenisSurat || 'SURAT PENGANTAR'}</h3>
              <p>Nomor : \${surat.nomor_surat || '...... / RT .... / RW .... / Tahun 202...'}</p>
          </div>
          
          <div class="mt-6 leading-relaxed">
              <p class="mb-4">Yang bertanda tangan di bawah ini Ketua RT \${surat.rt || kop.rt || '...'} / RW \${surat.rw || kop.rw || '...'}</p>
              <p class="mb-4">Dengan ini menerangkan bahwa :</p>
              <div class="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                 <div>Nama</div><div>:</div><div><strong>\${surat.pemohon}</strong></div>
                 <div>Tempat Tgl, Lahir</div><div>:</div><div>\${surat.ttl || '-'}</div>
                 <div>Jenis Kelamin</div><div>:</div><div>\${surat.jk || '-'}</div>
                 <div>Pekerjaan</div><div>:</div><div>\${surat.pekerjaan || '-'}</div>
                 <div>Kewarganegaraan</div><div>:</div><div>\${surat.kewarganegaraan || 'WNI'}</div>
                 <div>No. KTP/NIK</div><div>:</div><div>\${surat.nik || '-'}</div>
                 <div>Status Perkawinan</div><div>:</div><div>\${surat.statusKawin || '-'}</div>
                 <div>Alamat</div><div>:</div><div>\${surat.alamat || '-'}</div>
                 <div class="mt-2">Maksud / Keperluan</div><div class="mt-2">:</div><div class="mt-2 font-bold">\${surat.keperluan || '-'}</div>
              </div>
              <p class="mt-6">Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          <div class="mt-12 flex justify-between">
              <div class="text-center">
                  <p>Mengetahui,</p>
                  <p>Ketua RW \${surat.rw || kop.rw || '....'}</p>
                  <div class="h-20"></div>
                  <p class="font-bold underline">\${surat.ketua_rw_nama || kop.nama_ketua_rw || '...................................'}</p>
              </div>
              <div class="text-center">
                  <p>\${(() => {
                      const kab = kop.kabupaten || settings.kabupaten || 'Bekasi';
                      const prefix = kab.toUpperCase().includes('KABUPATEN') || kab.toUpperCase().includes('KOTA') ? '' : 'Kabupaten ';
                      return prefix + kab.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    })()}, \${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p>\${surat.jabatan_ttd || 'Ketua RT'} \${surat.rt || kop.rt || '....'}</p>
                  <div class="h-20"></div>
                  <p class="font-bold underline">\${surat.ketua || kop.nama_ketua_rt || '...................................'}</p>
              </div>
          </div>

          <div class="mt-12 border-t border-black pt-2 text-[10px] text-gray-500">
               <div class="flex justify-between font-mono">
                  <div>Ref Code: \${surat.id}</div>
                  <div>Sistem Informasi RW 26 - Digital Archive</div>
                  <div>Digital Signature Certified</div>
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
  \`;
};
