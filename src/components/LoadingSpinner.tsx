"use client";

export function LoadingSpinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-500 dark:border-zinc-600 dark:border-t-blue-400" />
      {message && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
      )}
    </div>
  );
}
