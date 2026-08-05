import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import {
  WorkspaceContextMenu,
  type ContextMenuState,
  type ContextMenuTarget,
} from '@/components/tree/workspace-context-menu';
import { WorkspaceCreateBar } from '@/components/tree/workspace-create-bar';
import { WorkspaceFilters } from '@/components/tree/workspace-filters';
import { WorkspaceList, type WorkspaceDraft } from '@/components/tree/workspace-list';
import { filterItems, findItem, type WorkspaceItem, type WorkspaceItemType } from '@/modules/workspace';

type WorkspaceTreeProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
  draft: WorkspaceDraft | null;
  onStartCreate: (type: WorkspaceItemType) => void;
  onStartRename: (item: WorkspaceItem) => void;
  onDeleteItem: (item: WorkspaceItem) => void;
};

// Container that owns the search state, the context-menu state and composes the search box, the
// create actions and the filtered tree list.
export function WorkspaceTree({
  items,
  selectedId,
  onSelect,
  draft,
  onStartCreate,
  onStartRename,
  onDeleteItem,
}: WorkspaceTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuState, setMenuState] = useState<ContextMenuState>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  // Web only: the actual DOM node behind the scrollable tree area, used to scope and re-target
  // right-clicks (see the effect below for why a plain per-row onContextMenu isn't enough).
  const treeAreaRef = useRef<unknown>(null);
  const filteredItems = filterItems(items, searchQuery);

  function handleStartCreate(type: WorkspaceItemType) {
    // Clear the filter so the new inline row (typed elsewhere in the tree) is always visible.
    setSearchQuery('');
    onStartCreate(type);
  }

  function openMenu(target: ContextMenuTarget, x: number, y: number) {
    setMenuState({ target, x, y });
  }

  function closeMenu() {
    setMenuState(null);
    setDeleteConfirmId(null);
  }

  function handleMenuCreate(type: WorkspaceItemType) {
    closeMenu();
    handleStartCreate(type);
  }

  function handleMenuRename(item: WorkspaceItem) {
    closeMenu();
    onStartRename(item);
  }

  function handleMenuDelete(item: WorkspaceItem) {
    const hasChildren = item.type === 'folder' && (item.children?.length ?? 0) > 0;

    // Deleting a folder with contents is irreversible (no trash, no undo), so it takes a second tap.
    if (hasChildren && deleteConfirmId !== item.id) {
      setDeleteConfirmId(item.id);
      return;
    }

    closeMenu();
    onDeleteItem(item);
  }

  function handleEmptySpaceLongPress(event: { nativeEvent: { pageX: number; pageY: number } }) {
    openMenu({ kind: 'empty' }, event.nativeEvent.pageX, event.nativeEvent.pageY);
  }

  // When the menu is already open, react-native-paper renders a full-screen backdrop (via Portal) to
  // dismiss it on outside taps. That backdrop sits on top of the tree in the DOM and becomes the real
  // `event.target` for a second right-click, so DOM-tree checks (`.contains`, `.closest`) against the
  // target miss every time — the backdrop isn't a descendant of our tree container or of any row, so
  // those checks silently bail out and the browser's own menu shows through instead. The fix is to stop
  // asking "what DID this event hit" and instead ask geometry: is (x, y) inside the tree area, and what
  // row sits at (x, y) once the (invisible) backdrop is looked past.
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    function handleGlobalContextMenu(event: MouseEvent) {
      // The open menu can render outside the tree's own bounds (it's a full-viewport Portal), and it
      // visually sits on top of whatever row it was opened from — right-clicking the menu itself would
      // otherwise "see through" to that row via elementsFromPoint below and re-select/reposition onto
      // it. Bail out before any of that if the click actually landed on the menu's own content.
      const topElement = document.elementFromPoint(event.clientX, event.clientY);
      const isOnMenuContent =
        topElement instanceof HTMLElement && topElement.closest('[data-workspace-context-menu-content]');

      if (isOnMenuContent) {
        event.preventDefault();
        return;
      }

      const container = treeAreaRef.current as HTMLElement | null;

      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const isInsideTreeArea =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      if (!isInsideTreeArea) {
        return;
      }

      event.preventDefault();

      const elementsAtPoint =
        typeof document.elementsFromPoint === 'function'
          ? document.elementsFromPoint(event.clientX, event.clientY)
          : [document.elementFromPoint(event.clientX, event.clientY)].filter((el): el is Element => el !== null);
      const itemElement = elementsAtPoint.find(
        (el): el is HTMLElement => el instanceof HTMLElement && el.hasAttribute('data-workspace-tree-item'),
      );
      const itemId = itemElement?.getAttribute('data-workspace-tree-item');
      const item = itemId ? findItem(items, itemId) : null;
      const target: ContextMenuTarget = item ? { kind: 'item', item } : { kind: 'empty' };

      if (item) {
        onSelect(item);
      }

      // Just update the target/position directly — no close-then-reopen. react-native-paper's Menu
      // runs a close animation; toggling visible=false and back to true within the same frame cut
      // that animation off mid-flight and left its backdrop stuck covering the screen, eating every
      // click until a reload. Updating the state in place while `visible` stays true avoids that.
      setMenuState({ target, x: event.clientX, y: event.clientY });
    }

    document.addEventListener('contextmenu', handleGlobalContextMenu, true);

    return () => document.removeEventListener('contextmenu', handleGlobalContextMenu, true);
  }, [items, onSelect]);

  return (
    <View className="flex-1 gap-3">
      {/* Search box that narrows down the tree below */}
      <WorkspaceFilters value={searchQuery} onChangeValue={setSearchQuery} />

      {/* Small bar that starts an inline "new folder"/"new file" row in the tree */}
      <WorkspaceCreateBar onStartCreate={handleStartCreate} />

      {/* Scrollable, filtered folder/file tree — ref only matters on web, see the effect above */}
      <View ref={treeAreaRef as never} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="flex-1 pb-6">
          <WorkspaceList
            items={filteredItems}
            selectedId={selectedId}
            onSelect={onSelect}
            draft={draft}
            forceExpanded={searchQuery.trim().length > 0}
            onContextMenuRequest={(item, x, y) => openMenu({ kind: 'item', item }, x, y)}
          />

          {/* Long-press catcher for empty space below the list (native): create at root/active folder.
              On web, right-clicks here are handled by the document-level listener above instead. */}
          <Pressable className="min-h-10 flex-1" onLongPress={handleEmptySpaceLongPress} />
        </ScrollView>
      </View>

      <WorkspaceContextMenu
        state={menuState}
        deleteConfirmId={deleteConfirmId}
        onDismiss={closeMenu}
        onCreate={handleMenuCreate}
        onRename={handleMenuRename}
        onDelete={handleMenuDelete}
      />
    </View>
  );
}
