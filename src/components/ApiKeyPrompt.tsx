"use client";

import { useState } from "react";

export function ApiKeyPrompt({ onSubmit }: { onSubmit: (key: string) => void }) {
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSubmit(trimmed);
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="mx-4 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Enter your API key
        </h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Your Sportsdata.io subscription key. It will be stored locally in your browser.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ocp-Apim-Subscription-Key"
          autoFocus
          className="mb-4 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          Connect
        </button>
      </form>
    </div>
  );
}
