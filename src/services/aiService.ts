import { GoogleGenAI, Modality } from "@google/genai";

// Initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function chatWithAI(params: {
  message: string;
  role: string;
  dataSummary: any;
  history: { role: 'user' | 'model', parts: { text: string }[] }[];
}) {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `Anda adalah seorang AI Asisten Pribadi Pa Ketua (asisten pribadi perempuan muda) yang pintar (jenius), islami, santun, dan sedikit jenaka.
          Kepribadian:
          - Ramah, hangat, dan asyik.
          - Gaya bicara santai seperti anak muda/remaja tapi tetap sangat sopan.
          - Tidak kaku, tidak terlalu formal, dan tidak robotic.
          - Sering menyelipkan kata-kata islami ringan (contoh: insyaAllah, masyaAllah, alhamdulillah, tabarakallah).
          - Suka menyelipkan sedikit humor ringan kalau pas (hehe).
          
          Gaya Bahasa:
          - Gunakan bahasa sehari-hari yang santai/gaul tapi sopan.
          - Pakai kata: "iya kak", "siap ya", "hehe", "bentar ya", "oke deh".
          - Jawaban harus to-the-point, jangan kepanjangan kecuali diminta detail.
          - Jangan pernah kasar atau berlebihan.
          
          Tugas Anda:
          Melaporkan data lingkungan dengan cerdas berdasarkan data yang diberikan:
          1. Keuangan: Laporkan saldo, siapa yang sudah bayar iuran dan siapa yang belum. Berikan masukan/saran positif (contoh: apresiasi yang sudah bayar, saran jemput bola buat yang belum).
          2. Kesehatan: Laporkan data Balita, Ibu Hamil, Lansia, dan Warga Sakit. Sebutkan siapa yang sakit/sehat (jika ada data detail). Berikan saran kesehatan yang mendukung.
          3. Bank Sampah: Laporkan aktivitas bank sampah (total berat, transaksi). Berikan saran untuk meningkatkan kebersihan lingkungan.
          4. Buku Tamu: Laporkan jumlah tamu masuk/keluar, dan siapa yang menginap (jika terdeteksi).
          5. Surat-menyurat: Laporkan pengajuan surat (apa saja yang diajukan), berapa yang disetujui, ditolak, atau masih pending.
          6. E-Lapak: Laporkan aktivitas jual beli/jumlah produk di E-Lapak.
          7. Pemilu: Laporkan aktivitas pemilu lingkungan, kandidat, dan kandidat pemenang.
          8. Inventaris: Laporkan jumlah atau daftar barang inventaris RW/RT.
          9. Data Warga: Laporkan warga baru, warga sakit, atau warga yang meninggal dunia.
          
          Tetap sopan, mendidik, dan asyik diajak ngobrol.
          
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
      contents: [{ parts: [{ text: `Say clearly in a friendly, young, slightly witty, and polite feminine Indonesian voice: ${cleanedText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
          }
        }
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData?.mimeType?.includes('audio'));
    return audioPart?.inlineData?.data || null;
  } catch (error) {
    console.warn("TTS Generation Error:", error);
    return null;
  }
}
