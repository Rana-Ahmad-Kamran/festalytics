"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminUserDetailPage() {
  const { uid } = useParams();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [venueId, setVenueId] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await adminFetch(`/api/admin/users/${uid}`);
    setUser(data);
    setRole(data.role || "user");
    setVenueId(data.venueId || "");
  };

  useEffect(() => {
    if (uid) load().catch((e) => setMessage(e.message));
  }, [uid]);

  const save = async () => {
    try {
      await adminFetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        body: JSON.stringify({
          role,
          venueId: venueId || null,
          syncVenueOwner: Boolean(venueId && role === "vendor"),
          onboardingComplete: role === "vendor" ? Boolean(venueId) : undefined,
        }),
      });
      setMessage("User updated.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const clearPending = async () => {
    try {
      await adminFetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        body: JSON.stringify({ clearPendingOnboarding: true }),
      });
      setMessage("Cleared pending vendor onboarding.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!user) {
    return (
      <AdminShell title="User" subtitle={String(uid)}>
        <p className="text-slate-400">{message || "Loading…"}</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title={user.email || uid} subtitle={`UID: ${uid}`}>
      <Link href="/admin/users" className="text-sm text-rose-400 hover:underline mb-6 inline-block">
        ← All users
      </Link>

      {message && <p className="mb-4 text-sm text-emerald-300">{message}</p>}

      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2 text-white"
          >
            <option value="user">user</option>
            <option value="vendor">vendor</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-500">venueId (tenant slug)</label>
          <input
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2 text-white font-mono"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold uppercase"
          >
            Save
          </button>
          <button
            type="button"
            onClick={clearPending}
            className="px-4 py-2 rounded-full bg-slate-700 text-white text-xs font-bold uppercase"
          >
            Clear pending onboarding
          </button>
        </div>
      </div>
    </AdminShell>
  );
}
