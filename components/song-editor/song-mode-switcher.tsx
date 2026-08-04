import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { View } from 'react-native';

import { useSongEditor, type SongEditorMode } from '@/components/song-editor/song-editor-context';

const modes: SongEditorMode[] = ['write', 'chords', 'read'];
const modeLabels = ['Escribir', 'Acordes', 'Leer'];

// Non-navigational mode selector: same song, three ways of working on it.
export function SongModeSwitcher() {
  const { mode, setMode } = useSongEditor();

  return (
    <View className="max-w-[420px]">
      <SegmentedControl
        values={modeLabels}
        selectedIndex={modes.indexOf(mode)}
        onChange={({ nativeEvent }) => setMode(modes[nativeEvent.selectedSegmentIndex])}
      />
    </View>
  );
}
