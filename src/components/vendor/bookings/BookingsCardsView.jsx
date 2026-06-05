"use client";

import React from "react";
import { motion } from "framer-motion";

export default function BookingsCardsView({ bookings, bookingRowKey, onSelect }) {
  if (!bookings.length) {
    return (
      <div className="p-12 text-center text-outline font-bold uppercase tracking-widest text-xs">
        No bookings match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
      {bookings.map((booking, idx) => (
        <motion.button
          key={bookingRowKey(booking, idx)}
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.03 }}
          onClick={() => onSelect?.(booking)}
          className="text-left bg-white rounded-3xl border border-outline-variant p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-xs font-black text-primary tracking-wider">{booking.id}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-surface-variant px-2 py-1 rounded-full">
              {booking.status}
            </span>
          </div>
          <p className="font-black text-on-surface">{booking.customer?.name}</p>
          <p className="text-xs text-outline mt-1">{booking.service || booking.eventDetails?.category}</p>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/40 text-xs">
            <span>{booking.eventDate || booking.eventDetails?.date || "—"}</span>
            <span className="font-black text-primary">Rs {Number(booking.amount || 0).toLocaleString()}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
