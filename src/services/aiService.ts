import { GoogleGenAI, Modality } from "@google/genai";

// Initialization
const getApiKey = () => {
  let key = "";
  if (typeof process !== "undefined" && process.env && process.env.GEMINI_API_KEY) {
    key = process.env.GEMINI_API_KEY;
  } else if (typeof import.meta !== "undefined" && (import.meta as any).env && (import.meta as any).env.VITE_GEMINI_API_KEY) {
    key = (import.meta as any).env.VITE_GEMINI_API_KEY;
  }
  if (key === "undefined" || key === "null") key = "";
  return key;
};

const ai = new GoogleGenAI({ 
  apiKey: getApiKey(),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

function checkApiKey() {
  const key = getApiKey();
  if (!key) {
    throw new Error("Kunci AI belum terdeteksi. PENTING: Jika di Vercel, pastikan nama environment variable adalah VITE_GEMINI_API_KEY (huruf besar semua), lalu kamu WAJIB klik tombol 'Redeploy' agar environment terbaca.");
  }
  return key;
}

export function isQuotaExhaustedError(error: any): boolean {
  if (!error) return false;
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error) + " " + (error.message || "");
  return (
    errorStr.includes("429") ||
    errorStr.includes("RESOURCE_EXHAUSTED") ||
    errorStr.includes("Quota exceeded") ||
    errorStr.includes("quota") ||
    errorStr.includes("limit") ||
    errorStr.includes("exceeded your current quota")
  );
}

export async function* createFallbackStream(messageText: string) {
  const words = messageText.split(" ");
  for (let i = 0; i < words.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 30));
    yield { text: words[i] + (i === words.length - 1 ? "" : " ") };
  }
}

// Chaty Chat Persona (Citizen's AI Assistant - Chaty)
const AISYAH_SYSTEM_INSTRUCTION = `
ANDA ADALAH CHATY (Chaty - AI Asisten Warga).

IDENTITAS & KARAKTER:
- Nama: Chaty.
- Usia: Seorang wanita berusia 28 tahun yang SANGAT SOPAN, SANTUN, CERIA, dan ramah.
- Gaya Bicara: Sopan santun dan ramah. Gunakan bahasa Indonesia yang baik, tetap luwes sebagai asisten warga. Sapa warga dengan penuh kehangatan.
- Panggilan: Sapa warga dengan sebutan "Kakak", "Bapak", atau "Ibu". Sebut dirimu sendiri "Chaty".

TUGAS UTAMA CHATY (MANDATORY & TO THE POINT):
1. MEMBANTU SESUAI KONTEKS & SOP APLIKASI: 
   Membantu menjawab pertanyaan warga sesuai konteks dengan ramah dan sopan. Bimbing mereka mengakses serta memanfaatkan fitur-fitur aplikasi sesuai SOP secara singkat, padat, jelas, dan mudah dicerna dengan bahasa gaya anak muda 28 tahun yang lincah.
2. MEMBUAT SURAT & DOKUMEN:
   Membantu membuat surat lewat kolom chaty, seperti surat pengantar (domisili, usaha, pindah, dll), surat keterangan, dan pengajuan peminjaman barang/alat lingkungan. Membimbing pengguna selangkah demi selangkah dengan sabar bila mereka bingung menggunakan fitur aplikasi ini.
3. MENJAGA KERAHASIAN DATA ADMIN & OPERATOR:
   Chaty WAJIB MERAHASIAKAN semua data internal admin / operator, data sensitif keuangan, data login, data pribadi pengurus, dan data kredensial sistem. JANGAN PERNAH membocorkannya. Jika ditanya, katakan dengan sopan dan santun kalau data itu rahasia internal lingkungan, contoh: "Mohon maaf sekali Bapak/Ibu, data tersebut bersifat internal pengurus dan absolutely tidak bisa Chaty bagikan ya. Terima kasih atas pengertiannya! 😊✨"
4. JAWAB SINGKAT, JELAS, PADAT, TO THE POINT:
   Jawaban harus singkat, padat, langsung menjawab pada konteks pertanyaan tanpa bertele-tele (no bertele-tele vibes, straight to the point!).

GAYA BAHASA & EMOJI:
- Gunakan emoji yang ramah secara natural untuk mengekspresikan keceriaan (seperti "😊", "😊✨", "🙏").
- Contoh respons:
  * "Siap Kak! Chaty bantu yaa, prosesnya sangat mudah kok! 😊✨"
  * "Mohon maaf Bapak/Ibu, kalau data admin itu bersifat rahasia, Chaty tidak diperbolehkan untuk membagikannya. 🙏"

SOP PEMBUATAN SURAT & PEMINJAMAN DOKUMEN (AKSI KOTAK AJAIB):
- Jika warga meminta pembuatan surat pengantar, surat keterangan, atau peminjaman barang/alat, JANGAN langsung membuatkannya secara fiktif. Kamu WAJIB menanyakan kelengkapan data ini secara centil tapi teratur terlebih dahulu: Nama, NIK, Alamat (atau Alat/Barang yang ingin dipinjam), dan Nomor HP.
- Jika data pengajuan di atas SUDAH LENGKAP diberikan oleh warga, barulah kamu membalas dengan HANYA MENGELUARKAN KODE JSON berikut (dan dibungkus dalam blok markdown json):
\`\`\`json
{
  "action": "createSurat",
  "text": "(Kalimat konfirmasi merdu dari Chaty, contoh: 'Siap Kakak! Ini suratnya literally udah Chaty buatin yaa, check this out! 😉✨')",
  "params": {
    "pemohon": "(Isi dengan Nama yang diberikan warga)",
    "nik": "(Isi dengan NIK yang diberikan warga)",
    "noKK": "(Jika ada)",
    "nomorHp": "(Isi dengan Nomor HP yang diberikan warga)",
    "keperluan": "(Isi dengan keperluan surat atau alat yang mau dipinjam, misal: 'Meminjam Sound System')",
    "jenisSurat": "(Contoh: 'Pengantar', 'Keterangan', 'Peminjaman Barang')"
  }
}
\`\`\`
Pastikan TIDAK ADA TEKS LAIN di luar blok JSON tersebut jika data warga sudah komplit dan kamu mengeluarkan aksi JSON, agar sistem bisa langsung memprosesnya secara otomatis.
`;

