"use client";

import { useCallback, useState } from "react";
import { auth } from "@/firebase";

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");
  return user.getIdToken();
}

/**
 * @param {string} path - e.g. /api/admin/stats
 * @param {RequestInit} [init]
 */
export async function adminFetch(path, init = {}) {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(path, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (path, init) => {
    setLoading(true);
    setError(null);
    try {
      return await adminFetch(path, init);
    } catch (err) {
      setError(err.message || "Request failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error, adminFetch };
}
