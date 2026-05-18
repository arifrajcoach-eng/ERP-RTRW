import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// 1. Mockup for Generate Midtrans Snap Token (Triggered via Callable Function)
// Ini dipanggil dari frontend saat user siap membayar
export const generateMidtransToken = async (data: any, context: any) => {
  // Hanya user yang login yang bisa membeli paket
  if (!context.auth) {
    throw new Error('Unauthenticated');
  }

  const { tenantId, plan, amount, customerDetails } = data;
  const orderId = `SUBS-${tenantId}-${Date.now()}`;

  // Siapkan parameter konfigurasi Midtrans
  const midtransHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Server Key Midtrans Anda dalam format base64
    'Authorization': 'Basic ' + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64'),
  };

  const requestBody = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount
    },
    customer_details: customerDetails,
    custom_field1: tenantId,
    custom_field2: plan
  };

  try {
    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: midtransHeaders,
      body: JSON.stringify(requestBody)
    });

    const snapData = await response.json();
    
    // Simpan data pending transaksi ke database
    await db.collection('transactions').doc(orderId).set({
      tenantId: tenantId,
      plan: plan,
      amount: amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      token: snapData.token
    });

    // Kembalikan token ke frontend untuk membuka Snap Popup
    return { token: snapData.token, orderId };
  } catch (error) {
    console.error('Midtrans API Error:', error);
    throw new Error('Failed to generate payment token');
  }
};

// 2. Mockup Webhook Midtrans (HTTP Trigger)
// Midtrans akan memanggil endpoint ini secara otomatis setelah pembayaran berhasil/gagal
export const midtransWebhook = async (req: any, res: any) => {
  try {
    const notification = req.body;
    
    // Verifikasi Webhook Signature Header untuk Keamanan
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const hashData = notification.order_id + notification.status_code + notification.gross_amount + serverKey;
    const expectedSignature = crypto.createHash('sha512').update(hashData).digest('hex');

    if (notification.signature_key !== expectedSignature) {
      return res.status(403).json({ message: 'Invalid Signature' });
    }

    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const orderId = notification.order_id;
    const tenantId = notification.custom_field1;
    const plan = notification.custom_field2;

    const transactionRef = db.collection('transactions').doc(orderId);
    
    // 3. Logika Update Status Pembayaran
    if (transactionStatus == 'capture') {
      if (fraudStatus == 'accept') {
        // Transaksi Kartu Kredit berhasil
        await handleSuccessfulPayment(tenantId, plan, orderId);
      }
    } else if (transactionStatus == 'settlement') {
      // Transaksi Berhasil (QRIS, GoPay, VA, dll)
      await handleSuccessfulPayment(tenantId, plan, orderId);
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      // Transaksi Gagal / Dibatalkan
      await transactionRef.update({
        status: 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else if (transactionStatus == 'pending') {
      // Pembayaran masih menunggu
      await transactionRef.update({
        status: 'pending'
      });
    }

    // Wajib memberikan respons 200 OK ke Midtrans
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 4. Helper Function untuk update status di Firestore
async function handleSuccessfulPayment(tenantId: string, plan: string, orderId: string) {
  const batch = db.batch();

  // A. Update status transaksi
  const transactionRef = db.collection('transactions').doc(orderId);
  batch.update(transactionRef, {
    status: 'success',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // B. Update status Tenant menjadi paket yang dibeli
  const tenantRef = db.collection('tenants').doc(tenantId);
  batch.update(tenantRef, {
    status: plan,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // C. Update atau Buat Histori Langganan (Subscriptions)
  // Misal masa aktif = 1 bulan (30 hari)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  const subscriptionRef = db.collection('subscriptions').doc(tenantId);
  batch.set(subscriptionRef, {
    tenantId: tenantId,
    status: 'Active',
    plan: plan,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    lastPaymentOrderId: orderId
  }, { merge: true });

  await batch.commit();
}
