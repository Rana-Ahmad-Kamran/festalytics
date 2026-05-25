"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const ServiceDiscovery = dynamic(() => import("@/components/ServiceDiscovery"), {
  ssr: false,
});

export default function ServiceDiscoveryPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <ServiceDiscovery />
    </ProtectedRoute>
  );
}
