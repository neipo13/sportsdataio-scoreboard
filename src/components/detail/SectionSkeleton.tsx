"use client";

export function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-3 py-6">
      <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
    </div>
  );
}
