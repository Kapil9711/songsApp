import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Avatar } from "tamagui";
import { usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { SearchBar } from "../search-bar";
import { colors } from "@/src/constants/theme";
import { RightDrawer } from "./rightDrawer";

const Header = () => {
  const currentPath = usePathname();
  const insets = useSafeAreaInsets();

  const [drawerOpen, setDrawerOpen] = useState(false);

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
            // paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          {/* Profile */}
          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.pressed,
            ]}
          >
            <Avatar circular size="$3">
              <Avatar.Image
                accessibilityLabel="Profile"
                src="https://res.cloudinary.com/deyhhkkmr/image/upload/v1739944680/uploads/zxnukungugjvhy3064ma.png"
              />

              <Avatar.Fallback backgroundColor={colors.surfaceElevated}>
                <Text style={styles.avatarFallback}>M</Text>
              </Avatar.Fallback>
            </Avatar>

            {/* Online indicator */}
            <View style={styles.onlineIndicator} />
          </Pressable>

          {/* Search */}
          <View style={styles.searchContainer}>
            <SearchBar />
          </View>

          {/* Menu */}
          <Pressable
            onPress={() => setDrawerOpen(true)}
            style={({ pressed }) => [
              styles.menuButton,
              pressed && styles.menuButtonPressed,
            ]}
          >
            <Ionicons name="menu-outline" size={25} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Drawer */}
      <RightDrawer
        open={drawerOpen as any}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    width: "100%",

    backgroundColor: colors.background,

    paddingHorizontal: 14,
    paddingBottom: 10,

    borderBottomWidth: 1,
    borderBottomColor: "rgba(39, 39, 42, 0.65)",
  },

  headerContent: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  profileButton: {
    width: 44,
    height: 44,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    position: "relative",
  },

  onlineIndicator: {
    position: "absolute",

    right: 1,
    bottom: 1,

    width: 10,
    height: 10,

    borderRadius: 5,

    backgroundColor: colors.success,

    borderWidth: 2,
    borderColor: colors.background,
  },

  avatarFallback: {
    color: colors.text,

    fontSize: 15,

    fontWeight: "700",
  },

  searchContainer: {
    flex: 1,

    height: 44,

    justifyContent: "center",
  },

  menuButton: {
    width: 44,
    height: 44,

    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  menuButtonPressed: {
    backgroundColor: colors.surfaceElevated,

    transform: [
      {
        scale: 0.94,
      },
    ],
  },

  pressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.95,
      },
    ],
  },
});

export default Header;
