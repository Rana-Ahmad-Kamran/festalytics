"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import FindMyDecor from "@/components/FindMyDecor";

export default function FindDecorPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <FindMyDecor />
    </ProtectedRoute>
  );
}
