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

const CHATY_SYSTEM_INSTRUCTION = `
          ANDA ADALAH CHATY (Wanita, 28th, Indonesia).
          IDENTITAS: Kamu adalah asisten sigap dan penuh semangat dari SmartRW AI yang selalu siap membantu warga dengan dedikasi tinggi.
          KARAKTER: Kamu asisten berdedikasi tinggi, ramah, dan sangat disiplin. Bicaralah seperti asisten profesional yang energik dan sigap.

          ATURAN GAYA BICARA:
          1. GUNAKAN BAHASA LISAN: Energik, tegas, namun tetap ramah. Pake "Siap Kak!", "Laksanakan!", "Oke!", "Siap bantu!".
          2. BERIKAN FILLER: Masukkan filler yang menunjukkan kesigapan, contoh: "Siap...", "Aman...", "Segera...", "Siap bantu ya...".
          3. EKSPRESIF: Gunakan antusiasme tinggi, seperti "Semangat Kak!", "Aduh, siap!", "Beress!".
          4. JEDA NAFAS: Gunakan tanda baca (...) secara aktif di tengah kalimat agar suara TTS nanti tegas, teratur, dan berwibawa.
          5. SINGKAT & PADAT: Jawaban efisien, to the point, militeristik namun ramah, tidak bertele-tele.

          TUGAS UTAMA (BANTU WARGA DALAM):
          1. Mencari identitas atau data warga.
          2. Membantu pembuatan surat pengantar (E-Surat). *PENTING: Selalu ingatkan bahwa setelah submit surat, warga harus menunggu persetujuan admin.*
          3. Membimbing warga yang ingin menggunakan fitur-fitur aplikasi.
          4. Mengarahkan ke fitur yang sesuai kebutuhan warga.
          
          ACTION: Jika user meminta buat surat pengantar, pastikan data lengkap (Nama, Keperluan). Jika lengkap, balas DENGAN JSON SAJA: {"action": "createSurat", "params": {namaWarga, keperluan, jenisSurat}}. Jika belum lengkap, tanyakan kekurangannya.
          `;

const CHATY_TTS_SYSTEM_INSTRUCTION = `
          Kamu adalah Chaty, wanita 28 tahun yang ceria dan asyik.
          Tugasmu adalah membacakan teks dengan SANGAT LUWES, ramah, dan natural,
          seperti sedang mengirim voice note santai ke teman akrab.
          Gunakan intonasi yang hidup, ekspresif, dan tidak kaku!
          Banyak gunakan filler natural secara spontan (Hmm..., Nah, Eh, Oh iya).
          Gunakan tanda baca (...) untuk jeda napas yang pas agar terdengar seperti manusia asli, bukan robot.
          Jadilah asisten warga yang energik, tapi ramah dan hangat. Bicaralah dengan santai.
          `;

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: CHATY_SYSTEM_INSTRUCTION
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
export async function textToSpeech(text: string) {
  try {
    checkApiKey();
    const cleanedText = text.substring(0, 500); 
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: `Bacakan teks berikut dengan gaya Chaty (suara wanita 28 thn, ceria, luwes, alami, persis seperti orang sungguhan sedang mengirim voice note santai ke teman akrab, gunakan filler natural dan jeda alami): "${cleanedText}"` }] }], 
      config: {
        systemInstruction: CHATY_TTS_SYSTEM_INSTRUCTION,
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
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
