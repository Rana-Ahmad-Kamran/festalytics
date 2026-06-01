import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

function parseAllowlist(envValue) {
  if (!envValue || typeof envValue !== "string") return new Set();
  return new Set(
    envValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export function getAdminUidAllowlist() {
  return parseAllowlist(process.env.ADMIN_UIDS);
}

export function getAdminEmailAllowlist() {
  return parseAllowlist(process.env.ADMIN_EMAILS).map((e) => e.toLowerCase());
}

/**
 * @param {import("firebase-admin/auth").DecodedIdToken} decoded
 */
export async function isPlatformAdmin(decoded) {
  if (!decoded?.uid) return false;

  const uidAllow = getAdminUidAllowlist();
  if (uidAllow.has(decoded.uid)) return true;

  const emailAllow = getAdminEmailAllowlist();
  const email = (decoded.email || "").toLowerCase();
  if (email && emailAllow.includes(email)) return true;

  try {
    const snap = await getAdminDb().collection("users").doc(decoded.uid).get();
    const role = snap.exists ? snap.data()?.role : null;
    if (ADMIN_ROLES.has(role)) return true;
  } catch (err) {
    console.warn("[isPlatformAdmin] users lookup failed:", err?.message);
  }

  return false;
}

/**
 * @param {Request} request
 * @returns {Promise<{ uid: string, email: string | undefined, token: import("firebase-admin/auth").DecodedIdToken }>}
 */
export async function requireAdminFromRequest(request) {
  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) {
    const err = new Error("Missing Authorization Bearer token.");
    err.status = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(match[1]);
  } catch {
    const err = new Error("Invalid or expired session token.");
    err.status = 401;
    throw err;
  }

  const allowed = await isPlatformAdmin(decoded);
  if (!allowed) {
    const err = new Error("Admin access denied.");
    err.status = 403;
    throw err;
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    token: decoded,
  };
}

/**
 * @param {unknown} error
 */
export function adminErrorResponse(error) {
  const status = Number(error?.status) || 500;
  const message =
    status === 500
      ? error?.message || "Internal server error."
      : error?.message || "Request failed.";

  return Response.json({ error: message }, { status });
}
