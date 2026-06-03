"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminTopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const isVenuesPage = pathname?.startsWith("/admin/venues");
  const isUsersPage = pathname?.startsWith("/admin/users");
  const isOnboardingPage = pathname?.startsWith("/admin/onboarding");
  const isQuotationsPage = pathname?.startsWith("/admin/quotations");
  const isBookingsPage = pathname?.startsWith("/admin/bookings");
  const isChatsPage = pathname?.startsWith("/admin/chats");
  const isBorrowHubPage = pathname?.startsWith("/admin/borrow-hub");
  const isSettingsPage = pathname?.startsWith("/admin/settings");
  const [username, setUsername] = useState("Admin");
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    adminFetch("/api/admin/me")
      .then((data) => {
        setUsername(data.username || "Admin");
      })
      .catch(() => {});

    adminFetch("/api/admin/stats")
      .then((s) => {
        let n = 0;
        if (s.unownedVenues > 0) n += 1;
        if (s.stuckOnboarding > 0) n += 1;
        if (s.pendingQuotations > 0) n += 1;
        setAlertCount(n);
      })
      .catch(() => {});
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    if (isUsersPage) {
      router.push(`/admin/users?q=${encodeURIComponent(q)}`);
    } else if (isOnboardingPage) {
      router.push(`/admin/onboarding?q=${encodeURIComponent(q)}`);
    } else if (isQuotationsPage) {
      router.push(`/admin/quotations?q=${encodeURIComponent(q)}`);
    } else if (isBookingsPage) {
      router.push(`/admin/bookings?q=${encodeURIComponent(q)}`);
    } else if (isChatsPage) {
      router.push(`/admin/chats?q=${encodeURIComponent(q)}`);
    } else if (isBorrowHubPage) {
      router.push(`/admin/borrow-hub?q=${encodeURIComponent(q)}`);
    } else if (isSettingsPage) {
      const el = document.getElementById("env-docs");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/admin/venues?q=${encodeURIComponent(q)}`);
    }
  };

  const logout = async () => {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/admin/login");
  };

  const notificationHref =
    alertCount > 0 ? "/admin/onboarding" : "/admin/quotations";

  return (
    <header className="fixed top-0 right-0 left-[260px] z-50 h-[72px] flex items-center gap-4 px-6 lg:px-8 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800/80">
      <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:block">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isVenuesPage
                ? "Search halls, slugs, or areas…"
                : isUsersPage
                  ? "Search across users, vendors, and IDs…"
                  : isOnboardingPage
                    ? "Search monitoring queue…"
                    : isQuotationsPage
                      ? "Search quotations, IDs, or venues…"
                      : isBookingsPage
                        ? "Search bookings, IDs, or venues…"
                        : isChatsPage
                          ? "Search communication threads…"
                          : isBorrowHubPage
                            ? "Search resource catalog…"
                            : isSettingsPage
                              ? "Search documentation…"
                              : "Search venues, bookings, or users…"
            }
            className="w-full h-11 pl-12 pr-4 rounded-full bg-slate-900/80 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </form>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          href={notificationHref}
          className="relative h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          title="View alerts"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[#0c1222]" />
          )}
        </Link>

        <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
            {(username[0] || "A").toUpperCase()}
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-bold text-white">{username}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              Super Administrator
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="h-10 w-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors sm:hidden"
          title="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
