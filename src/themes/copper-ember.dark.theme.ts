import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#1C100D",
  text: "#F8E9DF",

  primary: "#E89A6B",
  secondary: "#C7774B",
  accent: "#F3B184",

  neutral50: "#FFF6EF",
  neutral100: "#F8E9DF",
  neutral200: "#EED2C0",
  neutral300: "#DDB69C",
  neutral400: "#C99777",
  neutral500: "#B17A5A",
  neutral600: "#965F43",
  neutral700: "#784A34",
  neutral800: "#633B2A",
  neutral900: "#4D2D21",
  neutral1000: "#392118",
  neutral1100: "#291812",
  neutral1200: "#1C100D",
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
