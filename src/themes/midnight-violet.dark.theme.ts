import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#100D1B",
  text: "#F8F5FF",

  primary: "#9B6DFF",
  secondary: "#7550C7",
  accent: "#C4A1FF",

  neutral50: "#F8F5FF",
  neutral100: "#EEE8F8",
  neutral200: "#D7CDE5",
  neutral300: "#B5A9CA",
  neutral400: "#A397B8",
  neutral500: "#8F82A5",
  neutral600: "#746784",
  neutral700: "#594D69",
  neutral800: "#403350",
  neutral900: "#302642",
  neutral1000: "#211832",
  neutral1100: "#1B1528",
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
