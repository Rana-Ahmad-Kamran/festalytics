import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { resolveVenueImageUrl } from "@/lib/venueImagePath";

export const dynamic = "force-dynamic";

function serializeVenue(id, data) {
  const profile = data.profile || {};
  const area = profile.area || data.city || "";
  const address = profile.address || data.streetAddress || "";
  const city = data.city || "Lahore";

  return {
    slug: id,
    name: data.name || data.hallName || profile.hall_name || id,
    area,
    address,
    locationLabel: address ? `${city}, ${area}` : area || city,
    imageUrl: resolveVenueImageUrl(id, data),
    serviceActive: data.serviceActive !== false,
    ownerId: data.ownerId || null,
    capacity: data.capacity ?? profile.capacity ?? null,
    venueType: data.venueType || "",
    isNetworkParticipant: data.isNetworkParticipant === true,
    borrowHubEnabled: data.borrowHub?.enabled === true,
    updatedAt: data.updatedAt || null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const filter = searchParams.get("filter") || "all";

  const snap = await getAdminDb().collection("venues").get();
  let items = snap.docs.map((d) => serializeVenue(d.id, d.data()));

  if (filter === "active") items = items.filter((v) => v.serviceActive);
  if (filter === "inactive") items = items.filter((v) => !v.serviceActive);
  if (filter === "unowned") items = items.filter((v) => !v.ownerId);

  if (q) {
    items = items.filter(
      (v) =>
        v.slug.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q) ||
        (v.area || "").toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  return Response.json({ venues: items, total: items.length });
});

export const PATCH = withAdmin(async ({ request, admin }) => {
  const body = await request.json();
  const slug = String(body.slug || "").trim();
  if (!slug) {
    return Response.json({ error: "slug is required." }, { status: 400 });
  }

  const ref = getAdminDb().collection("venues").doc(slug);
  const beforeSnap = await ref.get();
  if (!beforeSnap.exists) {
    return Response.json({ error: "Venue not found." }, { status: 404 });
  }

  const patch = { updatedAt: new Date().toISOString() };
  if (typeof body.serviceActive === "boolean") patch.serviceActive = body.serviceActive;
  if (body.ownerId !== undefined) {
    patch.ownerId = body.ownerId === null || body.ownerId === "" ? null : String(body.ownerId);
  }
  if (typeof body.isNetworkParticipant === "boolean") {
    patch.isNetworkParticipant = body.isNetworkParticipant;
  }
  if (body.name) patch.name = String(body.name).trim();
  if (body.hallName) patch.hallName = String(body.hallName).trim();

  await ref.set(patch, { merge: true });

  if (body.ownerId && body.syncUserVenueId) {
    const ownerId = String(body.ownerId).trim();
    await getAdminDb()
      .collection("users")
      .doc(ownerId)
      .set(
        {
          venueId: slug,
          onboardingComplete: true,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  }

  await writeAdminAuditLog({
    adminUid: admin.uid,
    action: "venues.patch",
    collection: "venues",
    docId: slug,
    before: beforeSnap.data(),
    after: patch,
  });

  const after = await ref.get();
  return Response.json({ venue: serializeVenue(slug, after.data()) });
});
