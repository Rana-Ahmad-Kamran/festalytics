"use client";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminTopBar from "./AdminTopBar";
import AdminGuard from "./AdminGuard";

export default function AdminShell({
  title,
  subtitle,
  children,
  variant = "default",
}) {
  const isDashboard = variant === "dashboard";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#070b14] text-slate-100">
        <AdminSidebar />
        {isDashboard ? (
          <AdminTopBar />
        ) : (
          <AdminHeader title={title} subtitle={subtitle} />
        )}
        <main
          className={`ml-[260px] min-h-screen ${isDashboard ? "pt-[72px]" : "pt-16"}`}
        >
          <div className="max-w-[1440px] mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AdminGuard>
  );
}
