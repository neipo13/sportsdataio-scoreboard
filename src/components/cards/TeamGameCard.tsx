"use client";

import type { NormalizedEvent } from "../../sdk/transforms/types";
import { StatusBadge } from "./StatusBadge";

function formatTime(dateTime: string | null): string | null {
  if (!dateTime) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateTime));
  } catch {
    return null;
  }
}

function formatOdds(value: number | null): string {
  if (value == null) return "-";
  return value > 0 ? `+${value}` : `${value}`;
}

function TeamLogo({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      width={24}
      height={24}
      className="size-6 shrink-0 object-contain"
      loading="lazy"
    />
  );
}

export function TeamGameCard({
  event,
  getLogoUrl,
}: {
  event: NormalizedEvent;
  getLogoUrl?: (sportKey: string, teamKey: string | null) => string | null;
}) {
  const time = formatTime(event.dateTime);
  const showScores = event.status === "InProgress" || event.status === "Final";
  const showOdds =
    event.status === "Scheduled" &&
    (event.pointSpread != null || event.overUnder != null || event.awayMoneyLine != null);
  const isLive = event.status === "InProgress";

  // PointSpread is from the home team's perspective: negative = home favored.
  // Away spread is the inverse.
  const awaySpread = event.pointSpread != null ? -event.pointSpread : null;
  const homeSpread = event.pointSpread;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} />
          {isLive && event.gameStatus && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {event.gameStatus}
            </span>
          )}
        </div>
        {event.isClosed && (
          <span className="text-xs text-zinc-400" title="Game closed">
            &#128274;
          </span>
        )}
      </div>

      {/* Game detail (e.g., "3rd & 7 at DAL 35") */}
      {isLive && event.gameDetail && (
        <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          {event.gameDetail}
        </p>
      )}

      {/* Time */}
      {time && event.status === "Scheduled" && (
        <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">{time}</p>
      )}

      {/* Column headers for odds */}
      {showOdds && (
        <div className="mb-1 flex items-center justify-end gap-1">
          {awaySpread != null && (
            <span className="w-14 text-center text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
              Spread
            </span>
          )}
          {event.awayMoneyLine != null && (
            <span className="w-14 text-center text-[10px] uppercase text-zinc-400 dark:text-zinc-500">
              ML
            </span>
          )}
        </div>
      )}

      {/* Teams + Scores/Odds */}
      <div className="space-y-1.5">
        {/* Away team row */}
        <div className="flex items-center justify-between">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <TeamLogo url={getLogoUrl?.(event.sportKey, event.awayTeam) ?? null} />
            <span className="truncate">{event.awayTeam ?? "TBD"}</span>
          </span>
          {showScores && (
            <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {event.awayScore ?? "-"}
            </span>
          )}
          {showOdds && (
            <span className="flex items-center gap-1">
              {awaySpread != null && (
                <span className="w-14 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatOdds(awaySpread)}
                </span>
              )}
              {event.awayMoneyLine != null && (
                <span className="w-14 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatOdds(event.awayMoneyLine)}
                </span>
              )}
            </span>
          )}
        </div>

        {/* Home team row */}
        <div className="flex items-center justify-between">
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <TeamLogo url={getLogoUrl?.(event.sportKey, event.homeTeam) ?? null} />
            <span className="truncate">{event.homeTeam ?? "TBD"}</span>
          </span>
          {showScores && (
            <span className="text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
              {event.homeScore ?? "-"}
            </span>
          )}
          {showOdds && (
            <span className="flex items-center gap-1">
              {homeSpread != null && (
                <span className="w-14 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatOdds(homeSpread)}
                </span>
              )}
              {event.homeMoneyLine != null && (
                <span className="w-14 text-center text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatOdds(event.homeMoneyLine)}
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* O/U on its own line */}
      {showOdds && event.overUnder != null && (
        <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          O/U {event.overUnder}
        </p>
      )}

      {/* Last Play */}
      {isLive && event.lastPlay && (
        <p className="mt-2 truncate text-[11px] text-zinc-500 dark:text-zinc-400" title={event.lastPlay}>
          {event.lastPlay}
        </p>
      )}

      {/* Footer: Venue + Game ID */}
      {(event.venue || event.id) && (
        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>{event.venue ?? ""}</span>
          {event.id && (
            <button
              type="button"
              className="shrink-0 cursor-copy rounded px-1 py-0.5 font-mono tabular-nums hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              title="Click to copy Game ID"
              onClick={() => {
                const rawId = event.id.replace(/^[a-z]+-/, "");
                navigator.clipboard.writeText(rawId);
              }}
            >
              #{event.id.replace(/^[a-z]+-/, "")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
