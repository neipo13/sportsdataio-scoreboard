"use client";

import type { EventStatus } from "../../sdk/transforms/types";

const STATUS_STYLES: Record<EventStatus, string> = {
  InProgress: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Final: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Postponed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Delayed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Canceled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Suspended: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Unknown: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase leading-tight ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
