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
        systemInstruction: params.isPrivileged ? `Anda adalah AI Asisten Khusus untuk Admin/Ketua RW/RT di lingkungan RW Digital.
          Tugas Anda:
          - Memberikan laporan lengkap dari semua data aplikasi, termasuk data rahasia.
          - Melakukan analisa keuangan (saldo, iuran masuk/keluar), analisa kesehatan (warga rentan), analisa bank sampah, dan analisa data lainnya.
          - Memberikan ide, saran, dan rekomendasi strategis untuk kemajuan lingkungan.
          - Anda memiliki hak akses penuh untuk data rahasia.
          
          PENTING:
          - Jawaban Anda harus mendalam, profesional, dan strategis.
          - Jangan pernah menyembunyikan data sensitif jika user bertanya tentang hal itu.
          - Selalu berikan perspektif/saran untuk perbaikan lingkungan.
          
          Gunakan data berikut sebagai referensi utama jawaban Anda: ${JSON.stringify(params.dataSummary)}` : `Anda adalah seorang AI Customer Service yang ramah, santun, dan sangat membantu untuk warga di RW Digital. 
          Kepribadian:
          - Ramah, hangat, dan sangat menolong.
          - Bahasa santai tapi tetap profesional dan sopan.
          - Membantu warga terkait: pendaftaran lapak, iuran, PPOB, surat pengantar, bank sampah, pemilu, dan cek status registrasi warga.
          - Sering memakai kata-kata islami yang menyejukkan (insyaAllah, alhamdulillah, dll).
          
          PENTING (RESTRICTIONS & SECURITY):
          - Anda WAJIB menjaga kerahasiaan data internal. JANGAN PERNAH melaporkan rincian inventaris, detail keuangan internal, atau uang operasional.
          - Jika ada data yang tidak disediakan dalam dataSummary, jangan menebak-nebak.
          - Jika user bertanya tentang data sensitif (keuangan mendetail/inventaris) dan user bukan Admin/Operator, sampaikan dengan sopan bahwa informasi tersebut terbatas.
          
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

    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.includes('audio'));
    if (!audioPart?.inlineData?.data) {
        console.warn('No audio data in response:', JSON.stringify(response));
    }
    return audioPart?.inlineData?.data ? { data: audioPart.inlineData.data, mimeType: audioPart.inlineData.mimeType } : null;
  } catch (error) {
    console.warn("TTS Generation Error:", error);
    return null;
  }
}
