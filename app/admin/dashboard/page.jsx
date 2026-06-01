"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import MetricCard from "@/components/admin/MetricCard";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <AdminShell title="Dashboard" subtitle="Platform overview">
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm p-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Total venues"
          value={stats ? stats.totalVenues : "—"}
          hint={`${stats?.activeVenues ?? "—"} active listings`}
          accent="rose"
        />
        <MetricCard
          label="Pending quotes"
          value={stats ? stats.pendingQuotations : "—"}
          hint="Awaiting vendor approval"
          accent="amber"
        />
        <MetricCard
          label="Total bookings"
          value={stats ? stats.totalBookings : "—"}
          hint="All sources"
          accent="emerald"
        />
        <MetricCard
          label="Stuck onboarding"
          value={stats ? stats.stuckOnboarding : "—"}
          hint={`${stats?.vendorUsers ?? "—"} vendor accounts`}
          accent="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
            Quick actions
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/admin/venues", label: "Manage venues" },
              { href: "/admin/onboarding", label: "Onboarding queue" },
              { href: "/admin/quotations", label: "Quotations" },
              { href: "/admin/users", label: "Users" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-full bg-slate-800 text-sm font-semibold text-slate-200 hover:bg-rose-600 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
            Alerts
          </h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>
              Unowned venues:{" "}
              <span className="font-bold text-white">{stats?.unownedVenues ?? "—"}</span>
            </li>
            <li>
              Total users:{" "}
              <span className="font-bold text-white">{stats?.totalUsers ?? "—"}</span>
            </li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
