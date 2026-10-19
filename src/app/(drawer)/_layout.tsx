import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: "left",
        swipeEnabled: true,
        swipeEdgeWidth: 300,
        drawerStyle: {
          backgroundColor: "#101010",
          width: 280,
        },
        drawerActiveTintColor: "#C5FF4A",
        drawerInactiveTintColor: "#929292",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: "Music",
          title: "Music",
        }}
      />

      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Settings",
          title: "Settings",
        }}
      />
    </Drawer>
  );
}
