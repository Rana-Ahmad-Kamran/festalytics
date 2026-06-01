"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { adminFetch } from "@/hooks/useAdminApi";

export default function AdminVenueDetailPage() {
  const { slug } = useParams();
  const [venue, setVenue] = useState(null);
  const [ownerId, setOwnerId] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const data = await adminFetch(`/api/admin/venues/${slug}`);
    setVenue(data);
    setOwnerId(data.ownerId || "");
  };

  useEffect(() => {
    if (slug) load().catch((e) => setMessage(e.message));
  }, [slug]);

  const saveOwner = async () => {
    try {
      await adminFetch(`/api/admin/venues/${slug}`, {
        method: "PATCH",
        body: JSON.stringify({ ownerId: ownerId || null }),
      });
      await adminFetch("/api/admin/venues", {
        method: "PATCH",
        body: JSON.stringify({
          slug,
          ownerId: ownerId || null,
          syncUserVenueId: Boolean(ownerId),
        }),
      });
      setMessage("Owner updated.");
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  const toggleActive = async () => {
    const isListed = venue.serviceActive !== false;
    try {
      await adminFetch("/api/admin/venues", {
        method: "PATCH",
        body: JSON.stringify({ slug, serviceActive: !isListed }),
      });
      await load();
    } catch (e) {
      setMessage(e.message);
    }
  };

  if (!venue) {
    return (
      <AdminShell title="Venue" subtitle={String(slug)}>
        <p className="text-slate-400">{message || "Loading…"}</p>
      </AdminShell>
    );
  }

  const profile = venue.profile || {};

  return (
    <AdminShell
      title={venue.name || venue.hallName || slug}
      subtitle={`Slug: ${slug}`}
    >
      <Link href="/admin/venues" className="text-sm text-rose-400 hover:underline mb-6 inline-block">
        ← All venues
      </Link>

      {message && <p className="mb-4 text-sm text-amber-300">{message}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3 text-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Profile</h2>
          <p>
            <span className="text-slate-500">Area:</span> {profile.area || venue.city || "—"}
          </p>
          <p>
            <span className="text-slate-500">Address:</span>{" "}
            {profile.address || venue.streetAddress || "—"}
          </p>
          <p>
            <span className="text-slate-500">Capacity:</span> {venue.capacity ?? profile.capacity ?? "—"}
          </p>
          <p>
            <span className="text-slate-500">Phone:</span> {profile.phone_1 || "—"}
          </p>
          <p>
            <span className="text-slate-500">Listed:</span>{" "}
            {venue.serviceActive !== false ? "Yes" : "No"}
          </p>
          <p>
            <span className="text-slate-500">Network:</span>{" "}
            {venue.isNetworkParticipant ? "Participant" : "No"}
          </p>
          <button
            type="button"
            onClick={toggleActive}
            className="mt-2 px-4 py-2 rounded-full bg-rose-600 text-white text-xs font-bold uppercase"
          >
            {venue.serviceActive !== false ? "Hide from marketplace" : "Publish listing"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
            Link vendor
          </h2>
          <label className="block text-xs text-slate-500 mb-1">Owner Firebase UID</label>
          <input
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-2 text-sm text-white font-mono mb-3"
            placeholder="Paste vendor uid"
          />
          <button
            type="button"
            onClick={saveOwner}
            className="px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase"
          >
            Save owner + sync user.venueId
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Raw document (preview)
        </h2>
        <pre className="text-[11px] text-slate-400 overflow-auto max-h-96">
          {JSON.stringify(
            {
              pricing: venue.pricing,
              cateringPackages: venue.cateringPackages?.length,
              images: venue.images?.length,
              blockedDates: venue.blockedDates,
            },
            null,
            2
          )}
        </pre>
      </div>
    </AdminShell>
  );
}
