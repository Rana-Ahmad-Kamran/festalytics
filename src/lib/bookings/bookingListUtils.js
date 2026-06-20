function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9@.+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Coerce any booking source field to a display label (always a string). */
export function formatBookingSourceLabel(bookingOrSource) {
  const isRow =
    bookingOrSource &&
    typeof bookingOrSource === "object" &&
    ("source" in bookingOrSource ||
      "bookingSource" in bookingOrSource ||
      "isWalkIn" in bookingOrSource ||
      "isQuotation" in bookingOrSource);

  const row = isRow ? bookingOrSource : null;
  let raw = isRow
    ? row.source ??
      row.bookingSource ??
      row.raw?.bookingSource ??
      row.raw?.eventDetails?.source
    : bookingOrSource;

  if (raw && typeof raw === "object") {
    raw = raw.label || raw.name || raw.type || raw.value || "";
  }

  const text = String(raw ?? "").trim();
  const lower = text.toLowerCase();

  if (row?.isWalkIn || lower === "walk-in" || lower.includes("walk")) {
    return "Walk-in ERP";
  }
  if (
    row?.isQuotation ||
    lower === "online" ||
    lower.includes("portal") ||
    lower.includes("quotation") ||
    lower === "web"
  ) {
    return "Online Portal";
  }
  if (!text) return "Online Portal";
  return text;
}

export function isWalkInBookingSource(bookingOrSource) {
  return formatBookingSourceLabel(bookingOrSource).toLowerCase().includes("walk");
}

/** Excel serial (e.g. 46176) → Date (Windows 1900 epoch). */
export function excelSerialToDate(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n) || n < 1) return null;
  const utc = Date.UTC(1899, 11, 30) + Math.round(n) * 86400000;
  const d = new Date(utc);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Normalize sheet/API date strings for display and sorting. */
export function normalizeBookingEventDate(raw) {
  const text = String(raw ?? "").trim();
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const asNum = Number(text);
  if (Number.isFinite(asNum) && asNum > 30000 && asNum < 120000) {
    const d = excelSerialToDate(asNum);
    if (d) return d.toISOString().slice(0, 10);
  }

  const parsed = new Date(text.includes("T") ? text : `${text}T12:00:00`);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return text;
}

