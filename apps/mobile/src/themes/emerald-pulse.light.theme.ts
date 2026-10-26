import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#F5FBF7",
  text: "#15352A",

  primary: "#087F5B",
  secondary: "#176B50",
  accent: "#34D399",

  neutral50: "#FFFFFF",
  neutral100: "#F5FBF7",
  neutral200: "#D5E9DD",
  neutral300: "#B7D6C3",
  neutral400: "#668C77",
  neutral500: "#527563",
  neutral600: "#426653",
  neutral700: "#355846",
  neutral800: "#284A3A",
  neutral900: "#203E31",
  neutral1000: "#193629",
  neutral1100: "#10251C",
  neutral1200: "#07130F",
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
