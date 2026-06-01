"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionError = searchParams.get("error") === "session";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    sessionError ? "Your session expired. Sign in again." : ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Login failed.");
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-rose-600 items-center justify-center text-white font-black text-xl mb-4">
              A
            </div>
            <h1 className="text-2xl font-black text-white">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-1">Platform operator access only</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-sm p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-rose-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-rose-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-6 text-center leading-relaxed">
            Credentials are set in server <code className="text-slate-400">.env.local</code> only.
            No public signup. Your profile is stored in Firestore{" "}
            <code className="text-slate-400">platform_admins</code> on login.
          </p>
        </div>
      </div>
    </AdminGuard>
  );
}
