import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { PaymentData } from "../components/modals/RecordPaymentModal";

const DAY_MS = 86_400_000;
const QUEUE_KEY = "gym.offline.queue";

export type PaymentMethod = "cash" | "upi" | "card";

export type PendingPayment = {
  kind: "payment";
  clientId: string;
  memberId: string;
  memberName: string;
  planId: string;
  planName: string;
  amount: number;
  daysAdded: number;
  method: PaymentMethod;
  notes?: string;
  paidAt: string;
  planStart: string | null;
  planExpiresAt: string | null;
  queuedAt: number;
};

export type PendingAttendance = {
  kind: "attendance";
  clientId: string;
  memberId: string;
  memberName: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  weight: number | null;
  queuedAt: number;
};

export type AttendanceUpdateFields = {
  timeOut?: string;
  weight?: number | null;
};

export type PendingAttendanceUpdate = {
  kind: "attendance-update";
  clientId: string;
  docId: string;
  memberId: string;
  memberName: string;
  fields: AttendanceUpdateFields;
  queuedAt: number;
};

export type PendingItem = PendingPayment | PendingAttendance | PendingAttendanceUpdate;

export type RawMember = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  planId?: string;
  planName?: string;
  planStart?: unknown;
  planExpiresAt?: unknown;
  createdAt?: unknown;
};

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function subscribeOnline(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);
  document.addEventListener("visibilitychange", handler);
  return () => {
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
    document.removeEventListener("visibilitychange", handler);
  };
}

function readQueue(): PendingItem[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as PendingItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PendingItem[]): void {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota issues
  }
}

export function pendingItems(): PendingItem[] {
  return readQueue();
}

export function pendingCount(): number {
  return readQueue().length;
}

export function pendingPaymentCount(): number {
  return readQueue().filter((i) => i.kind === "payment").length;
}

export function enqueuePending(item: PendingItem): void {
  const items = readQueue();
  if (!items.some((i) => i.clientId === item.clientId)) {
    items.push(item);
    writeQueue(items);
  }
}

export function removePending(clientId: string): void {
  writeQueue(readQueue().filter((i) => i.clientId !== clientId));
}

export function clearPending(): void {
  writeQueue([]);
}

export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function newClientId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildPaymentPayload(
  member: { id: string; name: string },
  rawMember: RawMember | undefined,
  data: PaymentData,
): PendingPayment {
  const now = Date.now();
  const currentExpiry = rawMember ? toDateSafe(rawMember.planExpiresAt) : undefined;
  const hasActivePlan = currentExpiry != null && currentExpiry.getTime() > now;

  let planStart: string | null = null;
  let planExpiresAt: string | null = null;

  if (data.days > 0) {
    const base = hasActivePlan ? currentExpiry!.getTime() : now;
    planExpiresAt = new Date(base + data.days * DAY_MS).toISOString();
    planStart =
      hasActivePlan && rawMember?.planStart
        ? (toDateSafe(rawMember.planStart)?.toISOString() ?? new Date().toISOString())
        : new Date().toISOString();
  }

  return {
    kind: "payment",
    clientId: newClientId("pay"),
    memberId: member.id,
    memberName: member.name,
    planId: data.planId,
    planName: data.planName,
    amount: data.amount,
    daysAdded: data.days,
    method: data.method,
    notes: data.notes,
    paidAt: new Date().toISOString(),
    planStart,
    planExpiresAt,
    queuedAt: now,
  };
}

export function buildAttendancePayload(member: {
  id: string;
  name: string;
}): PendingAttendance {
  const now = new Date();
  return {
    kind: "attendance",
    clientId: `att_${member.id}_${localDateKey(now)}`,
    memberId: member.id,
    memberName: member.name,
    date: now.toISOString(),
    timeIn: now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    timeOut: null,
    weight: null,
    queuedAt: Date.now(),
  };
}

export function buildAttendanceUpdatePayload(
  member: { id: string; name: string },
  docId: string,
  fields: AttendanceUpdateFields,
): PendingAttendanceUpdate {
  return {
    kind: "attendance-update",
    clientId: newClientId("att_upd"),
    docId,
    memberId: member.id,
    memberName: member.name,
    fields,
    queuedAt: Date.now(),
  };
}

export function nowTimeString(): string {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

async function applyPayment(p: PendingPayment): Promise<void> {
  await setDoc(doc(db, "payments", p.clientId), {
    memberId: p.memberId,
    memberName: p.memberName,
    planId: p.planId,
    planName: p.planName,
    amount: p.amount,
    daysAdded: p.daysAdded,
    method: p.method,
    notes: p.notes,
    paidAt: new Date(p.paidAt),
  });

  if (p.daysAdded > 0) {
    const userSnap = await getDoc(doc(db, "users", p.memberId));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const currentExpiry = toDateSafe(userData.planExpiresAt);
    const hasActivePlan =
      currentExpiry != null && currentExpiry.getTime() > Date.now();
    const base = hasActivePlan ? currentExpiry!.getTime() : Date.now();
    const planStart =
      hasActivePlan && userData.planStart
        ? (toDateSafe(userData.planStart) ?? new Date())
        : new Date();
    await updateDoc(doc(db, "users", p.memberId), {
      planId: p.planId,
      planName: p.planName,
      planStart,
      planExpiresAt: new Date(base + p.daysAdded * DAY_MS),
    });
  }
}

async function applyAttendance(a: PendingAttendance): Promise<void> {
  await setDoc(doc(db, "attendance", a.clientId), {
    memberId: a.memberId,
    memberName: a.memberName,
    date: new Date(a.date),
    timeIn: a.timeIn,
    timeOut: a.timeOut,
    weight: a.weight,
  });
}

async function applyAttendanceUpdate(u: PendingAttendanceUpdate): Promise<void> {
  await updateDoc(doc(db, "attendance", u.docId), u.fields);
}

export async function flushPending(): Promise<{ flushed: number; failed: number }> {
  const items = readQueue();
  let flushed = 0;
  let failed = 0;
  for (const item of items) {
    try {
      if (item.kind === "payment") {
        await applyPayment(item);
      } else if (item.kind === "attendance") {
        await applyAttendance(item);
      } else {
        await applyAttendanceUpdate(item);
      }
      removePending(item.clientId);
      flushed += 1;
    } catch {
      failed += 1;
    }
  }
  return { flushed, failed };
}

export async function writePaymentOnline(p: PendingPayment): Promise<void> {
  await applyPayment(p);
}

export async function writeAttendanceOnline(a: PendingAttendance): Promise<void> {
  await applyAttendance(a);
}

export async function writeAttendanceUpdateOnline(u: PendingAttendanceUpdate): Promise<void> {
  await applyAttendanceUpdate(u);
}

function toDateSafe(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date;
}