import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#071525",
  text: "#E6F3FF",

  primary: "#38BDF8",
  secondary: "#1677B8",
  accent: "#7DD3FC",

  neutral50: "#F0F9FF",
  neutral100: "#E6F3FF",
  neutral200: "#C9E7FA",
  neutral300: "#9CCFEB",
  neutral400: "#6CB1D8",
  neutral500: "#478EB8",
  neutral600: "#326F97",
  neutral700: "#245779",
  neutral800: "#1A4260",
  neutral900: "#12334D",
  neutral1000: "#0E2940",
  neutral1100: "#0A2033",
  neutral1200: "#071525",
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