export function parseEventDate(booking) {
  const raw =
    booking?.eventDate ||
    booking?.eventDetails?.date ||
    booking?.raw?.eventDetails?.date ||
    booking?.raw?.eventDate ||
    "";
  const text = String(raw).trim();
  if (!text) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const d = new Date(`${text}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const asNum = Number(text);
  if (Number.isFinite(asNum) && asNum > 30000 && asNum < 120000) {
    return excelSerialToDate(asNum);
  }

  const d = new Date(text.includes("T") ? text : `${text}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Broad haystack for customer name, IDs, service, contact, sheet columns. */
export function buildBookingSearchHaystack(booking) {
  const parts = [
    booking?.id,
    booking?.docId,
    booking?.customer?.name,
    booking?.customer?.otherName,
    booking?.customer?.email,
    booking?.customer?.contact,
    booking?.customer?.phone,
    booking?.customer?.mobile,
    booking?.service,
    booking?.eventDetails?.category,
    booking?.eventDate,
    booking?.timing,
    booking?.bookedDate,
    booking?.status,
    booking?.source,
    booking?.bookingSource,
    booking?.raw?.customerName,
    booking?.raw?.quotationId,
    booking?.raw?.userId,
    booking?.raw?.eventTitle,
    booking?.raw?.eventLocation,
  ];

  if (booking?.sheetColumns && typeof booking.sheetColumns === "object") {
    parts.push(...Object.keys(booking.sheetColumns));
    parts.push(...Object.values(booking.sheetColumns));
  }

  return normalizeText(parts.filter(Boolean).join(" "));
}

export function matchesBookingSearch(booking, query) {
  const q = normalizeText(query);
  if (!q) return true;

  const haystack = buildBookingSearchHaystack(booking);
  const tokens = q.split(/\s+/).filter(Boolean);
  return tokens.every((token) => haystack.includes(token));
}

export function matchesBookingStatus(booking, statusFilter) {
  const filter = normalizeText(statusFilter);
  if (!filter || filter === "all status") return true;
  const status = normalizeText(booking?.status);
  if (filter === "pending") {
    return (
      status.includes("pending") ||
      status.includes("quote") ||
      status === "counter offer"
    );
  }
  if (filter === "confirmed") return status.includes("confirmed");
  if (filter === "completed") return status === "completed";
  if (filter === "cancelled") {
    return status.includes("cancel") || status.includes("declined");
  }
  return status.includes(filter);
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function matchesBookingTimeRange(booking, timeFilter) {
  const filter = normalizeText(timeFilter);
  if (!filter || filter === "all time") return true;

  const eventDate = parseEventDate(booking);
  const booked = booking?.bookedDate ? new Date(booking.bookedDate) : null;
  const ref = eventDate || (booked && !Number.isNaN(booked.getTime()) ? booked : null);
  if (!ref) return filter !== "today" && filter !== "this week" && filter !== "this month" && filter !== "last week";

  const now = new Date();
  const today = startOfDay(now);

  if (filter === "today") {
    return startOfDay(ref).getTime() === today.getTime();
  }

  if (filter === "this week") {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return ref >= weekStart && ref < weekEnd;
  }

  if (filter === "last week") {
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    return ref >= lastWeekStart && ref < thisWeekStart;
  }

  if (filter === "this month") {
    return ref.getFullYear() === now.getFullYear() && ref.getMonth() === now.getMonth();
  }

  return true;
}

function hasSheetAnchor(row) {
  return Boolean(row?.sheetName && row?.sheetRowNumber);
}

function bookingChannel(row) {
  const src = normalizeText(row?.source || row?.bookingSource || "");
  if (row?.isQuotation || src.includes("online") || src.includes("portal") || src.includes("quotation")) {
    return "online";
  }
  if (src.includes("walk")) return "walkin";
  if (hasSheetAnchor(row)) return "sheet";
  return "other";
}

function dedupeFingerprint(row) {
  const name = normalizeText(row?.customer?.name);
  const date = normalizeBookingEventDate(row?.eventDate);
  if (!name || !date) return null;
  return `${bookingChannel(row)}|${name}|${date}`;
}

function bookingRowPriority(row) {
  let score = 0;
  if (hasSheetAnchor(row)) score += 100;
  if (String(row?.id || "").match(/^BK-/i)) score += 40;
  const contact = String(row?.customer?.contact || row?.customer?.email || "").trim();
  if (contact && !/no (contact|phone)/i.test(contact)) score += 30;
  if (row?.timing) score += 15;
  if (row?.proof || row?.voiceProofUrl) score += 10;
  if (row?.isQuotation) score += 5;
  return score;
}

function pickDisplayId(primary, secondary) {
  const candidates = [primary?.id, secondary?.id].filter(Boolean);
  const bk = candidates.find((id) => /^BK-/i.test(String(id)));
  return bk || primary?.id || secondary?.id;
}

function mergeBookingPair(primary, secondary) {
  const contact =
    primary?.customer?.contact && !/no (contact|phone)/i.test(primary.customer.contact)
      ? primary.customer.contact
      : secondary?.customer?.contact;

  const quotationDocId =
    (secondary?.isQuotation ? secondary.docId : null) ||
    (primary?.isQuotation ? primary.docId : null) ||
    primary?.quotationDocId ||
    secondary?.quotationDocId ||
    primary?.raw?.quotationId ||
    secondary?.raw?.quotationId;

  const displayId = pickDisplayId(primary, secondary);

  return {
    ...secondary,
    ...primary,
    id: displayId,
    docId: quotationDocId || displayId || primary?.docId || secondary?.docId,
    customer: {
      ...secondary?.customer,
      ...primary?.customer,
      contact: contact || primary?.customer?.contact || secondary?.customer?.contact,
      email: contact || primary?.customer?.email || secondary?.customer?.email,
    },
    timing: primary?.timing || secondary?.timing,
    amount: Math.max(Number(primary?.amount) || 0, Number(secondary?.amount) || 0) || primary?.amount || secondary?.amount,
    proof: primary?.proof || secondary?.proof,
    voiceProofUrl: primary?.voiceProofUrl || secondary?.voiceProofUrl,
    sheetName: primary?.sheetName || secondary?.sheetName,
    sheetRowNumber: primary?.sheetRowNumber || secondary?.sheetRowNumber,
    sheetColumns: primary?.sheetColumns || secondary?.sheetColumns,
    source: formatBookingSourceLabel({
      ...secondary,
      ...primary,
      isWalkIn: Boolean(primary?.isWalkIn || secondary?.isWalkIn),
      isQuotation: Boolean(primary?.isQuotation || secondary?.isQuotation),
    }),
    bookingSource:
      primary?.isWalkIn || secondary?.isWalkIn
        ? "walk-in"
        : hasSheetAnchor(primary) || hasSheetAnchor(secondary) || primary?.isQuotation || secondary?.isQuotation
          ? "online"
          : String(primary?.bookingSource || secondary?.bookingSource || "online"),
    isQuotation: Boolean(primary?.isQuotation || secondary?.isQuotation),
    quotationDocId,
    raw: { ...secondary?.raw, ...primary?.raw, quotationId: quotationDocId || primary?.raw?.quotationId },
    mergedSources: true,
  };
}

/**
 * Collapse duplicate rows for the same customer + event date + channel
 * (e.g. Firestore quotation + synced Google Sheet row).
 */
export function dedupeMergedBookings(rows) {
  if (!Array.isArray(rows) || rows.length < 2) return rows || [];

  const groups = new Map();
  const ungrouped = [];

  for (const row of rows) {
    const fp = dedupeFingerprint(row);
    if (!fp) {
      ungrouped.push(row);
      continue;
    }

    const existing = groups.get(fp);
    if (!existing) {
      groups.set(fp, row);
      continue;
    }

    const primary = bookingRowPriority(row) >= bookingRowPriority(existing) ? row : existing;
    const secondary = primary === row ? existing : row;
    groups.set(fp, mergeBookingPair(primary, secondary));
  }

  return [...groups.values(), ...ungrouped];
}

/** Descending by event date (most recent / latest dates first). Undated rows last. */
export function sortBookingsByEventDate(bookings) {
  return [...bookings].sort((a, b) => {
    const da = parseEventDate(a);
    const db = parseEventDate(b);
    if (da && db) {
      const diff = db.getTime() - da.getTime();
      if (diff !== 0) return diff;
      return String(b.id || "").localeCompare(String(a.id || ""));
    }
    if (da) return -1;
    if (db) return 1;
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
}

export function filterAndSortBookings(bookings, { search = "", status = "All Status", time = "All Time" } = {}) {
  return sortBookingsByEventDate(
    bookings.filter(
      (b) =>
        matchesBookingSearch(b, search) &&
        matchesBookingStatus(b, status) &&
        matchesBookingTimeRange(b, time)
    )
  );
}
