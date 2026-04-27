import { useDeferredValue, useEffect, useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { StatsBar } from './components/StatsBar';
import { TextPanel } from './components/TextPanel';
import { normalizeTextWithStats, type NormalizeMode } from './core/normalizeText';

const exampleText = `这是一个 AI 工具，可以处理 GPT-5 生成的 报告。
我推荐使用 Visual Studio Code，也读过 High Performance Web Server。
我有 3 个模块 和 2 个页面。
你好 ， 世界 ！ 请使用 （ 示例 ） 。

OpenAI API is useful.

\`\`\`cpp
int main() {
    return 0;
}
\`\`\`

请运行 \`npm run build\`，然后查看 AI 结果。`;

function sliceByProgress(text: string, progress: number) {
  return text.slice(0, Math.ceil((text.length * progress) / 100));
}

export default function App() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<NormalizeMode>('standard');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoRun, setDemoRun] = useState(0);
  const [demoProgress, setDemoProgress] = useState(0);
  const deferredInput = useDeferredValue(input);
  const textToNormalize = input === '' ? '' : deferredInput;

  const startTime = performance.now();
  const result = normalizeTextWithStats(textToNormalize, { mode });
  const durationMs = performance.now() - startTime;
  const hasInput = input.length > 0;
  const hasOutput = result.text.length > 0;
  const demoOutput = normalizeTextWithStats(exampleText, { mode }).text;
  const demoInputPreview = sliceByProgress(exampleText, demoProgress);
  const demoOutputPreview = sliceByProgress(demoOutput, Math.max(0, demoProgress - 15));
  const demoFinished = demoProgress >= 100;

  useEffect(() => {
    if (!demoOpen) {
      return;
    }

    setDemoProgress(0);
    const timer = window.setInterval(() => {
      setDemoProgress((previous) => {
        const next = Math.min(previous + 4, 100);
        if (next === 100) {
          window.clearInterval(timer);
        }
        return next;
      });
    }, 45);

    return () => window.clearInterval(timer);
  }, [demoOpen, demoRun]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  function clearText() {
    setInput('');
    setCopyState('idle');
  }

  function useExample() {
    setInput(exampleText);
    setDemoOpen(false);
  }

  function closeDemo() {
    setDemoOpen(false);
  }

  return (
    <main className="flex min-h-screen flex-col bg-[linear-gradient(135deg,#f8f3e9_0%,#efe8d8_52%,#e2eadf_100%)] px-3 py-3 text-ink md:px-5 md:py-4">
      <header className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-300 bg-white/72 px-4 py-3 shadow-sm backdrop-blur">
        <div className="min-w-0">
          <h1 className="text-base font-bold tracking-tight text-ink md:text-lg">zh-space-normalizer</h1>
          <p className="mt-0.5 text-xs text-stone-600">本地处理 · 无 API · 不上传文本</p>
        </div>
        <a
          className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:border-moss hover:text-moss"
          href="https://github.com/chengyebi/zh-space-normalizer"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </header>

      <section className="mx-auto mt-3 flex w-full max-w-[1600px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-300 bg-white/68 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <ModeSelector mode={mode} onChange={setMode} />
          <button
            type="button"
            onClick={() => {
              setDemoOpen(true);
              setDemoRun((run) => run + 1);
            }}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
          >
            查看演示
          </button>
          <button
            type="button"
            onClick={clearText}
            disabled={!hasInput}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:text-stone-300"
          >
            清空
          </button>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!hasOutput}
            className="rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制结果'}
          </button>
        </div>
        <StatsBar
          beforeChars={result.stats.beforeChars}
          afterChars={result.stats.afterChars}
          changes={result.stats.changes}
          durationMs={durationMs}
        />
      </section>

      <section className="mx-auto mt-3 grid w-full max-w-[1600px] flex-1 min-h-0 gap-3 lg:grid-cols-2">
        <TextPanel
          title="输入"
          value={input}
          placeholder="粘贴 AI 生成的报告、论文、小红书文案或公众号文案……"
          onChange={setInput}
        />
        <TextPanel
          title="输出"
          value={result.text}
          placeholder="处理结果会实时显示在这里。"
          readOnly
        />
      </section>

      {demoOpen ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/28 p-3 backdrop-blur-sm">
          <section className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-stone-300 bg-paper p-4 shadow-soft md:p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">演示：中文 AI 文本空格规范化</h2>
                <p className="mt-1 text-sm text-stone-600">
                  演示只使用内置示例，不会写入输入框；点击“使用该示例”后才会填入。
                </p>
              </div>
              <div className="flex gap-2">
                {demoFinished ? (
                  <button
                    type="button"
                    onClick={() => setDemoRun((run) => run + 1)}
                    className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
                  >
                    重播
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={closeDemo}
                  className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
                >
                  关闭演示
                </button>
              </div>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full rounded-full bg-moss transition-all duration-100"
                style={{ width: `${demoProgress}%` }}
              />
            </div>
            <div className="grid min-h-0 flex-1 gap-3 overflow-hidden lg:grid-cols-2">
              <textarea
                className="min-h-[260px] rounded-2xl border border-stone-300 bg-white/80 p-4 font-mono text-sm leading-7 text-ink outline-none"
                value={demoInputPreview}
                readOnly
                aria-label="演示输入"
              />
              <textarea
                className="min-h-[260px] rounded-2xl border border-stone-300 bg-white/80 p-4 font-mono text-sm leading-7 text-ink outline-none"
                value={demoOutputPreview}
                readOnly
                aria-label="演示输出"
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={useExample}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
              >
                使用该示例
              </button>
              <button
                type="button"
                onClick={closeDemo}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
              >
                关闭演示
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
