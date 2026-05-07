import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { cssInterop } from 'nativewind';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';
import type { WorkspaceItem } from '@/modules/workspace';

type WorkspaceTreeProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
};

type TreeRowProps = WorkspaceTreeProps & {
  item: WorkspaceItem;
  level: number;
};

const PaperText = cssInterop(Text, { className: 'style' });

export function WorkspaceTree({ items, selectedId, onSelect }: WorkspaceTreeProps) {
  if (items.length === 0) {
    return <PaperText className="px-1 text-sm leading-5 text-[#9d9285]">No folders or files found.</PaperText>;
  }

  return (
    <View className="gap-[3px]">
      {items.map((item) => (
        <TreeRow key={item.id} item={item} level={0} selectedId={selectedId} onSelect={onSelect} items={items} />
      ))}
    </View>
  );
}

function TreeRow({ item, level, selectedId, onSelect }: TreeRowProps) {
  const isSelected = item.id === selectedId;
  const iconName = item.type === 'folder' ? 'library-music' : 'music-note';

  return (
    <View>
      <Pressable
        onPress={() => onSelect(item)}
        className={`min-h-9 flex-row items-center gap-2 rounded-[10px] pr-2.5 ${isSelected ? 'bg-[#ead2bb]' : ''}`}
        style={({ pressed }) => [
          { paddingLeft: 12 + level * 18 },
          pressed && { backgroundColor: workspaceTheme.colors.panelStrong },
        ]}>
        <View className="w-12 justify-center">
          <MaterialIcons
            name={iconName}
            size={20}
            color={isSelected ? workspaceTheme.colors.accentDark : workspaceTheme.colors.inkSoft}
          />
        </View>
        <PaperText numberOfLines={1} className={`flex-1 text-sm font-semibold ${isSelected ? 'text-[#28231d]' : 'text-[#756b5f]'}`}>
          {item.name}
        </PaperText>
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