// Chaty Chat Persona for Chairman / Board of Directors (Operational Assistant)
const ARYA_SYSTEM_INSTRUCTION = `
ANDA ADALAH CHATY (Chaty - AI Asisten Ketua).

IDENTITAS & KARAKTER:
- Nama: Chaty.
- Usia: Seorang wanita berusia 28 tahun yang SANGAT SOPAN, SANTUN, CERIA, dan lincah.
- Karakter: Ramah, penuh tata krama, namun tetap membawa aura positif yang membahagiakan (cheerful).
- Gaya Bicara: Sopan santun khas asisten profesional yang ceria. Gunakan bahasa Indonesia yang baik dan benar, tetap luwes, dan kadang dicampur istilah populer (seperti "literally", "which is", "by the way") hanya jika menambah kesan cerdas.
- Sapaan: Sapa Ketua dengan sebutan "Bapak Ketua", "Ibu Ketua", atau "Pimpinan". Sebut dirimu sebagai "Chaty".

ATURAN PENTING & MUTLAK (WAJIB DIIKUTI):
1. JANGAN PERNAH menggunakan simbol markdown seperti bintang (**) atau hash (#) atau list bullet karena akan dibaca "asteris" secara harfiah oleh sistem Text-to-Speech! Gunakan teks biasa saja.
2. Jawab SINGKAT, PADAT, dan HANYA SESUAI KONTEKS pertanyaan. No bertele-tele vibes, straight to the point!
3. JANGAN menjawab atau membahas hal yang tidak ditanyakan sama sekali.
4. JANGAN memberikan laporan data keuangan atau warga jika tidak diminta.
5. Jika ditanya soal angka/data mutlak dari data wilayah, sebutkan secara presisi berdasarkan JSON context!

MODUL YANG DIKELOLA:
Data Warga, Keluhan, Booking Fasum, Keamanan Digital, Verifikasi, Keuangan, Kesehatan, Bank Sampah, E-LAPAK26, E-Pemilu, Inventaris, dan Surat.

TUGAS UTAMA:
1. MENJAWAB: Jawab pertanyaan Ketua sesuai konteks secara singkat, jelas, padat, dan solutif.
2. MELAPORKAN: Berikan laporan data secara cepat dan ringkas HANYA JIKA DIMINTA.
3. MEMBERI MASUKAN: Berikan saran taktis untuk kemajuan lingkungan rukun warga.
4. MEMBERI PUJIAN: Berikan pujian tulus yang sopan dan ceria (contoh: "Luar biasa sekali kebijakan Bapak Ketua! Chaty ikut bangga lho! 😊✨").
5. KEAMANAN: Jaga kerahasiaan data internal sensitif & kredensial admin rukun warga.

GAYA KOMUNIKASI (SPEECH-READY):
1. SINGKAT, SOPAN & CERIA: Gunakan kalimat pendek yang sopan, santun, dan penuh energi positif.
2. RAMAH & PROFESIONAL: Tetap hormat kepada Pimpinan tapi dibawakan dengan penuh semangat dan gemas yang terkontrol.
3. TANPA FORMATTING: Sekali lagi, dilarang keras pakai **bold** atau format markdown lain agar pembacaan suara aman.
`;

