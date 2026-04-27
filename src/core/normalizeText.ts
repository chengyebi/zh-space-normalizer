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

interface MutableState {
  text: string;
  changes: number;
}

interface Segment {
  type: 'plain' | 'protected';
  text: string;
}

const HAN = '\\p{Script=Han}';
const WESTERN = '[A-Za-z0-9]';
const WESTERN_TOKEN_END = '[A-Za-z0-9+#]';
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

function applyRule(state: MutableState, pattern: RegExp, replacement: RegexReplacement): MutableState {
  const result = replaceAndCount(state.text, pattern, replacement);
  return {
    text: result.text,
    changes: state.changes + result.changes,
  };
}

function splitMarkdownCodeBlocks(input: string): Segment[] {
  const segments: Segment[] = [];
  const lines = input.split(/(\r\n|\n|\r)/);
  let buffer = '';
  let inCodeBlock = false;
  let fenceMarker: '`' | '~' | null = null;
  let fenceLength = 0;

  function push(type: Segment['type'], text: string) {
    if (!text) {
      return;
    }

    const last = segments[segments.length - 1];
    if (last?.type === type) {
      last.text += text;
      return;
    }

    segments.push({ type, text });
  }

  function flushPlain() {
    push('plain', buffer);
    buffer = '';
  }

  for (let index = 0; index < lines.length; index += 2) {
    const line = lines[index] ?? '';
    const newline = lines[index + 1] ?? '';
    const fullLine = line + newline;
    const openingFence = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);

    if (!inCodeBlock && openingFence) {
      flushPlain();
      inCodeBlock = true;
      fenceMarker = openingFence[1][0] as '`' | '~';
      fenceLength = openingFence[1].length;
      buffer = fullLine;
      continue;
    }

    if (inCodeBlock) {
      buffer += fullLine;
      const closingPattern =
        fenceMarker === '`'
          ? new RegExp(`^[ \\t]{0,3}\`{${fenceLength},}[ \\t]*$`)
          : new RegExp(`^[ \\t]{0,3}~{${fenceLength},}[ \\t]*$`);

      if (closingPattern.test(line)) {
        push('protected', buffer);
        buffer = '';
        inCodeBlock = false;
        fenceMarker = null;
        fenceLength = 0;
      }
      continue;
    }

    buffer += fullLine;
  }

  push(inCodeBlock ? 'protected' : 'plain', buffer);
  return segments;
}

