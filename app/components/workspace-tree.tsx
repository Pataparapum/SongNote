import { Pressable, StyleSheet, Text, View } from 'react-native';

import { workspaceTheme } from '@/app/UI/theme';
import type { WorkspaceItem } from '@/app/modules/workspace';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

type WorkspaceTreeProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
};

type TreeRowProps = WorkspaceTreeProps & {
  item: WorkspaceItem;
  level: number;
};

export function WorkspaceTree({ items, selectedId, onSelect }: WorkspaceTreeProps) {
  if (items.length === 0) {
    return <Text style={styles.empty}>No folders or files found.</Text>;
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TreeRow key={item.id} item={item} level={0} selectedId={selectedId} onSelect={onSelect} items={items} />
      ))}
    </View>
  );
}

function TreeRow({ item, level, selectedId, onSelect }: TreeRowProps) {
  const isSelected = item.id === selectedId;
  const marker = item.type === 'folder' ? 'Folder' : 'File';

  return (
    <View>
      <Pressable
        onPress={() => onSelect(item)}
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: 12 + level * 18 },
          isSelected && styles.rowSelected,
          pressed && styles.rowPressed,
        ]}>
        <Text style={[styles.marker, isSelected && styles.markerSelected]}>
           
           { 
           marker === 'Folder' ?  (
            <LibraryMusicIcon/>
           ) : (
            <MusicNoteIcon/>
           )
           }

           </Text>
        <Text numberOfLines={1} style={[styles.name, isSelected && styles.nameSelected]}>
          {item.name}
        </Text>
      </Pressable>

      {item.type === 'folder' && item.children?.map((child) => (
        <TreeRow
          key={child.id}
          item={child}
          level={level + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          items={item.children ?? []}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 3,
  },
  empty: {
    color: workspaceTheme.colors.inkSoft,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  marker: {
    color: workspaceTheme.colors.inkSoft,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    width: 48,
  },
  markerSelected: {
    color: workspaceTheme.colors.accentDark,
  },
  name: {
    color: workspaceTheme.colors.inkMuted,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  nameSelected: {
    color: workspaceTheme.colors.ink,
  },
  row: {
    alignItems: 'center',
    borderRadius: workspaceTheme.radius.small,
    flexDirection: 'row',
    gap: 8,
    minHeight: 36,
    paddingRight: 10,
  },
  rowPressed: {
    backgroundColor: workspaceTheme.colors.panelStrong,
  },
  rowSelected: {
    backgroundColor: workspaceTheme.colors.accentSoft,
  },
});
