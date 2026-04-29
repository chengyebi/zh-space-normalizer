import { describe, expect, it } from 'vitest';
import { normalizeText, normalizeTextWithStats } from './normalizeText';

describe('normalizeText core rules', () => {
  it('removes spaces between Chinese and English', () => {
    expect(normalizeText('这是一个 AI 工具。')).toBe('这是一个AI工具。');
  });

  it('removes spaces between English and Chinese', () => {
    expect(normalizeText('AI 写作工具很好用。')).toBe('AI写作工具很好用。');
  });

  it('removes spaces around English tokens in Chinese context', () => {
    expect(normalizeText('我正在使用 ChatGPT 写报告。')).toBe('我正在使用ChatGPT写报告。');
  });

  it('removes spaces between Chinese and numbers', () => {
    expect(normalizeText('我有 3 个模块 和 2 个页面。')).toBe('我有3个模块和2个页面。');
  });

  it('removes abnormal spaces between Chinese characters in standard mode', () => {
    expect(normalizeText('这是 一个 中文 文档。')).toBe('这是一个中文文档。');
  });

  it('preserves spaces inside English product names', () => {
    expect(normalizeText('我推荐使用 Visual Studio Code 编辑器。')).toBe(
      '我推荐使用Visual Studio Code编辑器。',
    );
  });

  it('preserves spaces inside English technical phrases', () => {
    expect(normalizeText('我读过 High Performance Web Server，也使用 OpenAI API。')).toBe(
      '我读过High Performance Web Server，也使用OpenAI API。',
    );
  });

  it('handles GPT version tokens', () => {
    expect(normalizeText('这是 GPT-5 生成的 报告。')).toBe('这是GPT-5生成的报告。');
  });

  it('cleans Chinese punctuation spacing in standard mode', () => {
    expect(normalizeText('你好 ， 世界 ！ 请使用 （ 示例 ） 。')).toBe(
      '你好，世界！请使用（示例）。',
    );
  });

  it('trims line edges without breaking English or number internal spaces', () => {
    expect(normalizeText('  a b c  ')).toBe('a b c');
    expect(normalizeText('  1 2 3  ')).toBe('1 2 3');
    expect(normalizeText('  OpenAI API  ')).toBe('OpenAI API');
  });

  it('does not break English sentences', () => {
    expect(normalizeText('OpenAI API is useful.')).toBe('OpenAI API is useful.');
  });

  it('protects inline Markdown code', () => {
    expect(normalizeText('请运行 `npm run build`，然后查看 AI 结果。')).toBe(
      '请运行 `npm run build`，然后查看AI结果。',
    );
  });

  it('protects fenced Markdown code blocks exactly', () => {
    const codeBlock = ['```cpp', 'int main() {', '    return 0;', '}', '```'].join('\n');

    expect(normalizeText(codeBlock)).toBe(codeBlock);
  });

  it('removes decorative blank lines in standard mode', () => {
    expect(normalizeText(['first paragraph', '', '   ', 'second paragraph'].join('\n'))).toBe(
      ['first paragraph', 'second paragraph'].join('\n'),
    );
  });

  it('keeps blank lines inside fenced Markdown code blocks', () => {
    const input = ['before', '', '```txt', 'line 1', '', 'line 2', '```', '', 'after'].join('\n');
    const expected = ['before', '```txt', 'line 1', '', 'line 2', '```', 'after'].join('\n');

    expect(normalizeText(input)).toBe(expected);
  });

  it('normalizes the full mixed sample', () => {
    const input = [
      '这是一个 AI 写作 工具，可以处理 GPT-5 生成的 报告。',
      '我推荐使用 Visual Studio Code，也读过 High Performance Web Server。',
      '项目使用 OpenAI API，并包含 3 个模块 和 2 个页面。',
      '你好 ， 世界 ！ 请使用 （ 示例 ） 。',
      '请运行 `npm run build`，然后查看 AI 结果。',
      '```cpp',
      'int main() {',
      '    return 0;',
      '}',
      '```',
    ].join('\n');

    const expected = [
      '这是一个AI写作工具，可以处理GPT-5生成的报告。',
      '我推荐使用Visual Studio Code，也读过High Performance Web Server。',
      '项目使用OpenAI API，并包含3个模块和2个页面。',
      '你好，世界！请使用（示例）。',
      '请运行 `npm run build`，然后查看AI结果。',
      '```cpp',
      'int main() {',
      '    return 0;',
      '}',
      '```',
    ].join('\n');

    expect(normalizeText(input)).toBe(expected);
  });
});

describe('normalizeText modes and stats', () => {
  it('keeps conservative mode focused on Chinese-English and Chinese-number boundaries', () => {
    expect(normalizeText('中文 中文， 使用 AI 工具。', { mode: 'conservative' })).toBe(
      '中文 中文， 使用AI工具。',
    );
  });

  it('compresses excessive whitespace in aggressive mode without destroying phrases or code', () => {
    const input = [
      '我推荐使用   Visual Studio Code   编辑器。',
      '',
      '',
      'OpenAI  API is useful.',
      '请运行 `npm   run   build`，然后查看 AI 结果。',
    ].join('\n');

    const expected = [
      '我推荐使用Visual Studio Code编辑器。',
      'OpenAI API is useful.',
      '请运行 `npm   run   build`，然后查看AI结果。',
    ].join('\n');

    expect(normalizeText(input, { mode: 'aggressive' })).toBe(expected);
  });

  it('returns useful stats for the UI', () => {
    const result = normalizeTextWithStats('我有 3 个模块。');
    expect(result.text).toBe('我有3个模块。');
    expect(result.stats.beforeChars).toBe(9);
    expect(result.stats.afterChars).toBe(7);
    expect(result.stats.changes).toBeGreaterThan(0);
  });
});
