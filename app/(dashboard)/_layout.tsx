import { View, Text, ImageBackground, StyleSheet } from "react-native";
import React from "react";
import { Slot } from "expo-router";
import BackgroundImageProvider, {
  useBackgroudImage,
} from "@/providers/BackgroundImage";
import Header from "@/container/dashboard/common/header";

const DashboardLayout = () => {
  return (
    <BackgroundImageProvider>
      <BackgroundImageWrapper>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,.7)",
          }}
        >
          <Header />
          <Slot />
        </View>
      </BackgroundImageWrapper>
    </BackgroundImageProvider>
  );
};

const BackgroundImageWrapper = ({ children }: { children: any }) => {
  const { image } = useBackgroudImage();
  return (
    <ImageBackground
      style={{
        display: "flex",
        flex: 1,
        backgroundSize: "cover",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
      }}
      source={{ uri: image }}
    >
      {children}
    </ImageBackground>
  );
};

export default DashboardLayout;
