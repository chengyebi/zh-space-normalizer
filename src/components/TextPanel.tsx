interface TextPanelProps {
  title: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function TextPanel({ title, value, placeholder, readOnly = false, onChange }: TextPanelProps) {
  return (
    <section className="flex min-h-[420px] flex-col rounded-[2rem] border border-stone-300 bg-white/80 p-5 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-mist px-3 py-1 text-xs text-stone-600">
          {value.length} 字符
        </span>
      </div>
      <textarea
        className="min-h-[330px] flex-1 rounded-3xl border border-stone-200 bg-paper/55 p-4 text-base leading-8 text-ink outline-none transition placeholder:text-stone-400 focus:border-moss focus:bg-white"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        spellCheck={false}
      />
    </section>
  );
}
