import * as nba from "./nba";
import * as nfl from "./nfl";
import * as nhl from "./nhl";
import * as mlb from "./mlb";
import * as cbb from "./cbb";
import * as cfb from "./cfb";
import * as wnba from "./wnba";
import * as cwbb from "./cwbb";
import * as soccer from "./soccer";
import * as nascar from "./nascar";
import * as mma from "./mma";
import * as golf from "./golf";

export type SportKey =
  | "nba" | "nfl" | "nhl" | "mlb"
  | "cbb" | "cfb" | "wnba" | "cwbb"
  | "soccer" | "nascar" | "mma" | "golf";

export interface SportAccess {
  key: SportKey;
  displayName: string;
  accessible: boolean;
}

const sports = [
  nba, nfl, nhl, mlb,
  cbb, cfb, wnba, cwbb,
  soccer, nascar, mma, golf,
] as const;

/**
 * Probes all sports in parallel and returns which ones the API key has access to.
 * For soccer, this only checks general access. Use soccer.probeCompetitions()
 * separately to discover which competitions are available.
 */
export async function probeAllSports(): Promise<SportAccess[]> {
  const results = await Promise.allSettled(
    sports.map(async (sport) => {
      try {
        const accessible = await sport.probe();
        return {
          key: sport.sportKey as SportKey,
          displayName: sport.displayName,
          accessible,
        };
      } catch {
        // Network/CORS errors — treat as inaccessible, not a hard failure
        return {
          key: sport.sportKey as SportKey,
          displayName: sport.displayName,
          accessible: false,
        };
      }
    }),
  );
  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { key: "nba" as SportKey, displayName: "Unknown", accessible: false },
  );
}

/**
 * Returns only the sport keys that the API key has access to.
 */
export async function getAccessibleSports(): Promise<SportKey[]> {
  const all = await probeAllSports();
  return all.filter((s) => s.accessible).map((s) => s.key);
}
