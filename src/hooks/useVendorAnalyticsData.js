"use client";

import { useState, useEffect, useMemo } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useVendorVenue } from "@/hooks/useVendorVenue";
import { listenToVenueBookings } from "@/lib/firestore/bookings";
import {
  listenToIncomingQuotations,
  mapQuotationToBookingRow,
} from "@/lib/firestore/quotations";

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function normalizeStatus(status) {
  return (status || "").toLowerCase().trim();
}

function bookingAmount(row) {
  const n = Number(row.amount);
  if (n > 0) return n;
  return Number(row.raw?.financials?.grandTotal) || 0;
}

function parseEventDate(row) {
  const d = row.eventDate || row.raw?.eventDetails?.date;
  if (!d) return null;
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(date) {
  if (!date) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function computeRatingFromReviews(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return { average: 0, count: 0 };
  const rated = reviews.filter((r) => Number(r.rating) > 0);
  if (rated.length === 0) return { average: 0, count: reviews.length };
  const sum = rated.reduce((s, r) => s + Number(r.rating), 0);
  return { average: sum / rated.length, count: reviews.length };
}

function buildAnalytics(bookingRows, pendingQuotations, venueMeta) {
  const allRows = [...pendingQuotations, ...bookingRows];
  const totalBookings = bookingRows.length;
  const totalRevenue = bookingRows.reduce((s, b) => s + bookingAmount(b), 0);
  const pendingCount = pendingQuotations.length;

  const venueStats = venueMeta?.stats || {};
  const reviews = Array.isArray(venueMeta?.reviews) ? venueMeta.reviews : [];
  const reviewStats = computeRatingFromReviews(reviews);
  const averageRating =
    Number(venueStats.averageRating) > 0
      ? Number(venueStats.averageRating)
      : reviewStats.average;
  const reviewCount =
    Number(venueStats.reviewCount) > 0 ? Number(venueStats.reviewCount) : reviewStats.count;

  const statusCounts = { confirmed: 0, pending: 0, completed: 0, cancelled: 0, other: 0 };
  for (const row of allRows) {
    const st = normalizeStatus(row.status);
    if (st === "confirmed") statusCounts.confirmed += 1;
    else if (st === "completed") statusCounts.completed += 1;
    else if (st.includes("cancel") || st === "declined") statusCounts.cancelled += 1;
    else if (st.includes("pending") || st.includes("quote") || st === "counter offer")
      statusCounts.pending += 1;
    else statusCounts.other += 1;
  }
  const statusTotal = allRows.length || 1;
  const statusBreakdown = [
    { label: "Confirmed", key: "confirmed", count: statusCounts.confirmed },
    { label: "Pending", key: "pending", count: statusCounts.pending },
    { label: "Completed", key: "completed", count: statusCounts.completed },
    { label: "Cancelled", key: "cancelled", count: statusCounts.cancelled },
  ].map((item) => ({
    ...item,
    pct: Math.round((item.count / statusTotal) * 100),
    value: `${Math.round((item.count / statusTotal) * 100)}%`,
  }));

  const now = new Date();
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7Days.push({
      day: DAY_LABELS[d.getDay()],
      key,
      count: 0,
    });
  }
  const last7Map = Object.fromEntries(last7Days.map((d) => [d.key, d]));
  for (const row of bookingRows) {
    const ed = parseEventDate(row);
    if (!ed) continue;
    const key = ed.toISOString().slice(0, 10);
    if (last7Map[key]) last7Map[key].count += 1;
  }
  const max7 = Math.max(1, ...last7Days.map((d) => d.count));
  const last7DaysBookings = last7Days.map((d, i) => ({
    day: d.day,
    count: d.count,
    height: `${Math.round((d.count / max7) * 100)}%`,
    active: i === last7Days.length - 1,
  }));

  const serviceMap = new Map();
  for (const row of bookingRows) {
    const label = row.service || row.raw?.eventDetails?.category || "General Booking";
    const prev = serviceMap.get(label) || { label, count: 0, revenue: 0 };
    prev.count += 1;
    prev.revenue += bookingAmount(row);
    serviceMap.set(label, prev);
  }
  const popularServices = Array.from(serviceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxServiceCount = Math.max(1, ...popularServices.map((s) => s.count), 1);
  const servicePopularity = popularServices.map((s, i) => ({
    label: s.label,
    value: Math.round((s.count / maxServiceCount) * 100),
    bookings: s.count,
    width: `${Math.round((s.count / maxServiceCount) * 100)}%`,
    color: ["primary", "secondary", "tertiary", "primary-container", "outline"][i] || "outline",
  }));

  const monthlyBuckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyBuckets.push({
      month: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      revenue: 0,
      bookings: 0,
    });
  }
  for (const row of bookingRows) {
    const ed = parseEventDate(row);
    if (!ed) continue;
    const bucket = monthlyBuckets.find(
      (b) => b.year === ed.getFullYear() && b.monthIndex === ed.getMonth()
    );
    if (bucket) {
      bucket.bookings += 1;
      bucket.revenue += bookingAmount(row);
    }
  }
  const maxMonthlyRevenue = Math.max(1, ...monthlyBuckets.map((b) => b.revenue));
  const monthlyPerformance = monthlyBuckets.map((b, i) => ({
    month: b.month,
    revenue: b.revenue,
    bookings: b.bookings,
    h1: Math.round((b.revenue / maxMonthlyRevenue) * 100),
    h2: Math.round((b.bookings / Math.max(1, ...monthlyBuckets.map((x) => x.bookings))) * 100),
    index: i,
  }));

  const revenueTrend = monthlyBuckets.map((b) => ({
    label: b.month,
    revenue: b.revenue,
    height: Math.round((b.revenue / maxMonthlyRevenue) * 100) / 100,
  }));

  const recentBookings = [...allRows]
    .sort((a, b) => {
      const da = parseEventDate(a)?.getTime() || 0;
      const db = parseEventDate(b)?.getTime() || 0;
      return db - da;
    })
    .slice(0, 5)
    .map((row) => ({
      customer: row.customer?.name || "Client",
      service: row.service || "Event",
      date: row.eventDate || row.bookedDate || "—",
      status: row.status || "Pending",
      statusColor:
        normalizeStatus(row.status) === "completed"
          ? "bg-surface-container-highest text-on-surface-variant border-outline/20"
          : normalizeStatus(row.status).includes("pending") ||
              normalizeStatus(row.status).includes("quote")
            ? "bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary/20"
            : normalizeStatus(row.status).includes("cancel") ||
                normalizeStatus(row.status) === "declined"
              ? "bg-error-container text-on-error-container border-error/20"
              : "bg-secondary-container text-on-secondary-container border-secondary/20",
    }));

  const servicePerformance = popularServices.map((s) => ({
    name: s.label,
    bookings: s.count,
    revenue: `Rs. ${s.revenue.toLocaleString()}`,
    rating: averageRating > 0 ? averageRating.toFixed(1) : "—",
    date: "—",
    img: null,
  }));

  const weeklyPerformance = last7Days.map((d) => {
    const dayBookings = bookingRows.filter((row) => {
      const ed = parseEventDate(row);
      return ed && ed.toISOString().slice(0, 10) === d.key;
    });
    const rev = dayBookings.reduce((s, b) => s + bookingAmount(b), 0);
    return {
      day: d.day,
      bookings: dayBookings.length,
      revenue: `Rs. ${rev.toLocaleString()}`,
      active: d.key === now.toISOString().slice(0, 10),
    };
  });

  const recentPayments = bookingRows
    .filter((b) => Number(b.raw?.financials?.advancePaid) > 0)
    .slice(0, 5)
    .map((b) => ({
      date: formatDisplayDate(parseEventDate(b)),
      id: b.id || b.docId,
      amount: `Rs. ${Number(b.raw?.financials?.advancePaid).toLocaleString()}`,
      status: normalizeStatus(b.status) === "confirmed" ? "Paid" : "Pending",
      color: normalizeStatus(b.status) === "confirmed" ? "tertiary" : "secondary",
    }));

  const latestReviews = reviews.slice(0, 3).map((r) => ({
    name: r.name || "Customer",
    initials: (r.name || "C").slice(0, 2).toUpperCase(),
    service: r.role || r.service || "Event",
    rating: Number(r.rating) || 5,
    comment: r.comment || "",
    color: "secondary",
  }));

  const conversionRate =
    pendingQuotations.length + bookingRows.length > 0
      ? Math.round(
          (bookingRows.length / (pendingQuotations.length + bookingRows.length)) * 1000
        ) / 10
      : 0;

  return {
    totalBookings,
    totalRevenue,
    pendingCount,
    averageRating,
    reviewCount,
    conversionRate,
    statusBreakdown,
    statusTotal: allRows.length,
    last7DaysBookings,
    servicePopularity,
    monthlyPerformance,
    revenueTrend,
    recentBookings,
    servicePerformance,
    weeklyPerformance,
    recentPayments,
    latestReviews,
    hasData: allRows.length > 0,
  };
}

/**
 * Live vendor analytics from Firestore bookings, quotations, and venue profile.
 */
export function useVendorAnalyticsData() {
  const { venueId, isLoading: venueLoading } = useVendorVenue();
  const [bookingRows, setBookingRows] = useState([]);
  const [pendingQuotations, setPendingQuotations] = useState([]);
  const [venueMeta, setVenueMeta] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (venueLoading || !venueId) {
      if (!venueLoading) {
        setDataLoading(false);
        setBookingRows([]);
        setPendingQuotations([]);
      }
      return;
    }

    setDataLoading(true);
    setError(null);

    const unsubBookings = listenToVenueBookings(
      venueId,
      (rows) => {
        setBookingRows(rows);
        setDataLoading(false);
      },
      (err) => {
        setError(err.message);
        setDataLoading(false);
      }
    );

    const unsubQuotations = listenToIncomingQuotations(
      venueId,
      (quotations) => {
        setPendingQuotations(quotations.map(mapQuotationToBookingRow));
      },
      (err) => setError(err.message)
    );

    const unsubVenue = onSnapshot(
      doc(db, "venues", venueId),
      (snap) => setVenueMeta(snap.exists() ? snap.data() : null),
      (err) => setError(err.message)
    );

    return () => {
      unsubBookings();
      unsubQuotations();
      unsubVenue();
    };
  }, [venueId, venueLoading]);

  const analytics = useMemo(
    () => buildAnalytics(bookingRows, pendingQuotations, venueMeta),
    [bookingRows, pendingQuotations, venueMeta]
  );

  return {
    venueId,
    isLoading: venueLoading || dataLoading,
    error,
    analytics,
    bookingRows,
    pendingQuotations,
    venueMeta,
  };
}
