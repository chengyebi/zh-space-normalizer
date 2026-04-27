interface StatsBarProps {
  beforeChars: number;
  afterChars: number;
  changes: number;
}

export function StatsBar({ beforeChars, afterChars, changes }: StatsBarProps) {
  const delta = afterChars - beforeChars;
  const deltaLabel = delta > 0 ? `+${delta}` : String(delta);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-stone-300 bg-white/75 p-4">
        <span className="text-xs text-stone-500">处理前</span>
        <strong className="mt-1 block text-2xl text-ink">{beforeChars}</strong>
      </div>
      <div className="rounded-2xl border border-stone-300 bg-white/75 p-4">
        <span className="text-xs text-stone-500">处理后</span>
        <strong className="mt-1 block text-2xl text-ink">
          {afterChars}
          <span className="ml-2 text-sm font-normal text-clay">{deltaLabel}</span>
        </strong>
      </div>
      <div className="rounded-2xl border border-stone-300 bg-white/75 p-4">
        <span className="text-xs text-stone-500">修改数量</span>
        <strong className="mt-1 block text-2xl text-ink">{changes}</strong>
      </div>
    </div>
  );
}
