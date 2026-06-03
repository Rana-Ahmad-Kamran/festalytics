"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";
import { BORROW_STATUS } from "@/lib/firestore/borrowHub";

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "in_transit", label: "In transit" },
  { value: "returned", label: "Returned" },
  { value: "declined", label: "Declined" },
];

function VenueAvatar({ name, variant = "borrower" }) {
  const initials = (name || "V")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const gradient =
    variant === "lender"
      ? "from-emerald-600/80 to-teal-700/80"
      : "from-violet-600/80 to-rose-600/80";
  return (
    <div
      className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-black shrink-0 border border-slate-700/50`}
    >
      {initials}
    </div>
  );
}

function LifecycleBadge({ lifecycleKey, label }) {
  const styles = {
    requested: "border-rose-500/50 bg-rose-500/10 text-rose-300",
    approved: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    in_transit: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    returned: "border-slate-500/50 bg-slate-800/80 text-slate-400",
    declined: "border-rose-500/40 bg-rose-500/5 text-rose-400",
    cancelled: "border-slate-600 bg-slate-800 text-slate-500",
    other: "border-slate-600 bg-slate-800 text-slate-400",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
        styles[lifecycleKey] || styles.other
      }`}
    >
      {label}
    </span>
  );
}

function BorrowActionsMenu({ row, onClose, onStatus, onDeactivate }) {
  const isListing = row._type === "listing";

  if (isListing) {
    return (
      <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
        <Link
          href={`/admin/venues/${row.lenderVenueId}`}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">apartment</span>
          View lender venue
        </Link>
        <Link
          href={`/admin/bookings?venueId=${encodeURIComponent(row.lenderVenueId)}`}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">event</span>
          Venue bookings
        </Link>
        {row.isActive && (
          <button
            type="button"
            onClick={() => {
              onDeactivate(row.id);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-400 hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            Deactivate listing
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-20 min-w-[220px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
      <Link
        href={`/admin/venues/${row.borrowerVenueId}`}
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">storefront</span>
        Borrower venue
      </Link>
      <Link
        href={`/admin/venues/${row.lenderVenueId}`}
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">apartment</span>
        Lender venue
      </Link>
      <Link
        href={`/admin/chats?q=${encodeURIComponent(row.borrowerVenueId)}`}
        onClick={onClose}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">forum</span>
        Related chats
      </Link>
      <div className="border-t border-slate-800 my-1" />
      {row.lifecycleKey === "requested" && (
        <>
          <button
            type="button"
            onClick={() => {
              onStatus(row.id, BORROW_STATUS.APPROVED);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Approve
          </button>
          <button
            type="button"
            onClick={() => {
              onStatus(row.id, BORROW_STATUS.DECLINED);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Decline
          </button>
        </>
      )}
      {(row.lifecycleKey === "approved" || row.status === BORROW_STATUS.LEGACY_ACCEPTED) && (
        <button
          type="button"
          onClick={() => {
            onStatus(row.id, BORROW_STATUS.IN_USE);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Mark in transit
        </button>
      )}
      {row.lifecycleKey === "in_transit" && (
        <button
          type="button"
          onClick={() => {
            onStatus(row.id, BORROW_STATUS.RETURNED_SETTLED);
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">assignment_return</span>
          Mark returned
        </button>
      )}
    </div>
  );
}

function exportLogsCsv(requests, listings) {
  const header =
    "type,id,borrower,lender,item,status_or_active,quantity\n";
  const reqRows = requests
    .map(
      (r) =>
        `"request","${r.id}","${r.borrowerDisplayName}","${r.lenderDisplayName}","${r.itemTitle}","${r.lifecycleLabel}",${r.itemQuantity}`
    )
    .join("\n");
  const listRows = listings
    .map(
      (l) =>
        `"listing","${l.id}","","${l.lenderDisplayName}","${l.title}","${l.isActive ? "active" : "inactive"}",${l.availableStockQuantity}`
    )
    .join("\n");
  const blob = new Blob([header + reqRows + (reqRows && listRows ? "\n" : "") + listRows], {
    type: "text/csv",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `festalytics-borrow-hub-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBorrowHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") || "requests");
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const pushQuery = useCallback(
    (nextTab, nextStatus) => {
      const params = new URLSearchParams();
      if (nextTab) params.set("tab", nextTab);
      if (nextStatus) params.set("status", nextStatus);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const qs = params.toString();
      router.push(qs ? `/admin/borrow-hub?${qs}` : "/admin/borrow-hub");
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      if (statusFilter && tab === "requests") params.set("status", statusFilter);
      const data = await adminFetch(`/api/admin/borrow-hub?${params}`);
      setRequests(data.requests || []);
      setListings(data.listings || []);
      setSummary(data.summary || null);
      setMessage("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams, statusFilter, tab]);

  useEffect(() => {
    const t = searchParams.get("tab");
    const s = searchParams.get("status");
    if (t) setTab(t);
    if (s !== null) setStatusFilter(s);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const setRequestStatus = async (id, status) => {
    try {
      await adminFetch("/api/admin/borrow-hub", {
        method: "PATCH",
        body: JSON.stringify({ type: "request", id, status }),
      });
      setMessage("Request status updated.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const deactivateListing = async (id) => {
    try {
      await adminFetch("/api/admin/borrow-hub", {
        method: "PATCH",
        body: JSON.stringify({ type: "listing", id, isActive: false }),
      });
      setMessage("Listing deactivated.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    pushQuery(t, t === "requests" ? statusFilter : "");
  };

  return (
    <AdminShell variant="dashboard">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
        Borrow Hub / Resource Management
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Vendor Resource Sharing
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Monitor B2B borrow requests and shared inventory listings across the network.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => exportLogsCsv(requests, listings)}
            disabled={!requests.length && !listings.length}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-slate-600 text-xs font-bold text-slate-200 hover:text-white disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export logs
          </button>
          <Link
            href="/admin/venues"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-rose-600 text-white text-xs font-black hover:bg-rose-500 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Manage venues
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            title="Refresh"
          >
            <span className={`material-symbols-outlined ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Active requests
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : summary?.activeRequests ?? 0}
              </p>
              {!loading && summary?.activeTrend != null && summary.activeTrend !== 0 && (
                <p className="text-xs text-emerald-400 mt-1 font-bold">
                  {summary.activeTrend > 0 ? "+" : ""}
                  {summary.activeTrend}% vs prior week
                </p>
              )}
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">swap_horiz</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Total listings
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : summary?.totalListings ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary?.activeListings ?? 0} active in catalog
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">inventory_2</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                In transit
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : summary?.inTransit ?? 0}
              </p>
              {summary?.inTransit > 0 && (
                <p className="text-xs text-amber-400 mt-1 font-bold">Items currently in use</p>
              )}
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">local_shipping</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Success rate
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : `${summary?.successRate ?? 0}%`}
              </p>
              <p className="text-xs text-emerald-400 mt-1">
                {summary?.completedCount ?? 0} returned & settled
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">track_changes</span>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-slate-800">
          <div className="flex gap-6">
            {["requests", "listings"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`text-sm font-black uppercase tracking-wide pb-1 border-b-2 transition-colors ${
                  tab === t
                    ? "text-rose-400 border-rose-500"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {tab === "requests" && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  pushQuery(tab, e.target.value);
                }}
                className="h-9 rounded-lg bg-slate-950 border border-slate-700 px-3 text-xs text-slate-200"
              >
                {STATUS_FILTERS.map((o) => (
                  <option key={o.value || "all"} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center ${
                viewMode === "list"
                  ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                  : "border-slate-700 text-slate-500"
              }`}
              title="List view"
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center ${
                viewMode === "grid"
                  ? "border-rose-500/50 text-rose-400 bg-rose-500/10"
                  : "border-slate-700 text-slate-500"
              }`}
              title="Grid view"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
            <Link
              href={tab === "requests" ? "/admin/venues" : "/admin/venues"}
              className="h-9 w-9 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500 hover:text-white"
              title="Venue catalog"
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </Link>
          </div>
        </div>

        {tab === "requests" && viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/80">
                  <th className="px-5 py-4 text-left">Borrower venue</th>
                  <th className="px-5 py-4 text-left">Lender venue</th>
                  <th className="px-5 py-4 text-left">Item</th>
                  <th className="px-5 py-4 text-left">Lifecycle status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      Loading requests…
                    </td>
                  </tr>
                )}
                {!loading && requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      No borrow requests yet.
                    </td>
                  </tr>
                )}
                {!loading &&
                  requests.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/25">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <VenueAvatar name={row.borrowerDisplayName} variant="borrower" />
                          <div>
                            <Link
                              href={`/admin/venues/${row.borrowerVenueId}`}
                              className="font-bold text-white hover:text-rose-300"
                            >
                              {row.borrowerDisplayName}
                            </Link>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              ID: {row.requestLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <VenueAvatar name={row.lenderDisplayName} variant="lender" />
                          <div>
                            <Link
                              href={`/admin/venues/${row.lenderVenueId}`}
                              className="font-bold text-white hover:text-rose-300"
                            >
                              {row.lenderDisplayName}
                            </Link>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {row.lenderContact
                                ? `Contact: ${row.lenderContact}`
                                : row.lenderVenueId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-[20px]">
                            {row.itemIcon}
                          </span>
                          <span className="font-semibold text-slate-200">{row.itemLabel}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <LifecycleBadge
                          lifecycleKey={row.lifecycleKey}
                          label={row.lifecycleLabel}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === row.id ? null : row.id)
                            }
                            className="h-9 w-9 rounded-lg border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuId === row.id && (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-10"
                                aria-label="Close"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <BorrowActionsMenu
                                row={{ ...row, _type: "request" }}
                                onClose={() => setOpenMenuId(null)}
                                onStatus={setRequestStatus}
                                onDeactivate={deactivateListing}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "requests" && viewMode === "grid" && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading && <p className="text-slate-500 col-span-full">Loading…</p>}
            {!loading && requests.length === 0 && (
              <p className="text-slate-500 col-span-full py-8 text-center">No borrow requests.</p>
            )}
            {requests.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <p className="font-mono text-[10px] text-slate-500">{row.requestLabel}</p>
                  <LifecycleBadge lifecycleKey={row.lifecycleKey} label={row.lifecycleLabel} />
                </div>
                <p className="font-bold text-white">{row.itemLabel}</p>
                <p className="text-xs text-slate-400">
                  {row.borrowerDisplayName} → {row.lenderDisplayName}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/venues/${row.borrowerVenueId}`}
                    className="text-[10px] font-bold text-rose-400"
                  >
                    Borrower
                  </Link>
                  <Link
                    href={`/admin/venues/${row.lenderVenueId}`}
                    className="text-[10px] font-bold text-slate-400"
                  >
                    Lender
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "listings" && viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/80">
                  <th className="px-5 py-4 text-left">Lender venue</th>
                  <th className="px-5 py-4 text-left">Item</th>
                  <th className="px-5 py-4 text-left">Stock</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      Loading listings…
                    </td>
                  </tr>
                )}
                {!loading && listings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500">
                      No inventory listings. Vendors enable Borrow Hub in their dashboard.
                    </td>
                  </tr>
                )}
                {!loading &&
                  listings.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/25">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <VenueAvatar name={row.lenderDisplayName} variant="lender" />
                          <div>
                            <Link
                              href={`/admin/venues/${row.lenderVenueId}`}
                              className="font-bold text-white hover:text-rose-300"
                            >
                              {row.lenderDisplayName}
                            </Link>
                            <p className="text-[10px] text-slate-500 font-mono">{row.lenderVenueId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-slate-500">
                            {row.categoryIcon}
                          </span>
                          <span className="font-semibold text-white">{row.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {row.availableStockQuantity} / {row.totalStockQuantity}{" "}
                        <span className="text-slate-500">{row.listingType}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${
                            row.isActive
                              ? "border-emerald-500/40 text-emerald-400"
                              : "border-slate-600 text-slate-500"
                          }`}
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === `listing-${row.id}` ? null : `listing-${row.id}`
                              )
                            }
                            className="h-9 w-9 rounded-lg border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuId === `listing-${row.id}` && (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-10"
                                aria-label="Close"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <BorrowActionsMenu
                                row={{ ...row, _type: "listing" }}
                                onClose={() => setOpenMenuId(null)}
                                onStatus={setRequestStatus}
                                onDeactivate={deactivateListing}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "listings" && viewMode === "grid" && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {listings.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-slate-500">
                    {row.categoryIcon}
                  </span>
                  <p className="font-bold text-white">{row.title}</p>
                </div>
                <Link
                  href={`/admin/venues/${row.lenderVenueId}`}
                  className="text-xs text-rose-400 font-bold"
                >
                  {row.lenderDisplayName}
                </Link>
                <p className="text-xs text-slate-500 mt-2">
                  Stock: {row.availableStockQuantity} · {row.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
