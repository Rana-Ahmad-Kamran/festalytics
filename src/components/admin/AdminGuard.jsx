"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState("loading");

  useEffect(() => {
    const isLogin = pathname === "/admin/login";

    const checkSession = async () => {
      try {
        await adminFetch("/api/admin/me");
        if (isLogin) {
          router.replace("/admin/dashboard");
          return;
        }
        setState("ok");
      } catch {
        if (isLogin) {
          setState("ok");
        } else {
          setState("denied");
          router.replace("/admin/login?error=session");
        }
      }
    };

    checkSession();
  }, [pathname, router]);

  if (state === "loading" && pathname !== "/admin/login") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <span className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return children;
  }

  if (state !== "ok") return null;

  return children;
}
