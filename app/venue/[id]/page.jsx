"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import VenueDetails from "@/components/VenueDetails";

export default function VenueDetailsPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <VenueDetails />
    </ProtectedRoute>
  );
}
