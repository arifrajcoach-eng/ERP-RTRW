import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, where, query } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  try {
    const userCred = await signInAnonymously(auth);
    console.log("Signed in anonymously as", userCred.user.uid);
    const qSnap = await getDocs(query(collection(db, "data_warga")));
    console.log("Success! Read size:", qSnap.size);
    qSnap.forEach(d => {
      const data = d.data();
      console.log("Warga:", data.nama, "| posisi:", data.posisi, "| posisiKeluarga:", data.posisiKeluarga, "| status_keluarga:", data.status_keluarga);
    });
  } catch (err) {
    console.error("Error reading warga:", err);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
