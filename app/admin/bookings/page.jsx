"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminBookingsPage() {
  const [rows, setRows] = useState([]);
  const [venueId, setVenueId] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (venueId) params.set("venueId", venueId);
    const data = await adminFetch(`/api/admin/bookings?${params}`);
    setRows(data.bookings || []);
  }, [venueId]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const setStatus = async (id, status) => {
    await adminFetch("/api/admin/bookings", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });
    await load();
  };

  const columns = [
    { key: "customerName", label: "Customer" },
    { key: "targetVenueId", label: "Venue" },
    { key: "eventDate", label: "Date" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    {
      key: "amount",
      label: "Amount",
      render: (row) => `Rs ${Number(row.amount || 0).toLocaleString()}`,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => setStatus(row.id, "Confirmed")}
          className="text-[10px] font-bold uppercase text-emerald-400"
        >
          Confirm
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Bookings" subtitle="Walk-in and online bookings">
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Filter venue slug…"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        />
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
        rows={rows.map((r) => ({ ...r, _key: r.id }))}
        emptyMessage="No bookings."
      />
    </AdminShell>
  );
}
