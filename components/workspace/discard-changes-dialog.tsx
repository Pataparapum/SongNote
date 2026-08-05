import { cssInterop } from 'nativewind';
import { Pressable, View } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';

const PaperText = cssInterop(Text, { className: 'style' });

type DiscardChangesDialogProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Guards entering Leer mode while there are unsaved changes: Leer is meant to show the last saved
// version of the song, never an in-progress draft — but discarding a draft is destructive (there is
// no undo, no backend history yet), so it asks before doing that instead of doing it silently.
export function DiscardChangesDialog({ visible, onConfirm, onCancel }: DiscardChangesDialogProps) {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onCancel}
        contentContainerStyle={{
          alignSelf: 'center',
          width: '90%',
          maxWidth: 380,
          gap: workspaceTheme.spacing.md,
          backgroundColor: workspaceTheme.colors.panel,
          borderRadius: workspaceTheme.radius.medium,
          padding: workspaceTheme.spacing.lg,
        }}>
        <PaperText className="text-lg font-black text-[#28231d]">Cambios sin guardar</PaperText>
        <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">
          Leer siempre muestra la última versión guardada. Si entras ahora, se pierden los cambios que
          todavía no guardaste con el botón Guardar.
        </PaperText>

        <View className="flex-row justify-end gap-2">
          <Pressable onPress={onCancel} className="rounded-[10px] px-3 py-2">
            <PaperText className="text-[15px] font-bold text-[#756b5f]">Cancelar</PaperText>
          </Pressable>
          <Pressable onPress={onConfirm} className="rounded-[10px] bg-[#9d3b32] px-3 py-2.5">
            <PaperText className="text-[15px] font-bold text-white">Descartar y leer</PaperText>
          </Pressable>
        </View>
      </Modal>
    </Portal>
  );
}
