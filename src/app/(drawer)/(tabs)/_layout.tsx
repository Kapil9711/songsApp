import CustomTabBar from "@/components/bottomTabs";
import { useTheme } from "@/themes/theme.context";
import { TopTabs } from "expo-router/js-top-tabs";

export default function TabsLayout() {
  const { Theme } = useTheme();

  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        swipeEnabled: true,
        // lazy: true,
        animationEnabled: true,
        tabBarStyle: {
          backgroundColor: Theme.colors.background,
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
