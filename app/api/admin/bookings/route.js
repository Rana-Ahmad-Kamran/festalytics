import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";

export const dynamic = "force-dynamic";

function serializeBooking(id, data) {
  const isWalkIn =
    data.bookingSource === "walk-in" || data.eventDetails?.source === "Walk-in ERP";

  return {
    id,
    docId: id,
    targetVenueId: data.targetVenueId || data.eventDetails?.venueId || "",
    customerName: data.customer?.name || "—",
    customerContact: data.customer?.contact || "",
    status: data.status || "",
    source: isWalkIn ? "Walk-in ERP" : data.bookingSource || "Online Portal",
    eventDate: data.eventDetails?.date || "",
    timing: data.eventDetails?.timing || "",
    amount: data.financials?.grandTotal ?? 0,
    service: data.eventDetails?.category || "",
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") || "";
  const status = searchParams.get("status") || "";

  const snap = await getAdminDb().collection("bookings").get();
  let items = snap.docs.map((d) => serializeBooking(d.id, d.data()));

  if (venueId) items = items.filter((b) => b.targetVenueId === venueId);
  if (status) items = items.filter((b) => b.status === status);

  items.sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));

  return Response.json({ bookings: items, total: items.length });
});

export const PATCH = withAdmin(async ({ request, admin }) => {
  const body = await request.json();
  const id = String(body.id || "").trim();
  if (!id) {
    return Response.json({ error: "id is required." }, { status: 400 });
  }

  const ref = getAdminDb().collection("bookings").doc(id);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "Booking not found." }, { status: 404 });
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };
  if (body.status !== undefined) patch.status = String(body.status);
  if (body.targetVenueId !== undefined) {
    patch.targetVenueId = String(body.targetVenueId).trim();
    patch.eventDetails = {
      ...(beforeSnap.data().eventDetails || {}),
      venueId: String(body.targetVenueId).trim(),
    };
  }

  await ref.set(patch, { merge: true });

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "bookings.patch",
    collection: "bookings",
    docId: id,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({ booking: serializeBooking(id, after.data()) });
});
