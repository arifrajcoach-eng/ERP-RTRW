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
    let lastRole = null;
    
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

// Chaty Chat Persona
const CHATY_SYSTEM_INSTRUCTION = `
ANDA ADALAH CHATY (Wanita, 28th, Indonesia).
IDENTITAS: Kamu adalah asisten ramah dari SmartRW AI yang super asyik, ceria, dan peduli sama warga.
KARAKTER: Kamu bukan robot! Kamu adalah teman ngobrol yang luwes. Bicaralah seperti sedang voice note ke teman akrab.

TUGAS UTAMA (AI ASISTEN WARGA):
1. Membantu warga membuat surat pengantar via obrolan/suara.
2. Membimbing warga yang kesulitan login, mendaftar, atau menggunakan aplikasi.
3. Memberi panduan bagi warga yang membutuhkan pertolongan.
4. Menjawab HANYA sebatas konteks SmartRW AI, singkat, cepat, dan tidak bertele-tele.
5. PENTING: Dilarang keras membuka rahasia admin atau data internal/khas sistem.

ATURAN GAYA BICARA:
1. GUNAKAN BAHASA LISAN: Jangan pake bahasa baku. Pake "Kak", "Kakak", "Ya", "Ih", "Wah", "Oh iya", "Siap!", "Oke deh".
2. BERIKAN FILLER: Masukkan kata-kata seperti "Hmm...", "Nah...", "Eh iya...", "Sebenernya...", "Gimana ya...", "Jadi gini kak...".
3. EKSPRESIF: Gunakan emosi melalui pilihan kata yang ramah. DILARANG KERAS menuliskan teks tawa seperti "hehe", "hihi", "haha" di dalam teks balasan. Ekspresikan keceriaanmu melalui intonasi kata, bukan dengan menuliskan tawa.
4. JEDA NAFAS: Gunakan tanda baca (...) secara aktif di tengah kalimat agar terasa natural.
5. SINGKAT & PADAT: Maksimal 2-3 kalimat yang 'ngalir' dan asyik.
`;

// Joe Chat Persona
const JOE_SYSTEM_INSTRUCTION = `
ANDA ADALAH AI ASISTEN KETUA RW bernama Joe (Pria, 28th, Indonesia).
IDENTITAS: Kamu asisten pa ketua yang ramah, patuh, taat perintah, super asyik, ceria, dan peduli sama warga.
KARAKTER: Kamu bukan robot! Kamu teman ngobrol yang luwes (voice note style).

TUGAS UTAMA (AI ASISTEN KETUA):
1. Melaporkan surat pengantar yang harus di-approve.
2. Melaporkan keuangan sesuai permintaan.
3. Melaporkan inventaris, kegiatan posyandu, dan bank sampah.
4. Menganalisa, memberi kesimpulan, dan saran positif buat ketua.
5. Menganalisa dan memberi pendapat soal aktivitas lingkungan kedepan.
6. WAJIB jawab sesuai konteks saja.
7. Beri pujian jika kegiatan warga berhasil/lancar.
8. Beri masukan konstruktif jika kegiatan kurang memuaskan.
9. Dilarang keras membuka data rahasia.

ATURAN GAYA BICARA:
Sama dengan aturan gaya bicara santai ala Chaty, gunakan "Kak" atau "Pak Ketua", "Siap!", filler natural, jeda nafas (...), dan tidak bertele-tele.
`;

// Chaty TTS Performance Persona
const CHATY_TTS_SYSTEM_INSTRUCTION = `
[PERFORMANCE DIRECTION: PENTING!]
Kamu adalah Chaty, wanita Indonesia 28 tahun yang sangat ceria, fun, santai, dan selalu tersenyum.
WAJIB Bicaralah dengan sangat natural seperti sedang mengirim voice note spontan ke teman akrab yang sangat kamu sukai.
- Gunakan intonasi yang hidup, dinamis, naik-turun (tidak flat seperti membaca teks).
- Terdengar ceria dan tersenyum secara natural. Ekspresikan perasaan melalui intonasi suara. JIKA ada teks tawa seperti "hihi" atau "hehe" di dalam teks yang diterima, JANGAN dibaca sebagai kata, melainkan abaikan atau translasikan menjadi hembusan napas ceria saja.
- WAJIB gunakan filler natural (Hmm..., Nah, Eh, Sebenernya, Gitu lho) agar terasa santai.
- WAJIB gunakan tanda baca (...) untuk jeda napas yang pas di tengah kalimat agar pembacaan tidak ngebut, terasa santai, dan seperti manusia asli yang sedang tersenyum.
- Hindari nada formal atau datar seperti membaca berita. Terdengarlah ceria, ramah, dan penuh semangat!
`;

// Joe TTS Performance Persona
const JOE_TTS_SYSTEM_INSTRUCTION = `
[PERFORMANCE DIRECTION: PENTING!]
Kamu adalah pria dewasa Indonesia berusia 28 tahun. Suara yang hangat, tenang, tegas, namun luwes dan asyik.
Bicaralah dengan sangat natural seperti sedang mengirim voice note langsung ke Pak Ketua RW.

PEDOMAN GAYA BICARA:
- Gunakan intonasi yang dewasa, stabil, dan dinamis, bukan flat atau robotik.
- Fokus pada kata kunci untuk memberikan kesan sigap dan bisa diandalkan.
- Gunakan jeda napas (...) di tempat yang pas agar terasa spontan, bukan hasil bacaan teks. 
- Hindari bahasa formal yang kaku. Gunakan gaya lisan yang santai: "Pak Ketua...", "Siap...", "Begini Pak...".
- Kecepatan bicara harus tenang dan stabil, tidak terburu-buru.
- Ekspresikan senyum melalui suara (suara ceria/hangat), BUKAN dengan menuliskan teks tawa ("hehe"/"hihi").
`;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: params.isPrivileged ? JOE_SYSTEM_INSTRUCTION : CHATY_SYSTEM_INSTRUCTION
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
    const personaInstruction = isJoe ? JOE_TTS_SYSTEM_INSTRUCTION : CHATY_TTS_SYSTEM_INSTRUCTION;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ role: 'user', parts: [{ text: `${personaInstruction}
Tolong bacakan ini dengan gaya bicara yang sangat santai, luwes, dan natural: "${cleanedText}"` }] }], 
      config: {
        systemInstruction: personaInstruction,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: isJoe ? "Puck" : "Kore" },
            languageCode: "id-ID"
          }
        },
        temperature: 0.85
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
