import type { paths } from "../generated/cwbb";
import { createSportClient, formatSdioDate } from "./base";

const client = createSportClient<paths>("https://api.sportsdata.io");

export async function getGamesByDate(date: Date) {
  const { data, error, response } = await client.GET(
    "/v3/cwbb/scores/{format}/GamesByDate/{date}",
    { params: { path: { format: "JSON", date: formatSdioDate(date) } } },
  );
  return { data, error, response };
}

export async function probe() {
  const { response } = await getGamesByDate(new Date());
  return response.status !== 401;
}

export const sportKey = "cwbb" as const;
export const displayName = "College Women's Basketball";
