import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { View } from 'react-native';

import type { SongEditorMode } from '@/components/song-editor/song-editor-context';
import { workspaceTheme } from '@/UI/theme';

const modes: SongEditorMode[] = ['write', 'chords', 'read'];
const modeLabels = ['Escribir', 'Acordes', 'Leer'];

type SongModeSwitcherProps = {
  mode: SongEditorMode;
  onChangeMode: (mode: SongEditorMode) => void;
};

// Non-navigational mode selector: same song, three ways of working on it. Takes mode as a prop
// instead of reading it from SongEditorContext, since it now lives in the page's title area,
// outside the editor itself — app/pages/workspace.tsx owns this state either way.
export function SongModeSwitcher({ mode, onChangeMode }: SongModeSwitcherProps) {
  return (
    <View className="w-full max-w-[420px] overflow-hidden rounded-[8px] border border-[#8f5f38]">
      <SegmentedControl
        values={modeLabels}
        selectedIndex={modes.indexOf(mode)}
        onChange={({ nativeEvent }) => onChangeMode(modes[nativeEvent.selectedSegmentIndex])}
        backgroundColor={workspaceTheme.colors.panelMuted}
        tintColor={workspaceTheme.colors.accent}
        fontStyle={{ color: workspaceTheme.colors.accentDark }}
        activeFontStyle={{ color: workspaceTheme.colors.panel, fontWeight: '700' }}
      />
    </View>
  );
}
