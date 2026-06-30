import admin from "firebase-admin";
import firebaseConfig from "../firebase-applet-config.json";

const app = admin.initializeApp({
  projectId: firebaseConfig.projectId
});

const db = new admin.firestore.Firestore({
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId
});

async function run() {
  const usersRef = db.collection("users");
  const users = await usersRef.where("email", "==", "arifrajcoach@gmail.com").get(); // The user email from metadata
  
  if (users.empty) {
    console.log("No user found with email arifrajcoach@gmail.com");
  } else {
    users.forEach(doc => {
      console.log(`User ID: ${doc.id}`);
      console.log(`Role: ${doc.data().role}`);
      console.log(`TenantId: ${doc.data().tenantId}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }
}

run().catch(console.error);
