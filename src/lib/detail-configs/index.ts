import type { DetailRegistry } from "../detail-registry";
import { nbaSections } from "./team-sports";

export const DETAIL_REGISTRY: DetailRegistry = {
  nba: { sections: nbaSections },
  // Future: nfl, nhl, mlb, cbb, cfb, wnba, soccer, golf, nascar, mma
  // cwbb intentionally omitted — no detail endpoints
};
