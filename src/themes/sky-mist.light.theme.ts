import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.light.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#101C2C",
  white: "#FFFFFF",

  // Sky Mist neutral scale
  neutral50: "#F7FAFC",
  neutral100: "#EEF4F8",
  neutral200: "#DFEAF1",
  neutral300: "#B9CBD8",
  neutral400: "#829BAB",
  neutral600: "#526D80",
  neutral650: "#435D70",
  neutral700: "#354D60",
  neutral800: "#293F52",
  neutral900: "#203447",
  neutral1000: "#182A3B",
  neutral1100: "#122233",
  neutral1200: "#0B1725",

  // Theme colors
  background: "#F5F9FC",
  text: "#172B3D",

  // Contextual colors
  primary: "#4D91B8",
  secondary: "#78B8D0",
  accent: "#A5DDE5",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
