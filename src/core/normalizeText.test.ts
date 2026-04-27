import { describe, expect, it } from 'vitest';
import { normalizeText, normalizeTextWithStats } from './normalizeText';

describe('normalizeText', () => {
  it('removes extra spaces between Chinese and English tokens in standard mode', () => {
    expect(normalizeText('这是一个 AI 工具，可以处理 GPT-5 生成的 报告。')).toBe(
      '这是一个AI工具，可以处理GPT-5生成的报告。',
    );
  });

  it('preserves English phrase spaces while removing Chinese boundaries', () => {
    expect(normalizeText('我推荐使用 Visual Studio Code 编辑器。')).toBe(
      '我推荐使用Visual Studio Code编辑器。',
    );
  });

  it('keeps plain English text untouched', () => {
    expect(normalizeText('OpenAI API is useful.')).toBe('OpenAI API is useful.');
  });

  it('removes spaces between Chinese and numbers', () => {
    expect(normalizeText('我有 3 个模块 和 2 个页面。')).toBe('我有3个模块和2个页面。');
  });

  it('does not break ordinary single-space number sequences', () => {
    expect(normalizeText('序列是 1 2 3，请保留。')).toBe('序列是1 2 3，请保留。');
  });

  it('keeps conservative mode focused on Chinese-English and Chinese-number boundaries', () => {
    expect(normalizeText('中文 中文， 使用 AI 工具。', { mode: 'conservative' })).toBe(
      '中文 中文， 使用AI工具。',
    );
  });

  it('cleans punctuation spacing in standard mode', () => {
    expect(normalizeText('你好 ， AI 工具 ！ 请使用 （ 示例 ） 。')).toBe(
      '你好，AI工具！请使用（示例）。',
    );
  });

  it('compresses excessive whitespace in aggressive mode without destroying phrases', () => {
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
