import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

import { SongEditor } from '@/components/song-editor/song-editor';
import type { SongEditorMode } from '@/components/song-editor/song-editor-context';
import { workspaceTheme } from '@/UI/theme';
import { createEmptySongContent, type SongContent } from '@/modules/song-content';
import type { WorkspaceItem } from '@/modules/workspace';

const PaperText = cssInterop(Text, { className: 'style' });

type WorkspaceFileManagerProps = {
  selectedItem: WorkspaceItem | null;
  activeFolderItems: WorkspaceItem[];
  onSelectItem: (item: WorkspaceItem) => void;
  onChangeFileContent: (content: SongContent) => void;
  mode: SongEditorMode;
  onChangeMode: (mode: SongEditorMode) => void;
  transposeSemitones?: number;
  onAutosaveTrigger?: () => void;
};

// Selected file editor, or a browsable listing of the active folder's contents — no boxed panels, content sits directly on the page.
export function WorkspaceFileManager({
  selectedItem,
  activeFolderItems,
  onSelectItem,
  onChangeFileContent,
  mode,
  onChangeMode,
  transposeSemitones,
  onAutosaveTrigger,
}: WorkspaceFileManagerProps) {
  if (selectedItem?.type === 'file') {
    return (
      <SongEditor
        key={selectedItem.id}
        content={selectedItem.content ?? createEmptySongContent()}
        onChangeContent={onChangeFileContent}
        mode={mode}
        onChangeMode={onChangeMode}
        transposeSemitones={transposeSemitones}
        onAutosaveTrigger={onAutosaveTrigger}
      />
    );
  }

  return (
    <View>
      {activeFolderItems.length > 0 ? (
        activeFolderItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onSelectItem(item)}
            className="flex-row items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-[#ece2d2] active:bg-[#ece2d2]">
            <MaterialIcons
              name={item.type === 'folder' ? 'folder' : 'description'}
              size={18}
              color={workspaceTheme.colors.inkSoft}
            />
            <PaperText numberOfLines={1} className="flex-1 text-base text-[#28231d]">
              {item.name}
            </PaperText>
          </Pressable>
        ))
      ) : (
        <PaperText className="px-2 text-[15px] leading-[22px] text-[#9d9285]">
          This folder is empty. Create a folder or file from the sidebar.
        </PaperText>
      )}
    </View>
  );
}
