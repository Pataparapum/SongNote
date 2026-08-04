import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';

import { WorkspaceTree } from '@/components/tree/workspace-tree';
import type { WorkspaceDraft } from '@/components/tree/workspace-list';
import { WorkspaceFileManager } from '@/components/workspace/workspace-file-manager';
import { WorkspaceOverview } from '@/components/workspace/workspace-overview';
import type { SongContent } from '@/modules/song-content';
import {
  addItemToFolder,
  createWorkspaceItem,
  findItem,
  findParentFolderId,
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
  const [selectedId, setSelectedId] = useState<string | null>('folder-pruebas');
  const [activeFolderId, setActiveFolderId] = useState<string | null>('folder-pruebas');
  const [draftType, setDraftType] = useState<WorkspaceItemType | null>(null);
  const [draftParentId, setDraftParentId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  const selectedItem = findItem(items, selectedId);
  const activeFolder = findItem(items, activeFolderId);
  const activeFolderItems = activeFolder?.type === 'folder' ? activeFolder.children ?? [] : items;
  const overviewTitle = selectedItem?.type === 'file' ? selectedItem.name : activeFolder?.name ?? 'Workspace root';
  const draft: WorkspaceDraft | null = draftType
    ? {
        parentId: draftParentId,
        type: draftType,
        name: draftName,
        onChangeName: setDraftName,
        onSubmit: handleSubmitDraft,
        onCancel: handleCancelDraft,
      }
    : null;

  function handleSelectItem(item: WorkspaceItem) {
    setSelectedId(item.id);

    if (item.type === 'folder') {
      setActiveFolderId(item.id);
      return;
    }

    setActiveFolderId(findParentFolderId(items, item.id));
  }

  function handleStartCreate(type: WorkspaceItemType) {
    setDraftType(type);
    setDraftParentId(activeFolderId);
    setDraftName('');
  }

  function handleCancelDraft() {
    setDraftType(null);
    setDraftParentId(null);
    setDraftName('');
  }

  function handleSubmitDraft() {
    const trimmedName = draftName.trim();

    if (!draftType || !trimmedName) {
      handleCancelDraft();
      return;
    }

    const newItem = createWorkspaceItem(draftType, trimmedName);

    setItems((currentItems) => addItemToFolder(currentItems, draftParentId, newItem));
    setSelectedId(newItem.id);
    setActiveFolderId(draftType === 'folder' ? newItem.id : draftParentId);
    handleCancelDraft();
  }

  function handleUpdateFileContent(content: SongContent) {
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
              ? 'w-[230px] max-w-[250px] border-r border-[#ded0bd]'
              : 'w-full max-w-full border-b border-[#ded0bd]'
          }`}>
          <PaperText className="text-xs font-extrabold uppercase tracking-[1.4px] text-[#8f5f38]">SongChord</PaperText>
          <PaperText className="text-[26px] font-black tracking-[-0.4px] text-[#28231d]">Workspace</PaperText>

          <WorkspaceTree
            items={items}
            selectedId={selectedId}
            onSelect={handleSelectItem}
            draft={draft}
            onStartCreate={handleStartCreate}
          />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-6 p-[34px]">
          {/* Section 1: page heading */}
          <WorkspaceOverview title={overviewTitle} />

          <View className="h-px bg-[#ded0bd]" />

          {/* Section 2: edit/browse the active selection */}
          <WorkspaceFileManager
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
