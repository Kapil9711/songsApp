import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View, useWindowDimensions } from "react-native";
import ImageColors from "react-native-image-colors";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

import { usePlayerStore } from "@/store/player.store";

type GradientColors = [string, string, ...string[]];

const DEFAULT_COLORS: GradientColors = ["#6355A5", "#3F527D", "#24243A"];

const AnimatedView = Animated.View;

export default function NowPlayingBackground() {
  const artwork: any = usePlayerStore((state) => state.activeTrack?.artworkUrl);

  const { width, height } = useWindowDimensions();

  const [colors, setColors] = useState<GradientColors>(DEFAULT_COLORS);

  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;

    const extractColors = async () => {
      if (!artwork) {
        setColors(DEFAULT_COLORS);
        return;
      }

      try {
        const result: any = await ImageColors.getColors(artwork, {
          fallback: DEFAULT_COLORS[0],
          cache: true,
          key: artwork,
          quality: "low",
        });

        if (cancelled) return;

        let extracted: GradientColors;

        if (result.platform === "android") {
          extracted = [
            result.vibrant || result.dominant || DEFAULT_COLORS[0],
            result.darkVibrant || result.darkMuted || DEFAULT_COLORS[1],
            result.darkMuted || DEFAULT_COLORS[2],
          ];
        } else {
          extracted = [
            result.primary || result.background || DEFAULT_COLORS[0],
            result.secondary || result.detail || DEFAULT_COLORS[1],
            result.background || DEFAULT_COLORS[2],
          ];
        }

        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (!finished || cancelled) return;

          setColors(extracted);

          Animated.timing(opacity, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }).start();
        });
      } catch (error) {
        console.warn("Failed to extract album artwork colors:", error);
      }
    };

    extractColors();

    return () => {
      cancelled = true;
    };
  }, [artwork, opacity]);

  const [colorA, colorB, colorC] = colors;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <AnimatedView style={[StyleSheet.absoluteFill, { opacity }]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            {/* Broad, feathered album-color bloom */}
            <RadialGradient id="topBloom" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colorA} stopOpacity={0.32} />
              <Stop offset="38%" stopColor={colorA} stopOpacity={0.17} />
              <Stop offset="72%" stopColor={colorA} stopOpacity={0.05} />
              <Stop offset="100%" stopColor={colorA} stopOpacity={0} />
            </RadialGradient>

            {/* Secondary, cooler color haze */}
            <RadialGradient id="sideBloom" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colorB} stopOpacity={0.24} />
              <Stop offset="45%" stopColor={colorB} stopOpacity={0.12} />
              <Stop offset="100%" stopColor={colorB} stopOpacity={0} />
            </RadialGradient>

            {/* Gentle lower glow */}
            <RadialGradient id="bottomBloom" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={colorC} stopOpacity={0.2} />
              <Stop offset="48%" stopColor={colorC} stopOpacity={0.09} />
              <Stop offset="100%" stopColor={colorC} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Wide glow across the upper screen */}
          <Ellipse
            cx={width * 0.5}
            cy={height * 0.13}
            rx={width * 0.82}
            ry={height * 0.25}
            fill="url(#topBloom)"
          />

          {/* Diffused color drifting in from one side */}
          <Ellipse
            cx={width * 0.96}
            cy={height * 0.43}
            rx={width * 0.62}
            ry={height * 0.25}
            fill="url(#sideBloom)"
          />

          {/* Soft color rising from the bottom */}
          <Ellipse
            cx={width * 0.32}
            cy={height * 0.91}
            rx={width * 0.78}
            ry={height * 0.24}
            fill="url(#bottomBloom)"
          />
        </Svg>
      </AnimatedView>
    </View>
  );
}
