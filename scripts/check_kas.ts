
import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

const firebaseAdmin = ((admin as any).default || admin) as typeof admin;
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Initialize Firebase Admin with default credentials
firebaseAdmin.initializeApp({
  projectId: firebaseConfig.projectId
});

const db = firebaseAdmin.firestore();

async function checkUserKas() {
    console.log("Checking kas for Achmad Syarif...");
    const kasRef = db.collection('kas');
    
    // Adjust this query if necessary. Looking for records that might be related to "Achmad Syarif"
    const snapshot = await kasRef.get();
    
    let count = 0;
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.namaPenyetor?.toLowerCase().includes("achmad syarif") || data.keterangan?.toLowerCase().includes("achmad syarif")) {
            console.log(`Doc ${doc.id}: ${JSON.stringify(data)}`);
            count++;
        }
    });
    
    console.log(`Found ${count} documents related to Achmad Syarif.`);
}

checkUserKas().then(() => console.log("Done.")).catch(err => console.error(err));
