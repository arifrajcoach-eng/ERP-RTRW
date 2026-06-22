import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, collection, getDocs, limit, query } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

console.log("Initializing client SDK...");
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  console.log("Attempting to read collection tenants...");
  try {
    const qSnap = await getDocs(query(collection(db, "tenants"), limit(1)));
    console.log("Success! Read size:", qSnap.size);
    qSnap.forEach(d => {
      console.log("Tenant document:", d.id, d.data());
    });
  } catch (err) {
    console.error("Error reading tenants:", err);
  }
}

run().then(() => {
  console.log("Exiting...");
  process.exit(0);
}).catch((err) => {
  console.error("Failure:", err);
  process.exit(1);
});
