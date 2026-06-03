import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function serializeUser(id, data) {
  const firstName = data.firstName || "";
  const lastName = data.lastName || "";
  const fullName =
    data.fullName || `${firstName} ${lastName}`.trim() || data.email?.split("@")[0] || "User";

  return {
    uid: id,
    email: data.email || "",
    firstName,
    lastName,
    fullName,
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
  const allItems = snap.docs.map((d) => serializeUser(d.id, d.data()));

  const summary = {
    totalUsers: allItems.length,
    vendorCount: allItems.filter((u) => u.role === "vendor").length,
    activeVendors: allItems.filter((u) => u.role === "vendor" && u.venueId).length,
    customerCount: allItems.filter((u) => u.role === "user").length,
    adminCount: allItems.filter((u) => u.role === "admin").length,
  };

  let items = allItems;

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

  return Response.json({
    users: items,
    total: items.length,
    summary,
  });
});
