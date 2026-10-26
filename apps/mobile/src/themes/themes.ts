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
  "emerald-pulse.light": () => import("./emerald-pulse.light.theme"),

  "emerald-pulse.dark": () => import("./emerald-pulse.dark.theme"),
  "ocean-blue.light": () => import("./ocean-blue.light.theme"),
  "ocean-blue.dark": () => import("./ocean-blue.dark.theme"),
  "sunset-amber.light": () => import("./sunset-amber.light.theme"),
  "sunset-amber.dark": () => import("./sunset-amber.dark.theme"),
  "monochrome.light": () => import("./monochrome.light.theme"),
  "monochrome.dark": () => import("./monochrome.dark.theme"),
  "crimson.light": () => import("./crimson.light.theme"),
  "crimson.dark": () => import("./crimson.dark.theme"),
  "graphite.light": () => import("./graphite.light.theme"),
  "graphite.dark": () => import("./graphite.dark.theme"),
  "rose-clay.light": () => import("./rose-clay.light.theme"),
  "rose-clay.dark": () => import("./rose-clay.dark.theme"),
  "copper-ember.light": () => import("./copper-ember.light.theme"),
  "copper-ember.dark": () => import("./copper-ember.dark.theme"),
  "steel.light": () => import("./steel.light.theme"),
  "steel.dark": () => import("./steel.dark.theme"),
  "sky-mist.light": () => import("./sky-mist.light.theme"),

  "sky-mist.dark": () => import("./sky-mist.dark.theme"),
  "forest-dusk.light": () => import("./forest-dusk.light.theme"),

  "forest-dusk.dark": () => import("./forest-dusk.dark.theme"),
  "sage-calm.light": () => import("./sage-calm.light.theme"),
  "sage-calm.dark": () => import("./sage-calm.dark.theme"),
  "lavender-haze.light": () => import("./lavender-haze.light.theme"),

  "lavender-haze.dark": () => import("./lavender-haze.dark.theme"),
};
