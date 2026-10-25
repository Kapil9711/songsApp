import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.dark.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#0D0A12",
  white: "#F7F2FC",

  // Lavender Haze neutral palette
  neutral50: "#F2EAF8",
  neutral100: "#E5D9F0",
  neutral200: "#D0BEE3",
  neutral300: "#B9A0D3",
  neutral400: "#A087BD",
  neutral600: "#80669F",
  neutral650: "#72588F",
  neutral700: "#624B7C",
  neutral800: "#503D67",
  neutral900: "#403151",
  neutral1000: "#322641",
  neutral1100: "#241B30",
  neutral1200: "#17111F",

  // Theme colors
  background: "#17131F",
  text: "#F0E9F7",

  // Contextual colors
  primary: "#B49AD8",
  secondary: "#9275B8",
  accent: "#D3BCEB",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
