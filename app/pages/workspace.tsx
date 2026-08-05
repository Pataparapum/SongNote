import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { Text } from 'react-native-paper';

import type { SongEditorMode } from '@/components/song-editor/song-editor-context';
import { SongModeSwitcher } from '@/components/song-editor/song-mode-switcher';
import { WorkspaceTree } from '@/components/tree/workspace-tree';
import type { WorkspaceDraft } from '@/components/tree/workspace-list';
import { DiscardChangesDialog } from '@/components/workspace/discard-changes-dialog';
import { SongMetadataBar } from '@/components/workspace/song-metadata-bar';
import { WorkspaceFileManager } from '@/components/workspace/workspace-file-manager';
import { WorkspaceOverview } from '@/components/workspace/workspace-overview';
import { WorkspaceSaveButton, type SaveState } from '@/components/workspace/workspace-save-button';
import { saveSongToBackend } from '@/modules/backend';
import { createEmptySongContent, createEmptySongMetadata, type SongContent, type SongMetadata } from '@/modules/song-content';
import {
  addItemToFolder,
  createWorkspaceItem,
  findItem,
  findParentFolderId,
  flattenFileSnapshots,
  initialWorkspaceItems,
  removeItem,
  renameItem,
  updateFileContent,
  updateItemMetadata,
  type FileSnapshot,
  type WorkspaceItem,
  type WorkspaceItemType,
} from '@/modules/workspace';
import { loadCachedWorkspace, saveCachedWorkspace } from '@/modules/workspace-cache';

const PaperText = cssInterop(Text, { className: 'style' });

type DraftState =
  | { mode: 'create'; parentId: string | null; type: WorkspaceItemType; name: string }
  | { mode: 'rename'; itemId: string; name: string };

