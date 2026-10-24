import { ThemeType } from "./theme.types";

type ThemeModule = {
  Theme: ThemeType;
};

export const Themes: Record<string, () => Promise<ThemeModule>> = {
  "default.light": () => import("@/themes/default.light.theme"),
  "default.dark": () => import("@/themes/default.dark.theme"),

  "catpuchini.light": () => import("@/themes/catpuchini.light.theme"),

  "catpuchini.dark": () => import("@/themes/catpuchini.dark.theme"),
  "midnight-violet.dark": () => import("./midnight-violet.dark.theme"),

  "midnight-violet.light": () => import("./midnight-violet.light.theme"),
};
