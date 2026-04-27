import type { NormalizeMode } from '../core/normalizeText';

interface ModeSelectorProps {
  mode: NormalizeMode;
  onChange: (mode: NormalizeMode) => void;
}

const modes: Array<{
  value: NormalizeMode;
  label: string;
  description: string;
}> = [
  {
    value: 'conservative',
    label: '保守',
    description: '仅处理中英、中数边界',
  },
  {
    value: 'standard',
    label: '标准',
    description: '覆盖中文、标点常见问题',
  },
  {
    value: 'aggressive',
    label: '强力',
    description: '进一步压缩冗余空白',
  },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="处理模式">
      {modes.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? 'border-moss bg-moss text-white shadow-soft'
                : 'border-stone-300 bg-white/70 text-ink hover:border-moss/70'
            }`}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className={`mt-1 block text-xs ${active ? 'text-white/78' : 'text-stone-500'}`}>
              {item.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
