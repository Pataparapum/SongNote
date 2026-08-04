import { createContext, useContext, useState, type ReactNode } from 'react';

import type { SongContent } from '@/modules/song-content';

// Writing lyrics, placing chords and performing are different enough that they get their own mode
// instead of one crowded editor.
export type SongEditorMode = 'write' | 'chords' | 'read';

type SongEditorContextValue = {
  content: SongContent;
  mode: SongEditorMode;
  setMode: (mode: SongEditorMode) => void;
  onChangeContent: (content: SongContent) => void;
};

const SongEditorContext = createContext<SongEditorContextValue | null>(null);

type SongEditorProviderProps = {
  content: SongContent;
  onChangeContent: (content: SongContent) => void;
  children: ReactNode;
};

// Holds the active mode so the views below don't have to thread a `mode` prop through every level.
export function SongEditorProvider({ content, onChangeContent, children }: SongEditorProviderProps) {
  const [mode, setMode] = useState<SongEditorMode>('write');

  return (
    <SongEditorContext.Provider value={{ content, mode, setMode, onChangeContent }}>
      {children}
    </SongEditorContext.Provider>
  );
}

export function useSongEditor(): SongEditorContextValue {
  const value = useContext(SongEditorContext);

  if (!value) {
    throw new Error('useSongEditor must be used inside a SongEditorProvider');
  }

  return value;
}
