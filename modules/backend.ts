import type { WorkspaceItem } from '@/modules/workspace';

// Stand-in for the future Postgres-backed API: same shape a real save call would have, so wiring in
// the real request later is a one-function swap instead of a rewrite of every caller. Saves one song
// (its lyrics/chords + metadata) at a time — that's what "Guardar" means, not the whole tree.
export async function saveSongToBackend(item: WorkspaceItem): Promise<{ savedAt: string }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log('[stub] saved song', item.id, item.name);

  return { savedAt: new Date().toISOString() };
}
