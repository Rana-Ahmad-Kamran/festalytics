"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Cancelled", label: "Cancelled" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "walk-in", label: "Walk-in ERP" },
  { value: "online", label: "Online Portal" },
];

function formatRs(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `PKR ${Math.round(n / 1_000)}k`;
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function formatRsShort(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

function StatusBadge({ status }) {
  const s = String(status || "Pending");
  if (s === "Confirmed") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        Confirmed
      </span>
    );
  }
  if (s === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-500/50 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase">
        <span className="material-symbols-outlined text-[14px]">cancel</span>
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase">
      Pending
    </span>
  );
}

function SourceBadge({ source }) {
  const isWalkIn = source === "Walk-in ERP";
  return (
    <span
      className={`inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase border ${
        isWalkIn
          ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
          : "border-sky-500/40 bg-sky-500/10 text-sky-300"
      }`}
    >
      {source || "—"}
    </span>
  );
}

function CustomerAvatar({ name }) {
  const initials = (name || "C")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
      {initials}
    </div>
  );
}

function customerHref(row) {
  if (row.userId) return `/admin/users/${row.userId}`;
  const q = row.customerContact || row.customerName;
  return q && q !== "—" ? `/admin/users?q=${encodeURIComponent(q)}` : "/admin/users";
}

