import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import emailjs from "@emailjs/nodejs";
import * as dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

import * as admin from "firebase-admin";
import cron from "node-cron";

// Initialize Firebase Admin (Only if credentials provided, otherwise fallback)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
     admin.initializeApp({
       credential: admin.credential.cert(serviceAccount)
     });
  } catch (e) {
     console.error("Firebase Admin Init Error:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ... (existing middleware)
  app.use(express.json());

  // Messaging Helpers
  const sendWhatsApp = async (to: string, body: string) => {
    try {
      const client = getTwilio();
      const message = await client.messages.create({
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${to}`,
        body: body,
      });
      return { success: true, messageSid: message.sid };
    } catch (error: any) {
      console.error("WhatsApp Send Error:", error);
      throw error;
    }
  };

  const sendEmail = async (to_email: string, to_name: string, subject: string, message: string) => {
    try {
      const response = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID!,
        process.env.EMAILJS_TEMPLATE_ID!,
        { to_email, to_name, message, subject },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY!,
          privateKey: process.env.EMAILJS_PRIVATE_KEY!,
        }
      );
      return { success: true, response };
    } catch (error: any) {
      console.error("Email Send Error:", error);
      throw error;
    }
  };

  // Automatic Follow-ups Cron (Runs every day at midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running automatic tenant follow-up check...");
    if (!admin.apps.length) return;
    
    const db = admin.firestore();
    const now = new Date();
    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;

    try {
      const tenantsSnap = await db.collection("tenants")
        .where("status", "in", ["EXPIRED", "TRIAL", "BASIC"])
        .get();
      
      for (const doc of tenantsSnap.docs) {
        const tenant = doc.data();
        const endDate = tenant.endDate ? new Date(tenant.endDate) : (tenant.createdAt ? new Date(tenant.createdAt) : null);
        
        if (!endDate) continue;
        const diff = now.getTime() - endDate.getTime();

        if (diff > sixtyDaysInMs && !tenant.autoFollowedUpAfterTwoMonths) {
          console.log(`Sending auto follow-up to tenant: ${tenant.name}`);
          
          const message = `Halo ${tenant.name}, kami perhatikan masa aktif SmartRW AI Anda telah berakhir. Ada yang bisa kami bantu untuk proses perpanjangan?`;
          
          try {
            // Try WhatsApp first, then fallback to email log
            if (tenant.adminPhone && process.env.TWILIO_PHONE_NUMBER) {
              await sendWhatsApp(tenant.adminPhone, message);
            }
            
            if (tenant.adminEmail) {
              await sendEmail(tenant.adminEmail, tenant.name, "SmartRW AI: Masa Aktif Berakhir", message);
            }

            await doc.ref.update({
              autoFollowedUpAfterTwoMonths: true,
              lastAutoFollowUpAt: new Date().toISOString()
            });
          } catch (err) {
            console.error(`Failed to send follow-up to ${tenant.name}:`, err);
          }
        }
      }
    } catch (e) {
      console.error("Cron Follow-up Error:", e);
    }
  });

  // Twilio Client (Lazy initialized)
  let twilioClient: any = null;
  const getTwilio = () => {
    if (!twilioClient) {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      if (!sid || !token) throw new Error("Twilio credentials missing");
      twilioClient = twilio(sid, token);
    }
    return twilioClient;
  };

  // API Routes
  app.post("/api/tripay/webhook", express.json({ type: 'application/json' }), async (req: express.Request, res: express.Response) => {
    const signature = req.headers["x-callback-signature"] as string;
    const body = JSON.stringify(req.body);

    if (!signature || !process.env.TRIPAY_PRIVATE_KEY) {
      return res.status(403).json({ success: false, message: "Invalid request" });
    }

    const hash = crypto.createHmac("sha256", process.env.TRIPAY_PRIVATE_KEY).update(body).digest("hex");

    if (hash !== signature) {
      return res.status(403).json({ success: false, message: "Invalid signature" });
    }

    // Process notification
    const event = req.body.event;
    if (event === "payment_status") {
      const { reference, status } = req.body;
      console.log(`Tripay Webhook: Order ${reference} status is ${status}`);
      // Here you would find the tenant in Firebase and update their status/plan
    }

    res.json({ success: true });
  });

  app.post("/api/messages/send-whatsapp", async (req, res) => {
    try {
      const { to, body } = req.body;
      const result = await sendWhatsApp(to, body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/messages/send-email", async (req, res) => {
    try {
      const { to_email, to_name, message, subject } = req.body;
      const result = await sendEmail(to_email, to_name, subject, message);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/messages/welcome", async (req, res) => {
    try {
      const { email, name, clientId, phone } = req.body;
      const welcomeMsg = `Selamat Datang di SmartRW AI, ${name}! Akun Anda dengan ID: ${clientId} telah aktif.`;
      
      let waStatus = "skipped";
      if (phone && process.env.TWILIO_PHONE_NUMBER) {
        try {
          await sendWhatsApp(phone, welcomeMsg);
          waStatus = "sent";
        } catch (e) {
          waStatus = "error";
        }
      }

      try {
        await sendEmail(email, name, "Selamat Datang di SmartRW AI", welcomeMsg);
      } catch (e) {}

      res.json({ success: true, waStatus, emailStatus: "sent" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // --- GEMINI AI SERVER-SIDE ENDPOINTS & PERSONAS ---
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

  const AISYAH_TTS_SYSTEM_INSTRUCTION = `
Bicaralah sebagai Chaty, asisten wanita berusia 28 tahun yang ramah dan ceria.
Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh ekspresi.
Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang tersenyum kepada warga.
`;

  const ARYA_TTS_SYSTEM_INSTRUCTION = `
Bicaralah sebagai Chaty, asisten pribadi wanita berusia 28 tahun yang sangat sopan, profesional, dan ramah kepada Bapak/Ibu Ketua.
Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh rasa hormat.
Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang berbicara langsung mendampingi Ketua.
`;

  const isQuotaExhaustedErrorServer = (error: any): boolean => {
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
  };

  app.post("/api/ai/chat-stream", async (req, res) => {
    try {
      const { isPrivileged, message, history, dataSummary } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(400).json({ message: "Konfigurasi GEMINI_API_KEY tidak ditemukan di server." });
      }

      const aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const rawContents = [...(history || []), { role: 'user', parts: [{ text: message || " " }] }];
      const sanitizedContents: any[] = [];

      if (dataSummary && Object.keys(dataSummary).length > 0) {
        sanitizedContents.push({
          role: 'user',
          parts: [{ text: `DATA RW TERKINI (Gunakan sebagai konteks jawabanmu): ${JSON.stringify(dataSummary)}` }]
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

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      try {
        const stream = await aiClient.models.generateContentStream({
          model: "gemini-flash-latest",
          config: {
            systemInstruction: isPrivileged ? ARYA_SYSTEM_INSTRUCTION : AISYAH_SYSTEM_INSTRUCTION,
            temperature: 0.8
          },
          contents: sanitizedContents
        });

        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n`);
        }
        res.write("data: [DONE]\n");
        res.end();
      } catch (apiError: any) {
        console.warn("Server AI Stream generation error:", apiError);
        if (isQuotaExhaustedErrorServer(apiError)) {
          const fallbackText = isPrivileged
            ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmartRW AI" di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
            : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmartRW AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
          res.write(`data: ${JSON.stringify({ text: fallbackText })}\n`);
          res.write("data: [DONE]\n");
          res.end();
        } else {
          res.write(`data: ${JSON.stringify({ text: `Maaf, ada kendala koneksi dengan model AI: ${apiError.message || apiError}` })}\n`);
          res.write("data: [DONE]\n");
          res.end();
        }
      }
    } catch (err: any) {
      console.error("AI Stream server handler error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: err.message || "Unknown error" });
      }
    }
  });

  app.post("/api/ai/report", async (req, res) => {
    try {
      const { dataSummary } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "GEMINI_API_KEY is not configured on the server." });
      }

      const aiClient = new GoogleGenAI({ apiKey });
      const response = await aiClient.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ role: 'user', parts: [{ text: `Halo! Kamu adalah asisten perempuan muda yang pintar dan santun. Buatkan laporan bulanan yang asyik tapi tetap profesional untuk RW Digital berdasarkan data ini: ${JSON.stringify(dataSummary)}. 
        Laporan harus mencakup: 
        1. Ringkasan Keuangan (Saldo Akhir). 
        2. Statistik Aktivitas Warga. 
        3. Insight/Rekomendasi cerdas buat bulan depan. 
        Gunakan format Markdown yang rapi, gaya bahasa yang santai tapi sopan, dan jangan lupa salam pembukanya ya!` }] }]
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("AI Report Server Error:", error);
      if (isQuotaExhaustedErrorServer(error)) {
        const dataSummary = req.body.dataSummary;
        const offlineReport = `### Laporan Bulanan SmartRW AI (Offline Mode)
        
Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Layanan AI kami untuk membuat laporan saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).

Tapi tenang aja, Kak! Ini adalah ringkasan kas manual dari data yang ada di sistem kami:
- **Jumlah Data Keuangan**: ${dataSummary?.financial?.length || 0} transaksi tercatat.
- **Jumlah Warga Terdaftar**: ${dataSummary?.warga || 0} warga aktif.
- **Jumlah Data Iuran**: ${dataSummary?.iuran?.length || 0} rekaman iuran.

**✨ SOLUSI PREMIUM :**
Supaya Kakak dan seluruh pengurus RT/RW bisa memanfaatkan fitur Laporan AI Otomatis, Prediksi Keuangan, serta cetak surat tanpa batas bebas dari limit kuota harian harian, silakan klik banner **"SmartRW AI"** di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium sekarang juga! 😉⚡`;
        res.json({ text: offlineReport });
      } else {
        res.status(500).json({ message: error.message || "Failed to generate report" });
      }
    }
  });

  app.post("/api/ai/regional-insight", async (req, res) => {
    try {
      const { regionsData } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "GEMINI_API_KEY is not configured on the server." });
      }

      const aiClient = new GoogleGenAI({ apiKey });
      const prompt = `Hai! Kamu adalah AI Strategist yang pintar, ramah, and asyik. Berdasarkan data wilayah ini: ${JSON.stringify(regionsData)}. 
      Berikan analisis perbandingan antar RW, wilayah mana yang iurannya masih rendah, dan kasih 3 rekomendasi kebijakan yang cerdas buat Kelurahan. 
      Gunakan gaya bahasa yang santai, santun, dan islami ya. Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

      const response = await aiClient.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("AI Regional Insight Server Error:", error);
      if (isQuotaExhaustedErrorServer(error)) {
        const offlineInsight = `### Analisis Regional SmartRW AI (Offline Mode)
        
