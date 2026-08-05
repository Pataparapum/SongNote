import { cssInterop } from 'nativewind';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

const PaperText = cssInterop(Text, { className: 'style' });

export type SaveState = 'idle' | 'saving' | 'saved';

type WorkspaceSaveButtonProps = {
  saveState: SaveState;
  hasUnsavedChanges: boolean;
  onPress: () => void;
};

const labels: Record<SaveState, string> = {
  idle: 'Guardar',
  saving: 'Guardando…',
  saved: 'Guardado',
};

// Global, whole-workspace save — autosave never reaches the backend, this button is the only path.
export function WorkspaceSaveButton({ saveState, hasUnsavedChanges, onPress }: WorkspaceSaveButtonProps) {
  return (
    <View className="flex-row items-center gap-2.5">
      {hasUnsavedChanges && saveState === 'idle' ? (
        <PaperText className="text-[13px] text-[#9d3b32]">Cambios sin guardar</PaperText>
      ) : null}
      <Pressable
        onPress={onPress}
        disabled={saveState === 'saving'}
        className="rounded-[10px] bg-[#8f5f38] px-4 py-2.5 active:bg-[#674124]">
        <PaperText className="text-sm font-bold text-white">{labels[saveState]}</PaperText>
      </Pressable>
    </View>
  );
}
