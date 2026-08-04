import { cssInterop } from 'nativewind';
import { TextInput } from 'react-native-paper';

import { useSongEditor } from '@/components/song-editor/song-editor-context';
import { workspaceTheme } from '@/UI/theme';
import { reconcilePlainText, songContentToPlainText } from '@/modules/song-content';

const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

// Plain lyrics typing. The structured song is projected to text on the way in and reconciled back
// on every edit, so chords already placed survive as long as their word is left untouched.
export function SongWriteView() {
  const { content, onChangeContent } = useSongEditor();

  return (
    <PaperTextInput
      value={songContentToPlainText(content)}
      onChangeText={(plainText) => onChangeContent(reconcilePlainText(content, plainText))}
      mode="flat"
      underlineColor="transparent"
      activeUnderlineColor="transparent"
      placeholder="Escribe aquí la letra de la canción..."
      placeholderTextColor={workspaceTheme.colors.inkSoft}
      textColor={workspaceTheme.colors.ink}
      multiline
      textAlignVertical="top"
      className="min-h-[320px] bg-transparent"
      contentClassName="min-h-[320px] px-0 text-base leading-6 text-[#28231d]"
    />
  );
}