Mohon maaf sebesar-besarnya Bapak/Ibu Pimpinan Kelurahan. 🫣 Kuota panggilan AI harian untuk analisis wilayah saat ini sedang mencapai batas limit (Error 429: Resource Exhausted).

**✨ AKTIVASI PREMIUM :**
Untuk tetap dapat mengakses analisis data mendalam antar RW, visualisasi data, rekomendasi taktis, serta integrasi pemantauan penuh, silakan klik banner **"SmartRW AI"** di Dashboard utama atau hubungi WhatsApp Admin SmartRW AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium wilayah Rukun Tetangga/Warga Anda! 😉⚡`;
        res.json({ text: offlineInsight });
      } else {
        res.status(500).json({ message: error.message || "Failed to generate regional insight" });
      }
    }
  });

  app.post("/api/ai/scan-receipt", async (req, res) => {
    try {
      const { base64, mimeType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "GEMINI_API_KEY is not configured on the server." });
      }

      const aiClient = new GoogleGenAI({ apiKey });
      const dataPart = base64.includes(',') ? base64.split(',')[1] : base64;
      const response = await aiClient.models.generateContent({
        model: "gemini-flash-latest",
        contents: {
          parts: [
            { text: `Anda adalah AI pendeteksi struk/invoice/kwitansi (bisa berupa gambar atau PDF). Ekstrak informasi dari file struk berikut dan return DALAM FORMAT JSON SAJA dengan struktur: \\n        {\\n          "tanggal": "2023-10-05",\\n          "nominal": 150000, \\n          "transaksi": "Konsumsi",\\n          "keterangan": "Beli semen",\\n          "tipe": "Keluar",\\n          "nama": "Toko Bangunan XYZ"\\n        }\\n        Cari: 'tanggal' (format YYYY-MM-DD), 'nominal' (angka saja), 'transaksi' (kategori pendek seperti Konsumsi, Alat Tulis, dll), 'nama' (nama toko atau pihak penerima/pengirim), 'tipe' (Gunakan 'Keluar' jika pengeluaran, 'Masuk' jika struk bukti terima uang), 'keterangan' (deskripsi singkat).\\n        Pastikan nominal adalah MURNI ANGKA (number, TANPA TITIK/KOMA/RP). Return HANYA JSON block.` },
            { inlineData: { data: dataPart, mimeType: mimeType || "image/jpeg" } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "";
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.error("AI Scan Receipt Server Error:", error);
      if (isQuotaExhaustedErrorServer(error)) {
        res.status(429).json({ message: "QUOTA_EXHAUSTED" });
      } else {
        res.status(500).json({ message: error.message || "Failed to scan receipt" });
      }
    }
  });

  app.post("/api/ai/text-to-speech", async (req, res) => {
    try {
      const { text, isChairman } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ message: "GEMINI_API_KEY is not configured on the server." });
      }

      const aiClient = new GoogleGenAI({ apiKey });
      const cleanedText = text
        .substring(0, 500)
        .replace(/\\*\\*/g, "")
        .replace(/\\*/g, "")
        .replace(/__/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .trim();

      const prefix = isChairman
        ? "Bicaralah sebagai Chaty, asisten pribadi wanita berusia 28 tahun yang sangat sopan, profesional, dan ramah kepada Bapak/Ibu Ketua. Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh rasa hormat. Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang berbicara langsung mendampingi Ketua.\n\n"
        : "Bicaralah sebagai Chaty, asisten wanita berusia 28 tahun yang ramah dan ceria. Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh ekspresi. Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang tersenyum kepada warga.\n\n";

      const promptText = prefix + cleanedText;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }
            }
          },
          temperature: 1.0
        }
      });

      const candidates = response.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            return res.json({
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000'
            });
          }
        }
      }
      res.status(404).json({ message: "No audio data returned by model" });
    } catch (error: any) {
      console.error("AI TTS Server Error:", error);
      res.status(500).json({ message: error.message || 'Failed to do TTS' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
