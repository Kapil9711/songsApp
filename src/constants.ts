import { ColorSchemes, ColorSchemeSettings } from "./themes/theme.types";

export const LOG_API_REQUESTS: boolean = true;
export const LOG_API_RESPONSES: boolean = true;
export const LOG_API_ERRORS: boolean = true;
export const DEFAULT_COLOR_SCHEME: ColorSchemes = "dark";
export const COLOR_SCHEME: ColorSchemeSettings = "dark"; // Override system's setting
export const DEFAULT_THEME: string = "sky-mist";
export const DEFAULT_FONT = "Ubuntu";

// env variables
export const API_BASE_URL =
  process.env.EXPO_API_BASE_URL || "https://song-api.kapil.store/api/v1";
export const JIO_API_BASE_URL =
  process.env.EXPO_API_BASE_URL || "https://saavn-api-mocha.vercel.app";
