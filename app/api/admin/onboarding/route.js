import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function timestampMs(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function buildOnboardingFlags(data) {
  const flags = [];
  if (data.pendingVendorOnboarding) flags.push("PENDING_ONBOARDING");
  if (data.role === "vendor" && !data.onboardingComplete) flags.push("PROFILE_INCOMPLETE");
  if (data.role === "vendor" && !data.venueId) flags.push("NO_VENUE_LINKED");
  if (data.emailVerified === false) flags.push("EMAIL_UNVERIFIED");
  if (!flags.length) flags.push("REVIEW_REQUIRED");
  return flags;
}

function serializeStuckVendor(id, data) {
  const fullName =
    data.fullName ||
    `${data.firstName || ""} ${data.lastName || ""}`.trim() ||
    data.email?.split("@")[0] ||
    "Vendor";

  const createdMs = timestampMs(data.createdAt) || timestampMs(data.updatedAt);
  const stuckHours = createdMs
    ? Math.max(0, Math.round((Date.now() - createdMs) / (1000 * 60 * 60)))
    : null;

  return {
    uid: id,
    email: data.email || "",
    fullName,
    role: data.role || "vendor",
    venueId: data.venueId || null,
    emailVerified: data.emailVerified === true,
    onboardingComplete: data.onboardingComplete === true,
    pendingVendorOnboarding: Boolean(data.pendingVendorOnboarding),
    flags: buildOnboardingFlags(data),
    stuckHours,
    createdAt: data.createdAt || null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const snap = await getAdminDb().collection("users").get();
  const allVendors = snap.docs
    .map((d) => serializeStuckVendor(d.id, d.data()))
    .filter(
      (u) =>
        u.role === "vendor" &&
        !u.venueId &&
        (u.pendingVendorOnboarding || !u.onboardingComplete)
    );

  let items = allVendors;

  if (q) {
    items = items.filter(
      (u) =>
        u.uid.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => (b.stuckHours || 0) - (a.stuckHours || 0));

  const stuckOver48h = items.filter((u) => (u.stuckHours || 0) >= 48).length;
  const avgStuckHours =
    items.length > 0
      ? Math.round(
          items.reduce((sum, u) => sum + (u.stuckHours || 0), 0) / items.length
        )
      : 0;

  const totalVendors = snap.docs.filter((d) => d.data().role === "vendor").length;
  const linkedVendors = snap.docs.filter(
    (d) => d.data().role === "vendor" && d.data().venueId
  ).length;
  const resolutionRate =
    totalVendors > 0 ? Math.round((linkedVendors / totalVendors) * 100) : 100;

  return Response.json({
    queue: items,
    total: items.length,
    summary: {
      stuckCount: items.length,
      stuckOver48h,
      avgStuckHours,
      resolutionRate,
      totalVendors,
      linkedVendors,
    },
  });
});
