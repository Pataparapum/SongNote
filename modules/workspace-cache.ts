import AsyncStorage from '@react-native-async-storage/async-storage';

import type { WorkspaceItem } from '@/modules/workspace';

const CACHE_KEY = 'songnote:workspace-cache';

// This is a local draft cache only — it must never fail loudly, since losing it just means falling
// back to the last real save (or the seed data), not losing the source of truth.
export async function loadCachedWorkspace(): Promise<WorkspaceItem[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);

    return raw ? (JSON.parse(raw) as WorkspaceItem[]) : null;
  } catch {
    return null;
  }
}

export async function saveCachedWorkspace(items: WorkspaceItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    // Autosave is best-effort; the user can still reach the backend with a manual save.
  }
}
