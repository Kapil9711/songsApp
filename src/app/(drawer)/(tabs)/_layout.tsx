import { useTheme } from "@/themes/theme.context";
import { TopTabs } from "expo-router/js-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { Theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <TopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
        animationEnabled: true,

        tabBarStyle: {
          backgroundColor: Theme.colors.background,
        },

        tabBarActiveTintColor: Theme.colors.accent,
        tabBarInactiveTintColor: Theme.colors.text,
        tabBarIndicatorStyle: {
          backgroundColor: Theme.colors.text,
        },
      }}
    >
      <TopTabs.Screen name="index" options={{ title: "Home" }} />
      <TopTabs.Screen name="search" options={{ title: "Search" }} />
      <TopTabs.Screen name="library" options={{ title: "Library" }} />
      <TopTabs.Screen name="profile" options={{ title: "Profile" }} />
    </TopTabs>
  );
}
