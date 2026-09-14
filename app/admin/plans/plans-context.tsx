"use client";

import { createContext, useContext, useCallback } from "react";

interface PlansContextValue {
  refresh: () => void;
}

const PlansContext = createContext<PlansContextValue | null>(null);

export function usePlansRefresh() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error("usePlansRefresh must be used within PlansProvider");
  return ctx.refresh;
}

export function PlansProvider({
  children,
  refresh,
}: {
  children: React.ReactNode;
  refresh: () => void;
}) {
  return (
    <PlansContext.Provider value={{ refresh }}>
      {children}
    </PlansContext.Provider>
  );
}
