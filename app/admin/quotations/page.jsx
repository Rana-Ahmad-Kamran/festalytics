"use client";

import React, { useCallback, useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";
import { QUOTATION_STATUS } from "@/lib/firestore/quotations";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: QUOTATION_STATUS.PENDING, label: "Pending" },
  { value: QUOTATION_STATUS.CONFIRMED, label: "Confirmed" },
  { value: QUOTATION_STATUS.DECLINED, label: "Declined" },
  { value: QUOTATION_STATUS.COUNTER, label: "Counter offer" },
];

export default function AdminQuotationsPage() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(QUOTATION_STATUS.PENDING);
  const [venueId, setVenueId] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (venueId) params.set("venueId", venueId);
    const data = await adminFetch(`/api/admin/quotations?${params}`);
    setRows(data.quotations || []);
  }, [status, venueId]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const updateStatus = async (id, newStatus) => {
    await adminFetch("/api/admin/quotations", {
      method: "PATCH",
      body: JSON.stringify({ id, status: newStatus }),
    });
    await load();
  };

  const columns = [
    { key: "customerName", label: "Customer" },
    { key: "targetVenueId", label: "Venue" },
    { key: "eventDate", label: "Event date" },
    { key: "guestCount", label: "Guests" },
    { key: "packageName", label: "Package" },
    { key: "status", label: "Status" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => updateStatus(row.id, QUOTATION_STATUS.CONFIRMED)}
            className="text-[10px] font-bold uppercase text-emerald-400 hover:text-emerald-300"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => updateStatus(row.id, QUOTATION_STATUS.DECLINED)}
            className="text-[10px] font-bold uppercase text-rose-400 hover:text-rose-300"
          >
            Decline
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="Quotations" subtitle="B2C quote requests">
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
        emptyMessage="No quotations."
      />
    </AdminShell>
  );
}
