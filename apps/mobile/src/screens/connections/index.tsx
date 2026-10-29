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
import { moderateScale } from "react-native-size-matters";

import { useAuthStore } from "@/store/auth.store";
import { groupService } from "./group.service";

import { useGroupStore } from "./group.store";
import { useGetFriendsQuery } from "../friends/api/api.queries";

import type { Group, GroupInvitation, GroupMember } from "./group.types";

type ActionName =
  | "create"
  | "invite"
  | "accept"
  | "reject"
  | "permission"
  | "leave"
  | "discard"
  | "refresh";

export default function GroupScreen() {
  const user = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.group);
  const invitations = useGroupStore((state) => state.invitations);
  const friendIds = useGroupStore((state) => state.friendIds);
  const error = useGroupStore((state) => state.error);
  const { data: friendsResponse } = useGetFriendsQuery();
  const friends = friendsResponse?.data ?? [];
  const friendsById = useMemo(() => {
    return new Map(
      friends.map((item: any) => [
        item.friend._id || item.friend.id,
        item.friend,
      ]),
    );
  }, [friends]);

  const setError = useGroupStore((state) => state.setError);

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
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
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

      // Friends are only available to a group member who has
      // permission to invite. A user without a group cannot
      // fetch this list through the current backend handler.
      const latestGroup: any =
        results[0].status === "fulfilled" ? results[0].value : null;

      const member = latestGroup?.members.find(
        (item: any) => item.userId === currentUserId,
      );

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
      "Leave group",
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
      <View style={styles.centered}>
        <Text style={styles.mutedText}>Sign in to use group listening.</Text>
      </View>
    );
  }

  if (!initialized && !group && invitations.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your groups...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshGroupData} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Group Listening</Text>
        <Text style={styles.subtitle}>Listen together with your friends.</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => setError(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Incoming invitations */}

      <Section title="Invitations">
        {invitations.length === 0 ? (
          <EmptyState text="You don't have any pending invitations." />
        ) : (
          invitations.map((invitation) => {
            const inviter: any = friendsById.get(invitation.invitedBy);
            console.log({
              currentUserId: user?._id,
              currentUserName: user?.name,
              invitedBy: invitation.invitedBy,
              friends: friends.map((item: any) => ({
                id: item.friend._id,
                name: item.friend.name,
              })),
            });

            return (
              <View key={invitation.id} style={styles.card}>
                <View style={styles.friendRow}>
                  {inviter?.image ? (
                    <Image
                      source={{ uri: inviter.image }}
                      style={styles.friendAvatar}
                    />
                  ) : (
                    <View style={styles.friendAvatarFallback}>
                      <Text style={styles.avatarInitial}>
                        {(inviter?.name || "U").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.flex}>
                    <Text style={styles.cardTitle}>
                      {inviter?.name ||
                        `User ${invitation.invitedBy.slice(-6)}`}
                    </Text>

                    <Text style={styles.bodyText}>
                      invited you to join a group
                    </Text>
                  </View>
                </View>

                <Text style={styles.mutedText}>
                  Group ID: {invitation.groupId}
                </Text>

                <View style={styles.row}>
                  <ActionButton
                    label="Accept"
                    disabled={Boolean(busyAction)}
                    loading={busyAction === "accept"}
                    onPress={() => handleAcceptInvitation(invitation)}
                  />

                  <ActionButton
                    label="Reject"
                    variant="secondary"
                    disabled={Boolean(busyAction)}
                    loading={busyAction === "reject"}
                    onPress={() => handleRejectInvitation(invitation)}
                  />
                </View>
              </View>
            );
          })
        )}
      </Section>

      {/* No current group */}

      {!group ? (
        <Section title="Your group">
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Start listening together</Text>

            <Text style={styles.bodyText}>
              Create a group, invite your friends, and listen together.
            </Text>

            <ActionButton
              label="Create group"
              loading={busyAction === "create"}
              disabled={Boolean(busyAction)}
              onPress={handleCreateGroup}
            />
          </View>
        </Section>
      ) : (
        <>
          {/* Current group */}

          <Section title="Current group">
            <View style={styles.card}>
              <View style={styles.groupHeader}>
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

              <Text style={styles.bodyText}>
                {group.members.length}{" "}
                {group.members.length === 1 ? "member" : "members"}
              </Text>

              <Text style={styles.mutedText}>
                You {canInvite ? "can" : "cannot"} invite friends.
              </Text>
            </View>
          </Section>

          {/* Members */}

          <Section title="Members">
            {group.members.map((member) => {
              const memberIsOwner = member.userId === group.ownerId;
              const isCurrentUser = member.userId === currentUserId;

              const friend: any = friendsById.get(member.userId);

              const displayName = isCurrentUser
                ? `${user?.name || "You"} (You)`
                : friend?.name || `Member ${member.userId.slice(-6)}`;

              console.log(displayName, friend);

              return (
                <View key={member.userId} style={styles.memberCard}>
                  <View style={styles.memberAvatar}>
                    {friend?.image ? (
                      <Image
                        source={{ uri: friend.image }}
                        style={styles.memberAvatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>
                        {(isCurrentUser ? user?.name : friend?.name || "M")
                          ?.charAt(0)
                          .toUpperCase() || "M"}
                      </Text>
                    )}
                  </View>

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

                  {isOwner && !memberIsOwner && (
                    <Pressable
                      disabled={Boolean(busyAction)}
                      style={[
                        styles.permissionButton,
                        member.canInvite && styles.permissionEnabled,
                      ]}
                      onPress={() =>
                        handlePermissionChange(member, !member.canInvite)
                      }
                    >
                      {busyAction === "permission" ? (
                        <ActivityIndicator size="small" />
                      ) : (
                        <Text style={styles.permissionText}>
                          {member.canInvite ? "Revoke" : "Allow invites"}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>
              );
            })}
          </Section>

          {/* Invite friends */}

          {canInvite ? (
            <Section title="Invite friends">
              <View style={styles.card}>
                <Text style={styles.bodyText}>
                  Select an eligible friend or enter their user ID.
                </Text>

                {friendIds.length > 0 ? (
                  <View style={styles.friendList}>
                    {friendIds.map((id) => {
                      const friend: any = friendsById.get(id);

                      return (
                        <View key={id} style={styles.friendRow}>
                          {friend?.image ? (
                            <Image
                              source={{ uri: friend.image }}
                              style={styles.friendAvatar}
                            />
                          ) : (
                            <View style={styles.friendAvatarFallback}>
                              <Text style={styles.avatarInitial}>
                                {(friend?.name || "U").charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}

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
                            disabled={Boolean(busyAction)}
                            loading={busyAction === "invite"}
                            onPress={() => handleInvite(id)}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <EmptyState text="No eligible friends were returned by the server." />
                )}

                <Text style={styles.inputLabel}>Friend user ID</Text>

                <TextInput
                  value={friendId}
                  onChangeText={setFriendId}
                  placeholder="Enter friend user ID"
                  placeholderTextColor="#888"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />

                <ActionButton
                  label="Send invitation"
                  disabled={Boolean(busyAction) || !friendId.trim()}
                  loading={busyAction === "invite"}
                  onPress={() => handleInvite(friendId)}
                />
              </View>
            </Section>
          ) : null}

          {/* Group actions */}

          <Section title="Group settings">
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
                  />
                </>
              ) : null}

              <ActionButton
                label={isOwner ? "Leave and end group" : "Leave group"}
                variant="secondary"
                disabled={Boolean(busyAction)}
                onPress={handleLeaveGroup}
              />
            </View>
          </Section>
        </>
      )}

      <Pressable
        onPress={() => void refreshGroupData()}
        disabled={refreshing || Boolean(busyAction)}
        style={styles.refreshButton}
      >
        <Text style={styles.refreshText}>
          {refreshing ? "Refreshing..." : "Refresh group data"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.mutedText}>{text}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
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
        pressed && !disabled && styles.pressedButton,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? "#222" : "#fff"}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "secondary" && styles.secondaryButtonText,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  memberAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(20),
  },
  friendAvatar: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
  },

  friendAvatarFallback: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarInitial: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  screen: {
    flex: 1,
    backgroundColor: "#0D0D0F",
  },
  content: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(36),
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D0D0F",
    padding: moderateScale(20),
  },
  header: {
    marginBottom: moderateScale(20),
  },
  title: {
    fontSize: moderateScale(24),
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: moderateScale(12),
    color: "#A4A4AA",
    marginTop: moderateScale(5),
  },
  section: {
    marginBottom: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: moderateScale(10),
  },
  card: {
    backgroundColor: "#19191E",
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: moderateScale(8),
    borderWidth: 1,
    borderColor: "#29292F",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: moderateScale(12),
  },
  flex: {
    flex: 1,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "700",
    marginBottom: moderateScale(6),
  },
  bodyText: {
    color: "#D0D0D5",
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
    marginBottom: moderateScale(8),
  },
  mutedText: {
    color: "#A4A4AA",
    fontSize: moderateScale(11),
    lineHeight: moderateScale(16),
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: moderateScale(12),
    fontSize: moderateScale(12),
  },
  badge: {
    paddingHorizontal: moderateScale(9),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(20),
    marginLeft: moderateScale(8),
  },
  ownerBadge: {
    backgroundColor: "#493717",
  },
  memberBadge: {
    backgroundColor: "#263B52",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    marginTop: moderateScale(8),
  },
  button: {
    minHeight: moderateScale(38),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(9),
    borderRadius: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    marginTop: moderateScale(8),
  },
  primaryButton: {
    backgroundColor: "#7C4DFF",
  },
  secondaryButton: {
    backgroundColor: "#E8E8EC",
  },
  dangerButton: {
    backgroundColor: "#B83232",
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#222222",
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19191E",
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(8),
    gap: moderateScale(10),
  },
  memberAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#353044",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: moderateScale(14),
  },
  memberName: {
    color: "#FFFFFF",
    fontSize: moderateScale(12),
    fontWeight: "600",
    marginBottom: moderateScale(3),
  },
  permissionButton: {
    backgroundColor: "#303036",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(7),
    borderRadius: moderateScale(6),
  },
  permissionEnabled: {
    backgroundColor: "#28513D",
  },
  permissionText: {
    color: "#FFFFFF",
    fontSize: moderateScale(10),
    fontWeight: "600",
  },
  friendList: {
    marginVertical: moderateScale(8),
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    paddingVertical: moderateScale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#36363C",
  },
  inputLabel: {
    color: "#D0D0D5",
    fontSize: moderateScale(12),
    fontWeight: "600",
    marginTop: moderateScale(12),
    marginBottom: moderateScale(6),
  },
  input: {
    minHeight: moderateScale(42),
    backgroundColor: "#101014",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#393940",
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(10),
    fontSize: moderateScale(12),
  },
  emptyState: {
    backgroundColor: "#19191E",
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
  },
  errorBox: {
    backgroundColor: "#421F23",
    borderColor: "#78363D",
    borderWidth: 1,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: moderateScale(16),
  },
  errorText: {
    color: "#FFC6CB",
    fontSize: moderateScale(12),
  },
  dismissText: {
    color: "#FFFFFF",
    fontSize: moderateScale(11),
    fontWeight: "600",
    marginTop: moderateScale(8),
  },
  refreshButton: {
    alignSelf: "center",
    padding: moderateScale(10),
  },
  refreshText: {
    color: "#BBA7FF",
    fontSize: moderateScale(12),
    fontWeight: "600",
  },
});
