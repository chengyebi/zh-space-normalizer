import type { NormalizeMode } from '../core/normalizeText';

interface ModeSelectorProps {
  mode: NormalizeMode;
  onChange: (mode: NormalizeMode) => void;
}

const modes: Array<{ value: NormalizeMode; label: string }> = [
  { value: 'conservative', label: '保守' },
  { value: 'standard', label: '标准' },
  { value: 'aggressive', label: '强力' },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div
      className="inline-flex rounded-full border border-stone-300 bg-white/75 p-1 shadow-sm"
      role="radiogroup"
      aria-label="处理模式"
    >
      {modes.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              active ? 'bg-ink text-white shadow-sm' : 'text-stone-600 hover:bg-mist hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
