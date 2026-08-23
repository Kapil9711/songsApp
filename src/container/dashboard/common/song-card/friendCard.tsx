import { View, StyleSheet, Alert } from "react-native";
import React from "react";

import { Text } from "@/src/providers/CustomText";

import { Avatar, Button } from "tamagui";

import { useSocket } from "@/src/providers/socketProvider";

import { getValueInAsync } from "@/src/utilities/helpers";

import { moderateScale } from "react-native-size-matters";

const joinServer = (userId: string, socket: any) => {
  socket.emit("join", userId);
  Alert.alert("Connected!", `You are now online as ${userId}`);
};

const colors = {
  background: "#0A0A0B",
  surface: "#141416",
  surfaceElevated: "#1C1C20",
  primary: "#A855F7",
  primaryPressed: "#9333EA",
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
  border: "#27272A",
  success: "#22C55E",
  error: "#EF4444",
};

const FriendCard = ({
  index,
  item,
  sendFriendRequest,
  type,
  confirmFriendRequest,
  isActionLoading,
}: any) => {
  let name = item?.name;

  if (type === "friends") name = item?.user?.name;

  if (type === "requests") name = item?.requester?.name;

  const { requestToSync, users } = useSocket();

  let isActive = false;

  if (type === "friends") {
    const id = item?.user?._id;

    isActive = users?.includes(id as never);
  }

  return (
    <View style={styles.card}>
      {/* Left accent */}
      <View style={styles.accent} />

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <Avatar circular size={moderateScale(52)}>
          <Avatar.Image src="https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80" />
        </Avatar>

        {/* Online indicator */}
        {type === "friends" && (
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isActive ? colors.success : colors.textMuted,
              },
            ]}
          />
        )}
      </View>

      {/* User information */}
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text numberOfLines={1} style={styles.name}>
            {String(index + 1)}. {name?.slice(0, 20)}
          </Text>
        </View>

        {type === "friends" && (
          <Text style={styles.statusText}>
            {isActive ? "Online" : "Offline"}
          </Text>
        )}

        {type === "requests" && (
          <Text style={styles.statusText}>Friend request</Text>
        )}

        {type === "users" && (
          <Text style={styles.statusText}>New connection</Text>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {type === "users" && (
          <Button
            size="$3"
            borderRadius={moderateScale(10)}
            backgroundColor={colors.primary}
            color={colors.text}
            fontWeight="700"
            pressStyle={{
              backgroundColor: colors.primaryPressed,
            }}
            disabled={isActionLoading}
            onPress={() => {
              if (type === "users") {
                sendFriendRequest(item);
              }
            }}
          >
            Request
          </Button>
        )}

        {type === "requests" && (
          <Button
            size="$3"
            borderRadius={moderateScale(10)}
            backgroundColor={colors.primary}
            color={colors.text}
            fontWeight="700"
            pressStyle={{
              backgroundColor: colors.primaryPressed,
            }}
            disabled={isActionLoading}
            onPress={() => {
              confirmFriendRequest(item._id);
            }}
          >
            Confirm
          </Button>
        )}

        {isActive && (
          <Button
            size="$3"
            borderRadius={moderateScale(10)}
            backgroundColor={colors.surfaceElevated}
            borderWidth={1}
            borderColor={colors.primary}
            color={colors.text}
            fontWeight="700"
            pressStyle={{
              backgroundColor: colors.primary,
            }}
            onPress={async () => {
              const user: any = await getValueInAsync("user");

              requestToSync(item?.user?._id);
            }}
          >
            Connect
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: moderateScale(72),

    flexDirection: "row",
    alignItems: "center",

    marginVertical: moderateScale(5),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(12),

    borderRadius: moderateScale(16),

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    overflow: "hidden",
  },

  accent: {
    position: "absolute",

    left: 0,
    top: 0,
    bottom: 0,

    width: moderateScale(3),

    backgroundColor: colors.primary,
  },

  avatarWrapper: {
    position: "relative",

    marginLeft: moderateScale(4),
    marginRight: moderateScale(12),

    padding: moderateScale(2),

    borderRadius: 999,

    borderWidth: 1,
    borderColor: colors.border,
  },

  statusDot: {
    position: "absolute",

    right: -1,
    bottom: -1,

    width: moderateScale(13),
    height: moderateScale(13),

    borderRadius: 999,

    borderWidth: moderateScale(2),
    borderColor: colors.surface,
  },

  userInfo: {
    flex: 1,

    minWidth: 0,

    justifyContent: "center",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    color: colors.text,

    fontSize: moderateScale(14),
    fontWeight: "600",

    flexShrink: 1,
  },

  statusText: {
    marginTop: moderateScale(3),

    color: colors.textMuted,

    fontSize: moderateScale(11),
  },

  actions: {
    flexDirection: "row",
    alignItems: "center",

    marginLeft: moderateScale(8),

    gap: moderateScale(6),
  },
});

export default FriendCard;
