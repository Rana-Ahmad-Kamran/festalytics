"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

const VendorSearchContext = createContext(null);

export function VendorSearchProvider({ children }) {
  const [globalSearch, setGlobalSearch] = useState("");

  const value = useMemo(
    () => ({ globalSearch, setGlobalSearch }),
    [globalSearch]
  );

  return (
    <VendorSearchContext.Provider value={value}>
      {children}
    </VendorSearchContext.Provider>
  );
}

export function useVendorSearch() {
  const ctx = useContext(VendorSearchContext);
  if (!ctx) {
    return { globalSearch: "", setGlobalSearch: () => {} };
  }
  return ctx;
}
