import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#07130F",
  text: "#E5F7EC",

  primary: "#36D399",
  secondary: "#1C9B70",
  accent: "#6EE7B7",

  neutral50: "#F0FBF4",
  neutral100: "#E5F7EC",
  neutral200: "#D5E9DD",
  neutral300: "#B9D6C4",
  neutral400: "#91B5A0",
  neutral500: "#668C77",
  neutral600: "#426653",
  neutral700: "#355846",
  neutral800: "#254638",
  neutral900: "#183629",
  neutral1000: "#153025",
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
