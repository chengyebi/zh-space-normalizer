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
    description: '只处理中英、中数边界，适合谨慎清理。',
  },
  {
    value: 'standard',
    label: '标准',
    description: '清理中文、标点和常见 AI 文本空格。',
  },
  {
    value: 'aggressive',
    label: '强力',
    description: '压缩多余空白，保留英文短语内部空格。',
  },
];

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  return (
    <div className="grid gap-2" role="radiogroup" aria-label="处理模式">
      {modes.map((item) => {
        const active = item.value === mode;

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={`group rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? 'border-ink bg-ink text-white shadow-soft'
                : 'border-stone-300 bg-white/75 text-ink hover:border-moss hover:bg-white'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">{item.label}</span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  active ? 'bg-clay' : 'bg-stone-300 group-hover:bg-moss'
                }`}
              />
            </span>
            <span className={`mt-1 block text-xs leading-5 ${active ? 'text-white/75' : 'text-stone-500'}`}>
              {item.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
