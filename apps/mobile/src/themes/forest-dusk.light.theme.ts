import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.light.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#17231B",
  white: "#FFFFFF",

  // Forest Dusk neutral palette
  neutral50: "#F4F6F1",
  neutral100: "#E8EDE4",
  neutral200: "#D7E0D2",
  neutral300: "#B5C4AE",
  neutral400: "#899D82",
  neutral600: "#647A5E",
  neutral650: "#53694E",
  neutral700: "#435640",
  neutral800: "#354634",
  neutral900: "#2B3A2C",
  neutral1000: "#223024",
  neutral1100: "#1B291E",
  neutral1200: "#121E16",

  // Theme colors
  background: "#F4F6F1",
  text: "#253328",

  // Contextual colors
  primary: "#66876A",
  secondary: "#8BA68A",
  accent: "#B5CBB0",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
