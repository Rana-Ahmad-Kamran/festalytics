"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminOnboardingPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminFetch("/api/admin/users?stuck=1")
      .then((data) => setUsers(data.users || []))
      .catch(console.error);
  }, []);

  const columns = [
    {
      key: "email",
      label: "Vendor",
      render: (row) => (
        <Link href={`/admin/users/${row.uid}`} className="text-rose-400 hover:underline">
          {row.email}
        </Link>
      ),
    },
    { key: "uid", label: "UID" },
    {
      key: "flags",
      label: "Flags",
      render: (row) => (
        <span className="text-xs text-amber-300">
          {row.pendingVendorOnboarding ? "pendingVendorOnboarding " : ""}
          {!row.onboardingComplete ? "not complete" : ""}
        </span>
      ),
    },
  ];

  return (
    <AdminShell title="Onboarding queue" subtitle="Vendors missing venue link">
      <DataTable
        columns={columns}
        rows={users.map((u) => ({ ...u, _key: u.uid }))}
        emptyMessage="No stuck vendor onboarding records."
      />
    </AdminShell>
  );
}
