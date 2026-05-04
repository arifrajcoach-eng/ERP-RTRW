import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI SDK Initialization
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: role === 'Admin' 
          ? "Anda adalah AI Admin Assistant untuk RW Digital. Tugas Anda membantu pengurus menganalisis data, membuat laporan, dan memberikan insight efisiensi. Gunakan data berikut: " + JSON.stringify(dataSummary)
          : "Anda adalah AI Chatbot Warga RW Digital. Tugas Anda menjawab pertanyaan warga tentang iuran, jadwal posyandu, dan informasi umum. Bersikaplah ramah dan sopan. Gunakan data berikut: " + JSON.stringify(dataSummary)
      });
      
      const chat = model.startChat({
        history: history || [],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      const text = response.text();

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Buatkan laporan bulanan yang profesional untuk RW Digital berdasarkan data berikut: ${JSON.stringify(dataSummary)}. 
      Laporan harus mencakup: 
      1. Ringkasan Keuangan (Saldo Akhir). 
      2. Statistik Aktivitas Warga. 
      3. Insight/Rekomendasi untuk bulan depan. 
      Gunakan format Markdown yang rapi.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      res.json({ report: text });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat laporan" });
    }
  });

  app.post("/api/ai/regional-insight", async (req, res) => {
    const { regionsData } = req.body;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Anda adalah Strategist Pemerintah (Smart Village). Berdasarkan data agregasi wilayah berikut: ${JSON.stringify(regionsData)}. 
      Berikan analisis perbandingan antar RW, identifikasi wilayah dengan risiko iuran rendah, dan berikan 3 rekomendasi kebijakan strategis untuk tingkat Kelurahan. 
      Gunakan gaya bahasa formal dan data-driven. Bulan: ${new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      res.json({ insight: text });
    } catch (error: any) {
      res.status(500).json({ error: "Gagal membuat insight regional" });
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
