import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import cron from "node-cron";
import firebaseConfig from "./firebase-applet-config.json";

// Initialize admin
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
  }
  console.log("Firebase Admin project ID:", admin.app().options.projectId);
} catch (e) {
  console.error("Firebase Admin init failed:", e.message);
}
const db = admin.apps.length ? admin.firestore() : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Webhook: Payment received
  app.post("/api/payments/webhook", async (req, res) => {
    const { tenantId, status, plan, paymentProviderRef } = req.body;
    
    // For simplicity, 30 days active
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    try {
        await db.collection('subscriptions').doc(tenantId).set({
            tenantId,
            status: status === 'success' ? 'Active' : 'Inactive',
            plan,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            paymentProviderRef
        }, { merge: true });
        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
  });

  // Daily Reminder Bot (Runs at 00:00 every day)
  cron.schedule('0 0 * * *', async () => {
    const snapshot = await db.collection('subscriptions')
        .where('status', '==', 'Active')
        .where('endDate', '<', new Date().toISOString())
        .get();
    
    snapshot.forEach(async (doc) => {
        // Send reminders here (e.g., via notification collection)
        console.log(`Reminder sent to tenant: ${doc.id}`);
    });
  });

  // PPOB Revenue Sharing
  app.post("/api/ppob/transaction", async (req, res) => {
    const { total_paid, admin_fee, tenantId } = req.body;
    const share = admin_fee / 2;
    // Logic to save to Firestore would go here
    res.json({ status: 'success', share_owner: share, share_community: share });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();