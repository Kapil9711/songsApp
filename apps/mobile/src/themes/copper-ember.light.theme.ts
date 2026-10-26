import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FFF8F3",
  text: "#382219",

  primary: "#A9542B",
  secondary: "#854326",
  accent: "#D98252",

  neutral50: "#FFFFFF",
  neutral100: "#FFF8F3",
  neutral200: "#F7E5D9",
  neutral300: "#EACAB7",
  neutral400: "#D9A78C",
  neutral500: "#C28767",
  neutral600: "#A96B4C",
  neutral700: "#854F36",
  neutral800: "#6C3E2B",
  neutral900: "#563123",
  neutral1000: "#46281D",
  neutral1100: "#382219",
  neutral1200: "#28170F",
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
