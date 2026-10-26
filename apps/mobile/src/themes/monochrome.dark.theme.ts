import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#080808",
  text: "#F5F5F5",

  primary: "#FFFFFF",
  secondary: "#D4D4D4",
  accent: "#A3A3A3",

  neutral50: "#FFFFFF",
  neutral100: "#F5F5F5",
  neutral200: "#E5E5E5",
  neutral300: "#D4D4D4",
  neutral400: "#A3A3A3",
  neutral500: "#737373",
  neutral600: "#525252",
  neutral700: "#404040",
  neutral800: "#303030",
  neutral900: "#242424",
  neutral1000: "#191919",
  neutral1100: "#101010",
  neutral1200: "#080808",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
  styles: {
    ...DefaultTheme.styles,
    Text: {
      ...DefaultTheme.styles.Text,
      color: colors.text,
    },
    Bg: {
      ...DefaultTheme.styles.Bg,
      backgroundColor: colors.background,
    },
    Link: {
      ...DefaultTheme.styles.Link,
      color: colors.primary,
    },
  },
};
