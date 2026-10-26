import type { ThemeType } from "./theme.types";
import { Theme as DefaultTheme } from "./default.light.theme";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  // Base colors
  transparent: "transparent",
  black: "#211D2A",
  white: "#FFFFFF",

  // Lavender Haze neutral palette
  neutral50: "#FAF8FC",
  neutral100: "#F3EFF8",
  neutral200: "#E8E0F0",
  neutral300: "#D7CBE5",
  neutral400: "#BBA9D2",
  neutral600: "#9782B2",
  neutral650: "#8672A1",
  neutral700: "#75628F",
  neutral800: "#5E4E76",
  neutral900: "#493D5D",
  neutral1000: "#372F47",
  neutral1100: "#292337",
  neutral1200: "#1C1827",

  // Theme colors
  background: "#FAF8FC",
  text: "#302A3C",

  // Contextual colors
  primary: "#9182B0",
  secondary: "#B6A5D0",
  accent: "#D8C9EB",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
