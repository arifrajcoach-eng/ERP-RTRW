
import { db } from './src/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

async function migrateUsernames() {
  const usersSnap = await getDocs(collection(db, 'users'));
  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    if (userData.username) {
      console.log(`Migrating: ${userData.username} -> ${userData.email}`);
      await setDoc(doc(db, 'public_usernames', userData.username), {
        username: userData.username,
        email: userData.email
      });
    }
  }
  console.log('Migration completed');
}

migrateUsernames();
