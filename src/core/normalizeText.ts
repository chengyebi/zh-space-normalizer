export type NormalizeMode = 'conservative' | 'standard' | 'aggressive';

export interface NormalizeOptions {
  mode?: NormalizeMode;
}

export interface NormalizeStats {
  beforeChars: number;
  afterChars: number;
  changes: number;
}

export interface NormalizeResult {
  text: string;
  stats: NormalizeStats;
}

type RegexReplacement = string | ((substring: string, ...args: string[]) => string);

const HAN = '\\p{Script=Han}';
const LATIN_OR_DIGIT = '[A-Za-z0-9]';
const HORIZONTAL_SPACE = '[ \\t]';
const FULLWIDTH_PUNCTUATION = '[，。！？；：、]';
const ASCII_PUNCTUATION = '[,.!?;:]';
const CLOSING_PUNCTUATION = '[，。！？；：、,.!?;:）】》」』]';
const OPENING_PUNCTUATION = '[（【《「『]';

function replaceAndCount(
  input: string,
  pattern: RegExp,
  replacement: RegexReplacement,
): { text: string; changes: number } {
  let changes = 0;
  const text = input.replace(pattern, (...args: string[]) => {
    const match = args[0];
    const next =
      typeof replacement === 'function'
        ? replacement(match, ...args.slice(1))
        : replacement.replace(/\$(\d+)/g, (_, index: string) => args[Number(index)] ?? '');

    if (next !== match) {
      changes += 1;
    }

    return next;
  });

  return { text, changes };
}

function applyRule(
  state: { text: string; changes: number },
  pattern: RegExp,
  replacement: RegexReplacement,
): { text: string; changes: number } {
  const result = replaceAndCount(state.text, pattern, replacement);
  return {
    text: result.text,
    changes: state.changes + result.changes,
  };
}

function normalizeChineseBoundaries(state: { text: string; changes: number }) {
  let next = state;
  next = applyRule(next, new RegExp(`(${HAN})${HORIZONTAL_SPACE}+(${LATIN_OR_DIGIT})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`(${LATIN_OR_DIGIT})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  return next;
}

function normalizeChineseAndPunctuation(state: { text: string; changes: number }) {
  let next = state;
  next = applyRule(next, new RegExp(`(${HAN})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`${HORIZONTAL_SPACE}+(${CLOSING_PUNCTUATION})`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`${HORIZONTAL_SPACE}+(${OPENING_PUNCTUATION})`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`(${OPENING_PUNCTUATION})${HORIZONTAL_SPACE}+`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`(${FULLWIDTH_PUNCTUATION})${HORIZONTAL_SPACE}+(${HAN}|${LATIN_OR_DIGIT})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`(${ASCII_PUNCTUATION})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  return next;
}

function normalizeAggressively(state: { text: string; changes: number }) {
  let next = state;
  next = applyRule(next, /[ \t]{2,}/g, ' ');
  next = applyRule(next, / ?\n ?/g, '\n');
  next = applyRule(next, /\n{3,}/g, '\n\n');
  return next;
}

export function normalizeTextWithStats(
  input: string,
  options: NormalizeOptions = {},
): NormalizeResult {
  const mode = options.mode ?? 'standard';
  let state = {
    text: input,
    changes: 0,
  };

  state = normalizeChineseBoundaries(state);

  if (mode === 'standard' || mode === 'aggressive') {
    state = normalizeChineseAndPunctuation(state);
  }

  if (mode === 'aggressive') {
    state = normalizeAggressively(state);
  }

  return {
    text: state.text,
    stats: {
      beforeChars: input.length,
      afterChars: state.text.length,
      changes: state.changes,
    },
  };
}

export function normalizeText(input: string, options: NormalizeOptions = {}): string {
  return normalizeTextWithStats(input, options).text;
}
