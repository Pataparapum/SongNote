import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Button, Card, Text, TextInput } from 'react-native-paper';

import { WorkspaceTree } from '@/components/workspace-tree';
import { workspaceTheme } from '@/UI/theme';
import {
  addItemToFolder,
  createWorkspaceItem,
  filterItems,
  findItem,
  findParentFolderId,
  getItemPath,
  initialWorkspaceItems,
  updateFileContent,
  type WorkspaceItem,
  type WorkspaceItemType,
} from '@/modules/workspace';

const workspaceLocations = [
  { id: 'desktop', label: 'Desktop', detail: 'Fast access on this PC' },
  { id: 'documents', label: 'Documents', detail: 'Best for organized notes' },
  { id: 'custom', label: 'Custom path', detail: 'Type your own folder path' },
];

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

export default function WorkspacePage() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 880;
  const [items, setItems] = useState(initialWorkspaceItems);
  const [selectedId, setSelectedId] = useState<string | null>('folder-songs');
  const [activeFolderId, setActiveFolderId] = useState<string | null>('folder-songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [formError, setFormError] = useState('');
  const [workspaceLocation, setWorkspaceLocation] = useState('documents');
  const [customPath, setCustomPath] = useState('C:/Users/YourName/Documents/SongChord');

  const selectedItem = findItem(items, selectedId);
  const activeFolder = findItem(items, activeFolderId);
  const activeFolderItems = activeFolder?.type === 'folder' ? activeFolder.children ?? [] : items;
  const filteredItems = filterItems(items, searchQuery);
  const currentPath = getItemPath(items, selectedId);

  function handleSelectItem(item: WorkspaceItem) {
    setSelectedId(item.id);
    setFormError('');

    if (item.type === 'folder') {
      setActiveFolderId(item.id);
      return;
    }

    setActiveFolderId(findParentFolderId(items, item.id));
  }

  function handleCreateItem(type: WorkspaceItemType) {
    const trimmedName = newItemName.trim();

    if (!trimmedName) {
      setFormError('Add a name before creating an item.');
      return;
    }

    const newItem = createWorkspaceItem(type, trimmedName);

    setItems((currentItems) => addItemToFolder(currentItems, activeFolderId, newItem));
    setSelectedId(newItem.id);
    setActiveFolderId(type === 'folder' ? newItem.id : activeFolderId);
    setNewItemName('');
    setFormError('');
  }

  function handleUpdateFileContent(content: string) {
    if (!selectedItem || selectedItem.type !== 'file') {
      return;
    }

    setItems((currentItems) => updateFileContent(currentItems, selectedItem.id, content));
  }

  return (
    <View className="flex-1 bg-[#f4efe7]">
      <View className={`flex-1 ${isWideLayout ? 'flex-row' : 'flex-col'}`}>
        <View
          className={`gap-4 bg-[#f8f0e4] p-6 ${
            isWideLayout
              ? 'w-[310px] max-w-[340px] border-r border-[#ded0bd]'
              : 'w-full max-w-full border-b border-[#ded0bd]'
          }`}>
          <PaperText className="text-xs font-extrabold uppercase tracking-[1.4px] text-[#8f5f38]">SongChord</PaperText>
          <PaperText className="text-[26px] font-black tracking-[-0.4px] text-[#28231d]">Workspace</PaperText>
          <PaperTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            mode="outlined"
            outlineColor={workspaceTheme.colors.border}
            activeOutlineColor={workspaceTheme.colors.accent}
            outlineStyle={inputOutlineStyle}
            placeholder="Search folder or file"
            placeholderTextColor={workspaceTheme.colors.inkSoft}
            textColor={workspaceTheme.colors.ink}
            className="min-h-[46px] bg-[#fffdf8] text-[15px]"
            contentClassName="px-4 text-[15px] text-[#28231d]"
          />

          <ScrollView contentContainerClassName="pb-6">
            <WorkspaceTree items={filteredItems} selectedId={selectedId} onSelect={handleSelectItem} />
          </ScrollView>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-6 p-[34px]">
          <View className="gap-2.5">
            <PaperText className="text-[13px] font-extrabold uppercase tracking-[0.9px] text-[#8f5f38]">
              Minimal song notes
            </PaperText>
            <PaperText className="max-w-[760px] text-[38px] font-black leading-[44px] tracking-[-1.2px] text-[#28231d]">
              Create folders, write files, keep your chord ideas close.
            </PaperText>
            <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">{currentPath}</PaperText>
          </View>

          <PaperCard mode="outlined" className="rounded-[24px] border border-[#ded0bd] bg-[#fffbf4]">
            <PaperCardContent className="gap-4 p-6">
              <PaperText className="text-lg font-extrabold text-[#28231d]">Use this application on your PC</PaperText>
              <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">
                Choose where this workspace should live conceptually before local file storage is connected.
              </PaperText>
              <View className="flex-row flex-wrap gap-2.5">
                {workspaceLocations.map((location) => {
                  const isSelected = workspaceLocation === location.id;

                  return (
                    <PaperCard
                      key={location.id}
                      onPress={() => setWorkspaceLocation(location.id)}
                      mode="outlined"
                      className={`min-w-[150px] flex-1 rounded-2xl border ${
                        isSelected ? 'border-[#8f5f38] bg-[#ead2bb]' : 'border-[#ded0bd] bg-[#f8f0e4]'
                      }`}>
                      <PaperCardContent className="gap-1 p-4">
                        <PaperText className={`text-[15px] font-extrabold ${isSelected ? 'text-[#674124]' : 'text-[#28231d]'}`}>
                          {location.label}
                        </PaperText>
                        <PaperText className="text-[13px] leading-[18px] text-[#756b5f]">{location.detail}</PaperText>
                      </PaperCardContent>
                    </PaperCard>
                  );
                })}
              </View>

              {workspaceLocation === 'custom' && (
                <PaperTextInput
                  value={customPath}
                  onChangeText={setCustomPath}
                  mode="outlined"
                  outlineColor={workspaceTheme.colors.border}
                  activeOutlineColor={workspaceTheme.colors.accent}
                  outlineStyle={inputOutlineStyle}
                  placeholder="C:/Users/YourName/Documents/SongChord"
                  placeholderTextColor={workspaceTheme.colors.inkSoft}
                  textColor={workspaceTheme.colors.ink}
                  className="-mt-1 min-h-[46px] bg-[#fffdf8] text-[15px]"
                  contentClassName="px-4 text-[15px] text-[#28231d]"
                />
              )}
            </PaperCardContent>
          </PaperCard>

          <PaperCard mode="outlined" className="rounded-[24px] border border-[#ded0bd] bg-[#fffbf4]">
            <PaperCardContent className="gap-4 p-6">
              <PaperText className="text-lg font-extrabold text-[#28231d]">Create in {activeFolder?.name ?? 'workspace root'}</PaperText>
              <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">New folders and files appear in the left tree immediately.</PaperText>
              <View className="flex-row flex-wrap gap-2.5">
                <PaperTextInput
                  value={newItemName}
                  onChangeText={(value) => {
                    setNewItemName(value);
                    setFormError('');
                  }}
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
                  onPress={() => handleCreateItem('folder')}
                  buttonColor={workspaceTheme.colors.accent}
                  textColor={workspaceTheme.colors.panel}
                  className="min-h-12 justify-center rounded-2xl"
                  contentClassName="min-h-12 px-[18px]"
                  labelClassName="text-sm font-extrabold">
                  New folder
                </PaperButton>
                <PaperButton
                  mode="contained-tonal"
                  onPress={() => handleCreateItem('file')}
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

          <PaperCard mode="outlined" className="rounded-[24px] border border-[#c9b89f] bg-[#fffbf4]">
            <PaperCardContent className="gap-4 p-6">
              {selectedItem?.type === 'file' ? (
                <>
                  <PaperText className="text-[22px] font-extrabold text-[#28231d]">{selectedItem.name}</PaperText>
                  <PaperTextInput
                    value={selectedItem.content ?? ''}
                    onChangeText={handleUpdateFileContent}
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
                          onPress={() => handleSelectItem(item)}
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
        </ScrollView>
      </View>
    </View>
  );
}
