import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { isGhostWord, type LyricWord } from '@/modules/song-content';
import { transposeChord } from '@/modules/transpose';

const PaperText = cssInterop(Text, { className: 'style' });

type SongWordCellProps = {
  word: LyricWord;
  variant?: 'edit' | 'read';
  transposeSemitones?: number;
};

// One word rendered as a column with its chord on top, so the pair stays aligned even when the
// line wraps — no absolute positioning or text measuring needed.
export function SongWordCell({ word, variant = 'edit', transposeSemitones = 0 }: SongWordCellProps) {
  const isRead = variant === 'read';
  const isGhost = isGhostWord(word);
  // Transposition only changes what's painted here — the stored chord (and the picker that edits
  // it) always stays on the real, untransposed value.
  const displayChord = word.chord ? transposeChord(word.chord, transposeSemitones) : null;

  return (
    <View className="items-start">
      {/* Kept at a fixed height even when empty so words stay on a common baseline */}
      <PaperText
        className={`font-bold text-[#8f5f38] ${isRead ? 'min-h-6 text-lg leading-6' : 'min-h-5 text-sm leading-5'}`}>
        {displayChord ?? ''}
      </PaperText>
      <PaperText
        className={`text-[#28231d] ${isRead ? 'text-xl leading-7' : 'text-base leading-6'} ${
          isGhost ? 'text-[#c9b89f]' : ''
        }`}>
        {/* Ghost words have no lyrics, so in editing mode they get a dot to stay tappable */}
        {isGhost ? (isRead ? '' : '·') : word.text}
      </PaperText>
    </View>
  );
}
