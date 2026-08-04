import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

import { ChordPickerSheet } from '@/components/song-editor/chord-picker-sheet';
import { useSongEditor } from '@/components/song-editor/song-editor-context';
import { SongWordCell } from '@/components/song-editor/song-word-cell';
import {
  appendLine,
  createGhostWord,
  findWord,
  insertWord,
  isGhostWord,
  removeWord,
  setWordChord,
  type SongLine,
} from '@/modules/song-content';

const PaperText = cssInterop(Text, { className: 'style' });

type WordRef = { lineId: string; wordId: string };

// Chord placing mode: lyrics are read-only here, every word is a target for a chord, and the "+"
// slots between words insert a chord that falls where nothing is sung.
export function SongChordView() {
  const { content, onChangeContent } = useSongEditor();
  const [editing, setEditing] = useState<WordRef | null>(null);

  const editedWord = editing ? findWord(content, editing.lineId, editing.wordId) : null;

  function handleInsertGhost(lineId: string, atIndex: number) {
    const ghost = createGhostWord();

    onChangeContent(insertWord(content, lineId, atIndex, ghost));
    setEditing({ lineId, wordId: ghost.id });
  }

  function handleSelectChord(chord: string) {
    if (!editing) {
      return;
    }

    onChangeContent(setWordChord(content, editing.lineId, editing.wordId, chord));
    setEditing(null);
  }

  function handleRemove() {
    if (!editing || !editedWord) {
      return;
    }

    // A ghost word only exists to carry a chord, so removing its chord removes the slot itself.
    onChangeContent(
      isGhostWord(editedWord)
        ? removeWord(content, editing.lineId, editing.wordId)
        : setWordChord(content, editing.lineId, editing.wordId, null),
    );
    setEditing(null);
  }

  function handleDismiss() {
    // Drop a slot that was inserted and then left without a chord, so no stray dots pile up.
    if (editing && editedWord && isGhostWord(editedWord) && !editedWord.chord) {
      onChangeContent(removeWord(content, editing.lineId, editing.wordId));
    }

    setEditing(null);
  }

  return (
    <View className="gap-1">
      <PaperText className="text-[13px] leading-5 text-[#756b5f]">
        Toca una palabra para poner su acorde. Los + insertan un acorde donde no se canta.
      </PaperText>

      {content.lines.map((line) => (
        <ChordLineRow
          key={line.id}
          line={line}
          onPressWord={(wordId) => setEditing({ lineId: line.id, wordId })}
          onInsertGhost={(atIndex) => handleInsertGhost(line.id, atIndex)}
        />
      ))}

      <Pressable
        onPress={() => onChangeContent(appendLine(content))}
        className="mt-2 self-start rounded-[10px] px-2 py-2">
        <PaperText className="text-sm font-bold text-[#8f5f38]">+ Agregar línea</PaperText>
      </Pressable>

      <ChordPickerSheet
        visible={Boolean(editedWord)}
        currentChord={editedWord?.chord ?? null}
        onSelect={handleSelectChord}
        onRemove={handleRemove}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

type ChordLineRowProps = {
  line: SongLine;
  onPressWord: (wordId: string) => void;
  onInsertGhost: (atIndex: number) => void;
};

// A line renders as insert slot, word, insert slot, word... so a chord can be dropped before, between
// or after any word. A line whose words are all ghosts is simply an instrumental line.
function ChordLineRow({ line, onPressWord, onInsertGhost }: ChordLineRowProps) {
  return (
    <View className="min-h-[52px] flex-row flex-wrap items-end">
      <InsertSlot onPress={() => onInsertGhost(0)} />
      {line.words.map((word, index) => (
        <View key={word.id} className="flex-row items-end">
          <Pressable
            onPress={() => onPressWord(word.id)}
            className="rounded-[10px] px-1 py-1 hover:bg-[#ece2d2] active:bg-[#ece2d2]">
            <SongWordCell word={word} />
          </Pressable>
          <InsertSlot onPress={() => onInsertGhost(index + 1)} />
        </View>
      ))}
    </View>
  );
}

function InsertSlot({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="h-8 w-4 items-center justify-end pb-1">
      <PaperText className="text-xs leading-4 text-[#ded0bd]">+</PaperText>
    </Pressable>
  );
}
