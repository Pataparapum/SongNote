import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';

import { WorkspaceTree } from '@/components/tree/workspace-tree';
import { WorkspaceFileManager } from '@/components/workspace/workspace-file-manager';
import { WorkspaceOverview } from '@/components/workspace/workspace-overview';
import {
  addItemToFolder,
  createWorkspaceItem,
  findItem,
  findParentFolderId,
  getItemPath,
  initialWorkspaceItems,
  updateFileContent,
  type WorkspaceItem,
  type WorkspaceItemType,
} from '@/modules/workspace';

const PaperText = cssInterop(Text, { className: 'style' });

export default function WorkspacePage() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 880;
  const [items, setItems] = useState(initialWorkspaceItems);
  const [selectedId, setSelectedId] = useState<string | null>('folder-songs');
  const [activeFolderId, setActiveFolderId] = useState<string | null>('folder-songs');
  const [newItemName, setNewItemName] = useState('');
  const [formError, setFormError] = useState('');
  const [workspaceLocation, setWorkspaceLocation] = useState('documents');
  const [customPath, setCustomPath] = useState('C:/Users/YourName/Documents/SongChord');

  const selectedItem = findItem(items, selectedId);
  const activeFolder = findItem(items, activeFolderId);
  const activeFolderItems = activeFolder?.type === 'folder' ? activeFolder.children ?? [] : items;
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

  function handleChangeNewItemName(value: string) {
    setNewItemName(value);
    setFormError('');
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
        {/* Sidebar: workspace title, search filter and the navigable folder/file tree */}
        <View
          className={`gap-4 bg-[#f8f0e4] p-6 ${
            isWideLayout
              ? 'w-[310px] max-w-[340px] border-r border-[#ded0bd]'
              : 'w-full max-w-full border-b border-[#ded0bd]'
          }`}>
          <PaperText className="text-xs font-extrabold uppercase tracking-[1.4px] text-[#8f5f38]">SongChord</PaperText>
          <PaperText className="text-[26px] font-black tracking-[-0.4px] text-[#28231d]">Workspace</PaperText>

          <WorkspaceTree items={items} selectedId={selectedId} onSelect={handleSelectItem} />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-6 p-[34px]">
          {/* Section 1: page heading and the conceptual storage location picker */}
          <WorkspaceOverview
            currentPath={currentPath}
            workspaceLocation={workspaceLocation}
            onSelectWorkspaceLocation={setWorkspaceLocation}
            customPath={customPath}
            onChangeCustomPath={setCustomPath}
          />

          {/* Section 2: create new items, and edit/browse the active selection */}
          <WorkspaceFileManager
            activeFolderName={activeFolder?.name ?? 'workspace root'}
            newItemName={newItemName}
            onChangeNewItemName={handleChangeNewItemName}
            formError={formError}
            onCreateItem={handleCreateItem}
            selectedItem={selectedItem}
            activeFolderItems={activeFolderItems}
            onSelectItem={handleSelectItem}
            onChangeFileContent={handleUpdateFileContent}
          />
        </ScrollView>
      </View>
    </View>
  );
}
