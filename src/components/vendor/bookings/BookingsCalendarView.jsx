"use client";

import React, { useMemo } from "react";

function parseDateKey(booking) {
  const raw = booking?.eventDate || booking?.eventDetails?.date || "";
  const text = String(raw).trim();
  if (!text) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export default function BookingsCalendarView({ bookings, bookingRowKey, onSelect }) {
  const byDate = useMemo(() => {
    const map = {};
    for (const booking of bookings) {
      const key = parseDateKey(booking) || "unscheduled";
      if (!map[key]) map[key] = [];
      map[key].push(booking);
    }
    return Object.entries(map).sort(([a], [b]) => {
      if (a === "unscheduled") return 1;
      if (b === "unscheduled") return -1;
      return a.localeCompare(b);
    });
  }, [bookings]);

  if (!bookings.length) {
    return (
      <div className="p-12 text-center text-outline font-bold uppercase tracking-widest text-xs">
        No bookings match your filters.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {byDate.map(([dateKey, rows]) => (
        <section key={dateKey}>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-3">
            {dateKey === "unscheduled" ? "No event date" : dateKey}
          </h3>
          <div className="space-y-2">
            {rows.map((booking, idx) => (
              <button
                key={bookingRowKey(booking, idx)}
                type="button"
                onClick={() => onSelect?.(booking)}
                className="w-full text-left flex items-center justify-between gap-4 bg-surface-container-low rounded-2xl px-4 py-3 border border-outline-variant/50 hover:border-primary/40 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-sm text-on-surface">{booking.customer?.name}</p>
                  <p className="text-[10px] text-outline uppercase tracking-wider">{booking.id} · {booking.status}</p>
                </div>
                <span className="text-xs font-black text-primary shrink-0">
                  Rs {Number(booking.amount || 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
