/** Unified event representation for all sports displayed on the dashboard. */
export interface NormalizedEvent {
  /** Unique identifier (sport-prefixed, e.g. "nba-12345") */
  id: string;
  /** Which sport this event belongs to */
  sport: SportCategory;
  /** The sport key matching the SDK client key */
  sportKey: string;
  /** Human-readable sport/competition label */
  sportLabel: string;

  /** Event status */
  status: EventStatus;
  /** Whether the event result is final and verified */
  isClosed: boolean;

  /** Date/time of the event (ISO string or null if TBD) */
  dateTime: string | null;
  /** Day of the event (ISO date string) */
  day: string | null;

  // -- Team sport fields --
  /** Home team abbreviation or name */
  homeTeam: string | null;
  /** Away team abbreviation or name */
  awayTeam: string | null;
  /** Home team score */
  homeScore: number | null;
  /** Away team score */
  awayScore: number | null;

  // -- Odds fields --
  /** Point spread from the home team's perspective */
  pointSpread: number | null;
  /** Over/under total */
  overUnder: number | null;
  /** Home team money line */
  homeMoneyLine: number | null;
  /** Away team money line */
  awayMoneyLine: number | null;

  // -- Motorsport fields --
  /** Race or tournament name */
  eventName: string | null;
  /** Track or venue name */
  venue: string | null;

  // -- Combat sport fields --
  /** List of fights/matchups for MMA events */
  fights: NormalizedFight[] | null;

  // -- Golf fields --
  /** Whether this is a multi-day event */
  isMultiDay: boolean;
  /** End date for multi-day events */
  endDate: string | null;

  // -- Live game state --
  /** Formatted period/clock (e.g., "Q4 5:23", "Top 5th", "45+2'", "2nd 12:34") */
  gameStatus: string | null;
  /** Secondary info (e.g., "3rd & 7 at DAL 35", "1-2, 2 Out") */
  gameDetail: string | null;
  /** Description of the most recent play */
  lastPlay: string | null;

  // -- Extra --
  /** TV broadcast channel */
  channel: string | null;
  /** Competition/league identifier (for soccer) */
  competitionKey: string | null;
}

export interface NormalizedFight {
  id: number;
  order: number | null;
  status: string | null;
  weightClass: string | null;
  fighter1: string | null;
  fighter2: string | null;
  fighter1MoneyLine: number | null;
  fighter2MoneyLine: number | null;
  winnerId: number | null;
  resultType: string | null;
}

export type SportCategory =
  | "team"
  | "soccer"
  | "motorsport"
  | "combat"
  | "golf";

export type EventStatus =
  | "Scheduled"
  | "InProgress"
  | "Final"
  | "Postponed"
  | "Canceled"
  | "Suspended"
  | "Delayed"
  | "Unknown";

/** Maps common status strings from SDIO to our normalized status. */
export function normalizeStatus(raw: string | null | undefined): EventStatus {
  if (!raw) return "Unknown";
  const s = raw.trim().toLowerCase();
  if (s === "scheduled") return "Scheduled";
  if (s === "inprogress" || s === "in progress") return "InProgress";
  if (s === "final" || s.startsWith("f/")) return "Final";
  if (s === "postponed") return "Postponed";
  if (s === "canceled" || s === "cancelled") return "Canceled";
  if (s === "suspended" || s === "break") return "Suspended";
  if (s === "delayed") return "Delayed";
  return "Unknown";
}

/** Creates a blank NormalizedEvent with sensible defaults. */
export function emptyEvent(): NormalizedEvent {
  return {
    id: "",
    sport: "team",
    sportKey: "",
    sportLabel: "",
    status: "Unknown",
    isClosed: false,
    dateTime: null,
    day: null,
    homeTeam: null,
    awayTeam: null,
    homeScore: null,
    awayScore: null,
    pointSpread: null,
    overUnder: null,
    homeMoneyLine: null,
    awayMoneyLine: null,
    eventName: null,
    venue: null,
    fights: null,
    gameStatus: null,
    gameDetail: null,
    lastPlay: null,
    isMultiDay: false,
    endDate: null,
    channel: null,
    competitionKey: null,
  };
}
