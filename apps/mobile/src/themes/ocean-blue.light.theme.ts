import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#F2F8FF",
  text: "#102A43",

  primary: "#1769AA",
  secondary: "#245B85",
  accent: "#38BDF8",

  neutral50: "#FFFFFF",
  neutral100: "#F2F8FF",
  neutral200: "#DCEBFA",
  neutral300: "#BDD7F0",
  neutral400: "#8FB6DA",
  neutral500: "#648FB8",
  neutral600: "#476F96",
  neutral700: "#345879",
  neutral800: "#254563",
  neutral900: "#1C3852",
  neutral1000: "#172F46",
  neutral1100: "#12263A",
  neutral1200: "#0B1B2B",
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
