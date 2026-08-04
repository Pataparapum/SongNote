import { createId } from '@/modules/id';
import {
  createEmptySongContent,
  createLine,
  createWord,
  type SongContent,
} from '@/modules/song-content';

export type WorkspaceItemType = 'folder' | 'file';

export type WorkspaceItem = {
  id: string;
  name: string;
  type: WorkspaceItemType;
  content?: SongContent;
  children?: WorkspaceItem[];
};

// Seeded with a couple of chords already placed so the chord and reading modes show something on
// first run instead of an empty page.
const firstDraftContent: SongContent = {
  version: 1,
  lines: [
    createLine([
      { ...createWord('Tap'), chord: 'C' },
      createWord('any'),
      { ...createWord('word'), chord: 'G' },
      createWord('to'),
      { ...createWord('place'), chord: 'Am' },
      createWord('its'),
      { ...createWord('chord'), chord: 'F' },
    ]),
    createLine([]),
    createLine([
      { ...createWord('Switch'), chord: 'C' },
      createWord('modes'),
      { ...createWord('above'), chord: 'G' },
    ]),
  ],
};

// Temporary local-only root: until items sync through a real database, everything created in the
// app is nested under "Pruebas" so test data stays in one clearly-labeled place.
export const initialWorkspaceItems: WorkspaceItem[] = [
  {
    id: 'folder-pruebas',
    name: 'Pruebas',
    type: 'folder',
    children: [
      {
        id: 'folder-songs',
        name: 'My songs',
        type: 'folder',
        children: [
          {
            id: 'file-first-draft',
            name: 'First song draft',
            type: 'file',
            content: firstDraftContent,
          },
        ],
      },
    ],
  },
];

export function createWorkspaceItem(type: WorkspaceItemType, name: string): WorkspaceItem {
  return {
    id: createId(),
    name,
    type,
    content: type === 'file' ? createEmptySongContent() : undefined,
    children: type === 'folder' ? [] : undefined,
  };
}

export function addItemToFolder(
  items: WorkspaceItem[],
  folderId: string | null,
  newItem: WorkspaceItem,
): WorkspaceItem[] {
  if (!folderId) {
    return [...items, newItem];
  }

  return items.map((item) => {
    if (item.id === folderId && item.type === 'folder') {
      return { ...item, children: [...(item.children ?? []), newItem] };
    }

    if (item.type === 'folder') {
      return { ...item, children: addItemToFolder(item.children ?? [], folderId, newItem) };
    }

    return item;
  });
}

export function findItem(items: WorkspaceItem[], itemId: string | null): WorkspaceItem | null {
  if (!itemId) {
    return null;
  }

  for (const item of items) {
    if (item.id === itemId) {
      return item;
    }

    if (item.type === 'folder') {
      const child = findItem(item.children ?? [], itemId);

      if (child) {
        return child;
      }
    }
  }

  return null;
}

export function findParentFolderId(
  items: WorkspaceItem[],
  itemId: string,
  parentFolderId: string | null = null,
): string | null {
  for (const item of items) {
    if (item.id === itemId) {
      return parentFolderId;
    }

    if (item.type === 'folder') {
      const parent = findParentFolderId(item.children ?? [], itemId, item.id);

      if (parent !== null) {
        return parent;
      }
    }
  }

  return null;
}

export function updateFileContent(
  items: WorkspaceItem[],
  fileId: string,
  content: SongContent,
): WorkspaceItem[] {
  return items.map((item) => {
    if (item.id === fileId && item.type === 'file') {
      return { ...item, content };
    }

    if (item.type === 'folder') {
      return { ...item, children: updateFileContent(item.children ?? [], fileId, content) };
    }

    return item;
  });
}

export function filterItems(items: WorkspaceItem[], query: string): WorkspaceItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.reduce<WorkspaceItem[]>((results, item) => {
    const filteredChildren = item.type === 'folder' ? filterItems(item.children ?? [], query) : [];
    const matchesName = item.name.toLowerCase().includes(normalizedQuery);

    if (matchesName || filteredChildren.length > 0) {
      results.push({ ...item, children: item.type === 'folder' ? filteredChildren : undefined });
    }

    return results;
  }, []);
}

export function getItemPath(items: WorkspaceItem[], itemId: string | null): string {
  if (!itemId) {
    return 'Workspace root';
  }

  const path = findPathSegments(items, itemId);

  return path.length > 0 ? path.join(' / ') : 'Workspace root';
}

function findPathSegments(
  items: WorkspaceItem[],
  itemId: string,
  trail: string[] = [],
): string[] {
  for (const item of items) {
    const nextTrail = [...trail, item.name];

    if (item.id === itemId) {
      return nextTrail;
    }

    if (item.type === 'folder') {
      const childTrail = findPathSegments(item.children ?? [], itemId, nextTrail);

      if (childTrail.length > 0) {
        return childTrail;
      }
    }
  }

  return [];
}
