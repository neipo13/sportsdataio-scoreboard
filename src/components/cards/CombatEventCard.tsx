"use client";

import { useState } from "react";
import type { NormalizedEvent, NormalizedFight } from "../../sdk/transforms/types";
import { mma } from "../../sdk/clients/index";
import { transformMmaEventDetail } from "../../sdk/transforms/index";
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

function FightRow({ fight }: { fight: NormalizedFight }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
      <div className="flex-1">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {fight.fighter1 ?? "TBD"}
        </span>
        {fight.fighter1MoneyLine != null && (
          <span className="ml-1 text-zinc-400">
            ({fight.fighter1MoneyLine > 0 ? "+" : ""}
            {fight.fighter1MoneyLine})
          </span>
        )}
      </div>
      <span className="text-zinc-400">vs</span>
      <div className="flex-1 text-right">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {fight.fighter2 ?? "TBD"}
        </span>
        {fight.fighter2MoneyLine != null && (
          <span className="ml-1 text-zinc-400">
            ({fight.fighter2MoneyLine > 0 ? "+" : ""}
            {fight.fighter2MoneyLine})
          </span>
        )}
      </div>
    </div>
  );
}

export function CombatEventCard({ event }: { event: NormalizedEvent }) {
  const [fights, setFights] = useState<NormalizedFight[] | null>(event.fights);
  const [expanded, setExpanded] = useState(false);
  const [loadingFights, setLoadingFights] = useState(false);

  const dt = formatDateTime(event.dateTime);
  const eventId = event.id.replace("mma-", "");

  async function handleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    if (fights && fights.length > 0) {
      setExpanded(true);
      return;
    }
    setLoadingFights(true);
    try {
      const { data } = await mma.getEvent(eventId);
      if (data) {
        const detail = transformMmaEventDetail(
          data as Parameters<typeof transformMmaEventDetail>[0],
        );
        setFights(detail.fights);
      }
    } catch {
      // silently fail — fights remain null
    } finally {
      setLoadingFights(false);
      setExpanded(true);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3">
        <StatusBadge status={event.status} />
      </div>

      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {event.eventName ?? "MMA Event"}
      </h4>

      {dt && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{dt}</p>
      )}

      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleExpand(); }}
        className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        {loadingFights
          ? "Loading..."
          : expanded
            ? "Hide Fight Card"
            : "Show Fight Card"}
      </button>

      {expanded && fights && fights.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {fights
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
            .map((f) => (
              <FightRow key={f.id} fight={f} />
            ))}
        </div>
      )}

      {expanded && (!fights || fights.length === 0) && !loadingFights && (
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          No fight card available
        </p>
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
