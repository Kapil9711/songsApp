import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FAFAFA",
  text: "#171717",

  primary: "#262626",
  secondary: "#525252",
  accent: "#737373",

  neutral50: "#FFFFFF",
  neutral100: "#FAFAFA",
  neutral200: "#F0F0F0",
  neutral300: "#D9D9D9",
  neutral400: "#BFBFBF",
  neutral500: "#A0A0A0",
  neutral600: "#737373",
  neutral700: "#525252",
  neutral800: "#404040",
  neutral900: "#303030",
  neutral1000: "#262626",
  neutral1100: "#1C1C1C",
  neutral1200: "#111111",
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
