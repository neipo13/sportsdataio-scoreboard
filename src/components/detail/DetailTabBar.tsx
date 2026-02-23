"use client";

export interface TabInfo {
  key: string;
  label: string;
}

export function DetailTabBar({
  tabs,
  activeTab,
  onSelectTab,
}: {
  tabs: TabInfo[];
  activeTab: string;
  onSelectTab: (key: string) => void;
}) {
  if (tabs.length === 0) return null;

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-700">
      <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Detail tabs">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`
                shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
