import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";

export const PLATFORM_ADMINS_COLLECTION = "platform_admins";

/**
 * Persist admin identity in Firestore (no password stored).
 * @param {string} username
 * @param {{ email?: string }} [meta]
 */
export async function upsertPlatformAdmin(username, meta = {}) {
  const slug = username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "admin";
  const ref = getAdminDb().collection(PLATFORM_ADMINS_COLLECTION).doc(slug);

  const email =
    meta.email ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_EMAILS?.split(",")?.[0]?.trim() ||
    null;

  const existing = await ref.get();
  const payload = {
    username,
    slug,
    email,
    role: "platform_admin",
    active: true,
    authSource: "env",
    lastLoginAt: FieldValue.serverTimestamp(),
    updatedAt: new Date().toISOString(),
  };

  if (!existing.exists) {
    payload.createdAt = FieldValue.serverTimestamp();
  }

  await ref.set(payload, { merge: true });

  return { id: slug, username, email };
}

/**
 * @param {string} username
 */
export async function getPlatformAdmin(username) {
  const slug = username.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "admin";
  const snap = await getAdminDb().collection(PLATFORM_ADMINS_COLLECTION).doc(slug).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}
