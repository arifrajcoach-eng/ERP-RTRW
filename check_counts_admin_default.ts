
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

async function checkCounts() {
  // Try default initialization
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  
  // Try default database first
  const db = getFirestore();
  
  const tenants = [
    "rw26_berjuang",
    "rt01_rw26_berjuang",
    "rt02_rw26_berjuang",
    "rt03_rw26_berjuang",
    "rt04_rw26_berjuang",
    "rt05_rw26_berjuang"
  ];

  console.log("Checking counts via Admin SDK (Default DB)...");
  
  for (const tenantId of tenants) {
    try {
      const q = db.collection('data_warga').where('tenantId', '==', tenantId);
      const snapshot = await q.get();
      console.log(`Tenant: ${tenantId} -> Count: ${snapshot.size}`);
    } catch (error: any) {
      console.error(`Error for ${tenantId}:`, error.message);
    }
  }
}

checkCounts();
