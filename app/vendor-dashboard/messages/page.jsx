"use client";

import React, { useCallback, useEffect, useState } from "react";
import ChatSidebar from "@/components/vendor/messages/ChatSidebar";
import ChatThread from "@/components/vendor/messages/ChatThread";
import ChatQuickReplies from "@/components/vendor/messages/ChatQuickReplies";
import { useVendorVenue } from "@/hooks/useVendorVenue";
import { useVendorInbox } from "@/hooks/useVendorInbox";
import { useChatMessages } from "@/hooks/useChatMessages";
import {
  ensureChatRoom,
  markVendorInboxRead,
  sendTextMessage,
} from "@/lib/firestore/chats";
import { buildChatId } from "@/lib/chatUtils";

const MessagesPage = () => {
  const { venueId, isLoading: venueLoading } = useVendorVenue();
  const { threads, loading: inboxLoading, error: inboxError } = useVendorInbox(venueId);
  const [activeThread, setActiveThread] = useState(null);
  const [sending, setSending] = useState(false);
  const [handoffDone, setHandoffDone] = useState(false);

  const activeChatId = activeThread?.chatId || activeThread?.id || null;

  const { messages, loading: messagesLoading, error: messagesError } = useChatMessages(
    activeChatId,
    {
      venueSlug: venueId,
      customerName: activeThread?.name,
      customerAvatar: activeThread?.avatar,
    }
  );

  useEffect(() => {
    if (handoffDone || venueLoading || !venueId) return;

    const chatReq = localStorage.getItem("activeChatThread");
    if (!chatReq) {
      setHandoffDone(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const parsed = JSON.parse(chatReq);
        localStorage.removeItem("activeChatThread");

        const customerId = parsed.customerId;
        if (!customerId) {
          setHandoffDone(true);
          return;
        }

        const chatId =
          parsed.chatId || buildChatId(parsed.venueSlug || venueId, customerId);

        await ensureChatRoom({
          chatId,
          venueSlug: parsed.venueSlug || venueId,
          customerId,
          customerName: parsed.name || parsed.customerName || "Customer",
          subject: parsed.subject || `Booking #${parsed.bookingId || "—"} Discussion`,
          bookingRef: parsed.bookingId || parsed.bookingRef || null,
          customerAvatar: parsed.avatar || null,
        });

        if (cancelled) return;

        const thread = {
          id: chatId,
          chatId,
          name: parsed.name || parsed.customerName || "Customer",
          avatar: parsed.avatar || null,
          lastMessage: parsed.lastMessage || "Conversation started",
          time: "Just now",
          subject: parsed.subject || `Booking #${parsed.bookingId || "—"} Discussion`,
          unread: false,
          customerId,
          venueSlug: parsed.venueSlug || venueId,
          bookingRef: parsed.bookingId || null,
        };

        setActiveThread(thread);
      } catch (e) {
        console.error("[MessagesPage] chat handoff:", e);
      } finally {
        if (!cancelled) setHandoffDone(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [venueId, venueLoading, handoffDone]);

  useEffect(() => {
    if (!handoffDone || activeThread || inboxLoading || threads.length === 0) return;
    setActiveThread(threads[0]);
  }, [handoffDone, activeThread, inboxLoading, threads]);

  const handleSelectThread = useCallback(
    async (thread) => {
      setActiveThread(thread);
      const chatId = thread.chatId || thread.id;
      if (!chatId) return;
      try {
        await markVendorInboxRead(chatId);
      } catch (err) {
        console.error("[MessagesPage] mark read:", err);
      }
    },
    []
  );

  const handleSendMessage = useCallback(
    async (text) => {
      if (!activeChatId || !venueId || !text?.trim()) return;

      setSending(true);
      try {
        await sendTextMessage({
          chatId: activeChatId,
          senderId: venueId,
          text,
          senderRole: "vendor",
        });
      } catch (err) {
        console.error("[MessagesPage] send:", err);
      } finally {
        setSending(false);
      }
    },
    [activeChatId, venueId]
  );

  if (venueLoading) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center text-outline font-black uppercase tracking-widest text-xs">
        Loading inbox…
      </div>
    );
  }

  if (!venueId) {
    return (
      <div className="flex h-[calc(100vh-120px)] items-center justify-center text-outline font-medium text-sm px-8 text-center">
        Link your venue account to use messaging.
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden text-slate-700 font-sans">
      <ChatSidebar
        threads={threads}
        activeThread={activeThread}
        onSelectThread={handleSelectThread}
        loading={inboxLoading}
        error={inboxError}
      />

      <ChatThread
        activeThread={activeThread}
        messages={messages}
        venueSlug={venueId}
        loading={messagesLoading}
        error={messagesError}
        sending={sending}
        onSendMessage={handleSendMessage}
      />

      <div className="hidden 2xl:block">
        <ChatQuickReplies onSelectReply={handleSendMessage} />
      </div>
    </div>
  );
};

export default MessagesPage;
