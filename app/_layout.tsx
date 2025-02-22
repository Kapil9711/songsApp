import { Stack } from "expo-router";
import { TamaguiProvider, createTamagui } from "@tamagui/core";
import { defaultConfig } from "@tamagui/config/v4";
import { QueryClientProvider } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { StatusBar } from "react-native";
import Toast from "react-native-toast-message";
import { Text, TextInput } from "@/providers/CustomText";
import { useEffect } from "react";

const queryClient = new QueryClient();
const config = createTamagui(defaultConfig);

export default function RootLayout() {
  // useEffect(() => {
  //   // Disable font scaling globally
  //   if (Platform.OS === "android" || Platform.OS === "ios") {
  //     Text.defaultProps = Text.defaultProps || {};
  //     Text.defaultProps.allowFontScaling = false;

  //     TextInput.defaultProps = TextInput.defaultProps || {};
  //     TextInput.defaultProps.allowFontScaling = false;
  //   }
  // }, []);
  return (
    <TamaguiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar backgroundColor="rgba(0,0,0,.93)" />
        <Toast />
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
<StatusBar backgroundColor="rgba(0,0,0,.89)" />;
