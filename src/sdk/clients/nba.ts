import type { paths } from "../generated/nba";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/nba/scores/{format}/GamesByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function getStadiums() {
  const { data, error, response } = await client.GET(
    "/v3/nba/scores/{format}/Stadiums",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getBoxScore(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/stats/{format}/BoxScore/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getPlayByPlay(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/pbp/{format}/PlayByPlay/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getBettingMarkets(gameId: string, sbGroup?: string) {
  if (sbGroup) {
    const { data, error, response } = await client.GET(
      "/v3/nba/odds/{format}/BettingMarketsByGameID/{gameID}/{sportsbookgroup}",
      { params: { path: { format: "JSON", gameID: gameId, sportsbookgroup: sbGroup } } },
    );
    return { data, error, response };
  }
  const { data, error, response } = await client.GET(
    "/v3/nba/odds/{format}/BettingMarketsByGameID/{gameID}",
    { params: { path: { format: "JSON", gameID: gameId } } },
  );
  return { data, error, response };
}

export async function getPregameOdds(date: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/odds/{format}/PreGameOddsByDate/{date}/{sportsbookgroup}",
    { params: { path: { format: "JSON", date, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getPregameLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/odds/{format}/PreGameOddsLineMovement/{gameid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayOdds(date: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/odds/{format}/InGameOddsByDate/{date}/{sportsbookgroup}",
    { params: { path: { format: "JSON", date, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nba/odds/{format}/InGameLineMovement/{gameid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getProjectionsByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/nba/projections/{format}/PlayerGameProjectionStatsByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "nba" as const;
export const displayName = "NBA";
