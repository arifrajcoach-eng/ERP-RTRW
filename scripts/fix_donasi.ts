
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

const db = firebaseAdmin.firestore(firebaseAdmin.app(), firebaseConfig.firestoreDatabaseId);

async function migrate() {
    console.log("Listing collections...");
    const collections = await db.listCollections();
    for (const collection of collections) {
        console.log("Found collection:", collection.id);
    }
}

migrate().then(() => console.log("Done.")).catch(err => console.error(err));
