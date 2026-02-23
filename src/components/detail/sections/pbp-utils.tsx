"use client";

import type { ReactNode } from "react";

/** Format minutes + seconds as MM:SS */
export function formatClock(
  min: number | null | undefined,
  sec: number | null | undefined,
): string {
  if (min == null || sec == null) return "";
  return `${min}:${String(sec).padStart(2, "0")}`;
}

/** Return ordinal suffix: 1st, 2nd, 3rd, 4th, … */
export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/** Shared empty-state for play-by-play sections */
export function EmptyPlayByPlay() {
  return (
    <p className="py-4 text-center text-sm text-zinc-400">
      No play-by-play data available
    </p>
  );
}

/** Shared sticky period/quarter header */
export function PeriodHeader({ children }: { children: ReactNode }) {
  return (
    <h4 className="sticky top-0 z-10 mb-2 bg-white py-1 text-xs font-semibold uppercase text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
      {children}
    </h4>
  );
}
