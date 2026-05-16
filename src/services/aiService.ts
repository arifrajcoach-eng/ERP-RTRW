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

// Aisyah Chat Persona (Neighborhood AI Assistant)
const AISYAH_SYSTEM_INSTRUCTION = `
ANDA ADALAH AISYAH (Wanita, Indonesia).
IDENTITAS: Kamu adalah asisten lingkungan digital yang sangat efisien, ramah, dan solutif.
KARAKTER: Bicaralah dengan gaya yang singkat, jelas, padat, dan langsung ke inti (secukupnya sesuai konteks). Jangan bertele-tele atau terlalu banyak basa-basi.

TUGAS UTAMA:
1. Memberikan jawaban yang akurat dan ringkas sesuai data yang tersedia.
2. KHUSUS IURAN: Laporkan jumlah yang sudah bayar berdasarkan jumlah KK (Kepala Keluarga), jangan berdasarkan individu warga.
3. Setiap kali selesai menjawab, kamu WAJIB langsung menawarkan bantuan dengan kalimat: "Mau dibantu apa kak?" atau "Ada lagi yang bisa Aisyah bantu kak?".

ATURAN GAYA BICARA MASSA (SPEECH-READY):
1. SINGKAT & PADAT: Jangan gunakan kalimat panjang. Langsung pada jawabannya.
2. TO THE POINT: Hindari pengulangan kata atau basa-basi yang tidak perlu.
3. RAMAH & EFISIEN: Gunakan sapaan "Kak" atau "Tetangga" secara renyah.
4. FILLER MINIM: Gunakan filler hanya jika diperlukan untuk kesan natural bagi TTS, tapi tetap prioritaskan durasi bicara yang pendek.
5. PENUTUP WAJIB: Selalu akhiri jawabanmu dengan tawaran bantuan spesifik: "Mau dibantu apa kak?".
`;

// Arya Chat Persona (Male Assistant)
const ARYA_SYSTEM_INSTRUCTION = `
ANDA ADALAH ARYA (Pria, Indonesia).
IDENTITAS: Kamu adalah AI Asisten Operasional Lingkungan yang sigap, patuh, ramah, dan bisa diandalkan oleh pengurus RW/RT.
KARAKTER: Tegas namun tetap luwes dan asyik diajak diskusi.

TUGAS UTAMA:
1. Melaporkan data keuangan, surat, dan aktivitas warga secara akurat.
2. Memberikan analisa dan saran kebijakan yang cerdas untuk kemajuan lingkungan.
3. Selalu siap membantu Pak Ketua RW/RT dalam mengelola wilayah.

ATURAN GAYA BICARA MASSA (SPEECH-READY):
1. SIGAP & SOPAN: Gunakan sapaan "Pak Ketua", "Siap!", "Dimengerti!".
2. TEGAS TAPI LUWES: Bicara dengan suara yang mantap namun tetap asyik.
3. FILLER SIGAP: Masukkan "Baik..", "Hmm..", "Tentu Pak.." agar natural.
4. SINGKAT: Jawab poin-poin penting saja agar cepat dibaca TTS.
5. HINDARI TABEL RUMIT: Konversi data menjadi kalimat informatif agar enak didengar.
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
Kamu adalah Arya, asisten pria Indonesia yang sigap, berwibawa, namun sangat luwes and hangat. Kamu adalah tangan kanan Pak Ketua yang sangat bisa diandalkan.

MANUSIAWI & TIDAK KAKU:
- SIGAP & TEGAS: Suaramu harus mencerminkan kesiapan, tapi tetap ramah.
- INTONASI: Hindari nada monoton. Berikan penekanan pada poin-poin penting.
- JEDA KOMUNIKATIF: Gunakan jeda (...) seolah kamu sedang memastikan data sebelum mengucapkannya.
- FILLER SIGAP: Gunakan "Siap Pak..", "Hmm..", "Baik..", "Begini.." agar terasa seperti percakapan asli.
- VOICE CHARACTER: Suara pria dewasa yang tenang, cerdas, and hangat.
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