function splitInlineCode(input: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  while (cursor < input.length) {
    const start = input.indexOf('`', cursor);

    if (start === -1) {
      segments.push({ type: 'plain', text: input.slice(cursor) });
      break;
    }

    const run = input.slice(start).match(/^`+/);
    if (!run) {
      segments.push({ type: 'plain', text: input.slice(cursor) });
      break;
    }

    const marker = run[0];
    const end = input.indexOf(marker, start + marker.length);

    if (end === -1) {
      segments.push({ type: 'plain', text: input.slice(cursor) });
      break;
    }

    if (start > cursor) {
      segments.push({ type: 'plain', text: input.slice(cursor, start) });
    }
    segments.push({ type: 'protected', text: input.slice(start, end + marker.length) });
    cursor = end + marker.length;
  }

  return segments.filter((segment) => segment.text.length > 0);
}

function trimLineEdges(segments: Segment[]): { segments: Segment[]; changes: number } {
  let changes = 0;
  const next = segments.map((segment) => ({ ...segment }));
  const firstPlain = next.find((segment) => segment.type === 'plain' && segment.text.length > 0);
  const lastPlain = [...next]
    .reverse()
    .find((segment) => segment.type === 'plain' && segment.text.length > 0);

  if (firstPlain) {
    const trimmed = firstPlain.text.replace(/^[ \t]+/, '');
    if (trimmed !== firstPlain.text) {
      changes += 1;
      firstPlain.text = trimmed;
    }
  }

  if (lastPlain) {
    const trimmed = lastPlain.text.replace(/[ \t]+$/, '');
    if (trimmed !== lastPlain.text) {
      changes += 1;
      lastPlain.text = trimmed;
    }
  }

  return { segments: next, changes };
}

function trimSpacesAroundProtectedSegments(segments: Segment[]): { segments: Segment[]; changes: number } {
  let changes = 0;
  const next = segments.map((segment) => ({ ...segment }));

  for (let index = 0; index < next.length; index += 1) {
    const segment = next[index];

    if (segment.type !== 'plain') {
      continue;
    }

    const previous = next[index - 1];
    if (previous?.type === 'protected') {
      const trimmed = segment.text.replace(/^[ \t]+(?=[\p{Script=Han}，。！？；：、,.!?;:）】》」』])/u, '');
      if (trimmed !== segment.text) {
        changes += 1;
        segment.text = trimmed;
      }
    }
  }

  return { segments: next, changes };
}

function normalizeChineseBoundaries(state: MutableState): MutableState {
  let next = state;
  next = applyRule(next, new RegExp(`(${HAN})${HORIZONTAL_SPACE}+(${WESTERN})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`(${WESTERN_TOKEN_END})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  return next;
}

function normalizeChineseAndPunctuation(state: MutableState): MutableState {
  let next = state;
  next = applyRule(next, new RegExp(`(${HAN})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`${HORIZONTAL_SPACE}+(${CLOSING_PUNCTUATION})`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`${HORIZONTAL_SPACE}+(${OPENING_PUNCTUATION})`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`(${OPENING_PUNCTUATION})${HORIZONTAL_SPACE}+`, 'gu'), '$1');
  next = applyRule(next, new RegExp(`(${FULLWIDTH_PUNCTUATION})${HORIZONTAL_SPACE}+(${HAN}|${WESTERN})`, 'gu'), '$1$2');
  next = applyRule(next, new RegExp(`(${ASCII_PUNCTUATION})${HORIZONTAL_SPACE}+(${HAN})`, 'gu'), '$1$2');
  return next;
}

function normalizeAggressively(state: MutableState): MutableState {
  let next = state;
  next = applyRule(next, /[ \t]{2,}/g, ' ');
  return next;
}

function normalizePlainText(input: string, mode: NormalizeMode): MutableState {
  const parts = input.split(/(\r\n|\n|\r)/);
  let changes = 0;
  let text = '';

  for (let index = 0; index < parts.length; index += 2) {
    const line = parts[index] ?? '';
    const newline = parts[index + 1] ?? '';
    const inlineSegments = splitInlineCode(line);
    const trimmed = trimLineEdges(inlineSegments);
    changes += trimmed.changes;

    const normalizedSegments = trimmed.segments.map((segment) => {
      if (segment.type === 'protected') {
        return segment;
      }

      let state: MutableState = { text: segment.text, changes: 0 };
      state = normalizeChineseBoundaries(state);

      if (mode === 'standard' || mode === 'aggressive') {
        state = normalizeChineseAndPunctuation(state);
      }

      if (mode === 'aggressive') {
        state = normalizeAggressively(state);
      }

      changes += state.changes;
      return { ...segment, text: state.text };
    });

    const boundaryTrimmed = trimSpacesAroundProtectedSegments(normalizedSegments);
    changes += boundaryTrimmed.changes;

    const normalizedLine = boundaryTrimmed.segments
      .map((segment) => {
        return segment.text;
      })
      .join('');

    text += normalizedLine + newline;
  }

  if (mode === 'aggressive') {
    const compressed = replaceAndCount(text, /\n{3,}/g, '\n\n');
    text = compressed.text;
    changes += compressed.changes;
  }

  return { text, changes };
}

export function normalizeTextWithStats(
  input: string,
  options: NormalizeOptions = {},
): NormalizeResult {
  const mode = options.mode ?? 'standard';
  let changes = 0;
  const text = splitMarkdownCodeBlocks(input)
    .map((segment) => {
      if (segment.type === 'protected') {
        return segment.text;
      }

      const normalized = normalizePlainText(segment.text, mode);
      changes += normalized.changes;
      return normalized.text;
    })
    .join('');

  return {
    text,
    stats: {
      beforeChars: input.length,
      afterChars: text.length,
      changes,
    },
  };
}

export function normalizeText(input: string, options: NormalizeOptions = {}): string {
  return normalizeTextWithStats(input, options).text;
}
