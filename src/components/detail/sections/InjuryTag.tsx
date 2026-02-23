interface InjuryTagProps {
  status?: string | null;
  bodyPart?: string | null;
  notes?: string | null;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  Out: { label: "O", classes: "bg-red-500/20 text-red-600 dark:text-red-400" },
  Doubtful: { label: "D", classes: "bg-orange-500/20 text-orange-600 dark:text-orange-400" },
  Questionable: { label: "Q", classes: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400" },
  Probable: { label: "P", classes: "bg-green-500/20 text-green-600 dark:text-green-400" },
};

export function InjuryTag({ status, bodyPart, notes }: InjuryTagProps) {
  if (!status) return null;

  const config = statusConfig[status] ?? {
    label: status.charAt(0).toUpperCase(),
    classes: "bg-zinc-500/20 text-zinc-600 dark:text-zinc-400",
  };

  return (
    <span className="group/inj relative ml-1 inline-flex">
      <span
        className={`inline-flex items-center rounded px-1 text-[10px] font-bold leading-tight ${config.classes}`}
      >
        {config.label}
      </span>
      <div className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden w-64 whitespace-normal break-words rounded bg-zinc-900 px-2.5 py-2 text-[11px] leading-snug text-zinc-100 shadow-lg group-hover/inj:block dark:bg-zinc-700">
        <div className="font-semibold">{status}</div>
        {bodyPart && <div className="text-zinc-400">Body part: {bodyPart}</div>}
        {notes && <div className="mt-0.5 text-zinc-400">{notes}</div>}
      </div>
    </span>
  );
}
