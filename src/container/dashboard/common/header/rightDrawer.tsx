import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Switch } from "tamagui";

import axiosInstance from "../../../../network/api";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { exportToDownloads, setValueInAsync } from "@/src/utilities/helpers";
import { colors } from "@/src/constants/theme";

const { width, height } = Dimensions.get("window");

const DRAWER_WIDTH = width * 0.78;

type RightDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const RightDrawer = ({ open, onClose }: RightDrawerProps) => {
  const translateX = useSharedValue(DRAWER_WIDTH);

  const router = useRouter();

  const { user } = useGlobalContext();

  const [isSwitchOn, setIsSwitchOn] = useState(
    user?.isFavouritePublic ?? false,
  );

  useEffect(() => {
    setIsSwitchOn(user?.isFavouritePublic ?? false);
  }, [user?.isFavouritePublic]);

  //   const openDrawer = () => {
  //     setOpen(true);

  //     translateX.value = withTiming(0, {
  //       duration: 250,
  //     });
  //   };

  const closeDrawer = () => {
    translateX.value = withTiming(
      DRAWER_WIDTH,
      {
        duration: 220,
      },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  useEffect(() => {
    if (open) {
      translateX.value = withTiming(0, {
        duration: 250,
      });
    } else {
      translateX.value = withTiming(DRAWER_WIDTH, {
        duration: 220,
      });
    }
  }, [open]);

  const updateUser = async (value: boolean) => {
    try {
      const { data } = await axiosInstance.put("/user", {
        isFavouritePublic: value,
      });

      if (data.success) {
        await setValueInAsync("user", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("Failed to update user settings:", error);

      setIsSwitchOn((prev: any) => !prev);
    }
  };

  const onToggleSwitch = () => {
    setIsSwitchOn((prev: any) => {
      const nextValue = !prev;

      updateUser(nextValue);

      return nextValue;
    });
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    closeDrawer();

    setTimeout(() => {
      router.replace("/");
    }, 250);
  };

  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return (
    <>
      {/* Menu Button */}
      {/* <View style={styles.menuWrapper}>
        <Pressable
          onPress={openDrawer}
          style={({ pressed }) => [
            styles.menuButton,
            pressed && styles.menuButtonPressed,
          ]}
        >
          <Ionicons name="menu-outline" size={23} color={colors.text} />
        </Pressable>
      </View> */}

      {/* Overlay */}
      {open && <Pressable onPress={closeDrawer} style={styles.overlay} />}

      {/* Drawer */}
      <Animated.View style={[styles.drawer, animatedDrawerStyle]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View>
            <Text style={styles.drawerTitle}>Profile</Text>

            <Text style={styles.drawerSubtitle}>Manage your account</Text>
          </View>

          <Pressable onPress={closeDrawer} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* User */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "User"}</Text>

            <Text style={styles.userLabel}>Music listener</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Ionicons name="heart-outline" size={19} color={colors.primary} />
            </View>

            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Public Favorites</Text>

              <Text style={styles.settingDescription}>
                Show your favorite songs to friends
              </Text>
            </View>

            <Switch
              checked={isSwitchOn}
              onCheckedChange={onToggleSwitch}
              size="$3"
              backgroundColor={
                isSwitchOn ? colors.primary : colors.surfaceElevated
              }
            >
              <Switch.Thumb animation="bouncy" />
            </Switch>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIONS</Text>

          <Pressable
            // onPress={exportToDownloads}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="download-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <Text style={styles.actionText}>Export Songs</Text>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />

            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  menuWrapper: {
    position: "absolute",
    right: 14,
    top: 10,
    zIndex: 1000,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },

  menuButtonPressed: {
    backgroundColor: colors.surfaceElevated,
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    zIndex: 1100,
  },

  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: DRAWER_WIDTH,
    height,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 58,
    zIndex: 1200,

    shadowColor: "#000",
    shadowOffset: {
      width: -4,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 20,
  },

  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  drawerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  drawerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },

  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  userInfo: {
    marginLeft: 12,
    flex: 1,
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  userLabel: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted,
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 12,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(168, 85, 247, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  settingContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  settingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  settingDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },

  actionButton: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },

  actionButtonPressed: {
    backgroundColor: colors.background,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(168, 85, 247, 0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  logoutContainer: {
    marginTop: "auto",
    paddingBottom: 30,
  },

  logoutButton: {
    height: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.18)",
  },

  logoutButtonPressed: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.error,
  },
});
