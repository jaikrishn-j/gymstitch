"use client";

import { createContext, useContext } from "react";

interface MemberContextValue {
  refresh: () => void;
}

const MemberContext = createContext<MemberContextValue | null>(null);

export function useMemberRefresh() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error("useMemberRefresh must be used within MemberProvider");
  return ctx.refresh;
}

export function MemberProvider({
  children,
  refresh,
}: {
  children: React.ReactNode;
  refresh: () => void;
}) {
  return (
    <MemberContext.Provider value={{ refresh }}>
      {children}
    </MemberContext.Provider>
  );
}
