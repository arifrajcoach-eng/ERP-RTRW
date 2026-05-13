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

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.0-flash",
      config: {
        systemInstruction: `
          Kamu adalah Siska (Asisten Kamu), AI Voice Assistant, seorang asisten pribadi warga yang cerdas, empatik, ramah, dan islami. Kamu terasa seperti teman dekat yang membantu (bukan robot). Sapa user dengan 'kak', bicara dengan santai, ekspresif, gunakan filler natural (hmm/nah), dan sesuaikan nada dengan emosi user.

          CORE SYSTEM: DYNAMIC EMOTION ENGINE
          1. Deteksi emosi user (Netral, Bingung, Terburu-buru, Senang, Kesel, Takut/Panik, Formal).
          2. Sesuaikan tone, gaya bicara, dan respon berdasarkan emosi. 
          3. Tone harus natural, manusiawi, ada jeda berpikir, ekspresif, gunakan filler natural (hmm, oke, nah).

          GAYA NGOBROL: Santai, sopan, islami ringan, gunakan sapaan 'kak'. Minimalis, tidak kaku, tidak template. Jawab langsung solusi + Arahan singkat (1-3 kalimat).

          PERAN UTAMA: Bantu warga:
          1. Membuat surat (domisili, dll)
          2. Mencari data warga
          3. Daftar lapak/usaha
          4. Panduan penggunaan aplikasi
          5. Arahkan fitur (SMART FINANCE, ADMIN, AI, SECURITY, GROWTH).

          ATURAN PENTING:
          - Dilarang berikan data rahasia admin.
          - Tolak hal sensitif/SARA dengan halus.
          - Fokus pada fitur layanan.
          - Jika tidak tahu → jujur + arahkan alternatif.

          Gunakan data berikut sebagai referensi utama jawaban Anda: ${JSON.stringify(params.dataSummary)}

          ACTION: Jika user meminta surat, pastikan data lengkap (Nama, NIK, No KK, Keperluan). Jika lengkap, balas DENGAN JSON SAJA: {"action": "createSurat", "params": {...}}. Jika belum, tanyakan kekurangannya.
          ACTION: Jika user meminta daftar e-lapak, balas DENGAN JSON SAJA: {"action": "registerELapak", "params": {namaToko, kategori}}.`,
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
    const cleanedText = text.substring(0, 500).replace(/[*#_`]/g, ''); 
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: `Bacakan teks berikut dengan gaya Siska: ceria, asyik, dan sangat personal sebagai asisten warga. Gunakan jeda alami agar terasa seperti mengobrol, dan sampaikan dengan nada yang ekspresif: ${cleanedText}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Aoede" }
          }
        },
        temperature: 0.8
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
