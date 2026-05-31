"use client";

import { Calendar } from "lucide-react";
import { getTodayDateKey, isPastDateKey } from "@/lib/firestore/venueCalendar";

const INPUT_STYLES = {
  default:
    "w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:border-[#D6336C] focus:ring-2 focus:ring-pink-100 outline-none transition-all [color-scheme:light]",
  vendor:
    "w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-transparent bg-slate-50 text-sm font-bold text-on-surface focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all [color-scheme:light]",
  compact:
    "w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-800 focus:border-[#D6336C] focus:ring-1 focus:ring-[#D6336C] outline-none transition-all [color-scheme:light]",
};

export default function EventDatePicker({
  value,
  onChange,
  label,
  required = false,
  variant = "default",
  className = "",
  inputClassName = "",
  error,
  hint = "Only today and future dates can be selected.",
  id,
}) {
  const minDate = getTodayDateKey();
  const inputId = id || "event-date";

  const handleChange = (event) => {
    const next = event.target.value;
    if (next && isPastDateKey(next)) return;
    onChange?.(next);
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className={
            variant === "vendor"
              ? "text-[10px] font-black text-on-surface-variant uppercase tracking-widest px-1 mb-2 block"
              : variant === "compact"
              ? "text-[9px] font-black text-gray-500 uppercase tracking-widest px-0.5 mb-1 block"
              : "block text-sm font-bold text-gray-700 mb-2"
          }
        >
          {label}
          {required ? " *" : ""}
        </label>
      )}

      <div className="relative">
        <Calendar
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#D6336C] ${
            variant === "compact" ? "w-4 h-4" : "w-5 h-5"
          }`}
        />
        <input
          id={inputId}
          type="date"
          value={value || ""}
          onChange={handleChange}
          min={minDate}
          required={required}
          className={`${INPUT_STYLES[variant] || INPUT_STYLES.default} ${inputClassName}`}
        />
      </div>

      {error ? (
        <p className="text-[10px] text-red-500 font-bold uppercase mt-1.5 px-0.5">{error}</p>
      ) : hint ? (
        <p className="text-[10px] text-gray-400 font-medium mt-1.5 px-0.5">{hint}</p>
      ) : null}
    </div>
  );
}

export { isPastDateKey, getTodayDateKey };
