import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FFF7F8",
  text: "#351016",

  primary: "#BE123C",
  secondary: "#9F1239",
  accent: "#F43F5E",

  neutral50: "#FFFFFF",
  neutral100: "#FFF7F8",
  neutral200: "#FFE4E8",
  neutral300: "#FECDD6",
  neutral400: "#FDA4B4",
  neutral500: "#FB7185",
  neutral600: "#E54866",
  neutral700: "#BE123C",
  neutral800: "#9F1239",
  neutral900: "#881337",
  neutral1000: "#6F102D",
  neutral1100: "#500D22",
  neutral1200: "#351016",
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
