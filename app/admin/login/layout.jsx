import { Suspense } from "react";

export default function AdminLoginLayout({ children }) {
  return <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>{children}</Suspense>;
}
