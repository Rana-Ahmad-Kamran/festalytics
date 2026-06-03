import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";

export const dynamic = "force-dynamic";

function normalizeStatus(status) {
  const s = String(status || "Pending").trim();
  const lower = s.toLowerCase();
  if (["confirmed", "confirm", "approved"].includes(lower)) return "Confirmed";
  if (["cancelled", "canceled", "declined", "rejected"].includes(lower)) return "Cancelled";
  if (["pending", "awaiting", "in progress", "in-progress"].includes(lower)) return "Pending";
  return s || "Pending";
}

function serializeBooking(id, data) {
  const isWalkIn =
    data.bookingSource === "walk-in" || data.eventDetails?.source === "Walk-in ERP";

  const source = isWalkIn
    ? "Walk-in ERP"
    : data.bookingSource === "online" || data.eventDetails?.source === "Online Portal"
      ? "Online Portal"
      : data.bookingSource || data.eventDetails?.source || "Online Portal";

  return {
    id,
    docId: id,
    bookingRef: data.id || id,
    userId: data.userId || "",
    targetVenueId: data.targetVenueId || data.eventDetails?.venueId || "",
    customerName: data.customer?.name || "—",
    customerContact: data.customer?.contact || "",
    status: normalizeStatus(data.status),
    source,
    sourceKey: isWalkIn ? "walk-in" : "online",
    eventDate: data.eventDetails?.date || "",
    timing: data.eventDetails?.timing || "",
    amount: data.financials?.grandTotal ?? 0,
    service: data.eventDetails?.category || data.eventDetails?.service || "Event",
    guestCount: data.guestCount ?? data.eventDetails?.guestCount ?? null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const venueId = searchParams.get("venueId") || "";
  const status = searchParams.get("status") || "";
  const source = searchParams.get("source") || "";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const snap = await getAdminDb().collection("bookings").get();
  const allItems = snap.docs.map((d) => serializeBooking(d.id, d.data()));

  const pendingCount = allItems.filter((b) => b.status === "Pending").length;
  const confirmed = allItems.filter((b) => b.status === "Confirmed");
  const walkInCount = allItems.filter((b) => b.sourceKey === "walk-in").length;
  const confirmedAmounts = confirmed.map((b) => b.amount).filter((a) => a > 0);
  const avgBookingValue =
    confirmedAmounts.length > 0
      ? Math.round(confirmedAmounts.reduce((s, a) => s + a, 0) / confirmedAmounts.length)
      : 0;
  const totalRevenue = confirmedAmounts.reduce((s, a) => s + a, 0);
  const confirmationRate =
    allItems.length > 0
      ? Math.round((confirmed.length / allItems.length) * 1000) / 10
      : 0;

  const venueStats = {};
  for (const item of allItems) {
    const slug = item.targetVenueId || "unknown";
    if (!venueStats[slug]) {
      venueStats[slug] = { slug, total: 0, confirmed: 0 };
    }
    venueStats[slug].total += 1;
    if (item.status === "Confirmed") venueStats[slug].confirmed += 1;
  }
  const venuePerformance = Object.values(venueStats)
    .map((v) => ({
      slug: v.slug,
      rate: v.total > 0 ? Math.round((v.confirmed / v.total) * 100) : 0,
      total: v.total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const venueSlugs = [...new Set(allItems.map((x) => x.targetVenueId).filter(Boolean))].sort();

  let items = allItems;

  if (venueId) items = items.filter((b) => b.targetVenueId === venueId);
  if (status) items = items.filter((b) => b.status === status);
  if (source === "walk-in") items = items.filter((b) => b.sourceKey === "walk-in");
  if (source === "online") items = items.filter((b) => b.sourceKey === "online");
  if (q) {
    items = items.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.bookingRef.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerContact.toLowerCase().includes(q) ||
        b.targetVenueId.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.source.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));

  return Response.json({
    bookings: items,
    total: items.length,
    summary: {
      totalCount: allItems.length,
      pendingCount,
      confirmedCount: confirmed.length,
      walkInCount,
      onlineCount: allItems.length - walkInCount,
      avgBookingValue,
      totalRevenue,
      confirmationRate,
    },
    venueSlugs,
    venuePerformance,
  });
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
  if (body.status !== undefined) patch.status = normalizeStatus(body.status);
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
