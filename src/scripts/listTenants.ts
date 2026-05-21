import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

async function listTenants() {
    const querySnapshot = await getDocs(collection(db, 'tenants'));
    querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data().name}`);
    });
}
listTenants().then(() => console.log("Done")).catch(console.error);
