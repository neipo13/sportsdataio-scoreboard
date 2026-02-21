"use client";

import { useEffect, useRef, useState } from "react";
import type { SportKey } from "../sdk/clients/probe";
import { getAllTeams, LOGO_SPORTS } from "../sdk/clients/teams";

type LogoMap = Map<string, string>; // teamKey → logoUrl
type SportLogoMap = Map<string, LogoMap>; // sportKey → LogoMap

export function useTeamLogos(accessibleSports: SportKey[]) {
  const cache = useRef<SportLogoMap>(new Map());
  const [, setTick] = useState(0);

  useEffect(() => {
    const toFetch = accessibleSports.filter(
      (s) => LOGO_SPORTS.includes(s) && !cache.current.has(s),
    );
    if (toFetch.length === 0) return;

    for (const sport of toFetch) {
      getAllTeams(sport)
        .then((teams) => {
          const map: LogoMap = new Map();
          for (const t of teams) {
            if (t.key && t.logoUrl) {
              map.set(t.key, t.logoUrl);
            }
          }
          cache.current.set(sport, map);
          setTick((n) => n + 1); // trigger re-render
        })
        .catch(() => {
          // Silently skip — logos are non-critical
          cache.current.set(sport, new Map());
        });
    }
  }, [accessibleSports]);

  return function getLogoUrl(
    sportKey: string,
    teamKey: string | null,
  ): string | null {
    if (!teamKey) return null;
    return cache.current.get(sportKey)?.get(teamKey) ?? null;
  };
}
