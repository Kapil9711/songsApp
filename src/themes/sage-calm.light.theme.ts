import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors: ThemeType["colors"] = {
  ...DefaultTheme.colors,

  transparent: "transparent",
  black: "#202820",
  white: "#FFFFFF",

  neutral50: "#FAFAF5",
  neutral100: "#F5F4EB",
  neutral200: "#E7E8D8",
  neutral300: "#D6DCC7",
  neutral400: "#B7C3A7",
  neutral600: "#84977D",
  neutral650: "#75896F",
  neutral700: "#657963",
  neutral800: "#526650",
  neutral900: "#425441",
  neutral1000: "#344536",
  neutral1100: "#28372B",
  neutral1200: "#1C281F",

  background: "#FAFAF5",
  text: "#303B30",

  primary: "#84977D",
  secondary: "#B7C3A7",
  accent: "#D6DCC7",
};

export const Theme: ThemeType = {
  ...DefaultTheme,
  colors,
};

export default Theme;
