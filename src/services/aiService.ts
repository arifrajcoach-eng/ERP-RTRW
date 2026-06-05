export function isQuotaExhaustedError(error: any): boolean {
  if (!error) return false;
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error) + " " + (error.message || "");
  return (
    errorStr.includes("429") ||
    errorStr.includes("RESOURCE_EXHAUSTED") ||
    errorStr.includes("Quota exceeded") ||
    errorStr.includes("quota") ||
    errorStr.includes("limit") ||
    errorStr.includes("exceeded your current quota") ||
    errorStr.includes("QUOTA_EXHAUSTED")
  );
}

export async function* createFallbackStream(messageText: string) {
  const words = messageText.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 30));
    yield { text: words[i] + (i === words.length - 1 ? "" : " ") };
  }
}

export async function* chatWithAI(params: {
  isPrivileged: boolean;
  message: string;
  role: string;
  dataSummary: any;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
}) {
  try {
    const response = await fetch("/api/ai/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Pernyataan streaming tidak didukung oleh browser ini.");
    }

    const decoder = new TextDecoder();
    let rBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      rBuffer += decoder.decode(value, { stream: true });
      const lines = rBuffer.split("\n");
      rBuffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const content = line.substring(6).trim();
          if (content === "[DONE]") continue;
          try {
            const parsed = JSON.parse(content);
            if (parsed.text) {
              yield { text: parsed.text };
            }
          } catch (e) {
            // Ignore malformed JSON chunks
          }
        }
      }
    }
  } catch (error: any) {
    console.error("Client AI Stream error:", error);
    if (isQuotaExhaustedError(error)) {
      const fallbackText = params.isPrivileged
        ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmaRtRw AI" di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
        : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmaRtRw AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
      yield* createFallbackStream(fallbackText);
    } else {
      throw error;
    }
  }
}

export async function generateAIReport(dataSummary: any) {
  try {
    const response = await fetch("/api/ai/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataSummary })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${response.status}`);
    }
    const result = await response.json();
    return result.text || "";
  } catch (error: any) {
    console.error("Client report generating error:", error);
    
    // Self-healing: if quota exceeded OR network is offline / Failed to fetch, return elegant preview report instead of completely failing
    const isQuota = isQuotaExhaustedError(error);
    const errorMsg = isQuota 
      ? "Layanan AI kami untuk membuat laporan saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted)."
      : "Layanan AI kami terkendala jaringan sementara (Failed to fetch). Tenang saja, kami mengaktifkan Laporan Mandiri Mode Offline untuk Anda!";

    return `### Laporan Bulanan SmaRtRw AI (Offline Mode)
      
Aduh Kakak sayang, mohon maaf banget yaa! 🫣 ${errorMsg}

Tapi tenang aja, Kak! Ini adalah ringkasan data mandiri dari data yang ada di sistem kami:
- **Jumlah Data Keuangan**: ${dataSummary?.financial?.length || 0} transaksi tercatat.
- **Jumlah Warga Terdaftar**: ${dataSummary?.warga || 0} warga aktif.
- **Jumlah Data Iuran**: ${dataSummary?.iuran?.length || 0} rekaman iuran.
${dataSummary?.kesehatan ? `- **Data Kelahiran**: ${dataSummary.kesehatan.kelahiranCount || 0} bayi terpantau.\n- **Data Kematian**: ${dataSummary.kesehatan.kematianCount || 0} warga meninggal.` : ''}
${dataSummary?.kegiatan ? `- **Pengajuan Surat**: ${dataSummary.kegiatan.suratCount || 0} berkas.\n- **Laporan Keluhan**: ${dataSummary.kegiatan.complaintsCount || 0} aduan warga.` : ''}

**✨ PANDUAN & SOLUSI PREMIUM :**
Supaya Kakak dan seluruh pengurus RT/RW bisa memanfaatkan fitur Laporan AI Otomatis, Prediksi Keuangan, secara penuh tanpa batas bebas limitasi kuota harian, silakan klik banner **"SmaRtRw AI"** di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium sekarang juga! 😉⚡`;
  }
}

export async function generateRegionalInsight(regionsData: any) {
  try {
    const response = await fetch("/api/ai/regional-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regionsData })
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${response.status}`);
    }
    const result = await response.json();
    return result.text || "";
  } catch (error: any) {
    console.error("Client regional insight generating error:", error);
    
    // Self-healing fallback for regional analyses
    const isQuota = isQuotaExhaustedError(error);
    const errorMsg = isQuota
      ? "Kuota panggilan AI harian untuk analisis wilayah saat ini sedang mencapai batas limit (Error 429: Resource Exhausted)."
      : "Layanan AI untuk analisis wilayah terkendala jaringan sementara (Failed to fetch). Menampilkan Mode Offline ringkasan data!";

    return `### Analisis Regional SmaRtRw AI (Offline Mode)
      
Mohon maaf sebesar-besarnya Bapak/Ibu Pimpinan Kelurahan. 🫣 ${errorMsg}

Berikut data ringkasan wilayah yang terpantau:
- **Jumlah RW/RT Terdaftar**: ${regionsData?.length || 0} wilayah dalam pemantauan.

**✨ AKTIVASI PREMIUM :**
Untuk tetap dapat mengakses analisis data mendalam antar RW, visualisasi data, rekomendasi taktis, serta integrasi pemantauan penuh bebas dari limit harian, silakan klik banner **"SmaRtRw AI"** di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium wilayah Rukun Tetangga/Warga Anda! 😉⚡`;
  }
}

export async function scanReceiptAI(base64: string, mimeType: string = "image/jpeg") {
  try {
    const response = await fetch("/api/ai/scan-receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64, mimeType })
    });
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("QUOTA_EXHAUSTED");
      }
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Server error: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Client Scan Receipt Error:", error);
    if (isQuotaExhaustedError(error) || error.message === "QUOTA_EXHAUSTED") {
      throw new Error(`Aduh maaf Kak! Kuota harian AI SmaRtRw untuk memindai struk saat ini sedang penuh (Error 429: Resource Exhausted). 

Silakan isi rincian transaksi keuangan secara manual dahulu yaa, atau klik banner "SmaRtRw AI" di Dashboard utama / hubungi WhatsApp Admin SmaRtRw AI (0877-2674-1143) untuk melakukan Aktivasi Premium agar bebas memindai struk tanpa batas kuota!`);
    }
    throw error;
  }
}

// AI Voice (TTS)
export async function textToSpeech(text: string, isChairman: boolean = false) {
  try {
    const response = await fetch("/api/ai/text-to-speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, isChairman })
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("Client TTS Generation Error:", error);
    return null;
  }
}
