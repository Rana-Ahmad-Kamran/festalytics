import { Suspense } from "react";

export default function AdminVenuesLayout({ children }) {
  return <Suspense fallback={<div className="min-h-[40vh]" />}>{children}</Suspense>;
}
