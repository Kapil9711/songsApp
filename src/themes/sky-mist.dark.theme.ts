import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.dark.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#050C14",
  white: "#F5FAFF",

  // Sky Mist neutral scale
  neutral50: "#EAF4FA",
  neutral100: "#D8E8F1",
  neutral200: "#B9D2E0",
  neutral300: "#8EADBF",
  neutral400: "#6E91A6",
  neutral600: "#476579",
  neutral650: "#3C596D",
  neutral700: "#304A5D",
  neutral800: "#253C4F",
  neutral900: "#1C3042",
  neutral1000: "#142638",
  neutral1100: "#0D1C2D",
  neutral1200: "#07111E",

  // Theme colors
  background: "#0B1725",
  text: "#E8F2F8",

  // Contextual colors
  primary: "#83C8E8",
  secondary: "#559BBE",
  accent: "#B0E7EE",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
