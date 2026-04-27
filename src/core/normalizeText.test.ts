import { describe, expect, it } from 'vitest';
import { normalizeText, normalizeTextWithStats } from './normalizeText';

describe('normalizeText', () => {
  it('removes extra spaces between Chinese and English tokens in standard mode', () => {
    expect(normalizeText('这是一个 AI 工具，可以处理 GPT-5 生成的 报告。')).toBe(
      '这是一个AI工具，可以处理GPT-5生成的报告。',
    );
  });

  it('preserves common English phrase spaces', () => {
    expect(
      normalizeText('我推荐使用 Visual Studio Code，也读过 High Performance Web Server。'),
    ).toBe('我推荐使用Visual Studio Code，也读过High Performance Web Server。');
    expect(normalizeText('OpenAI API is useful.')).toBe('OpenAI API is useful.');
    expect(normalizeText('我在读 C++ Primer 和 New York Times。')).toBe(
      '我在读C++ Primer和New York Times。',
    );
  });

  it('removes spaces between Chinese and numbers', () => {
    expect(normalizeText('我有 3 个模块 和 2 个页面。')).toBe('我有3个模块和2个页面。');
  });

  it('does not break ordinary single-space number sequences', () => {
    expect(normalizeText('序列是 1 2 3，请保留。')).toBe('序列是1 2 3，请保留。');
  });

  it('removes abnormal spaces between Chinese characters in standard mode', () => {
    expect(normalizeText('中文 中文')).toBe('中文中文');
  });

  it('keeps conservative mode focused on Chinese-English and Chinese-number boundaries', () => {
    expect(normalizeText('中文 中文， 使用 AI 工具。', { mode: 'conservative' })).toBe(
      '中文 中文， 使用AI工具。',
    );
  });

  it('cleans Chinese punctuation spacing in standard mode', () => {
    expect(normalizeText('你好 ， 世界 ！')).toBe('你好，世界！');
    expect(normalizeText('请使用 （ 示例 ） 。')).toBe('请使用（示例）。');
  });

  it('trims each line without breaking English or number internal spaces', () => {
    expect(normalizeText(' a b c \n 1 2 3 \n  OpenAI API  ')).toBe(
      'a b c\n1 2 3\nOpenAI API',
    );
  });

  it('protects fenced Markdown code blocks', () => {
    const input = [
      '这是一个 AI 工具。',
      '```cpp',
      'int main() {',
      '    return 0;',
      '}',
      '```',
      'GPT-5 生成的 报告。',
    ].join('\n');

    expect(normalizeText(input)).toBe(
      [
        '这是一个AI工具。',
        '```cpp',
        'int main() {',
        '    return 0;',
        '}',
        '```',
        'GPT-5生成的报告。',
      ].join('\n'),
    );
  });

  it('protects inline Markdown code', () => {
    expect(normalizeText('请运行 `npm run build` ， 然后查看 AI 结果。')).toBe(
      '请运行`npm run build`，然后查看AI结果。',
    );
    expect(normalizeText('保持 ` 中文 AI ` 不变。')).toBe('保持` 中文 AI `不变。');
  });

  it('compresses excessive horizontal whitespace in aggressive mode without destroying phrases', () => {
    expect(
      normalizeText('我推荐使用   Visual Studio Code   编辑器。\n\n\nOpenAI  API is useful.', {
        mode: 'aggressive',
      }),
    ).toBe('我推荐使用Visual Studio Code编辑器。\n\nOpenAI API is useful.');
  });

  it('returns useful stats for the UI', () => {
    const result = normalizeTextWithStats('我有 3 个模块。');
    expect(result.text).toBe('我有3个模块。');
    expect(result.stats.beforeChars).toBe(9);
    expect(result.stats.afterChars).toBe(7);
    expect(result.stats.changes).toBeGreaterThan(0);
  });
});
