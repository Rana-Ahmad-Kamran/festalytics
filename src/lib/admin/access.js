import {
  readCookie,
  verifyAdminSessionToken,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/session";
import { getPlatformAdmin } from "@/lib/admin/platformAdminStore";

/**
 * @param {Request} request
 */
export async function requireAdminFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readCookie(cookieHeader, ADMIN_SESSION_COOKIE);
  const session = verifyAdminSessionToken(token);

  if (!session?.username) {
    const err = new Error("Not authenticated. Sign in at /admin/login.");
    err.status = 401;
    throw err;
  }

  let profile = null;
  try {
    profile = await getPlatformAdmin(session.username);
  } catch (err) {
    console.warn("[requireAdminFromRequest] platform_admins lookup:", err?.message);
  }

  return {
    uid: profile?.id ? `platform_admin:${profile.id}` : `platform_admin:${session.username}`,
    username: session.username,
    email: profile?.email || null,
    profile,
    session,
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
