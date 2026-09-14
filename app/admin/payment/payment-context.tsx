"use client";

import { createContext, useContext } from "react";

interface PaymentContextValue {
  refresh: () => void;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function usePaymentRefresh() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePaymentRefresh must be used within PaymentProvider");
  return ctx.refresh;
}

export function PaymentProvider({
  children,
  refresh,
}: {
  children: React.ReactNode;
  refresh: () => void;
}) {
  return (
    <PaymentContext.Provider value={{ refresh }}>
      {children}
    </PaymentContext.Provider>
  );
}
