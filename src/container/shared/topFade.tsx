import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/src/constants/theme";

type TopFadeProps = {
  height?: number;
};

const TopFade = ({ height = 32 }: TopFadeProps) => {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          height,
        },
      ]}
    >
      <LinearGradient
        colors={[
          colors.background,
          "rgba(18, 15, 22, 0.92)",
          "rgba(18, 15, 22, 0.55)",
          "rgba(18, 15, 22, 0)",
        ]}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",

    top: 0,
    left: 0,
    right: 0,

    zIndex: 50,

    overflow: "hidden",
  },
});

export default TopFade;
