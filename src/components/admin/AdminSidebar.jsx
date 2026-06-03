"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminFetch } from "@/hooks/useAdminApi";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "apartment", label: "Venues", href: "/admin/venues" },
  { icon: "group", label: "Users", href: "/admin/users" },
  { icon: "person_add", label: "Onboarding", href: "/admin/onboarding" },
  { icon: "request_quote", label: "Quotations", href: "/admin/quotations" },
  { icon: "event_available", label: "Bookings", href: "/admin/bookings" },
  { icon: "chat", label: "Chats", href: "/admin/chats" },
  { icon: "handshake", label: "Borrow Hub", href: "/admin/borrow-hub" },
  { icon: "settings", label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    router.push("/admin/login");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-[60] flex flex-col bg-[#0a0f1a] border-r border-slate-800/80 text-slate-100">
      <div className="px-5 py-6 border-b border-slate-800/60">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center font-black text-white shadow-lg shadow-rose-500/20">
            F
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white group-hover:text-rose-200 transition-colors">
              Festalytics
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/60 space-y-2">
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 border border-slate-800 hover:bg-slate-800/80 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign out
        </button>
        <Link
          href="/"
          className="block text-center text-[11px] font-medium text-slate-600 hover:text-slate-400 py-1 transition-colors"
        >
          ← Marketplace
        </Link>
      </div>
    </aside>
  );
}
