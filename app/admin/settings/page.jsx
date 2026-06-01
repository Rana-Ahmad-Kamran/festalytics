"use client";

import React from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="Admin access configuration">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 max-w-2xl space-y-4 text-sm text-slate-300">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Env-only login (Option A)
        </h2>
        <p>
          Set these in <code className="text-rose-300">.env.local</code> and restart{" "}
          <code className="text-slate-400">npm run dev</code>:
        </p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-slate-400">
          <li>ADMIN_USERNAME=your_admin_username</li>
          <li>ADMIN_PASSWORD=your_strong_password</li>
          <li>ADMIN_SESSION_SECRET=long_random_string</li>
          <li>ADMIN_EMAIL=optional@email.com (stored in Firestore profile only)</li>
        </ul>
        <p className="text-slate-500">
          Passwords are <strong className="text-slate-300">never</strong> saved in Firestore.
          On each login, a record is upserted in{" "}
          <code className="text-slate-400">platform_admins</code> with username, email, and
          lastLoginAt.
        </p>
        <p className="text-slate-500">
          Session uses an httpOnly cookie (<code className="text-slate-400">festalytics_admin_session</code>
          ), 12-hour lifetime. Mutations are logged to{" "}
          <code className="text-slate-400">admin_audit_logs</code>.
        </p>
      </div>
    </AdminShell>
  );
}
