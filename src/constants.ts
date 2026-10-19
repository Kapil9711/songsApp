import { ColorSchemes, ColorSchemeSettings } from "./themes/theme.types";

export const LOG_API_REQUESTS: boolean = true;
export const LOG_API_RESPONSES: boolean = true;
export const LOG_API_ERRORS: boolean = true;
export const DEFAULT_COLOR_SCHEME: ColorSchemes = "light";
export const COLOR_SCHEME: ColorSchemeSettings = "system"; // Override system's setting
export const DEFAULT_THEME: string = "default";
export const DEFAULT_FONT = "Ubuntu";

/**
 * Geolocation
 */
export const GEOLOCATION_WATCH_INTERVAL: number = 5000;
export const RN_GEOLOCATION_WATCHERS: any[] = [];
