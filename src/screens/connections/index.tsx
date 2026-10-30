import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useResponsive } from "react-native-fluid-styles";

import { Container } from "@/components/container";
import NowPlayingBackground from "@/components/nowPlayingBackground";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/themes/theme.context";

import { groupService } from "./group.service";
import { useGroupStore } from "./group.store";
import { useGetFriendsQuery } from "../friends/api/api.queries";

import type { GroupInvitation, GroupMember } from "./group.types";

type ActionName =
  | "create"
  | "invite"
  | "accept"
  | "reject"
  | "permission"
  | "leave"
  | "discard"
  | "refresh";

type Styles = ReturnType<typeof useStyles>;

type Friend = {
  id?: string;
  _id?: string;
  name?: string;
  image?: string;
};

export default function GroupScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();

  const user = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.group);
  const invitations = useGroupStore((state) => state.invitations);
  const friendIds = useGroupStore((state) => state.friendIds);
  const error = useGroupStore((state) => state.error);
  const setError = useGroupStore((state) => state.setError);

  const { data: friendsResponse } = useGetFriendsQuery();
  const friends = friendsResponse?.data ?? [];

  const friendsById = useMemo(() => {
    return new Map<string, Friend>(
      friends.map((item: any) => [
        item.friend?._id || item.friend?.id,
        item.friend,
      ]),
    );
  }, [friends]);

  const [friendId, setFriendId] = useState("");
  const [busyAction, setBusyAction] = useState<ActionName | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const currentUserId = user?.id;

  const isOwner = Boolean(
    group && currentUserId && group.ownerId === currentUserId,
  );

  const currentMember = group?.members.find(
    (member) => member.userId === currentUserId,
  );

  const canInvite = Boolean(currentMember?.canInvite);

  const runAction = useCallback(
    async <T,>(
      action: ActionName,
      callback: () => Promise<T>,
    ): Promise<T | undefined> => {
      if (busyAction) {
        return undefined;
      }

      setBusyAction(action);
      setError(null);

      try {
        return await callback();
      } catch (actionError: unknown) {
        const message =
          actionError instanceof Error
            ? actionError.message
            : "Something went wrong. Please try again.";

        setError(message);
        Alert.alert("Group", message);

        return undefined;
      } finally {
        setBusyAction(null);
      }
    },
    [busyAction, setError],
  );

  const refreshGroupData = useCallback(async () => {
    if (!currentUserId) {
      setInitialized(true);
      return;
    }

    setRefreshing(true);

    try {
      const results = await Promise.allSettled([
        groupService.getGroup(),
        groupService.getPendingInvitations(),
      ]);

      if (results[0].status === "rejected") {
        console.error(
          "[GroupScreen] Failed to fetch group:",
          results[0].reason,
        );
      }

      if (results[1].status === "rejected") {
        console.error(
          "[GroupScreen] Failed to fetch invitations:",
          results[1].reason,
        );
      }

      const latestGroup =
        results[0].status === "fulfilled" ? results[0].value : null;

      const member = latestGroup?.members.find(
        (item: GroupMember) => item.userId === currentUserId,
      );

      // The backend only returns eligible friends to members who
      // have permission to invite.
      if (latestGroup && member?.canInvite) {
        try {
          await groupService.getEligibleFriends();
        } catch (friendError) {
          console.error(
            "[GroupScreen] Failed to fetch eligible friends:",
            friendError,
          );
        }
      }
    } finally {
      setRefreshing(false);
      setInitialized(true);
    }
  }, [currentUserId]);

  useEffect(() => {
    void refreshGroupData();
  }, [refreshGroupData]);

  const handleCreateGroup = async () => {
    await runAction("create", async () => {
      await groupService.createGroup();
    });
  };

  const handleInvite = async (targetUserId: string) => {
    if (!group) {
      Alert.alert("Group", "Create or join a group first.");
      return;
    }

    const normalizedId = targetUserId.trim();

    if (!normalizedId) {
      Alert.alert("Group", "Enter a friend's user ID.");
      return;
    }

    if (normalizedId === currentUserId) {
      Alert.alert("Group", "You cannot invite yourself.");
      return;
    }

    const result = await runAction("invite", async () => {
      await groupService.inviteFriend(group.id, normalizedId);
    });

    if (result !== undefined) {
      setFriendId("");
      Alert.alert("Invitation", "Invitation sent successfully.");
    }
  };

  const handleAcceptInvitation = async (invitation: GroupInvitation) => {
    await runAction("accept", async () => {
      await groupService.acceptInvitation(invitation.id);
    });
  };

  const handleRejectInvitation = async (invitation: GroupInvitation) => {
    await runAction("reject", async () => {
      await groupService.rejectInvitation(invitation.id);
    });
  };

  const handlePermissionChange = async (
    member: GroupMember,
    nextValue: boolean,
  ) => {
    if (!group) {
      return;
    }

    await runAction("permission", async () => {
      await groupService.setInvitePermission(
        group.id,
        member.userId,
        nextValue,
      );
    });
  };

  const handleLeaveGroup = () => {
    if (!group) {
      return;
    }

    Alert.alert(
      isOwner ? "End group" : "Leave group",
      isOwner
        ? "You are the owner. Leaving will destroy the group for all members."
        : "Are you sure you want to leave this group?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isOwner ? "Leave and end group" : "Leave group",
          style: "destructive",
          onPress: () => {
            void runAction("leave", async () => {
              await groupService.leaveGroup(group.id);
            });
          },
        },
      ],
    );
  };

  const handleDiscardGroup = () => {
    if (!group || !isOwner) {
      return;
    }

    Alert.alert(
      "End group",
      "This will permanently end the group and cancel its pending invitations.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End group",
          style: "destructive",
          onPress: () => {
            void runAction("discard", async () => {
              await groupService.discardGroup(group.id);
            });
          },
        },
      ],
    );
  };

  if (!currentUserId) {
    return (
      <View
        style={[styles.container, { backgroundColor: Theme.colors.background }]}
      >
        <NowPlayingBackground />

        <View style={styles.centered}>
          <Ionicons
            name="person-circle-outline"
            size={styles.iconSize.width}
            color={Theme.colors.primary}
          />
          <Text style={styles.mutedText}>Sign in to use group listening.</Text>
        </View>
      </View>
    );
  }

  if (!initialized && !group && invitations.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: Theme.colors.background }]}
      >
        <NowPlayingBackground />

        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your groups...</Text>
        </View>
      </View>
    );
  }

  return (
    <Container
      style={{ ...styles.container, backgroundColor: Theme.colors.background }}
      insetStyle={{ ...SafeSide, bottom: false }}
    >
      <NowPlayingBackground />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshGroupData}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page heading */}
        <View style={styles.header}>
          <View style={styles.headingRow}>
            <Text style={styles.title}>Group Listening</Text>
            <View style={styles.titleDot} />
          </View>

          <Text style={styles.subtitle}>
            Listen together with your friends.
          </Text>
        </View>

        {/* Error message */}
        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorContent}>
              <Ionicons
                name="alert-circle-outline"
                size={styles.smallIcon.width}
                color={"#E45B65"}
              />

              <Text style={styles.errorText}>{error}</Text>
            </View>

            <Pressable onPress={() => setError(null)} hitSlop={8}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Invitations */}
        <Section title="Invitations" styles={styles}>
          {invitations.length === 0 ? (
            <EmptyState
              text="You don't have any pending invitations."
              styles={styles}
            />
          ) : (
            invitations.map((invitation) => {
              const inviter = friendsById.get(invitation.invitedBy);

              return (
                <View key={invitation.id} style={styles.card}>
                  <View style={styles.friendRow}>
                    <FriendAvatar
                      image={inviter?.image}
                      name={inviter?.name}
                      styles={styles}
                    />

                    <View style={styles.flex}>
                      <Text style={styles.cardTitle}>
                        {inviter?.name ||
                          `User ${invitation.invitedBy.slice(-6)}`}
                      </Text>

                      <Text style={styles.bodyText}>
                        Invited you to join a group
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.mutedText}>
                    Group ID: {invitation.groupId}
                  </Text>

                  <View style={styles.row}>
                    <ActionButton
                      label="Accept"
                      loading={busyAction === "accept"}
                      disabled={Boolean(busyAction)}
                      onPress={() => void handleAcceptInvitation(invitation)}
                      styles={styles}
                    />

                    <ActionButton
                      label="Reject"
                      variant="secondary"
                      loading={busyAction === "reject"}
                      disabled={Boolean(busyAction)}
                      onPress={() => void handleRejectInvitation(invitation)}
                      styles={styles}
                    />
                  </View>
                </View>
              );
            })
          )}
        </Section>

        {/* No group */}
        {!group ? (
          <Section title="Your group" styles={styles}>
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="headset-outline"
                  size={styles.heroIconSize.width}
                  color={Theme.colors.primary}
                />
              </View>

              <Text style={styles.cardTitle}>Start listening together</Text>

              <Text style={styles.bodyText}>
                Create a group, invite your friends, and listen together.
              </Text>

              <ActionButton
                label="Create group"
                loading={busyAction === "create"}
                disabled={Boolean(busyAction)}
                onPress={() => void handleCreateGroup()}
                styles={styles}
              />
            </View>
          </Section>
        ) : (
          <>
            {/* Current group */}
            <Section title="Current group" styles={styles}>
              <View style={styles.heroCard}>
                <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons
                      name="people-outline"
                      size={styles.heroIconSize.width}
                      color={Theme.colors.primary}
                    />
                  </View>

                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>Listening group</Text>

                    <Text style={styles.mutedText}>Group ID: {group.id}</Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      isOwner ? styles.ownerBadge : styles.memberBadge,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {isOwner ? "Owner" : "Member"}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons
                      name="people-outline"
                      size={styles.smallIcon.width}
                      color={Theme.colors.primary}
                    />

                    <Text style={styles.statText}>
                      {group.members.length}{" "}
                      {group.members.length === 1 ? "member" : "members"}
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Ionicons
                      name={
                        canInvite
                          ? "checkmark-circle-outline"
                          : "lock-closed-outline"
                      }
                      size={styles.smallIcon.width}
                      color={Theme.colors.primary}
                    />

                    <Text style={styles.statText}>
                      {canInvite ? "Can invite" : "Invite restricted"}
                    </Text>
                  </View>
                </View>
              </View>
            </Section>

            {/* Members */}
            <Section title="Members" styles={styles}>
              {group.members.map((member) => {
                const memberIsOwner = member.userId === group.ownerId;
                const isCurrentUser = member.userId === currentUserId;
                const friend = friendsById.get(member.userId);

                const displayName = isCurrentUser
                  ? `${user?.name || "You"} (You)`
                  : friend?.name || `Member ${member.userId.slice(-6)}`;

                return (
                  <View key={member.userId} style={styles.memberCard}>
                    <FriendAvatar
                      image={
                        isCurrentUser ? (user as any)?.image : friend?.image
                      }
                      name={isCurrentUser ? user?.name : friend?.name}
                      styles={styles}
                      large
                    />

                    <View style={styles.flex}>
                      <Text style={styles.memberName}>{displayName}</Text>

                      <Text style={styles.mutedText}>
                        {memberIsOwner
                          ? "Group owner"
                          : member.canInvite
                            ? "Can invite friends"
                            : "Member"}
                      </Text>
                    </View>

                    {isOwner && !memberIsOwner ? (
                      <Pressable
                        disabled={Boolean(busyAction)}
                        style={[
                          styles.permissionButton,
                          member.canInvite && styles.permissionEnabled,
                        ]}
                        onPress={() =>
                          void handlePermissionChange(member, !member.canInvite)
                        }
                      >
                        {busyAction === "permission" ? (
                          <ActivityIndicator
                            size="small"
                            color={Theme.colors.primary}
                          />
                        ) : (
                          <Text style={styles.permissionText}>
                            {member.canInvite ? "Revoke" : "Allow invites"}
                          </Text>
                        )}
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </Section>

            {/* Invite friends */}
            {canInvite ? (
              <Section title="Invite friends" styles={styles}>
                <View style={styles.card}>
                  <Text style={styles.bodyText}>
                    Select an eligible friend or enter their user ID.
                  </Text>

                  {friendIds.length > 0 ? (
                    <View style={styles.friendList}>
                      {friendIds.map((id) => {
                        const friend = friendsById.get(id);

                        return (
                          <View key={id} style={styles.friendRow}>
                            <FriendAvatar
                              image={friend?.image}
                              name={friend?.name}
                              styles={styles}
                            />

                            <View style={styles.flex}>
                              <Text style={styles.memberName}>
                                {friend?.name || `Member ${id.slice(-6)}`}
                              </Text>

                              <Text style={styles.mutedText} numberOfLines={1}>
                                {id}
                              </Text>
                            </View>

                            <ActionButton
                              label="Invite"
                              loading={busyAction === "invite"}
                              disabled={Boolean(busyAction)}
                              onPress={() => void handleInvite(id)}
                              styles={styles}
                            />
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <EmptyState
                      text="No eligible friends were returned by the server."
                      styles={styles}
                    />
                  )}

                  <Text style={styles.inputLabel}>Friend user ID</Text>

                  <TextInput
                    value={friendId}
                    onChangeText={setFriendId}
                    placeholder="Enter friend user ID"
                    placeholderTextColor={Theme.colors.text}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />

                  <ActionButton
                    label="Send invitation"
                    disabled={Boolean(busyAction) || !friendId.trim()}
                    loading={busyAction === "invite"}
                    onPress={() => void handleInvite(friendId)}
                    styles={styles}
                  />
                </View>
              </Section>
            ) : null}

            {/* Group settings */}
            <Section title="Group settings" styles={styles}>
              <View style={styles.card}>
                {isOwner ? (
                  <>
                    <Text style={styles.bodyText}>
                      As the owner, you can end the group for everyone.
                    </Text>

                    <ActionButton
                      label="End group for everyone"
                      variant="danger"
                      disabled={Boolean(busyAction)}
                      onPress={handleDiscardGroup}
                      styles={styles}
                    />
                  </>
                ) : null}

                <ActionButton
                  label={isOwner ? "Leave and end group" : "Leave group"}
                  variant="secondary"
                  disabled={Boolean(busyAction)}
                  onPress={handleLeaveGroup}
                  styles={styles}
                />
              </View>
            </Section>
          </>
        )}

        {/* Manual refresh */}
        <Pressable
          onPress={() => void refreshGroupData()}
          disabled={refreshing || Boolean(busyAction)}
          style={styles.refreshButton}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={Theme.colors.primary} />
          ) : (
            <Ionicons
              name="refresh-outline"
              size={styles.smallIcon.width}
              color={Theme.colors.primary}
            />
          )}

          <Text style={styles.refreshText}>
            {refreshing ? "Refreshing..." : "Refresh group data"}
          </Text>
        </Pressable>
      </ScrollView>
    </Container>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable UI components                                                     */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
  styles,
}: {
  title: string;
  children: React.ReactNode;
  styles: Styles;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyState({ text, styles }: { text: string; styles: Styles }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons
        name="information-circle-outline"
        size={styles.smallIcon.width}
        color={styles.iconColor.color}
      />

      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

function FriendAvatar({
  image,
  name,
  styles,
  large = false,
}: {
  image?: string | null;
  name?: string | null;
  styles: Styles;
  large?: boolean;
}) {
  const initial = name?.trim().charAt(0).toUpperCase() || "U";

  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={large ? styles.memberAvatarImage : styles.friendAvatar}
      />
    );
  }

  return (
    <View
      style={[styles.friendAvatarFallback, large && styles.memberAvatarLarge]}
    >
      <Text style={styles.avatarInitial}>{initial}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  styles,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  styles: Styles;
}) {
  const { Theme } = useTheme();

  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "primary" && styles.primaryButton,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        (disabled || loading) && styles.disabledButton,
        pressed && !disabled && !loading && styles.pressedButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isSecondary ? Theme.colors.text : "#FFFFFF"}
        />
      ) : (
        <Text
          style={[styles.buttonText, isSecondary && styles.secondaryButtonText]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Theme-based responsive styles                                              */
/* -------------------------------------------------------------------------- */

const useStyles = () => {
  const { Theme } = useTheme();
  const r = useResponsive();

  const primary = Theme.colors.primary;
  const background = Theme.colors.background;
  const text = Theme.colors.text;
  const border = Theme.styles.Card.borderColor;
  const cardBackground = Theme.styles.Card.backgroundColor;

  const primarySurface = `${primary}15`;
  const primaryBorder = `${primary}30`;

  return StyleSheet.create({
    container: {
      flex: 1,
      maxWidth: "100%",
    },

    screen: {
      flex: 1,
      backgroundColor: "transparent",
    },

    content: {
      paddingHorizontal: r.ms(6),
      paddingTop: r.ms(8),
      paddingBottom: r.ms(32),
    },

    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: r.ms(20),
      gap: r.ms(10),
    },

    header: {
      paddingBottom: r.ms(18),
    },

    headingRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    title: {
      fontSize: r.ms(27),
      lineHeight: r.ms(33),
      fontWeight: "800",
      letterSpacing: -0.7,
      color: text,
    },

    titleDot: {
      width: r.ms(6),
      height: r.ms(6),
      borderRadius: r.ms(3),
      backgroundColor: primary,
      marginLeft: r.ms(5),
      marginTop: r.ms(12),
    },

    subtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(11),
      lineHeight: r.ms(16),
      color: text,
      opacity: 0.7,
    },

    section: {
      marginBottom: r.ms(16),
    },

    sectionTitle: {
      color: text,
      fontSize: r.ms(15),
      fontWeight: "700",
      marginBottom: r.ms(9),
    },

    card: {
      backgroundColor: cardBackground,
      borderRadius: r.ms(12),
      padding: r.ms(12),
      marginBottom: r.ms(8),
      borderWidth: 1,
      borderColor: border,
    },

    heroCard: {
      backgroundColor: cardBackground,
      borderRadius: r.ms(14),
      padding: r.ms(14),
      borderWidth: 1,
      borderColor: border,
    },

    heroIcon: {
      width: r.ms(42),
      height: r.ms(42),
      borderRadius: r.ms(12),
      backgroundColor: primarySurface,
      borderWidth: 1,
      borderColor: primaryBorder,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: r.ms(12),
    },

    groupIcon: {
      width: r.ms(40),
      height: r.ms(40),
      borderRadius: r.ms(12),
      backgroundColor: primarySurface,
      borderWidth: 1,
      borderColor: primaryBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    groupHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(9),
      marginBottom: r.ms(12),
    },

    flex: {
      flex: 1,
      minWidth: 0,
    },

    cardTitle: {
      color: text,
      fontSize: r.ms(14),
      fontWeight: "700",
      marginBottom: r.ms(5),
    },

    bodyText: {
      color: text,
      opacity: 0.8,
      fontSize: r.ms(12),
      lineHeight: r.ms(18),
      marginBottom: r.ms(8),
    },

    mutedText: {
      color: text,
      opacity: 0.65,
      fontSize: r.ms(10),
      lineHeight: r.ms(15),
    },

    loadingText: {
      color: text,
      marginTop: r.ms(10),
      fontSize: r.ms(12),
    },

    badge: {
      paddingHorizontal: r.ms(9),
      paddingVertical: r.ms(5),
      borderRadius: r.ms(20),
      borderWidth: 1,
    },

    ownerBadge: {
      backgroundColor: primarySurface,
      borderColor: primaryBorder,
    },

    memberBadge: {
      backgroundColor: cardBackground,
      borderColor: border,
    },

    badgeText: {
      color: text,
      fontSize: r.ms(9),
      fontWeight: "700",
    },

    statsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: r.ms(8),
      paddingTop: r.ms(10),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: border,
    },

    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(5),
      paddingHorizontal: r.ms(8),
      paddingVertical: r.ms(6),
      borderRadius: r.ms(8),
      backgroundColor: primarySurface,
    },

    statText: {
      color: text,
      fontSize: r.ms(10),
      fontWeight: "600",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: r.ms(8),
      marginTop: r.ms(8),
    },

    button: {
      minHeight: r.ms(36),
      paddingHorizontal: r.ms(12),
      paddingVertical: r.ms(8),
      borderRadius: r.ms(8),
      alignItems: "center",
      justifyContent: "center",
      marginTop: r.ms(7),
    },

    primaryButton: {
      backgroundColor: primary,
    },

    secondaryButton: {
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },

    dangerButton: {
      backgroundColor: "#B83240",
    },

    disabledButton: {
      opacity: 0.45,
    },

    pressedButton: {
      opacity: 0.75,
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: r.ms(11),
      fontWeight: "700",
    },

    secondaryButtonText: {
      color: text,
    },

    memberCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: cardBackground,
      padding: r.ms(10),
      borderRadius: r.ms(11),
      marginBottom: r.ms(8),
      gap: r.ms(9),
      borderWidth: 1,
      borderColor: border,
    },

    memberAvatarImage: {
      width: r.ms(38),
      height: r.ms(38),
      borderRadius: r.ms(19),
      backgroundColor: primarySurface,
    },

    memberAvatarLarge: {
      width: r.ms(38),
      height: r.ms(38),
      borderRadius: r.ms(19),
    },

    avatarInitial: {
      fontSize: r.ms(14),
      fontWeight: "700",
      color: text,
    },

    memberName: {
      color: text,
      fontSize: r.ms(12),
      fontWeight: "600",
      marginBottom: r.ms(3),
    },

    permissionButton: {
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      paddingHorizontal: r.ms(8),
      paddingVertical: r.ms(7),
      borderRadius: r.ms(7),
    },

    permissionEnabled: {
      backgroundColor: primarySurface,
      borderColor: primaryBorder,
    },

    permissionText: {
      color: text,
      fontSize: r.ms(9),
      fontWeight: "700",
    },

    friendList: {
      marginVertical: r.ms(8),
    },

    friendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(9),
      paddingVertical: r.ms(8),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
    },

    friendAvatar: {
      width: r.ms(38),
      height: r.ms(38),
      borderRadius: r.ms(19),
      backgroundColor: primarySurface,
    },

    friendAvatarFallback: {
      width: r.ms(38),
      height: r.ms(38),
      borderRadius: r.ms(19),
      backgroundColor: primarySurface,
      borderWidth: 1,
      borderColor: primaryBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    inputLabel: {
      color: text,
      fontSize: r.ms(11),
      fontWeight: "600",
      marginTop: r.ms(12),
      marginBottom: r.ms(6),
    },

    input: {
      minHeight: r.ms(42),
      backgroundColor: background,
      color: text,
      borderWidth: 1,
      borderColor: border,
      borderRadius: r.ms(8),
      paddingHorizontal: r.ms(10),
      fontSize: r.ms(12),
    },

    emptyState: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(8),
      backgroundColor: cardBackground,
      borderRadius: r.ms(10),
      padding: r.ms(12),
      borderWidth: 1,
      borderColor: border,
    },

    emptyStateText: {
      flex: 1,
      color: text,
      opacity: 0.7,
      fontSize: r.ms(11),
      lineHeight: r.ms(16),
    },

    errorBox: {
      backgroundColor: "#421F23",
      borderColor: "#78363D",
      borderWidth: 1,
      borderRadius: r.ms(9),
      padding: r.ms(12),
      marginBottom: r.ms(16),
    },

    errorContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(7),
    },

    errorText: {
      flex: 1,
      color: "#FFC6CB",
      fontSize: r.ms(11),
      lineHeight: r.ms(16),
    },

    dismissText: {
      color: "#FFFFFF",
      fontSize: r.ms(10),
      fontWeight: "600",
      marginTop: r.ms(8),
      alignSelf: "flex-end",
    },

    refreshButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      gap: r.ms(7),
      padding: r.ms(10),
      marginTop: r.ms(2),
    },

    refreshText: {
      color: primary,
      fontSize: r.ms(11),
      fontWeight: "700",
    },

    iconSize: {
      width: r.ms(30),
      height: r.ms(30),
    },

    heroIconSize: {
      width: r.ms(21),
      height: r.ms(21),
    },

    smallIcon: {
      width: r.ms(15),
      height: r.ms(15),
    },

    iconColor: {
      color: primary,
    },
  });
};
