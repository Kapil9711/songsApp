import { ThemeProvider, useTheme } from "@/themes/theme.context";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <RootStack />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const RootStack = () => {
  const { setTheme } = useTheme();
  const { Theme } = useTheme();

  useEffect(() => {
    setTheme("default");
  }, []);

  return (
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
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
