export const CACHE_KEYS = {
  plans: "gym.cache.plans",
  members: "gym.cache.members",
  payments: "gym.cache.payments",
  attendance: "gym.cache.attendance",
  staff: "gym.cache.staff",
  memberProfile: "gym.cache.memberProfile",
  memberPayments: "gym.cache.memberPayments",
  memberAttendance: "gym.cache.memberAttendance",
  gymSettings: "gym.cache.gymSettings",
  announcements: "gym.cache.announcements",
} as const;

export const TTL = {
  plans: 30 * 60 * 1000,
  members: 5 * 60 * 1000,
  payments: 5 * 60 * 1000,
  attendance: 5 * 60 * 1000,
  staff: 10 * 60 * 1000,
  memberProfile: 5 * 60 * 1000,
  memberPayments: 5 * 60 * 1000,
  memberAttendance: 5 * 60 * 1000,
  gymSettings: 30 * 60 * 1000,
  announcements: 15 * 60 * 1000,
} as const;

const MAX_CACHED_PAYMENTS = 300;
const MAX_CACHED_ATTENDANCE = 300;

export type CachedEntry<T> = {
  data: T;
  fetchedAt: number;
};

function isStorageAvailable(): boolean {
  try {
    const probe = "__gym_cache_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function readCache<T>(key: string): CachedEntry<T> | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry<T>;
    if (!parsed || parsed.fetchedAt == null || parsed.data == null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T, cap?: number): void {
  if (!isStorageAvailable()) return;
  try {
    const trimmed = Array.isArray(data) && cap != null ? (data as unknown[]).slice(0, cap) : data;
    const entry: CachedEntry<unknown> = { data: trimmed, fetchedAt: Date.now() };
    window.localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage blocked — skip caching, never crash the app.
  }
}

export function clearCache(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function isFresh(fetchedAt: number, ttlMs: number, now = Date.now()): boolean {
  return now - fetchedAt < ttlMs;
}

export function capPayments<T>(rows: T[]): T[] {
  return rows.slice(0, MAX_CACHED_PAYMENTS);
}

export function capAttendance<T>(rows: T[]): T[] {
  return rows.slice(0, MAX_CACHED_ATTENDANCE);
}

export function toISO(value: unknown): string | undefined {
  const d = toDate(value);
  return d ? d.toISOString() : undefined;
}

export function toDate(value: unknown): Date | undefined {
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