"use client";

import React from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Settings" subtitle="Admin access configuration">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 max-w-2xl space-y-4 text-sm text-slate-300">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
          Server environment
        </h2>
        <p>
          Grant admin access by setting one or more of these in{" "}
          <code className="text-rose-300">.env.local</code>:
        </p>
        <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-slate-400">
          <li>ADMIN_EMAILS=you@example.com</li>
          <li>ADMIN_UIDS=firebase_auth_uid</li>
          <li>Or set users/&#123;uid&#125;.role to &quot;admin&quot; in Firestore</li>
        </ul>
        <p className="text-slate-500">
          Firebase Admin SDK vars (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
          FIREBASE_ADMIN_PRIVATE_KEY) must be set for all admin API routes.
        </p>
        <p className="text-slate-500">
          Audit trail writes to <code className="text-slate-400">admin_audit_logs</code> on
          mutations.
        </p>
      </div>
    </AdminShell>
  );
}
