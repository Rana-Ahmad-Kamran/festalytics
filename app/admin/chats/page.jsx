"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import DataTable from "@/components/admin/DataTable";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminChatsPage() {
  const [chats, setChats] = useState([]);
  const [venueSlug, setVenueSlug] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (venueSlug) params.set("venueSlug", venueSlug);
    adminFetch(`/api/admin/chats?${params}`)
      .then((data) => setChats(data.chats || []))
      .catch(console.error);
  }, [venueSlug]);

  const columns = [
    {
      key: "id",
      label: "Thread",
      render: (row) => (
        <Link href={`/admin/chats/${row.id}`} className="text-rose-400 hover:underline font-mono text-xs">
          {row.id.slice(0, 16)}…
        </Link>
      ),
    },
    { key: "venueSlug", label: "Venue" },
    { key: "customerName", label: "Customer" },
    { key: "lastMessage", label: "Last message" },
    { key: "lastSenderRole", label: "From" },
  ];

  return (
    <AdminShell title="Chats" subtitle="Read-only support view">
      <input
        placeholder="Filter venue slug…"
        value={venueSlug}
        onChange={(e) => setVenueSlug(e.target.value)}
        className="mb-6 rounded-xl bg-slate-900 border border-slate-700 px-4 py-2 text-sm text-white w-full max-w-md"
      />
      <DataTable
        columns={columns}
        rows={chats.map((c) => ({ ...c, _key: c.id }))}
        emptyMessage="No chat threads."
      />
    </AdminShell>
  );
}
