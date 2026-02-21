import type { paths } from "../generated/mma";
import { createSportClient } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getSchedule(league: string, season: string) {
  const { data, error, response } = await client.GET(
    "/v3/mma/scores/{format}/Schedule/{league}/{season}",
    { params: { path: { format: "JSON", league, season } } },
  );
  return { data, error, response };
}

export async function getEvent(eventId: string) {
  const { data, error, response } = await client.GET(
    "/v3/mma/scores/{format}/Event/{eventid}",
    { params: { path: { format: "JSON", eventid: eventId } } },
  );
  return { data, error, response };
}

export async function getLeagues() {
  const { data, error, response } = await client.GET(
    "/v3/mma/scores/{format}/Leagues",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getLeagues();
  return response.status !== 401;
}

export const sportKey = "mma" as const;
export const displayName = "MMA";
