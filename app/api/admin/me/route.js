import { withAdmin } from "@/lib/admin/apiRoute";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ admin }) => {
  return Response.json({
    username: admin.username,
    email: admin.email,
    profile: admin.profile,
    authSource: "env_session",
  });
});
