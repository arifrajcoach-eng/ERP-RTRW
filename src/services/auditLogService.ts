import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export async function logAuditEvent(
  userId: string,
  userName: string,
  action: string,
  resource: string,
  details: string,
  tenantId: string
) {
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    await setDoc(doc(db, 'audit_logs', logId), {
      userId,
      userName,
      action,
      resource,
      details,
      tenantId,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("Audit log failed to record", e);
  }
}
