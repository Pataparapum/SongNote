import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { WorkspaceTree } from '@/app/components/workspace-tree';
import { workspaceTheme } from '@/app/UI/theme';
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
} from '@/app/modules/workspace';

const workspaceLocations = [
  { id: 'desktop', label: 'Desktop', detail: 'Fast access on this PC' },
  { id: 'documents', label: 'Documents', detail: 'Best for organized notes' },
  { id: 'custom', label: 'Custom path', detail: 'Type your own folder path' },
];

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
    <View style={styles.screen}>
      <View style={[styles.shell, !isWideLayout && styles.shellStacked]}>
        <View style={[styles.sidebar, !isWideLayout && styles.sidebarStacked]}>
          <Text style={styles.appLabel}>SongChord</Text>
          <Text style={styles.sidebarTitle}>Workspace</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search folder or file"
            placeholderTextColor={workspaceTheme.colors.inkSoft}
            style={styles.input}
          />

          <ScrollView contentContainerStyle={styles.treeScroll}>
            <WorkspaceTree items={filteredItems} selectedId={selectedId} onSelect={handleSelectItem} />
          </ScrollView>
        </View>

        <ScrollView style={styles.main} contentContainerStyle={styles.mainContent}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Minimal song notes</Text>
            <Text style={styles.title}>Create folders, write files, keep your chord ideas close.</Text>
            <Text style={styles.subtitle}>{currentPath}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Use this application on your PC</Text>
            <Text style={styles.sectionText}>Choose where this workspace should live conceptually before local file storage is connected.</Text>
            <View style={styles.locationGrid}>
              {workspaceLocations.map((location) => {
                const isSelected = workspaceLocation === location.id;

                return (
                  <Pressable
                    key={location.id}
                    onPress={() => setWorkspaceLocation(location.id)}
                    style={({ pressed }) => [
                      styles.locationCard,
                      isSelected && styles.locationCardSelected,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.locationTitle, isSelected && styles.locationTitleSelected]}>{location.label}</Text>
                    <Text style={styles.locationDetail}>{location.detail}</Text>
                  </Pressable>
                );
              })}
            </View>

            {workspaceLocation === 'custom' && (
              <TextInput
                value={customPath}
                onChangeText={setCustomPath}
                placeholder="C:/Users/YourName/Documents/SongChord"
                placeholderTextColor={workspaceTheme.colors.inkSoft}
                style={[styles.input, styles.pathInput]}
              />
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Create in {activeFolder?.name ?? 'workspace root'}</Text>
            <Text style={styles.sectionText}>New folders and files appear in the left tree immediately.</Text>
            <View style={styles.createRow}>
              <TextInput
                value={newItemName}
                onChangeText={(value) => {
                  setNewItemName(value);
                  setFormError('');
                }}
                placeholder="Folder or file name"
                placeholderTextColor={workspaceTheme.colors.inkSoft}
                style={[styles.input, styles.createInput]}
              />
              <Pressable onPress={() => handleCreateItem('folder')} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
                <Text style={styles.buttonText}>New folder</Text>
              </Pressable>
              <Pressable onPress={() => handleCreateItem('file')} style={({ pressed }) => [styles.buttonSecondary, pressed && styles.pressed]}>
                <Text style={styles.buttonSecondaryText}>New file</Text>
              </Pressable>
            </View>
            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          </View>

          <View style={styles.editorCard}>
            {selectedItem?.type === 'file' ? (
              <>
                <Text style={styles.editorTitle}>{selectedItem.name}</Text>
                <TextInput
                  value={selectedItem.content ?? ''}
                  onChangeText={handleUpdateFileContent}
                  placeholder="Write lyrics, chords, notes, or reminders here..."
                  placeholderTextColor={workspaceTheme.colors.inkSoft}
                  multiline
                  textAlignVertical="top"
                  style={styles.editor}
                />
              </>
            ) : (
              <>
                <Text style={styles.editorTitle}>{selectedItem?.name ?? 'Workspace root'}</Text>
                <Text style={styles.sectionText}>Open a file to edit it, or enter a folder from this list.</Text>
                <View style={styles.folderList}>
                  {activeFolderItems.length > 0 ? (
                    activeFolderItems.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => handleSelectItem(item)}
                        style={({ pressed }) => [styles.folderListItem, pressed && styles.pressed]}>
                        <Text style={styles.folderListType}>{item.type}</Text>
                        <Text style={styles.folderListName}>{item.name}</Text>
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.emptyState}>This folder is empty. Create a folder or file above.</Text>
                  )}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appLabel: {
    color: workspaceTheme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  button: {
    alignItems: 'center',
    backgroundColor: workspaceTheme.colors.accent,
    borderRadius: workspaceTheme.radius.medium,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonSecondary: {
    alignItems: 'center',
    backgroundColor: workspaceTheme.colors.accentSoft,
    borderRadius: workspaceTheme.radius.medium,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  buttonSecondaryText: {
    color: workspaceTheme.colors.accentDark,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonText: {
    color: workspaceTheme.colors.panel,
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    backgroundColor: workspaceTheme.colors.panel,
    borderColor: workspaceTheme.colors.border,
    borderRadius: workspaceTheme.radius.large,
    borderWidth: 1,
    gap: workspaceTheme.spacing.md,
    padding: workspaceTheme.spacing.lg,
  },
  createInput: {
    flex: 1,
    minWidth: 220,
  },
  createRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: workspaceTheme.spacing.sm,
  },
  editor: {
    backgroundColor: workspaceTheme.colors.input,
    borderColor: workspaceTheme.colors.border,
    borderRadius: workspaceTheme.radius.medium,
    borderWidth: 1,
    color: workspaceTheme.colors.ink,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 320,
    padding: workspaceTheme.spacing.md,
  },
  editorCard: {
    backgroundColor: workspaceTheme.colors.panel,
    borderColor: workspaceTheme.colors.borderStrong,
    borderRadius: workspaceTheme.radius.large,
    borderWidth: 1,
    gap: workspaceTheme.spacing.md,
    padding: workspaceTheme.spacing.lg,
  },
  editorTitle: {
    color: workspaceTheme.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  emptyState: {
    color: workspaceTheme.colors.inkSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    color: workspaceTheme.colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  folderList: {
    gap: workspaceTheme.spacing.sm,
  },
  folderListItem: {
    alignItems: 'center',
    backgroundColor: workspaceTheme.colors.panelMuted,
    borderColor: workspaceTheme.colors.border,
    borderRadius: workspaceTheme.radius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    gap: workspaceTheme.spacing.sm,
    minHeight: 54,
    paddingHorizontal: workspaceTheme.spacing.md,
  },
  folderListName: {
    color: workspaceTheme.colors.ink,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  folderListType: {
    color: workspaceTheme.colors.inkSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    width: 54,
  },
  hero: {
    gap: workspaceTheme.spacing.sm,
  },
  input: {
    backgroundColor: workspaceTheme.colors.input,
    borderColor: workspaceTheme.colors.border,
    borderRadius: workspaceTheme.radius.medium,
    borderWidth: 1,
    color: workspaceTheme.colors.ink,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: workspaceTheme.spacing.md,
  },
  kicker: {
    color: workspaceTheme.colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  locationCard: {
    backgroundColor: workspaceTheme.colors.panelMuted,
    borderColor: workspaceTheme.colors.border,
    borderRadius: workspaceTheme.radius.medium,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 150,
    padding: workspaceTheme.spacing.md,
  },
  locationCardSelected: {
    backgroundColor: workspaceTheme.colors.accentSoft,
    borderColor: workspaceTheme.colors.accent,
  },
  locationDetail: {
    color: workspaceTheme.colors.inkMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: workspaceTheme.spacing.sm,
  },
  locationTitle: {
    color: workspaceTheme.colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  locationTitleSelected: {
    color: workspaceTheme.colors.accentDark,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    gap: workspaceTheme.spacing.lg,
    padding: workspaceTheme.spacing.xl,
  },
  pathInput: {
    marginTop: -4,
  },
  pressed: {
    opacity: 0.76,
  },
  screen: {
    backgroundColor: workspaceTheme.colors.appBackground,
    flex: 1,
  },
  sectionText: {
    color: workspaceTheme.colors.inkMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: workspaceTheme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  shell: {
    flex: 1,
    flexDirection: 'row',
  },
  shellStacked: {
    flexDirection: 'column',
  },
  sidebar: {
    backgroundColor: workspaceTheme.colors.panelMuted,
    borderRightColor: workspaceTheme.colors.border,
    borderRightWidth: 1,
    gap: workspaceTheme.spacing.md,
    maxWidth: 340,
    padding: workspaceTheme.spacing.lg,
    width: 310,
  },
  sidebarStacked: {
    borderBottomColor: workspaceTheme.colors.border,
    borderBottomWidth: 1,
    borderRightWidth: 0,
    maxWidth: '100%',
    width: '100%',
  },
  sidebarTitle: {
    color: workspaceTheme.colors.ink,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: workspaceTheme.colors.inkMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: workspaceTheme.colors.ink,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1.2,
    lineHeight: 44,
    maxWidth: 760,
  },
  treeScroll: {
    paddingBottom: workspaceTheme.spacing.lg,
  },
});
