import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function serializeUser(id, data) {
  return {
    uid: id,
    email: data.email || "",
    fullName: data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    role: data.role || "user",
    venueId: data.venueId || null,
    emailVerified: data.emailVerified === true,
    onboardingComplete: data.onboardingComplete === true,
    pendingVendorOnboarding: Boolean(data.pendingVendorOnboarding),
    mobileNumber: data.mobileNumber || "",
    createdAt: data.createdAt || null,
  };
}

export const GET = withAdmin(async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const role = searchParams.get("role") || "";

  const snap = await getAdminDb().collection("users").get();
  let items = snap.docs.map((d) => serializeUser(d.id, d.data()));

  if (role) items = items.filter((u) => u.role === role);
  if (searchParams.get("stuck") === "1") {
    items = items.filter(
      (u) =>
        u.role === "vendor" &&
        !u.venueId &&
        (u.pendingVendorOnboarding || !u.onboardingComplete)
    );
  }

  if (q) {
    items = items.filter(
      (u) =>
        u.uid.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => (b.email || "").localeCompare(a.email || ""));

  return Response.json({ users: items, total: items.length });
});
