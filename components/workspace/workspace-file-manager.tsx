import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';
import type { WorkspaceItem, WorkspaceItemType } from '@/modules/workspace';

const PaperButton = cssInterop(Button, {
  className: 'style',
  contentClassName: 'contentStyle',
  labelClassName: 'labelStyle',
});
const PaperCard = cssInterop(Card, { className: 'style' });
const PaperCardContent = cssInterop(Card.Content, { className: 'style' });
const PaperText = cssInterop(Text, { className: 'style' });
const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

const inputOutlineStyle = { borderRadius: workspaceTheme.radius.medium };

type WorkspaceFileManagerProps = {
  activeFolderName: string;
  newItemName: string;
  onChangeNewItemName: (value: string) => void;
  formError: string;
  onCreateItem: (type: WorkspaceItemType) => void;
  selectedItem: WorkspaceItem | null;
  activeFolderItems: WorkspaceItem[];
  onSelectItem: (item: WorkspaceItem) => void;
  onChangeFileContent: (content: string) => void;
};

// Create-item form plus the selected file's editor (or a browsable folder listing).
export function WorkspaceFileManager({
  activeFolderName,
  newItemName,
  onChangeNewItemName,
  formError,
  onCreateItem,
  selectedItem,
  activeFolderItems,
  onSelectItem,
  onChangeFileContent,
}: WorkspaceFileManagerProps) {
  return (
    <View className="gap-6">
      {/* Form to create a new folder or file inside the active folder */}
      <PaperCard mode="outlined" className="rounded-[24px] border border-[#ded0bd] bg-[#fffbf4]">
        <PaperCardContent className="gap-4 p-6">
          <PaperText className="text-lg font-extrabold text-[#28231d]">Create in {activeFolderName}</PaperText>
          <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">New folders and files appear in the left tree immediately.</PaperText>
          <View className="flex-row flex-wrap gap-2.5">
            <PaperTextInput
              value={newItemName}
              onChangeText={onChangeNewItemName}
              mode="outlined"
              outlineColor={workspaceTheme.colors.border}
              activeOutlineColor={workspaceTheme.colors.accent}
              outlineStyle={inputOutlineStyle}
              placeholder="Folder or file name"
              placeholderTextColor={workspaceTheme.colors.inkSoft}
              textColor={workspaceTheme.colors.ink}
              className="min-h-[46px] min-w-[220px] flex-1 bg-[#fffdf8] text-[15px]"
              contentClassName="px-4 text-[15px] text-[#28231d]"
            />
            <PaperButton
              mode="contained"
              onPress={() => onCreateItem('folder')}
              buttonColor={workspaceTheme.colors.accent}
              textColor={workspaceTheme.colors.panel}
              className="min-h-12 justify-center rounded-2xl"
              contentClassName="min-h-12 px-[18px]"
              labelClassName="text-sm font-extrabold">
              New folder
            </PaperButton>
            <PaperButton
              mode="contained-tonal"
              onPress={() => onCreateItem('file')}
              buttonColor={workspaceTheme.colors.accentSoft}
              textColor={workspaceTheme.colors.accentDark}
              className="min-h-12 justify-center rounded-2xl"
              contentClassName="min-h-12 px-[18px]"
              labelClassName="text-sm font-extrabold">
              New file
            </PaperButton>
          </View>
          {formError ? <PaperText className="text-[13px] font-bold text-[#9d3b32]">{formError}</PaperText> : null}
        </PaperCardContent>
      </PaperCard>

      {/* Selected file editor, or a browsable list of the active folder's contents */}
      <PaperCard mode="outlined" className="rounded-[24px] border border-[#c9b89f] bg-[#fffbf4]">
        <PaperCardContent className="gap-4 p-6">
          {selectedItem?.type === 'file' ? (
            <>
              <PaperText className="text-[22px] font-extrabold text-[#28231d]">{selectedItem.name}</PaperText>
              <PaperTextInput
                value={selectedItem.content ?? ''}
                onChangeText={onChangeFileContent}
                mode="outlined"
                outlineColor={workspaceTheme.colors.border}
                activeOutlineColor={workspaceTheme.colors.accent}
                outlineStyle={inputOutlineStyle}
                placeholder="Write lyrics, chords, notes, or reminders here..."
                placeholderTextColor={workspaceTheme.colors.inkSoft}
                textColor={workspaceTheme.colors.ink}
                multiline
                textAlignVertical="top"
                className="min-h-[320px] bg-[#fffdf8]"
                contentClassName="min-h-[320px] p-4 text-base leading-6 text-[#28231d]"
              />
            </>
          ) : (
            <>
              <PaperText className="text-[22px] font-extrabold text-[#28231d]">{selectedItem?.name ?? 'Workspace root'}</PaperText>
              <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">Open a file to edit it, or enter a folder from this list.</PaperText>
              <View className="gap-2.5">
                {activeFolderItems.length > 0 ? (
                  activeFolderItems.map((item) => (
                    <PaperCard
                      key={item.id}
                      onPress={() => onSelectItem(item)}
                      mode="outlined"
                      className="rounded-2xl border border-[#ded0bd] bg-[#f8f0e4]">
                      <PaperCardContent className="min-h-[54px] flex-row items-center gap-2.5 px-4 py-0">
                        <View className="w-[54px] flex-row items-center gap-1">
                          <MaterialIcons
                            name={item.type === 'folder' ? 'folder' : 'description'}
                            size={18}
                            color={workspaceTheme.colors.inkSoft}
                          />
                          <PaperText className="text-xs font-extrabold uppercase text-[#9d9285]">{item.type}</PaperText>
                        </View>
                        <PaperText numberOfLines={1} className="flex-1 text-base font-bold text-[#28231d]">
                          {item.name}
                        </PaperText>
                      </PaperCardContent>
                    </PaperCard>
                  ))
                ) : (
                  <PaperText className="text-[15px] leading-[22px] text-[#9d9285]">This folder is empty. Create a folder or file above.</PaperText>
                )}
              </View>
            </>
          )}
        </PaperCardContent>
      </PaperCard>
    </View>
  );
}
