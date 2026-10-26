import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.dark.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#080E0A",
  white: "#F1F5EF",

  // Forest Dusk neutral palette
  neutral50: "#E8EFE5",
  neutral100: "#D5E1D1",
  neutral200: "#B8CBB4",
  neutral300: "#94AD8E",
  neutral400: "#789575",
  neutral600: "#557254",
  neutral650: "#476248",
  neutral700: "#3A513D",
  neutral800: "#2D4232",
  neutral900: "#233629",
  neutral1000: "#1B2B20",
  neutral1100: "#132117",
  neutral1200: "#0B1510",

  // Theme colors
  background: "#111B14",
  text: "#E6EEE3",

  // Contextual colors
  primary: "#91B994",
  secondary: "#6F9875",
  accent: "#B6D5AE",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
