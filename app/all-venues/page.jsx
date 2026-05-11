"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AllVenues from "@/components/AllVenues";

export default function AllVenuesPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <AllVenues />
    </ProtectedRoute>
  );
}
