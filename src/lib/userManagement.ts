import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Updates the user's role in the Firestore 'users' collection.
 * IMPORTANT: This function must be called from a secure, authenticated context,
 * preferably by a SUPERADMIN or ADMIN.
 * 
 * @param uid The UID of the user to update
 * @param newRole The new role to assign (e.g., 'SEKRETARIS', 'BENDAHARA', 'SATPAM', 'RT', 'RW', 'SUPER_ADMIN')
 * @param tenantId The current tenantId (RW/RT ID) to ensure data segregation
 */
export async function updateUserRoleInFirestore(
  uid: string,
  newRole: string,
  tenantId: string
) {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error(`User with UID ${uid} does not exist in Firestore.`);
    }

    // Security check: Ensure we are not updating across tenants if needed
    // (This is a basic check; stricter rules should be enforced in firestore.rules)
    const userData = userDoc.data();
    if (userData.tenantId && userData.tenantId !== tenantId && userData.role !== 'SUPER_ADMIN') {
        throw new Error("You do not have permission to update users from this tenant.");
    }

    await updateDoc(userRef, {
      role: newRole,
      isSuperAdmin: newRole === 'SUPER_ADMIN'
    });
    
    console.log(`Successfully updated role for user ${uid} to ${newRole}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}