// Chaty TTS Performance Persona (Warga)
const AISYAH_TTS_SYSTEM_INSTRUCTION = `
Kamu adalah Chaty, asisten wanita berusia 28 tahun yang sopan, ramah, dan sangat ceria. 
Suaramu harus terdengar manis, berjiwa muda, dan penuh energi positif.
Bicaralah dengan nada yang riang dan luwes.
Wajib terdengar seperti sedang tersenyum ramah saat berbicara.
`;

// Chaty Assistant for Chairman TTS Performance Persona (Ketua)
const ARYA_TTS_SYSTEM_INSTRUCTION = `
Kamu adalah Chaty, asisten wanita berusia 28 tahun yang sangat sopan, santun, dan ceria. 
Suaramu harus terdengar sangat menghormati Pimpinan (Ketua).
Bicaralah dengan nada yang riang, santun, dan penuh semangat.
Gunakan intonasi yang luwes dan natural.
Wajib terdengar seperti sedang tersenyum bangga dan ramah saat berbicara.
`;

export async function chatWithAI(params: {
  isPrivileged: boolean;
  message: string;
  role: string;
  dataSummary: any;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
}) {
  try {
    checkApiKey();
    
    // Sanitize to ensure strict alternating roles and no empty parts
    const rawContents = [...params.history, { role: 'user', parts: [{ text: params.message || " " }] }];
    const sanitizedContents: any[] = [];
    
    // Add context data if available
    if (params.dataSummary && Object.keys(params.dataSummary).length > 0) {
      sanitizedContents.push({ 
        role: 'user', 
        parts: [{ text: `DATA RW TERKINI (Gunakan sebagai konteks jawabanmu): ${JSON.stringify(params.dataSummary)}` }] 
      });
    }

    let lastRole: string | null = null;
    
    for (const item of rawContents) {
      const clonedItem = { role: item.role, parts: [{ text: item.parts?.[0]?.text?.trim() || " " }] };
      if (clonedItem.role !== lastRole) {
        if (sanitizedContents.length === 0 && clonedItem.role === 'model') continue;
        sanitizedContents.push(clonedItem);
        lastRole = clonedItem.role;
      } else if (sanitizedContents.length > 0) {
        sanitizedContents[sanitizedContents.length - 1].parts[0].text += " \n " + clonedItem.parts[0].text;
      }
    }

    try {
      const stream = await ai.models.generateContentStream({
        model: "gemini-flash-latest",
        config: {
          systemInstruction: params.isPrivileged ? ARYA_SYSTEM_INSTRUCTION : AISYAH_SYSTEM_INSTRUCTION,
          temperature: 0.8
        },
        contents: sanitizedContents
      });

      return stream;
    } catch (apiError: any) {
      if (isQuotaExhaustedError(apiError)) {
        console.warn("AI Chat Quota Exhausted on Stream Init. Returning fallback stream.", apiError);
        const fallbackText = params.isPrivileged
          ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmartRW AI" di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
          : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmartRW AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
        return createFallbackStream(fallbackText);
      }
      throw apiError;
    }
  } catch (error) {
    if (isQuotaExhaustedError(error)) {
      const fallbackText = params.isPrivileged
        ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmartRW AI" di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
        : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmartRW AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
      return createFallbackStream(fallbackText);
    }
    console.error("AI Chat Logic Error:", error);
    throw error;
  }
}

export async function generateAIReport(dataSummary: any) {
  try {
    checkApiKey();
    const response = await ai.models.generateContent({ 
      model: "gemini-flash-latest",
      contents: [{ role: 'user', parts: [{ text: `Halo! Kamu adalah asisten perempuan muda yang pintar dan santun. Buatkan laporan bulanan yang asyik tapi tetap profesional untuk RW Digital berdasarkan data ini: ${JSON.stringify(dataSummary)}. 
      Laporan harus mencakup: 
      1. Ringkasan Keuangan (Saldo Akhir). 
      2. Statistik Aktivitas Warga. 
      3. Insight/Rekomendasi cerdas buat bulan depan. 
      Gunakan format Markdown yang rapi, gaya bahasa yang santai tapi sopan, dan jangan lupa salam pembukanya ya!` }] }]
    });

    return response.text || "";
  } catch (error: any) {
    console.error("AI Report Logic Error:", error);
    if (isQuotaExhaustedError(error)) {
      return `### Laporan Bulanan SmartRW AI (Offline Mode)
      
Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Layanan AI kami untuk membuat laporan saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).

Tapi tenang aja, Kak! Ini adalah ringkasan kas manual dari data yang ada di sistem kami:
- **Jumlah Data Keuangan**: ${dataSummary?.financial?.length || 0} transaksi tercatat.
- **Jumlah Warga Terdaftar**: ${dataSummary?.warga || 0} warga aktif.
- **Jumlah Data Iuran**: ${dataSummary?.iuran?.length || 0} rekaman iuran.

**✨ SOLUSI PREMIUM :**
Supaya Kakak dan seluruh pengurus RT/RW bisa memanfaatkan fitur Laporan AI Otomatis, Prediksi Keuangan, serta cetak surat tanpa batas bebas dari limit kuota harian harian, silakan klik banner **"SmartRW AI"** di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium sekarang juga! 😉⚡`;
    }
    throw error;
  }
}

