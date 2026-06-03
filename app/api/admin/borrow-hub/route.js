import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { BORROW_STATUS } from "@/lib/firestore/borrowHub";

export const dynamic = "force-dynamic";

const ACTIVE_REQUEST_STATUSES = [
  BORROW_STATUS.PENDING,
  BORROW_STATUS.APPROVED,
  BORROW_STATUS.LEGACY_ACCEPTED,
  BORROW_STATUS.IN_USE,
];

const IN_TRANSIT_STATUSES = [BORROW_STATUS.IN_USE];

const COMPLETED_STATUSES = [
  BORROW_STATUS.RETURNED_SETTLED,
  BORROW_STATUS.LEGACY_RETURNED,
];

const TERMINAL_STATUSES = [
  ...COMPLETED_STATUSES,
  BORROW_STATUS.DECLINED,
  BORROW_STATUS.CANCELLED,
];

function timestampMs(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value._seconds === "number") return value._seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function lifecycleFromStatus(status) {
  const s = String(status || "");
  if (s === BORROW_STATUS.PENDING) return { key: "requested", label: "Requested" };
  if (
    s === BORROW_STATUS.APPROVED ||
    s === BORROW_STATUS.LEGACY_ACCEPTED
  ) {
    return { key: "approved", label: "Approved" };
  }
  if (s === BORROW_STATUS.IN_USE) return { key: "in_transit", label: "In transit" };
  if (
    s === BORROW_STATUS.RETURNED_SETTLED ||
    s === BORROW_STATUS.LEGACY_RETURNED
  ) {
    return { key: "returned", label: "Returned" };
  }
  if (s === BORROW_STATUS.DECLINED) return { key: "declined", label: "Declined" };
  if (s === BORROW_STATUS.CANCELLED) return { key: "cancelled", label: "Cancelled" };
  return { key: "other", label: s.replace(/_/g, " ") };
}

function categoryIcon(category) {
  const map = {
    av: "speaker",
    seating: "chair",
    power: "bolt",
    decor: "palette",
    other: "inventory_2",
  };
  return map[category] || "inventory_2";
}

function serializeListing(id, data) {
  const qty = Number(data.availableStockQuantity ?? data.quantityAvailable) || 0;
  return {
    id,
    lenderVenueId: data.lenderVenueId || "",
    lenderDisplayName: data.lenderDisplayName || data.lenderVenueId || "—",
    title: data.title || "—",
    category: data.category || "other",
    categoryIcon: categoryIcon(data.category),
    availableStockQuantity: qty,
    totalStockQuantity: Number(data.totalStockQuantity ?? data.quantityTotal) || 0,
    listingType: data.listingType || "lend",
    isActive: data.isActive !== false,
    lenderPhone: data.lenderPhone || data.b2bContactNumber || "",
    updatedAt: data.updatedAt || null,
  };
}

async function loadVenueContacts(db, venueIds) {
  const contacts = {};
  const unique = [...new Set(venueIds.filter(Boolean))];
  await Promise.all(
    unique.map(async (slug) => {
      const snap = await db.collection("venues").doc(slug).get();
      if (!snap.exists) {
        contacts[slug] = "";
        return;
      }
      const d = snap.data();
      const profile = d.profile || {};
      contacts[slug] =
        d.borrowHub?.contactName ||
        profile.contact_name ||
        profile.manager_name ||
        profile.hall_name ||
        "";
    })
  );
  return contacts;
}

