import type { paths } from "../generated/mlb";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/scores/{format}/GamesByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function getStadiums() {
  const { data, error, response } = await client.GET(
    "/v3/mlb/scores/{format}/Stadiums",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getBoxScore(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/stats/{format}/BoxScore/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getPlayByPlay(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/pbp/{format}/PlayByPlay/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getBettingMarkets(gameId: string, sbGroup?: string) {
  if (sbGroup) {
    const { data, error, response } = await client.GET(
      "/v3/mlb/odds/{format}/BettingMarketsByGameID/{gameID}/{sportsbookGroup}",
      { params: { path: { format: "JSON", gameID: gameId, sportsbookGroup: sbGroup } } },
    );
    return { data, error, response };
  }
  const { data, error, response } = await client.GET(
    "/v3/mlb/odds/{format}/BettingMarketsByGameID/{gameID}",
    { params: { path: { format: "JSON", gameID: gameId } } },
  );
  return { data, error, response };
}

export async function getPregameOdds(date: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/odds/{format}/PreGameOddsByDate/{date}/{sportsbookGroup}",
    { params: { path: { format: "JSON", date, sportsbookGroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayOdds(date: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/odds/{format}/InGameOddsByDate/{date}/{sportsbookGroup}",
    { params: { path: { format: "JSON", date, sportsbookGroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getPregameLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/odds/{format}/PreGameOddsLineMovement/{gameid}/{sportsbookGroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookGroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayLineMovement(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/mlb/odds/{format}/InGameOddsLineMovement/{gameid}/{sportsbookGroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookGroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "mlb" as const;
export const displayName = "MLB";
