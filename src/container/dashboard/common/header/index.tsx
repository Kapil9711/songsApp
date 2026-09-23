import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "tamagui";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { moderateScale } from "react-native-size-matters";

import { SearchBar } from "../search-bar";
import { colors } from "@/src/constants/theme";
import { RightDrawer } from "./rightDrawer";
import { HomeHeader } from "../../home";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
// import DrawerButton from "@/src/container/shared/drawerButton";

const Header = () => {
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  const { drawerOpen, setDrawerOpen } = useGlobalContext();

  const shouldShowHeader =
    (currentPath.includes("home") || currentPath.includes("file")) &&
    !currentPath.includes("songs-details");

  if (!shouldShowHeader) {
    return null;
  }

  return (
    <>
      <View
        style={[
          styles.header,
          {
            // paddingTop: insets.top + moderateScale(5),
          },
        ]}
      >
        {/* ======================================================== */}
        {/* SUBTLE TOP PURPLE GLOW                                   */}
        {/* ======================================================== */}
        {/* 
        <LinearGradient
          colors={[
            "rgba(168,85,247,0.55)",
            "rgba(168,85,247,0.16)",
            "rgba(168,85,247,0)",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={styles.topGlow}
        /> */}

        {/* ======================================================== */}
        {/* HEADER CONTENT                                            */}
        {/* ======================================================== */}

        <View style={styles.headerContent}>
          {/* ---------------------------------------------------- */}
          {/* PROFILE                                               */}
          {/* ---------------------------------------------------- */}

          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.profilePressed,
            ]}
          >
            {/* Purple ring */}

            {/* <DrawerButton /> */}

            <LinearGradient
              colors={["rgba(168,85,247,0.95)", "rgba(112,56,180,0.35)"]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Avatar>
                  <Avatar.Image
                    accessibilityLabel="Profile"
                    src="https://res.cloudinary.com/deyhhkkmr/image/upload/v1739944680/uploads/zxnukungugjvhy3064ma.png"
                    style={styles.avatar}
                  />

                  <Avatar.Fallback backgroundColor={colors.surfaceElevated}>
                    <Text style={styles.avatarFallback}>M</Text>
                  </Avatar.Fallback>
                </Avatar>
              </View>
            </LinearGradient>

            {/* Online indicator */}

            <View style={styles.onlineIndicator} />
          </Pressable>

          {/* ---------------------------------------------------- */}
          {/* SEARCH                                                */}
          {/* ---------------------------------------------------- */}

          <Greetings />

          {/* <HomeHeader /> */}

          {/* <View style={styles.searchContainer}>
            <View style={styles.searchBackground}>
              <SearchBar />
            </View>
          </View> */}

          {/* ---------------------------------------------------- */}
          {/* MENU                                                  */}
          {/* ---------------------------------------------------- */}

          <Pressable
            onPress={() => setDrawerOpen(true)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
          >
            <Ionicons
              name="menu-outline"
              size={moderateScale(23)}
              color={"grey"}
            />
          </Pressable>
        </View>

        {/* ======================================================== */}
        {/* BOTTOM ACCENT                                            */}
        {/* ======================================================== */}

        {/* <LinearGradient
          colors={[
            "rgba(168,85,247,0)",
            "rgba(168,85,247,0.20)",
            "rgba(168,85,247,0)",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={styles.bottomAccent}
        /> */}
      </View>

      {/* ========================================================== */}
      {/* DRAWER                                                     */}
      {/* ========================================================== */}
    </>
  );
};

const Greetings = ({ showHeader = true }: any) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good evening";
    }

    return "Good night";
  }, []);

  return (
    <View style={[styles.container, { paddingHorizontal: moderateScale(5) }]}>
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>{greeting}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ================================================================ */
  /* HEADER                                                           */
  /* ================================================================ */

  container: {
    flex: 1,
    // backgroundColor: ,
    position: "relative",
  },

  greetingContainer: {
    // marginTop: moderateScale(16),
    paddingHorizontal: moderateScale(5),
  },

  greeting: {
    fontSize: moderateScale(25),
    fontWeight: "800",
    letterSpacing: -0.6,
    color: colors.text,
  },

  subtitle: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(12),
    color: colors.textSecondary,
  },

  header: {
    width: "100%",

    // paddingHorizontal: moderateScale(14),

    paddingBottom: moderateScale(9),

    // backgroundColor: colors.background,

    position: "relative",

    overflow: "hidden",
  },

  /* ================================================================ */
  /* HEADER CONTENT                                                    */
  /* ================================================================ */

  headerContent: {
    height: moderateScale(48),

    flexDirection: "row",

    alignItems: "center",

    gap: moderateScale(9),
  },

  /* ================================================================ */
  /* TOP GLOW                                                         */
  /* ================================================================ */

  topGlow: {
    position: "absolute",

    top: 0,

    left: moderateScale(35),
    right: moderateScale(35),

    height: moderateScale(2),

    borderRadius: moderateScale(2),
  },

  /* ================================================================ */
  /* PROFILE                                                           */
  /* ================================================================ */

  profileButton: {
    width: moderateScale(43),
    height: moderateScale(43),

    alignItems: "center",
    justifyContent: "center",

    position: "relative",
  },

  avatarRing: {
    width: moderateScale(42),
    height: moderateScale(42),

    borderRadius: moderateScale(21),

    padding: 1,

    alignItems: "center",
    justifyContent: "center",

    shadowColor: colors.primary,

    shadowOpacity: 0.22,

    shadowRadius: 8,

    elevation: 4,
  },

  avatarInner: {
    width: "100%",
    height: "100%",

    borderRadius: moderateScale(21),

    padding: 2,

    backgroundColor: colors.background,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",

    borderRadius: moderateScale(19),
  },

  avatarFallback: {
    color: colors.text,

    fontSize: moderateScale(14),

    fontWeight: "800",
  },

  onlineIndicator: {
    position: "absolute",

    right: 0,
    bottom: 0,

    width: moderateScale(11),
    height: moderateScale(11),

    borderRadius: moderateScale(6),

    backgroundColor: colors.success,

    borderWidth: 2,

    borderColor: colors.background,

    shadowColor: colors.success,

    shadowOpacity: 0.45,

    shadowRadius: 5,

    elevation: 4,
  },

  profilePressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },

  /* ================================================================ */
  /* SEARCH                                                           */
  /* ================================================================ */

  searchContainer: {
    flex: 1,

    height: moderateScale(43),

    justifyContent: "center",

    minWidth: 0,
  },

  searchBackground: {
    flex: 1,

    justifyContent: "center",

    borderRadius: moderateScale(22),

    // overflow: "hidden",

    // backgroundColor: "rgba(255,255,255,0.035)",

    // borderWidth: 1,

    // borderColor: "rgba(168,85,247,0.16)",
  },

  /* ================================================================ */
  /* MENU                                                              */
  /* ================================================================ */

  menuButton: {
    width: moderateScale(43),
    height: moderateScale(43),

    borderRadius: moderateScale(15),

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "rgba(168,85,247,0.18)",

    backgroundColor: "rgba(255,255,255,0.025)",
  },

  menuBackground: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonPressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  /* ================================================================ */
  /* BOTTOM ACCENT                                                     */
  /* ================================================================ */

  bottomAccent: {
    position: "absolute",

    left: moderateScale(30),
    right: moderateScale(30),

    bottom: 0,

    height: 1,
  },
});

export default Header;
