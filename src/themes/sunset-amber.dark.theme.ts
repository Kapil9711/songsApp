import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#1C120F",
  text: "#FFF0DF",

  primary: "#FFB454",
  secondary: "#D97736",
  accent: "#FB923C",

  neutral50: "#FFF8EF",
  neutral100: "#FFF0DF",
  neutral200: "#F7D8B9",
  neutral300: "#EABB91",
  neutral400: "#D99A68",
  neutral500: "#BF7B4B",
  neutral600: "#A5623B",
  neutral700: "#864B2F",
  neutral800: "#663824",
  neutral900: "#4D2B1D",
  neutral1000: "#3A2119",
  neutral1100: "#291913",
  neutral1200: "#1C120F",
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
