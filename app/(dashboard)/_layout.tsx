import { View, ImageBackground } from "react-native";
import React from "react";
import { Slot } from "expo-router";
import BackgroundImageProvider, {
  useBackgroudImage,
} from "@/src/providers/BackgroundImage";
import Header from "@/src/container/dashboard/common/header";
import BottomHeader from "@/src/container/dashboard/common/bottom-header";
import AudioProvider from "@/src/providers/AudioProvider";
import AudioPlayer from "@/src/container/dashboard/common/audio-player";
import GlobalProvider from "@/src/providers/GlobalProvider";
import SocketProvider from "@/src/providers/socketProvider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DashboardLayout = () => {
  return (
    <SocketProvider>
      <BackgroundImageProvider>
        <BackgroundImageWrapper>
          <AudioProvider>
            <GlobalProvider>
              {/* <Toast /> */}
              {/* <RightDrawer /> */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,.91)",
                }}
              >
                <Slot />
                <AudioPlayer />
                <BottomHeader />
              </View>
            </GlobalProvider>
          </AudioProvider>
        </BackgroundImageWrapper>
      </BackgroundImageProvider>
    </SocketProvider>
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
        backgroundColor: "rgba(0, 0, 0, .7)",
      }}
      source={{ uri: image }}
    >
      {children}
    </ImageBackground>
  );
};

export default DashboardLayout;
