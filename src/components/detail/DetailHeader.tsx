"use client";

import type { ParsedEventId } from "../../lib/event-id";
import { StatusBadge } from "../cards/StatusBadge";
import type { EventStatus } from "../../sdk/transforms/types";

export interface HeaderInfo {
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: EventStatus;
  gameStatus: string | null;
  eventName: string | null;
  dateTime: string | null;
}

function formatDateTime(dateTime: string | null): string | null {
  if (!dateTime) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(dateTime));
  } catch {
    return null;
  }
}

export function DetailHeader({
  parsed,
  info,
}: {
  parsed: ParsedEventId;
  info: HeaderInfo | null;
}) {
  return (
    <div className="mb-6">
      {/* Back button */}
      <a
        href="#/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </a>

      {info ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <StatusBadge status={info.status} />
            <span className="text-xs uppercase tracking-wide text-zinc-400">
              {parsed.sportKey.toUpperCase()}
              {parsed.competitionKey ? ` / ${parsed.competitionKey}` : ""}
            </span>
            {info.gameStatus && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {info.gameStatus}
              </span>
            )}
          </div>

          {/* Team-based header */}
          {info.homeTeam && info.awayTeam ? (
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {info.awayTeam}
                </p>
                {info.awayScore != null && (
                  <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {info.awayScore}
                  </p>
                )}
              </div>
              <span className="text-sm text-zinc-400">@</span>
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {info.homeTeam}
                </p>
                {info.homeScore != null && (
                  <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {info.homeScore}
                  </p>
                )}
              </div>
            </div>
          ) : info.eventName ? (
            <h2 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {info.eventName}
            </h2>
          ) : null}

          {info.dateTime && (
            <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
              {formatDateTime(info.dateTime)}
            </p>
          )}
        </div>
      ) : (
        <div className="animate-pulse rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-8 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      )}
    </div>
  );
}
