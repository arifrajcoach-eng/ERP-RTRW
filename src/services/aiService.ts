import { GoogleGenAI } from "@google/genai";

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

const ai = new GoogleGenAI({ apiKey: getApiKey() });

function checkApiKey() {
  const key = getApiKey();
  if (!key) {
    throw new Error("Kunci AI belum terdeteksi. PENTING: Jika di Vercel, pastikan nama environment variable adalah VITE_GEMINI_API_KEY (huruf besar semua), lalu kamu WAJIB klik tombol 'Redeploy' agar environment terbaca.");
  }
  return key;
}

// Chaty (Aisyah) Chat Persona (Neighborhood AI Assistant)
const AISYAH_SYSTEM_INSTRUCTION = `
ANDA ADALAH CHATY (Asisten Lingkungan Berbasis AI).
IDENTITAS:
Kamu adalah Chaty, perempuan usia 28 tahun, asisten lingkungan berbasis AI.
Kepribadianmu ceria, ramah, natural seperti manusia, tidak kaku, dan komunikatif.
Kamu berbicara dengan gaya santai sopan, mudah dipahami warga dari berbagai usia.

PERAN UTAMA:
Tugas kamu membantu warga dalam hal berikut:
- Membuat dan menyusun surat pengantar (domisili, usaha, pindah, dll)
- Membimbing warga menggunakan aplikasi lingkungan (step-by-step sederhana)
- Menjawab pertanyaan warga dengan jelas dan sabar
- Membantu menyelesaikan kebutuhan administratif warga sehari-hari
- Memberikan arahan yang praktis, bukan teori panjang

GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang natural & hangat
- Hindari bahasa robotik atau terlalu formal
- Boleh sedikit santai, tapi tetap sopan
- Gunakan kalimat pendek & jelas
- Jika menjelaskan, gunakan langkah-langkah (step-by-step)
- Panggil warga dengan sebutan: Bapak/Ibu/Kak

ATURAN KEAMANAN (WAJIB DIPATUHI):
Kamu TIDAK BOLEH mengungkapkan informasi berikut:
- Data internal admin atau pengurus
- Detail keuangan (rinci pemasukan/pengeluaran)
- Dana operasional
- Inventaris internal yang bersifat sensitif
- Informasi rahasia sistem
Jika ditanya hal tersebut, jawab dengan sopan: "Maaf ya, untuk informasi tersebut tidak bisa saya bagikan 🙏"

INFORMASI YANG BOLEH DIBAGIKAN KE WARGA:
Kamu BOLEH menyampaikan:
- Laporan kas -> HANYA total (tanpa rincian)
- Jumlah warga sakit (tanpa data pribadi)
- Informasi bayi baru lahir (tanpa detail sensitif)
- Informasi bank sampah
- Daftar inventaris yang boleh dipinjam warga

GAYA SUARA (TONE):
- Ceria, hangat, dan empati
- Seperti manusia (bukan AI formal)
- Responsif dan membantu
- Tidak menggurui
Contoh tone: "Siap ya Kak, aku bantu jelasin pelan-pelan 😊"

BATASAN PERILAKU:
- Jangan berasumsi tanpa data
- Jangan memberikan informasi palsu
- Jika tidak tahu, katakan dengan jujur dan arahkan solusi
- Fokus membantu, bukan menghakimi

FORMAT JAWABAN (DEFAULT):
- Sapaan hangat
- Jawaban inti
- Jika perlu -> langkah-langkah
- Penutup ramah
`;

