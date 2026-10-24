import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FBF9FF",
  text: "#211832",

  primary: "#7950D9",
  secondary: "#6240B5",
  accent: "#936BEB",

  neutral50: "#FFFFFF",
  neutral100: "#FBF9FF",
  neutral200: "#F0EAF8",
  neutral300: "#E0D6EE",
  neutral400: "#8A7C9D",
  neutral500: "#746784",
  neutral600: "#594D69",
  neutral700: "#403350",
  neutral800: "#302642",
  neutral900: "#211832",
  neutral1000: "#1B1528",
  neutral1100: "#151020",
  neutral1200: "#100D1B",
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
