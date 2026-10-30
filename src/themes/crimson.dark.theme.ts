import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#16090D",
  text: "#FFE9ED",

  primary: "#FB7185",
  secondary: "#E11D48",
  accent: "#FDA4AF",

  neutral50: "#FFF1F3",
  neutral100: "#FFE9ED",
  neutral200: "#FECDD6",
  neutral300: "#FDA4B4",
  neutral400: "#FB7185",
  neutral500: "#F43F5E",
  neutral600: "#E11D48",
  neutral700: "#BE123C",
  neutral800: "#881337",
  neutral900: "#641027",
  neutral1000: "#460D1D",
  neutral1100: "#2B0B14",
  neutral1200: "#16090D",
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
