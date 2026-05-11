"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ServiceDiscovery from "@/components/ServiceDiscovery";

export default function ServiceDiscoveryPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <ServiceDiscovery />
    </ProtectedRoute>
  );
}
