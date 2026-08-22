import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import ImageColors from "react-native-image-colors";

import { useBackgroudImage } from "@/src/providers/BackgroundImage";

const DEFAULT_BACKGROUND = "#0A0A0B";

type GradientColors = {
  dominant: string;
  secondary: string;
};

const BackgroundImageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { image } = useBackgroudImage();

  const [gradientColors, setGradientColors] = useState<GradientColors>({
    dominant: "#34343A",
    secondary: "#17171B",
  });

  useEffect(() => {
    if (!image) {
      setGradientColors({
        dominant: "#34343A",
        secondary: "#17171B",
      });

      return;
    }

    let cancelled = false;

    const extractColors = async () => {
      try {
        const result: any = await ImageColors.getColors(image, {
          fallback: DEFAULT_BACKGROUND,
          cache: true,
          key: image,
        });

        console.log("IMAGE COLORS:", result);

        if (cancelled) return;

        let dominant = DEFAULT_BACKGROUND;

        if (result.platform === "android") {
          /*
           * Prefer vibrant because it usually gives
           * a stronger representation of the artwork.
           */
          dominant =
            result.vibrant ||
            result.dominant ||
            result.darkVibrant ||
            result.lightVibrant ||
            result.muted ||
            DEFAULT_BACKGROUND;
        } else {
          dominant =
            result.primary ||
            result.background ||
            result.secondary ||
            result.detail ||
            DEFAULT_BACKGROUND;
        }

        /*
         * Don't change the hue.
         *
         * Only make the extracted color suitable
         * for a dark background.
         */
        const adjusted = adjustBrightness(dominant);

        const secondary = darkenColor(adjusted, 0.35);

        console.log("RAW:", dominant);
        console.log("ADJUSTED:", adjusted);

        setGradientColors({
          dominant: adjusted,
          secondary,
        });
      } catch (error) {
        console.log("Failed to extract image colors:", error);

        if (!cancelled) {
          setGradientColors({
            dominant: "#34343A",
            secondary: "#17171B",
          });
        }
      }
    };

    extractColors();

    return () => {
      cancelled = true;
    };
  }, [image]);

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          {/* Main glow */}
          <RadialGradient id="mainGlow" cx="70%" cy="0%" rx="90%" ry="75%">
            <Stop
              offset="0%"
              stopColor={gradientColors.dominant}
              stopOpacity={0.9}
            />

            <Stop
              offset="25%"
              stopColor={gradientColors.dominant}
              stopOpacity={0.62}
            />

            <Stop
              offset="50%"
              stopColor={gradientColors.dominant}
              stopOpacity={0.32}
            />

            <Stop
              offset="75%"
              stopColor={gradientColors.secondary}
              stopOpacity={0.12}
            />

            <Stop
              offset="100%"
              stopColor={DEFAULT_BACKGROUND}
              stopOpacity={0}
            />
          </RadialGradient>

          {/* Bottom glow */}
          <RadialGradient id="secondaryGlow" cx="0%" cy="90%" rx="75%" ry="65%">
            <Stop
              offset="0%"
              stopColor={gradientColors.dominant}
              stopOpacity={0.32}
            />

            <Stop
              offset="40%"
              stopColor={gradientColors.dominant}
              stopOpacity={0.18}
            />

            <Stop
              offset="70%"
              stopColor={gradientColors.secondary}
              stopOpacity={0.06}
            />

            <Stop
              offset="100%"
              stopColor={DEFAULT_BACKGROUND}
              stopOpacity={0}
            />
          </RadialGradient>
        </Defs>

        {/* Base */}
        <Rect width="100%" height="100%" fill={DEFAULT_BACKGROUND} />

        {/* Main glow */}
        <Rect width="100%" height="100%" fill="url(#mainGlow)" />

        {/* Bottom glow */}
        <Rect width="100%" height="100%" fill="url(#secondaryGlow)" />
      </Svg>

      {children}
    </View>
  );
};

/**
 * Adjust brightness WITHOUT changing hue.
 *
 * This is the important part.
 */
const adjustBrightness = (hex: string): string => {
  try {
    const { r, g, b } = hexToRgb(hex);

    /*
     * Perceived brightness.
     *
     * This tells us whether the extracted
     * color is too dark or too bright.
     */
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    /*
     * Very dark colors:
     * lift them so they remain visible.
     */
    if (luminance < 45) {
      return mixColor(hex, "#FFFFFF", 0.18);
    }

    /*
     * Slightly dark colors:
     * small brightness boost.
     */
    if (luminance < 80) {
      return mixColor(hex, "#FFFFFF", 0.1);
    }

    /*
     * Very bright colors:
     * bring them toward the dark theme.
     */
    if (luminance > 190) {
      return mixColor(hex, DEFAULT_BACKGROUND, 0.25);
    }

    /*
     * Already good.
     */
    return hex;
  } catch {
    return "#34343A";
  }
};

const mixColor = (color1: string, color2: string, amount: number): string => {
  const a = hexToRgb(color1);
  const b = hexToRgb(color2);

  const r = Math.round(a.r + (b.r - a.r) * amount);

  const g = Math.round(a.g + (b.g - a.g) * amount);

  const bValue = Math.round(a.b + (b.b - a.b) * amount);

  return rgbToHex(r, g, bValue);
};

const darkenColor = (hex: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hex);

  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
  );
};

const hexToRgb = (hex: string) => {
  let clean = hex.replace("#", "");

  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((x) => x + x)
      .join("");
  }

  if (clean.length !== 6) {
    throw new Error("Invalid color");
  }

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return `#${[r, g, b]
    .map((value) =>
      Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0"),
    )
    .join("")}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DEFAULT_BACKGROUND,
  },
});

export default BackgroundImageWrapper;
