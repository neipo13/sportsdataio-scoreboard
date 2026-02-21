import type { paths } from "../generated/soccer";
import { createSportClient, formatIsoDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getCompetitions() {
  const { data, error, response } = await client.GET(
    "/v4/soccer/scores/{format}/Competitions",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getVenues() {
  const { data, error, response } = await client.GET(
    "/v4/soccer/scores/{format}/Venues",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getGamesByDate(competition: string, date: Date) {
  const { data, error, response } = await client.GET(
    "/v4/soccer/scores/{format}/GamesByDate/{competition}/{date}",
    {
      params: {
        path: { format: "JSON", competition, date: formatIsoDate(date) },
      },
    },
  );
  return { data, error, response };
}

/** Probes a specific competition to check if the key has access. */
export async function probeCompetition(competition: string) {
  const { response } = await getGamesByDate(competition, new Date());
  return response.status !== 401;
}

/**
 * Probes all known competitions and returns those the key can access.
 * Pass a list of competition keys to check (e.g., ["EPL", "MLS", "LIGA", ...]).
 */
export async function probeCompetitions(competitionKeys: string[]) {
  const results = await Promise.allSettled(
    competitionKeys.map(async (key) => {
      const accessible = await probeCompetition(key);
      return { key, accessible };
    }),
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<{ key: string; accessible: boolean }> =>
        r.status === "fulfilled" && r.value.accessible,
    )
    .map((r) => r.value.key);
}

/** General probe: checks if the key has access to at least one competition. */
export async function probe() {
  const { response } = await getCompetitions();
  return response.status !== 401;
}

export const sportKey = "soccer" as const;
export const displayName = "Soccer";
