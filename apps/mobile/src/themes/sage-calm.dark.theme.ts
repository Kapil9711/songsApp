import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  transparent: "transparent",
  black: "#0C110D",
  white: "#F7F7EF",

  neutral50: "#F0F1E7",
  neutral100: "#E0E4D4",
  neutral200: "#CBD3BB",
  neutral300: "#AFBCA0",
  neutral400: "#94A587",
  neutral600: "#78896F",
  neutral650: "#697B62",
  neutral700: "#5A6C54",
  neutral800: "#495943",
  neutral900: "#394735",
  neutral1000: "#2B382C",
  neutral1100: "#202B22",
  neutral1200: "#151E17",

  background: "#191F19",
  text: "#ECEFE4",

  primary: "#A5B99A",
  secondary: "#84977D",
  accent: "#C5D1B3",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
