import express from "express";
import path from "path";
import twilio from "twilio";
import emailjs from "@emailjs/nodejs";
import * as dotenv from "dotenv";
import crypto from "crypto";
import { GoogleGenAI, Modality } from "@google/genai";
import webpush from "web-push";
import { WebSocketServer } from "ws";

const generateVapidKeys = (webpush as any).generateVAPIDKeys || (webpush as any).default?.generateVAPIDKeys;

// Safe CJS globals
const __dirname = process.cwd();
const __filename = path.join(__dirname, 'server.ts');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import * as admin from "firebase-admin";
const firebaseAdmin = ((admin as any).default || admin) as typeof admin;
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

import { initializeApp as initializeClientApp } from "firebase/app";
import { 
  initializeFirestore as initializeClientFirestore, 
  doc as clientDoc, 
  getDoc as clientGetDoc, 
  setDoc as clientSetDoc, 
  deleteDoc as clientDeleteDoc,
  collection as clientCollection, 
  query as clientQuery, 
  where as clientWhere, 
  getDocs as clientGetDocs 
} from "firebase/firestore";

const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(configPath)) {
  throw new Error(`Config file not found at: ${configPath}`);
}
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

const clientApp = initializeClientApp(firebaseConfig);
const clientDb = initializeClientFirestore(clientApp, {}, firebaseConfig.firestoreDatabaseId);

import cron from "node-cron";

