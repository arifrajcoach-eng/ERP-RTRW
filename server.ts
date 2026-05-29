import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import emailjs from "@emailjs/nodejs";
import * as dotenv from "dotenv";
import crypto from "crypto";

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
