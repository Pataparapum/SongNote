import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { WorkspaceCreateBar } from '@/components/tree/workspace-create-bar';
import { WorkspaceFilters } from '@/components/tree/workspace-filters';
import { WorkspaceList, type WorkspaceDraft } from '@/components/tree/workspace-list';
import { filterItems, type WorkspaceItem, type WorkspaceItemType } from '@/modules/workspace';

type WorkspaceTreeProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
  draft: WorkspaceDraft | null;
  onStartCreate: (type: WorkspaceItemType) => void;
};

// Container that owns the search state and composes the search box, the create actions and the filtered tree list.
export function WorkspaceTree({ items, selectedId, onSelect, draft, onStartCreate }: WorkspaceTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = filterItems(items, searchQuery);

  function handleStartCreate(type: WorkspaceItemType) {
    // Clear the filter so the new inline row (typed elsewhere in the tree) is always visible.
    setSearchQuery('');
    onStartCreate(type);
  }

  return (
    <View className="flex-1 gap-3">
      {/* Search box that narrows down the tree below */}
      <WorkspaceFilters value={searchQuery} onChangeValue={setSearchQuery} />

      {/* Small bar that starts an inline "new folder"/"new file" row in the tree */}
      <WorkspaceCreateBar onStartCreate={handleStartCreate} />

      {/* Scrollable, filtered folder/file tree */}
      <ScrollView contentContainerClassName="pb-6">
        <WorkspaceList
          items={filteredItems}
          selectedId={selectedId}
          onSelect={onSelect}
          draft={draft}
          forceExpanded={searchQuery.trim().length > 0}
        />
      </ScrollView>
    </View>
  );
}
