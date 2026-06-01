import { validateEnvAdminCredentials } from "@/lib/admin/credentials";
import { upsertPlatformAdmin } from "@/lib/admin/platformAdminStore";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionCookieOptions,
} from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const username = String(body.username || body.email || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return Response.json({ error: "Username and password are required." }, { status: 400 });
  }

  const check = validateEnvAdminCredentials(username, password);
  if (!check.ok) {
    return Response.json({ error: check.reason }, { status: 401 });
  }

  try {
    const profile = await upsertPlatformAdmin(check.username);
    const token = createAdminSessionToken(check.username);
    const cookieOptions = getAdminSessionCookieOptions();

    const response = Response.json({
      ok: true,
      username: check.username,
      profile,
    });

    response.headers.append(
      "Set-Cookie",
      `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; HttpOnly; SameSite=Lax${cookieOptions.secure ? "; Secure" : ""}`
    );

    return response;
  } catch (err) {
    console.error("[admin/login]", err);
    return Response.json(
      { error: err.message || "Login failed. Check server env and Firebase Admin SDK." },
      { status: 500 }
    );
  }
}
