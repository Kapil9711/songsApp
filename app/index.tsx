import { colors } from "@/src/constants/theme";

import { useAuthStore } from "@/src/store/authStore";

import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function HomePage() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const user = useAuthStore((authStore) => authStore.user);
  const isInitializing = useAuthStore((state) => state.isInitializing);

  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (!isInitializing) return;
    if (user) router.replace("/(dashboard)/home");
    else router.replace("/(auth)/sign-in");
  }, [user, rootNavigationState, isInitializing]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* <SplashScreen /> */}
    </View>
  );
}
