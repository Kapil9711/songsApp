import { View } from "react-native";
import React from "react";
import { Slot, Stack } from "expo-router";
import BackgroundImageProvider from "@/src/providers/BackgroundImage";
import BottomHeader from "@/src/container/dashboard/common/bottom-header";
import AudioProvider from "@/src/providers/AudioProvider";
import AudioPlayer from "@/src/container/dashboard/common/audio-player";
import GlobalProvider from "@/src/providers/GlobalProvider";
import SocketProvider from "@/src/providers/socketProvider";
import { PlayerProvider } from "@/src/providers/PlaterProvider";
import BackgroundImageWrapper from "@/src/container/dashboard/common/background";
import { RightDrawer } from "@/src/container/dashboard/common/header/rightDrawer";

const DashboardLayout = () => {
  return (
    <SocketProvider>
      <BackgroundImageProvider>
        <BackgroundImageWrapper>
          <GlobalProvider>
            <PlayerProvider>
              {/* <Toast /> */}
              <RightDrawer />
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,.6)",
                }}
              >
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    animationDuration: 250,
                    gestureEnabled: true,
                    contentStyle: {
                      flex: 1,
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <Stack.Screen name="favorites/index" />
                  <Stack.Screen name="file/index" />
                  <Stack.Screen name="friends/index" />
                  <Stack.Screen name="home/index" />
                  <Stack.Screen name="home/album" />
                  <Stack.Screen name="home/playlist" />
                  <Stack.Screen name="home/songs" />
                  <Stack.Screen name="home/songs-details" />
                </Stack>
                <AudioPlayer />
                <BottomHeader />
              </View>
            </PlayerProvider>
          </GlobalProvider>
        </BackgroundImageWrapper>
      </BackgroundImageProvider>
    </SocketProvider>
  );
};

export default DashboardLayout;
