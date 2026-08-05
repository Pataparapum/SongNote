import { createContext, useContext, type ReactNode } from 'react';

import type { SongContent } from '@/modules/song-content';

// Writing lyrics, placing chords and performing are different enough that they get their own mode
// instead of one crowded editor.
export type SongEditorMode = 'write' | 'chords' | 'read';

type SongEditorContextValue = {
  content: SongContent;
  mode: SongEditorMode;
  setMode: (mode: SongEditorMode) => void;
  onChangeContent: (content: SongContent) => void;
  transposeSemitones: number;
};

const SongEditorContext = createContext<SongEditorContextValue | null>(null);

type SongEditorProviderProps = {
  content: SongContent;
  onChangeContent: (content: SongContent) => void;
  mode: SongEditorMode;
  onChangeMode: (mode: SongEditorMode) => void;
  transposeSemitones?: number;
  onAutosaveTrigger?: () => void;
  children: ReactNode;
};

// The active mode is controlled from outside (app/pages/workspace.tsx) rather than owned here,
// because chrome above the editor (the save button, see workspace.tsx) needs to read it too.
// Mode changes and newly committed lines are the two autosave triggers — everything else (typing
// inside a word) is left alone so the local cache isn't written on every keystroke.
export function SongEditorProvider({
  content,
  onChangeContent,
  mode,
  onChangeMode,
  transposeSemitones = 0,
  onAutosaveTrigger,
  children,
}: SongEditorProviderProps) {
  function handleSetMode(nextMode: SongEditorMode) {
    onChangeMode(nextMode);
    onAutosaveTrigger?.();
  }

  function handleChangeContent(nextContent: SongContent) {
    const didAddLine = nextContent.lines.length > content.lines.length;

    onChangeContent(nextContent);

    if (didAddLine) {
      onAutosaveTrigger?.();
    }
  }

  return (
    <SongEditorContext.Provider
      value={{
        content,
        mode,
        setMode: handleSetMode,
        onChangeContent: handleChangeContent,
        transposeSemitones,
      }}>
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
