import { Theme as LightTheme } from "./default.light.theme";

const colors = {
  ...LightTheme.colors,

  // Cappuccino palette
  primary: "#8B5E3C",
  secondary: "#A47148",
  accent: "#C08B5C",

  text: "#35251D",
  background: "#F7F0E7",

  // Surfaces and borders
  neutral50: "#FCF8F2",
  neutral100: "#F1E5D8",
  neutral200: "#E4D2BF",
  neutral300: "#C7AE96",
  neutral400: "#947A65",
  neutral600: "#735640",
  neutral650: "#654A36",
  neutral700: "#563D2D",
  neutral800: "#493326",
  neutral900: "#3F2C21",
  neutral1000: "#35251D",
  neutral1100: "#2D2019",
  neutral1200: "#241913",

  success: "#477A52",
  danger: "#B94A48",
  warning: "#B77932",
  info: "#557A9B",
};

export const Theme = {
  ...LightTheme,
  colors,
  styles: {
    ...LightTheme.styles,

    Text: {
      ...LightTheme.styles.Text,
      color: colors.text,
    },
    Bg: {
      ...LightTheme.styles.Bg,
      backgroundColor: colors.background,
    },

    H1: { ...LightTheme.styles.H1, color: colors.text },
    H2: { ...LightTheme.styles.H2, color: colors.text },
    H3: { ...LightTheme.styles.H3, color: colors.text },
    H4: { ...LightTheme.styles.H4, color: colors.text },
    H5: { ...LightTheme.styles.H5, color: colors.text },
    H6: { ...LightTheme.styles.H6, color: colors.text },

    Lead: {
      ...LightTheme.styles.Lead,
      color: colors.text,
    },

    Card: {
      ...LightTheme.styles.Card,
      backgroundColor: colors.neutral50,
      borderColor: colors.neutral200,
    },

    CardDefault: {
      ...LightTheme.styles.CardDefault,
      backgroundColor: colors.neutral100,
    },

    Code: {
      ...LightTheme.styles.Code,
      backgroundColor: colors.neutral100,
      color: colors.neutral700,
    },

    ButtonDefault: {
      ...LightTheme.styles.ButtonDefault,
      backgroundColor: colors.neutral50,
      borderColor: colors.neutral200,
    },

    ButtonDefaultText: {
      ...LightTheme.styles.ButtonDefaultText,
      color: colors.text,
    },
  },
};
