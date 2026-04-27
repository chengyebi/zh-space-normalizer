interface TextPanelProps {
  title: string;
  value: string;
  placeholder: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export function TextPanel({ title, value, placeholder, readOnly = false, onChange }: TextPanelProps) {
  return (
    <section className="flex min-h-[42vh] flex-col rounded-3xl border border-stone-300 bg-white/88 p-3 shadow-soft backdrop-blur lg:min-h-0">
      <div className="flex h-10 items-center justify-between gap-3 px-2">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-mist px-2.5 py-1 text-xs text-stone-600">
          {value.length} 字符
        </span>
      </div>
      <textarea
        className="min-h-0 flex-1 rounded-2xl border border-stone-200 bg-paper/45 p-4 font-mono text-sm leading-7 text-ink outline-none transition placeholder:text-stone-400 focus:border-moss focus:bg-white md:text-[15px]"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        spellCheck={false}
      />
    </section>
  );
}
