import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { checkFeatureAccess } from "./src/services/subscriptionService";

// dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI SDK Lazy Initialization
  let ai: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI {
    if (!ai) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    }
    return ai;
  }

  // Simple in-memory cache for popular questions
  const aiCache = new Map<string, { response: string, expiry: number }>();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Gateway Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    const { message, tenantId, userId, role, dataSummary, history } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    // Mock: Get subscription based on tenantId
    const subscription = { planId: 'flash', addons: [] }; 
    if (!checkFeatureAccess(subscription, 'ai_chat')) {
        return res.status(403).json({ error: "Fitur tidak tersedia dalam paket Anda. Silakan upgrade plan Anda." });
    }

    // 1. Quota Check (In a real app, use Firestore)
    // For demo/prototype, we'll use a simple in-memory session limit
    // Citizens: 5 requests, Admin: unlimited (for Premium)
    
    // 2. Cache Check
    const cacheKey = `${tenantId}:${message.toLowerCase().trim()}`;
    const cached = aiCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return res.json({ text: cached.response, cached: true });
    }

    try {
      const chat = getAI().chats.create({
        model: "gemini-1.5-flash",
        history: history || [],
        config: {
          systemInstruction: role === 'Admin' 
            ? "Anda adalah AI Admin Assistant untuk RW Digital. Tugas Anda membantu pengurus menganalisis data, membuat laporan, dan memberikan insight efisiensi. Gunakan data berikut: " + JSON.stringify(dataSummary)
            : "Anda adalah AI Chatbot Warga RW Digital. Tugas Anda menjawab pertanyaan warga tentang iuran, jadwal posyandu, dan informasi umum. Bersikaplah ramah dan sopan. Gunakan data berikut: " + JSON.stringify(dataSummary),
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage({ message });
      const text = result.text || "";

      // 3. Save to Cache (popular queries like "kapan posyandu?")
      if (message.length < 50) {
        aiCache.set(cacheKey, { 
          response: text, 
          expiry: Date.now() + 30 * 60 * 1000 // 30 mins
        });
      }

      res.json({ text });
    } catch (error: any) {
      console.error("AI Gateway Error:", error);
      res.status(500).json({ error: "Terjadi kesalahan pada AI Gateway", details: error.message });
    }
  });

  app.post("/api/ai/report", async (req, res) => {
    const { tenantId, dataSummary } = req.body;

    try {
      const result = await getAI().models.generateContent({ 
        model: "gemini-1.5-flash",
        contents: `Buatkan laporan bulanan yang profesional untuk RW Digital berdasarkan data berikut: ${JSON.stringify(dataSummary)}. 
      Laporan harus mencakup: 
      1. Ringkasan Keuangan (Saldo Akhir). 
      2. Statistik Aktivitas Warga. 
      3. Insight/Rekomendasi untuk bulan depan. 
      Gunakan format Markdown yang rapi.`
      });

      const text = result.text || "";

      res.json({ report: text });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat laporan", details: error.message });
    }
  });

  app.post("/api/ai/regional-insight", async (req, res) => {
    const { regionsData } = req.body;

    try {
      const prompt = `Anda adalah Strategist Pemerintah (Smart Village). Berdasarkan data agregasi wilayah berikut: ${JSON.stringify(regionsData)}. 
      Berikan analisis perbandingan antar RW, identifikasi wilayah dengan risiko iuran rendah, dan berikan 3 rekomendasi kebijakan strategis untuk tingkat Kelurahan. 
      Gunakan gaya bahasa formal dan data-driven. Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

      const result = await getAI().models.generateContent({ model: "gemini-1.5-flash", contents: prompt });
      const text = result.text || "";

      res.json({ insight: text });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat insight regional" });
    }
  });

  app.post("/api/ai/scan-receipt", async (req, res) => {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "Image is required" });

    try {
      const prompt = `Anda adalah AI pendeteksi struk/invoice/kwitansi. Ekstrak informasi dari gambar struk berikut dan return DALAM FORMAT JSON SAJA dengan struktur: 
      {
        "nominal": 150000, 
        "keterangan": "Beli semen",
        "tipe": "Keluar",
        "nama": "Toko Bangunan XYZ"
      }
      Pastikan nominal adalah MURNI ANGKA (number, TANPA TITIK/KOMA/RP). Tipe biasanya "Keluar" jika itu struk belanja/pengeluaran, atau "Masuk" jika kwitansi penerimaan. Return HANYA JSON block.`;

      const result = await getAI().models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
            {
                role: 'user',
                parts: [
                    { text: prompt },
                    { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
                ]
            }
        ]
      });

      const text = result.text || "";
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      res.json(parsed);
    } catch (error: any) {
      console.error("Scan Receipt Error:", error);
      res.status(500).json({ error: "Gagal mendeteksi struk", details: error.message });
    }
  });

  // PPOB Revenue Sharing
  app.post("/api/ppob/transaction", async (req, res) => {
    const { total_paid, admin_fee, tenantId } = req.body;
    const share = admin_fee / 2;
    // Logic to save to Firestore would go here, 
    // referencing the transaction structure requested.
    res.json({ status: 'success', share_owner: share, share_community: share });
  });

  // Monthly Insight via Gemini
  app.post("/api/ai/monthly-insight", async (req, res) => {
    const { tenantId, financialData } = req.body;
    try {
      const result = await getAI().models.generateContent({ 
        model: "gemini-1.5-flash", 
        contents: `Buatkan 3 baris ringkasan keuangan profesional untuk RW/RT. Data: ${JSON.stringify(financialData)}.` 
      });
      res.json({ insight: result.text || "" });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat insight", details: error.message });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
