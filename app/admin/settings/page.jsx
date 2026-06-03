"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/hooks/useAdminApi";

const CODE_SNIPPETS = {
  node: `// admin-config.ts
import "dotenv/config";

const required = ["ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]?.trim()) {
    throw new Error(\`FATAL: Missing \${key} in environment.\`);
  }
}

export const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME!.trim(),
  password: process.env.ADMIN_PASSWORD!,
  sessionSecret: process.env.ADMIN_SESSION_SECRET!,
  email: process.env.ADMIN_EMAIL?.trim() || null,
};`,
  python: `# admin_config.py
import os

REQUIRED = ("ADMIN_USERNAME", "ADMIN_PASSWORD", "ADMIN_SESSION_SECRET")

for key in REQUIRED:
    if not (os.environ.get(key) or "").strip():
        raise RuntimeError(f"FATAL: Missing {key} in environment.")

ADMIN_CREDENTIALS = {
    "username": os.environ["ADMIN_USERNAME"].strip(),
    "password": os.environ["ADMIN_PASSWORD"],
    "session_secret": os.environ["ADMIN_SESSION_SECRET"],
    "email": (os.environ.get("ADMIN_EMAIL") or "").strip() or None,
}`,
  go: `// admin_config.go
package main

import (
  "fmt"
  "os"
)

func mustEnv(key string) string {
  v := os.Getenv(key)
  if v == "" {
    panic(fmt.Sprintf("FATAL: Missing %s", key))
  }
  return v
}

var AdminCredentials = struct {
  Username, Password, SessionSecret, Email string
}{
  Username: mustEnv("ADMIN_USERNAME"),
  Password: mustEnv("ADMIN_PASSWORD"),
  SessionSecret: mustEnv("ADMIN_SESSION_SECRET"),
  Email: os.Getenv("ADMIN_EMAIL"),
}`,
};

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}

