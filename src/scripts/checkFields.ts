import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

async function checkFields() {
    const q = query(collection(db, 'data_warga'), where('tenantId', '==', 'RW_BERJUANG'), limit(1));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
        console.log(JSON.stringify(doc.data(), null, 2));
    });
}
checkFields().then(() => console.log("Done")).catch(console.error);
