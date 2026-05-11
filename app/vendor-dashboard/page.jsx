"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import VendorDashboard from "@/components/VendorDashboard";

export default function VendorDashboardPage() {
  return (
    <ProtectedRoute allowedRole="vendor">
      <VendorDashboard />
    </ProtectedRoute>
  );
}
