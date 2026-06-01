import { withAdmin } from "@/lib/admin/apiRoute";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ admin }) => {
  return Response.json({
    uid: admin.uid,
    email: admin.email,
  });
});
