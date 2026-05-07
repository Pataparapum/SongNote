import "react-native-reanimated";
import "./global.css";

import { Stack } from "expo-router";
import { MD3LightTheme, PaperProvider } from "react-native-paper";

import { workspaceTheme } from "@/UI/theme";

const ignoredPaperWebWarnings = [
  "props.pointerEvents is deprecated. Use style.pointerEvents",
  '"shadow*" style props are deprecated. Use "boxShadow".',
];

const consoleWithWarningFilter = console as Console & { __songChordWarningFilter?: boolean };

if (!consoleWithWarningFilter.__songChordWarningFilter) {
  const originalWarn = console.warn.bind(console);

  console.warn = (...args) => {
    const message = typeof args[0] === "string" ? args[0] : "";

    if (ignoredPaperWebWarnings.some((warning) => message.includes(warning))) {
      return;
    }

    originalWarn(...args);
  };

  consoleWithWarningFilter.__songChordWarningFilter = true;
}

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: workspaceTheme.colors.appBackground,
    error: workspaceTheme.colors.danger,
    onPrimary: workspaceTheme.colors.panel,
    onSurface: workspaceTheme.colors.ink,
    primary: workspaceTheme.colors.accent,
    secondary: workspaceTheme.colors.accentDark,
    surface: workspaceTheme.colors.panel,
    surfaceVariant: workspaceTheme.colors.panelMuted,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
