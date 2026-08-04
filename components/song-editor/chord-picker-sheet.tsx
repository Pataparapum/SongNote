import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Modal, Portal, Text, TextInput } from 'react-native-paper';

import { commonChords } from '@/components/song-editor/common-chords';
import { workspaceTheme } from '@/UI/theme';

const PaperText = cssInterop(Text, { className: 'style' });
const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

type ChordPickerSheetProps = {
  visible: boolean;
  currentChord: string | null;
  onSelect: (chord: string) => void;
  onRemove: () => void;
  onDismiss: () => void;
};

// Common chords as one tap, anything else typed by hand — the model stores the chord as free text,
// so extensions and slash chords ("Cmaj7", "G/B") work without a fixed catalogue.
export function ChordPickerSheet({
  visible,
  currentChord,
  onSelect,
  onRemove,
  onDismiss,
}: ChordPickerSheetProps) {
  const [customChord, setCustomChord] = useState('');

  function handleSubmitCustom() {
    const trimmed = customChord.trim();

    if (trimmed) {
      onSelect(trimmed);
    }

    setCustomChord('');
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          alignSelf: 'center',
          width: '90%',
          maxWidth: 420,
          gap: workspaceTheme.spacing.md,
          backgroundColor: workspaceTheme.colors.panel,
          borderRadius: workspaceTheme.radius.medium,
          padding: workspaceTheme.spacing.lg,
        }}>
        <PaperText className="text-lg font-black text-[#28231d]">Elegir acorde</PaperText>

        <View className="flex-row flex-wrap gap-2">
          {commonChords.map((chord) => (
            <Pressable
              key={chord}
              onPress={() => onSelect(chord)}
              className={`min-w-11 items-center rounded-[10px] border border-[#ded0bd] px-3 py-2 ${
                chord === currentChord ? 'border-[#8f5f38] bg-[#ead2bb]' : 'bg-[#fffdf8]'
              }`}>
              <PaperText className="text-[15px] font-bold text-[#28231d]">{chord}</PaperText>
            </Pressable>
          ))}
        </View>

        <PaperTextInput
          value={customChord}
          onChangeText={setCustomChord}
          onSubmitEditing={handleSubmitCustom}
          dense
          mode="outlined"
          outlineColor={workspaceTheme.colors.border}
          activeOutlineColor={workspaceTheme.colors.accent}
          outlineStyle={{ borderRadius: workspaceTheme.radius.small }}
          placeholder="Otro acorde (ej. Cmaj7, G/B)"
          placeholderTextColor={workspaceTheme.colors.inkSoft}
          textColor={workspaceTheme.colors.ink}
          autoCapitalize="none"
          autoCorrect={false}
          className="bg-[#fffdf8]"
          contentClassName="text-[15px] text-[#28231d]"
        />

        <View className="flex-row justify-between">
          <Pressable onPress={onRemove} className="rounded-[10px] px-3 py-2">
            <PaperText className="text-[15px] font-bold text-[#9d3b32]">Quitar</PaperText>
          </Pressable>
          <Pressable onPress={onDismiss} className="rounded-[10px] px-3 py-2">
            <PaperText className="text-[15px] font-bold text-[#756b5f]">Cerrar</PaperText>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
}
