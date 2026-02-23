"use client";

export function SectionError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
