import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/themes/theme.context";

import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function HomePage() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const user = useAuthStore((authStore) => authStore.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const { Theme } = useTheme();

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (isInitializing) return;
    if (user) router.replace("/(drawer)/(tabs)/home");
    else router.replace("/(auth)/sign-in");
  }, [user, rootNavigationState?.key, isInitializing]);

  return (
    <View style={{ flex: 1, backgroundColor: Theme.colors.background }}></View>
  );
}
