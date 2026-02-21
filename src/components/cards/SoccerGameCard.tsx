"use client";

import type { NormalizedEvent } from "../../sdk/transforms/types";
import { TeamGameCard } from "./TeamGameCard";

export function SoccerGameCard({ event }: { event: NormalizedEvent }) {
  // TeamGameCard already handles gameStatus, gameDetail, lastPlay, and venue display
  return <TeamGameCard event={event} />;
}
