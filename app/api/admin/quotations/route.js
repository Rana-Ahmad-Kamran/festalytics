import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { QUOTATION_STATUS } from "@/lib/firestore/quotations";

export const dynamic = "force-dynamic";

function estimateAmount(data) {
  const financials = Number(data.financials?.grandTotal);
  if (Number.isFinite(financials) && financials > 0) return financials;

  const menu = data.selectedMenu;
  const perPlate =
    typeof menu === "object" ? Number(menu?.perPlatePrice) || 0 : 0;
  const guests = Number(data.guestCount) || 0;
  if (perPlate > 0 && guests > 0) return perPlate * guests;
  return 0;
}

function serializeQuotation(id, data) {
  const menu = data.selectedMenu;
  const packageName =
    typeof menu === "object" ? menu?.packageName || menu?.name || "—" : String(menu || "—");
  const amount = estimateAmount(data);

  return {
    id,
    quotationId: data.quotationId || id,
    userId: data.userId || "",
    customerName: data.customerName || "",
    targetVenueId: data.targetVenueId || "",
    eventDate: data.eventDate || "",
    guestCount: data.guestCount ?? null,
    status: data.status || "",
    packageName,
    amount,
    eventTitle: data.eventTitle || "",
    timestamp: data.timestamp || null,
    updatedAt: data.updatedAt || null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const venueId = searchParams.get("venueId") || "";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const snap = await getAdminDb().collection("quotations").get();
  const allItems = snap.docs.map((d) => serializeQuotation(d.id, d.data()));

  const pendingCount = allItems.filter(
    (x) => x.status === QUOTATION_STATUS.PENDING
  ).length;
  const confirmed = allItems.filter((x) => x.status === QUOTATION_STATUS.CONFIRMED);
  const confirmedAmounts = confirmed.map((x) => x.amount).filter((a) => a > 0);
  const avgDealValue =
    confirmedAmounts.length > 0
      ? Math.round(
          confirmedAmounts.reduce((s, a) => s + a, 0) / confirmedAmounts.length
        )
      : 0;
  const conversionRate =
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
    if (item.status === QUOTATION_STATUS.CONFIRMED) venueStats[slug].confirmed += 1;
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

  if (status) items = items.filter((x) => x.status === status);
  if (venueId) items = items.filter((x) => x.targetVenueId === venueId);
  if (q) {
    items = items.filter(
      (x) =>
        x.id.toLowerCase().includes(q) ||
        x.quotationId.toLowerCase().includes(q) ||
        x.customerName.toLowerCase().includes(q) ||
        x.targetVenueId.toLowerCase().includes(q) ||
        x.packageName.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => {
    const ta = a.timestamp?._seconds || 0;
    const tb = b.timestamp?._seconds || 0;
    return tb - ta;
  });

  return Response.json({
    quotations: items,
    total: items.length,
    summary: {
      pendingCount,
      totalCount: allItems.length,
      avgDealValue,
      conversionRate,
      confirmedCount: confirmed.length,
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

  const ref = getAdminDb().collection("quotations").doc(id);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "Quotation not found." }, { status: 404 });
  }

  const patch = { updatedAt: FieldValue.serverTimestamp() };
  const validStatuses = Object.values(QUOTATION_STATUS);

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = status;
  }

  if (body.targetVenueId !== undefined) {
    patch.targetVenueId = String(body.targetVenueId).trim();
  }

  if (body.adminNote !== undefined) {
    patch.adminNote = String(body.adminNote);
  }

  await ref.set(patch, { merge: true });

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "quotations.patch",
    collection: "quotations",
    docId: id,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({ quotation: serializeQuotation(id, after.data()) });
});
