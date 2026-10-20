import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-fluid-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ROUTES = [
  {
    name: "index",
    path: "/",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "search",
    path: "/search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "library",
    path: "/library",
    label: "Library",
    icon: "library-outline",
    activeIcon: "library",
  },
  {
    name: "profile",
    path: "/profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
] as const;

export default function CustomTabBar() {
  const { Theme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Theme.colors.background,
          paddingBottom: Math.max(insets.bottom, moderateScale(14)),
          borderTopColor: Theme.colors.text,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      {TAB_ROUTES.map((tab) => {
        const focused =
          tab.path === "/"
            ? pathname === "/"
            : pathname === tab.path || pathname.startsWith(`${tab.path}/`);

        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: focused }}
            onPress={() => {
              if (!focused) {
                router.navigate(tab.path);
              }
            }}
            style={styles.tab}
          >
            <Ionicons
              name={focused ? tab.activeIcon : tab.icon}
              size={moderateScale(22)}
              color={focused ? Theme.colors.accent : Theme.colors.text}
            />

            <Text
              style={[
                styles.label,
                {
                  color: focused ? Theme.colors.accent : Theme.colors.text,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: moderateScale(10),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(4),
  },
  label: {
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
});
