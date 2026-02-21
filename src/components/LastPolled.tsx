"use client";

export function LastPolled({ timestamp }: { timestamp: Date | null }) {
  if (!timestamp) return null;

  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(timestamp);

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-md bg-zinc-800/80 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm dark:bg-zinc-700/80">
      Updated {formatted}
    </div>
  );
}