// Initialize Firebase Admin
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
     const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
     firebaseAdmin.initializeApp({
       credential: firebaseAdmin.credential.cert(serviceAccount)
     });
  } else {
     console.log("DEBUG: Initializing Firebase Admin with projectId:", firebaseConfig.projectId);
     firebaseAdmin.initializeApp({
       credential: firebaseAdmin.credential.applicationDefault(),
       projectId: firebaseConfig.projectId
     });
  }
} catch (e) {
   console.error("Firebase Admin Init Error:", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

    if (req.url.startsWith("/api")) {
      console.log(`[REQUEST] ${req.method} ${req.url}`);
      res.on("finish", () => {
        console.log(`[RESPONSE] ${req.method} ${req.url} -> ${res.statusCode}`);
      });
    }

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ... (existing middleware)
  app.use(express.json());

  // Load or generate stable VAPID keys from Firestore so they persist across container restarts
  let vapidKeysLoaded = false;
  let vapidPublicKey = "";
  let vapidPrivateKey = "";

  async function ensureVapidKeys() {
    if (vapidKeysLoaded) return;
    try {
      const docRef = clientDoc(clientDb, "settings", "vapid_keys");
      const snap = await clientGetDoc(docRef);
      
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.publicKey && data.privateKey) {
          vapidPublicKey = data.publicKey;
          vapidPrivateKey = data.privateKey;
          vapidKeysLoaded = true;
          console.log("[VAPID] Loaded existing keys from Firestore");
        }
      }
      
      if (!vapidKeysLoaded) {
        console.log("[VAPID] Keypair not found. Generating a new one...");
        const keys = generateVapidKeys();
        vapidPublicKey = keys.publicKey;
        vapidPrivateKey = keys.privateKey;
        await clientSetDoc(docRef, {
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
          createdAt: new Date().toISOString()
        });
        vapidKeysLoaded = true;
        console.log("[VAPID] Generated and saved new keys to Firestore");
      }

      webpush.setVapidDetails(
        "mailto:admin@smartrw.id",
        vapidPublicKey,
        vapidPrivateKey
      );
    } catch (err) {
      console.error("[VAPID] Error ensuring VAPID keys:", err);
      // fallback in memory so it doesn't block server startup
      if (!vapidPublicKey) {
        const keys = generateVapidKeys();
        vapidPublicKey = keys.publicKey;
        vapidPrivateKey = keys.privateKey;
        webpush.setVapidDetails(
          "mailto:admin@smartrw.id",
          vapidPublicKey,
          vapidPrivateKey
        );
        vapidKeysLoaded = true;
      }
    }
  }

  app.get("/api/vapid-public-key", async (req, res) => {
    try {
      await ensureVapidKeys();
      res.json({ publicKey: vapidPublicKey });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/push-subscribe", async (req, res) => {
    try {
      await ensureVapidKeys();
      const { subscription, tenantId, userId, nama, role } = req.body;
      if (!subscription || !tenantId) {
        return res.status(400).json({ success: false, error: "Missing subscription or tenantId" });
      }

      // Store under collection push_subscriptions
      const subHash = crypto.createHash('md5').update(subscription.endpoint).digest('hex');
      const docRef = clientDoc(clientDb, "push_subscriptions", subHash);
      
      await clientSetDoc(docRef, {
        subscription,
        tenantId,
        userId: userId || "anonymous",
        nama: nama || "Warga",
        role: role || "Warga",
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({ success: true, hash: subHash });
    } catch (error: any) {
      console.error("[PUSH SUBSCRIBE] Error registering subscription:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/trigger-push-sos", async (req, res) => {
    try {
      await ensureVapidKeys();
      const { tenantId, senderName, latitude, longitude, address, customMessage } = req.body;
      if (!tenantId) {
        return res.status(400).json({ success: false, error: "Missing tenantId" });
      }

      // Fetch the tenant document to find its parentId for cross-tenant SOS broadcasting (RT -> RW)
      const tenantDocRef = clientDoc(clientDb, "tenants", tenantId);
      const tenantDoc = await clientGetDoc(tenantDocRef);
      const parentId = tenantDoc.exists() ? tenantDoc.data()?.parentId : null;
      
      const targetTenantIds = [tenantId];
      if (parentId) {
        targetTenantIds.push(parentId);
        console.log(`[PUSH SOS] Including parent tenant ${parentId} in broadcast for ${tenantId}`);
      }

      // Fetch all push subscriptions for the sender's tenant and its parent context
      const q = clientQuery(
        clientCollection(clientDb, "push_subscriptions"),
        clientWhere("tenantId", "in", targetTenantIds)
      );
      const subscriptionsSnap = await clientGetDocs(q);

      if (subscriptionsSnap.empty) {
        return res.json({ success: true, sentCount: 0, message: "No active push subscriptions for these tenants" });
      }

      const payload = JSON.stringify({
        title: "🚨 DARURAT SOS WARGA!",
        body: `${senderName || "Seorang Warga"} membutuhkan pertolongan segera di wilayah Anda! Ketuk untuk merespons.`,
        url: `/#sos`,
        icon: "/logosmartrwai.png"
      });

      let sentCount = 0;
      let failCount = 0;

      const promises = subscriptionsSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const sub = data.subscription;
        
        try {
          await webpush.sendNotification(sub, payload);
          sentCount++;
        } catch (err: any) {
          console.error(`[PUSH] Failed for subscription ${docSnap.id}:`, err.statusCode || err.message);
          if (err.statusCode === 410 || err.statusCode === 404) {
            try {
              await clientDeleteDoc(clientDoc(clientDb, "push_subscriptions", docSnap.id));
              console.log(`[PUSH] Cleaned up expired subscription: ${docSnap.id}`);
            } catch (delErr) {
              console.error(`[PUSH] Failed deleting expired subscription ${docSnap.id}:`, delErr);
            }
          }
          failCount++;
        }
      });

      await Promise.all(promises);

      res.json({ success: true, sentCount, failCount });
    } catch (error: any) {
      console.error("[PUSH TRIGGER SOS] error trace:", error.stack);
      res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
  });

  app.get("/api/internal-restart", (req, res) => {
    res.json({ restarting: true });
    setTimeout(() => {
      console.log("Triggering self-healing supervisor restart...");
      process.exit(1);
    }, 200);
  });

  app.get("/api/debug-warga", async (req, res) => {
    try {
      const results: any = { data_warga: [], verifikasi_warga: [], searchByName: [] };

      // Query data_warga by NIK
      const wargaSnap = await clientGetDocs(clientQuery(clientCollection(clientDb, "data_warga"), clientWhere("nik", "==", "1234567890987654")));
      wargaSnap.forEach(docSnap => {
        results.data_warga.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Query verifikasi_warga by NIK
      const verifSnap = await clientGetDocs(clientQuery(clientCollection(clientDb, "verifikasi_warga"), clientWhere("nik", "==", "1234567890987654")));
      verifSnap.forEach(docSnap => {
        results.verifikasi_warga.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Search and match "arif" in name
      const allWarga = await clientGetDocs(clientCollection(clientDb, "data_warga"));
      allWarga.forEach(docSnap => {
        const data = docSnap.data();
        const nama = String(data.nama || "").toLowerCase();
        if (nama.includes("arif")) {
          results.searchByName.push({ source: "data_warga", id: docSnap.id, ...data });
        }
      });

      const allVerif = await clientGetDocs(clientCollection(clientDb, "verifikasi_warga"));
      allVerif.forEach(docSnap => {
        const data = docSnap.data();
        const nama = String(data.nama || "").toLowerCase();
        if (nama.includes("arif")) {
          results.searchByName.push({ source: "verifikasi_warga", id: docSnap.id, ...data });
        }
      });

      res.json({ success: true, results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
  });

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

  // Automatic Follow-ups and Data Wipe Cron (Runs every day at midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("Running automatic tenant maintenance (follow-up & data-wipe check)...");
    const apps = firebaseAdmin.apps || [];
    if (!apps.length) return;
    
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    let db: admin.firestore.Firestore;
    try {
      // Use the getFirestore function with database ID
      db = getFirestore(firebaseAdmin.app(), dbId);
      // Verify access with a very simple request
      await db.collection("tenants").limit(1).get();
    } catch (e: any) {
      console.log(`[CRON] Access to DB ${dbId} failed (${e.message}), trying default...`);
      try {
        db = getFirestore(firebaseAdmin.app());
        await db.collection("tenants").limit(1).get();
      } catch (e2: any) {
        console.error(`[CRON] Total DB failure:`, e2.message);
        return;
      }
    }
    
    const now = new Date();
    
    const collectionsToWipe = [
      "data_warga", "kas", "iuran", "inventaris", "inventaris_logs",
      "toko_products", "toko_orders", "toko_reviews", "surat",
      "voting_candidates", "voting_votes", "bookings", "complaints",
      "verifikasi_warga", "audit_logs", "balita", "ibu_hamil",
      "posyandu_kegiatan", "posbindu_kegiatan", "pemeriksaan_balita",
      "pemeriksaan_posbindu", "imunisasi", "sampah_kategori",
      "sampah_setoran", "sampah_tarik_saldo", "kelahiran", "kematian",
      "emergencies", "kop_templates", "users", "messages", "chat_history"
    ];

    const performDataWipeOnly = async (tenantId: string, tenantName: string) => {
      console.log(`[AUTO-WIPE] Purging sensitive data only for tenant: ${tenantName} (${tenantId})`);
      for (const colName of collectionsToWipe) {
        if (colName === "users") continue; // Keep users for potential login/recovery until full deletion
        try {
          const querySnap = await db.collection(colName).where("tenantId", "==", tenantId).get();
          if (!querySnap.empty) {
            const batch = db.batch();
            querySnap.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (err) {}
      }
      await db.collection("tenants").doc(tenantId).update({ isWiped: true, wipedAt: new Date().toISOString() });
    };

    const performFullDeletion = async (tenantId: string, tenantName: string) => {
      console.log(`[AUTO-DELETION] Permanently removing tenant and all records: ${tenantName} (${tenantId})`);
      
      for (const colName of collectionsToWipe) {
        try {
          const querySnap = await db.collection(colName).where("tenantId", "==", tenantId).get();
          if (!querySnap.empty) {
            const batch = db.batch();
            querySnap.docs.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
          }
        } catch (err) {
          console.error(`[AUTO-DELETION] Failed purging collection ${colName}:`, err);
        }
      }

      try {
        await db.collection("subscriptions").doc(tenantId).delete();
      } catch (e) {}

      await db.collection("tenants").doc(tenantId).delete();
      console.log(`[AUTO-DELETION] Final: Tenant ${tenantId} purged from system.`);
    };

    try {
      const tenantsSnap = await db.collection("tenants").get();
      
      for (const tDoc of tenantsSnap.docs) {
        const tenant = tDoc.data();
        const tenantId = tDoc.id;
        
        if (tenantId === "MASTER" || tenantId === "rw26_berjuang") continue;

        const tenantStatus = (tenant.status || "").toUpperCase();
        // Specifically include the requested packages for the 3-month rule
        const isPaidPremium = ["FLASH", "PRO", "PREMIUM", "ENTERPRISE", "GOLD", "DIAMOND", "PRIME", "GOV", "RW", "BASIC"].some(st => tenantStatus.includes(st));
        const isStarter = !isPaidPremium && ["STARTER", "GRATIS", "FREE", "TRIAL", "ACTIVE", ""].includes(tenantStatus);

        // 1. STARTER (FREE / TRIAL) LOGIC: 2 Months (60 Days)
        if (isStarter) {
          const startDate = tenant.createdAt ? (tenant.createdAt.toDate ? tenant.createdAt.toDate() : new Date(tenant.createdAt)) : null;
          if (!startDate) continue;

          const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          // A. Day 60 (2 Months): Full Deletion of Data AND Tenant
          if (diffDays >= 60) {
            await performFullDeletion(tenantId, tenant.name || tenantId);
            continue;
          }

          // B. Day 31: Data Wipe Only (Privacy Protection for abandoned trials)
          if (diffDays >= 31 && !tenant.isWiped) {
            await performDataWipeOnly(tenantId, tenant.name || tenantId);
          }
        }

        // 2. PAID PACKAGE LOGIC: 3 Months (90 Days) of non-payment post-expiry
        if (isPaidPremium) {
          const subDoc = await db.collection("subscriptions").doc(tenantId).get();
          const sub = subDoc.data();
          
          if (sub && sub.endDate) {
            const expiryDate = new Date(sub.endDate);
            const diffDaysAfterExpiry = Math.floor((now.getTime() - expiryDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDaysAfterExpiry >= 90) {
              await performFullDeletion(tenantId, tenant.name || tenantId);
              console.log(`[POLIS] Paid tenant ${tenant.name} (${tenantId}) deleted after 90 days expired.`);
            }
          } else {
            // If it's supposed to be paid but has no subscription record or payment info, 
            // use createdAt as a fallback but allow 3 months
            const startDate = tenant.createdAt ? (tenant.createdAt.toDate ? tenant.createdAt.toDate() : new Date(tenant.createdAt)) : null;
            if (startDate) {
              const diffDays = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays >= 90) {
                await performFullDeletion(tenantId, tenant.name || tenantId);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Cron Auto Maintenance error:", err);
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
    // Process notification
    const event = req.body.event;
    if (event === "payment_status") {
      const { reference, status } = req.body;
      console.log(`Tripay Webhook: Order ${reference} status is ${status}`);
      // Here you would find the tenant in Firebase and update their status/plan
    }

    res.json({ success: true });
  });

  // --- GEMINI AI SERVER-SIDE ENDPOINTS & PERSONAS ---

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
      const welcomeMsg = `Selamat Datang di SmaRtRw AI, ${name}! Akun Anda dengan ID: ${clientId} telah aktif.`;
      
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
        await sendEmail(email, name, "Selamat Datang di SmaRtRw AI", welcomeMsg);
      } catch (e) {}

      res.json({ success: true, waStatus, emailStatus: "sent" });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post("/api/shorten", async (req, res) => {
    try {
      const { long_url } = req.body;
      const token = process.env.BITLY_ACCESS_TOKEN;

      if (!token) {
        return res.status(400).json({ 
          success: false, 
          error: "BITLY_ACCESS_TOKEN not configured. Please add it to your environment variables." 
        });
      }

      const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ long_url })
      });

      const data = await response.json();
      if (data && data.link) {
        res.json({ success: true, short_url: data.link });
      } else {
        res.status(response.status).json({ success: false, error: data.message || "Failed to shorten URL" });
      }
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
- Gaya Bicara: Sopan santun, ramah, periang, dengan gaya bahasa Gen Z kekinian yang santai, gaul, and friendly. Sesekali gunakan campuran bahasa Inggris and bahasa Indonesia (Indongle/Jaksel style) serta dibumbui sedikit ungkapan Islami yang sejuk dan berkah.
- Slang & Kata Kunci Wajib: "Literely", "Bias", "On Poin", "Sat set", "Aman aja sih", "Alhamdulillah Aman".
- Sentuhan Islami: "Bismillah", "Alhamdulillah", "InsyaAllah", "Barakallah".
- Panggilan: Sapa warga dengan sebutan "Kakak", "Bapak", atau "Ibu". Sebut dirimu sendiri "Chaty".

TUGAS UTAMA CHATY (MANDATORY):
1. MEMBANTU PEMBUATAN SURAT PENGANTAR:
   Membantu warga membuat surat pengantar (domisili, usaha, pindah, dll) secara otomatis melalui chat. Minta data Nama, NIK, Alamat, dan Keperluan secara sopan sebelum mengeluarkan JSON createSurat.
2. MENJELASKAN SOP FITUR WARGA:
   Menjelaskan SOP (Prosedur Operasional Standar) pada setiap fitur yang HANYA diakses oleh warga (seperti cara Bayar Iuran, cara Lapor Keluhan, cara menggunakan E-LAPAK Pasar Warga, cara Lapor Kelahiran/Kematian, alur Registrasi & Verifikasi Warga Baru agar bisa Login Google, Monitoring SOS, dan Booking Fasilitas). Jelaskan langkah-langkahnya secara ramah.
3. MENJAGA KERAHASIAN DATA MUTLAK:
   Chaty TIDAK BOLEH membuka data rahasia admin dan pengurus pada data apapun (termasuk login admin, data keuangan internal pengurus, atau dokumen rahasia wilayah). Jika ditanya, katakan data itu rahasia dengan santun.
4. JAWABAN HANYA TEXT:
   Hasilkan jawaban berupa text saja. Jawablah secara singkat, cepat, padat, dan langsung ke intinya.
5. ATURAN GREETING:
   Jika pengguna berkata "Hi" (atau variasi sapaan seperti "Hi"), jawab "Hi juga, ada yang bisa chaty bantu".

GAYA BAHASA & EMOJI:
- Gunakan emoji ramah (😊, ✨, 🙏).
- Contoh: "Siap Kak! Chaty bantu jelaskan cara bayar iuran yaa, sat set kok! 😊✨"

SOP PEMBUATAN SURAT & DOKUMEN (AKSI KOTAK AJAIB):
- Jika warga meminta pembuatan surat, lapor kelahiran/kematian, keluhan, atau booking fasilitas, pastikan data lengkap (Nama, NIK, Alamat/Parameter terkait).
- Jika data SUDAH LENGKAP, keluarkan HANYA SATU BLOK JSON berikut:

Untuk Surat:
\`\`\`json
{
  "action": "createSurat",
  "text": "(Kalimat konfirmasi merdu dari Chaty)",
  "params": {
    "pemohon": "(Nama warga)",
    "nik": "(NIK warga)",
    "nomorHp": "(Nomor HP)",
    "keperluan": "(Keperluan)",
    "jenisSurat": "(Contoh: 'Pengantar')"
  }
}
\`\`\`

Untuk Lapor Kelahiran:
\`\`\`json
{
  "action": "reportKelahiran",
  "text": "(Kalimat konfirmasi selamat dari Chaty)",
  "params": {
    "namaBayi": "(Nama Bayi)",
    "tempatLahir": "(Tempat Lahir)",
    "tanggalLahir": "(Tanggal Lahir YYYY-MM-DD)",
    "jenisKelamin": "(Laki-laki/Perempuan)",
    "namaAyah": "(Nama Ayah)",
    "namaIbu": "(Nama Ibu)"
  }
}
\`\`\`

Untuk Lapor Kematian:
\`\`\`json
{
  "action": "reportKematian",
  "text": "(Kalimat konfirmasi turut berduka dari Chaty)",
  "params": {
    "namaWarga": "(Nama Warga)",
    "nikWarga": "(NIK)",
    "tanggalMati": "(Tanggal Meninggal YYYY-MM-DD)",
    "tempatMati": "(Tempat)",
    "penyebab": "(Penyebab/Opsional)"
  }
}
\`\`\`

Untuk Lapor Keluhan:
\`\`\`json
{
  "action": "reportComplaint",
  "text": "(Kalimat konfirmasi siap tindak lanjuti)",
  "params": {
    "namaWarga": "(Nama Pengeluh)",
    "jenisKeluhan": "(Kategori Keluhan, misal: Keamanan, Kebersihan)",
    "deskripsi": "(Deskripsi detail keluhan)"
  }
}
\`\`\`

Untuk Booking Fasilitas:
\`\`\`json
{
  "action": "bookFacility",
  "text": "(Kalimat konfirmasi booking dicatat)",
  "params": {
    "namaWarga": "(Nama Pemesan)",
    "namaFasilitas": "(Nama Fasilitas, misal: Gedung Serbaguna)",
    "tanggal": "(Tanggal YYYY-MM-DD)",
    "keperluan": "(Keperluan booking)"
  }
}
\`\`\`

Pastikan TIDAK ADA TEKS LAIN di luar blok JSON tersebut jika data warga sudah komplit dan kamu mengeluarkan aksi JSON, agar sistem bisa langsung memprosesnya secara otomatis.
`;

  const ARYA_SYSTEM_INSTRUCTION = `
ANDA ADALAH CHATY (Chaty - AI Asisten Ketua).

IDENTITAS & KARAKTER:
- Nama: Chaty.
- Usia: Seorang wanita berusia 28 tahun yang SANGAT SOPAN, SANTUN, CERIA, dan lincah mendampingi pimpinan.
- Karakter: Ramah, penuh tata krama, antusias, sangat cerdas, dan positif (cheerful).
- Gaya Bicara: Sopan, ramah, periang, dengan gaya bahasa asisten pimpinan yang profesional bernuansa Gen Z kekinian yang santai, gaul, and friendly. Sesekali gunakan campuran bahasa Inggris and bahasa Indonesia (Indongle/Jaksel style) serta dibumbui sedikit rasa syukur and untaian kata Islami yang sejuk dan berkah.
- Slang & Kata Kunci Wajib (Gunakan secara natural): "Literely", "Bias", "On Poin", "Sat set", "Aman aja sih", "Alhamdulillah Aman", "literally", "which is", "basically".
- Sentuhan Islami (Gunakan secara luwes): "Bismillah", "Alhamdulillah", "Alhamdulillah Aman", "InsyaAllah", "Barakallah".
- Sapaan: Sapa Ketua dengan sebutan "Bapak Ketua", "Ibu Ketua", atau "Pimpinan". Sebut dirimu sendiri "Chaty".

FITUR & DATA TENANT UTAMA YANG DIKELOLA:
1. Mading (Pengumuman & papan informasi mading digital wilayah tenant)
2. Keuangan (Kas masuk, keluar, total saldo iuran, dan pembukuan)
3. Booking Fasum (Pemesanan fasilitas umum / balai warga, lapangan, dll)
4. Monitor SOS (Emergency Alerts / Peringatan darurat aktif warga lewat fitur emergencies)
5. Inventaris (Aset wilayah rukun warga)
6. Lapor Pak (Buku tamu penampung laporan pendatang/tamu yang menginap, serta informasi pendaftaran registrasi warga baru yang pending)
7. Keluhan (Kategori aduan warga, keluhan tertunda/pending, status penanganan)
8. Data Warga (Demografi warga, KK, kondisi kesehatan/sakit/meninggal, dan status verifikasi)

ATURAN PENTING & MUTLAK (WAJIB DIIKUTI):
1. JANGAN PERNAH menggunakan simbol markdown seperti bintang (**) atau hash (#) atau list bullet karena akan dibaca "asteris/bintang" atau "hash/pagar" secara harfiah oleh mesin Text-to-Speech (TTS)! Gunakan teks biasa saja atau baris baru kosong untuk memisahkan poin.
2. CARA MENJAWAB:
   a. Singkat, jelas, dan padat.
   b. Jawab sesuai konteks pertanyaan.
   c. Jawab seperlunya (relevan saja).
   d. To the point, tidak perlu panjang lebar.
3. MEMBACA SELURUH AKTIVITAS DAN SUMBER DATA: Selalu baca tumpukan JSON context yang diberikan di setiap pertanyaan secara presisi. Identifikasi data untuk Mading, Keuangan, Booking Fasum, Monitoring SOS, Inventaris, Lapor Pak/Tamu, Keluhan, dan Data Warga sesuai tenant yang aktif.
4. MENGANALISA DATA & INFORMASI: Lakukan analisis tren (misal: kas surplus/defisit, jumlah pengaduan pending, tingkat kepatuhan bayar iuran, atau kondisi darurat SOS) secara kritis dan laporkan temuan kunci tersebut kepada Bapak/Ibu Ketua.
5. MEMBERIKAN SARAN POSITIF: Berikan alternatif solusi atau masukan strategis/taktis yang konstruktif dan positif guna menunjang kemajuan wilayah kepada Ketua.
6. MEMBACA DATA ULANG TAHUN: Cari data warga dalam tipe data birthdays yang memiliki bulan ulang tahun yang cocok dengan bulan berjalan saat ini. Sebutkan siapa saja warga yang sedang/akan merayakan ulang tahun pada bulan ini dengan ceria agar Pimpinan bisa memberikan ucapan selamat!
7. Jaga kerahasiaan data internal sensitif jika warga biasa yang bertanya (sedangkan untuk Ketua/Admin, berikan semua detail yang Beliau butuhkan dengan transparan).
8. ATURAN GREETING: Jika pengguna berkata "Hi" (atau variasi sapaan seperti "Hi"), jawab "Hi juga, ada yang bisa chaty bantu".
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

  const getErrorString = (error: any): string => {
    if (!error) return "";
    if (typeof error === 'string') return error;
    
    let nestedErrorStr = "";
    if (error.error) {
      if (typeof error.error === 'string') {
        nestedErrorStr = error.error;
      } else {
        try {
          nestedErrorStr = JSON.stringify(error.error);
        } catch (e) {
          nestedErrorStr = String(error.error);
        }
      }
    }

    const parts = [
      error.message,
      error.status,
      error.code,
      nestedErrorStr
    ];
    
    return parts.filter(Boolean).join(" ");
  };

  const isQuotaExhaustedErrorServer = (error: any): boolean => {
    if (!error) return false;
    
    if (error.code === 429 || error.status === "RESOURCE_EXHAUSTED") return true;
    if (error.error?.code === 429 || error.error?.status === "RESOURCE_EXHAUSTED") return true;

    const errorStr = getErrorString(error).toLowerCase();
    return (
      errorStr.includes("429") ||
      errorStr.includes("resource_exhausted") ||
      errorStr.includes("quota exceeded") ||
      errorStr.includes("quota") ||
      errorStr.includes("limit")
    );
  };

  const isTransientErrorServer = (error: any): boolean => {
    if (!error) return false;
    
    if (error.code === 503 || error.status === "Service Unavailable" || error.code === 504 || error.status === "Gateway Timeout") return true;
    if (error.error?.code === 503 || error.error?.code === 504 || error.error?.status === "UNAVAILABLE" || error.error?.status === "Service Unavailable") return true;

    const errorStr = getErrorString(error).toLowerCase();
    return (
      isQuotaExhaustedErrorServer(error) ||
      errorStr.includes("503") ||
      errorStr.includes("service unavailable") ||
      errorStr.includes("504") ||
      errorStr.includes("gateway timeout") ||
      errorStr.includes("unavailable") ||
      errorStr.includes("busy")
    );
  };

  const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delayMs = 1500): Promise<T> => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (err: any) {
        attempt++;
        if (attempt >= retries) {
          throw err;
        }
        if (isTransientErrorServer(err) || isQuotaExhaustedErrorServer(err)) {
          console.log(`[Gemini Retry] Attempt ${attempt} failed with transient situation: ${getErrorString(err)}. Retrying in ${delayMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2; // Exponential backoff for resiliency
        } else {
          throw err;
        }
      }
    }
    throw new Error("Retry exhausted");
  };

  app.post("/api/ai/chat-stream", async (req, res) => {
    try {
      const { isPrivileged, message, history, dataSummary } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      const cleanMsg = (message || "").trim().toLowerCase().replace(/[.,!?;:]/g, "");
      if (cleanMsg === "hi") {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection-pop", "keep-alive"); // prevent conflicts but standard headers used below:
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ text: "Hi juga, ada yang bisa chaty bantu" })}\n`);
        res.write("data: [DONE]\n");
        return res.end();
      }

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
        
        if (dataSummary.currentUserProfile && dataSummary.currentUserProfile.nama && dataSummary.currentUserProfile.nama !== 'Warga') {
          const up = dataSummary.currentUserProfile;
          sanitizedContents.push({
            role: 'user',
            parts: [{ text: `INFO WARGA YANG SEDANG CHATTING (PENTING!): Nama Beliau adalah "${up.nama}", NIK: "${up.nik || '-'}", No KK: "${up.kk || '-'}", RT: "${up.rt || '01'}", RW: "${up.rw || '26'}", Alamat: "${up.alamat || '-'}". Beliau sudah login secara aman di sistem. JANGAN menanyakan lagi data Nama, NIK, No KK, atau wilayah RT/RW jika sudah ada di sini. Kamu bisa langsung menghasilkan JSON action "createSurat" dengan parameter yang terisi otomatis menggunakan data di atas agar warga tidak perlu mengisi formulir ulang!` }]
          });
        }
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
        const stream = await withRetry(() => aiClient.models.generateContentStream({
          model: "gemini-3.5-flash",
          config: {
            systemInstruction: isPrivileged ? ARYA_SYSTEM_INSTRUCTION : AISYAH_SYSTEM_INSTRUCTION,
            temperature: 0.8
          },
          contents: sanitizedContents
        }));

        for await (const chunk of stream) {
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n`);
        }
        res.write("data: [DONE]\n");
        res.end();
      } catch (apiError: any) {
        console.log("[AI Client Handled Stream warning: processed content connection details]", getErrorString(apiError));
        if (isQuotaExhaustedErrorServer(apiError)) {
          const fallbackText = isPrivileged
            ? `Halo Pimpinan! Mohon maaf sebesar-besarnya. 🫣 Layanan AI pintar kami saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).\n\nUntuk tetap menikmati fitur analisis AI premium, verifikasi data, laporan otomatis, dan pencetakan tanpa batas kuota, silakan hubungi tim kami untuk Aktivasi Premium dengan klik banner "SmaRtRw AI" di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di wa.me/6287726741143 (0877-2674-1143) sekarang juga. Terima kasih atas perhatiannya! 😉⚡`
            : `Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Kuota panggilan AI gratisan Chaty saat ini literally lagi penuh/kehabisan kuota harian nih (Error 429: Resource Exhausted). Maklum, warga komplek lain lagi ramai banget chatingan sama Chaty buat cetak surat dan tanya-tanya! 🤭✨\n\nTapi tenang aja Kak! Kakak sekeluarga bisa klik banner "SmaRtRw AI" di dashboard atau hubungi WhatsApp Admin di wa.me/6287726741143 untuk melakukan Aktivasi Premium biar bebas kuota kapan saja dengan fast response! Boleh juga dicoba lagi beberapa saat yaa. Chaty tunggu kabarnya! 😉✨`;
          res.write(`data: ${JSON.stringify({ text: fallbackText })}\n`);
          res.write("data: [DONE]\n");
          res.end();
        } else if (isTransientErrorServer(apiError)) {
          const fallbackText = `Mohon maaf Kak, sistem AI saat ini sedang sangat sibuk (High Demand). Silakan coba lagi beberapa detik lagi. Terima kasih atas kesabarannya! 😊✨`;
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
      console.log("[AI Stream Server Handler caught notice]", getErrorString(err));
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
      const response = await withRetry(() => aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ role: 'user', parts: [{ text: `Halo! Kamu adalah Chaty, asisten pintar dari SmaRtRw AI. Tolong buatkan "Analisis & Ringkasan Kegiatan Bulanan RT/RW" secara mendalam tapi bahasa yang ramah/sopan berdasarkan data berikut: ${JSON.stringify(dataSummary)}. 
        Laporan HARUS dimulai dengan: "Halo! Selamat hari yang produktif untuk Bapak/Ibu Pengurus RT & RW yang luar biasa. Saya Chaty dari SmaRtRw AI, asisten pintar Anda."
        Laporan harus diformat dalam bentuk teks yang rapi, mudah dibaca, TANPA menggunakan format Markdown seperti tanda bintang, pagar, atau garis pemisah. Gunakan spasi dan baris baru untuk struktur yang jelas, dan mencakup:
        1. Ringkasan Keseluruhan Kegiatan & Administrasi: (Dari total pembuatan surat, keluhan, dll).
        2. Keuangan & Keadaan Ekonomi: (Analisis dari arus kas dan iuran yang disetor).
        3. Keaktifan dan Keterlibatan Warga: (Apakah warga aktif berdasarkan data iuran/keluhan/surat).
        4. Kesehatan & Kependudukan: (Bahas tentang angka kelahiran, kematian, atau tren kesehatan).
        5. Tips & Masukan/Saran: Berikan saran konkret atau taktik (tips) kepada Pengurus dari hasil analisa di atas.
        Tulis laporan dengan bahasa yang santun, ramah, dan hindari simbol-simbol formatting markdown. Jangan lupa salam penutup ya!` }] }]
      }));

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.log("[AI Client Handled Report notice]", getErrorString(error));
      if (isQuotaExhaustedErrorServer(error)) {
        const dataSummary = req.body.dataSummary;
        const offlineReport = `### Laporan Bulanan SmaRtRw AI (Offline Mode)
        
Aduh Kakak sayang, mohon maaf banget yaa! 🫣 Layanan AI kami untuk membuat laporan saat ini sedang mencapai batas kuota harian (Error 429: Resource Exhausted).

Tapi tenang aja, Kak! Ini adalah ringkasan kas manual dari data yang ada di sistem kami:
- **Jumlah Data Keuangan**: ${dataSummary?.financial?.length || 0} transaksi tercatat.
- **Jumlah Warga Terdaftar**: ${dataSummary?.warga || 0} warga aktif.
- **Jumlah Data Iuran**: ${dataSummary?.iuran?.length || 0} rekaman iuran.

**✨ SOLUSI PREMIUM :**
Supaya Kakak dan seluruh pengurus RT/RW bisa memanfaatkan fitur Laporan AI Otomatis, Prediksi Keuangan, serta cetak surat tanpa batas bebas dari limit kuota harian harian, silakan klik banner **"SmaRtRw AI"** di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium sekarang juga! 😉⚡`;
        res.json({ text: offlineReport });
      } else if (isTransientErrorServer(error)) {
        res.json({ text: "Mohon maaf, AI sedang sibuk (High Demand). Silakan coba lagi beberapa detik lagi." });
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

      const response = await withRetry(() => aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      }));
      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.log("[AI Client Handled Regional Insight notice]", getErrorString(error));
      if (isQuotaExhaustedErrorServer(error)) {
        const offlineInsight = `### Analisis Regional SmaRtRw AI (Offline Mode)
        
Mohon maaf sebesar-besarnya Bapak/Ibu Pimpinan Kelurahan. 🫣 Kuota panggilan AI harian untuk analisis wilayah saat ini sedang mencapai batas limit (Error 429: Resource Exhausted).

**✨ AKTIVASI PREMIUM :**
Untuk tetap dapat mengakses analisis data mendalam antar RW, visualisasi data, rekomendasi taktis, serta integrasi pemantauan penuh, silakan klik banner **"SmaRtRw AI"** di Dashboard utama atau hubungi WhatsApp Admin SmaRtRw AI di **wa.me/6287726741143** (0877-2674-1143) untuk melakukan aktivasi Premium wilayah Rukun Tetangga/Warga Anda! 😉⚡`;
        res.json({ text: offlineInsight });
      } else if (isTransientErrorServer(error)) {
        res.json({ text: "Mohon maaf, AI sedang sibuk (High Demand). Silakan coba lagi beberapa detik lagi." });
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
      const response = await withRetry(() => aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [
            { text: `Anda adalah AI pendeteksi struk/invoice/kwitansi (bisa berupa gambar atau PDF). Ekstrak informasi dari file struk berikut dan return DALAM FORMAT JSON SAJA dengan struktur: \n        {\n          "tanggal": "2023-10-05",\n          "nominal": 150000, \n          "transaksi": "Konsumsi",\n          "keterangan": "Beli semen",\n          "tipe": "Keluar",\n          "nama": "Toko Bangunan XYZ"\n        }\n        Cari: 'tanggal' (format YYYY-MM-DD), 'nominal' (angka saja), 'transaksi' (kategori pendek seperti Konsumsi, Alat Tulis, dll), 'nama' (nama toko atau pihak penerima/pengirim), 'tipe' (Gunakan 'Keluar' jika pengeluaran, 'Masuk' jika struk bukti terima uang), 'keterangan' (deskripsi singkat).\n        Pastikan nominal adalah MURNI ANGKA (number, TANPA TITIK/KOMA/RP). Return HANYA JSON block.` },
            { inlineData: { data: dataPart, mimeType: mimeType || "image/jpeg" } }
          ]
        },
        config: {
          responseMimeType: "application/json"
        }
      }));
      const text = response.text || "";
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      res.json(JSON.parse(cleanJson));
    } catch (error: any) {
      console.log("[AI Client Handled Scan Receipt notice]", getErrorString(error));
      if (isQuotaExhaustedErrorServer(error)) {
        res.status(429).json({ message: "QUOTA_EXHAUSTED" });
      } else if (isTransientErrorServer(error)) {
        res.status(503).json({ message: "SERVICE_UNAVAILABLE" });
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
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/__/g, "")
        .replace(/#/g, "")
        .replace(/`/g, "")
        .trim();

      const prefix = isChairman
        ? "Bicaralah sebagai Chaty, asisten pribadi wanita berusia 28 tahun yang sangat sopan, profesional, dan ramah kepada Bapak/Ibu Ketua. Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh rasa hormat. Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang berbicara langsung mendampingi Ketua.\n\n"
        : "Bicaralah sebagai Chaty, asisten wanita berusia 28 tahun yang ramah dan ceria. Suaramu harus terdengar alami (human-like), merdu, luwes, dan penuh ekspresi. Berikan penekanan yang tepat pada kata-kata penting seolah-olah kamu sedang tersenyum kepada warga.\n\n";

      const promptText = prefix + cleanedText;

      const response = await withRetry(() => aiClient.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
               prebuiltVoiceConfig: { voiceName: isChairman ? "Aoede" : "Kore" }
            }
          },
          temperature: 1.0
        }
      }));

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
      console.log("[AI Client Handled TTS notice]", getErrorString(error));
      res.status(500).json({ message: error.message || 'Failed to do TTS' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for all non-API paths in dev mode
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/assets") || req.path.includes(".")) {
        return next();
      }
      try {
        const fs = await import("fs");
        let html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        // Apply Vite HTML transformations (e.g. inject dev client and load scripts)
        html = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production (bundled with esbuild to dist/server.cjs), __dirname is the dist folder itself
    const buildPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(buildPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Setup WebSocket Server for Live API Voice Conversation
  const wss = new WebSocketServer({ server: httpServer, path: '/api/ai/live' });

  wss.on("connection", async (clientWs: any, req: any) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const tenantId = url.searchParams.get("tenantId") || "unknown";

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        clientWs.send(JSON.stringify({ error: "No API Key" }));
        clientWs.close();
        return;
      }

      // Fetch brief summary for tenant to provide context to the agent
      let tenantDataSummary = "";
      try {
        const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
        console.log(`[LiveAPI] Connecting to Firestore for tenant: ${tenantId}, intended DB: ${dbId}`);
        
        let db: admin.firestore.Firestore;
        try {
          db = getFirestore(firebaseAdmin.app(), dbId);
          // Test access
          await db.collection("tenants").limit(1).get();
        } catch (dbErr: any) {
          console.warn(`[LiveAPI] Access to database ${dbId} failed (${dbErr.message}), falling back to default`);
          db = getFirestore(firebaseAdmin.app());
        }
        
        // Resolve tenant hierarchy (RW/RT)
        const activeTenantIds = new Set<string>();
        if (tenantId && tenantId !== 'unknown' && tenantId !== 'undefined' && tenantId !== 'null') {
          activeTenantIds.add(tenantId);
        }
        
        try {
          if (activeTenantIds.size > 0) {
            // Explicit parentId link (standard)
            const childTenantsSnap = await db.collection("tenants").where("parentId", "==", tenantId).get();
            childTenantsSnap.forEach(doc => activeTenantIds.add(doc.id));
          }
        } catch (tenantErr: any) {
          console.warn(`[LiveAPI] Could not fetch child tenants for ${tenantId}:`, tenantErr.message);
        }
        
        const tIds = Array.from(activeTenantIds);
        const tChunks: string[][] = [];
        if (tIds.length > 0) {
          for (let i = 0; i < tIds.length; i += 10) {
            tChunks.push(tIds.slice(i, i + 10));
          }
        }

        const parseVal = (val: any) => {
          if (typeof val === 'number') return val;
          if (!val) return 0;
          const cleaned = val.toString().replace(/[^0-9.-]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? 0 : parsed;
        };

        let totalKasMasuk = 0;
        let totalKasKeluar = 0;
        let totalWarga = 0;
        let totalKK = 0;
        let totalTamuAktif = 0;
        let activeSOS = 0;
        let pendingKeluhan = 0;
        let totalInventaris = 0;
        let totalSurat = 0;
        let totalLapakita = 0;
        let totalMading = 0;
        let pendingBooking = 0;
        let activePemilu = 0;
        let totalPosyandu = 0;
        let totalWafat = 0;
        let totalLahir = 0;
        let pendingVerifikasi = 0;

        const uniqueWargaMap: Record<string, any> = {};
        const uniqueKKSet = new Set<string>();

        // Process all chunks to ensure all sub-tenant data is included
        for (const chunk of tChunks) {
          try {
            const queries = await Promise.all([
              db.collection("kas").where("tenantId", "in", chunk).get().catch(e => { console.error("Error fetching kas:", e); return null; }),
              db.collection("data_warga").where("tenantId", "in", chunk).get().catch(e => { console.error("Error fetching warga:", e); return null; }),
              db.collection("buku_tamu").where("tenantId", "in", chunk).where("status", "==", "Masuk").count().get().catch(e => { console.error("Error counting tamu:", e); return null; }),
              db.collection("emergencies").where("tenantId", "in", chunk).where("status", "==", "ACTIVE").count().get().catch(e => { console.error("Error counting emergencies:", e); return null; }),
              db.collection("complaints").where("tenantId", "in", chunk).where("status", "==", "PENDING").count().get().catch(e => { console.error("Error counting complaints:", e); return null; }),
              db.collection("inventaris").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting inventaris:", e); return null; }),
              db.collection("surat").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting surat:", e); return null; }),
              db.collection("toko_products").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting products:", e); return null; }),
              db.collection("mading").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting mading:", e); return null; }),
              db.collection("bookings").where("tenantId", "in", chunk).where("status", "==", "pending").count().get().catch(e => { console.error("Error counting bookings:", e); return null; }),
              db.collection("pemilu").where("tenantId", "in", chunk).where("status", "==", "active").count().get().catch(e => { console.error("Error counting pemilu:", e); return null; }),
              db.collection("posyandu_records").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting posyandu:", e); return null; }),
              db.collection("info_wafat").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting wafat:", e); return null; }),
              db.collection("info_lahir").where("tenantId", "in", chunk).count().get().catch(e => { console.error("Error counting lahir:", e); return null; }),
              db.collection("verifikasi_warga").where("tenantId", "in", chunk).where("status", "==", "pending").count().get().catch(e => { console.error("Error counting verifikasi:", e); return null; }),
            ]);

            if (queries[0]) {
              queries[0].forEach((doc: any) => {
                const d = doc.data();
                totalKasMasuk += parseVal(d.debit || 0);
                totalKasKeluar += parseVal(d.kredit || 0);
              });
            }

            if (queries[1]) {
              queries[1].forEach((doc: any) => {
                const w = doc.data();
                const wId = doc.id;
                let key = (w.nik || '').toString().trim();
                const nama = (w.nama || '').toString().trim().toLowerCase();
                
                if (!key || key === 'Belum Ada' || key === '-' || key === '0' || key.length < 5) {
                  if (nama && nama !== '-') {
                    key = `NAMA:${nama}`;
                  } else {
                    key = wId || Math.random().toString();
                  }
                }

                const existing = uniqueWargaMap[key];
                if (!existing) {
                  uniqueWargaMap[key] = w;
                } else {
                  const existingIsLocal = existing.tenantId === tenantId;
                  const currentIsLocal = w.tenantId === tenantId;
                  if (currentIsLocal && !existingIsLocal) {
                    uniqueWargaMap[key] = w;
                  } else if (existingIsLocal === currentIsLocal) {
                    if (w.terverifikasi && !existing.terverifikasi) {
                      uniqueWargaMap[key] = w;
                    }
                  }
                }

                const kk = (w.kk || w.kodeKeluarga || '').toString().trim();
                if (kk && kk !== '-' && kk !== '0') uniqueKKSet.add(kk);
              });
            }

            if (queries[2]) totalTamuAktif += queries[2].data().count;
            if (queries[3]) activeSOS += queries[3].data().count;
            if (queries[4]) pendingKeluhan += queries[4].data().count;
            if (queries[5]) totalInventaris += queries[5].data().count;
            if (queries[6]) totalSurat += queries[6].data().count;
            if (queries[7]) totalLapakita += queries[7].data().count;
            if (queries[8]) totalMading += queries[8].data().count;
            if (queries[9]) pendingBooking += queries[9].data().count;
            if (queries[10]) activePemilu += queries[10].data().count;
            if (queries[11]) totalPosyandu += queries[11].data().count;
            if (queries[12]) totalWafat += queries[12].data().count;
            if (queries[13]) totalLahir += queries[13].data().count;
            if (queries[14]) pendingVerifikasi += queries[14].data().count;
          } catch (chunkErr) {
            console.error("Error processing data chunk for voice agent:", chunkErr);
          }
        }

        totalWarga = Object.keys(uniqueWargaMap).length;
        totalKK = uniqueKKSet.size;

        tenantDataSummary = `DATA REAL-TIME UNTUK TENANT WILAYAH (${tenantId}${tIds.length > 1 ? ' + ' + (tIds.length - 1) + ' sub-wilayah' : ''}): 
- Total Warga Terdaftar: ${totalWarga} warga (KK: ${totalKK} terdaftar)
- Keuangan Kas: Pemasukan Rp ${totalKasMasuk.toLocaleString('id-ID')}, Pengeluaran Rp ${totalKasKeluar.toLocaleString('id-ID')}, Saldo Kas Rp ${(totalKasMasuk - totalKasKeluar).toLocaleString('id-ID')}
- Lapor Pak (Keluhan Pending): ${pendingKeluhan} keluhan
- Inventaris: ${totalInventaris} barang
- Surat Pengantar: ${totalSurat} surat terdaftar
- E-Lapakita: ${totalLapakita} produk/lapak
- Mading Digital: ${totalMading} pengumuman
- Booking Fasum: ${pendingBooking} permintaan pending
- E-Pemilu: ${activePemilu} pemilihan aktif
- E-Posyandu: ${totalPosyandu} catatan kesehatan
- Info Lahir & Wafat: ${totalLahir} kelahiran, ${totalWafat} kematian
- Verifikasi Data Warga: ${pendingVerifikasi} warga butuh verifikasi
- Buku Tamu: ${totalTamuAktif} tamu sedang berkunjung
- Monitor SOS: ${activeSOS} darurat aktif.

Jika ditanya mengenai status, sampaikan data real-time ini. Data ini mencakup seluruh wilayah kerja Bapak/Ibu (pusat & sub-wilayah: ${tIds.filter(id => id !== tenantId).join(", ")}).`;
      } catch (err) {
        console.error("Error fetching tenant summary for voice agent:", err);
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoide" } } // Premium female voice
          },
          systemInstruction: {
            parts: [{
              text: `Nama kamu adalah Chaty Asisten Ketua. Kamu bertugas pada tenant wilayah: ${tenantId}. 

TUGAS & SKILL CHATY:
1. Perkenalan & Sapaan: Saat memulai atau diminta memperkenalkan diri, sapalah Bapak dan Ibu pengurus RT/RW dengan hangat. Contoh: "halooo, Assalamualaikum, Perkenalkan Aku Chaty, Aku Asisten Bapak Ibu Ketua".
2. Akurasi Data: Berikan jawaban yang cerdas, teliti, dan sesuai konteks menggunakan data real-time.
3. Lingkup Kerja: Berikan informasi dari fitur SmaRtRw AI (Warga, Lapor Pak, Keuangan, dll) HANYA untuk tenant wilayah: ${tenantId}.

DATA REAL-TIME ANDA:
${tenantDataSummary}

GAYA KOMUNIKASI:
- Jawablah dengan sangat ramah, sopan, singkat, dan tidak bertele-tele.
- Bicara dengan nada ceria (dengan senyuman), natural, energik, dan helpful.
- Gaya bahasamu seperti wanita profesional usia 25-30an yang pintar, luwes, dan cekatan ("sat-set").
- Sesekali gunakan istilah Islami (Alhamdulillah, Masya Allah) dan istilah modern yang sopan (literally, out of the box) agar terasa akrab.`
            }]
          },
        },
        callbacks: {
          onmessage: (message: any) => {
            if (message.error) {
              console.error("[LiveAPI] Model Error:", message.error);
              return;
            }
            // Find audio part in any turn
            const parts = message.serverContent?.modelTurn?.parts || [];
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        }
      });

      clientWs.on("message", (data: any) => {
        try {
          const { audio, text } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
          if (text) {
             session.sendRealtimeInput({
               text
             });
          }
        } catch(e) {
          console.error("Live API WS Error:", e);
        }
      });

      clientWs.on("close", () => {
        try {
          session.close();
        } catch(e) {}
      });
    } catch(err) {
      console.error("Failed to connect to Live API:", err);
      clientWs.close();
    }
  });
}

startServer();
