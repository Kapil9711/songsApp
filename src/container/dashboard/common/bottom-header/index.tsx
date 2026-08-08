import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/constants/theme";

const { width } = Dimensions.get("window");

type TabItem = {
  key: string;
  label: string;
  route: string;
  activePath: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const tabs: TabItem[] = [
  {
    key: "home",
    label: "Home",
    route: "/(dashboard)/home",
    activePath: "home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    key: "favorites",
    label: "Favorites",
    route: "/(dashboard)/favorites",
    activePath: "favorites",
    icon: "heart-outline",
    activeIcon: "heart",
  },
  {
    key: "friends",
    label: "Friends",
    route: "/(dashboard)/friends",
    activePath: "friends",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    key: "file",
    label: "Downloads",
    route: "/(dashboard)/file",
    activePath: "/file",
    icon: "folder-outline",
    activeIcon: "folder",
  },
];

const BottomHeader = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  const isActive = (tab: TabItem) => {
    return currentPath.includes(tab.activePath);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.container}>
        {/* Top subtle highlight */}
        <View style={styles.topHighlight} />

        {tabs.map((tab) => {
          const active = isActive(tab);

          return (
            <Pressable
              key={tab.key}
              onPress={() => router.push(tab.route as any)}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  active && styles.activeIconContainer,
                ]}
              >
                <Ionicons
                  name={active ? tab.activeIcon : tab.icon}
                  size={active ? 23 : 22}
                  color={active ? colors.primary : colors.textMuted}
                />
              </View>

              <Text
                numberOfLines={1}
                style={[styles.label, active && styles.activeLabel]}
              >
                {tab.label}
              </Text>

              {/* Active indicator */}
              {active && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    alignItems: "center",

    paddingHorizontal: 12,

    zIndex: 100,
  },

  container: {
    width: width - 24,

    height: 72,

    borderRadius: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.35,

    shadowRadius: 14,

    elevation: 16,

    overflow: "hidden",
  },

  topHighlight: {
    position: "absolute",

    top: 0,
    left: 35,
    right: 35,

    height: 1,

    backgroundColor: "rgba(168, 85, 247, 0.35)",
  },

  tab: {
    flex: 1,

    height: "100%",

    alignItems: "center",
    justifyContent: "center",

    position: "relative",

    paddingTop: 2,
  },

  tabPressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  iconContainer: {
    width: 44,
    height: 38,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "transparent",
  },

  activeIconContainer: {
    backgroundColor: "rgba(168, 85, 247, 0.13)",

    shadowColor: colors.primary,

    shadowOpacity: 0.15,

    shadowRadius: 8,

    elevation: 3,
  },

  label: {
    marginTop: 2,

    fontSize: 9,

    fontWeight: "500",

    color: colors.textMuted,

    letterSpacing: 0.1,
  },

  activeLabel: {
    color: colors.primary,

    fontWeight: "700",
  },

  activeIndicator: {
    position: "absolute",

    bottom: 5,

    width: 4,
    height: 4,

    borderRadius: 2,

    backgroundColor: colors.primary,

    shadowColor: colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 5,

    elevation: 4,
  },
});

export default BottomHeader;
