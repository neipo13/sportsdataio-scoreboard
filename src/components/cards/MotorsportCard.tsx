"use client";

import type { NormalizedEvent } from "../../sdk/transforms/types";
import { StatusBadge } from "./StatusBadge";

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

export function MotorsportCard({ event }: { event: NormalizedEvent }) {
  const dt = formatDateTime(event.dateTime);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <StatusBadge status={event.status} />
        {event.channel && (
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
            {event.channel}
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {event.eventName ?? "Race"}
      </h4>

      {event.venue && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {event.venue}
        </p>
      )}

      {dt && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{dt}</p>
      )}

      {event.id && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="cursor-copy rounded px-1 py-0.5 font-mono text-[11px] tabular-nums text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            title="Click to copy Game ID"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
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
