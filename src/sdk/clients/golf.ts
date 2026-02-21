import type { paths } from "../generated/golf";
import { createSportClient } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getTournaments(season?: string) {
  if (season) {
    const { data, error, response } = await client.GET(
      "/golf/v2/{format}/Tournaments/{season}",
      { params: { path: { format: "JSON", season } } },
    );
    return { data, error, response };
  }
  const { data, error, response } = await client.GET(
    "/golf/v2/{format}/Tournaments",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function getLeaderboard(tournamentId: string) {
  const { data, error, response } = await client.GET(
    "/golf/v2/{format}/Leaderboard/{tournamentid}",
    { params: { path: { format: "JSON", tournamentid: tournamentId } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getTournaments();
  return response.status !== 401;
}

export const sportKey = "golf" as const;
export const displayName = "Golf";
