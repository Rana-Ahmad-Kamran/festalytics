"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";

const ROLE_FILTERS = [
  { id: "", label: "All" },
  { id: "user", label: "User" },
  { id: "vendor", label: "Vendor" },
  { id: "admin", label: "Admin" },
];

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function roleLabel(role) {
  if (role === "user") return "Customer";
  if (role === "vendor") return "Vendor";
  if (role === "admin") return "Admin";
  return role || "—";
}

function RoleBadge({ role }) {
  if (role === "admin") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-md border border-emerald-500/50 text-emerald-400 text-[10px] font-black uppercase tracking-wide">
        Admin
      </span>
    );
  }
  if (role === "vendor") {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-md border border-rose-500/50 text-rose-400 text-[10px] font-black uppercase tracking-wide">
        Vendor
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded-md border border-slate-600 text-slate-300 text-[10px] font-black uppercase tracking-wide">
      Customer
    </span>
  );
}

function UserAvatar({ name, role }) {
  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bg =
    role === "admin"
      ? "from-emerald-600 to-teal-700"
      : role === "vendor"
        ? "from-rose-600 to-pink-700"
        : "from-slate-600 to-slate-700";

  return (
    <div
      className={`h-10 w-10 rounded-full bg-gradient-to-br ${bg} flex items-center justify-center text-white text-xs font-black shrink-0 border border-slate-700/50`}
    >
      {initials}
    </div>
  );
}

function UserActionsMenu({ row, onClose }) {
  const items = [
    { href: `/admin/users/${row.uid}`, label: "View profile", icon: "person" },
    { href: `/admin/users/${row.uid}`, label: "Edit user", icon: "edit" },
  ];

  if (row.venueId) {
    items.push({
      href: `/admin/venues/${row.venueId}`,
      label: "View venue",
      icon: "apartment",
    });
  }

  if (row.pendingVendorOnboarding || (row.role === "vendor" && !row.venueId)) {
    items.push({
      href: "/admin/onboarding",
      label: "Onboarding queue",
      icon: "person_add",
    });
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
      {items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(20);
  const [openMenuUid, setOpenMenuUid] = useState(null);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setRole(searchParams.get("role") || "");
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (role) params.set("role", role);
      const data = await adminFetch(`/api/admin/users?${params}`);
      setUsers(data.users || []);
      setSummary(data.summary || null);
      setMessage("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, role]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [role, q]);

  const total = users.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * rowsPerPage;
  const pageUsers = users.slice(pageStart, pageStart + rowsPerPage);

  const applyRole = (id) => {
    const params = new URLSearchParams();
    if (id) params.set("role", id);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/users?${qs}` : "/admin/users");
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/users?${qs}` : "/admin/users");
  };

  const rangeLabel = useMemo(() => {
    if (total === 0) return "Showing 0 of 0 users";
    const from = pageStart + 1;
    const to = Math.min(pageStart + rowsPerPage, total);
    return `Showing ${from}–${to} of ${total.toLocaleString()} users`;
  }, [pageStart, rowsPerPage, total]);

  const totalDisplay = summary?.totalUsers ?? total;
  const vendorDisplay = summary?.activeVendors ?? summary?.vendorCount ?? 0;

  return (
    <AdminShell variant="dashboard">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
            User Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Manage your global ecosystem of participants and partners.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Total Users
            </p>
            <p className="text-2xl font-black text-rose-400 mt-1">
              {loading ? "—" : formatCount(totalDisplay)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 min-w-[140px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Active Vendors
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {loading ? "—" : vendorDisplay.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-6 md:hidden">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
            search
          </span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search across users, vendors, and IDs…"
            className="w-full h-11 pl-12 pr-4 rounded-full bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 outline-none focus:border-rose-500/60"
          />
        </div>
      </form>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline">
            Filter by Role
          </span>
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.id || "all"}
              type="button"
              onClick={() => applyRole(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                role === f.id
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20"
                  : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
          <Link
            href="/admin/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-slate-400 text-xs font-bold uppercase hover:text-white hover:border-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Advanced Filters
          </Link>
        </div>

        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50 self-end lg:self-center"
          title="Refresh"
        >
          <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>
            refresh
          </span>
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Venue Slug</th>
                <th className="px-5 py-4">Onboarding</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    Loading users…
                  </td>
                </tr>
              )}
              {!loading && pageUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
              {!loading &&
                pageUsers.map((row) => {
                  const onboardingDone =
                    row.onboardingComplete ||
                    (row.role === "user" && !row.pendingVendorOnboarding);
                  const onboardingPending =
                    row.pendingVendorOnboarding ||
                    (row.role === "vendor" && !row.venueId && !row.onboardingComplete);

                  return (
                    <tr
                      key={row.uid}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${row.uid}`}
                          className="flex items-center gap-3 group"
                        >
                          <UserAvatar name={row.fullName} role={row.role} />
                          <span className="font-bold text-white group-hover:text-rose-300 transition-colors">
                            {row.fullName || "Unnamed"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/users/${row.uid}`}
                          className="text-rose-300/90 hover:text-rose-200 text-sm"
                        >
                          {row.email || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={row.role} />
                      </td>
                      <td className="px-5 py-4">
                        {row.venueId ? (
                          <Link
                            href={`/admin/venues/${row.venueId}`}
                            className="font-mono text-xs text-slate-300 hover:text-rose-300 transition-colors"
                          >
                            {row.venueId}
                          </Link>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {onboardingPending ? (
                          <Link
                            href="/admin/onboarding"
                            className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold hover:text-amber-300"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              pending_actions
                            </span>
                            Pending
                          </Link>
                        ) : onboardingDone || row.role !== "vendor" ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                            <span className="material-symbols-outlined text-[18px]">
                              check_circle
                            </span>
                            Done
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuUid(openMenuUid === row.uid ? null : row.uid)
                            }
                            className="h-9 w-9 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                            aria-label="Actions"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuUid === row.uid && (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-10 cursor-default"
                                aria-label="Close menu"
                                onClick={() => setOpenMenuUid(null)}
                              />
                              <UserActionsMenu row={row} onClose={() => setOpenMenuUid(null)} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-800 bg-slate-900/50">
          <p className="text-xs text-slate-500">{rangeLabel}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(1)}
              className="px-2 py-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-white disabled:opacity-30"
            >
              First
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: Math.min(5, pageCount) }, (_, i) => {
              let pageNum = i + 1;
              if (pageCount > 5) {
                const start = Math.max(1, Math.min(safePage - 2, pageCount - 4));
                pageNum = start + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold ${
                    safePage === pageNum
                      ? "bg-rose-600 text-white"
                      : "border border-slate-700 text-slate-400 hover:text-white"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
            <button
              type="button"
              disabled={safePage >= pageCount}
              onClick={() => setPage(pageCount)}
              className="px-2 py-1.5 text-[10px] font-bold uppercase text-slate-500 hover:text-white disabled:opacity-30"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
