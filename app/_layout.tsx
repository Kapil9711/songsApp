import { Stack } from "expo-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SplashScreen from "@/src/container/splashScreen";
import { colors } from "@/src/constants/theme";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();
const config = createTamagui(defaultConfig);

export default function RootLayout() {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const id = setTimeout(() => {
      setIsVisible(false);
    }, 2500);

    return () => clearTimeout(id);
  }, []);
  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <SafeAreaProvider>
        <TamaguiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {isVisible ? (
              <SplashScreen />
            ) : (
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    flex: 1,
                  },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(dashboard)" />
              </Stack>
            )}

            <StatusBar style="light" />

            <Toast />
          </QueryClientProvider>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
<StatusBar backgroundColor="rgba(0,0,0,.89)" />;
