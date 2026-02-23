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

export async function getBoxScore(scoreId: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/stats/{format}/BoxScoreByScoreIDV3/{scoreid}",
    { params: { path: { format: "JSON", scoreid: scoreId } } },
  );
  return { data, error, response };
}

export async function getPlayByPlay(gameId: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/pbp/{format}/PlayByPlay/{gameid}",
    { params: { path: { format: "JSON", gameid: gameId } } },
  );
  return { data, error, response };
}

export async function getBettingMarkets(gameId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/odds/{format}/BettingMarketsByGameID/{gameid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", gameid: gameId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getPregameLineMovement(scoreId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/odds/{format}/PreGameOddsLineMovement/{scoreid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", scoreid: scoreId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getInplayLineMovement(scoreId: string, sbGroup: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/odds/{format}/InGameLineMovement/{scoreid}/{sportsbookgroup}",
    { params: { path: { format: "JSON", scoreid: scoreId, sportsbookgroup: sbGroup } } },
  );
  return { data, error, response };
}

export async function getProjectionsByWeek(season: string, week: string) {
  const { data, error, response } = await client.GET(
    "/v3/nfl/projections/{format}/PlayerGameProjectionStatsByWeek/{season}/{week}",
    { params: { path: { format: "JSON", season, week } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "nfl" as const;
export const displayName = "NFL";
