import { Theme as DefaultTheme } from "./default.dark.theme";
import type { ThemeType } from "./theme.types";

const colors = {
  ...DefaultTheme.colors,

  background: "#111820",
  text: "#E6EDF3",

  primary: "#A9C5DC",
  secondary: "#8196A8",
  accent: "#91B8D5",

  neutral50: "#F5F8FB",
  neutral100: "#E6EDF3",
  neutral200: "#CBD8E3",
  neutral300: "#A9BAC9",
  neutral400: "#8196A8",
  neutral500: "#687E91",
  neutral600: "#526779",
  neutral700: "#405465",
  neutral800: "#304452",
  neutral900: "#263744",
  neutral1000: "#1E2B36",
  neutral1100: "#17212A",
  neutral1200: "#111820",
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
