import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#F5F5F5",
  text: "#171717",

  primary: "#404040",
  secondary: "#525252",
  accent: "#737373",

  neutral50: "#FFFFFF",
  neutral100: "#F5F5F5",
  neutral200: "#E5E5E5",
  neutral300: "#D4D4D4",
  neutral400: "#A3A3A3",
  neutral500: "#858585",
  neutral600: "#737373",
  neutral700: "#525252",
  neutral800: "#404040",
  neutral900: "#303030",
  neutral1000: "#262626",
  neutral1100: "#1A1A1A",
  neutral1200: "#0A0A0A",
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