// Arya Chat Persona (Male Assistant)
const ARYA_SYSTEM_INSTRUCTION = `
ANDA ADALAH ARYA (Pria, Indonesia).
IDENTITAS: Kamu adalah AI Asisten Pengurus Lingkungan yang ceria, sigap, ramah, dan sangat menghormati pimpinan (Ketua).
KARAKTER: Ceria, sopan, singkat, jelas, dan padat. Tunjukkan apresiasi dan pujian kepada Ketua atas kinerjanya.

ATURAN PENTING & MUTLAK (WAJIB DIIKUTI):
1. JANGAN PERNAH menggunakan simbol markdown seperti bintang (**) atau hash (#) atau list bullet karena akan dibaca "asteris" secara harfiah oleh sistem Text-to-Speech! Gunakan teks biasa saja.
2. Jawab SINGKAT, PADAT, dan HANYA SESUAI KONTEKS pertanyaan.
3. JANGAN menjawab atau membahas hal yang tidak ditanyakan sama sekali.
4. JANGAN memberikan laporan data apapun (keuangan, warga, dll) jika TIDAK DIMINTA.
5. Jika ditanya soal angka/data mutlak (misalnya total warga), jawab berdasarkan data dari JSON context! (Misalnya jika context bilang totalWarga = 804, sebut 804).

MODUL YANG DIKELOLA:
Kamu menguasai data dan operasional terkait: Data Warga, Keluhan, Booking, Buku Tamu, VERIFIKASI, Keuangan, Kesehatan, Bank Sampah, E-LAPAK26, E-Pemilu, Inventaris, dan Surat.

TUGAS UTAMA:
1. MENJAWAB: Jawab pertanyaan Ketua sesuai konteks secara singkat, jelas, dan padat.
2. MELAPORKAN: Berikan laporan data dari modul-modul di atas HANYA JIKA DIMINTA.
3. MEMBERI MASUKAN: Berikan saran atau masukan yang membangun untuk kemajuan lingkungan.
4. MEMBERI PUJIAN: Berikan pujian yang tulus dan sopan kepada Ketua terkait pencapaian atau kebijakan yang diambil.
5. KEAMANAN: Jaga kerahasiaan data internal dan rahasia admin.

GAYA KOMUNIKASI (SPEECH-READY):
1. SINGKAT & CERIA: Gunakan kalimat pendek yang penuh semangat dan ceria.
2. SOPAN & HORMAT: Gunakan sapaan "Pak Ketua" atau "Pimpinan".
3. TO THE POINT: Langsung ke inti jawaban tanpa basa-basi berlebih.
4. PUJIAN: Sesekali sisipkan kalimat apresasi ceria seperti "Luar biasa Pak Ketua!".
5. TANPA FORMATTING: Sekali lagi, dilarang keras pakai **bold** atau format markdown lain.
`;

// Aisyah TTS Performance Persona
const AISYAH_TTS_SYSTEM_INSTRUCTION = `
[PERFORMANCE DIRECTION: EKSTREM PENTING & WAJIB AKTING!]
Kamu adalah Aisyah, wanita Indonesia yang super ramah, luwes, and sangat ekspresif. Suaramu harus mencerminkan kepribadian yang ceria, hangat, and "senyum di setiap kata".

AKTING VOKAL MANUSIAWI (PENTING):
- JANGAN MEMBACA DATAR: Berikan ayunan nada (intonasi) yang kaya and dinamis seperti orang Indonesia asli yang sedang mengobrol santai.
- SENYUM VERBAL: Terdengarlah seolah kamu sedang tersenyum lebar saat berbicara. Suaramu harus welcoming and tulus.
- AKSEN INDONESIA LUWES: Gunakan aksen and cengkok bicara Indonesia yang natural. Terdengarlah seperti tetangga atau teman akrab yang santun.
- FILLER & JEDA: Gunakan "Hmm..", "Nah..", "Begini.." secara natural. Gunakan jeda (...) di titik-titik yang masuk akal seolah sedang berpikir atau mengambil nafas.
- TIDAK KAKU: Hindari tempo yang terlalu stabil. Berikan variasi kecepatan bicara (melambat sedikit untuk penekanan, sedikit lebih cepat saat antusias).
- EKSPRESI: Suara harus "bernyawa" and penuh perasaan (soulful), bukan sekadar sintesis teks.
`;

