import { Theme as LightTheme } from "./default.light.theme";

const colors = {
  ...LightTheme.colors,

  // Cappuccino palette
  primary: "#C08B5C",
  secondary: "#A47148",
  accent: "#D5A779",

  text: "#F2E5D8",
  background: "#17110D",

  // Surfaces and borders
  neutral50: "#F7F0E7",
  neutral100: "#E8D8C8",
  neutral200: "#CDB59F",
  neutral300: "#B49A82",
  neutral400: "#A28A75",
  neutral600: "#79614D",
  neutral650: "#5E4939",
  neutral700: "#49372B",
  neutral800: "#35271F",
  neutral900: "#2A1F18",
  neutral1000: "#211812",
  neutral1100: "#1D1510",
  neutral1200: "#17110D",

  success: "#83B88A",
  danger: "#F08A83",
  warning: "#E6B66E",
  info: "#8EB9DE",
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
      backgroundColor: colors.neutral900,
      borderColor: colors.neutral700,
    },

    CardDefault: {
      ...LightTheme.styles.CardDefault,
      backgroundColor: colors.neutral800,
    },

    Code: {
      ...LightTheme.styles.Code,
      backgroundColor: colors.neutral900,
      color: colors.neutral100,
    },

    ButtonDefault: {
      ...LightTheme.styles.ButtonDefault,
      backgroundColor: colors.neutral800,
      borderColor: colors.neutral700,
    },

    ButtonDefaultText: {
      ...LightTheme.styles.ButtonDefaultText,
      color: colors.text,
    },
  },
};