export default function WorkspacePage() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= 880;
  const [items, setItems] = useState(initialWorkspaceItems);
  const [selectedId, setSelectedId] = useState<string | null>('file-first-draft');
  const [activeFolderId, setActiveFolderId] = useState<string | null>('folder-pruebas');
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [songMode, setSongMode] = useState<SongEditorMode>('write');
  const [transposeSemitones, setTransposeSemitones] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  // "Guardar" is per song (its lyrics/chords + metadata), not the whole tree — so both of these are
  // keyed by file id instead of being a single workspace-wide flag/snapshot.
  const [dirtyFileIds, setDirtyFileIds] = useState<Set<string>>(new Set());
  const [lastSavedByFileId, setLastSavedByFileId] = useState<Record<string, FileSnapshot>>(() =>
    flattenFileSnapshots(initialWorkspaceItems),
  );
  const [pendingReadModeConfirm, setPendingReadModeConfirm] = useState(false);

  const selectedItem = findItem(items, selectedId);
  const activeFolder = findItem(items, activeFolderId);
  const activeFolderItems = activeFolder?.type === 'folder' ? activeFolder.children ?? [] : items;
  const overviewTitle = selectedItem?.type === 'file' ? selectedItem.name : activeFolder?.name ?? 'Workspace root';
  const draft: WorkspaceDraft | null = draftState
    ? {
        ...draftState,
        onChangeName: handleChangeDraftName,
        onSubmit: handleSubmitDraft,
        onCancel: handleCancelDraft,
      }
    : null;

  // Restore whatever autosave left behind so a reload doesn't lose work that was never manually saved.
  useEffect(() => {
    let isMounted = true;

    loadCachedWorkspace().then((cached) => {
      if (!isMounted || !cached) {
        return;
      }

      setItems(cached);
      setLastSavedByFileId(flattenFileSnapshots(cached));
      setSelectedId((current) => (findItem(cached, current) ? current : (cached[0]?.id ?? null)));
      setActiveFolderId((current) => (findItem(cached, current) ? current : (cached[0]?.id ?? null)));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // A transpose offset and an editor mode only make sense for the song currently open.
  useEffect(() => {
    setTransposeSemitones(0);
    setSongMode('write');
  }, [selectedId]);

  const isCurrentFileDirty = selectedItem?.type === 'file' && dirtyFileIds.has(selectedItem.id);
  // Not in Leer: that mode always shows the last saved version (see the discard-on-read-mode guard
  // below), so there's never anything pending to save while looking at it.
  const showSaveControls = selectedItem?.type === 'file' && (songMode === 'write' || songMode === 'chords');

  function markFileDirty(fileId: string) {
    setDirtyFileIds((current) => (current.has(fileId) ? current : new Set(current).add(fileId)));
  }

  function clearFileDirty(fileId: string) {
    setDirtyFileIds((current) => {
      if (!current.has(fileId)) {
        return current;
      }

      const next = new Set(current);

      next.delete(fileId);

      return next;
    });
  }

  function handleSelectItem(item: WorkspaceItem) {
    setSelectedId(item.id);

    if (item.type === 'folder') {
      setActiveFolderId(item.id);
      return;
    }

    setActiveFolderId(findParentFolderId(items, item.id));
  }

  function handleStartCreate(type: WorkspaceItemType) {
    setDraftState({ mode: 'create', type, parentId: activeFolderId, name: '' });
  }

  function handleStartRename(item: WorkspaceItem) {
    setDraftState({ mode: 'rename', itemId: item.id, name: item.name });
  }

  function handleChangeDraftName(name: string) {
    setDraftState((current) => (current ? { ...current, name } : current));
  }

  function handleCancelDraft() {
    setDraftState(null);
  }

  function handleSubmitDraft() {
    if (!draftState) {
      return;
    }

    const trimmedName = draftState.name.trim();

    if (!trimmedName) {
      handleCancelDraft();
      return;
    }

    // Creating/renaming is a deliberate, discrete action (not a keystroke), so — like a metadata
    // change — it caches right away instead of waiting for the mode-change/line-break autosave
    // triggers below, which only cover edits happening *inside* the open song.
    if (draftState.mode === 'create') {
      const newItem = createWorkspaceItem(draftState.type, trimmedName);

      setItems((currentItems) => {
        const nextItems = addItemToFolder(currentItems, draftState.parentId, newItem);

        saveCachedWorkspace(nextItems);

        return nextItems;
      });
      setSelectedId(newItem.id);
      setActiveFolderId(draftState.type === 'folder' ? newItem.id : draftState.parentId);
    } else {
      setItems((currentItems) => {
        const nextItems = renameItem(currentItems, draftState.itemId, trimmedName);

        saveCachedWorkspace(nextItems);

        return nextItems;
      });
    }

    handleCancelDraft();
  }

  function handleDeleteItem(item: WorkspaceItem) {
    // Computed before removal — once the item is gone, its parent can't be looked up anymore.
    const parentId = findParentFolderId(items, item.id);

    setItems((currentItems) => {
      const nextItems = removeItem(currentItems, item.id);

      saveCachedWorkspace(nextItems);

      return nextItems;
    });

    if (item.id === selectedId) {
      setSelectedId(parentId);
    }

    if (item.id === activeFolderId) {
      setActiveFolderId(parentId);
    }
  }

  function handleUpdateFileContent(content: SongContent) {
    if (!selectedItem || selectedItem.type !== 'file') {
      return;
    }

    setItems((currentItems) => updateFileContent(currentItems, selectedItem.id, content));
    markFileDirty(selectedItem.id);
  }

  function handleChangeMetadata(metadata: SongMetadata) {
    if (!selectedItem || selectedItem.type !== 'file') {
      return;
    }

    // A metadata change is a deliberate action (not a keystroke), so it caches right away —
    // same reasoning as the mode-change/line-break autosave triggers below.
    setItems((currentItems) => {
      const nextItems = updateItemMetadata(currentItems, selectedItem.id, metadata);

      saveCachedWorkspace(nextItems);

      return nextItems;
    });
    markFileDirty(selectedItem.id);
  }

  function handleAutosaveTrigger() {
    setItems((currentItems) => {
      saveCachedWorkspace(currentItems);
      return currentItems;
    });
  }

  async function handleManualSave() {
    if (!selectedItem || selectedItem.type !== 'file') {
      return;
    }

    setSaveState('saving');
    await saveSongToBackend(selectedItem);
    setLastSavedByFileId((current) => ({
      ...current,
      [selectedItem.id]: {
        content: selectedItem.content ?? createEmptySongContent(),
        metadata: selectedItem.metadata ?? createEmptySongMetadata(),
      },
    }));
    clearFileDirty(selectedItem.id);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 1500);
  }

  function handleChangeSongMode(nextMode: SongEditorMode) {
    // Leer always shows the last saved version of *this* song, never an in-progress draft — but
    // discarding a draft is destructive, so this asks first instead of doing it silently.
    if (nextMode === 'read' && isCurrentFileDirty) {
      setPendingReadModeConfirm(true);
      return;
    }

    setSongMode(nextMode);
  }

  function handleConfirmDiscardAndRead() {
    if (selectedItem && selectedItem.type === 'file') {
      const saved = lastSavedByFileId[selectedItem.id] ?? {
        content: createEmptySongContent(),
        metadata: createEmptySongMetadata(),
      };

      setItems((currentItems) => {
        const nextItems = updateItemMetadata(
          updateFileContent(currentItems, selectedItem.id, saved.content),
          selectedItem.id,
          saved.metadata,
        );

        saveCachedWorkspace(nextItems);

        return nextItems;
      });
      clearFileDirty(selectedItem.id);
    }

    setSongMode('read');
    setPendingReadModeConfirm(false);
  }

  function handleCancelReadMode() {
    setPendingReadModeConfirm(false);
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
            onStartRename={handleStartRename}
            onDeleteItem={handleDeleteItem}
          />
        </View>

        <ScrollView className="flex-1" contentContainerClassName="gap-6 p-[34px]">
          {/* Section 1: page heading + save-this-song button (only while looking at a song in Escribir/Acordes) */}
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <WorkspaceOverview title={overviewTitle} />
            </View>
            {showSaveControls ? (
              <WorkspaceSaveButton saveState={saveState} hasUnsavedChanges={isCurrentFileDirty} onPress={handleManualSave} />
            ) : null}
          </View>

          {/* Optional per-song facts: key, scale, session-only transpose, and the mode switcher */}
          {selectedItem?.type === 'file' ? (
            <View className="gap-4">
              <SongMetadataBar
                metadata={selectedItem.metadata ?? createEmptySongMetadata()}
                onChangeMetadata={handleChangeMetadata}
                transposeSemitones={transposeSemitones}
                onChangeTranspose={setTransposeSemitones}
              />
              <SongModeSwitcher mode={songMode} onChangeMode={handleChangeSongMode} />
            </View>
          ) : null}

          <View className="h-px bg-[#ded0bd]" />

          {/* Section 2: edit/browse the active selection */}
          <WorkspaceFileManager
            selectedItem={selectedItem}
            activeFolderItems={activeFolderItems}
            onSelectItem={handleSelectItem}
            onChangeFileContent={handleUpdateFileContent}
            mode={songMode}
            onChangeMode={handleChangeSongMode}
            transposeSemitones={transposeSemitones}
            onAutosaveTrigger={handleAutosaveTrigger}
          />
        </ScrollView>
      </View>

      <DiscardChangesDialog
        visible={pendingReadModeConfirm}
        onConfirm={handleConfirmDiscardAndRead}
        onCancel={handleCancelReadMode}
      />
    </View>
  );
}
