import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  );
  return response;
}
