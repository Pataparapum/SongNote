import { View } from 'react-native';

import { SongChordView } from '@/components/song-editor/song-chord-view';
import { SongEditorProvider, useSongEditor, type SongEditorMode } from '@/components/song-editor/song-editor-context';
import { SongReadView } from '@/components/song-editor/song-read-view';
import { SongWriteView } from '@/components/song-editor/song-write-view';
import type { SongContent } from '@/modules/song-content';

type SongEditorProps = {
  content: SongContent;
  onChangeContent: (content: SongContent) => void;
  mode: SongEditorMode;
  onChangeMode: (mode: SongEditorMode) => void;
  transposeSemitones?: number;
  onAutosaveTrigger?: () => void;
};

// Entry point for editing a song: whichever view the active mode asks for, centered in a readable
// column that stays put across mode changes (the mode switcher itself lives in the page's title
// area, app/pages/workspace.tsx, not here).
export function SongEditor({
  content,
  onChangeContent,
  mode,
  onChangeMode,
  transposeSemitones,
  onAutosaveTrigger,
}: SongEditorProps) {
  return (
    <View className="w-full max-w-[720px] self-center">
      <SongEditorProvider
        content={content}
        onChangeContent={onChangeContent}
        mode={mode}
        onChangeMode={onChangeMode}
        transposeSemitones={transposeSemitones}
        onAutosaveTrigger={onAutosaveTrigger}>
        <SongEditorActiveView />
      </SongEditorProvider>
    </View>
  );
}

function SongEditorActiveView() {
  const { mode } = useSongEditor();

  if (mode === 'chords') {
    return <SongChordView />;
  }

  if (mode === 'read') {
    return <SongReadView />;
  }

  return <SongWriteView />;
}
