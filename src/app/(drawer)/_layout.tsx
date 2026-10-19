import { useTheme } from "@/themes/theme.context";
import { Drawer } from "expo-router/drawer";
import { useWindowDimensions } from "react-native";

export default function DrawerLayout() {
  const { width } = useWindowDimensions();
  const { Theme } = useTheme();
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerPosition: "left",
        swipeEnabled: true,
        swipeEdgeWidth: width * 0.3,
        drawerStyle: {
          backgroundColor: Theme.colors.background,
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
