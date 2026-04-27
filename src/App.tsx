import { useEffect, useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { StatsBar } from './components/StatsBar';
import { TextPanel } from './components/TextPanel';
import { normalizeTextWithStats, type NormalizeMode } from './core/normalizeText';

const exampleText = `这是一个 AI 写作 工具，可以处理 GPT-5 生成的 报告。
我推荐使用 Visual Studio Code，也读过 High Performance Web Server。
项目使用 OpenAI API，并包含 3 个模块 和 2 个页面。
你好 ， 世界 ！ 请使用 （ 示例 ） 。
请运行 \`npm run build\`，然后查看 AI 结果。

\`\`\`cpp
int main() {
    return 0;
}
\`\`\``;

const bruteForceText = `这是一个AI写作工具，可以处理GPT-5生成的报告。
我推荐使用VisualStudioCode，也读过HighPerformanceWebServer。
项目使用OpenAIAPI，并包含3个模块和2个页面。
你好，世界！请使用（示例）。
请运行\`npmrunbuild\`，然后查看AI结果。

\`\`\`cpp
intmain(){
return0;
}
\`\`\``;

const problemPhrases = [
  'VisualStudioCode',
  'HighPerformanceWebServer',
  'OpenAIAPI',
  'npmrunbuild',
  'intmain',
];

const preservedPhrases = [
  'Visual Studio Code',
  'High Performance Web Server',
  'OpenAI API',
  '`npm run build`',
  'int main() {',
  '    return 0;',
];

const demoStages = [
  { label: '1/3 发现问题', title: 'Word 全文替换的问题' },
  { label: '2/3 智能处理', title: '本工具的处理结果' },
  { label: '3/3 开始使用', title: '开始处理你的文本' },
];

function sliceByProgress(text: string, progress: number) {
  return text.slice(0, Math.ceil((text.length * progress) / 100));
}

function HighlightedPre({
  text,
  phrases,
  tone,
}: {
  text: string;
  phrases: string[];
  tone: 'bad' | 'good';
}) {
  const escaped = phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = escaped.length > 0 ? new RegExp(`(${escaped.join('|')})`, 'g') : null;
  const parts = pattern ? text.split(pattern) : [text];
  const highlightClass =
    tone === 'bad'
      ? 'rounded bg-red-100 px-1 text-red-800 ring-1 ring-red-200'
      : 'rounded bg-emerald-100 px-1 text-emerald-900 ring-1 ring-emerald-200';

  return (
    <pre className="min-h-[220px] overflow-auto whitespace-pre-wrap rounded-2xl border border-stone-300 bg-white/82 p-4 font-mono text-xs leading-6 text-ink md:text-sm">
      {parts.map((part, index) =>
        phrases.includes(part) ? (
          <mark key={`${part}-${index}`} className={highlightClass}>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </pre>
  );
}

function ProblemDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/28 p-3 backdrop-blur-sm">
      <section className="max-h-[88vh] w-full max-w-2xl overflow-auto rounded-3xl border border-stone-300 bg-paper p-5 shadow-soft md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">Why this tool</p>
            <h2 className="mt-1 text-xl font-bold text-ink">它解决什么问题？</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
          >
            关闭
          </button>
        </div>
        <div className="space-y-4 text-sm leading-7 text-stone-700">
          <p>
            很多人在处理 AI 生成的中文报告、论文、公众号文案或小红书文案时，会遇到一个常见问题：中英文、数字和中文之间经常被自动加上空格。
          </p>
          <p>
            如果在 Word 里直接用 Ctrl + H 把所有空格替换为空，会误删本来应该保留的空格。
          </p>
          <div className="grid gap-2 rounded-2xl border border-stone-300 bg-white/70 p-4 font-mono text-xs leading-6 text-stone-700">
            <span>OpenAI API → OpenAIAPI</span>
            <span>Visual Studio Code → VisualStudioCode</span>
            <span>High Performance Web Server → HighPerformanceWebServer</span>
          </div>
          <p>
            这些英文短语内部的空格是正常内容，不应该被删除。本工具解决的是这个边界问题：清理中文与英文、数字之间的异常空格，同时保留英文短语内部的正常空格。
          </p>
          <div className="grid gap-2 rounded-2xl border border-stone-300 bg-white/70 p-4 text-sm">
            <span>“这是一个 AI 工具” → “这是一个AI工具”</span>
            <span>“我有 3 个模块” → “我有3个模块”</span>
            <span>保留 “OpenAI API”、“Visual Studio Code”、“High Performance Web Server”</span>
          </div>
          <p>
            因此，它更适合用来做 AI 中文写作后的二次清洗，而不是粗暴地删除全文所有空格。
          </p>
          <p className="rounded-2xl bg-moss/10 px-4 py-3 text-moss">
            本工具在浏览器本地运行，不调用 API，不上传文本。
          </p>
        </div>
      </section>
    </div>
  );
}

function DemoDialog({
  mode,
  runId,
  onReplay,
  onUseExample,
  onClose,
}: {
  mode: NormalizeMode;
  runId: number;
  onReplay: () => void;
  onUseExample: () => void;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const smartText = normalizeTextWithStats(exampleText, { mode }).text;
  const stageIndex = progress < 38 ? 0 : progress < 78 ? 1 : 2;
  const stage = demoStages[stageIndex];
  const finished = progress >= 100;
  const rawPreview = sliceByProgress(exampleText, Math.min(progress * 1.8, 100));
  const brutePreview = sliceByProgress(bruteForceText, Math.max(0, Math.min((progress - 14) * 2.2, 100)));
  const smartPreview = sliceByProgress(smartText, Math.max(0, Math.min((progress - 38) * 2.1, 100)));

  useEffect(() => {
    setProgress(0);
    const timer = window.setInterval(() => {
      setProgress((previous) => {
        const next = Math.min(previous + 1, 100);
        if (next === 100) {
          window.clearInterval(timer);
        }
        return next;
      });
    }, 110);

    return () => window.clearInterval(timer);
  }, [runId]);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/28 p-3 backdrop-blur-sm">
      <section className="flex max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl border border-stone-300 bg-paper p-4 shadow-soft md:p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">{stage.label}</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{stage.title}</h2>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {stageIndex === 0
                ? '先看原始文本，以及粗暴删除所有空格会造成的误伤。'
                : stageIndex === 1
                  ? '本工具删除该删的空格，同时保留英文短语、行内代码和代码块。'
                  : '演示不会写入输入框，只有点击“使用这个示例”才会填入。'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onReplay}
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
            >
              重新播放
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
            >
              关闭演示
            </button>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex gap-2">
            {demoStages.map((item, index) => (
              <div
                key={item.label}
                className={`h-1.5 flex-1 rounded-full ${
                  index < stageIndex || (index === stageIndex && finished)
                    ? 'bg-moss'
                    : index === stageIndex
                      ? 'bg-clay'
                      : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-ink transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto pr-1">
          {stageIndex === 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">原始文本</h3>
                  <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-stone-500">
                    AI 输出常见空格
                  </span>
                </div>
                <HighlightedPre text={rawPreview} phrases={[]} tone="good" />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">粗暴删除所有空格</h3>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-700">
                    英文短语和代码被误伤
                  </span>
                </div>
                <HighlightedPre text={brutePreview} phrases={problemPhrases} tone="bad" />
              </div>
            </div>
          ) : null}

          {stageIndex === 1 ? (
            <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-stone-300 bg-white/70 p-4 text-sm leading-7 text-stone-700">
                <h3 className="mb-2 font-semibold text-ink">智能清理边界</h3>
                <p>删除中文与英文、数字之间的异常空格。</p>
                <p>保留英文短语、Markdown 行内代码和代码块内部内容。</p>
                <p className="mt-3 rounded-xl bg-moss/10 px-3 py-2 text-moss">
                  不是删除所有空格，而是按中文写作场景清理异常空格。
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">本工具处理结果</h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800">
                    正常空格被保留
                  </span>
                </div>
                <HighlightedPre text={smartPreview} phrases={preservedPhrases} tone="good" />
              </div>
            </div>
          ) : null}

          {stageIndex === 2 ? (
            <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-2xl border border-stone-300 bg-white/75 p-5">
                <h3 className="text-base font-semibold text-ink">下一步</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  点击“使用这个示例”会把原始文本填入左侧输入框，你可以立即看到右侧实时处理结果。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onUseExample}
                    className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss"
                  >
                    使用这个示例
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
                  >
                    关闭演示
                  </button>
                </div>
              </div>
              <HighlightedPre text={smartText} phrases={preservedPhrases} tone="good" />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<NormalizeMode>('standard');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [problemOpen, setProblemOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoRun, setDemoRun] = useState(0);
  const [inputScrollSignal, setInputScrollSignal] = useState(0);

  const startTime = performance.now();
  const result = normalizeTextWithStats(input, { mode });
  const durationMs = performance.now() - startTime;
  const hasInput = input.length > 0;
  const hasOutput = result.text.length > 0;

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
    setInputScrollSignal((signal) => signal + 1);
  }

  function openDemo() {
    setDemoOpen(true);
    setDemoRun((run) => run + 1);
  }

  function useExample() {
    setInput(exampleText);
    setInputScrollSignal((signal) => signal + 1);
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
            onClick={() => setProblemOpen(true)}
            className="rounded-full border border-stone-300 bg-white px-3.5 py-2 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
          >
            解决什么问题
          </button>
          <button
            type="button"
            onClick={openDemo}
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
          scrollToTopSignal={inputScrollSignal}
          onChange={setInput}
        />
        <TextPanel
          title="输出"
          value={result.text}
          placeholder="处理结果会实时显示在这里。"
          scrollToTopOnValueChange
          readOnly
        />
      </section>

      {problemOpen ? <ProblemDialog onClose={() => setProblemOpen(false)} /> : null}
      {demoOpen ? (
        <DemoDialog
          mode={mode}
          runId={demoRun}
          onReplay={() => setDemoRun((run) => run + 1)}
          onUseExample={useExample}
          onClose={() => setDemoOpen(false)}
        />
      ) : null}
    </main>
  );
}
