import type { paths } from "../generated/wnba";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/wnba/scores/{format}/GamesByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function getStadiums() {
  const { data, error, response } = await client.GET(
    "/v3/wnba/scores/{format}/Stadiums",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getBoxScore(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/wnba/scores/{format}/BoxScore/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getBettingMarkets(gameId: string, sbGroup?: string) {
  if (sbGroup) {
    const { data, error, response } = await client.GET(
      "/v3/wnba/scores/{format}/BettingMarketsByGameID/{gameID}/{sportsbookgroup}",
      { params: { path: { format: "JSON", gameID: gameId, sportsbookgroup: sbGroup } } },
    );
    return { data, error, response };
  }
  const { data, error, response } = await client.GET(
    "/v3/wnba/scores/{format}/BettingMarketsByGameID/{gameID}",
    { params: { path: { format: "JSON", gameID: gameId } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "wnba" as const;
export const displayName = "WNBA";
