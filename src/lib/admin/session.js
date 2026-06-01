import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "festalytics_admin_session";
const MAX_AGE_SEC = 60 * 60 * 12;

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!secret) {
    throw new Error(
      "Set ADMIN_SESSION_SECRET (recommended) or ADMIN_PASSWORD in .env.local for admin sessions."
    );
  }
  return secret;
}

function sign(payloadB64) {
  return createHmac("sha256", getSessionSecret()).update(payloadB64).digest("base64url");
}

/**
 * @param {string} username
 */
export function createAdminSessionToken(username) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payloadB64 = Buffer.from(JSON.stringify({ username, exp })).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

/**
 * @param {string} token
 * @returns {{ username: string, exp: number } | null}
 */
export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string") return null;

  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;

  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(payloadB64);

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload?.username || typeof payload.exp !== "number") return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}

/**
 * @param {string} cookieHeader
 * @param {string} name
 */
export function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    if (key === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return null;
}
