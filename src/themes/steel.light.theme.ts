import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#F4F7FA",
  text: "#1B2836",

  primary: "#496A86",
  secondary: "#354F67",
  accent: "#8196A8",

  neutral50: "#FFFFFF",
  neutral100: "#F4F7FA",
  neutral200: "#E3EAF0",
  neutral300: "#CBD6E0",
  neutral400: "#A9BAC9",
  neutral500: "#8196A8",
  neutral600: "#647B90",
  neutral700: "#496174",
  neutral800: "#354F67",
  neutral900: "#2A4054",
  neutral1000: "#233648",
  neutral1100: "#1B2836",
  neutral1200: "#111B25",
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
