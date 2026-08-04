import { createId } from '@/modules/id';

// A song is a list of lines, and every line is a list of words that can carry one chord each.
// A word with an empty text is a "ghost word": a slot that only holds a chord, used both for a
// chord that falls between two sung words and for fully instrumental lines (every word is a ghost).
export type LyricWord = {
  id: string;
  text: string;
  chord: string | null;
};

export type SongLine = {
  id: string;
  words: LyricWord[];
};

export type SongContent = {
  version: 1;
  lines: SongLine[];
};

export function createEmptySongContent(): SongContent {
  return { version: 1, lines: [createLine([])] };
}

export function createWord(text: string): LyricWord {
  return { id: createId(), text, chord: null };
}

export function createGhostWord(): LyricWord {
  return { id: createId(), text: '', chord: null };
}

export function createLine(words: LyricWord[]): SongLine {
  return { id: createId(), words };
}

export function isGhostWord(word: LyricWord): boolean {
  return word.text === '';
}

// Plain-text projection used by the writing mode: ghost words contribute nothing, since they hold
// no lyrics to type.
export function songContentToPlainText(content: SongContent): string {
  return content.lines
    .map((line) =>
      line.words
        .filter((word) => !isGhostWord(word))
        .map((word) => word.text)
        .join(' '),
    )
    .join('\n');
}

// Rebuilds the structured song from the plain text typed in writing mode, keeping the id and chord
// of every word whose text did not move. Matching is positional per line — no diffing library —
// because lyric edits are local (a word inside a line), not full-song reflows.
export function reconcilePlainText(content: SongContent, plainText: string): SongContent {
  const lines = plainText.split('\n').map((lineText, lineIndex) => {
    const tokens = tokenize(lineText);
    const previousLine = content.lines[lineIndex];

    if (!previousLine) {
      return createLine(tokens.map(createWord));
    }

    const previousWords = previousLine.words.filter((word) => !isGhostWord(word));

    // Untouched lines are returned as-is so that editing one line never disturbs the ghost words
    // (instrumental chords) of the rest of the song.
    if (matchesTokens(previousWords, tokens)) {
      return previousLine;
    }

    // A line that did change loses its ghost words: they carry no text, so the plain text gives no
    // clue about where they should land. Chords sitting on unchanged words are still preserved.
    return {
      id: previousLine.id,
      words: tokens.map((token, wordIndex) => {
        const previousWord = previousWords[wordIndex];

        return previousWord?.text === token ? previousWord : createWord(token);
      }),
    };
  });

  return { ...content, lines };
}

function tokenize(lineText: string): string[] {
  const trimmed = lineText.trim();

  return trimmed ? trimmed.split(/\s+/) : [];
}

function matchesTokens(words: LyricWord[], tokens: string[]): boolean {
  return words.length === tokens.length && words.every((word, index) => word.text === tokens[index]);
}

export function setWordChord(
  content: SongContent,
  lineId: string,
  wordId: string,
  chord: string | null,
): SongContent {
  return updateLine(content, lineId, (line) => ({
    ...line,
    words: line.words.map((word) => (word.id === wordId ? { ...word, chord } : word)),
  }));
}

export function insertWord(
  content: SongContent,
  lineId: string,
  atIndex: number,
  word: LyricWord,
): SongContent {
  return updateLine(content, lineId, (line) => ({
    ...line,
    words: [...line.words.slice(0, atIndex), word, ...line.words.slice(atIndex)],
  }));
}

export function removeWord(content: SongContent, lineId: string, wordId: string): SongContent {
  return updateLine(content, lineId, (line) => ({
    ...line,
    words: line.words.filter((word) => word.id !== wordId),
  }));
}

export function appendLine(content: SongContent): SongContent {
  return { ...content, lines: [...content.lines, createLine([])] };
}

export function findLine(content: SongContent, lineId: string): SongLine | null {
  return content.lines.find((line) => line.id === lineId) ?? null;
}

export function findWord(content: SongContent, lineId: string, wordId: string): LyricWord | null {
  return findLine(content, lineId)?.words.find((word) => word.id === wordId) ?? null;
}

function updateLine(
  content: SongContent,
  lineId: string,
  update: (line: SongLine) => SongLine,
): SongContent {
  return {
    ...content,
    lines: content.lines.map((line) => (line.id === lineId ? update(line) : line)),
  };
}
