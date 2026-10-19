import { TopTabs } from "expo-router/js-top-tabs";

export default function TabsLayout() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      screenOptions={{
        swipeEnabled: true,
        lazy: true,
        animationEnabled: true,
        tabBarStyle: {
          backgroundColor: "#101010",
        },

        tabBarActiveTintColor: "#C5FF4A",
        tabBarInactiveTintColor: "#929292",
        tabBarIndicatorStyle: {
          backgroundColor: "#C5FF4A",
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
