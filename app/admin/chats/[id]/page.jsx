"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminChatDetailRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/admin/chats?thread=${encodeURIComponent(id)}`);
    else router.replace("/admin/chats");
  }, [id, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
      Opening thread…
    </div>
  );
}
