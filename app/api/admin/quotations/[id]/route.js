import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ params }) => {
  const id = params?.id;
  const snap = await getAdminDb().collection("quotations").doc(id).get();
  if (!snap.exists) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  return Response.json({ id, ...snap.data() });
});
