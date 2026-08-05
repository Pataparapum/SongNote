import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';
import type { WorkspaceItem, WorkspaceItemType } from '@/modules/workspace';

// Inline "new item" row being typed into the tree (VS Code-style), or an existing item's name being
// edited in place — same visual slot, different data underneath.
export type WorkspaceDraft =
  | {
      mode: 'create';
      parentId: string | null;
      type: WorkspaceItemType;
      name: string;
      onChangeName: (value: string) => void;
      onSubmit: () => void;
      onCancel: () => void;
    }
  | {
      mode: 'rename';
      itemId: string;
      name: string;
      onChangeName: (value: string) => void;
      onSubmit: () => void;
      onCancel: () => void;
    };

type WorkspaceListProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
  draft?: WorkspaceDraft | null;
  parentId?: string | null;
  forceExpanded?: boolean;
  onContextMenuRequest?: (item: WorkspaceItem, x: number, y: number) => void;
};

type TreeRowProps = {
  item: WorkspaceItem;
  level: number;
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
  draft?: WorkspaceDraft | null;
  forceExpanded?: boolean;
  onContextMenuRequest?: (item: WorkspaceItem, x: number, y: number) => void;
};

const PaperText = cssInterop(Text, { className: 'style' });
const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

const rowIndent = (level: number) => ({ paddingLeft: 10 + level * 16 });
const rowIndentSpacer = (level: number) => ({ width: 10 + level * 16 });

// Renders the (already filtered) folder/file list, or an empty-state message.
export function WorkspaceList({
  items,
  selectedId,
  onSelect,
  draft,
  parentId = null,
  forceExpanded,
  onContextMenuRequest,
}: WorkspaceListProps) {
  const showDraftHere = draft?.mode === 'create' && draft.parentId === parentId;

  if (items.length === 0 && !showDraftHere) {
    return <PaperText className="px-1 text-sm leading-5 text-[#9d9285]">No folders or files found.</PaperText>;
  }

  return (
    <View className="gap-[2px]">
      {items.map((item) => (
        <TreeRow
          key={item.id}
          item={item}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          draft={draft}
          forceExpanded={forceExpanded}
          onContextMenuRequest={onContextMenuRequest}
        />
      ))}
      {showDraftHere ? <WorkspaceInlineNameInput level={0} draft={draft} iconName="note-add" /> : null}
    </View>
  );
}

// Recursive row: renders itself, then (when expanded) its children and a draft row, indented one level deeper.
// Folders are collapsed by default; pressing a folder row toggles it open/closed.
function TreeRow({ item, level, selectedId, onSelect, draft, forceExpanded, onContextMenuRequest }: TreeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === 'folder';
  const isSelected = item.id === selectedId;
  const iconName = isFolder ? 'library-music' : 'music-note';
  const showDraftInChildren = draft?.mode === 'create' && draft.parentId === item.id;
  const showChildren = isFolder && (forceExpanded || isExpanded || showDraftInChildren);
  const isRenaming = draft?.mode === 'rename' && draft.itemId === item.id;

  function handlePress() {
    onSelect(item);

    if (isFolder) {
      setIsExpanded((current) => !current);
    }
  }

  function handleLongPress(event: { nativeEvent: { pageX: number; pageY: number } }) {
    onSelect(item);
    onContextMenuRequest?.(item, event.nativeEvent.pageX, event.nativeEvent.pageY);
  }

  if (isRenaming) {
    return (
      <WorkspaceInlineNameInput level={level} draft={draft} iconName={iconName} />
    );
  }

  return (
    <View>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        // Web-only prop (not in RN's core types, react-native-web still reads it at runtime): lets the
        // document-level right-click listener in WorkspaceTree find which row was clicked even while
        // the menu is already open (see workspace-tree.tsx for why that's needed).
        {...({ dataSet: { workspaceTreeItem: item.id } } as Record<string, unknown>)}
        className={`min-h-7 flex-row items-center gap-1 rounded-[10px] pr-2.5 ${isSelected ? 'bg-[#ead2bb]' : ''}`}>
        <View style={rowIndentSpacer(level)} />
        <View className="w-3.5 items-center justify-center">
          {isFolder ? (
            <MaterialIcons
              name={showChildren ? 'expand-more' : 'chevron-right'}
              size={14}
              color={workspaceTheme.colors.inkSoft}
            />
          ) : null}
        </View>
        <View className="w-5 items-center justify-center">
          <MaterialIcons
            name={iconName}
            size={16}
            color={isSelected ? workspaceTheme.colors.accentDark : workspaceTheme.colors.inkSoft}
          />
        </View>
        <PaperText numberOfLines={1} className={`flex-1 text-sm font-semibold ${isSelected ? 'text-[#28231d]' : 'text-[#756b5f]'}`}>
          {item.name}
        </PaperText>
      </Pressable>

      {/* Children only render for expanded folders, one indentation level deeper */}
      {showChildren && item.children?.map((child) => (
        <TreeRow
          key={child.id}
          item={child}
          level={level + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          draft={draft}
          forceExpanded={forceExpanded}
          onContextMenuRequest={onContextMenuRequest}
        />
      ))}
      {showChildren && showDraftInChildren ? (
        <WorkspaceInlineNameInput level={level + 1} draft={draft} iconName="note-add" />
      ) : null}
    </View>
  );
}

// Editable row shown while a new folder/file name is being typed, or an existing item is being
// renamed — same icon/indentation as a normal row, just with an autofocused input instead of text.
function WorkspaceInlineNameInput({
  level,
  draft,
  iconName,
}: {
  level: number;
  draft: WorkspaceDraft;
  iconName: 'library-music' | 'note-add' | 'music-note';
}) {
  const resolvedIconName = draft.mode === 'create' ? (draft.type === 'folder' ? 'library-music' : 'note-add') : iconName;
  const placeholder = draft.mode === 'create' ? (draft.type === 'folder' ? 'Folder name' : 'File name') : undefined;

  return (
    <View className="min-h-7 flex-row items-center gap-1 pr-2.5" style={rowIndent(level)}>
      <View className="w-3.5" />
      <View className="w-5 items-center justify-center">
        <MaterialIcons name={resolvedIconName} size={16} color={workspaceTheme.colors.accentDark} />
      </View>
      <PaperTextInput
        value={draft.name}
        onChangeText={draft.onChangeName}
        onSubmitEditing={draft.onSubmit}
        onBlur={draft.onSubmit}
        onKeyPress={(event) => {
          if (event.nativeEvent.key === 'Escape') {
            draft.onCancel();
          }
        }}
        autoFocus
        dense
        mode="outlined"
        outlineColor={workspaceTheme.colors.accent}
        activeOutlineColor={workspaceTheme.colors.accent}
        outlineStyle={{ borderRadius: workspaceTheme.radius.small }}
        placeholder={placeholder}
        placeholderTextColor={workspaceTheme.colors.inkSoft}
        textColor={workspaceTheme.colors.ink}
        textAlign="center"
        // react-native-paper's dense+outlined TextInput reserves ~48px internally for the (unused)
        // floating label area; a shorter box clips that and pins the visible text to the bottom.
        className="h-12 flex-1 bg-[#fffdf8] text-sm"
        contentClassName="px-2 text-center text-sm text-[#28231d]"
      />
    </View>
  );
}
