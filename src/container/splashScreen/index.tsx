import React from "react";
import { Image, View } from "react-native";

const SplashScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <Image
        source={require("@/assets/images/splash-screen.png")}
        className="flex-1"
      />
    </View>
  );
};

export default SplashScreen;
