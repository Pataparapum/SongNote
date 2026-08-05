import { chromaticNotes } from '@/modules/song-content';

const NOTE_ALIASES: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
};

const ROOT_RE = /^([A-G][#b]?)/;
const BASS_RE = /\/([A-G][#b]?)/;

function normalizeNote(note: string): string {
  return NOTE_ALIASES[note] ?? note;
}

export function transposeNote(note: string, semitones: number): string {
  const index = chromaticNotes.indexOf(normalizeNote(note) as (typeof chromaticNotes)[number]);

  if (index === -1) {
    return note;
  }

  const shiftedIndex = (((index + semitones) % 12) + 12) % 12;

  return chromaticNotes[shiftedIndex];
}

// Transposes only the root and, if present, the bass note of a slash chord ("G/B") — everything
// else in the symbol (quality, extensions: "m", "7", "maj7", "sus4"...) is left untouched.
export function transposeChord(chord: string, semitones: number): string {
  if (semitones === 0) {
    return chord;
  }

  const rootMatch = chord.match(ROOT_RE);

  if (!rootMatch) {
    return chord;
  }

  const transposedRoot = transposeNote(rootMatch[1], semitones);
  const rest = chord.slice(rootMatch[0].length);
  const bassMatch = rest.match(BASS_RE);

  if (!bassMatch || bassMatch.index === undefined) {
    return transposedRoot + rest;
  }

  const transposedBass = transposeNote(bassMatch[1], semitones);

  return (
    transposedRoot +
    rest.slice(0, bassMatch.index) +
    '/' +
    transposedBass +
    rest.slice(bassMatch.index + bassMatch[0].length)
  );
}
