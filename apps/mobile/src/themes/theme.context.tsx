import { COLOR_SCHEME, DEFAULT_COLOR_SCHEME } from "@/constants";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

import useStore from "../store/store";
import type { ColorSchemes, ThemeType } from "./theme.types";
import { Themes } from "./themes";

type ThemeContextType = {
  Theme: ThemeType;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const themeName = useStore((state) => state.app.system.theme);

  const setTheme = useStore((state) => state.app.setTheme);

  const colorScheme = useStore((state) => state.app.system.colorScheme);

  const systemColorScheme = useColorScheme();

  const [Theme, setThemeState] = useState<ThemeType>();

  const scheme: ColorSchemes =
    COLOR_SCHEME === "system"
      ? (colorScheme ?? systemColorScheme ?? DEFAULT_COLOR_SCHEME)
      : (COLOR_SCHEME as ColorSchemes);

  useEffect(() => {
    let cancelled = false;

    const themeKey = `${themeName}.${scheme}`;
    const importer = Themes[themeKey];

    if (!importer) {
      console.warn(`No theme registered under key: ${themeKey}`);
      return;
    }

    const loadTheme = async () => {
      try {
        const module = await importer();

        if (cancelled) return;

        // Update the active theme and notify all context consumers.
        _currentTheme = module.Theme;
        setThemeState(module.Theme);
      } catch (error) {
        if (!cancelled) {
          console.error(`Error loading theme "${themeKey}":`, error);
        }
      }
    };

    void loadTheme();

    return () => {
      cancelled = true;
    };
  }, [themeName, scheme]);

  if (!Theme) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        Theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};

let _currentTheme: ThemeType;

export const Theme = () => _currentTheme;
