import { useEffect, useRef } from 'react';

interface TextPanelProps {
  title: string;
  value: string;
  placeholder: string;
  readOnly?: boolean;
  scrollToTopOnValueChange?: boolean;
  scrollToTopSignal?: number;
  onChange?: (value: string) => void;
}

export function TextPanel({
  title,
  value,
  placeholder,
  readOnly = false,
  scrollToTopOnValueChange = false,
  scrollToTopSignal = 0,
  onChange,
}: TextPanelProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAfterPasteRef = useRef(false);

  useEffect(() => {
    if (!scrollToTopOnValueChange) {
      return;
    }

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.scrollTop = 0;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }
  }, [scrollToTopOnValueChange, value]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.scrollTop = 0;
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }
  }, [scrollToTopSignal]);

  useEffect(() => {
    if (!scrollAfterPasteRef.current) {
      return;
    }

    scrollAfterPasteRef.current = false;
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.scrollTop = 0;
        textarea.selectionStart = 0;
        textarea.selectionEnd = 0;
      }
    });
  }, [value]);

  return (
    <section className="flex min-h-[42vh] flex-col rounded-3xl border border-stone-300 bg-white/88 p-3 shadow-soft backdrop-blur lg:min-h-0">
      <div className="flex h-10 items-center justify-between gap-3 px-2">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <span className="rounded-full bg-mist px-2.5 py-1 text-xs text-stone-600">
          {value.length} 字符
        </span>
      </div>
      <textarea
        ref={textareaRef}
        className="min-h-0 flex-1 rounded-2xl border border-stone-200 bg-paper/45 p-4 font-mono text-sm leading-7 text-ink outline-none transition placeholder:text-stone-400 focus:border-moss focus:bg-white md:text-[15px]"
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        onPaste={() => {
          if (!readOnly) {
            scrollAfterPasteRef.current = true;
          }
        }}
        spellCheck={false}
      />
    </section>
  );
}
