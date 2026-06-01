import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "requests";

  const db = getAdminDb();

  if (type === "listings") {
    const snap = await db.collection("inventory_listings").get();
    const listings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    listings.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    return Response.json({ listings, total: listings.length });
  }

  const snap = await db.collection("borrow_requests").get();
  const requests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  requests.sort((a, b) => {
    const ta = a.createdAt?._seconds || 0;
    const tb = b.createdAt?._seconds || 0;
    return tb - ta;
  });

  return Response.json({ requests, total: requests.length });
});

export const PATCH = withAdmin(async ({ request, admin }) => {
  const body = await request.json();
  const type = body.type || "request";

  if (type === "listing") {
    const id = String(body.id || "").trim();
    const ref = getAdminDb().collection("inventory_listings").doc(id);
    const before = await ref.get();
    if (!before.exists) {
      return Response.json({ error: "Listing not found." }, { status: 404 });
    }
    const patch = { updatedAt: new Date().toISOString() };
    if (typeof body.isActive === "boolean") patch.isActive = body.isActive;
    await ref.set(patch, { merge: true });
    await writeAdminAuditLog({
      adminUid: admin.uid,
      action: "inventory_listings.patch",
      collection: "inventory_listings",
      docId: id,
      before: before.data(),
      after: patch,
    });
    return Response.json({ id, ...patch });
  }

  const id = String(body.id || "").trim();
  const ref = getAdminDb().collection("borrow_requests").doc(id);
  const before = await ref.get();
  if (!before.exists) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };
  if (body.status) patch.status = String(body.status);

  await ref.set(patch, { merge: true });

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "borrow_requests.patch",
    collection: "borrow_requests",
    docId: id,
    before: before.data(),
    after: patch,
  });

  return Response.json({ id, ...patch });
});
