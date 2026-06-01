import { timingSafeEqual } from "crypto";

function safeStringEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

export function getEnvAdminCredentials() {
  const username = (process.env.ADMIN_USERNAME || "").trim();
  const password = process.env.ADMIN_PASSWORD || "";
  return { username, password };
}

/**
 * @param {string} username
 * @param {string} password
 */
export function validateEnvAdminCredentials(username, password) {
  const env = getEnvAdminCredentials();
  if (!env.username || !env.password) {
    return { ok: false, reason: "Admin credentials are not configured on the server." };
  }

  const inputUser = String(username || "").trim();
  const inputPass = String(password || "");

  if (!safeStringEqual(inputUser, env.username) || !safeStringEqual(inputPass, env.password)) {
    return { ok: false, reason: "Invalid username or password." };
  }

  return { ok: true, username: env.username };
}
