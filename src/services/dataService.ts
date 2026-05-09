import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Logic-Cross-Reference
 * Verifies if a reference document exists in another collection.
 */
export async function crossReferenceExists(refPath: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, refPath, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (e) {
    console.error("Cross-reference check failed", e);
    return false;
  }
}

/**
 * Auto-Deduplication
 * Checks for a document based on a field value before creating it.
 */
export async function autoDeduplicate(collectionName: string, field: string, value: string): Promise<boolean> {
  try {
    const q = query(collection(db, collectionName), where(field, '==', value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if it already exists (duplicate found)
  } catch (e) {
    console.error("Deduplication check failed", e);
    return false;
  }
}

/**
 * Auto-Merge (Disabled as per user request to prevent automatic data modification)
 * Merges new data into an existing document.
 */
// export async function autoMerge(collectionName: string, docId: string, newData: any): Promise<void> {
//   try {
//     const docRef = doc(db, collectionName, docId);
//     await setDoc(docRef, newData, { merge: true });
//   } catch (e) {
//     console.error("Merge failed", e);
//     throw e;
//   }
// }
