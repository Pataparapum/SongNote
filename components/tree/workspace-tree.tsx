import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { WorkspaceFilters } from '@/components/tree/workspace-filters';
import { WorkspaceList } from '@/components/tree/workspace-list';
import { filterItems, type WorkspaceItem } from '@/modules/workspace';

type WorkspaceTreeProps = {
  items: WorkspaceItem[];
  selectedId: string | null;
  onSelect: (item: WorkspaceItem) => void;
};

// Container that owns the search state and composes the search box with the filtered tree list.
export function WorkspaceTree({ items, selectedId, onSelect }: WorkspaceTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredItems = filterItems(items, searchQuery);

  return (
    <View className="flex-1 gap-4">
      {/* Search box that narrows down the tree below */}
      <WorkspaceFilters value={searchQuery} onChangeValue={setSearchQuery} />

      {/* Scrollable, filtered folder/file tree */}
      <ScrollView contentContainerClassName="pb-6">
        <WorkspaceList items={filteredItems} selectedId={selectedId} onSelect={onSelect} />
      </ScrollView>
    </View>
  );
}
