"use client";

import { useEffect, useRef, useState } from "react";
import type { SportKey } from "../sdk/clients/probe";
import { nba, nfl, nhl, mlb, cbb, cfb, wnba, soccer } from "../sdk/clients/index";

export type StadiumMaps = Record<string, Map<number, string>>;

// Sports that have a getStadiums() endpoint (cwbb does not)
const STADIUM_FETCHERS: Partial<
  Record<SportKey, () => Promise<{ data?: Array<{ StadiumID?: number; Name?: string | null }> | null }>>
> = {
  nba: nba.getStadiums,
  nfl: nfl.getStadiums,
  nhl: nhl.getStadiums,
  mlb: mlb.getStadiums,
  cbb: cbb.getStadiums,
  cfb: cfb.getStadiums,
  wnba: wnba.getStadiums,
};

export function useStadiumLookup(accessibleSports: SportKey[]): StadiumMaps {
  const [maps, setMaps] = useState<StadiumMaps>({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current || accessibleSports.length === 0) return;
    fetchedRef.current = true;

    const fetches: Promise<{ key: string; map: Map<number, string> }>[] = [];

    // Fetch team sport stadiums
    const sportsToFetch = accessibleSports.filter((k) => k in STADIUM_FETCHERS);
    for (const key of sportsToFetch) {
      const fetcher = STADIUM_FETCHERS[key]!;
      fetches.push(
        fetcher().then(({ data }) => {
          const map = new Map<number, string>();
          if (data && Array.isArray(data)) {
            for (const s of data) {
              if (s.StadiumID != null && s.Name) {
                map.set(s.StadiumID, s.Name);
              }
            }
          }
          return { key, map };
        }),
      );
    }

    // Fetch soccer venues
    if (accessibleSports.includes("soccer")) {
      fetches.push(
        soccer.getVenues().then(({ data }) => {
          const map = new Map<number, string>();
          if (data && Array.isArray(data)) {
            for (const v of data as Array<{ VenueId?: number; Name?: string | null }>) {
              if (v.VenueId != null && v.Name) {
                map.set(v.VenueId, v.Name);
              }
            }
          }
          return { key: "soccer", map };
        }),
      );
    }

    Promise.allSettled(fetches).then((results) => {
      const newMaps: StadiumMaps = {};
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) {
          newMaps[r.value.key] = r.value.map;
        }
      }
      setMaps(newMaps);
    });
  }, [accessibleSports]);

  return maps;
}
