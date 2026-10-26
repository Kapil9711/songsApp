import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useResponsive } from "react-native-fluid-styles";

import { Container } from "@/components/container";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useSyncSocketStore } from "@/store/socket.store";
import { useTheme } from "@/themes/theme.context";

type UserCardProps = {
  userId: string;
  isRequestSent: boolean;
  disabled: boolean;
  onConnect: () => void;
};

type RequestCardProps = {
  userId: string;
  onAccept: () => void;
  onReject: () => void;
  disabled: boolean;
};

export default function LiveUsersScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();

  const userId = useSyncSocketStore((state) => state.userId);
  const isConnected = useSyncSocketStore((state) => state.isConnected);
  const onlineUsers = useSyncSocketStore((state) => state.onlineUsers);
  const sentRequestTo = useSyncSocketStore((state) => state.sentRequestTo);
  const pendingRequestFrom = useSyncSocketStore(
    (state) => state.pendingRequestFrom,
  );
  const groupId = useSyncSocketStore((state) => state.groupId);
  const lastError = useSyncSocketStore((state) => state.lastError);

  const requestConnection = useSyncSocketStore(
    (state) => state.requestConnection,
  );
  const acceptConnection = useSyncSocketStore(
    (state) => state.acceptConnection,
  );
  const rejectConnection = useSyncSocketStore(
    (state) => state.rejectConnection,
  );
  const leaveGroup = useSyncSocketStore((state) => state.leaveGroup);
  const clearError = useSyncSocketStore((state) => state.clearError);

  const availableUsers = useMemo(
    () => onlineUsers.filter((id) => id !== userId),
    [onlineUsers, userId],
  );

  const isInGroup = Boolean(groupId);

  const renderUser = ({ item }: { item: string }) => (
    <LiveUserCard
      userId={item}
      isRequestSent={sentRequestTo.includes(item)}
      disabled={!isConnected || isInGroup}
      onConnect={() => requestConnection(item)}
    />
  );

  const renderRequest = ({ item }: { item: string }) => (
    <IncomingRequestCard
      userId={item}
      disabled={!isConnected || isInGroup}
      onAccept={() => acceptConnection(item)}
      onReject={() => rejectConnection(item)}
    />
  );

  return (
    <Container
      style={{
        flex: 1,
        maxWidth: "100%",
        backgroundColor: Theme.colors.background,
      }}
      insetStyle={{ ...SafeSide, bottom: false }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Listen together</Text>
              <View style={styles.titleDot} />
            </View>

            <Text style={styles.subtitle}>
              Find friends who are online and enjoy music together.
            </Text>
          </View>

          <View style={styles.onlineBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isConnected ? "#22C55E" : "#F59E0B",
                },
              ]}
            />

            <Text style={styles.onlineBadgeText}>
              {isConnected ? "LIVE" : "CONNECTING"}
            </Text>
          </View>
        </View>

        {/* Connection error */}
        {lastError ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />

            <Text style={styles.errorText}>{lastError}</Text>

            <Pressable
              onPress={clearError}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Dismiss error"
            >
              <Ionicons name="close" size={19} color={Theme.colors.text} />
            </Pressable>
          </View>
        ) : null}

        {/* Online summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="people" size={23} color={Theme.colors.primary} />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>People online</Text>

            <Text style={styles.summarySubtitle}>
              {isConnected
                ? "Connect and listen together"
                : "Connecting to Riffly..."}
            </Text>
          </View>

          <Text style={styles.summaryCount}>{availableUsers.length}</Text>
        </View>

        {/* Active group */}
        {isInGroup ? (
          <View style={styles.groupNotice}>
            <View style={styles.groupNoticeContent}>
              <Ionicons
                name="people-circle-outline"
                size={23}
                color={Theme.colors.primary}
              />

              <View style={styles.groupNoticeTextContainer}>
                <Text style={styles.groupNoticeTitle}>
                  You're listening together
                </Text>

                <Text style={styles.groupNoticeSubtitle}>
                  Leave your current group before connecting to someone else.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={leaveGroup}
              style={({ pressed }) => [
                styles.leaveButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.leaveButtonText}>Leave group</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Incoming requests */}
        {pendingRequestFrom.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>CONNECTION REQUESTS</Text>

              <View style={styles.requestCountBadge}>
                <Text style={styles.requestCountText}>
                  {pendingRequestFrom.length}
                </Text>
              </View>
            </View>

            <FlatList
              data={pendingRequestFrom}
              keyExtractor={(item) => item}
              renderItem={renderRequest}
              scrollEnabled={false}
              initialNumToRender={5}
            />
          </>
        ) : null}

        {/* Online users heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AVAILABLE USERS</Text>

          <Text style={styles.sectionCount}>
            {availableUsers.length} online
          </Text>
        </View>

        {/* Online users */}
        {!isConnected ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />

            <Text style={styles.emptyTitle}>Connecting to Riffly</Text>

            <Text style={styles.emptySubtitle}>
              Online users will appear when the connection is established.
            </Text>
          </View>
        ) : (
          <FlatList
            data={availableUsers}
            keyExtractor={(item) => item}
            renderItem={renderUser}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="headset-outline"
                    size={29}
                    color={Theme.colors.primary}
                  />
                </View>

                <Text style={styles.emptyTitle}>It's quiet here</Text>

                <Text style={styles.emptySubtitle}>
                  No other users are online right now. Invite a friend to listen
                  together.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Container>
  );
}

