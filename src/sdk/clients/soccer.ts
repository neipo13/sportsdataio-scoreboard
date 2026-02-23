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

/**
 * Fetches all competitions from the API and returns their keys and display labels.
 * Labels are formatted as "AreaName Name" with "(Gender)" appended when not "Male".
 */
export async function getAllCompetitionInfo(): Promise<{
  keys: string[];
  labels: Record<string, string>;
}> {
  const { data } = await getCompetitions();
  if (!data) return { keys: [], labels: {} };

  const keys: string[] = [];
  const labels: Record<string, string> = {};

  for (const comp of data) {
    const key = comp.Key;
    if (!key) continue;
    keys.push(key);

    const area = comp.AreaName ?? "";
    const name = comp.Name ?? key;
    const gender = comp.Gender;
    const suffix = gender && gender !== "Male" ? ` (${gender})` : "";
    labels[key] = `${area} ${name}${suffix}`.trim();
  }

  return { keys, labels };
}

/**
 * Probes competitions in batches to avoid overwhelming the API.
 * Returns the list of accessible competition keys.
 */
export async function probeCompetitionsBatched(
  competitionKeys: string[],
  batchSize = 15,
): Promise<string[]> {
  const accessible: string[] = [];

  for (let i = 0; i < competitionKeys.length; i += batchSize) {
    const batch = competitionKeys.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (key) => {
        const ok = await probeCompetition(key);
        return { key, ok };
      }),
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.ok) {
        accessible.push(r.value.key);
      }
    }
  }

  return accessible;
}

/** General probe: checks if the key has access to at least one competition. */
export async function probe() {
  const { response } = await getCompetitions();
  return response.status !== 401;
}

export const sportKey = "soccer" as const;
export const displayName = "Soccer";
