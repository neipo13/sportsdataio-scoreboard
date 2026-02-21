import type { paths } from "../generated/nfl";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/scores/{format}/ScoresByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function getStadiums() {
  const { data, error, response } = await client.GET(
    "/v3/nfl/scores/{format}/Stadiums",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "nfl" as const;
export const displayName = "NFL";
