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
        "rgba(243, 240, 241, 0.78)",
        "rgba(249, 246, 246, .8)",
      ]}
      locations={[0, 0.45, 1]}
      style={styles.topFade}
    />
  );
};
