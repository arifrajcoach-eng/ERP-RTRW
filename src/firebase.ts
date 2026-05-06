import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';                
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);                
console.log("DB Loaded:", db);
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const storage = getStorage(app);
