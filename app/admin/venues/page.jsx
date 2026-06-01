"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams({ filter, q });
    const data = await adminFetch(`/api/admin/venues?${params}`);
    setVenues(data.venues || []);
  }, [filter, q]);

  useEffect(() => {
    load().catch((e) => setMessage(e.message));
  }, [load]);

  const toggleActive = async (slug, current) => {
    try {
      await adminFetch("/api/admin/venues", {
        method: "PATCH",
        body: JSON.stringify({ slug, serviceActive: !current }),
      });
      setMessage(`Updated ${slug}`);
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Hall",
      render: (row) => (
        <Link href={`/admin/venues/${row.slug}`} className="text-rose-400 hover:underline font-semibold">
          {row.name}
        </Link>
      ),
    },
    { key: "slug", label: "Slug" },
    { key: "area", label: "Area" },
    {
      key: "serviceActive",
      label: "Listed",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            row.serviceActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-700 text-slate-400"
          }`}
        >
          {row.serviceActive ? "Active" : "Hidden"}
        </span>
      ),
    },
    {
      key: "ownerId",
      label: "Owner",
      render: (row) =>
        row.ownerId ? (
          <span className="font-mono text-xs">{row.ownerId.slice(0, 8)}…</span>
        ) : (
          <span className="text-amber-400 text-xs">Unassigned</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          type="button"
          onClick={() => toggleActive(row.slug, row.serviceActive)}
          className="text-xs font-bold uppercase text-slate-300 hover:text-white"
        >
          {row.serviceActive ? "Hide" : "Publish"}
        </button>
      ),
    },
  ];

  return (
    <AdminShell title="Venues" subtitle="All halls / tenants">
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search name, slug, area…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 min-w-[200px] rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
          <option value="unowned">Unowned</option>
        </select>
        <button
          type="button"
          onClick={() => load()}
          className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold uppercase"
        >
          Refresh
        </button>
      </div>

      {message && (
        <p className="mb-4 text-sm text-slate-400">{message}</p>
      )}

      <DataTable
        columns={columns}
        rows={venues.map((v) => ({ ...v, _key: v.slug }))}
        emptyMessage="No venues match your filters."
      />
    </AdminShell>
  );
}
