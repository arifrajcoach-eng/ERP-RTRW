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
  if (addons.includes("cctv")) features.cctv = true;
  if (addons.includes("eLapakFull")) features.eLapak = "FULL";
  if (addons.includes("ppob")) features.keuangan = "FULL";
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

// Shared Helper for Document Generation
export const generateSuratHTML = (surat: any, kop: any, settings: any) => {
  const displayRT = surat.rt || kop.rt || "...";
  const displayRW = surat.rw || kop.rw || "...";

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
                    ${surat.show_logo !== "no" && (kop.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_Kabupaten_Bekasi.png/1200px-Logo_Kabupaten_Bekasi.png") ? `<img src="${kop.logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Logo_Kabupaten_Bekasi.png/1200px-Logo_Kabupaten_Bekasi.png"}" alt="Logo" class="w-[90px] h-[90px] object-contain mr-4 ml-4" />` : ""}
                </div>
                <div class="flex-1 text-center px-4 flex flex-col justify-center items-center">
                    <h2 class="font-['Arial'] text-lg font-bold uppercase w-[393.992px] h-[23.9844px]">RUKUN TETANGGA ${displayRT} / RUKUN WARGA ${displayRW}</h2>
                    <p class="font-['Arial'] text-[16px] leading-[24.8571px] font-bold w-[398.875px] h-[23.9792px]">KELURAHAN ${kop.kelurahan?.toUpperCase() || "..."} - KECAMATAN ${kop.kecamatan?.toUpperCase() || "..."}</p>
                    <p class="font-['Arial'] text-[16px] leading-[20px] font-bold">${(kop.kabupaten || settings.kabupaten || "BEKASI").toUpperCase().includes("KABUPATEN") || (kop.kabupaten || settings.kabupaten || "BEKASI").toUpperCase().includes("KOTA") ? "" : "KABUPATEN "}${(kop.kabupaten || settings.kabupaten || "BEKASI").toUpperCase()}</p>
                    <p class="w-[347.242px] h-[23.2461px] text-[8px] leading-[11.14px]">Sekretariat : ${kop.alamat || "..."} | Email: ${kop.email || "..."} | Instagram: ${kop.instagram || "..."}</p>
                </div>
                <div class="flex items-center justify-start w-48">
                    ${surat.show_logo !== "no" && (kop.logo_rw_url || "/logo_rw.png") ? `<img src="${kop.logo_rw_url || "/logo_rw.png"}" alt="Logo RW" class="w-[100px] h-[95px] object-contain ml-4" />` : ""}
                </div>
           </div>
          <div class="border-b-4 border-black mt-2"></div>
          <div class="border-b-2 border-black mt-0.5"></div>
          
          <div class="text-center mt-6">
              <h3 class="text-lg font-bold underline">${surat.jenisSurat || "SURAT PENGANTAR"}</h3>
              <p>Nomor : ${surat.nomor_surat || "...... / RT .... / RW .... / Tahun 202..."}</p>
          </div>
          
          <div class="mt-6 leading-relaxed">
              <p class="mb-4">Yang bertanda tangan di bawah ini Ketua RT ${surat.rt || kop.rt || "..."} / RW ${surat.rw || kop.rw || "..."} Kelurahan ${kop.kelurahan || "..."} Kecamatan ${kop.kecamatan || "..."} ${(kop.kabupaten || settings.kabupaten || "Bekasi")}</p>
              <p class="mb-4">Dengan ini menerangkan bahwa :</p>
              <div class="grid grid-cols-[180px_10px_1fr] gap-2 ml-4">
                 <div>Nama</div><div>:</div><div><strong>${surat.pemohon}</strong></div>
                 <div>Tempat Tgl, Lahir</div><div>:</div><div>${surat.ttl || "-"}</div>
                 <div>Jenis Kelamin</div><div>:</div><div>${surat.jk || "-"}</div>
                 <div>Pekerjaan</div><div>:</div><div>${surat.pekerjaan || "-"}</div>
                 <div>Kewarganegaraan</div><div>:</div><div>${surat.kewarganegaraan || "WNI"}</div>
                 <div>No. KTP/NIK</div><div>:</div><div>${surat.nik || "-"}</div>
                 <div>Status Perkawinan</div><div>:</div><div>${surat.statusKawin || "-"}</div>
                 <div>Alamat</div><div>:</div><div>${surat.alamat || "-"}</div>
                 <div class="mt-2">Maksud / Keperluan</div><div class="mt-2">:</div><div class="mt-2 font-bold">${surat.keperluan || "-"}</div>
              </div>
              <p class="mt-6">Demikian Surat Pengantar ini dibuat dengan sebenar-benarnya dan dapat dipergunakan sebagaimana mestinya.</p>
          </div>

          <div class="mt-12 flex justify-between">
              <div class="text-center ml-12">
                  <p>Mengetahui,</p>
                  <p>Ketua RW ${surat.rw || kop.rw || "...."}</p>
                  <div class="h-20 flex items-center justify-center relative">
                      ${kop.signature_rw_url ? `<img src="${kop.signature_rw_url}" alt="TTD RW" class="absolute h-20 w-full object-contain pointer-events-none" />` : ""}
                  </div>
                  <p class="font-bold underline">( ${surat.ketua_rw_nama || kop.nama_ketua_rw || "..................................."} )</p>
              </div>
              <div class="text-center mr-12">
                  <p>${kop.kabupaten || settings.kabupaten || "Bekasi"}, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p>${surat.jabatan_ttd || "Ketua RT"} ${surat.rt || kop.rt || "...."}</p>
                  <div class="h-20 flex items-center justify-center relative">
                      ${kop.signature_rt_url ? `<img src="${kop.signature_rt_url}" alt="TTD RT" class="absolute h-20 w-full object-contain pointer-events-none" />` : ""}
                  </div>
                  <p class="font-bold underline">( ${surat.ketua || kop.nama_ketua_rt || "..................................."} )</p>
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
