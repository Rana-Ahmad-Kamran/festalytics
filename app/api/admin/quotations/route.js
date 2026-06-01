import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { QUOTATION_STATUS } from "@/lib/firestore/quotations";

export const dynamic = "force-dynamic";

function serializeQuotation(id, data) {
  const menu = data.selectedMenu;
  const packageName =
    typeof menu === "object" ? menu?.packageName || menu?.name || "—" : String(menu || "—");

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
    eventTitle: data.eventTitle || "",
    timestamp: data.timestamp || null,
    updatedAt: data.updatedAt || null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const venueId = searchParams.get("venueId") || "";

  const snap = await getAdminDb().collection("quotations").get();
  let items = snap.docs.map((d) => serializeQuotation(d.id, d.data()));

  if (status) items = items.filter((q) => q.status === status);
  if (venueId) items = items.filter((q) => q.targetVenueId === venueId);

  items.sort((a, b) => {
    const ta = a.timestamp?._seconds || 0;
    const tb = b.timestamp?._seconds || 0;
    return tb - ta;
  });

  return Response.json({ quotations: items, total: items.length });
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
