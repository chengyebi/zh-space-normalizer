import { useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { StatsBar } from './components/StatsBar';
import { TextPanel } from './components/TextPanel';
import { normalizeTextWithStats, type NormalizeMode } from './core/normalizeText';

const exampleText = `这是一个 AI 工具，可以处理 GPT-5 生成的 报告。

我推荐使用 Visual Studio Code 编辑器。

我有 3 个模块 和 2 个页面。

OpenAI API is useful.`;

export default function App() {
  const [input, setInput] = useState(exampleText);
  const [mode, setMode] = useState<NormalizeMode>('standard');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const result = normalizeTextWithStats(input, { mode });

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(result.text);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    window.setTimeout(() => setCopyState('idle'), 1600);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#efe0c7_0,#f7f2e8_34%,#e8efe4_100%)] px-5 py-8 text-ink md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-moss/30 bg-white/55 px-4 py-2 text-sm text-moss">
              本地处理 · 无 API · 不上传文本
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink md:text-6xl">
              zh-space-normalizer
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
              面向中文 AI 写作场景的空格规范化工具，清理报告、论文、小红书文案、公众号文案中的中英数字混排空格问题。
            </p>
          </div>
          <div className="rounded-[2rem] border border-stone-300 bg-white/65 p-5 shadow-soft">
            <ModeSelector mode={mode} onChange={setMode} />
          </div>
        </header>

        <div className="mb-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setInput(exampleText)}
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
          >
            填充示例
          </button>
          <button
            type="button"
            onClick={() => setInput('')}
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay"
          >
            清空
          </button>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!result.text}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制结果'}
          </button>
        </div>

        <section className="mb-5">
          <StatsBar
            beforeChars={result.stats.beforeChars}
            afterChars={result.stats.afterChars}
            changes={result.stats.changes}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <TextPanel
            title="输入文本"
            value={input}
            placeholder="在这里粘贴 AI 生成文本、报告、论文或运营文案..."
            onChange={setInput}
          />
          <TextPanel title="输出结果" value={result.text} readOnly />
        </section>
      </div>
    </main>
  );
}
