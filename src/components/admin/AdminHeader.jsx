"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function AdminHeader({ title, subtitle }) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email || "");
    });
    return () => unsub();
  }, []);

  const logout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <header className="fixed top-0 right-0 left-[260px] z-50 h-16 flex items-center justify-between px-8 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div>
        <h1 className="text-lg font-black text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400 hidden sm:block">{email}</span>
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
