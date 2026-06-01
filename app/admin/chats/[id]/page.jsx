"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminChatDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!id) return;
    adminFetch(`/api/admin/chats/${id}`)
      .then((data) => {
        setRoom(data.room);
        setMessages(data.messages || []);
      })
      .catch(console.error);
  }, [id]);

  return (
    <AdminShell title="Chat thread" subtitle={String(id)}>
      <Link href="/admin/chats" className="text-sm text-rose-400 hover:underline mb-6 inline-block">
        ← All chats
      </Link>

      {room && (
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-300">
          <p>
            Venue: <span className="text-white">{room.venueSlug}</span>
          </p>
          <p>
            Customer: <span className="text-white">{room.customerName || room.customerId}</span>
          </p>
        </div>
      )}

      <div className="space-y-3 max-w-2xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl px-4 py-3 text-sm ${
              msg.senderRole === "vendor"
                ? "bg-slate-800 ml-8"
                : "bg-rose-600/20 mr-8"
            }`}
          >
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
              {msg.senderRole || msg.type || "message"}
            </p>
            <p className="text-slate-200">{msg.text || msg.body || JSON.stringify(msg)}</p>
          </div>
        ))}
        {!messages.length && <p className="text-slate-500">No messages.</p>}
      </div>
    </AdminShell>
  );
}
