"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";

function flagStyle(flag) {
  if (flag === "PENDING_ONBOARDING") {
    return "border-amber-500/50 bg-amber-500/10 text-amber-300";
  }
  if (flag === "EMAIL_UNVERIFIED") {
    return "border-orange-500/40 bg-orange-500/10 text-orange-300";
  }
  return "border-slate-600 bg-slate-800/50 text-slate-400";
}

function VendorAvatar({ name }) {
  const initials = (name || "V")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();

  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-600 to-pink-700 flex items-center justify-center text-white text-sm font-black shrink-0 border border-slate-700/50">
      {initials}
    </div>
  );
}

function OnboardingActionsMenu({ row, onClose }) {
  const items = [
    { href: `/admin/users/${row.uid}`, label: "Resolve user", icon: "build" },
    { href: `/admin/users/${row.uid}`, label: "Edit profile", icon: "edit" },
  ];
  if (row.venueId) {
    items.push({ href: `/admin/venues/${row.venueId}`, label: "View venue", icon: "apartment" });
  } else {
    items.push({
      href: `/admin/venues?filter=unowned`,
      label: "Assign venue",
      icon: "link",
    });
  }

  return (
    <div className="absolute right-0 top-full mt-1 z-20 min-w-[180px] rounded-xl border border-slate-700 bg-slate-900 shadow-xl py-1">
      {items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function exportQueueCsv(queue) {
  const header = "email,uid,flags,stuck_hours\n";
  const rows = queue
    .map(
      (r) =>
        `"${r.email}","${r.uid}","${r.flags.join(";")}",${r.stuckHours ?? ""}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `festalytics-onboarding-queue-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOnboardingPage() {
  const searchParams = useSearchParams();
  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openMenuUid, setOpenMenuUid] = useState(null);
  const [prevStuckCount, setPrevStuckCount] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = searchParams.get("q") || "";
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await adminFetch(`/api/admin/onboarding${params}`);
      setQueue(data.queue || []);
      setSummary(data.summary || null);

      setPrevStuckCount((prev) => {
        const next = data.summary?.stuckCount ?? 0;
        if (prev !== null && next > prev) {
          setMessage(`+${next - prev} new stuck entries since last refresh.`);
        } else {
          setMessage("");
        }
        return next;
      });
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const stuckCount = summary?.stuckCount ?? queue.length;
  const deltaSinceRefresh =
    prevStuckCount !== null && stuckCount > prevStuckCount
      ? stuckCount - prevStuckCount
      : 0;

  return (
    <AdminShell variant="dashboard">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">
              Vendor Monitoring Queue
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-2 max-w-xl">
            Action required for vendors stuck in the onboarding pipeline.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => exportQueueCsv(queue)}
            disabled={!queue.length}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-600 text-sm font-bold text-slate-200 hover:border-slate-500 hover:text-white disabled:opacity-40 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:from-rose-500 disabled:opacity-50 transition-all"
          >
            <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
              sync
            </span>
            Refresh Queue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="relative rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 overflow-hidden">
          <span className="material-symbols-outlined absolute right-4 top-4 text-[80px] text-slate-800/80 pointer-events-none">
            warning
          </span>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">
            Stuck Entries
          </p>
          <p className="text-4xl font-black text-white mt-2 relative z-10">
            {loading ? "—" : stuckCount}
          </p>
          <p className="text-xs text-amber-400 mt-2 relative z-10">
            {deltaSinceRefresh > 0
              ? `+${deltaSinceRefresh} since last hour`
              : stuckCount > 0
                ? "Requires operator review"
                : "Queue is clear"}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Queue Health
              </p>
              <p className="text-2xl font-black text-white mt-2">
                {loading ? "—" : `${summary?.resolutionRate ?? 0}%`}
                <span className="text-sm font-semibold text-slate-400 ml-1">
                  Resolution Rate
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {loading
                  ? "—"
                  : `${summary?.avgStuckHours ?? 0}h avg. stuck time`}
              </p>
            </div>
            <div className="flex items-end gap-1 h-16 shrink-0">
              {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-t bg-rose-500/40"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-5 py-4">Vendor Email</th>
                <th className="px-5 py-4">UID</th>
                <th className="px-5 py-4">Status Flags</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                    Loading queue…
                  </td>
                </tr>
              )}
              {!loading && queue.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                    No vendors stuck in onboarding. Queue is clear.
                  </td>
                </tr>
              )}
              {!loading &&
                queue.map((row) => (
                  <tr key={row.uid} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${row.uid}`}
                        className="flex items-center gap-3 group"
                      >
                        <VendorAvatar name={row.fullName} />
                        <span className="text-slate-200 group-hover:text-rose-300 transition-colors">
                          {row.email || "—"}
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/users/${row.uid}`}
                        className="font-mono text-xs text-slate-400 hover:text-rose-300"
                      >
                        {row.uid.slice(0, 12)}…
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {row.flags.map((flag) => (
                          <span
                            key={flag}
                            className={`inline-flex px-2 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-wide ${flagStyle(flag)}`}
                          >
                            {flag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/users/${row.uid}`}
                          className="text-sm font-bold text-rose-400 hover:text-rose-300"
                        >
                          Resolve
                        </Link>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuUid(openMenuUid === row.uid ? null : row.uid)
                            }
                            className="h-9 w-9 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                            aria-label="More actions"
                          >
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {openMenuUid === row.uid && (
                            <>
                              <button
                                type="button"
                                className="fixed inset-0 z-10"
                                aria-label="Close"
                                onClick={() => setOpenMenuUid(null)}
                              />
                              <OnboardingActionsMenu
                                row={row}
                                onClose={() => setOpenMenuUid(null)}
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
      </div>

      {!loading && (summary?.stuckOver48h ?? 0) > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-amber-400 text-2xl">
                error
              </span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-400">
                Urgent Advisory
              </p>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">
                {summary.stuckOver48h} vendor{summary.stuckOver48h === 1 ? "" : "s"} have been
                stuck for over 48 hours. Review and assign venues to clear the queue.
              </p>
            </div>
          </div>
          <Link
            href="/admin/users?role=vendor"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-amber-500 text-slate-900 text-sm font-black uppercase tracking-wide hover:bg-amber-400 shrink-0 transition-colors"
          >
            Escalate All
          </Link>
        </div>
      )}

      <AdminFooter />
    </AdminShell>
  );
}
