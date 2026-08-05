import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import { useSongEditor } from '@/components/song-editor/song-editor-context';
import { SongWordCell } from '@/components/song-editor/song-word-cell';

const PaperText = cssInterop(Text, { className: 'style' });

// Performing view: same chord-over-word layout, larger type and nothing to press by accident.
export function SongReadView() {
  const { content, transposeSemitones } = useSongEditor();
  const isEmpty = content.lines.every((line) => line.words.length === 0);

  if (isEmpty) {
    return (
      <PaperText className="text-[15px] leading-[22px] text-[#9d9285]">
        Esta canción todavía no tiene letra. Cambia a &quot;Escribir&quot; para empezar.
      </PaperText>
    );
  }

  return (
    <View className="gap-2">
      {content.lines.map((line) => (
        <View key={line.id} className="min-h-[34px] flex-row flex-wrap items-end gap-x-2.5">
          {line.words.map((word) => (
            <SongWordCell key={word.id} word={word} variant="read" transposeSemitones={transposeSemitones} />
          ))}
        </View>
      ))}
    </View>
  );
}
