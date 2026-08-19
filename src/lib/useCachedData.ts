import { useCallback, useEffect, useRef, useState } from "react";
import { isFresh, readCache, writeCache } from "./cache";

export type UseCachedDataOptions<T> = {
  key: string;
  ttl: number;
  fetch: () => Promise<T>;
  bypass?: boolean;
};

export type UseCachedDataResult<T> = {
  data: T | null;
  lastSyncedAt: number | null;
  syncing: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
  mutate: (updater: (prev: T | null) => T) => void;
};

export function useCachedData<T>({
  key,
  ttl,
  fetch,
  bypass,
}: UseCachedDataOptions<T>): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(() => readCache<T>(key)?.data ?? null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(
    () => readCache<T>(key)?.fetchedAt ?? null,
  );
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(() => readCache<T>(key) == null);
  const fetchRef = useRef(fetch);

  useEffect(() => {
    fetchRef.current = fetch;
  });

  const load = useCallback(async () => {
    setSyncing(true);
    try {
      const fresh = await fetchRef.current();
      setData(fresh);
      setLastSyncedAt(Date.now());
      writeCache(key, fresh);
    } catch (err) {
      console.error(`[cache] fetch failed for "${key}":`, err);
    } finally {
      setSyncing(false);
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    const force = bypass ?? false;
    const cached = readCache<T>(key);
    if (cached && !force && isFresh(cached.fetchedAt, ttl)) {
      return;
    }
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [key, ttl, bypass, load]);

  const refetch = useCallback(() => load(), [load]);

  const mutate = useCallback(
    (updater: (prev: T | null) => T) => {
      const prev = readCache<T>(key)?.data ?? null;
      const next = updater(prev);
      writeCache(key, next);
      setData(next);
    },
    [key],
  );

  return { data, lastSyncedAt, syncing, loading, refetch, mutate };
}