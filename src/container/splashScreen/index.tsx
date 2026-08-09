import { colors } from "@/src/constants/theme";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/splash-screen-2.png")}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },
});

export default SplashScreen;
