import { useLoading } from "@/store/loading.store";
import { useTheme } from "@/themes/theme.context";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useResponsiveStyles } from "react-native-fluid-styles";

type LoadingProps = {
  title?: string;
  isLoading?: boolean;
};

const BAR_COUNT = 5;
const BAR_HEIGHTS = [18, 34, 24, 42, 20];

export default function Loading() {
  const styles = useStyles();
  const loading = useLoading((state) => state.loading);
  const title = useLoading((state) => state.title);

  const progress = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    if (!loading) {
      progress.forEach((value) => {
        value.stopAnimation();
        value.setValue(0);
      });
      return;
    }

    const animations = progress.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(value, {
            toValue: 1,
            duration: 350 + (index % 2) * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 350 + (index % 2) * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [loading, progress]);

  if (!loading) return null;

  return (
    <View
      style={styles.overlay}
      pointerEvents="auto"
      accessibilityRole="progressbar"
      accessibilityLabel={title}
    >
      <View style={styles.card}>
        <View style={styles.equalizer}>
          {progress.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.bar,
                {
                  height: BAR_HEIGHTS[index],
                  transform: [
                    {
                      scaleY: value.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <Text style={styles.title}>{title}</Text>

        {/* <View style={styles.progressTrack}>
          <Animated.View style={styles.progressGlow} />
        </View> */}
      </View>
    </View>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();

  return useResponsiveStyles((r) => ({
    overlay: {
      ...StyleSheet.absoluteFill,
      zIndex: 10000,
      elevation: 10000,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.52)",
    },

    card: {
      minWidth: r.ms(190),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(28),
      paddingVertical: r.ms(26),
      borderRadius: r.ms(22),
      //   backgroundColor: "rgba(20, 23, 32, 0.1)",
      //   borderWidth: StyleSheet.hairlineWidth,
      //   borderColor: "rgba(197, 255, 74, 0.24)",
      gap: r.ms(18),
    },

    equalizer: {
      height: r.ms(44),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(6),
    },

    bar: {
      width: r.ms(5),
      borderRadius: r.ms(5),
      backgroundColor: "#C5FF4A",
    },

    title: {
      color: Theme.colors.text,
      fontSize: r.ms(13),
      fontWeight: "600",
      textAlign: "center",
    },

    progressTrack: {
      width: r.ms(100),
      height: r.ms(3),
      borderRadius: r.ms(3),
      overflow: "hidden",
      backgroundColor: "rgba(255,255,255,0.10)",
    },

    progressGlow: {
      width: "35%",
      height: "100%",
      borderRadius: r.ms(3),
      backgroundColor: "#C5FF4A",
    },
  }));
};

export const useSetLoading = (isLoading: boolean) => {
  const updateLoading = useLoading((state) => state.updateLoading);
  useEffect(() => {
    updateLoading(isLoading);
  }, [isLoading]);
};
