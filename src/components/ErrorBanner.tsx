"use client";

export function ErrorBanner({
  message,
  onRetry,
  onChangeKey,
}: {
  message: string;
  onRetry?: () => void;
  onChangeKey?: () => void;
}) {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      <div className="mt-3 flex gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Retry
          </button>
        )}
        {onChangeKey && (
          <button
            onClick={onChangeKey}
            className="rounded-md border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900"
          >
            Change Key
          </button>
        )}
      </div>
    </div>
  );
}