function EnvField({ label, type, value, masked, copyValue, onToggleMask }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span className="text-[9px] font-mono text-slate-600 uppercase">{type}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={masked ? "••••••••••••••••••••" : value || "Not configured"}
          className="flex-1 bg-transparent font-mono text-sm text-slate-200 outline-none truncate"
        />
        {onToggleMask && (
          <button
            type="button"
            onClick={onToggleMask}
            className="h-8 w-8 rounded-lg border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">
              {masked ? "visibility" : "visibility_off"}
            </span>
          </button>
        )}
        {copyValue && <CopyButton text={copyValue} />}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeTab, setCodeTab] = useState("node");
  const [showPassword, setShowPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/settings");
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const env = data?.env;
  const health = data?.health;
  const fs = data?.firestore;

  return (
    <AdminShell variant="dashboard">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">
        Core Infrastructure
      </p>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
          Environment Setup
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          Administrative constants for secure session management. Values live in{" "}
          <code className="text-rose-300/90">.env.local</code> or your deployment secrets
          manager — never in the client bundle or Firestore.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <section
          id="env-docs"
          className="xl:col-span-2 rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-400">key</span>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Environment Variables
              </h2>
            </div>
            <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              Confidential
            </span>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-500">
              Add these keys to <code className="text-slate-400">.env.local</code> and restart
              the dev server after changes.
            </p>

            {loading && <p className="text-sm text-slate-500">Loading configuration status…</p>}

            {!loading && env && (
              <div className="space-y-3">
                <EnvField
                  label="ADMIN_USERNAME"
                  type="string"
                  value={env.adminUsername || data?.currentAdmin?.username || ""}
                  copyValue={env.adminUsername ? `ADMIN_USERNAME=${env.adminUsername}` : "ADMIN_USERNAME=admin"}
                />
                <EnvField
                  label="ADMIN_PASSWORD"
                  type="hashed_secret"
                  value={env.adminPasswordSet ? "Configured on server" : ""}
                  masked={!showPassword}
                  onToggleMask={() => setShowPassword((v) => !v)}
                  copyValue="ADMIN_PASSWORD=your_strong_password"
                />
                <EnvField
                  label="ADMIN_SESSION_SECRET"
                  type="uuid_v4 / random"
                  value={
                    env.adminSessionSecretSet
                      ? `Configured (${env.sessionSecretLength} chars)`
                      : ""
                  }
                  copyValue="ADMIN_SESSION_SECRET=use-a-long-random-string-at-least-32-chars"
                />
                {env.adminEmail && (
                  <EnvField
                    label="ADMIN_EMAIL"
                    type="string (optional)"
                    value={env.adminEmail}
                    copyValue={`ADMIN_EMAIL=${env.adminEmail}`}
                  />
                )}
              </div>
            )}

            <div
              id="security"
              className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3"
            >
              <span className="material-symbols-outlined text-amber-400 shrink-0">warning</span>
              <div>
                <p className="text-xs font-black uppercase text-amber-300 tracking-wide">
                  Critical security protocol
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Passwords are never stored in Firestore. Configure credentials only via
                  environment variables so a database compromise cannot expose admin login
                  secrets. Sessions use the httpOnly cookie{" "}
                  <code className="text-slate-300">{env?.sessionCookie || "festalytics_admin_session"}</code>{" "}
                  ({env?.sessionMaxAgeHours ?? 12}h lifetime).
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-sky-400">database</span>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                Firestore collection
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Admin identity is upserted on each login (no password field).
            </p>
            <div className="rounded-lg bg-slate-950 border border-slate-800 px-4 py-3 font-mono text-xs text-rose-300">
              collection: &quot;{fs?.platformAdminsCollection || "platform_admins"}&quot;
            </div>
            <p className="text-[10px] font-black uppercase text-slate-500 mt-4 mb-2">
              Document schema
            </p>
            <ul className="space-y-2">
              {(fs?.schema || []).map((field) => (
                <li key={field.field} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="material-symbols-outlined text-emerald-500 text-[16px]">
                    check_circle
                  </span>
                  <span>
                    <code className="text-slate-300">{field.field}</code>
                    {field.values && (
                      <span className="text-slate-500">
                        {" "}
                        ({field.values.join(", ")})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {fs?.documentCount != null && (
              <p className="text-xs text-slate-500 mt-4">
                {fs.documentCount} profile{fs.documentCount === 1 ? "" : "s"} in collection
              </p>
            )}
            <Link
              href="/admin/users"
              className="inline-block mt-4 text-xs font-bold text-rose-400 hover:text-rose-300"
            >
              Open user directory →
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-800/80 overflow-hidden relative min-h-[140px]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1558494940-ef010cbdcc31?w=600&q=80)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            <div className="relative p-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                System health
              </h2>
              <p
                className={`mt-3 text-xs font-black uppercase tracking-wide flex items-center gap-2 ${
                  health?.operational ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    health?.operational ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {health?.operational
                  ? "All core systems operational"
                  : "Configuration incomplete"}
              </p>
              <ul className="mt-4 space-y-1 text-[11px] text-slate-400">
                <li>
                  Firebase Admin: {health?.firebaseConfigured ? "OK" : "Missing env"}
                </li>
                <li>Auth env: {health?.authConfigured ? "OK" : "Set username & password"}</li>
              </ul>
              <Link
                href="/admin/dashboard"
                className="inline-block mt-4 text-xs font-bold text-white hover:text-rose-300"
              >
                View dashboard →
              </Link>
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-violet-400">code</span>
            <h2 className="text-sm font-black uppercase tracking-widest text-white">
              Initialization logic
            </h2>
          </div>
          <div className="flex gap-1 rounded-lg border border-slate-800 p-1 bg-slate-950">
            {["node", "python", "go"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCodeTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase ${
                  codeTab === tab
                    ? "bg-rose-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab === "node" ? "Node.js" : tab}
              </button>
            ))}
          </div>
        </div>
        <pre className="p-5 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed bg-slate-950/80">
          <code>{CODE_SNIPPETS[codeTab]}</code>
        </pre>
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
          <CopyButton text={CODE_SNIPPETS[codeTab]} label="Copy snippet" />
        </div>
      </section>

      <footer className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Festalytics Data Operations</p>
        <div className="flex flex-wrap items-center gap-6">
          <a href="#security" className="hover:text-rose-400 transition-colors">
            Security whitepaper
          </a>
          <Link href="/admin/dashboard" className="hover:text-rose-400 transition-colors">
            API reference
          </Link>
          <Link href="/admin/onboarding" className="hover:text-rose-400 transition-colors">
            Support portal
          </Link>
        </div>
      </footer>

      <Link
        href="#env-docs"
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition-colors z-40"
        title="Environment documentation"
      >
        <span className="material-symbols-outlined">help</span>
      </Link>

    </AdminShell>
  );
}
