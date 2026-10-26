import CustomDrawer from "@/components/navigation/customDrawer";
import { useTheme } from "@/themes/theme.context";
import { Drawer } from "expo-router/drawer";
import { useWindowDimensions } from "react-native";

export default function DrawerLayout() {
  const { width } = useWindowDimensions();
  const { Theme } = useTheme();

  return (
    <Drawer
      drawerContent={() => <CustomDrawer />}
      screenOptions={{
        headerShown: true,
        drawerPosition: "left",
        drawerType: "slide",
        swipeEnabled: true,
        swipeEdgeWidth: Math.min(width * 0.1, 100),
        drawerStyle: {
          backgroundColor: Theme.colors.background,
          width: Math.min(width * 0.8, 450),
        },
        drawerActiveTintColor: "#C5FF4A",
        drawerInactiveTintColor: "#929292",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerShown: false,
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
