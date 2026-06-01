import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async ({ params }) => {
  const uid = params?.uid;
  const snap = await getAdminDb().collection("users").doc(uid).get();
  if (!snap.exists) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }
  return Response.json({ uid, ...snap.data() });
});

export const PATCH = withAdmin(async ({ request, admin, params }) => {
  const uid = params?.uid;
  const ref = getAdminDb().collection("users").doc(uid);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const body = await request.json();
  const patch = { updatedAt: new Date().toISOString() };

  if (body.role !== undefined) {
    const role = String(body.role);
    if (!["user", "vendor", "admin"].includes(role)) {
      return Response.json({ error: "Invalid role." }, { status: 400 });
    }
    patch.role = role;
  }

  if (body.venueId !== undefined) {
    patch.venueId =
      body.venueId === null || body.venueId === "" ? null : String(body.venueId).trim();
  }

  if (body.onboardingComplete !== undefined) {
    patch.onboardingComplete = Boolean(body.onboardingComplete);
  }

  if (body.clearPendingOnboarding === true) {
    patch.pendingVendorOnboarding = FieldValue.delete();
  }

  if (body.emailVerified !== undefined) {
    patch.emailVerified = Boolean(body.emailVerified);
  }

  await ref.set(patch, { merge: true });

  if (body.venueId && body.syncVenueOwner === true) {
    const venueId = String(body.venueId).trim();
    await getAdminDb()
      .collection("venues")
      .doc(venueId)
      .set(
        { ownerId: uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
  }

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "users.patch",
    collection: "users",
    docId: uid,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({ uid, ...after.data() });
});
