import type { SportKey } from "../sdk/clients/probe";

export interface ParsedEventId {
  sportKey: SportKey;
  competitionKey: string | null;
  rawId: string;
}

/**
 * Parse a NormalizedEvent.id like "nba-12345" or "soccer-EPL-789012"
 * into its constituent parts.
 */
export function parseEventId(eventId: string): ParsedEventId | null {
  if (!eventId) return null;

  // Soccer format: soccer-{competition}-{id}
  const soccerMatch = eventId.match(/^(soccer)-([A-Z0-9]+)-(.+)$/);
  if (soccerMatch) {
    return {
      sportKey: soccerMatch[1] as SportKey,
      competitionKey: soccerMatch[2],
      rawId: soccerMatch[3],
    };
  }

  // Standard format: {sport}-{id}
  const match = eventId.match(/^([a-z]+)-(.+)$/);
  if (!match) return null;

  return {
    sportKey: match[1] as SportKey,
    competitionKey: null,
    rawId: match[2],
  };
}

/** Build a hash URL for an event detail page */
export function eventDetailHash(eventId: string, tab?: string): string {
  const base = `#/event/${eventId}`;
  return tab ? `${base}/${tab}` : base;
}
