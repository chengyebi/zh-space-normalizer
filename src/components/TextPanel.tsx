interface TextPanelProps {
  title: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  helper?: string;
  onChange?: (value: string) => void;
}

export function TextPanel({
  title,
  value,
  placeholder,
  readOnly = false,
  helper,
  onChange,
}: TextPanelProps) {
  return (
    <section className="flex min-h-[460px] flex-col rounded-[1.75rem] border border-stone-300 bg-white/85 p-4 shadow-soft backdrop-blur md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {helper ? <p className="mt-1 text-xs leading-5 text-stone-500">{helper}</p> : null}
        </div>
        <span className="shrink-0 rounded-full bg-mist px-3 py-1 text-xs text-stone-600">
          {value.length} 字符
        </span>
      </div>
      <textarea
        className="min-h-[350px] flex-1 rounded-3xl border border-stone-200 bg-paper/50 p-4 font-mono text-sm leading-7 text-ink outline-none transition placeholder:text-stone-400 focus:border-moss focus:bg-white md:text-base"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        spellCheck={false}
      />
    </section>
  );
}
