"use client";

import type { NormalizedEvent } from "../../sdk/transforms/types";
import { StatusBadge } from "./StatusBadge";

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return null;
  }
}

export function GolfTournamentCard({ event }: { event: NormalizedEvent }) {
  const startDisplay = formatDate(event.day);
  const endDisplay = event.isMultiDay ? formatDate(event.endDate) : null;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3">
        <StatusBadge status={event.status} />
      </div>

      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {event.eventName ?? "Tournament"}
      </h4>

      {event.venue && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {event.venue}
        </p>
      )}

      {startDisplay && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {endDisplay ? `${startDisplay} – ${endDisplay}` : startDisplay}
        </p>
      )}

      {event.id && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="cursor-copy rounded px-1 py-0.5 font-mono text-[11px] tabular-nums text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Click to copy Game ID"
            onClick={() => {
              const rawId = event.id.replace(/^[a-z]+-/, "");
              navigator.clipboard.writeText(rawId);
            }}
          >
            #{event.id.replace(/^[a-z]+-/, "")}
          </button>
        </div>
      )}
    </div>
  );
}
