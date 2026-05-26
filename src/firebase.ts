import { initializeApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  memoryLocalCache 
} from 'firebase/firestore';                
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Resilient cache configuration to handle restricted execution environments (such as sandboxed iframes)
let cacheConfig;
try {
  // Check if we are in a browser context and localStorage/IndexedDB is accessible and we are NOT in an iframe
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const hasStorage = typeof window !== 'undefined' && 'localStorage' in window;
  
  if (hasStorage && !isIframe) {
    cacheConfig = persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    });
  } else {
    // In iframe or Node, use memory cache to avoid IndexedDB lock hangs and timeouts
    console.log("Using memory cache for Firestore in restricted / iframe environment to prevent lock-driven timeouts");
    cacheConfig = memoryLocalCache();
  }
} catch (e) {
  console.warn("Firestore persistent cache is blocked, falling back to memory cache:", e);
  cacheConfig = memoryLocalCache();
}

// AI Studio uses Enterprise Firestore which requires the databaseId
// experimentalForceLongPolling is often needed in container environments
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  localCache: cacheConfig,
}, firebaseConfig.firestoreDatabaseId);                
console.log("DB Loaded with Firestore ID:", firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const storage = getStorage(app);
