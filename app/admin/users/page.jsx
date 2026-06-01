"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ q });
    if (role) params.set("role", role);
    const data = await adminFetch(`/api/admin/users?${params}`);
    setUsers(data.users || []);
  }, [q, role]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const columns = [
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <Link
          href={`/admin/users/${row.uid}`}
          className="text-rose-400 hover:underline font-semibold"
        >
          {row.email || row.uid}
        </Link>
      ),
    },
    { key: "fullName", label: "Name" },
    { key: "role", label: "Role" },
    {
      key: "venueId",
      label: "Venue",
      render: (row) => row.venueId || <span className="text-slate-500">—</span>,
    },
    {
      key: "onboarding",
      label: "Onboarding",
      render: (row) =>
        row.pendingVendorOnboarding ? (
          <span className="text-amber-400 text-xs">Pending</span>
        ) : row.onboardingComplete ? (
          <span className="text-emerald-400 text-xs">Done</span>
        ) : (
          <span className="text-slate-500 text-xs">—</span>
        ),
    },
  ];

  return (
    <AdminShell title="Users" subtitle="B2C and vendor accounts">
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search email, name, uid…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        >
          <option value="">All roles</option>
          <option value="user">user</option>
          <option value="vendor">vendor</option>
          <option value="admin">admin</option>
        </select>
        <button
          type="button"
          onClick={load}
          className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold uppercase"
        >
          Refresh
        </button>
      </div>

      <DataTable
        columns={columns}
        rows={users.map((u) => ({ ...u, _key: u.uid }))}
        emptyMessage="No users found."
      />
    </AdminShell>
  );
}
