"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Hidden" },
  { id: "unowned", label: "Unowned" },
];

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80";

export default function AdminVenuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [togglingSlug, setTogglingSlug] = useState(null);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
    const f = searchParams.get("filter");
    if (f && FILTERS.some((x) => x.id === f)) setFilter(f);
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, q });
      const data = await adminFetch(`/api/admin/venues?${params}`);
      setVenues(data.venues || []);
      setMessage("");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter, q]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filter, q, rowsPerPage]);

  const total = venues.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * rowsPerPage;
  const pageVenues = venues.slice(pageStart, pageStart + rowsPerPage);

  const applyFilter = (id) => {
    setFilter(id);
    const params = new URLSearchParams();
    if (id !== "all") params.set("filter", id);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/venues?${qs}` : "/admin/venues");
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.push(qs ? `/admin/venues?${qs}` : "/admin/venues");
  };

  const toggleActive = async (slug, current) => {
    setTogglingSlug(slug);
    try {
      await adminFetch("/api/admin/venues", {
        method: "PATCH",
        body: JSON.stringify({ slug, serviceActive: !current }),
      });
      await load();
    } catch (e) {
      setMessage(e.message);
    } finally {
      setTogglingSlug(null);
    }
  };

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 of 0";
    const from = pageStart + 1;
    const to = Math.min(pageStart + rowsPerPage, total);
    return `${from} – ${to} of ${total}`;
  }, [pageStart, rowsPerPage, total]);

  return (
    <AdminShell variant="dashboard">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Venues</h1>
        <p className="text-sm text-slate-500 mt-1">Manage halls, listings, and vendor ownership</p>
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
            placeholder="Search halls, slugs, or areas…"
            className="w-full h-11 pl-12 pr-4 rounded-full bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 outline-none focus:border-rose-500/60"
          />
        </div>
      </form>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => applyFilter(f.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                filter === f.id
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/20"
                  : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
          <Link
            href="/admin/venues?filter=unowned"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-slate-400 text-xs font-bold uppercase hover:text-white hover:border-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            Filters
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>
            Displaying <strong className="text-slate-300">{pageVenues.length}</strong> of{" "}
            <strong className="text-slate-300">{total}</strong> venues
          </span>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="h-9 w-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-50"
            title="Refresh"
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-4">Hall Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Area (Pakistan)</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Owner ID</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    Loading venues…
                  </td>
                </tr>
              )}
              {!loading && pageVenues.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                    No venues match your filters.
                  </td>
                </tr>
              )}
              {!loading &&
                pageVenues.map((row) => (
                  <tr
                    key={row.slug}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/venues/${row.slug}`}
                        className="flex items-center gap-3 min-w-[200px]"
                      >
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60">
                          <img
                            src={(row.imageUrl || PLACEHOLDER_IMG).replace(
                              "/Marriage Hall/",
                              "/Marriage_hall/"
                            )}
                            alt={row.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = PLACEHOLDER_IMG;
                            }}
                          />
                        </div>
                        <span className="font-bold text-white group-hover:text-rose-300 transition-colors">
                          {row.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs text-slate-400 font-mono">{row.slug}</code>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <span className="material-symbols-outlined text-[16px] text-slate-500">
                          location_on
                        </span>
                        {row.locationLabel || row.area || "Lahore"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.serviceActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-black uppercase tracking-wide border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-400 text-[10px] font-black uppercase tracking-wide border border-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {row.ownerId ? (
                        <Link
                          href={`/admin/users/${row.ownerId}`}
                          className="inline-flex px-2 py-1 rounded-md bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                          title={row.ownerId}
                        >
                          {row.ownerId.slice(0, 12)}…
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/venues/${row.slug}`}
                          className="inline-flex px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-black uppercase border border-rose-500/30 hover:bg-rose-500/25"
                        >
                          Unassigned
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/venues/${row.slug}`}
                          className="h-9 w-9 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                          title="Edit venue"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button
                          type="button"
                          disabled={togglingSlug === row.slug}
                          onClick={() => toggleActive(row.slug, row.serviceActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${
                            row.serviceActive
                              ? "border-slate-700 text-slate-400 hover:border-amber-500/50 hover:text-amber-300"
                              : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {row.serviceActive ? "visibility_off" : "publish"}
                          </span>
                          {row.serviceActive ? "Hide" : "Publish"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-slate-300 text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-mono">{rangeLabel}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
