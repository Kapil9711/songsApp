import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/src/constants/theme";
import { moderateScale } from "react-native-size-matters";

const { width } = Dimensions.get("window");

const NAV_HEIGHT = moderateScale(50);

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

  const pathname = usePathname();

  if (pathname.includes("/songs-details")) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, moderateScale(6)),
        },
      ]}
    >
      {/* ------------------------------------------------------------ */}
      {/* Gradient border                                               */}
      {/* ------------------------------------------------------------ */}

      <LinearGradient
        colors={[
          "rgba(168,85,247,0.60)",
          "rgba(100,70,150,0.28)",
          "rgba(168,85,247,0.50)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        {/* ---------------------------------------------------------- */}
        {/* Navigation background                                      */}
        {/* ---------------------------------------------------------- */}

        <LinearGradient
          colors={["rgba(24,18,31,0.98)", "rgba(14,13,19,0.99)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.container}
        >
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
                {/* Active pill */}

                {/* {active && (
                  <LinearGradient
                    colors={["rgba(168,85,247,0.24)", "rgba(126,61,190,0.08)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.activePill}
                  />
                )} */}

                <View style={styles.tabContent}>
                  <View
                    style={[
                      styles.iconContainer,
                      active && styles.activeIconContainer,
                    ]}
                  >
                    <Ionicons
                      name={active ? tab.activeIcon : tab.icon}
                      size={moderateScale(active ? 20 : 19)}
                      color={active ? colors.primary : colors.textMuted}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[styles.label, active && styles.activeLabel]}
                  >
                    {tab.label}
                  </Text>
                </View>

                {/* Small active dot */}

                {active && <View style={styles.activeDot} />}
              </Pressable>
            );
          })}
        </LinearGradient>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ================================================================ */
  /* WRAPPER                                                          */
  /* ================================================================ */

  wrapper: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    alignItems: "center",

    paddingHorizontal: moderateScale(14),

    zIndex: 300,

    elevation: 30,
  },

  /* ================================================================ */
  /* OUTER BORDER                                                      */
  /* ================================================================ */

  border: {
    width: width - moderateScale(28),

    height: NAV_HEIGHT,

    padding: 1,

    borderRadius: moderateScale(8),

    shadowColor: colors.primary,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.18,

    shadowRadius: 12,

    elevation: 20,

    overflow: "hidden",
  },

  /* ================================================================ */
  /* INNER CONTAINER                                                   */
  /* ================================================================ */

  container: {
    flex: 1,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-around",

    paddingHorizontal: moderateScale(3),

    borderRadius: moderateScale(8),

    overflow: "hidden",
  },

  /* ================================================================ */
  /* TAB                                                               */
  /* ================================================================ */

  tab: {
    flex: 1,

    height: "100%",

    alignItems: "center",
    justifyContent: "center",

    position: "relative",

    borderRadius: moderateScale(16),

    paddingVertical: moderateScale(4),
  },

  tabPressed: {
    opacity: 0.65,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  /* ================================================================ */
  /* ACTIVE PILL                                                       */
  /* ================================================================ */

  activePill: {
    position: "absolute",

    top: moderateScale(5),
    bottom: moderateScale(5),

    left: moderateScale(8),
    right: moderateScale(8),

    borderRadius: moderateScale(15),

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.16)",
  },

  /* ================================================================ */
  /* TAB CONTENT                                                       */
  /* ================================================================ */

  tabContent: {
    alignItems: "center",

    justifyContent: "center",

    zIndex: 2,
  },

  /* ================================================================ */
  /* ICON                                                              */
  /* ================================================================ */

  iconContainer: {
    width: moderateScale(28),
    height: moderateScale(26),

    alignItems: "center",
    justifyContent: "center",

    borderRadius: moderateScale(9),
  },

  activeIconContainer: {
    backgroundColor: "rgba(168,85,247,0.12)",
    borderRadius: moderateScale(8),
  },

  /* ================================================================ */
  /* LABEL                                                             */
  /* ================================================================ */

  label: {
    marginTop: moderateScale(1),

    fontSize: moderateScale(8.5),

    lineHeight: moderateScale(11),

    fontWeight: "500",

    color: colors.textMuted,

    textAlign: "center",

    includeFontPadding: false,
  },

  activeLabel: {
    color: colors.primary,

    fontWeight: "700",
  },

  /* ================================================================ */
  /* ACTIVE DOT                                                        */
  /* ================================================================ */

  activeDot: {
    position: "absolute",

    bottom: moderateScale(3),
    left: moderateScale(-8),

    width: moderateScale(3.5),
    height: moderateScale(3.5),

    borderRadius: moderateScale(2),

    backgroundColor: colors.primary,

    shadowColor: colors.primary,

    shadowOpacity: 0.8,

    shadowRadius: 5,

    elevation: 5,

    zIndex: 4,
  },
});

export default BottomHeader;
