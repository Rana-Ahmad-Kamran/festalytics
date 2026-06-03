"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import AdminFooter from "@/components/admin/AdminFooter";
import { adminFetch } from "@/hooks/useAdminApi";
import CounterOfferCard from "@/components/chat/CounterOfferCard";

function timeAgo(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "Just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

function CustomerAvatar({ name, src, size = "md" }) {
  const cls = size === "lg" ? "h-12 w-12 text-sm" : "h-9 w-9 text-[10px]";
  if (src) {
    return (
      <img src={src} alt="" className={`${cls} rounded-full object-cover border border-slate-700`} />
    );
  }
  const initials = (name || "C")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`${cls} rounded-full bg-gradient-to-br from-violet-600/80 to-rose-600/80 flex items-center justify-center text-white font-black shrink-0`}
    >
      {initials}
    </div>
  );
}

function RolePill({ role }) {
  const isVendor = role === "VENDOR";
  return (
    <span
      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
        isVendor
          ? "bg-slate-700 text-slate-400"
          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
      }`}
    >
      {role}
    </span>
  );
}

function MessageBubble({ msg, customerName, venueSlug }) {
  if (msg.type === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/80 px-4 py-2 rounded-full">
          {msg.text}
        </span>
      </div>
    );
  }

  if (msg.type === "counter_offer") {
    return (
      <div className={`flex ${msg.isVendor ? "justify-end" : "justify-start"}`}>
        <div className="max-w-[85%]">
          <CounterOfferCard
            counterOffer={msg.counterOffer}
            viewerRole="vendor"
            isOwnMessage={msg.isVendor}
          />
          <p className="text-[10px] text-slate-500 mt-1 text-right">{msg.timeLabel}</p>
        </div>
      </div>
    );
  }

  if (msg.attachment?.name) {
    const href = msg.attachment.url || "#";
    return (
      <div className={`flex ${msg.isVendor ? "justify-end" : "justify-start"}`}>
        <div
          className={`max-w-[85%] rounded-2xl border px-4 py-3 ${
            msg.isVendor
              ? "bg-slate-800 border-slate-700"
              : "bg-violet-950/60 border-violet-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-400 text-3xl">picture_as_pdf</span>
            <div>
              {msg.attachment.url ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white hover:text-rose-300"
                >
                  {msg.attachment.name}
                </a>
              ) : (
                <p className="text-sm font-bold text-white">{msg.attachment.name}</p>
              )}
              <p className="text-[10px] text-slate-500">
                {msg.attachment.size} · {msg.attachment.source}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 text-right">{msg.timeLabel}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${msg.isVendor ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          msg.isVendor
            ? "bg-slate-800/90 border border-slate-700 text-slate-200"
            : "bg-violet-950/70 border border-violet-500/25 text-slate-100"
        }`}
      >
        {msg.isVendor && (
          <p className="text-[10px] font-black uppercase text-slate-500 mb-1 tracking-wide">
            {venueSlug?.replace(/-/g, " ") || "Venue"} Mgmt
          </p>
        )}
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <p className={`text-[10px] text-slate-500 mt-2 ${msg.isVendor ? "text-right" : ""}`}>
          {msg.timeLabel}
        </p>
      </div>
    </div>
  );
}

export default function AdminChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const threadId = searchParams.get("thread") || "";
  const [chats, setChats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [venueSlugs, setVenueSlugs] = useState([]);
  const [venueFilter, setVenueFilter] = useState(searchParams.get("venueSlug") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [loadingList, setLoadingList] = useState(true);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [insights, setInsights] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);

  const pushQuery = useCallback(
    (next) => {
      const params = new URLSearchParams();
      if (next.thread) params.set("thread", next.thread);
      if (next.venueSlug) params.set("venueSlug", next.venueSlug);
      if (next.role) params.set("role", next.role);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const qs = params.toString();
      router.push(qs ? `/admin/chats?${qs}` : "/admin/chats");
    },
    [router, searchParams]
  );

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (venueFilter) params.set("venueSlug", venueFilter);
      if (roleFilter) params.set("role", roleFilter);
      const q = searchParams.get("q");
      if (q) params.set("q", q);
      const data = await adminFetch(`/api/admin/chats?${params}`);
      setChats(data.chats || []);
      setSummary(data.summary || null);
      setVenueSlugs(data.venueSlugs || []);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoadingList(false);
    }
  }, [venueFilter, roleFilter, searchParams]);

  const loadThread = useCallback(async (id) => {
    if (!id) {
      setRoom(null);
      setMessages([]);
      setInsights(null);
      return;
    }
    setLoadingThread(true);
    try {
      const data = await adminFetch(`/api/admin/chats/${id}`);
      setRoom(data.room);
      setMessages(data.messages || []);
      setInsights(data.insights || null);
      setConversationStarted(data.conversationStarted || null);
    } catch (e) {
      setMessage(e.message);
      if (String(e.message || "").toLowerCase().includes("no messages")) {
        setRoom(null);
        setMessages([]);
        setInsights(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("thread");
        const qs = params.toString();
        router.replace(qs ? `/admin/chats?${qs}` : "/admin/chats");
      }
    } finally {
      setLoadingThread(false);
    }
  }, [router, searchParams]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadThread(threadId);
  }, [threadId, loadThread]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, threadId]);

  useEffect(() => {
    const v = searchParams.get("venueSlug");
    const r = searchParams.get("role");
    if (v !== null) setVenueFilter(v);
    if (r !== null) setRoleFilter(r);
  }, [searchParams]);

  const patchRoom = async (patch) => {
    if (!threadId) return;
    try {
      await adminFetch(`/api/admin/chats/${threadId}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      await loadThread(threadId);
      await loadList();
      setMessage(patch.adminFlagged ? "Thread flagged for review." : "Monitor mode updated.");
    } catch (e) {
      setMessage(e.message);
    }
  };

  const selectThread = (id) => {
    pushQuery({ thread: id, venueSlug: venueFilter, role: roleFilter });
  };

  const venueName =
    insights?.venue?.name || room?.venueSlug?.replace(/-/g, " ") || "Venue";

  return (
    <AdminShell variant="dashboard">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">
        Communications / Active Monitoring
      </p>

      {message && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm px-4 py-3">
          {message}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-4 min-h-[calc(100vh-220px)]">
        {/* Left: thread list */}
        <aside className="w-full xl:w-[320px] shrink-0 rounded-2xl border border-slate-800/80 bg-slate-900/50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Active Monitoring
            </h2>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-600 text-white">
              {loadingList ? "…" : `${summary?.liveCount ?? 0} live`}
            </span>
          </div>

          <div className="p-3 border-b border-slate-800 space-y-2">
            <select
              value={venueFilter}
              onChange={(e) => {
                setVenueFilter(e.target.value);
                pushQuery({ thread: threadId, venueSlug: e.target.value, role: roleFilter });
              }}
              className="w-full h-9 rounded-lg bg-slate-950 border border-slate-700 px-3 text-xs text-slate-200"
            >
              <option value="">All venues</option>
              {venueSlugs.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                pushQuery({ thread: threadId, venueSlug: venueFilter, role: e.target.value });
              }}
              className="w-full h-9 rounded-lg bg-slate-950 border border-slate-700 px-3 text-xs text-slate-200"
            >
              <option value="">All parties</option>
              <option value="customer">Last: customer</option>
              <option value="vendor">Last: vendor</option>
            </select>
            <button
              type="button"
              onClick={loadList}
              className="w-full h-9 rounded-lg border border-slate-700 text-xs font-bold text-slate-400 hover:text-white"
            >
              Refresh threads
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loadingList && (
              <p className="p-6 text-center text-sm text-slate-500">Loading threads…</p>
            )}
            {!loadingList && chats.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-500">
                No conversations with messages yet.
              </p>
            )}
            {chats.map((chat) => {
              const active = chat.id === threadId;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => selectThread(chat.id)}
                  className={`w-full text-left p-4 border-b border-slate-800/60 transition-colors ${
                    active ? "bg-rose-600/10 border-l-2 border-l-rose-500" : "hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-500">{chat.threadLabel}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {timeAgo(chat.lastMessageTimestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-white text-sm truncate">{chat.customerName}</p>
                    <RolePill role={chat.roleTag} />
                    {chat.adminFlagged && (
                      <span className="material-symbols-outlined text-amber-400 text-[16px]">
                        flag
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono truncate mb-1">
                    {chat.venueSlug || "—"}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">{chat.lastMessage || "—"}</p>
                  {chat.unreadByVendor > 0 && (
                    <span className="inline-block mt-2 text-[9px] font-black uppercase text-rose-300">
                      {chat.unreadByVendor} unread (vendor)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center: messages */}
        <section className="flex-1 min-w-0 rounded-2xl border border-slate-800/80 bg-slate-900/30 flex flex-col overflow-hidden">
          {!threadId && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
              <span className="material-symbols-outlined text-5xl mb-4 text-slate-600">forum</span>
              <p className="text-sm font-bold">Select a thread to monitor</p>
              <Link
                href="/admin/venues"
                className="mt-4 text-xs font-bold text-rose-400 hover:text-rose-300"
              >
                Browse venues →
              </Link>
            </div>
          )}

          {threadId && room && (
            <>
              <div className="p-4 lg:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <CustomerAvatar
                    name={room.customerName}
                    src={room.customerAvatar}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-white truncate">
                        {room.customerName}
                      </h2>
                      {insights?.userVerified && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                          Verified client
                        </span>
                      )}
                      {room.adminFlagged && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/40 text-amber-300">
                          Flagged
                        </span>
                      )}
                      {room.adminMonitorMode && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-rose-500/40 text-rose-300">
                          Monitor on
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      Inquired about: {venueName} · {room.threadLabel}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => patchRoom({ adminFlagged: !room.adminFlagged })}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full border text-xs font-bold ${
                      room.adminFlagged
                        ? "border-amber-500/50 text-amber-300 bg-amber-500/10"
                        : "border-slate-600 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">flag</span>
                    {room.adminFlagged ? "Unflag" : "Flag thread"}
                  </button>
                  <button
                    type="button"
                    onClick={() => patchRoom({ adminMonitorMode: !room.adminMonitorMode })}
                    className={`inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs font-black ${
                      room.adminMonitorMode
                        ? "bg-slate-800 border border-rose-500/50 text-rose-300"
                        : "bg-rose-600 text-white hover:bg-rose-500"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    {room.adminMonitorMode ? "Monitor on" : "Monitor mode"}
                  </button>
                  <button
                    type="button"
                    onClick={() => loadThread(threadId)}
                    disabled={loadingThread}
                    className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                    title="Refresh messages"
                  >
                    <span
                      className={`material-symbols-outlined ${loadingThread ? "animate-spin" : ""}`}
                    >
                      refresh
                    </span>
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar"
              >
                {conversationStarted && (
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-500 py-2">
                    Conversation started {conversationStarted}
                  </p>
                )}
                {loadingThread && (
                  <p className="text-center text-sm text-slate-500">Loading messages…</p>
                )}
                {!loadingThread && messages.length === 0 && (
                  <p className="text-center text-sm text-slate-500">No messages in this thread.</p>
                )}
                {!loadingThread &&
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      customerName={room.customerName}
                      venueSlug={room.venueSlug}
                    />
                  ))}
              </div>

              <div className="p-4 border-t border-slate-800 flex flex-wrap gap-3">
                <Link
                  href={
                    room.customerId
                      ? `/admin/users/${room.customerId}`
                      : `/admin/users?q=${encodeURIComponent(room.customerName)}`
                  }
                  className="text-xs font-bold text-rose-400 hover:text-rose-300"
                >
                  View customer →
                </Link>
                <Link
                  href={
                    room.venueSlug
                      ? `/admin/venues/${room.venueSlug}`
                      : "/admin/venues"
                  }
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  View venue →
                </Link>
                <Link
                  href={
                    room.venueSlug
                      ? `/admin/bookings?venueId=${encodeURIComponent(room.venueSlug)}`
                      : "/admin/bookings"
                  }
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Bookings →
                </Link>
                <Link
                  href={
                    room.venueSlug
                      ? `/admin/quotations?venueId=${encodeURIComponent(room.venueSlug)}`
                      : "/admin/quotations"
                  }
                  className="text-xs font-bold text-slate-400 hover:text-white"
                >
                  Quotations →
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Right: insights */}
        <aside className="w-full xl:w-[300px] shrink-0 space-y-4">
          {threadId && insights?.venue && (
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 overflow-hidden">
              <div className="aspect-video relative bg-slate-800">
                <img
                  src={insights.venue.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <Link
                  href={`/admin/venues/${insights.venue.slug}`}
                  className="font-black text-white hover:text-rose-300"
                >
                  {insights.venue.name}
                </Link>
                {(insights.venue.rating != null || insights.venue.reviewCount != null) && (
                  <p className="text-xs text-slate-500 mt-1">
                    {insights.venue.rating != null ? `${insights.venue.rating} ` : ""}
                    {insights.venue.reviewCount != null
                      ? `(${insights.venue.reviewCount} reviews)`
                      : ""}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-slate-950/80 p-3 border border-slate-800">
                    <p className="text-[9px] font-black uppercase text-slate-500">Response time</p>
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      {insights.responseTimeMinutes != null
                        ? `${insights.responseTimeMinutes}m`
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-950/80 p-3 border border-rose-500/30">
                    <p className="text-[9px] font-black uppercase text-slate-500">Sentiment</p>
                    <p className="text-sm font-black text-rose-300 mt-1">{insights.sentiment}</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {threadId && insights && (
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                System Insights
              </h3>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-slate-500">shield</span>
                <div>
                  <p className="text-xs font-bold text-white">Security — {insights.security.level}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{insights.security.detail}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-slate-500">credit_card</span>
                <div>
                  <p className="text-xs font-bold text-white">Payment status</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{insights.paymentStatus}</p>
                  {insights.relatedQuotations?.[0] && (
                    <Link
                      href={`/admin/quotations?venueId=${encodeURIComponent(room?.venueSlug || "")}`}
                      className="text-[10px] font-bold text-rose-400 mt-1 inline-block"
                    >
                      Open quotations →
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-slate-500">history</span>
                <div>
                  <p className="text-xs font-bold text-white">User history</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{insights.userHistory}</p>
                  {insights.relatedBookings?.[0] && (
                    <Link
                      href={`/admin/bookings?venueId=${encodeURIComponent(room?.venueSlug || "")}`}
                      className="text-[10px] font-bold text-rose-400 mt-1 inline-block"
                    >
                      View bookings →
                    </Link>
                  )}
                </div>
              </div>
              {insights.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {insights.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold uppercase px-2 py-1 rounded-md bg-slate-800 text-slate-400 border border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {!threadId && (
            <section className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6 text-sm text-slate-500">
              <p>Select a live thread to load venue context and system insights from Firestore.</p>
              <div className="mt-4 space-y-2">
                <Link href="/admin/onboarding" className="block text-rose-400 text-xs font-bold">
                  Vendor onboarding queue →
                </Link>
                <Link href="/admin/quotations" className="block text-rose-400 text-xs font-bold">
                  Pending quotations →
                </Link>
              </div>
            </section>
          )}

          {summary && (
            <section className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-600/15 to-pink-600/5 p-4">
              <p className="text-[10px] font-black uppercase text-slate-400">Queue overview</p>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                <li>
                  <span className="font-black text-white">{summary.flaggedCount}</span> flagged
                  threads
                </li>
                <li>
                  <span className="font-black text-white">{summary.pendingOffers}</span> counter-offer
                  threads
                </li>
                <li>
                  <span className="font-black text-white">{summary.unreadTotal}</span> vendor unread
                  total
                </li>
              </ul>
            </section>
          )}
        </aside>
      </div>

      <AdminFooter />
    </AdminShell>
  );
}