function LiveUserCard({
  userId,
  isRequestSent,
  disabled,
  onConnect,
}: UserCardProps) {
  const { Theme } = useTheme();
  const r = useResponsive();
  const styles = useStyles();

  const initial = userId.slice(-1).toUpperCase();

  const isDisabled = disabled || isRequestSent;

  return (
    <View style={styles.userCard}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
        <View style={styles.avatarOnlineDot} />
      </View>

      {/* User details */}
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          User {userId.slice(-6)}
        </Text>

        <View style={styles.userStatusRow}>
          <View style={styles.smallStatusDot} />

          <Text style={styles.userStatus}>Online now</Text>
        </View>
      </View>

      {/* Connect button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          isRequestSent
            ? "Connection request sent"
            : `Connect with user ${userId}`
        }
        disabled={isDisabled}
        onPress={onConnect}
        style={({ pressed }) => [
          styles.connectButton,
          isRequestSent && styles.requestSentButton,
          disabled && !isRequestSent && styles.disabledButton,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name={isRequestSent ? "checkmark" : "person-add-outline"}
          size={r.ms(15)}
          color={isRequestSent ? Theme.colors.text : Theme.colors.background}
        />

        <Text
          style={[
            styles.connectButtonText,
            isRequestSent && styles.requestSentText,
          ]}
        >
          {isRequestSent ? "Sent" : "Connect"}
        </Text>
      </Pressable>
    </View>
  );
}

function IncomingRequestCard({
  userId,
  onAccept,
  onReject,
  disabled,
}: RequestCardProps) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.requestCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{userId.slice(-1).toUpperCase()}</Text>

        <View style={styles.avatarOnlineDot} />
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          User {userId.slice(-6)}
        </Text>

        <Text style={styles.requestSubtitle}>Wants to listen with you</Text>
      </View>

      <View style={styles.requestActions}>
        <Pressable
          onPress={onReject}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Reject connection request"
          style={({ pressed }) => [
            styles.rejectButton,
            pressed && styles.buttonPressed,
            disabled && styles.disabledButton,
          ]}
        >
          <Ionicons name="close" size={19} color={Theme.colors.text} />
        </Pressable>

        <Pressable
          onPress={onAccept}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Accept connection request"
          style={({ pressed }) => [
            styles.acceptButton,
            pressed && styles.buttonPressed,
            disabled && styles.disabledButton,
          ]}
        >
          <Ionicons
            name="checkmark"
            size={19}
            color={Theme.colors.background}
          />

          <Text style={styles.acceptButtonText}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const border = Theme.styles.Card.borderColor;
  const cardBackground = Theme.styles.Card.backgroundColor;

  return StyleSheet.create({
    container: {
      flex: 1,
      minHeight: 0,
      backgroundColor: "transparent",
      paddingHorizontal: r.ms(5),
    },

    header: {
      paddingTop: r.ms(12),
      paddingBottom: r.ms(18),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: r.ms(8),
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    title: {
      fontSize: r.ms(25),
      lineHeight: r.ms(31),
      fontWeight: "800",
      letterSpacing: -0.7,
      color: text,
    },

    titleDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
      marginLeft: r.ms(5),
      marginTop: r.ms(10),
      backgroundColor: primary,
    },

    subtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(11),
      lineHeight: r.ms(16),
      color: text,
      opacity: 0.68,
    },

    onlineBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(5),
      paddingHorizontal: r.ms(9),
      paddingVertical: r.ms(7),
      borderRadius: r.ms(20),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    statusDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
    },

    onlineBadgeText: {
      fontSize: r.ms(9),
      fontWeight: "800",
      color: text,
      letterSpacing: 0.4,
    },

    errorCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(8),
      padding: r.ms(11),
      marginBottom: r.ms(12),
      borderRadius: r.ms(12),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: "#EF444455",
    },

    errorText: {
      flex: 1,
      fontSize: r.ms(11),
      lineHeight: r.ms(16),
      color: text,
    },

    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(13),
      marginBottom: r.ms(24),
      borderRadius: r.ms(17),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      gap: r.ms(11),
    },

    summaryIcon: {
      width: r.ms(43),
      height: r.ms(43),
      borderRadius: r.ms(13),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
    },

    summaryContent: {
      flex: 1,
      minWidth: 0,
    },

    summaryTitle: {
      fontSize: r.ms(14),
      fontWeight: "800",
      color: text,
    },

    summarySubtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    summaryCount: {
      fontSize: r.ms(25),
      fontWeight: "800",
      color: primary,
    },

    groupNotice: {
      padding: r.ms(12),
      marginTop: -r.ms(12),
      marginBottom: r.ms(20),
      borderRadius: r.ms(13),
      backgroundColor: `${primary}12`,
    },

    groupNoticeContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(9),
    },

    groupNoticeTextContainer: {
      flex: 1,
    },

    groupNoticeTitle: {
      fontSize: r.ms(12),
      fontWeight: "800",
      color: text,
    },

    groupNoticeSubtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10),
      lineHeight: r.ms(15),
      color: text,
      opacity: 0.7,
    },

    leaveButton: {
      alignSelf: "flex-start",
      paddingHorizontal: r.ms(12),
      paddingVertical: r.ms(8),
      marginTop: r.ms(10),
      borderRadius: r.ms(9),
      backgroundColor: primary,
    },

    leaveButtonText: {
      fontSize: r.ms(10),
      fontWeight: "800",
      color: background,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(7),
      justifyContent: "space-between",
      marginBottom: r.ms(10),
    },

    sectionTitle: {
      fontSize: r.ms(11),
      fontWeight: "800",
      letterSpacing: 1,
      color: text,
    },

    sectionCount: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    requestCountBadge: {
      minWidth: r.ms(20),
      height: r.ms(20),
      borderRadius: r.ms(10),
      paddingHorizontal: r.ms(5),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },

    requestCountText: {
      color: background,
      fontSize: r.ms(10),
      fontWeight: "800",
    },

    listContent: {
      paddingBottom: r.ms(120),
      flexGrow: 1,
    },

    userCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(11),
      marginBottom: r.ms(9),
      borderRadius: r.ms(15),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    requestCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(10),
      marginBottom: r.ms(8),
      borderRadius: r.ms(14),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    avatar: {
      width: r.ms(45),
      height: r.ms(45),
      borderRadius: r.ms(15),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}20`,
    },

    avatarText: {
      fontSize: r.ms(18),
      fontWeight: "800",
      color: primary,
    },

    avatarOnlineDot: {
      position: "absolute",
      width: r.ms(10),
      height: r.ms(10),
      right: -r.ms(2),
      bottom: -r.ms(2),
      borderRadius: r.ms(5),
      backgroundColor: "#22C55E",
      borderWidth: 2,
      borderColor: background,
    },

    userInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: r.ms(11),
      marginRight: r.ms(7),
    },

    userName: {
      fontSize: r.ms(13),
      fontWeight: "700",
      color: text,
    },

    userStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(5),
      marginTop: r.ms(5),
    },

    smallStatusDot: {
      width: r.ms(5),
      height: r.ms(5),
      borderRadius: r.ms(3),
      backgroundColor: "#22C55E",
    },

    userStatus: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    requestSubtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },

    connectButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(5),
      paddingHorizontal: r.ms(11),
      paddingVertical: r.ms(10),
      borderRadius: r.ms(11),
      backgroundColor: primary,
    },

    connectButtonText: {
      fontSize: r.ms(10),
      fontWeight: "800",
      color: background,
    },

    requestSentButton: {
      backgroundColor: `${primary}18`,
      borderWidth: 1,
      borderColor: border,
    },

    requestSentText: {
      color: text,
    },

    requestActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(6),
    },

    rejectButton: {
      width: r.ms(34),
      height: r.ms(36),
      borderRadius: r.ms(10),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: border,
    },

    acceptButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(3),
      paddingHorizontal: r.ms(9),
      height: r.ms(36),
      borderRadius: r.ms(10),
      backgroundColor: primary,
    },

    acceptButtonText: {
      fontSize: r.ms(10),
      fontWeight: "800",
      color: background,
    },

    disabledButton: {
      opacity: 0.5,
    },

    buttonPressed: {
      opacity: 0.75,
      transform: [{ scale: 0.97 }],
    },

    emptyState: {
      flex: 1,
      minHeight: r.ms(200),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(30),
      paddingBottom: r.ms(40),
    },

    emptyIcon: {
      width: r.ms(62),
      height: r.ms(62),
      borderRadius: r.ms(20),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      marginBottom: r.ms(15),
    },

    emptyTitle: {
      fontSize: r.ms(16),
      fontWeight: "800",
      color: text,
      textAlign: "center",
      marginTop: r.ms(12),
    },

    emptySubtitle: {
      marginTop: r.ms(7),
      fontSize: r.ms(11),
      lineHeight: r.ms(17),
      color: text,
      opacity: 0.65,
      textAlign: "center",
    },
  });
};