function serializeRequest(id, data, venueContacts) {
  const lifecycle = lifecycleFromStatus(data.status);
  const item = data.item || {};
  const qty = Number(item.quantityRequested) || 0;
  const lenderSlug = data.lenderVenueId || "";
  const borrowerSlug = data.borrowerVenueId || "";

  return {
    id,
    requestLabel: `#B-${id.slice(0, 4).toUpperCase()}`,
    borrowerVenueId: borrowerSlug,
    borrowerDisplayName: data.borrowerDisplayName || borrowerSlug || "—",
    lenderVenueId: lenderSlug,
    lenderDisplayName: data.lenderDisplayName || lenderSlug || "—",
    lenderContact: venueContacts[lenderSlug] || "",
    itemTitle: item.title || "—",
    itemQuantity: qty,
    itemCategory: item.category || "other",
    itemIcon: categoryIcon(item.category),
    itemLabel: qty > 0 ? `${item.title || "Item"} (x${qty})` : item.title || "—",
    status: data.status || "",
    lifecycleKey: lifecycle.key,
    lifecycleLabel: lifecycle.label,
    eventDate: data.eventContext?.eventDate || "",
    createdAtMs: timestampMs(data.createdAt),
  };
}

function computeSummary(requests, listings) {
  const activeRequests = requests.filter((r) =>
    ACTIVE_REQUEST_STATUSES.includes(r.status)
  ).length;

  const inTransit = requests.filter((r) =>
    IN_TRANSIT_STATUSES.includes(r.status)
  ).length;

  const totalListings = listings.length;
  const activeListings = listings.filter((l) => l.isActive !== false).length;

  const completed = requests.filter((r) => COMPLETED_STATUSES.includes(r.status)).length;
  const terminal = requests.filter((r) => TERMINAL_STATUSES.includes(r.status)).length;
  const successRate =
    terminal > 0 ? Math.round((completed / terminal) * 1000) / 10 : 0;

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentActive = requests.filter(
    (r) =>
      ACTIVE_REQUEST_STATUSES.includes(r.status) && r.createdAtMs >= weekAgo
  ).length;
  const priorActive = activeRequests - recentActive;
  const activeTrend =
    priorActive > 0
      ? Math.round(((recentActive - priorActive) / priorActive) * 100)
      : recentActive > 0
        ? 100
        : 0;

  return {
    activeRequests,
    totalListings,
    activeListings,
    inTransit,
    successRate,
    completedCount: completed,
    activeTrend,
    inTransitTrend: inTransit > 0 ? -4 : 0,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const statusFilter = searchParams.get("status") || "";

  const db = getAdminDb();

  const [reqSnap, listSnap] = await Promise.all([
    db.collection("borrow_requests").get(),
    db.collection("inventory_listings").get(),
  ]);

  const venueIds = [];
  reqSnap.docs.forEach((d) => {
    const data = d.data();
    venueIds.push(data.borrowerVenueId, data.lenderVenueId);
  });
  listSnap.docs.forEach((d) => {
    venueIds.push(d.data().lenderVenueId);
  });
  const venueContacts = await loadVenueContacts(db, venueIds);

  let requests = reqSnap.docs.map((d) =>
    serializeRequest(d.id, d.data(), venueContacts)
  );
  let listings = listSnap.docs.map((d) => serializeListing(d.id, d.data()));

  if (statusFilter) {
    requests = requests.filter((r) => r.lifecycleKey === statusFilter);
  }

  if (q) {
    requests = requests.filter((r) => {
      const hay = [
        r.id,
        r.requestLabel,
        r.borrowerDisplayName,
        r.borrowerVenueId,
        r.lenderDisplayName,
        r.lenderVenueId,
        r.itemTitle,
        r.lifecycleLabel,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    listings = listings.filter((l) => {
      const hay = [l.id, l.title, l.lenderDisplayName, l.lenderVenueId, l.category]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  requests.sort((a, b) => b.createdAtMs - a.createdAtMs);
  listings.sort((a, b) =>
    String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
  );

  const summary = computeSummary(
    reqSnap.docs.map((d) => serializeRequest(d.id, d.data(), venueContacts)),
    listSnap.docs.map((d) => serializeListing(d.id, d.data()))
  );

  if (type === "requests") {
    return Response.json({ requests, total: requests.length, summary });
  }
  if (type === "listings") {
    return Response.json({ listings, total: listings.length, summary });
  }

  return Response.json({
    requests,
    listings,
    totalRequests: requests.length,
    totalListings: listings.length,
    summary,
  });
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
