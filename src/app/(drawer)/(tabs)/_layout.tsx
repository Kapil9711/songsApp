import CustomTabBar from "@/components/navigation/bottomTabs";
import { TopTabs } from "expo-router/js-top-tabs";

export default function TabsLayout() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={() => <CustomTabBar />}
      screenOptions={{
        swipeEnabled: true,
        // lazy: true,
        animationEnabled: true,
      }}
    >
      <TopTabs.Screen name="home" options={{ title: "Home" }} />
      <TopTabs.Screen name="search" options={{ title: "Search" }} />
      <TopTabs.Screen name="library" options={{ title: "Library" }} />
      <TopTabs.Screen name="profile" options={{ title: "Profile" }} />
    </TopTabs>
  );
}
