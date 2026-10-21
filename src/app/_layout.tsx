import PlayerBootstrap from "@/components/player/player.bootstrap";
import { PlayerForegroundSync } from "@/components/player/player.foregroundSync";
import SplashScreen from "@/components/splashScreen";
import { CQueryClientProvider } from "@/provider/queryClientProvider";
import { ThemeProvider, useTheme } from "@/themes/theme.context";
import { Stack, useRootNavigationState } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <CQueryClientProvider>
          <ThemeProvider>
            <RootStack />
          </ThemeProvider>
        </CQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const RootStack = () => {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("default");
  }, []);

  const { Theme } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const rootNavigationState = useRootNavigationState();
  useEffect(() => {
    if (rootNavigationState?.key) {
      setShowSplash(false);
    }
  }, [rootNavigationState?.key]);

  return (
    <View style={[Theme.styles.Bg, { flex: 1 }]}>
      <PlayerBootstrap />
      <PlayerForegroundSync />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 200,
          gestureEnabled: true,
          contentStyle: [{ flex: 1 }, Theme.styles.Bg],
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="(auth)" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
