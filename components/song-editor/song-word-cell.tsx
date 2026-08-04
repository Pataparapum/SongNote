import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { isGhostWord, type LyricWord } from '@/modules/song-content';

const PaperText = cssInterop(Text, { className: 'style' });

type SongWordCellProps = {
  word: LyricWord;
  variant?: 'edit' | 'read';
};

// One word rendered as a column with its chord on top, so the pair stays aligned even when the
// line wraps — no absolute positioning or text measuring needed.
export function SongWordCell({ word, variant = 'edit' }: SongWordCellProps) {
  const isRead = variant === 'read';
  const isGhost = isGhostWord(word);

  return (
    <View className="items-start">
      {/* Kept at a fixed height even when empty so words stay on a common baseline */}
      <PaperText
        className={`font-bold text-[#8f5f38] ${isRead ? 'min-h-6 text-lg leading-6' : 'min-h-5 text-sm leading-5'}`}>
        {word.chord ?? ''}
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
