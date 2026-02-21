"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SportKey } from "../sdk/clients/probe";
import { nba, nfl, nhl, mlb, cbb, cfb, wnba, cwbb, soccer, nascar, mma, golf } from "../sdk/clients/index";
import {
  transformNbaGames,
  transformNflGames,
  transformNhlGames,
  transformMlbGames,
  transformCbbGames,
  transformCfbGames,
  transformWnbaGames,
  transformCwbbGames,
  transformSoccerGames,
  transformNascarRaces,
  transformMmaEvents,
  transformGolfTournaments,
  isDateInRange,
  type NormalizedEvent,
} from "../sdk/transforms/index";
import { useSeasonCache } from "./useSeasonCache";

export interface SportData {
  events: NormalizedEvent[];
  loading: boolean;
  error: string | null;
}

export type SportDataMap = Record<string, SportData>;

type StadiumMaps = Record<string, Map<number, string>>;

function dateToObj(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

function seasonYear(iso: string): string {
  return iso.slice(0, 4);
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Sports that are not date-based and should NOT be polled
const NON_POLLABLE: Set<SportKey> = new Set(["nascar", "mma", "golf"]);

const POLL_INTERVAL_MS = 5_000;

function makeTeamSportFetchers(stadiumMaps: StadiumMaps) {
  return {
    nba: {
      fetch: nba.getGamesByDate,
      transform: (d: unknown) => transformNbaGames(d as Parameters<typeof transformNbaGames>[0], { stadiumMap: stadiumMaps["nba"] }),
    },
    nfl: {
      fetch: nfl.getGamesByDate,
      transform: (d: unknown) => transformNflGames(d as Parameters<typeof transformNflGames>[0], { stadiumMap: stadiumMaps["nfl"] }),
    },
    nhl: {
      fetch: nhl.getGamesByDate,
      transform: (d: unknown) => transformNhlGames(d as Parameters<typeof transformNhlGames>[0], { stadiumMap: stadiumMaps["nhl"] }),
    },
    mlb: {
      fetch: mlb.getGamesByDate,
      transform: (d: unknown) => transformMlbGames(d as Parameters<typeof transformMlbGames>[0], { stadiumMap: stadiumMaps["mlb"] }),
    },
    cbb: {
      fetch: cbb.getGamesByDate,
      transform: (d: unknown) => transformCbbGames(d as Parameters<typeof transformCbbGames>[0], { stadiumMap: stadiumMaps["cbb"] }),
    },
    cfb: {
      fetch: cfb.getGamesByDate,
      transform: (d: unknown) => transformCfbGames(d as Parameters<typeof transformCfbGames>[0], { stadiumMap: stadiumMaps["cfb"] }),
    },
    wnba: {
      fetch: wnba.getGamesByDate,
      transform: (d: unknown) => transformWnbaGames(d as Parameters<typeof transformWnbaGames>[0], { stadiumMap: stadiumMaps["wnba"] }),
    },
    cwbb: {
      fetch: cwbb.getGamesByDate,
      transform: (d: unknown) => transformCwbbGames(d as Parameters<typeof transformCwbbGames>[0], { stadiumMap: stadiumMaps["cwbb"] }),
    },
  } as Record<string, { fetch: (date: Date) => Promise<{ data?: unknown; error?: unknown }>; transform: (d: unknown) => NormalizedEvent[] }>;
}

export function useSportData(
  date: string,
  accessibleSports: SportKey[],
  accessibleCompetitions: string[],
  selectedSport: SportKey | "all",
  stadiumMaps: StadiumMaps,
): { data: SportDataMap; lastPolled: Date | null } {
  const [data, setData] = useState<SportDataMap>({});
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const genRef = useRef(0);
  const seasonCache = useSeasonCache();

  const updateSport = useCallback(
    (gen: number, sport: string, update: Partial<SportData>) => {
      if (genRef.current !== gen) return; // stale
      setData((prev) => ({
        ...prev,
        [sport]: { ...prev[sport], ...update } as SportData,
      }));
    },
    [],
  );

  // Main data fetch effect
  useEffect(() => {
    const gen = ++genRef.current;
    const fetchers = makeTeamSportFetchers(stadiumMaps);

    // Initialize all accessible sports as loading
    const initial: SportDataMap = {};
    for (const key of accessibleSports) {
      initial[key] = { events: [], loading: true, error: null };
    }
    setData(initial);

    const dateObj = dateToObj(date);
    const year = seasonYear(date);

    // Fetch team sports
    for (const key of accessibleSports) {
      const fetcher = fetchers[key];
      if (!fetcher) continue;

      fetcher
        .fetch(dateObj)
        .then(({ data: responseData }) => {
          if (genRef.current !== gen) return;
          const events = responseData ? fetcher.transform(responseData) : [];
          updateSport(gen, key, { events, loading: false });
        })
        .catch((err) => {
          updateSport(gen, key, {
            loading: false,
            error: err instanceof Error ? err.message : "Fetch failed",
          });
        });
    }

    // Fetch soccer (parallel per competition)
    if (accessibleSports.includes("soccer") && accessibleCompetitions.length > 0) {
      Promise.allSettled(
        accessibleCompetitions.map((comp) =>
          soccer.getGamesByDate(comp, dateObj).then(({ data: responseData }) => {
            if (!responseData) return [];
            return transformSoccerGames(
              responseData as Parameters<typeof transformSoccerGames>[0],
              comp,
              undefined,
              { venueMap: stadiumMaps["soccer"] },
            );
          }),
        ),
      ).then((results) => {
        if (genRef.current !== gen) return;
        const allEvents: NormalizedEvent[] = [];
        for (const r of results) {
          if (r.status === "fulfilled") allEvents.push(...r.value);
        }
        updateSport(gen, "soccer", { events: allEvents, loading: false });
      });
    } else if (accessibleSports.includes("soccer")) {
      updateSport(gen, "soccer", { events: [], loading: false });
    }

    // Fetch NASCAR (season-based, cached)
    if (accessibleSports.includes("nascar")) {
      const cacheKey = `nascar-${year}`;
      const cached = seasonCache.get(cacheKey);
      if (cached) {
        const filtered = cached.filter(
          (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
        );
        updateSport(gen, "nascar", { events: filtered, loading: false });
      } else {
        nascar
          .getRacesBySeason(year)
          .then(({ data: responseData }) => {
            if (genRef.current !== gen) return;
            const all = responseData
              ? transformNascarRaces(responseData as Parameters<typeof transformNascarRaces>[0])
              : [];
            seasonCache.set(cacheKey, all);
            const filtered = all.filter(
              (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
            );
            updateSport(gen, "nascar", { events: filtered, loading: false });
          })
          .catch((err) => {
            updateSport(gen, "nascar", {
              loading: false,
              error: err instanceof Error ? err.message : "Fetch failed",
            });
          });
      }
    }

    // Fetch MMA (season-based, cached, default league "UFC")
    if (accessibleSports.includes("mma")) {
      const cacheKey = `mma-${year}`;
      const cached = seasonCache.get(cacheKey);
      if (cached) {
        const filtered = cached.filter(
          (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
        );
        updateSport(gen, "mma", { events: filtered, loading: false });
      } else {
        mma
          .getSchedule("UFC", year)
          .then(({ data: responseData }) => {
            if (genRef.current !== gen) return;
            const all = responseData
              ? transformMmaEvents(responseData as Parameters<typeof transformMmaEvents>[0])
              : [];
            seasonCache.set(cacheKey, all);
            const filtered = all.filter(
              (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
            );
            updateSport(gen, "mma", { events: filtered, loading: false });
          })
          .catch((err) => {
            updateSport(gen, "mma", {
              loading: false,
              error: err instanceof Error ? err.message : "Fetch failed",
            });
          });
      }
    }

    // Fetch Golf (season-based, cached)
    if (accessibleSports.includes("golf")) {
      const cacheKey = `golf-${year}`;
      const cached = seasonCache.get(cacheKey);
      if (cached) {
        const filtered = cached.filter(
          (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
        );
        updateSport(gen, "golf", { events: filtered, loading: false });
      } else {
        golf
          .getTournaments(year)
          .then(({ data: responseData }) => {
            if (genRef.current !== gen) return;
            const all = responseData
              ? transformGolfTournaments(
                  responseData as Parameters<typeof transformGolfTournaments>[0],
                )
              : [];
            seasonCache.set(cacheKey, all);
            const filtered = all.filter(
              (e) => e.day === date || isDateInRange(date, e.day, e.endDate),
            );
            updateSport(gen, "golf", { events: filtered, loading: false });
          })
          .catch((err) => {
            updateSport(gen, "golf", {
              loading: false,
              error: err instanceof Error ? err.message : "Fetch failed",
            });
          });
      }
    }

    // Reset lastPolled when date/sports change
    setLastPolled(null);
  }, [date, accessibleSports, accessibleCompetitions, seasonCache, updateSport, stadiumMaps]);

  // Polling effect: re-fetch selected sport every 5 seconds on today's date
  useEffect(() => {
    const isToday = date === todayIso();
    const canPoll =
      selectedSport !== "all" &&
      isToday &&
      !NON_POLLABLE.has(selectedSport) &&
      accessibleSports.includes(selectedSport);

    if (!canPoll) return;

    const fetchers = makeTeamSportFetchers(stadiumMaps);
    let active = true;

    const poll = () => {
      if (!active) return;
      const dateObj = dateToObj(date);

      if (selectedSport === "soccer") {
        // Re-fetch all competitions for soccer
        if (accessibleCompetitions.length === 0) return;
        Promise.allSettled(
          accessibleCompetitions.map((comp) =>
            soccer.getGamesByDate(comp, dateObj).then(({ data: responseData }) => {
              if (!responseData) return [];
              return transformSoccerGames(
                responseData as Parameters<typeof transformSoccerGames>[0],
                comp,
              );
            }),
          ),
        ).then((results) => {
          if (!active) return;
          const allEvents: NormalizedEvent[] = [];
          for (const r of results) {
            if (r.status === "fulfilled") allEvents.push(...r.value);
          }
          setData((prev) => ({
            ...prev,
            soccer: { events: allEvents, loading: false, error: null },
          }));
          setLastPolled(new Date());
        });
      } else {
        const fetcher = fetchers[selectedSport];
        if (!fetcher) return;
        fetcher
          .fetch(dateObj)
          .then(({ data: responseData }) => {
            if (!active) return;
            const events = responseData ? fetcher.transform(responseData) : [];
            setData((prev) => ({
              ...prev,
              [selectedSport]: { events, loading: false, error: null },
            }));
            setLastPolled(new Date());
          })
          .catch(() => {
            // Silently ignore poll errors — keep showing stale data
          });
      }
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [date, selectedSport, accessibleSports, accessibleCompetitions, stadiumMaps]);

  return { data, lastPolled };
}
