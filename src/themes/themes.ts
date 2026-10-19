import { ThemeType } from "./theme.types";

type ThemeModule = { Theme: ThemeType };

/**
 * You need to register your custom theme(s) here.
 *
 * Follow a naming convention that combines a
 * theme's name and its color-scheme variant (e.g., 'cyberpunk.light', 'cyberpunk.dark').
 *
 */
export const Themes: Record<string, () => Promise<ThemeModule>> = {
  "default.light": () => import("@/themes/default.light.theme"),
  "default.dark": () => import("@/themes/default.dark.theme"),
};
