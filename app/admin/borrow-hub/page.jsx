"use client";

import React, { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminBorrowHubPage() {
  const [tab, setTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);

  const load = async () => {
    if (tab === "listings") {
      const data = await adminFetch("/api/admin/borrow-hub?type=listings");
      setListings(data.listings || []);
    } else {
      const data = await adminFetch("/api/admin/borrow-hub?type=requests");
      setRequests(data.requests || []);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, [tab]);

  const deactivateListing = async (id) => {
    await adminFetch("/api/admin/borrow-hub", {
      method: "PATCH",
      body: JSON.stringify({ type: "listing", id, isActive: false }),
    });
    await load();
  };

  const setRequestStatus = async (id, status) => {
    await adminFetch("/api/admin/borrow-hub", {
      method: "PATCH",
      body: JSON.stringify({ type: "request", id, status }),
    });
    await load();
  };

  return (
    <AdminShell title="Borrow Hub" subtitle="B2B inventory network">
      <div className="flex gap-2 mb-6">
        {["requests", "listings"].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
              tab === t ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "requests" ? (
        <DataTable
          columns={[
            { key: "id", label: "ID", render: (r) => r.id.slice(0, 10) + "…" },
            { key: "borrowerVenueId", label: "Borrower" },
            { key: "lenderVenueId", label: "Lender" },
            { key: "status", label: "Status" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <button
                  type="button"
                  onClick={() => setRequestStatus(row.id, "declined")}
                  className="text-[10px] font-bold uppercase text-rose-400"
                >
                  Decline
                </button>
              ),
            },
          ]}
          rows={requests.map((r) => ({ ...r, _key: r.id }))}
          emptyMessage="No borrow requests."
        />
      ) : (
        <DataTable
          columns={[
            { key: "title", label: "Item" },
            { key: "lenderVenueId", label: "Lender" },
            { key: "category", label: "Category" },
            {
              key: "isActive",
              label: "Active",
              render: (r) => (r.isActive !== false ? "Yes" : "No"),
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <button
                  type="button"
                  onClick={() => deactivateListing(row.id)}
                  className="text-[10px] font-bold uppercase text-amber-400"
                >
                  Deactivate
                </button>
              ),
            },
          ]}
          rows={listings.map((r) => ({ ...r, _key: r.id }))}
          emptyMessage="No listings."
        />
      )}
    </AdminShell>
  );
}
