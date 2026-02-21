import type { paths as NbaPaths } from "../generated/nba";
import type { paths as NflPaths } from "../generated/nfl";
import type { paths as NhlPaths } from "../generated/nhl";
import type { paths as MlbPaths } from "../generated/mlb";
import type { paths as CbbPaths } from "../generated/cbb";
import type { paths as CfbPaths } from "../generated/cfb";
import type { paths as WnbaPaths } from "../generated/wnba";
import type { paths as CwbbPaths } from "../generated/cwbb";
import { createSportClient } from "./base";
import type { SportKey } from "./probe";

const nbaClient = createSportClient<NbaPaths>("https://api.sportsdata.io");
const nflClient = createSportClient<NflPaths>("https://api.sportsdata.io");
const nhlClient = createSportClient<NhlPaths>("https://api.sportsdata.io");
const mlbClient = createSportClient<MlbPaths>("https://api.sportsdata.io");
const cbbClient = createSportClient<CbbPaths>("https://api.sportsdata.io");
const cfbClient = createSportClient<CfbPaths>("https://api.sportsdata.io");
const wnbaClient = createSportClient<WnbaPaths>("https://api.sportsdata.io");
const cwbbClient = createSportClient<CwbbPaths>("https://api.sportsdata.io");

export interface TeamInfo {
  key: string;
  logoUrl: string | null;
}

type TeamLike = { Key?: string | null; WikipediaLogoUrl?: string | null };

function extractTeams(data: TeamLike[] | undefined): TeamInfo[] {
  if (!data) return [];
  return data.map((t) => ({
    key: t.Key ?? "",
    logoUrl: t.WikipediaLogoUrl ?? null,
  }));
}

/** Sports that support team logos via AllTeams endpoint */
export const LOGO_SPORTS: SportKey[] = [
  "nba", "nfl", "nhl", "mlb", "cbb", "cfb", "wnba", "cwbb",
];

export async function getAllTeams(sport: SportKey): Promise<TeamInfo[]> {
  switch (sport) {
    case "nba": {
      const { data } = await nbaClient.GET("/v3/nba/scores/{format}/AllTeams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "nfl": {
      const { data } = await nflClient.GET("/v3/nfl/scores/{format}/AllTeams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "nhl": {
      const { data } = await nhlClient.GET("/v3/nhl/scores/{format}/AllTeams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "mlb": {
      const { data } = await mlbClient.GET("/v3/mlb/scores/{format}/AllTeams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "cbb": {
      const { data } = await cbbClient.GET("/v3/cbb/scores/{format}/teams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "cfb": {
      const { data } = await cfbClient.GET("/v3/cfb/scores/{format}/Teams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "wnba": {
      const { data } = await wnbaClient.GET("/v3/wnba/scores/{format}/Teams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    case "cwbb": {
      const { data } = await cwbbClient.GET("/v3/cwbb/scores/{format}/Teams", {
        params: { path: { format: "JSON" } },
      });
      return extractTeams(data as TeamLike[] | undefined);
    }
    default:
      return [];
  }
}
