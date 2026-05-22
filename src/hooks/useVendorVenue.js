"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase";

/**
 * Resolves authenticated vendor's tenant venueId from Firestore users doc.
 * Does NOT fall back to zaydan-banquet-hall.
 */
export function useVendorVenue() {
  const [venueId, setVenueId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setError(null);

      if (!currentUser) {
        setVenueId(null);
        setIsLoading(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists() && userSnap.data().venueId) {
          setVenueId(userSnap.data().venueId);
        } else {
          setVenueId(null);
        }
      } catch (err) {
        console.error("[useVendorVenue]", err);
        setError(err.message);
        setVenueId(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    venueId,
    isLoading,
    error,
    user,
    hasVenue: Boolean(venueId),
  };
}
