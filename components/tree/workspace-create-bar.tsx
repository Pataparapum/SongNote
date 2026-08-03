import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { cssInterop } from "nativewind";
import { View } from "react-native";
import { IconButton, Text } from "react-native-paper";

import { workspaceTheme } from "@/UI/theme";
import type { WorkspaceItemType } from "@/modules/workspace";

const PaperIconButton = cssInterop(IconButton, { className: "style" });
const PaperText = cssInterop(Text, { className: "style" });

type WorkspaceCreateBarProps = {
  onStartCreate: (type: WorkspaceItemType) => void;
};

// Small bar with just the two "start creating" actions; the name itself is typed inline in the tree below.
export function WorkspaceCreateBar({ onStartCreate }: WorkspaceCreateBarProps) {
  return (
    <View className="flex-row items-center gap-0.5 px-1">
      <PaperText className="flex-1 text-[13px] font-extrabold uppercase tracking-[0.6px] text-[#9d9285]">
        Files & Folders
      </PaperText>
      <PaperIconButton
        icon={() => (
          <MaterialIcons
            name="create-new-folder"
            size={16}
            color={workspaceTheme.colors.accentDark}
          />
        )}
        size={16}
        onPress={() => onStartCreate("folder")}
        className="m-0 h-7 w-7"
      />
      <PaperIconButton
        icon={() => (
          <MaterialIcons
            name="note-add"
            size={16}
            color={workspaceTheme.colors.accentDark}
          />
        )}
        size={16}
        onPress={() => onStartCreate("file")}
        className="m-0 h-7 w-7"
      />
    </View>
  );
}
