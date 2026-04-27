import { useState } from 'react';
import { ModeSelector } from './components/ModeSelector';
import { StatsBar } from './components/StatsBar';
import { TextPanel } from './components/TextPanel';
import { normalizeTextWithStats, type NormalizeMode } from './core/normalizeText';

const exampleText = `  这是一个 AI 工具，可以处理 GPT-5 生成的 报告。
我推荐使用 Visual Studio Code，也读过 High Performance Web Server。
我有 3 个模块 和 2 个页面。
你好 ， 世界 ！ 请使用 （ 示例 ） 。

OpenAI API is useful.

\`\`\`cpp
int main() {
    return 0;
}
\`\`\`

请运行 \`npm run build\` ， 然后查看 AI 结果。  `;

export default function App() {
  const [input, setInput] = useState(exampleText);
  const [mode, setMode] = useState<NormalizeMode>('standard');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const result = normalizeTextWithStats(input, { mode });
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

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7f2e8_0%,#efe7d6_45%,#dfe9df_100%)] px-4 py-6 text-ink md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 grid gap-5 lg:grid-cols-[1fr_340px] lg:items-stretch">
          <section className="rounded-[2rem] border border-stone-300 bg-white/65 p-6 shadow-soft backdrop-blur md:p-8">
            <p className="mb-4 inline-flex rounded-full border border-moss/30 bg-white/70 px-4 py-2 text-sm text-moss">
              本地处理 · 无 API · 不上传文本
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink md:text-6xl">
              zh-space-normalizer
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
              面向中文 AI 写作场景的空格规范化工具。它会清理中英数字混排、中文标点和异常空白，同时保护英文短语、数字序列、Markdown 代码块与行内代码。
            </p>
          </section>

          <aside className="rounded-[2rem] border border-stone-300 bg-white/65 p-5 shadow-soft backdrop-blur">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-ink">处理模式</h2>
              <p className="mt-1 text-xs leading-5 text-stone-500">
                默认推荐标准模式；所有模式都只在浏览器本地处理文本。
              </p>
            </div>
            <ModeSelector mode={mode} onChange={setMode} />
          </aside>
        </header>

        <section className="mb-5 rounded-[1.75rem] border border-stone-300 bg-white/55 p-4 shadow-soft backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm leading-6 text-stone-600">
              <strong className="text-ink">安全边界：</strong>
              无后端、无数据库、无登录、无埋点，输入内容不会离开当前浏览器。
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput(exampleText)}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
              >
                填充示例
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                disabled={!hasInput}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-clay hover:text-clay disabled:cursor-not-allowed disabled:text-stone-300"
              >
                清空
              </button>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!hasOutput}
                className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {copyState === 'copied'
                  ? '已复制'
                  : copyState === 'failed'
                    ? '复制失败'
                    : '复制结果'}
              </button>
            </div>
          </div>
        </section>

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
            helper="粘贴 AI 生成文本、报告、论文或运营文案。"
            placeholder="在这里粘贴需要规范化的中文文本..."
            onChange={setInput}
          />
          <TextPanel
            title="输出结果"
            value={result.text}
            helper="实时预览结果；代码块和行内代码会被保护。"
            readOnly
          />
        </section>
      </div>
    </main>
  );
}
