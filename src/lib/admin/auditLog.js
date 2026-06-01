import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

const COLLECTION = "admin_audit_logs";

/**
 * @param {object} entry
 */
export async function writeAdminAuditLog(entry) {
  try {
    await getAdminDb().collection(COLLECTION).add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.warn("[writeAdminAuditLog]", err?.message);
  }
}
