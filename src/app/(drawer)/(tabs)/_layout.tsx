import CustomTabBar from "@/components/navigation/bottomTabs";
import { useTheme } from "@/themes/theme.context";
import { TopTabs } from "expo-router/js-top-tabs";

export default function TabsLayout() {
  const { Theme } = useTheme();

  return (
    <TopTabs
      style={{
        backgroundColor: Theme.colors.background,
      }}
      // sceneContainerStyle={{
      //   backgroundColor: Theme.colors.background,
      // }}
      tabBarPosition="bottom"
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        swipeEnabled: true,
        animationEnabled: true,
        sceneStyle: {
          backgroundColor: Theme.colors.background,
        },
      }}
    >
      <TopTabs.Screen name="home" options={{ title: "Home" }} />

      <TopTabs.Screen name="search" options={{ title: "Search" }} />

      <TopTabs.Screen name="favorite" options={{ title: "Favorite" }} />

      {/* Uncomment when these routes are ready */}
      <TopTabs.Screen name="library" options={{ title: "Library" }} />
      {/* <TopTabs.Screen name="profile" options={{ title: "Profile" }} /> */}
    </TopTabs>
  );
}