function BookingActionsMenu({ row, onClose, onStatus }) {
  const items = [
    {
      label: "View customer",
      icon: "person",
      href: customerHref(row),
    },
    {
      label: "View venue",
      icon: "apartment",
      href: row.targetVenueId ? `/admin/venues/${row.targetVenueId}` : "/admin/venues",
    },
    {
      label: "Related quotations",
      icon: "request_quote",
      href: row.targetVenueId
        ? `/admin/quotations?venueId=${encodeURIComponent(row.targetVenueId)}`
        : "/admin/quotations",
    },
    {
      label: "Vendor chats",
      icon: "forum",
      href: "/admin/chats",
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-1 z-20 min-w-[220px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          {item.label}
        </Link>
      ))}
      <div className="border-t border-slate-800 my-1" />
      {row.status !== "Confirmed" && (
        <button
          type="button"
          onClick={() => {
            onStatus(row.id, "Confirmed");
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">check</span>
          Confirm booking
        </button>
      )}
      {row.status !== "Cancelled" && (
        <button
          type="button"
          onClick={() => {
            onStatus(row.id, "Cancelled");
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Cancel booking
        </button>
      )}
      {row.status !== "Pending" && (
        <button
          type="button"
          onClick={() => {
            onStatus(row.id, "Pending");
            onClose();
          }}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-amber-300 hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          Mark pending
        </button>
      )}
    </div>
  );
}

function exportCsv(rows) {
  const header =
    "id,customer,contact,venue,event_date,service,source,guests,amount_pkr,status\n";
  const body = rows
    .map(
      (r) =>
        `"${r.id}","${r.customerName}","${r.customerContact}","${r.targetVenueId}","${r.eventDate}","${r.service}","${r.source}",${r.guestCount ?? ""},${r.amount},"${r.status}"`
    )
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `festalytics-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminBookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [venueSlugs, setVenueSlugs] = useState([]);
  const [venuePerformance, setVenuePerformance] = useState([]);
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [source, setSource] = useState(searchParams.get("source") || "");
  const [venueId, setVenueId] = useState(searchParams.get("venueId") || "");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [lastConfirmed, setLastConfirmed] = useState(null);

  const pushFilters = useCallback(
    (nextStatus, nextVenue, nextSource) => {
      const params = new URLSearchParams();
      if (nextStatus) params.set("status", nextStatus);
      if (nextVenue) params.set("venueId", nextVenue);
      if (nextSource) params.set("source", nextSource);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const qs = params.toString();
      router.push(qs ? `/admin/bookings?${qs}` : "/admin/bookings");
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (venueId) params.set("venueId", venueId);
      if (source) params.set("source", source);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const data = await adminFetch(`/api/admin/bookings?${params}`);
      setRows(data.bookings || []);
      setSummary(data.summary || null);
      setVenueSlugs(data.venueSlugs || []);
      setVenuePerformance(data.venuePerformance || []);
      const confirmed = (data.bookings || []).find((r) => r.status === "Confirmed");
      if (confirmed) setLastConfirmed(confirmed);
      setMessage("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, venueId, source, searchParams]);

  useEffect(() => {
    const s = searchParams.get("status");
    const v = searchParams.get("venueId");
    const src = searchParams.get("source");
    if (s !== null) setStatus(s);
    if (v !== null) setVenueId(v);
    if (src !== null) setSource(src);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await adminFetch("/api/admin/bookings", {
        method: "PATCH",
        body: JSON.stringify({ id, status: nextStatus }),
      });
      setMessage(`Booking updated to ${nextStatus}.`);
      if (nextStatus === "Confirmed") {
        const row = rows.find((r) => r.id === id);
        if (row) setLastConfirmed(row);
      }
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * rowsPerPage;
  const pageRows = rows.slice(pageStart, pageStart + rowsPerPage);

  const barColor = (rate) => {
    if (rate >= 85) return "bg-rose-500";
    if (rate >= 70) return "bg-emerald-500";
    return "bg-amber-500";
  };

  return (
    <AdminShell variant="dashboard">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
        Bookings / Transaction Ledger
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Marketplace Bookings
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Walk-in ERP entries and online portal reservations across all venues.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={venueId}
            onChange={(e) => {
              setVenueId(e.target.value);
              pushFilters(status, e.target.value, source);
            }}
            className="h-10 rounded-full bg-slate-900 border border-slate-700 px-4 text-xs font-semibold text-slate-200 outline-none focus:border-rose-500/60"
          >
            <option value="">All Venues</option>
            {venueSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              pushFilters(e.target.value, venueId, source);
            }}
            className="h-10 rounded-full bg-slate-900 border border-slate-700 px-4 text-xs font-semibold text-slate-200 outline-none focus:border-rose-500/60"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              pushFilters(status, venueId, e.target.value);
            }}
            className="h-10 rounded-full bg-slate-900 border border-slate-700 px-4 text-xs font-semibold text-slate-200 outline-none focus:border-rose-500/60"
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => exportCsv(rows)}
            disabled={!rows.length}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-slate-600 text-xs font-bold text-slate-200 hover:text-white disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-50"
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
                Pending Bookings
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : summary?.pendingCount ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary?.totalCount ?? 0} total in ledger
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">event_note</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Confirmed Revenue
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : formatRsShort(summary?.totalRevenue ?? 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Avg {loading ? "—" : formatRsShort(summary?.avgBookingValue ?? 0)} per deal
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">payments</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Confirmation Rate
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : `${summary?.confirmationRate ?? 0}%`}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, summary?.confirmationRate ?? 0)}%` }}
                />
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl ml-2">bolt</span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Channel Mix
              </p>
              <p className="text-xl font-black text-white mt-2">
                {loading ? "—" : `${summary?.walkInCount ?? 0} walk-in`}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary?.onlineCount ?? 0} online portal
              </p>
            </div>
            <span className="material-symbols-outlined text-violet-400/80 text-3xl">
              storefront
            </span>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/80">
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4 text-left">Venue</th>
                <th className="px-5 py-4 text-left">Event Date</th>
                <th className="px-5 py-4 text-left">Service</th>
                <th className="px-5 py-4 text-left">Source</th>
                <th className="px-5 py-4 text-left">Amount</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    Loading bookings…
                  </td>
                </tr>
              )}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-500">
                    No bookings match filters.
                  </td>
                </tr>
              )}
              {!loading &&
                pageRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/25">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CustomerAvatar name={row.customerName} />
                        <div>
                          <Link
                            href={customerHref(row)}
                            className="font-bold text-white hover:text-rose-300"
                          >
                            {row.customerName}
                          </Link>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: #{row.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={
                          row.targetVenueId
                            ? `/admin/venues/${row.targetVenueId}`
                            : "/admin/venues"
                        }
                        className="inline-flex px-2 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300 hover:text-rose-300"
                      >
                        {row.targetVenueId || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-300">
                      <p>{row.eventDate || "—"}</p>
                      {row.timing && (
                        <p className="text-[10px] text-slate-500">{row.timing}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">{row.service}</p>
                      {row.guestCount != null && (
                        <p className="text-xs text-slate-500">{row.guestCount} guests</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <SourceBadge source={row.source} />
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">{formatRs(row.amount)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => updateStatus(row.id, "Confirmed")}
                            className="h-9 px-3 rounded-lg border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase hover:bg-emerald-500/10"
                            title="Quick confirm"
                          >
                            Confirm
                          </button>
                        )}
                        <div className="relative">
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
                              <BookingActionsMenu
                                row={row}
                                onClose={() => setOpenMenuId(null)}
                                onStatus={updateStatus}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-500">
            Showing {total === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + rowsPerPage, total)}{" "}
            of {total} bookings
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`h-8 min-w-[32px] rounded-lg text-xs font-bold ${
                    safePage === n
                      ? "bg-rose-600 text-white"
                      : "border border-slate-700 text-slate-400"
                  }`}
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
            Venue Booking Performance
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Confirmed bookings as a share of all ledger entries per venue.
          </p>
          <div className="space-y-4">
            {venuePerformance.length === 0 && (
              <p className="text-sm text-slate-500">No venue data yet.</p>
            )}
            {venuePerformance.map((v) => (
              <Link
                key={v.slug}
                href={`/admin/bookings?venueId=${encodeURIComponent(v.slug)}${status ? `&status=${status}` : ""}${source ? `&source=${source}` : ""}`}
                className="block group"
              >
                <div className="flex justify-between text-[10px] font-black uppercase tracking-wide mb-1">
                  <span className="text-slate-400 group-hover:text-rose-300">{v.slug}</span>
                  <span className="text-white">{v.rate}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(v.rate)} transition-all`}
                    style={{ width: `${v.rate}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-600/20 to-pink-600/10 p-6 flex flex-col">
          {lastConfirmed && (
            <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-emerald-200 text-xs font-bold mb-4">
              Booking confirmed — {lastConfirmed.customerName}
            </div>
          )}
          <p className="text-sm text-slate-200 flex-1">
            Filter by walk-in or online source, confirm pending reservations, or jump to related
            quotations and vendor messaging.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/admin/quotations"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-black hover:bg-slate-900 transition-colors"
            >
              View quotations
            </Link>
            <Link
              href="/admin/chats"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-600 text-sm font-bold text-slate-200 hover:text-white"
            >
              Open chats
            </Link>
          </div>
        </section>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
