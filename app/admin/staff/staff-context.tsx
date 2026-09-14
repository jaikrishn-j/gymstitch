"use client";

import { createContext, useContext, useCallback } from "react";

interface StaffContextValue {
  refresh: () => void;
}

const StaffContext = createContext<StaffContextValue | null>(null);

export function useStaffRefresh() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaffRefresh must be used within StaffProvider");
  return ctx.refresh;
}

export function StaffProvider({
  children,
  refresh,
}: {
  children: React.ReactNode;
  refresh: () => void;
}) {
  return (
    <StaffContext.Provider value={{ refresh }}>
      {children}
    </StaffContext.Provider>
  );
}
