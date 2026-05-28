
import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function checkUser() {
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log("=== CHECKING USERS OUT ===");
  usersSnap.forEach((doc) => {
    const data = doc.data();
    if (data.nama === 'ACHMAD SYARIF' || data.name === 'ACHMAD SYARIF' || data.nik === '3216022610800006') {
      console.log('User Document ID:', doc.id, 'Data:', data);
    }
  });
}
checkUser();
