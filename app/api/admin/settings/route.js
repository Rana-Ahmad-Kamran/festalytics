import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { PLATFORM_ADMINS_COLLECTION } from "@/lib/admin/platformAdminStore";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

function envStatus() {
  const username = (process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD || "";
  const sessionSecret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  const email = (process.env.ADMIN_EMAIL || "").trim();

  return {
    adminUsername: username || null,
    adminUsernameSet: Boolean(username),
    adminPasswordSet: Boolean(password),
    adminSessionSecretSet: Boolean(sessionSecret),
    adminEmail: email || null,
    sessionSecretLength: sessionSecret ? sessionSecret.length : 0,
    sessionCookie: ADMIN_SESSION_COOKIE,
    sessionMaxAgeHours: 12,
  };
}

export const GET = withAdmin(async ({ admin }) => {
  const env = envStatus();

  let platformAdminCount = 0;
  let lastLoginAt = null;
  try {
    const snap = await getAdminDb().collection(PLATFORM_ADMINS_COLLECTION).get();
    platformAdminCount = snap.size;
    const profile = admin.profile || {};
    lastLoginAt = profile.lastLoginAt || null;
  } catch {
    /* ignore */
  }

  const firebaseConfigured = Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );

  return Response.json({
    env,
    currentAdmin: {
      username: admin.username,
      email: admin.email,
      lastLoginAt,
    },
    firestore: {
      platformAdminsCollection: PLATFORM_ADMINS_COLLECTION,
      auditLogsCollection: "admin_audit_logs",
      schema: [
        { field: "username", type: "string" },
        { field: "slug", type: "string" },
        { field: "email", type: "string | null" },
        { field: "role", type: "enum", values: ["platform_admin"] },
        { field: "authSource", type: "string", example: "env" },
        { field: "lastLoginAt", type: "timestamp" },
        { field: "active", type: "boolean" },
      ],
      documentCount: platformAdminCount,
    },
    health: {
      operational: firebaseConfigured && env.adminUsernameSet && env.adminPasswordSet,
      firebaseConfigured,
      authConfigured: env.adminUsernameSet && env.adminPasswordSet,
    },
  });
});
