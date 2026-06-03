"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminHeader({ title, subtitle }) {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/me")
      .then((data) => setUsername(data.username || data.email || "Admin"))
      .catch(() => setUsername("Admin"));
  }, []);

  const logout = async () => {
    try {
      await adminFetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* clear cookie best-effort */
    }
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 right-0 left-[260px] z-50 h-16 flex items-center justify-between px-8 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800/80">
      <div>
        <h1 className="text-lg font-black text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 hidden sm:block">{username}</span>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-200 hover:bg-rose-600 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
