import { Suspense } from "react";

export default function AdminChatsLayout({ children }) {
  return <Suspense fallback={<div className="min-h-[40vh]" />}>{children}</Suspense>;
}
