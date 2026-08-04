import { View } from 'react-native';

import { SongChordView } from '@/components/song-editor/song-chord-view';
import { SongEditorProvider, useSongEditor } from '@/components/song-editor/song-editor-context';
import { SongModeSwitcher } from '@/components/song-editor/song-mode-switcher';
import { SongReadView } from '@/components/song-editor/song-read-view';
import { SongWriteView } from '@/components/song-editor/song-write-view';
import type { SongContent } from '@/modules/song-content';

type SongEditorProps = {
  content: SongContent;
  onChangeContent: (content: SongContent) => void;
};

// Entry point for editing a song: the mode switcher plus whichever view the active mode asks for.
export function SongEditor({ content, onChangeContent }: SongEditorProps) {
  return (
    <SongEditorProvider content={content} onChangeContent={onChangeContent}>
      <View className="gap-5">
        <SongModeSwitcher />
        <SongEditorActiveView />
      </View>
    </SongEditorProvider>
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