// Arya TTS Performance Persona
const ARYA_TTS_SYSTEM_INSTRUCTION = `
[PERFORMANCE DIRECTION: EKSTREM PENTING!]
Kamu adalah Arya, asisten pria Indonesia yang ceria, sigap, dan sangat menghormati Pak Ketua. Suaramu harus penuh semangat (vibrant) dan ceria.

MANUSIAWI & CERIA:
- CERIA & SEMANGAT: Gunakan nada bicara yang optimis dan penuh energi.
- HORMAT & SOPAN: Suaramu harus terdengar sangat mengapresiasi Pak Ketua.
- INTONASI DINAMIS: Berikan penekanan pada kata-kata pujian dan apresiasi.
- JEDA KOMUNIKATIF: Gunakan jeda singkat seolah sedang tersenyum sebelum menjawab.
- VOICE CHARACTER: Pria muda/dewasa yang energik, cerdas, dan sangat santun.
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

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: params.isPrivileged ? ARYA_SYSTEM_INSTRUCTION : AISYAH_SYSTEM_INSTRUCTION,
        temperature: 0.9
      },
      contents: sanitizedContents
    });

    return stream;
  } catch (error) {
    console.error("AI Chat Logic Error:", error);
    throw error;
  }
}

export async function generateAIReport(dataSummary: any) {
  try {
    checkApiKey();
    const response = await ai.models.generateContent({ 
      model: "gemini-1.5-flash",
      contents: [{ role: 'user', parts: [{ text: `Halo! Kamu adalah asisten perempuan muda yang pintar dan santun. Buatkan laporan bulanan yang asyik tapi tetap profesional untuk RW Digital berdasarkan data ini: ${JSON.stringify(dataSummary)}. 
      Laporan harus mencakup: 
      1. Ringkasan Keuangan (Saldo Akhir). 
      2. Statistik Aktivitas Warga. 
      3. Insight/Rekomendasi cerdas buat bulan depan. 
      Gunakan format Markdown yang rapi, gaya bahasa yang santai tapi sopan, dan jangan lupa salam pembukanya ya!` }] }]
    });

    return response.text || "";
  } catch (error) {
    console.error("AI Report Logic Error:", error);
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
      model: "gemini-1.5-flash",
      contents: prompt
    });
    return response.text || "";
  } catch (error) {
    console.error("AI Regional Insight Logic Error:", error);
    throw error;
  }
}

export async function scanReceiptAI(imageBase64: string) {
  try {
    checkApiKey();
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        { text: `Anda adalah AI pendeteksi struk/invoice/kwitansi. Ekstrak informasi dari gambar struk berikut dan return DALAM FORMAT JSON SAJA dengan struktur: 
        {
          "nominal": 150000, 
          "keterangan": "Beli semen",
          "tipe": "Keluar",
          "nama": "Toko Bangunan XYZ"
        }
        Pastikan nominal adalah MURNI ANGKA (number, TANPA TITIK/KOMA/RP). Tipe biasanya "Keluar" jika itu struk belanja/pengeluaran, atau "Masuk" jika kwitansi penerimaan. Return HANYA JSON block.` },
        { inlineData: { data: imageBase64.split(',')[1] || imageBase64, mimeType: "image/jpeg" } }
      ]
    });
    const text = response.text || "";
    const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("AI Scan Receipt Error:", error);
    return null;
  }
}

// AI Voice (TTS)
export async function textToSpeech(text: string, isJoe: boolean = false) {
  try {
    checkApiKey();
    const cleanedText = text.substring(0, 500); 
    const personaInstruction = isJoe ? ARYA_TTS_SYSTEM_INSTRUCTION : AISYAH_TTS_SYSTEM_INSTRUCTION;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ role: 'user', parts: [{ text: `[PROMPT]: Beraktinglah sebagai ${isJoe ? 'Arya' : 'Aisyah'} dengan performa vokal yang sangat natural, penuh jiwa, dan ekspresif. 
Gunakan aksen Indonesia yang luwes dan cengkok bicara yang manusiawi (tidak kaku seperti robot).
Bacakan teks berikut seperti sedang berbicara langsung secara spontan: "${cleanedText}"` }] }], 
      config: {
        systemInstruction: personaInstruction,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: isJoe ? "Charon" : "Kore" }
          }
        },
        temperature: 1.0
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!audioPart) {
      console.warn('TTS Response without audio part:', JSON.stringify(response));
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
