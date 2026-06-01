"use client";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminGuard from "./AdminGuard";

export default function AdminShell({ title, subtitle, children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AdminSidebar />
        <AdminHeader title={title} subtitle={subtitle} />
        <main className="ml-[260px] pt-16 min-h-screen">
          <div className="max-w-[1440px] mx-auto p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
