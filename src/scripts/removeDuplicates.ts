import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function removeDuplicates() {
    const tenantIds = ['RW_BERJUANG', 'rw26_berjuang'];
    const q = query(collection(db, 'data_warga'), where('tenantId', 'in', tenantIds));
    const querySnapshot = await getDocs(q);

    const wargaMap = new Map<string, any[]>();

    querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (data.nik) {
            if (!wargaMap.has(data.nik)) {
                wargaMap.set(data.nik, []);
            }
            wargaMap.get(data.nik)!.push({ id: docSnapshot.id, ...data });
        }
    });

    for (const [nik, docs] of wargaMap.entries()) {
        if (docs.length > 1) {
            console.log(`Found duplicates for NIK ${nik}: ${docs.length} docs`);
            // Sort docs by number of keys (as a proxy for completeness)
            docs.sort((a, b) => Object.keys(b).length - Object.keys(a).length);
            
            const toKeep = docs[0];
            const toDelete = docs.slice(1);

            console.log(`Keeping ${toKeep.id} (complete)`);
             for (const delDoc of toDelete) {
                 console.log(`Deleting ${delDoc.id}`);
                 await deleteDoc(doc(db, 'data_warga', delDoc.id));
             }
        }
    }
}

removeDuplicates().then(() => console.log("Done")).catch(console.error);
