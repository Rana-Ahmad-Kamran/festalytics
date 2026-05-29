"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/firebase";
import { buildChatId } from "@/lib/chatUtils";
import { useChatMessages } from "@/hooks/useChatMessages";
import CounterOfferCard from "@/components/chat/CounterOfferCard";
import {
  ensureChatRoom,
  markCustomerInboxRead,
  respondToCounterOffer,
  sendTextMessage,
} from "@/lib/firestore/chats";

export default function CustomerVenueChat({ venueSlug, venueName }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const { messages, loading, error } = useChatMessages(chatId, {
    venueSlug,
    customerName: user?.displayName || "You",
  });

  useEffect(() => {
    if (!open || !user?.uid || !venueSlug) return;

    let cancelled = false;
    setBootstrapping(true);

    (async () => {
      try {
        const id = buildChatId(venueSlug, user.uid);
        await ensureChatRoom({
          chatId: id,
          venueSlug,
          customerId: user.uid,
          customerName: user.displayName || user.email || "Customer",
          subject: `${venueName || "Venue"} inquiry`,
        });
        if (!cancelled) {
          setChatId(id);
          await markCustomerInboxRead(id);
        }
      } catch (err) {
        console.error("[CustomerVenueChat] bootstrap:", err);
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, user?.uid, venueSlug, venueName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!chatId || !user?.uid || !inputText.trim() || sending) return;
    const text = inputText;
    setInputText("");
    setSending(true);
    try {
      await sendTextMessage({
        chatId,
        senderId: user.uid,
        text,
        senderRole: "customer",
      });
    } catch (err) {
      console.error("[CustomerVenueChat] send:", err);
    } finally {
      setSending(false);
    }
  };

  const handleCounterRespond = useCallback(
    async (messageId, status) => {
      if (!chatId || !user?.uid) return;
      try {
        await respondToCounterOffer({
          chatId,
          messageId,
          status,
          customerId: user.uid,
        });
      } catch (err) {
        console.error("[CustomerVenueChat] counter respond:", err);
      }
    },
    [chatId, user?.uid]
  );

  if (!venueSlug) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="mb-4 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] flex flex-col bg-white rounded-3xl shadow-2xl border border-outline-variant overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-outline-variant bg-gradient-to-r from-primary to-primary/90 text-white flex justify-between items-center">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-90">
                  Message venue
                </p>
                <h3 className="font-black text-sm tracking-tight">{venueName || "Venue"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-full hover:bg-white/20 border-0 bg-transparent cursor-pointer text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {!user ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-sm font-bold text-on-surface">Sign in to chat with the venue</p>
                <p className="text-xs text-outline mt-2">
                  Log in from your Festalytics account to send inquiries and respond to offers.
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-container-lowest/30"
                >
                  {bootstrapping || loading ? (
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-outline">
                      Loading chat…
                    </p>
                  ) : null}
                  {error && (
                    <p className="text-center text-xs font-bold text-rose-600">{error}</p>
                  )}
                  {!loading && messages.length === 0 && (
                    <p className="text-center text-xs text-outline">
                      Ask about availability, packages, or your booking.
                    </p>
                  )}

                  {messages.map((msg) => {
                    if (msg.type === "system" || msg.sender === "system") {
                      return (
                        <div key={msg.id} className="flex justify-center">
                          <div className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                            {msg.text}
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "counter_offer") {
                      const isVenue = msg.sender === "vendor";
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isVenue ? "justify-start" : "justify-end"}`}
                        >
                          <CounterOfferCard
                            counterOffer={msg.counterOffer}
                            viewerRole="customer"
                            isOwnMessage={!isVenue}
                            onRespond={
                              isVenue
                                ? (status) => handleCounterRespond(msg.id, status)
                                : undefined
                            }
                          />
                        </div>
                      );
                    }

                    const isMe = msg.sender === "customer";
                    return (
                      <div
                        key={msg.id}
                        className={`flex max-w-[88%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                      >
                        <div
                          className={`px-4 py-3 rounded-[1.5rem] text-sm font-medium shadow-sm border ${
                            isMe
                              ? "bg-primary text-white rounded-tr-none border-primary/10"
                              : "bg-secondary-container text-on-secondary-container rounded-tl-none border-secondary/10"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-outline-variant bg-white">
                  <div className="flex items-end gap-2 bg-surface-container-low rounded-full px-3 py-2 border border-outline-variant/50">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={sending || bootstrapping}
                      rows={1}
                      placeholder="Type your message…"
                      className="flex-1 bg-transparent border-none outline-none text-sm resize-none min-h-[36px] max-h-24 py-1"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={sending || !inputText.trim()}
                      className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center border-0 cursor-pointer disabled:opacity-50 shadow-md"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center border-0 cursor-pointer"
        aria-label="Open venue chat"
      >
        <span className="material-symbols-outlined text-2xl">
          {open ? "expand_more" : "chat"}
        </span>
      </motion.button>
    </div>
  );
}
