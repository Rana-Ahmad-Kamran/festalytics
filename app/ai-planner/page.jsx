"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AIPlanner from "@/components/ai-planner/AIPlanner";

export default function AIPlannerPage() {
  return (
    <ProtectedRoute allowedRole="user">
      <AIPlanner />
    </ProtectedRoute>
  );
}
