import type { paths } from "../generated/cfb";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/cfb/scores/{format}/GamesByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function getStadiums() {
  const { data, error, response } = await client.GET(
    "/v3/cfb/scores/{format}/Stadiums",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getBoxScore(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/cfb/stats/{format}/BoxScore/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getBettingMarkets(gameId: string, sbGroup?: string) {
  if (sbGroup) {
    const { data, error, response } = await client.GET(
      "/v3/cfb/odds/{format}/BettingMarketsByGameID/{gameid}/{sportsbookgroup}",
      { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
    );
    return { data, error, response };
  }
  const { data, error, response } = await client.GET(
    "/v3/cfb/odds/{format}/BettingMarketsByGameID/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getPregameLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/cfb/odds/{format}/PreGameOddsLineMovement/{gameid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/cfb/odds/{format}/InGameLineMovement/{gameid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "cfb" as const;
export const displayName = "College Football";
