"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import MetricCard from "@/components/admin/MetricCard";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";

const DISMISS_KEY = "festalytics_admin_dismissed_alerts";

function formatRs(amount) {
  const n = Number(amount) || 0;
  if (n >= 1_000_000) return `Rs ${(n / 1_000_000).toFixed(2)}M`;
  return `Rs ${n.toLocaleString("en-PK")}`;
}

function timeAgo(iso) {
  if (!iso) return "Recently";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DISMISS_KEY);
      if (raw) setDismissed(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  const dismissAlert = (id) => {
    const next = { ...dismissed, [id]: true };
    setDismissed(next);
    sessionStorage.setItem(DISMISS_KEY, JSON.stringify(next));
  };

  const alertCount =
    (stats?.unownedVenues > 0 && !dismissed.unowned ? 1 : 0) +
    (stats?.stuckOnboarding > 0 && !dismissed.onboarding ? 1 : 0);

  const quickActions = [
    {
      href: "/admin/venues",
      icon: "apartment",
      title: "Manage Venues",
      desc: "Update details & availability",
    },
    {
      href: "/admin/onboarding",
      icon: "hourglass_top",
      title: "Onboarding Queue",
      desc: stats
        ? `Verify ${stats.stuckOnboarding} new partner${stats.stuckOnboarding === 1 ? "" : "s"}`
        : "Verify new partners",
    },
    {
      href: "/admin/quotations",
      icon: "payments",
      title: "Quotations",
      desc: stats
        ? `Review ${stats.pendingQuotations} active bid${stats.pendingQuotations === 1 ? "" : "s"}`
        : "Review active bids",
    },
    {
      href: "/admin/users",
      icon: "manage_accounts",
      title: "Users",
      desc: "Manage role permissions",
    },
  ];

  const chart = stats?.chart;
  const maxBar = chart?.max || 1;

  return (
    <AdminShell variant="dashboard">
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm p-4">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time insights across your venue ecosystem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/venues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-900/80 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Filter
          </Link>
          <Link
            href="/admin/quotations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:from-rose-500 hover:to-pink-500 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            New Quotation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total Venues"
          value={stats ? stats.totalVenues.toLocaleString() : "—"}
          hint={stats ? `${stats.activeVenues} active listings` : "—"}
          hintTone="success"
          icon="location_on"
          iconBg="bg-slate-800/80"
        />
        <MetricCard
          label="Pending Quotations"
          value={stats ? stats.pendingQuotations.toLocaleString() : "—"}
          hint="Awaiting vendor approval"
          hintTone="warning"
          icon="description"
          iconBg="bg-amber-500/10"
        />
        <MetricCard
          label="Total Bookings"
          value={stats ? stats.totalBookings.toLocaleString() : "—"}
          hint={stats?.totalBookings > 0 ? "All sources combined" : "No bookings yet"}
          hintTone="success"
          icon="event_available"
          iconBg="bg-emerald-500/10"
        />
        <MetricCard
          label="Stuck Onboarding"
          value={stats ? stats.stuckOnboarding.toLocaleString() : "—"}
          hint={stats?.stuckOnboarding > 0 ? "Action required" : "All clear"}
          hintTone={stats?.stuckOnboarding > 0 ? "danger" : "success"}
          icon="person_add"
          iconBg="bg-rose-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Quick Actions
              </h2>
              <Link
                href="/admin/onboarding"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                View all tasks →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-slate-800/50 transition-all"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-rose-300">
                      {action.icon}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{action.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Network Growth (7D)
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Venues
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Bookings
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-40">
              {chart?.labels?.map((label, i) => {
                const vH = Math.round(((chart.venues[i] || 0) / maxBar) * 100);
                const bH = Math.round(((chart.bookings[i] || 0) / maxBar) * 100);
                const isPeak = i === 2;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex items-end justify-center gap-1 h-32">
                      <div
                        className={`w-2 rounded-t-md ${isPeak ? "bg-rose-500/80" : "bg-rose-500/30"}`}
                        style={{ height: `${Math.max(vH, 8)}%` }}
                      />
                      <div
                        className={`w-2 rounded-t-md ${isPeak ? "bg-emerald-500/80" : "bg-emerald-500/30"}`}
                        style={{ height: `${Math.max(bH, 8)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{label}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Critical Alerts
              </h2>
              {alertCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black">
                  {alertCount} NEW
                </span>
              )}
            </div>
            <div className="space-y-3">
              {stats?.unownedVenues > 0 && !dismissed.unowned && (
                <div className="rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
                  <p className="font-bold text-white text-sm">
                    {stats.unownedVenues} Unowned Venue{stats.unownedVenues === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Multiple venue listings have no assigned administrator. Assign owners to
                    enable vendor ERP access.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/admin/venues?filter=unowned"
                      className="px-4 py-2 rounded-full bg-rose-600 text-xs font-bold text-white hover:bg-rose-500"
                    >
                      Assign Now
                    </Link>
                    <button
                      type="button"
                      onClick={() => dismissAlert("unowned")}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {stats?.stuckOnboarding > 0 && !dismissed.onboarding && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
                  <p className="font-bold text-white text-sm">Onboarding backlog</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {stats.stuckOnboarding} vendor{stats.stuckOnboarding === 1 ? "" : "s"} need
                    venue linking or email verification.
                  </p>
                  <Link
                    href="/admin/onboarding"
                    className="inline-block mt-3 px-4 py-2 rounded-full bg-amber-600/90 text-xs font-bold text-white hover:bg-amber-500"
                  >
                    Open queue
                  </Link>
                </div>
              )}

              {stats?.pendingQuotations > 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-800/30 p-4">
                  <p className="font-bold text-white text-sm">
                    {stats.pendingQuotations} pending quotation
                    {stats.pendingQuotations === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting vendor approval on ERP.</p>
                  <Link
                    href="/admin/quotations"
                    className="inline-block mt-2 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    Review quotations →
                  </Link>
                </div>
              )}

              {alertCount === 0 && stats && (
                <p className="text-sm text-slate-500 text-center py-4">No critical alerts.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
              Recent Transactions
            </h2>
            <ul className="space-y-3">
              {(stats?.recentBookings || []).length === 0 && (
                <li className="text-sm text-slate-500 py-2">No recent bookings.</li>
              )}
              {stats?.recentBookings?.map((b) => (
                <li key={b.id}>
                  <Link
                    href={
                      b.targetVenueId
                        ? `/admin/bookings?venueId=${encodeURIComponent(b.targetVenueId)}`
                        : `/admin/bookings?q=${encodeURIComponent(b.id)}`
                    }
                    className="flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-rose-300 truncate">
                        Booking #{b.id.slice(0, 8)} · {b.status}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {b.targetVenueId || "Venue"} · {timeAgo(b.updatedAt)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-emerald-400 shrink-0">
                      {formatRs(b.amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/admin/settings"
              className="block mt-4 text-center text-xs font-semibold text-slate-500 hover:text-rose-400"
            >
              View Audit Log →
            </Link>
          </section>
        </div>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
