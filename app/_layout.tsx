import { useEffect, useState } from "react";
import { Stack, useRootNavigationState } from "expo-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SplashScreen from "@/src/container/splashScreen";
import { colors } from "@/src/constants/theme";
import { View } from "react-native";

const queryClient = new QueryClient();
const config = createTamagui(defaultConfig);

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (rootNavigationState?.key) {
      setShowSplash(false);
    }
  }, [rootNavigationState?.key]);

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <SafeAreaProvider>
        <TamaguiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  flex: 1,
                  backgroundColor: colors.background,
                },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(dashboard)" />
            </Stack>

            {showSplash && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 1000,
                  elevation: 1000,
                  height: "100%",
                  width: "100%",
                }}
              >
                <SplashScreen />
              </View>
            )}

            <StatusBar style="light" />
            <Toast />
          </QueryClientProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
