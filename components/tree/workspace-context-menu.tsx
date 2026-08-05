import { View } from 'react-native';
import { Menu } from 'react-native-paper';

import type { WorkspaceItem, WorkspaceItemType } from '@/modules/workspace';

export type ContextMenuTarget = { kind: 'item'; item: WorkspaceItem } | { kind: 'empty' };

export type ContextMenuState = { target: ContextMenuTarget; x: number; y: number } | null;

type WorkspaceContextMenuProps = {
  state: ContextMenuState;
  deleteConfirmId: string | null;
  onDismiss: () => void;
  onCreate: (type: WorkspaceItemType) => void;
  onRename: (item: WorkspaceItem) => void;
  onDelete: (item: WorkspaceItem) => void;
};

// Right-click (web) / long-press (mobile) menu for the tree: what it offers depends on whether the
// target is a folder, a file, or empty space below the list.
export function WorkspaceContextMenu({
  state,
  deleteConfirmId,
  onDismiss,
  onCreate,
  onRename,
  onDelete,
}: WorkspaceContextMenuProps) {
  const target = state?.target;
  const item = target?.kind === 'item' ? target.item : null;
  const isFolder = item?.type === 'folder';
  const hasChildren = isFolder && (item.children?.length ?? 0) > 0;
  const needsDeleteConfirm = item ? hasChildren && deleteConfirmId === item.id : false;
  // react-native-paper's Menu only measures its anchor position once, when it first becomes visible —
  // changing the anchor while it's already open does not move it. Keying it off the target/position
  // forces React to remount a fresh Menu (which does measure) instead of reusing the stuck one.
  const menuKey = state ? `${target?.kind}-${item?.id ?? 'empty'}-${state.x}-${state.y}` : 'closed';

  return (
    <Menu key={menuKey} visible={Boolean(state)} onDismiss={onDismiss} anchor={{ x: state?.x ?? 0, y: state?.y ?? 0 }}>
      {/* Marked so the tree's right-click handler can tell "you clicked the open menu" apart from
          "you clicked a row underneath it" — the invisible dismiss backdrop sits between them. */}
      <View {...({ dataSet: { workspaceContextMenuContent: 'true' } } as Record<string, unknown>)}>
        {(!item || isFolder) && <Menu.Item title="Crear carpeta" onPress={() => onCreate('folder')} />}
        {(!item || isFolder) && <Menu.Item title="Crear canción" onPress={() => onCreate('file')} />}
        {item && <Menu.Item title="Renombrar" onPress={() => onRename(item)} />}
        {item && (
          <Menu.Item
            title={needsDeleteConfirm ? '¿Eliminar carpeta y contenido? Toca de nuevo' : 'Eliminar'}
            onPress={() => onDelete(item)}
          />
        )}
      </View>
    </Menu>
  );
}
