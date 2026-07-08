import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY not found");
}

const db = admin.firestore();
const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
const firestore = admin.firestore(admin.app(), dbId);

async function migrate() {
    console.log("Starting migration...");
    const kasRef = firestore.collection('kas');
    // Using where('jenis', 'in', [...]) to catch old variations
    const snapshot = await kasRef.where('jenis', 'in', ['Warga Donasi Ke RW', 'Warga Donasi ke RW']).get();
    
    let count = 0;
    const batch = firestore.batch();
    
    for (const doc of snapshot.docs) {
        batch.update(doc.ref, { 
            jenis: 'Iuran Warga (Donasi) ke RW',
            status: 'Lunas' // Ensuring status is Lunas, as it's a contribution
        });
        count++;
        if (count % 500 === 0) {
            await batch.commit();
            console.log(`Committed batch of ${count}`);
        }
    }
    
    if (count > 0) {
        await batch.commit();
        console.log(`Migrated ${count} documents.`);
    } else {
        console.log("No documents found to migrate.");
    }
}

migrate().then(() => console.log("Done.")).catch(err => console.error(err));