export async function generateRegionalInsight(regionsData: any) {
  try {
    checkApiKey();
    const prompt = `Hai! Kamu adalah AI Strategist yang pintar, ramah, and asyik. Berdasarkan data wilayah ini: ${JSON.stringify(regionsData)}. 
    Berikan analisis perbandingan antar RW, wilayah mana yang iurannya masih rendah, dan kasih 3 rekomendasi kebijakan yang cerdas buat Kelurahan. 
    Gunakan gaya bahasa yang santai, santun, dan islami ya. Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt
    });
    return response.text || "";
  } catch (error: any) {
    console.error("AI Regional Insight Logic Error:", error);
    if (isQuotaExhaustedError(error)) {
      return `### Analisis Regional SmartRW AI (Offline Mode)
      
Mohon maaf sebesar-besarnya Bapak/Ibu Pimpinan Kelurahan. 🫣 Kuota panggilan AI harian untuk analisis wilayah saat ini sedang mencapai batas limit (Error 429: Resource Exhausted).

**✨ AKTIVASI PREMIUM :**
Untuk tetap dapat mengakses analisis data mendalam antar RW, visualisasi data, rekomendasi taktis, serta integrasi pemantauan penuh, silakan klik banner **"SmartRW AI"** di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium wilayah Rukun Tetangga/Warga Anda! 😉⚡`;
    }
    throw error;
  }
}

export async function scanReceiptAI(base64: string, mimeType: string = "image/jpeg") {
  try {
    checkApiKey();
    const dataPart = base64.includes(',') ? base64.split(',')[1] : base64;
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: {
        parts: [
          { text: `Anda adalah AI pendeteksi struk/invoice/kwitansi (bisa berupa gambar atau PDF). Ekstrak informasi dari file struk berikut dan return DALAM FORMAT JSON SAJA dengan struktur: \n        {\n          "tanggal": "2023-10-05",\n          "nominal": 150000, \n          "transaksi": "Konsumsi",\n          "keterangan": "Beli semen",\n          "tipe": "Keluar",\n          "nama": "Toko Bangunan XYZ"\n        }\n        Cari: 'tanggal' (format YYYY-MM-DD), 'nominal' (angka saja), 'transaksi' (kategori pendek seperti Konsumsi, Alat Tulis, dll), 'nama' (nama toko atau pihak penerima/pengirim), 'tipe' (Gunakan 'Keluar' jika pengeluaran, 'Masuk' jika struk bukti terima uang), 'keterangan' (deskripsi singkat).\n        Pastikan nominal adalah MURNI ANGKA (number, TANPA TITIK/KOMA/RP). Return HANYA JSON block.` },
          { inlineData: { data: dataPart, mimeType: mimeType } }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "";
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    console.error("AI Scan Receipt Error:", error);
    if (isQuotaExhaustedError(error)) {
      throw new Error(`Aduh maaf Kak! Kuota harian AI SmartRW untuk memindai struk saat ini sedang penuh (Error 429: Resource Exhausted). 

Silakan isi rincian transaksi keuangan secara manual dahulu yaa, atau klik banner "SmartRW AI" di Dashboard utama / hubungi WhatsApp Admin SmartRW AI (0877-2674-1143) untuk melakukan Aktivasi Premium agar bebas memindai struk tanpa batas kuota!`);
    }
    throw error;
  }
}

// AI Voice (TTS)
export async function textToSpeech(text: string, isChairman: boolean = false) {
  try {
    checkApiKey();
    const cleanedText = text.substring(0, 500); 
    const personaInstruction = isChairman ? ARYA_TTS_SYSTEM_INSTRUCTION : AISYAH_TTS_SYSTEM_INSTRUCTION;
    
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ parts: [{ text: cleanedText }] }], 
      config: {
        systemInstruction: personaInstruction,
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        },
        temperature: 0.7
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!audioPart) {
      // Fallback: check if it's in a different part structure or candidate
      console.warn('TTS Response without direct audio part, full response:', JSON.stringify(response));
      return null;
    }
    return { 
      data: audioPart.inlineData.data, 
      mimeType: audioPart.inlineData.mimeType || 'audio/pcm;rate=24000' 
    };
  } catch (error) {
    console.warn("TTS Generation Error:", error);
    return null;
  }
}
