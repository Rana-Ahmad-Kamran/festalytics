import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ params }) => {
  const slug = params?.slug;
  const snap = await getAdminDb().collection("venues").doc(slug).get();
  if (!snap.exists) {
    return Response.json({ error: "Venue not found." }, { status: 404 });
  }
  return Response.json({ slug, ...snap.data() });
});

export const PATCH = withAdmin(async ({ request, admin, params }) => {
  const slug = params?.slug;
  const ref = getAdminDb().collection("venues").doc(slug);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "Venue not found." }, { status: 404 });
  }

  const body = await request.json();
  const allowed = [
    "serviceActive",
    "ownerId",
    "name",
    "hallName",
    "description",
    "streetAddress",
    "city",
    "capacity",
    "venueType",
    "isNetworkParticipant",
    "blockedDates",
    "bookedDates",
    "blackoutDates",
    "profile",
    "borrowHub",
  ];

  const patch = { updatedAt: new Date().toISOString() };
  for (const key of allowed) {
    if (body[key] !== undefined) patch[key] = body[key];
  }

  await ref.set(patch, { merge: true });

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "venues.detail.patch",
    collection: "venues",
    docId: slug,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({ slug, ...after.data() });
});
