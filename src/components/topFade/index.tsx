import { useTheme } from "@/themes/theme.context";
import { LinearGradient } from "expo-linear-gradient";
import { useResponsiveStyles } from "react-native-fluid-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FadeTop = () => {
  const { Theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useResponsiveStyles((r) => {
    return {
      topFade: {
        position: "absolute",

        top: 0,

        left: 0,

        right: 0,

        height: insets.top,

        zIndex: 20,
      },
    };
  });
  return (
    <LinearGradient
      pointerEvents="none"
      colors={[
        Theme.colors.background,
        hexToRgba(Theme.colors.background, 0.78),
        hexToRgba(Theme.colors.background, 0),
      ]}
      locations={[0, 0.45, 1]}
      style={styles.topFade}
    />
  );
};

const hexToRgba = (hex: string, opacity: number) => {
  let normalized = hex.replace("#", "");

  // Expand shorthand hex, e.g. #FFF -> #FFFFFF
  if (/^[0-9a-fA-F]{3}$/.test(normalized)) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    console.warn("Unsupported theme color:", hex);
    return hex; // Avoid unexpectedly returning black
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
