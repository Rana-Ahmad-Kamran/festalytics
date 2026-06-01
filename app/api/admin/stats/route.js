import { withAdmin } from "@/lib/admin/apiRoute";
import { getAdminDb } from "@/lib/firebase/admin";
import { QUOTATION_STATUS } from "@/lib/firestore/quotations";

export const dynamic = "force-dynamic";

export const GET = withAdmin(async () => {
  const db = getAdminDb();

  const [venuesSnap, usersSnap, quotesSnap, bookingsSnap] = await Promise.all([
    db.collection("venues").get(),
    db.collection("users").get(),
    db.collection("quotations").where("status", "==", QUOTATION_STATUS.PENDING).get(),
    db.collection("bookings").get(),
  ]);

  let activeVenues = 0;
  let unownedVenues = 0;
  venuesSnap.forEach((doc) => {
    const d = doc.data();
    if (d.serviceActive !== false) activeVenues += 1;
    if (!d.ownerId) unownedVenues += 1;
  });

  let vendorUsers = 0;
  let stuckOnboarding = 0;
  usersSnap.forEach((doc) => {
    const d = doc.data();
    if (d.role === "vendor") {
      vendorUsers += 1;
      if (!d.venueId && (d.pendingVendorOnboarding || !d.onboardingComplete)) {
        stuckOnboarding += 1;
      }
    }
  });

  return Response.json({
    totalVenues: venuesSnap.size,
    activeVenues,
    unownedVenues,
    totalUsers: usersSnap.size,
    vendorUsers,
    stuckOnboarding,
    pendingQuotations: quotesSnap.size,
    totalBookings: bookingsSnap.size,
  });
});
