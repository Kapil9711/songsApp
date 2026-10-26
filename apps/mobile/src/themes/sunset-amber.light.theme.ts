import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FFFAF5",
  text: "#422817",

  primary: "#C66A18",
  secondary: "#A94F24",
  accent: "#F59E0B",

  neutral50: "#FFFFFF",
  neutral100: "#FFFAF5",
  neutral200: "#FBE9D5",
  neutral300: "#F4D2B0",
  neutral400: "#E9B580",
  neutral500: "#D39456",
  neutral600: "#B8753B",
  neutral700: "#975B2D",
  neutral800: "#794724",
  neutral900: "#62391F",
  neutral1000: "#512F1B",
  neutral1100: "#422817",
  neutral1200: "#301C11",
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
