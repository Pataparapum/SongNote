import { cssInterop } from 'nativewind';
import { TextInput } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';

const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

const inputOutlineStyle = { borderRadius: workspaceTheme.radius.medium };

type WorkspaceFiltersProps = {
  value: string;
  onChangeValue: (value: string) => void;
};

// Search input used to filter the folder/file tree by name.
export function WorkspaceFilters({ value, onChangeValue }: WorkspaceFiltersProps) {
  return (
    <PaperTextInput
      value={value}
      onChangeText={onChangeValue}
      mode="outlined"
      outlineColor={workspaceTheme.colors.border}
      activeOutlineColor={workspaceTheme.colors.accent}
      outlineStyle={inputOutlineStyle}
      placeholder="Search folder or file"
      placeholderTextColor={workspaceTheme.colors.inkSoft}
      textColor={workspaceTheme.colors.ink}
      className="min-h-[46px] bg-[#fffdf8] text-[15px]"
      contentClassName="px-4 text-[15px] text-[#28231d]"
    />
  );
}
