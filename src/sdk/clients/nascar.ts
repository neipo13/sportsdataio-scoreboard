import type { paths } from "../generated/nascar";
import { createSportClient } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getRacesBySeason(season: string) {
  const { data, error, response } = await client.GET(
    "/nascar/v2/{format}/races/{season}",
    { params: { path: { format: "JSON", season } } },
  );
  return { data, error, response };
}

export async function getRaceResult(raceId: string) {
  const { data, error, response } = await client.GET(
    "/nascar/v2/{format}/raceresult/{raceid}",
    { params: { path: { format: "JSON", raceid: raceId } } },
  );
  return { data, error, response };
}

export async function getSeries() {
  const { data, error, response } = await client.GET(
    "/nascar/v2/{format}/series",
    { params: { path: { format: "JSON" } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getSeries();
  return response.status !== 401;
}

export const sportKey = "nascar" as const;
export const displayName = "NASCAR";
