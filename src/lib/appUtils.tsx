import { PLAN_FEATURES, PLAN_ALIASES } from "../constants";

export type AppRole = 'VIEWER' | 'OPERATOR' | 'ADMIN' | 'SUPER_ADMIN' | 'OWNER' | 'RW' | 'RT' | 'WARGA' | 'USER';

export const canView = (role?: string) => true; // All roles can view basic data
export const canCreate = (role?: string) => {
  if (!role) return false;
  return ['ADMIN', 'SUPER_ADMIN', 'OWNER', 'RW', 'RT', 'OPERATOR'].includes(role.toUpperCase());
};
export const canUpdate = (role?: string) => {
  if (!role) return false;
  return ['ADMIN', 'SUPER_ADMIN', 'OWNER', 'RW', 'RT', 'OPERATOR'].includes(role.toUpperCase());
};
export const canDelete = (role?: string) => {
  if (!role) return false;
  // Operator cannot delete
  return ['ADMIN', 'SUPER_ADMIN', 'OWNER', 'RW', 'RT'].includes(role.toUpperCase());
};

export const getPlanFeatures = (tenantOrStatus: any) => {
  const status =
    typeof tenantOrStatus === "string"
      ? tenantOrStatus
      : tenantOrStatus?.status;
  const addons =
    typeof tenantOrStatus === "object" && tenantOrStatus?.addons
      ? tenantOrStatus.addons
      : [];

  if (!status) return PLAN_FEATURES.TRIAL;
  const normalizedStatus = status
    .toUpperCase()
    .replace("V4.0 ", "")
    .replace("PLAN", "")
    .trim();
  const basePlan = PLAN_ALIASES[normalizedStatus] || normalizedStatus;
  const features = { ...(PLAN_FEATURES[basePlan] || PLAN_FEATURES.TRIAL) };

  // Apply Add-ons
  if (addons.includes("extraAi_100")) {
    features.maxAiChats = (features.maxAiChats === -1) ? -1 : (features.maxAiChats || 0) + 100;
  }
  if (addons.includes("posyandu")) features.posyandu = true;
  if (addons.includes("ePemilu")) features.ePemilu = true;
  if (addons.includes("bankSampah")) features.bankSampah = true;
  if (addons.includes("eLapakFull")) features.eLapak = "FULL";
  if (addons.includes("booking")) features.booking = true;
  if (addons.includes("warga_100")) features.maxWarga = (features.maxWarga || 0) + 100;
  if (addons.includes("warga_500")) features.maxWarga = (features.maxWarga || 0) + 500;
  if (addons.includes("modulSos")) features.sos = true;
  if (addons.includes("bukuTamu")) features.bukuTamu = true;
  if (addons.includes("inventaris")) features.inventaris = true;
  if (addons.includes("aiAgent")) features.ai = true;
  if (addons.includes("grupChat")) features.chatMode = true;
  if (addons.includes("complaint")) features.complaint = true;

  return features;
};

export const getTenantId = (currentUser: any, currentTenant?: any): string => {
  const tId = currentUser?.tenantId || currentTenant?.id;
  if (!tId) {
    throw new Error("CRITICAL: Tenant ID could not be determined. Access denied.");
  }
  return tId;
};

export const getLapakName = (tenant?: any) => {
  return tenant?.nama_lapak || "Lapak Warga";
};

export const getBankSampahName = (tenant?: any) => {
  return tenant?.nama_bank_sampah || "Bank Sampah";
};

export const getEPemiluName = (tenant?: any) => {
  return tenant?.nama_epemilu || "e-Pemilu";
};

export const getKesehatanName = (tenant?: any) => {
  return tenant?.nama_kesehatan || "Kesehatan";
};

// URL Shortener Utility
export const shortenUrl = async (longUrl: string): Promise<string> => {
  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ long_url: longUrl })
    });
    const data = await response.json();
    if (data.success && data.short_url) {
      return data.short_url;
    }
    console.warn("URL Shortener Warning:", data.error || "Unknown error");
    return longUrl; // Fallback to long URL on failure
  } catch (error) {
    console.error("URL Shortener Error:", error);
    return longUrl; // Fallback to long URL on failure
  }
};

