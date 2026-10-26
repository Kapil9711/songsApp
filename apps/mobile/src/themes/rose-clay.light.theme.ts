import { Theme as DefaultTheme } from "./default.light.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#FFF7F5",
  text: "#382326",

  primary: "#A65D63",
  secondary: "#955057",
  accent: "#D88C91",

  neutral50: "#FFFFFF",
  neutral100: "#FFF7F5",
  neutral200: "#F8E5E2",
  neutral300: "#EED0CC",
  neutral400: "#DDAEAA",
  neutral500: "#C78D8B",
  neutral600: "#AD7071",
  neutral700: "#95595D",
  neutral800: "#79464B",
  neutral900: "#62383E",
  neutral1000: "#512E34",
  neutral1100: "#42262B",
  neutral1200: "#301A1F",
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
