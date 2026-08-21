import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildAttendancePayload,
  buildAttendanceUpdatePayload,
  buildPaymentPayload,
  enqueuePending,
  flushPending,
  isOnline,
  nowTimeString,
  pendingCount,
  subscribeOnline,
  writeAttendanceOnline,
  writeAttendanceUpdateOnline,
  writePaymentOnline,
} from "./offline";
import type {
  PendingAttendance,
  PendingAttendanceUpdate,
  PendingPayment,
  RawMember,
} from "./offline";
import type { PaymentData } from "../components/modals/RecordPaymentModal";

function isNetworkError(err: unknown): boolean {
  const code = (err as { code?: string })?.code ?? "";
  return (
    code.includes("unavailable") ||
    code.includes("network") ||
    code.includes("deadline-exceeded") ||
    code.includes("offline")
  );
}

export type PaymentSyncResult = {
  pendingCount: number;
  isOnline: boolean;
  flushing: boolean;
  syncNow: () => Promise<void>;
  recordPayment: (
    member: { id: string; name: string },
    rawMember: RawMember | undefined,
    data: PaymentData,
  ) => Promise<{ queued: boolean; payload: PendingPayment }>;
  recordAttendance: (
    member: { id: string; name: string },
  ) => Promise<{ queued: boolean; payload: PendingAttendance }>;
  checkoutAttendance: (
    member: { id: string; name: string },
    docId: string,
  ) => Promise<{ queued: boolean; payload: PendingAttendanceUpdate }>;
  updateAttendanceWeight: (
    member: { id: string; name: string },
    docId: string,
    weight: number,
  ) => Promise<{ queued: boolean; payload: PendingAttendanceUpdate }>;
};

export function usePaymentSync(onSynced?: (info: { flushed: number }) => void): PaymentSyncResult {
  const [pending, setPending] = useState(pendingCount);
  const [online, setOnline] = useState(isOnline());
  const [flushing, setFlushing] = useState(false);
  const onSyncedRef = useRef(onSynced);

  useEffect(() => {
    onSyncedRef.current = onSynced;
  });

  const flushLock = useRef(false);

  const refresh = useCallback(() => setPending(pendingCount()), []);

  const syncNow = useCallback(async () => {
    if (flushLock.current) return;
    flushLock.current = true;
    setFlushing(true);
    try {
      const res = await flushPending();
      if (res.flushed > 0) onSyncedRef.current?.({ flushed: res.flushed });
    } finally {
      flushLock.current = false;
      setFlushing(false);
      refresh();
    }
  }, [refresh]);

  useEffect(() => {
    const unsub = subscribeOnline(() => {
      const nowOnline = isOnline();
      setOnline(nowOnline);
      refresh();
      if (nowOnline) {
        void syncNow();
      }
    });
    if (pendingCount() > 0 && isOnline()) {
      void syncNow();
    }
    return unsub;
  }, [syncNow, refresh]);

  const recordPayment = useCallback(
    async (
      member: { id: string; name: string },
      rawMember: RawMember | undefined,
      data: PaymentData,
    ) => {
      const payload = buildPaymentPayload(member, rawMember, data);
      if (isOnline()) {
        try {
          await writePaymentOnline(payload);
          refresh();
          return { queued: false, payload };
        } catch (err) {
          if (!isNetworkError(err)) throw err;
        }
      }
      enqueuePending(payload);
      refresh();
      return { queued: true, payload };
    },
    [refresh],
  );

  const recordAttendance = useCallback(
    async (member: { id: string; name: string }) => {
      const payload = buildAttendancePayload(member);
      if (isOnline()) {
        try {
          await writeAttendanceOnline(payload);
          refresh();
          return { queued: false, payload };
        } catch (err) {
          if (!isNetworkError(err)) throw err;
        }
      }
      enqueuePending(payload);
      refresh();
      return { queued: true, payload };
    },
    [refresh],
  );

  const checkoutAttendance = useCallback(
    async (member: { id: string; name: string }, docId: string) => {
      const payload = buildAttendanceUpdatePayload(member, docId, {
        timeOut: nowTimeString(),
      });
      if (isOnline()) {
        try {
          await writeAttendanceUpdateOnline(payload);
          refresh();
          return { queued: false, payload };
        } catch (err) {
          if (!isNetworkError(err)) throw err;
        }
      }
      enqueuePending(payload);
      refresh();
      return { queued: true, payload };
    },
    [refresh],
  );

  const updateAttendanceWeight = useCallback(
    async (member: { id: string; name: string }, docId: string, weight: number) => {
      const payload = buildAttendanceUpdatePayload(member, docId, {
        weight,
      });
      if (isOnline()) {
        try {
          await writeAttendanceUpdateOnline(payload);
          refresh();
          return { queued: false, payload };
        } catch (err) {
          if (!isNetworkError(err)) throw err;
        }
      }
      enqueuePending(payload);
      refresh();
      return { queued: true, payload };
    },
    [refresh],
  );

  return {
    pendingCount: pending,
    isOnline: online,
    flushing,
    syncNow,
    recordPayment,
    recordAttendance,
    checkoutAttendance,
    updateAttendanceWeight,
  };
}