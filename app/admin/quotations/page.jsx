"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";
import { QUOTATION_STATUS } from "@/lib/firestore/quotations";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: QUOTATION_STATUS.PENDING, label: "Pending vendor approval" },
  { value: QUOTATION_STATUS.CONFIRMED, label: "Confirmed" },
  { value: QUOTATION_STATUS.DECLINED, label: "Declined" },
  { value: QUOTATION_STATUS.COUNTER, label: "Counter offer" },
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
  const s = String(status || "").toLowerCase();
  if (s === QUOTATION_STATUS.CONFIRMED) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        Confirmed
      </span>
    );
  }
  if (s === QUOTATION_STATUS.DECLINED) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-500/50 bg-rose-500/10 text-rose-400 text-[10px] font-black uppercase">
        <span className="material-symbols-outlined text-[14px]">cancel</span>
        Declined
      </span>
    );
  }
  if (s === QUOTATION_STATUS.COUNTER) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-500/50 bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase">
        Counter-Offer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-amber-500/50 bg-amber-500/10 text-amber-300 text-[10px] font-black uppercase">
      Pending
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

function QuotationActionsMenu({ row, onClose, onStatus }) {
  const items = [
    {
      label: "View customer",
      icon: "person",
      href: row.userId ? `/admin/users/${row.userId}` : "/admin/users",
    },
    {
      label: "View venue",
      icon: "apartment",
      href: row.targetVenueId ? `/admin/venues/${row.targetVenueId}` : "/admin/venues",
    },
    {
      label: "Vendor bookings",
      icon: "event_available",
      href: row.targetVenueId
        ? `/admin/bookings?venueId=${encodeURIComponent(row.targetVenueId)}`
        : "/admin/bookings",
    },
  ];

  return (
    <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
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
      <button
        type="button"
        onClick={() => {
          onStatus(row.id, QUOTATION_STATUS.CONFIRMED);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-400 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">check</span>
        Confirm
      </button>
      <button
        type="button"
        onClick={() => {
          onStatus(row.id, QUOTATION_STATUS.COUNTER);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-300 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
        Counter offer
      </button>
      <button
        type="button"
        onClick={() => {
          onStatus(row.id, QUOTATION_STATUS.DECLINED);
          onClose();
        }}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-slate-800"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
        Decline
      </button>
    </div>
  );
}

function exportCsv(rows) {
  const header =
    "id,customer,venue,event_date,guests,package,amount_pkr,status\n";
  const body = rows
    .map(
      (r) =>
        `"${r.id}","${r.customerName}","${r.targetVenueId}","${r.eventDate}",${r.guestCount},"${r.packageName}",${r.amount},"${r.status}"`
    )
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `festalytics-quotations-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminQuotationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [venueSlugs, setVenueSlugs] = useState([]);
  const [venuePerformance, setVenuePerformance] = useState([]);
  const [status, setStatus] = useState(
    searchParams.get("status") ?? QUOTATION_STATUS.PENDING
  );
  const [venueId, setVenueId] = useState(searchParams.get("venueId") || "");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [lastConfirmed, setLastConfirmed] = useState(null);

  const pushFilters = useCallback(
    (nextStatus, nextVenue) => {
      const params = new URLSearchParams();
      if (nextStatus) params.set("status", nextStatus);
      if (nextVenue) params.set("venueId", nextVenue);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const qs = params.toString();
      router.push(qs ? `/admin/quotations?${qs}` : "/admin/quotations");
    },
    [router, searchParams]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (venueId) params.set("venueId", venueId);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const data = await adminFetch(`/api/admin/quotations?${params}`);
      setRows(data.quotations || []);
      setSummary(data.summary || null);
      setVenueSlugs(data.venueSlugs || []);
      setVenuePerformance(data.venuePerformance || []);
      const confirmed = (data.quotations || []).find(
        (r) => r.status === QUOTATION_STATUS.CONFIRMED
      );
      if (confirmed) setLastConfirmed(confirmed);
      setMessage("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [status, venueId, searchParams]);

  useEffect(() => {
    const s = searchParams.get("status");
    const v = searchParams.get("venueId");
    if (s !== null) setStatus(s);
    if (v !== null) setVenueId(v || "");
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [status, venueId, searchParams]);

  const updateStatus = async (id, newStatus) => {
    try {
      await adminFetch("/api/admin/quotations", {
        method: "PATCH",
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (newStatus === QUOTATION_STATUS.CONFIRMED) {
        setMessage("Quotation confirmed successfully.");
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
        Quotations / Transactional Overview
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Marketplace Quotations
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Manage incoming venue requests and handle vendor approvals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={venueId}
            onChange={(e) => {
              setVenueId(e.target.value);
              pushFilters(status, e.target.value);
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
              pushFilters(e.target.value, venueId);
            }}
            className="h-10 rounded-full bg-slate-900 border border-slate-700 px-4 text-xs font-semibold text-slate-200 outline-none focus:border-rose-500/60"
          >
            {STATUS_OPTIONS.map((o) => (
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
                Pending Volume
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : summary?.pendingCount ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {summary?.totalCount ?? 0} total in system
              </p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">
              assignment
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Avg. Deal Value
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : formatRsShort(summary?.avgDealValue ?? 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Based on confirmed quotes</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl">
              payments
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Conversion Rate
              </p>
              <p className="text-3xl font-black text-white mt-2">
                {loading ? "—" : `${summary?.conversionRate ?? 0}%`}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full"
                  style={{ width: `${Math.min(100, summary?.conversionRate ?? 0)}%` }}
                />
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-3xl ml-2">
              bolt
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                System Health
              </p>
              <p className="text-xl font-black text-emerald-400 mt-2">Operational</p>
              <p className="text-xs text-slate-500 mt-1">Live Firestore sync</p>
            </div>
            <span className="material-symbols-outlined text-emerald-500/80 text-3xl">
              check_circle
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
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900/80">
                <th className="px-5 py-4 text-left">Customer Name</th>
                <th className="px-5 py-4 text-left">Venue Slug</th>
                <th className="px-5 py-4 text-left">Event Date</th>
                <th className="px-5 py-4 text-left">Guests</th>
                <th className="px-5 py-4 text-left">Package Type</th>
                <th className="px-5 py-4 text-left">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    Loading quotations…
                  </td>
                </tr>
              )}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    No quotations match filters.
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
                            href={
                              row.userId
                                ? `/admin/users/${row.userId}`
                                : "/admin/users"
                            }
                            className="font-bold text-white hover:text-rose-300"
                          >
                            {row.customerName || "Customer"}
                          </Link>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            ID: #{row.quotationId?.slice(0, 8) || row.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/venues/${row.targetVenueId}`}
                        className="inline-flex px-2 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300 hover:text-rose-300"
                      >
                        {row.targetVenueId || "—"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-300">{row.eventDate || "—"}</td>
                    <td className="px-5 py-4 text-slate-300">{row.guestCount ?? "—"}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">{row.packageName}</p>
                      <p className="text-xs text-slate-500">{formatRs(row.amount)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {row.status === QUOTATION_STATUS.COUNTER && (
                          <button
                            type="button"
                            onClick={() => updateStatus(row.id, QUOTATION_STATUS.CONFIRMED)}
                            className="h-9 w-9 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                            title="Approve counter"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              history
                            </span>
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
                              <QuotationActionsMenu
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Showing {total === 0 ? 0 : pageStart + 1}–{Math.min(pageStart + rowsPerPage, total)}{" "}
            of {total} quotations
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 rounded-lg border border-slate-700 text-slate-400 disabled:opacity-30"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
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
            Venue Performance Analysis
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Conversion efficiency by venue slug (confirmed / total quotes).
          </p>
          <div className="space-y-4">
            {venuePerformance.length === 0 && (
              <p className="text-sm text-slate-500">No venue data yet.</p>
            )}
            {venuePerformance.map((v) => (
              <Link
                key={v.slug}
                href={`/admin/quotations?venueId=${encodeURIComponent(v.slug)}${status ? `&status=${status}` : ""}`}
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
              Quotation confirmed — {lastConfirmed.customerName}
            </div>
          )}
          <p className="text-sm text-slate-200 flex-1">
            Review pending quotes by venue, confirm deals, or route counter-offers to vendor
            ERP messaging.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-slate-950 text-white text-sm font-black hover:bg-slate-900 transition-colors"
            >
              Generate Insights
            </Link>
            <Link
              href="/admin/bookings"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-slate-600 text-sm font-bold text-slate-200 hover:text-white"
            >
              View bookings
            </Link>
          </div>
        </section>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
