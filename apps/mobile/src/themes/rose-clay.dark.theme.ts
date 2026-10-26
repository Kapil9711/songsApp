import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#1C1215",
  text: "#F8E9E8",

  primary: "#DDA6A1",
  secondary: "#C77D7D",
  accent: "#E9A3A1",

  neutral50: "#FFF5F3",
  neutral100: "#F8E9E8",
  neutral200: "#EED0CC",
  neutral300: "#DDAEAA",
  neutral400: "#C78D8B",
  neutral500: "#AD7071",
  neutral600: "#95595D",
  neutral700: "#79464B",
  neutral800: "#62383E",
  neutral900: "#4D2D32",
  neutral1000: "#3B2228",
  neutral1100: "#2A191E",
  neutral1200: "#1C1215",
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
