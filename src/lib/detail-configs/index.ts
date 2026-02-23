import type { DetailRegistry } from "../detail-registry";
import {
  nbaSections,
  nflSections,
  nhlSections,
  mlbSections,
  cbbSections,
  cfbSections,
  wnbaSections,
} from "./team-sports";

export const DETAIL_REGISTRY: DetailRegistry = {
  nba: { sections: nbaSections },
  nfl: { sections: nflSections },
  nhl: { sections: nhlSections },
  mlb: { sections: mlbSections },
  cbb: { sections: cbbSections },
  cfb: { sections: cfbSections },
  wnba: { sections: wnbaSections },
  // cwbb intentionally omitted — no detail endpoints
};
