"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

const VendorSearchContext = createContext(null);

export function VendorSearchProvider({ children }) {
  const [globalSearch, setGlobalSearchState] = useState("");

  const setGlobalSearch = useCallback((value) => {
    setGlobalSearchState(typeof value === "function" ? value : String(value ?? ""));
  }, []);

  const value = useMemo(
    () => ({ globalSearch, setGlobalSearch }),
    [globalSearch, setGlobalSearch]
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