// Shared Helper for Document Generation
export const generateSuratHTML = (surat: any, kop: any, settings: any, isDownload?: boolean) => {
  const displayRT = surat.rt || kop.rt || "...";
  const displayRW = kop.rw || "...";
  const tenantName = kop.nama_rt || kop.nama_organisasi || settings?.nama_rt || settings?.namaLayout || "SmaRtRw AI";
  const tagline = kop.tagline || settings?.tagline || "Rukun Tetangga, Saling Berbagi dan Bergotong Royong";

  const defaultLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_Kabupaten_Bekasi.png/1200px-Logo_Kabupaten_Bekasi.png";
  const logoPemerintah = kop.logo_url && kop.logo_url.length > 10 ? kop.logo_url : defaultLogoUrl;
  const logoOrganisasi = kop.logo_rw_url && kop.logo_rw_url.length > 10 ? kop.logo_rw_url : "/logosmartrwai.png"; 

  const orgName = `RUKUN TETANGGA ${displayRT} / RUKUN WARGA ${displayRW}`;
  
  const kelurahanText = kop.kelurahan && kop.kecamatan && kop.kelurahan !== "..."
    ? `KELURAHAN ${kop.kelurahan.toUpperCase()} - KECAMATAN ${kop.kecamatan.toUpperCase()}`
    : "KELURAHAN KEBALEN - KECAMATAN BABELAN";
    
  const kabupaten = kop.kabupaten || settings?.kabupaten || "KABUPATEN BEKASI";
  const displayKabupaten = kabupaten.toUpperCase().includes('KABUPATEN') || kabupaten.toUpperCase().includes('KOTA') 
    ? kabupaten.toUpperCase() 
    : (kabupaten !== "..." ? `KABUPATEN ${kabupaten.toUpperCase()}` : "KABUPATEN BEKASI");

  const alamatText = kop.alamat && kop.alamat !== "..."
    ? `Sekretariat : ${kop.alamat} ${kop.email ? ' | Email: ' + kop.email : ''} ${kop.instagram ? ' | Instagram: ' + kop.instagram : ''}`
    : "Sekretariat : Jl.Katalia 3 Blok K3 No.1 RT02 / RW26 | Email: kebalenrw26@gmail.com | Instagram: @kebalen26";

  const cleanKecamatan = (kop?.kecamatan || '...').toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
  const cleanKelurahan = (kop?.kelurahan || '...').toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
  const cleanKabupaten = (kop?.kabupaten || 'Bekasi').toLowerCase().replace(/\b\w/g, (s: string) => s.toUpperCase());
  const showKab = cleanKabupaten.includes('kabupaten') || cleanKabupaten.includes('kota') ? '' : 'Kabupaten ';

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${tenantName} - ${tagline} - Cetak Surat - ${surat.nomor_surat || surat.id}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
          body { 
            font-family: 'Times New Roman', Times, serif; 
            background: #fff;
            margin: 0; 
            padding: 0; 
          }
          .print-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            padding: 15mm;
            box-sizing: border-box;
            position: relative;
            font-size: 14px;
            color: #000;
          }
          @media print {
            body { background: white; }
            .print-container { padding: 15mm !important; margin: 0; width: 100%; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-container" id="print-container-root" style="print-color-adjust: exact; -webkit-print-color-adjust: exact;">
          <!-- Background Watermark/Logo -->
          ${kop.bg_kertas_url ? `
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0;">
              <img src="${kop.bg_kertas_url}" style="width: 100mm; height: 100mm; object-fit: contain; ${kop.bg_kertas_url.startsWith('data:') ? '' : 'filter: grayscale(100%); opacity: 0.20;'} border: none; display: block;" />
            </div>
          ` : ''}
          
          <div style="position: relative; z-index: 1;">
            <!-- Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 10; width: 100%;">
              <div style="width: 90px; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-start;">
                ${surat.show_logo !== 'no' && logoPemerintah ? `<img src="${logoPemerintah}" alt="Logo" class="w-[85px] h-[85px] object-contain" />` : ''}
              </div>
              <div style="flex-grow: 1; text-align: center; padding: 0 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 0;">
                <h2 style="font-family: 'Arial', sans-serif; font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; white-space: nowrap; letter-spacing: 0.3px;">${orgName}</h2>
                <p style="font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; margin: 1px 0 0 0; white-space: nowrap;">${kelurahanText}</p>
                <p style="font-family: 'Arial', sans-serif; font-size: 16px; font-weight: bold; margin: 1px 0 0 0; white-space: nowrap;">${displayKabupaten}</p>
                <p style="font-family: 'Arial', sans-serif; font-size: 8.5px; margin: 3px 0 0 0; white-space: nowrap; word-spacing: 0.5px;">${alamatText}</p>
              </div>
              <div style="width: 100px; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-end;">
                ${surat.show_logo !== 'no' && logoOrganisasi ? `<img src="${logoOrganisasi}" alt="Logo RW" class="w-[95px] h-[90px] object-contain" />` : ''}
              </div>
            </div>
            
            <div class="border-b-4 border-black mt-2"></div>
            <div class="border-b-2 border-black mt-0.5"></div>

            <!-- Title -->
            <div class="text-center mt-6">
              <h3 class="text-lg font-bold underline uppercase">${surat.jenis || surat.jenisSurat || 'SURAT PENGANTAR'}</h3>
              <p>Nomor : ${surat.nomorSurat || surat.nomor_surat || '...... / RT .... / RW .... / Tahun 202...'}</p>
            </div>
            
            <!-- Body -->
            <div class="mt-6 leading-relaxed">
              <p class="mb-4">Yang bertanda tangan di bawah ini Ketua RT ${displayRT} / RW ${displayRW} Kelurahan ${cleanKelurahan} Kecamatan ${cleanKecamatan} ${showKab}${cleanKabupaten}</p>
              <p class="mb-4">Dengan ini menerangkan bahwa :</p>
              <div class="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                <div>Nama</div><div>:</div><div><strong>${surat.pemohon || '...'}</strong></div>
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

            <!-- Signatures -->
            <div class="mt-12 flex justify-between">
              <div class="text-center">
                <p>Mengetahui,</p>
                <p>Ketua RW ${displayRW}</p>
                <div class="h-20 flex items-center justify-center relative my-1">
                  ${kop.signature_rw_url ? `<img src="${kop.signature_rw_url}" alt="TTD RW" class="absolute h-20 w-40 object-contain pointer-events-none" />` : ''}
                </div>
                <p class="font-bold underline">( ${surat.ketua_rw_nama || kop.nama_ketua_rw || '...................................'} )</p>
              </div>
              <div class="text-center">
                <p>${cleanKabupaten}, ${new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                <p>${surat.jabatan_ttd || 'Ketua RT'} ${displayRT}</p>
                <div class="h-20 flex items-center justify-center relative my-1">
                  ${kop.signature_rt_url ? `<img src="${kop.signature_rt_url}" alt="TTD RT" class="absolute h-20 w-40 object-contain pointer-events-none" />` : ''}
                </div>
                <p class="font-bold underline">( ${surat.ketua || kop.nama_ketua_rt || '...................................'} )</p>
              </div>
            </div>
            
            <!-- Footer Grid Boxes -->
            <div class="mt-12 border-t border-black pt-2 text-[10px] text-gray-800">
              <div class="font-mono">
                <div class="grid grid-cols-3 gap-2 w-full">
                  <div class="flex flex-col">
                    <span>TL. Berkas / Surat No :</span>
                    <span class="mt-1">Berkas Sesuai</span>
                    <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                  </div>
                  <div class="flex flex-col">
                    <span>Hal:</span>
                    <span class="mt-1">Berkas Kecamatan</span>
                    <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                  </div>
                  <div class="flex flex-col">
                    <span>Tgl :&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-</span>
                    <span className="mt-1">Paraf Arsiparis</span>
                    <div class="w-20 h-6 border border-black mt-1 bg-white"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Note -->
            <div class="mt-12 text-center text-[10px] font-semibold italic text-slate-800">
              ${kop.catatan || 'Catatan : Fotocopy Surat Pengantar A4 3 Lembar'}
            </div>
          </div>
        </div>
        ${isDownload ? '' : `
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
        `}
      </body>
    </html>
  `;
};

export const toBase64 = async (url: any, isWatermark: boolean = false): Promise<string> => {
  const transparentSpacer = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  if (!url || typeof url !== 'string' || url.trim() === '') return transparentSpacer;
  
  let base64Result = transparentSpacer;
  if (url.startsWith('data:')) {
    base64Result = url;
  } else {
    let targetUrl = url;
    if (url.startsWith('/')) {
      targetUrl = window.location.origin + url;
    }
    
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Fetch status error');
      const blob = await response.blob();
      base64Result = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string || transparentSpacer);
        reader.onerror = () => resolve(transparentSpacer);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn(`Failed to convert image to base64, using fallback: ${url}`, err);
      return url; // return original URL as fallback so browser/html2canvas can render it
    }
  }

  if (isWatermark && base64Result !== transparentSpacer) {
    try {
      const preprocessed = await new Promise<string>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(base64Result);
            return;
          }
          ctx.drawImage(img, 0, 0);
          try {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i+1];
              const b = data[i+2];
              // Grayscale conversion
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              data[i] = gray;
              data[i+1] = gray;
              data[i+2] = gray;
              // Reduce watermark opacity to 0.20
              data[i+3] = data[i+3] * 0.20;
            }
            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL());
          } catch (e) {
            console.warn("Canvas ImageData processing error:", e);
            resolve(base64Result);
          }
        };
        img.onerror = () => resolve(base64Result);
        img.src = base64Result;
      });
      return preprocessed;
    } catch (err) {
      console.warn("Watermark preprocessing error:", err);
      return base64Result;
    }
  }

  return base64Result;
};

export const prepareBase64Kop = async (kop: any): Promise<any> => {
  const defaultLogoUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_Kabupaten_Bekasi.png/1200px-Logo_Kabupaten_Bekasi.png";
  const rawLogoPemerintah = (kop.logo_url && kop.logo_url.length > 10) ? kop.logo_url : defaultLogoUrl;
  const rawLogoOrganisasi = (kop.logo_rw_url && kop.logo_rw_url.length > 10) ? kop.logo_rw_url : "/logosmartrwai.png"; 

  const [logoPemerintah, logoOrganisasi, signatureRw, signatureRt, bgKertas] = await Promise.all([
    toBase64(rawLogoPemerintah),
    toBase64(rawLogoOrganisasi),
    kop.signature_rw_url ? toBase64(kop.signature_rw_url) : Promise.resolve(''),
    kop.signature_rt_url ? toBase64(kop.signature_rt_url) : Promise.resolve(''),
    kop.bg_kertas_url ? toBase64(kop.bg_kertas_url, true) : Promise.resolve('') // watermark is TRUE!
  ]);

  return {
    ...kop,
    logo_url: logoPemerintah,
    logo_rw_url: logoOrganisasi,
    signature_rw_url: signatureRw,
    signature_rt_url: signatureRt,
    bg_kertas_url: bgKertas
  };
};
