import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';
import type { WorkspaceItem, WorkspaceItemType } from '@/modules/workspace';

// Inline "new item" row being typed into the tree, VS Code-style.
export type WorkspaceDraft = {
  parentId: string | null;
  type: WorkspaceItemType;
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
};

type TreeRowProps = {
  item: WorkspaceItem;
  level: number;
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
  draft?: WorkspaceDraft | null;
  forceExpanded?: boolean;
};

const PaperText = cssInterop(Text, { className: 'style' });
const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

const rowIndent = (level: number) => ({ paddingLeft: 10 + level * 16 });
const rowIndentSpacer = (level: number) => ({ width: 10 + level * 16 });

// Renders the (already filtered) folder/file list, or an empty-state message.
export function WorkspaceList({ items, selectedId, onSelect, draft, parentId = null, forceExpanded }: WorkspaceListProps) {
  const showDraftHere = draft?.parentId === parentId;

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
        />
      ))}
      {showDraftHere ? <WorkspaceDraftRow level={0} draft={draft} /> : null}
    </View>
  );
}

// Recursive row: renders itself, then (when expanded) its children and a draft row, indented one level deeper.
// Folders are collapsed by default; pressing a folder row toggles it open/closed.
function TreeRow({ item, level, selectedId, onSelect, draft, forceExpanded }: TreeRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = item.type === 'folder';
  const isSelected = item.id === selectedId;
  const iconName = isFolder ? 'library-music' : 'music-note';
  const showDraftInChildren = isFolder && draft?.parentId === item.id;
  const showChildren = isFolder && (forceExpanded || isExpanded || showDraftInChildren);

  function handlePress() {
    onSelect(item);

    if (isFolder) {
      setIsExpanded((current) => !current);
    }
  }

  return (
    <View>
      <Pressable
        onPress={handlePress}
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
        />
      ))}
      {showChildren && showDraftInChildren ? <WorkspaceDraftRow level={level + 1} draft={draft} /> : null}
    </View>
  );
}

// Editable row shown while a new folder/file name is being typed, matching the tree row's icon and indentation.
function WorkspaceDraftRow({ level, draft }: { level: number; draft: WorkspaceDraft }) {
  const iconName = draft.type === 'folder' ? 'library-music' : 'music-note';

  return (
    <View className="min-h-7 flex-row items-center gap-1 pr-2.5" style={rowIndent(level)}>
      <View className="w-3.5" />
      <View className="w-5 items-center justify-center">
        <MaterialIcons name={iconName} size={16} color={workspaceTheme.colors.accentDark} />
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
        placeholder={draft.type === 'folder' ? 'Folder name' : 'File name'}
        placeholderTextColor={workspaceTheme.colors.inkSoft}
        textColor={workspaceTheme.colors.ink}
        className="h-8 flex-1 bg-[#fffdf8] text-sm"
        contentClassName="px-2 text-sm text-[#28231d]"
      />
    </View>
  );
}
