import { View, ImageBackground } from "react-native";
import React from "react";
import { Slot } from "expo-router";
import BackgroundImageProvider, {
  useBackgroudImage,
} from "@/providers/BackgroundImage";
import Header, { RightDrawer } from "@/container/dashboard/common/header";
import BottomHeader from "@/container/dashboard/common/bottom-header";
import AudioProvider from "@/providers/AudioProvider";
import AudioPlayer from "@/container/dashboard/common/audio-player";
import GlobalProvider from "@/providers/GlobalProvider";
import SocketProvider from "@/providers/socketProvider";

const DashboardLayout = () => {
  return (
    <SocketProvider>
      <BackgroundImageProvider>
        <BackgroundImageWrapper>
          <AudioProvider>
            <GlobalProvider>
              {/* <Toast /> */}
              <RightDrawer />
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,.89)",
                }}
              >
                <Header />
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
