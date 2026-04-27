interface StatsBarProps {
  beforeChars: number;
  afterChars: number;
  changes: number;
  durationMs: number;
}

export function StatsBar({ beforeChars, afterChars, changes, durationMs }: StatsBarProps) {
  const compactRate = beforeChars === 0 ? 0 : Math.round(((beforeChars - afterChars) / beforeChars) * 100);
  const items = [
    ['处理前', beforeChars.toLocaleString()],
    ['处理后', afterChars.toLocaleString()],
    ['修改', changes.toLocaleString()],
    ['压缩', `${compactRate}%`],
    ['耗时', `${durationMs.toFixed(1)} ms`],
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
      {items.map(([label, value]) => (
        <span
          key={label}
          className="rounded-full border border-stone-300 bg-white/70 px-3 py-1.5 shadow-sm"
        >
          {label} <strong className="ml-1 font-semibold text-ink">{value}</strong>
        </span>
      ))}
    </div>
  );
}
