"use client";

import React from "react";
import Link from "next/link";
import { useVendorVenue } from "@/hooks/useVendorVenue";

/**
 * Blocks vendor ERP when no venueId is linked (incomplete onboarding).
 */
export default function VendorVenueGuard({ children }) {
  const { venueId, isLoading, hasVenue, error } = useVendorVenue();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasVenue) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-10 bg-white rounded-3xl border border-outline-variant shadow-xl text-center">
        <span className="material-symbols-outlined text-5xl text-primary mb-4">store</span>
        <h2 className="text-2xl font-black text-on-surface mb-2">Venue setup incomplete</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          Your vendor account is not linked to a venue listing yet.
          {error ? ` (${error})` : " Please complete vendor registration with your hall details."}
        </p>
        <Link
          href="/signup"
          className="inline-block px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-full"
        >
          Register as vendor
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
