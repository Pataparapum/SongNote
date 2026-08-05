import { cssInterop } from "nativewind";
import { View } from "react-native";
import { Text } from "react-native-paper";

const PaperText = cssInterop(Text, { className: "style" });

type WorkspaceOverviewProps = {
  title: string;
};

// Page heading: the selected song's name, or the active folder's name when nothing is selected.
export function WorkspaceOverview({ title }: WorkspaceOverviewProps) {
  return (
    <View className="items-center gap-2.5">
      <PaperText className="max-w-[760px] text-center text-[38px] font-black leading-[44px] tracking-[-1.2px] text-[#28231d]">
        {title}
      </PaperText>
    </View>
  );
}
