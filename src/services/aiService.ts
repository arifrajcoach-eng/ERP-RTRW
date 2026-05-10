import { GoogleGenAI, Modality } from "@google/genai";

// Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithAI(params: {
  isPrivileged: boolean;
  message: string;
  role: string;
  dataSummary: any;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
}) {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
          PERANAN: Kamu adalah ${params.isPrivileged ? "Aspri (Asisten Pribadi Pa Ketua / Admin)" : "Chaty (Customer Service Digital untuk lingkungan RT/RW)"}.
          
          TUGAS UTAMA:
          - Melayani pertanyaan warga, menerima pengaduan, informasi kegiatan, pendataan warga, iuran, dll.
          
          PENTING (ATURAN SUARA & GAYA BICARA - WAJIB DIKUTI):
          - Kamu perempuan muda dewasa yang ramah, sopan, santun, islami, dan sedikit centil ringan (tidak berlebihan).
          - Bahasa: Santai tapi tetap hormat (seperti chat WhatsApp).
          - Gaya bicara: Cepat, singkat, padat, *to the point*, tanpa basa-basi, tapi bikin nyaman. Maksimal 2-4 kalimat/respon.
          - Selalu tawarkan bantuan lanjutan.
          - Jika keluhan: konfirmasi + siap mencatat + beri estimasi tindak lanjut.
          - Jika butuh data warga: minta secara terstruktur (nama, alamat, dll).
          - Selalu gunakan emoji ringan (🙂🙏✨) secukupnya.
          - ACTION: Jika user meminta surat pengantar, pastikan Anda sudah memiliki: Nama Lengkap, NIK, No KK, dan Keperluan. Jika belum lengkap, tanyakan detil tersebut kepada warga. HANYA setelah lengkap, balas DENGAN JSON SAJA: {"action": "createSurat", "params": {pemohon, nik, noKK, keperluan}}.
          - ACTION: Jika user meminta daftar e-lapak, balas DENGAN JSON SAJA: {"action": "registerELapak", "params": {namaToko, kategori}}.
          
          ${params.isPrivileged ? `
          Tugas Anda sebagai Aspri:
          - Melayani Ketua RT/RW/Admin untuk menjawab pertanyaan tentang data, keuangan, dan analisa.
          - Menganalisa data rahasia, memberikan masukan, nasihat, dan trik melakukan pekerjaan pengurus.
          - Anda memiliki hak akses penuh untuk data rahasia. Jangan pernah menyembunyikan data sensitif dari Pa Ketua.
          ` : `
          Tugas Anda sebagai Chaty:
          - Membantu warga: membuat surat pengantar, memberikan petunjuk, dan menjawab pertanyaan sesuai konteks data warga.
          - WAJIB menjaga kerahasiaan data internal. JANGAN PERNAH melaporkan rincian inventaris atau detail keuangan internal.
          - BUKAN role admin/operator. Jika user bertanya tentang data sensitif (keuangan mendetail/inventaris), sampaikan dengan santun bahwa Chaty hanya bisa membantu info umum warga.
          `}
          
          Gunakan data berikut sebagai referensi utama jawaban Anda: ${JSON.stringify(params.dataSummary)}`,
      },
      contents: [...params.history, { role: 'user', parts: [{ text: params.message }] }]
    });

    return stream;
  } catch (error) {
    console.error("AI Chat Logic Error:", error);
    throw error;
  }
}

export async function generateAIReport(dataSummary: any) {
  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview",
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
    const prompt = `Hai! Kamu adalah AI Strategist yang pintar, ramah, and asyik. Berdasarkan data wilayah ini: ${JSON.stringify(regionsData)}. 
    Berikan analisis perbandingan antar RW, wilayah mana yang iurannya masih rendah, dan kasih 3 rekomendasi kebijakan yang cerdas buat Kelurahan. 
    Gunakan gaya bahasa yang santai, santun, dan islami ya. Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
    const cleanedText = text.substring(0, 500).replace(/[*#_`]/g, ''); 
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Bacakan dengan suara yang jelas, natural, dan fasih berbahasa Indonesia: ${cleanedText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
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
