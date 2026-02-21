"use client";

import { useCallback, useMemo, useRef } from "react";
import type { NormalizedEvent } from "../sdk/transforms/types";

interface CacheEntry {
  events: NormalizedEvent[];
  fetchedAt: number;
}

/**
 * In-memory cache for season-based sports (NASCAR, MMA, Golf).
 * Avoids re-fetching when navigating dates within the same season.
 */
export function useSeasonCache() {
  const cache = useRef<Map<string, CacheEntry>>(new Map());

  const get = useCallback((key: string): NormalizedEvent[] | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;
    // Cache valid for 10 minutes
    if (Date.now() - entry.fetchedAt > 10 * 60 * 1000) {
      cache.current.delete(key);
      return null;
    }
    return entry.events;
  }, []);

  const set = useCallback((key: string, events: NormalizedEvent[]) => {
    cache.current.set(key, { events, fetchedAt: Date.now() });
  }, []);

  return useMemo(() => ({ get, set }), [get, set]);
}
