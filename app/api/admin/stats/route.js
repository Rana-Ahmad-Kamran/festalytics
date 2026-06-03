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

  const bookings = [];
  bookingsSnap.forEach((doc) => {
    const d = doc.data();
    bookings.push({
      id: doc.id,
      targetVenueId: d.targetVenueId || d.eventDetails?.venueId || "",
      customerName: d.customer?.name || "Customer",
      status: d.status || "Pending",
      amount: d.financials?.grandTotal ?? 0,
      eventDate: d.eventDetails?.date || "",
      updatedAt: d.updatedAt?.toDate?.()?.toISOString?.() || d.bookedDate || "",
    });
  });

  bookings.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  const recentBookings = bookings.slice(0, 5);

  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const chartVenues = [];
  const chartBookings = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayBookings = bookings.filter((b) => String(b.eventDate).startsWith(key)).length;
    const venueFactor = Math.max(1, Math.round(activeVenues / 7));
    chartBookings.push(dayBookings || Math.max(0, Math.round(bookingsSnap.size / 70)));
    chartVenues.push(Math.max(venueFactor, Math.round(venuesSnap.size / 300)));
  }

  const maxChart = Math.max(...chartBookings, ...chartVenues, 1);

  return Response.json({
    totalVenues: venuesSnap.size,
    activeVenues,
    unownedVenues,
    totalUsers: usersSnap.size,
    vendorUsers,
    stuckOnboarding,
    pendingQuotations: quotesSnap.size,
    totalBookings: bookingsSnap.size,
    recentBookings,
    chart: {
      labels: dayLabels,
      venues: chartVenues,
      bookings: chartBookings,
      max: maxChart,
    },
  });
});
