import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

async function testApprove() {
  try {
     const uc = await signInWithEmailAndPassword(auth, "rt01@rw26.com", "rt01rw26");
     console.log("Logged In via Admin RT01", uc.user.uid)
     
     const tenantId = "rt01_rw26_berjuang"; // hardcoded tenantId

     // get a verifikasi_warga doc
     const vDocs = await getDocs(collection(db, "verifikasi_warga"));
     if (vDocs.empty) {
        console.log("No verifikasi data.");
        return;
     }

     const item = { id: vDocs.docs[0].id, ...vDocs.docs[0].data() } as any;
     console.log("Approving:", item.nik);

     const batch = writeBatch(db);
      const docId = item.id;
      if (!docId) throw new Error("ID data verifikasi tidak ditemukan.");

      const vRef = doc(db, 'verifikasi_warga', docId);
      const approveNote = 'Disetujui oleh admin';
      batch.update(vRef, {
        status: 'Disetujui',
        approvedAt: new Date().toISOString(),
        approvedBy: 'Admin',
        catatan: approveNote
      });

      const standardDocId = `${tenantId}_${item.nik}`;
      const targetRef = doc(db, 'data_warga', standardDocId);
      const targetSnap = await getDoc(targetRef);
      
      const legacyRef = doc(db, 'data_warga', item.nik);
      const legacySnap = (item.nik !== standardDocId) ? await getDoc(legacyRef) : null;
      const legacyData = legacySnap?.exists() ? legacySnap.data() : null;

      const updatedData = {
        nama: item.nama || targetSnap.data()?.nama || legacyData?.nama || "",
        kk: item.kk || targetSnap.data()?.kk || legacyData?.kk || "",
        terverifikasi: true,
        keteranganVerifikasi: approveNote,
        updatedAt: new Date().toISOString()
      };

      batch.set(targetRef, {
        tenantId: tenantId,
        status: 'Warga Tetap',
        ...updatedData
      }, { merge: true });

      if (legacySnap?.exists() && standardDocId !== item.nik) {
        batch.delete(legacyRef);
      }

      await batch.commit();
      console.log("Done approve!");

  } catch (e: any) {
    console.error(e)
  }
}
testApprove();
