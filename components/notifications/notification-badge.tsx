"use client";

import { useEffect, useState } from "react";

export function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch(
          "/api/payment-requests/admin?unread=true"
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCount(data.data.length);
        }
      } catch {
        // silently fail — badge just won't show
      }
    }

    fetchCount();

    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}
