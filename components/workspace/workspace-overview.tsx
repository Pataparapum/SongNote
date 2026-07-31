import { cssInterop } from 'nativewind';
import { View } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';

import { workspaceTheme } from '@/UI/theme';

const PaperCard = cssInterop(Card, { className: 'style' });
const PaperCardContent = cssInterop(Card.Content, { className: 'style' });
const PaperText = cssInterop(Text, { className: 'style' });
const PaperTextInput = cssInterop(TextInput, {
  className: 'style',
  contentClassName: 'contentStyle',
});

const inputOutlineStyle = { borderRadius: workspaceTheme.radius.medium };

const workspaceLocations = [
  { id: 'desktop', label: 'Desktop', detail: 'Fast access on this PC' },
  { id: 'documents', label: 'Documents', detail: 'Best for organized notes' },
  { id: 'custom', label: 'Custom path', detail: 'Type your own folder path' },
];

type WorkspaceOverviewProps = {
  currentPath: string;
  workspaceLocation: string;
  onSelectWorkspaceLocation: (id: string) => void;
  customPath: string;
  onChangeCustomPath: (value: string) => void;
};

// Page heading plus the conceptual "where should this workspace live" picker.
export function WorkspaceOverview({
  currentPath,
  workspaceLocation,
  onSelectWorkspaceLocation,
  customPath,
  onChangeCustomPath,
}: WorkspaceOverviewProps) {
  return (
    <View className="gap-6">
      {/* Page title and breadcrumb for the currently selected item */}
      <View className="gap-2.5">
        <PaperText className="text-[13px] font-extrabold uppercase tracking-[0.9px] text-[#8f5f38]">
          Minimal song notes
        </PaperText>
        <PaperText className="max-w-[760px] text-[38px] font-black leading-[44px] tracking-[-1.2px] text-[#28231d]">
          Create folders, write files, keep your chord ideas close.
        </PaperText>
        <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">{currentPath}</PaperText>
      </View>

      {/* Conceptual workspace storage location picker */}
      <PaperCard mode="outlined" className="rounded-[24px] border border-[#ded0bd] bg-[#fffbf4]">
        <PaperCardContent className="gap-4 p-6">
          <PaperText className="text-lg font-extrabold text-[#28231d]">Use this application on your PC</PaperText>
          <PaperText className="text-[15px] leading-[22px] text-[#756b5f]">
            Choose where this workspace should live conceptually before local file storage is connected.
          </PaperText>
          <View className="flex-row flex-wrap gap-2.5">
            {workspaceLocations.map((location) => {
              const isSelected = workspaceLocation === location.id;

              return (
                <PaperCard
                  key={location.id}
                  onPress={() => onSelectWorkspaceLocation(location.id)}
                  mode="outlined"
                  className={`min-w-[150px] flex-1 rounded-2xl border ${
                    isSelected ? 'border-[#8f5f38] bg-[#ead2bb]' : 'border-[#ded0bd] bg-[#f8f0e4]'
                  }`}>
                  <PaperCardContent className="gap-1 p-4">
                    <PaperText className={`text-[15px] font-extrabold ${isSelected ? 'text-[#674124]' : 'text-[#28231d]'}`}>
                      {location.label}
                    </PaperText>
                    <PaperText className="text-[13px] leading-[18px] text-[#756b5f]">{location.detail}</PaperText>
                  </PaperCardContent>
                </PaperCard>
              );
            })}
          </View>

          {workspaceLocation === 'custom' && (
            <PaperTextInput
              value={customPath}
              onChangeText={onChangeCustomPath}
              mode="outlined"
              outlineColor={workspaceTheme.colors.border}
              activeOutlineColor={workspaceTheme.colors.accent}
              outlineStyle={inputOutlineStyle}
              placeholder="C:/Users/YourName/Documents/SongChord"
              placeholderTextColor={workspaceTheme.colors.inkSoft}
              textColor={workspaceTheme.colors.ink}
              className="-mt-1 min-h-[46px] bg-[#fffdf8] text-[15px]"
              contentClassName="px-4 text-[15px] text-[#28231d]"
            />
          )}
        </PaperCardContent>
      </PaperCard>
    </View>
  );
}
