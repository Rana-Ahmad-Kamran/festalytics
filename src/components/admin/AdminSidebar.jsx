"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-[60] flex flex-col py-6 bg-slate-900 border-r border-slate-800 text-slate-100">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center font-black text-white">
            A
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Festalytics</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-rose-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 pt-4 border-t border-slate-800">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          ← Back to marketplace
        </Link>
      </div>
    </aside>
  );
}
