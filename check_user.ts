
import { db } from './src/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function checkUser() {
  const usersSnap = await getDocs(collection(db, 'users'));
  usersSnap.forEach((doc) => {
    const data = doc.data();
    if (data.username === 'trihprw26') {
      console.log('User found:', data);
    }
  });
}
checkUser();
