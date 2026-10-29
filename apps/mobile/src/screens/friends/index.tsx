import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
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
import { useResponsive } from "react-native-fluid-styles";

import { Container } from "@/components/container";
import { SafeSide } from "@/hooks/useInsetStyle";
import { useTheme } from "@/themes/theme.context";

import {
  useAcceptFriendRequestMutation,
  useCancelFriendRequestMutation,
  useGetFriendsQuery,
  useGetReceivedFriendRequestsQuery,
  useGetSentFriendRequestsQuery,
  useRejectFriendRequestMutation,
  useRemoveFriendMutation,
  useSendFriendRequestMutation,
} from "./api/api.queries";
import { useExploreUsersQuery } from "@/shared/api/api.queries";
import { useAlertStore } from "@/store/alert.store";

type TabKey = "explore" | "friends" | "received" | "sent";

type User = {
  _id?: string;
  id?: string;
  name?: string;
  image?: string | null;
};

type Friendship = {
  friendshipId: string;
  friend: User;
  createdAt?: string;
};

type FriendRequest = {
  _id: string;
  senderId: User | string;
  receiverId: User | string;
  status?: "pending" | "accepted" | "rejected";
  createdAt?: string;
};

type ApiList<T> = {
  success?: boolean;
  data?: T[];
};

function getList<T>(response: unknown): T[] {
  if (!response || typeof response !== "object") return [];

  const result = response as ApiList<T> & {
    data?: T[] | ApiList<T>;
  };

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  if (
    result.data &&
    typeof result.data === "object" &&
    Array.isArray((result.data as ApiList<T>).data)
  ) {
    return (result.data as ApiList<T>).data ?? [];
  }

  return [];
}

function getUser(value: User | string | undefined): User {
  if (!value || typeof value === "string") return {};
  return value;
}

function getUserId(user: User): string | undefined {
  return user.id ?? user._id;
}

function getDisplayName(user: User) {
  return user.name?.trim() || "Riffly user";
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "R";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function FriendsScreen() {
  const { Theme } = useTheme();
  const styles = useStyles();

  const [activeTab, setActiveTab] = useState<TabKey>("explore");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const friendsQuery = useGetFriendsQuery();
  const receivedQuery = useGetReceivedFriendRequestsQuery();
  const sentQuery = useGetSentFriendRequestsQuery();

  const exploreQuery = useExploreUsersQuery();

  const sendRequestMutation = useSendFriendRequestMutation();
  const acceptMutation = useAcceptFriendRequestMutation();
  const rejectMutation = useRejectFriendRequestMutation();
  const cancelMutation = useCancelFriendRequestMutation();
  const removeMutation = useRemoveFriendMutation();
  const success = useAlertStore((state) => state.success);
  const error = useAlertStore((state) => state.error);

  const friends = useMemo(
    () => getList<Friendship>(friendsQuery.data),
    [friendsQuery.data],
  );

  const receivedRequests = useMemo(
    () => getList<FriendRequest>(receivedQuery.data),
    [receivedQuery.data],
  );

  const sentRequests = useMemo(
    () => getList<FriendRequest>(sentQuery.data),
    [sentQuery.data],
  );

  // useInfiniteQuery returns an array of pages.
  const exploreUsers = useMemo(
    () => exploreQuery.data?.pages.flatMap((page) => page.users ?? []) ?? [],
    [exploreQuery.data],
  );

  const sentUserIds = useMemo(
    () =>
      new Set(
        sentRequests
          .map((request) => getUserId(getUser(request.receiverId)))
          .filter((id): id is string => Boolean(id)),
      ),
    [sentRequests],
  );

  const friendUserIds = useMemo(
    () =>
      new Set(
        friends
          .map((friendship) => getUserId(friendship.friend))
          .filter((id): id is string => Boolean(id)),
      ),
    [friends],
  );

  const isWorking =
    sendRequestMutation.isPending ||
    acceptMutation.isPending ||
    rejectMutation.isPending ||
    cancelMutation.isPending ||
    removeMutation.isPending;

  const refreshAll = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([
        friendsQuery.refetch(),
        receivedQuery.refetch(),
        sentQuery.refetch(),
        exploreQuery.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [friendsQuery, receivedQuery, sentQuery, exploreQuery]);

  const handleSendRequest = (user: User) => {
    const userId = getUserId(user);

    if (!userId) {
      error("Unable to send request", "This user has no valid ID.");

      return;
    }

    sendRequestMutation.mutate(userId, {
      onSuccess: () => {
        success(
          "Request sent",
          `Your friend request was sent to ${getDisplayName(user)}.`,
        );
      },
      onError: () => {
        error(
          "Couldn't send request",
          "Please try again. The request may already exist.",
        );
      },
    });
  };

  const handleAccept = (requestId: string) => {
    acceptMutation.mutate(requestId, {
      onSuccess: () => {
        error("Request accepted", "You're now friends on Riffly.");
      },
    });
  };

  const handleReject = (requestId: string) => {
    Alert.alert("Reject request?", "This friend request will be declined.", [
      { text: "Keep request", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => rejectMutation.mutate(requestId),
      },
    ]);
  };

  const handleCancel = (requestId: string) => {
    Alert.alert(
      "Cancel request?",
      "The pending friend request will be removed.",
      [
        { text: "Keep request", style: "cancel" },
        {
          text: "Cancel request",
          style: "destructive",
          onPress: () => cancelMutation.mutate(requestId),
        },
      ],
    );
  };

  const handleRemoveFriend = (friendship: Friendship) => {
    const userId = getUserId(friendship.friend);

    if (!userId) {
      error(
        "Unable to remove friend",
        "The friend's user ID was not included in the API response.",
      );
      return;
    }

    Alert.alert(
      "Remove friend?",
      `Remove ${getDisplayName(friendship.friend)} from your friends?`,
      [
        { text: "Keep friend", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeMutation.mutate(userId),
        },
      ],
    );
  };

  const loadMoreUsers = () => {
    if (
      activeTab === "explore" &&
      exploreQuery.hasNextPage &&
      !exploreQuery.isFetchingNextPage
    ) {
      exploreQuery.fetchNextPage();
    }
  };

  const renderExploreContent = () => {
    if (exploreQuery.isLoading) {
      return <LoadingState message="Discovering people on Riffly..." />;
    }

    if (exploreQuery.isError && exploreUsers.length === 0) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load people"
          subtitle="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => exploreQuery.refetch()}
        />
      );
    }

    const normalizedSearch = search.trim().toLowerCase();

    // This is client-side filtering of the pages already fetched.
    // For a large directory, move search to the backend.
    const filteredUsers = exploreUsers.filter((user) =>
      getDisplayName(user).toLowerCase().includes(normalizedSearch),
    );

    if (filteredUsers.length === 0) {
      return (
        <EmptyState
          icon="search-outline"
          title={search ? "No matching people" : "You're all caught up"}
          subtitle={
            search
              ? "Try another name."
              : "There are no more people to show right now."
          }
        />
      );
    }

    return (
      <>
        {filteredUsers.map((user) => {
          const userId = getUserId(user);
          const isFriend = Boolean(userId && friendUserIds.has(userId));
          const requestSent = Boolean(userId && sentUserIds.has(userId));

          return (
            <ExploreUserCard
              key={userId ?? `${user.name}-${Math.random()}`}
              user={user}
              disabled={isWorking || isFriend || requestSent}
              isFriend={isFriend}
              requestSent={requestSent}
              onSendRequest={() => handleSendRequest(user)}
            />
          );
        })}

        {exploreQuery.hasNextPage && (
          <Pressable
            onPress={loadMoreUsers}
            disabled={exploreQuery.isFetchingNextPage}
            style={styles.loadMoreButton}
          >
            {exploreQuery.isFetchingNextPage ? (
              <ActivityIndicator color={Theme.colors.primary} />
            ) : (
              <>
                <Text style={styles.loadMoreText}>Load more people</Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={Theme.colors.primary}
                />
              </>
            )}
          </Pressable>
        )}
      </>
    );
  };

  const renderContent = () => {
    if (activeTab === "explore") {
      return renderExploreContent();
    }

    if (activeTab === "friends") {
      if (friendsQuery.isLoading) {
        return <LoadingState message="Loading your friends..." />;
      }

      if (friendsQuery.isError) {
        return (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load friends"
            subtitle="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => friendsQuery.refetch()}
          />
        );
      }

      if (!friends.length) {
        return (
          <EmptyState
            icon="people-outline"
            title="Your circle starts here"
            subtitle="Explore people and send friend requests to grow your circle."
            actionLabel="Explore people"
            onAction={() => setActiveTab("explore")}
          />
        );
      }

      return friends.map((friendship) => (
        <FriendCard
          key={friendship.friendshipId}
          user={friendship.friend}
          onRemove={() => handleRemoveFriend(friendship)}
          disabled={isWorking}
        />
      ));
    }

    if (activeTab === "received") {
      if (receivedQuery.isLoading) {
        return <LoadingState message="Loading received requests..." />;
      }

      if (receivedQuery.isError) {
        return (
          <EmptyState
            icon="cloud-offline-outline"
            title="Couldn't load requests"
            subtitle="Check your connection and try again."
            actionLabel="Try again"
            onAction={() => receivedQuery.refetch()}
          />
        );
      }

      if (!receivedRequests.length) {
        return (
          <EmptyState
            icon="mail-open-outline"
            title="All caught up"
            subtitle="You don't have any pending friend requests right now."
          />
        );
      }

      return receivedRequests.map((request) => (
        <RequestCard
          key={request._id}
          user={getUser(request.senderId)}
          subtitle="Would like to connect with you"
          disabled={isWorking}
          onAccept={() => handleAccept(request._id)}
          onReject={() => handleReject(request._id)}
        />
      ));
    }

    if (sentQuery.isLoading) {
      return <LoadingState message="Loading sent requests..." />;
    }

    if (sentQuery.isError) {
      return (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load requests"
          subtitle="Check your connection and try again."
          actionLabel="Try again"
          onAction={() => sentQuery.refetch()}
        />
      );
    }

    if (!sentRequests.length) {
      return (
        <EmptyState
          icon="paper-plane-outline"
          title="No pending requests"
          subtitle="Friend requests you send will appear here until they're accepted or declined."
        />
      );
    }

    return sentRequests.map((request) => (
      <SentRequestCard
        key={request._id}
        user={getUser(request.receiverId)}
        disabled={isWorking}
        onCancel={() => handleCancel(request._id)}
      />
    ));
  };

  const sectionTitle = {
    explore: "DISCOVER PEOPLE",
    friends: "MY FRIENDS",
    received: "RECEIVED REQUESTS",
    sent: "SENT REQUESTS",
  }[activeTab];

  const sectionCount = {
    explore: `${exploreUsers.length} loaded`,
    friends: `${friends.length} total`,
    received: `${receivedRequests.length} pending`,
    sent: `${sentRequests.length} pending`,
  }[activeTab];

  return (
    <Container
      style={{
        flex: 1,
        maxWidth: "100%",
        backgroundColor: Theme.colors.background,
      }}
      insetStyle={{ ...SafeSide, bottom: false }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={Theme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Friends</Text>
              <View style={styles.titleDot} />
            </View>

            <Text style={styles.subtitle}>
              Your people, your music, your moments.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="people-outline"
              size={23}
              color={Theme.colors.primary}
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="people" size={22} color={Theme.colors.primary} />
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Your circle</Text>
            <Text style={styles.summarySubtitle}>
              Keep your favourite people close
            </Text>
          </View>

          <View style={styles.summaryCounts}>
            <Text style={styles.summaryCount}>{friends.length}</Text>
            <Text style={styles.summaryCountLabel}>FRIENDS</Text>
          </View>
        </View>

        {/* Incoming request banner */}
        {receivedRequests.length > 0 && (
          <Pressable
            onPress={() => setActiveTab("received")}
            style={styles.pendingBanner}
            accessibilityRole="button"
          >
            <View style={styles.pendingIcon}>
              <Ionicons
                name="person-add-outline"
                size={19}
                color={Theme.colors.primary}
              />
            </View>

            <View style={styles.pendingInfo}>
              <Text style={styles.pendingTitle}>Friend requests waiting</Text>
              <Text style={styles.pendingSubtitle}>
                {receivedRequests.length}{" "}
                {receivedRequests.length === 1 ? "person wants" : "people want"}{" "}
                to connect with you.
              </Text>
            </View>

            <View style={styles.pendingCount}>
              <Text style={styles.pendingCountText}>
                {receivedRequests.length}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color={Theme.colors.text}
            />
          </Pressable>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TabButton
            label="Explore"
            icon="compass-outline"
            count={0}
            active={activeTab === "explore"}
            onPress={() => setActiveTab("explore")}
          />

          <TabButton
            label="Friends"
            icon="people-outline"
            count={friends.length}
            active={activeTab === "friends"}
            onPress={() => setActiveTab("friends")}
          />

          <TabButton
            label="Received"
            icon="mail-outline"
            count={receivedRequests.length}
            active={activeTab === "received"}
            onPress={() => setActiveTab("received")}
          />

          <TabButton
            label="Sent"
            icon="paper-plane-outline"
            count={sentRequests.length}
            active={activeTab === "sent"}
            onPress={() => setActiveTab("sent")}
          />
        </View>

        {/* Search appears only in Explore */}
        {activeTab === "explore" && (
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={18}
              color={Theme.colors.text}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search people"
              placeholderTextColor={`${Theme.colors.text}80`}
              style={styles.searchInput}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Theme.colors.text}
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Section heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionCount}>{sectionCount}</Text>
        </View>

        {/* Active tab content */}
        <View style={styles.listContent}>{renderContent()}</View>

        <Text style={styles.footerText}>
          Pull down to refresh your people and requests.
        </Text>
      </ScrollView>
    </Container>
  );
}

function TabButton({
  label,
  icon,
  count,
  active,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.tabButton, active && styles.activeTabButton]}
    >
      <Ionicons
        name={icon}
        size={15}
        color={active ? Theme.colors.background : Theme.colors.text}
      />

      <Text
        numberOfLines={1}
        style={[styles.tabText, active && styles.activeTabText]}
      >
        {label}
      </Text>

      {count > 0 && (
        <View style={[styles.tabCount, active && styles.activeTabCount]}>
          <Text
            style={[styles.tabCountText, active && styles.activeTabCountText]}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function Avatar({ user }: { user: User }) {
  const styles = useStyles();
  const name = getDisplayName(user);

  if (user.image) {
    return (
      <View style={styles.avatar}>
        <Image source={{ uri: user.image }} style={styles.avatarImage} />
      </View>
    );
  }

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </View>
  );
}

function ExploreUserCard({
  user,
  disabled,
  isFriend,
  requestSent,
  onSendRequest,
}: {
  user: User;
  disabled: boolean;
  isFriend: boolean;
  requestSent: boolean;
  onSendRequest: () => void;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  const buttonLabel = isFriend ? "Friends" : requestSent ? "Sent" : "Add";

  return (
    <View style={styles.userCard}>
      <Avatar user={user} />

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {getDisplayName(user)}
        </Text>

        <View style={styles.userStatusRow}>
          <Ionicons
            name="musical-notes-outline"
            size={13}
            color={Theme.colors.primary}
          />
          <Text style={styles.userStatus}>Riffly member</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${buttonLabel} ${getDisplayName(user)}`}
        disabled={disabled}
        onPress={onSendRequest}
        style={[
          styles.addFriendButton,
          (isFriend || requestSent) && styles.secondaryButton,
          disabled && styles.disabledButton,
        ]}
      >
        <Ionicons
          name={
            isFriend
              ? "checkmark"
              : requestSent
                ? "time-outline"
                : "person-add-outline"
          }
          size={14}
          color={
            isFriend || requestSent
              ? Theme.colors.text
              : Theme.colors.background
          }
        />

        <Text
          style={[
            styles.addFriendButtonText,
            (isFriend || requestSent) && styles.secondaryButtonText,
          ]}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function FriendCard({
  user,
  onRemove,
  disabled,
}: {
  user: User;
  onRemove: () => void;
  disabled: boolean;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.userCard}>
      <Avatar user={user} />

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {getDisplayName(user)}
        </Text>

        <View style={styles.userStatusRow}>
          <Ionicons name="checkmark-circle" size={13} color="#22C55E" />
          <Text style={styles.userStatus}>You're friends</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${getDisplayName(user)} from friends`}
        disabled={disabled}
        onPress={onRemove}
        style={[styles.iconButton, disabled && styles.disabledButton]}
      >
        <Ionicons
          name="person-remove-outline"
          size={17}
          color={Theme.colors.text}
        />
      </Pressable>
    </View>
  );
}

function RequestCard({
  user,
  subtitle,
  disabled,
  onAccept,
  onReject,
}: {
  user: User;
  subtitle: string;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.requestCard}>
      <Avatar user={user} />

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {getDisplayName(user)}
        </Text>
        <Text style={styles.requestSubtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>

      <View style={styles.requestActions}>
        <Pressable
          disabled={disabled}
          onPress={onReject}
          style={[styles.rejectButton, disabled && styles.disabledButton]}
        >
          <Ionicons name="close" size={19} color={Theme.colors.text} />
        </Pressable>

        <Pressable
          disabled={disabled}
          onPress={onAccept}
          style={[styles.acceptButton, disabled && styles.disabledButton]}
        >
          <Ionicons
            name="checkmark"
            size={17}
            color={Theme.colors.background}
          />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SentRequestCard({
  user,
  disabled,
  onCancel,
}: {
  user: User;
  disabled: boolean;
  onCancel: () => void;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.userCard}>
      <Avatar user={user} />

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {getDisplayName(user)}
        </Text>

        <View style={styles.userStatusRow}>
          <Ionicons
            name="time-outline"
            size={13}
            color={Theme.colors.primary}
          />
          <Text style={styles.userStatus}>Request pending</Text>
        </View>
      </View>

      <Pressable
        disabled={disabled}
        onPress={onCancel}
        style={[styles.cancelButton, disabled && styles.disabledButton]}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

function LoadingState({ message }: { message: string }) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={Theme.colors.primary} />
      <Text style={styles.stateTitle}>{message}</Text>
    </View>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { Theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={28} color={Theme.colors.primary} />
      </View>

      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateSubtitle}>{subtitle}</Text>

      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
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
      backgroundColor: "transparent",
    },
    contentContainer: {
      paddingHorizontal: r.ms(5),
      paddingBottom: r.ms(35),
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
    headerIcon: {
      width: r.ms(43),
      height: r.ms(43),
      borderRadius: r.ms(14),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
    },
    summaryCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(13),
      marginBottom: r.ms(14),
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
    summaryInfo: {
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
      lineHeight: r.ms(14),
      color: text,
      opacity: 0.65,
    },
    summaryCounts: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: r.ms(48),
    },
    summaryCount: {
      fontSize: r.ms(24),
      lineHeight: r.ms(27),
      fontWeight: "800",
      color: primary,
    },
    summaryCountLabel: {
      marginTop: r.ms(2),
      fontSize: r.ms(8),
      fontWeight: "800",
      letterSpacing: 0.6,
      color: text,
      opacity: 0.6,
    },
    pendingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(9),
      padding: r.ms(11),
      marginBottom: r.ms(15),
      borderRadius: r.ms(14),
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: `${primary}35`,
    },
    pendingIcon: {
      width: r.ms(36),
      height: r.ms(36),
      borderRadius: r.ms(11),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
    },
    pendingInfo: {
      flex: 1,
      minWidth: 0,
    },
    pendingTitle: {
      fontSize: r.ms(11),
      fontWeight: "800",
      color: text,
    },
    pendingSubtitle: {
      marginTop: r.ms(3),
      fontSize: r.ms(10),
      lineHeight: r.ms(14),
      color: text,
      opacity: 0.7,
    },
    pendingCount: {
      minWidth: r.ms(23),
      height: r.ms(23),
      borderRadius: r.ms(12),
      paddingHorizontal: r.ms(5),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
    },
    pendingCountText: {
      fontSize: r.ms(10),
      fontWeight: "800",
      color: background,
    },
    tabs: {
      flexDirection: "row",
      padding: r.ms(4),
      marginBottom: r.ms(15),
      borderRadius: r.ms(13),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      gap: r.ms(2),
    },
    tabButton: {
      flex: 1,
      minWidth: 0,
      minHeight: r.ms(38),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(3),
      paddingHorizontal: r.ms(3),
      paddingVertical: r.ms(7),
      borderRadius: r.ms(10),
    },
    activeTabButton: {
      backgroundColor: primary,
    },
    tabText: {
      flexShrink: 1,
      fontSize: r.ms(9),
      fontWeight: "700",
      color: text,
      opacity: 0.72,
    },
    activeTabText: {
      color: background,
      opacity: 1,
    },
    tabCount: {
      minWidth: r.ms(17),
      height: r.ms(17),
      paddingHorizontal: r.ms(4),
      borderRadius: r.ms(9),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}18`,
    },
    activeTabCount: {
      backgroundColor: `${background}30`,
    },
    tabCountText: {
      fontSize: r.ms(9),
      fontWeight: "800",
      color: text,
    },
    activeTabCountText: {
      color: background,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(8),
      minHeight: r.ms(43),
      paddingHorizontal: r.ms(12),
      marginBottom: r.ms(18),
      borderRadius: r.ms(12),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },
    searchInput: {
      flex: 1,
      minWidth: 0,
      paddingVertical: r.ms(9),
      fontSize: r.ms(12),
      color: text,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: r.ms(7),
      marginBottom: r.ms(10),
    },
    sectionTitle: {
      fontSize: r.ms(10),
      fontWeight: "800",
      letterSpacing: 0.9,
      color: text,
    },
    sectionCount: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.6,
    },
    listContent: {
      gap: r.ms(8),
    },
    userCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(11),
      borderRadius: r.ms(15),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },
    requestCard: {
      flexDirection: "row",
      alignItems: "center",
      padding: r.ms(10),
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
      overflow: "hidden",
      backgroundColor: `${primary}20`,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: r.ms(15),
    },
    avatarText: {
      fontSize: r.ms(16),
      fontWeight: "800",
      color: primary,
    },
    userInfo: {
      flex: 1,
      minWidth: 0,
      marginLeft: r.ms(11),
      marginRight: r.ms(7),
    },
    userName: {
      fontSize: r.ms(12),
      fontWeight: "700",
      color: text,
    },
    userStatusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: r.ms(4),
      marginTop: r.ms(5),
    },
    userStatus: {
      fontSize: r.ms(10),
      color: text,
      opacity: 0.65,
    },
    requestSubtitle: {
      marginTop: r.ms(4),
      fontSize: r.ms(10),
      lineHeight: r.ms(14),
      color: text,
      opacity: 0.65,
    },
    addFriendButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(4),
      paddingHorizontal: r.ms(9),
      minHeight: r.ms(35),
      borderRadius: r.ms(10),
      backgroundColor: primary,
    },
    addFriendButtonText: {
      fontSize: r.ms(10),
      fontWeight: "800",
      color: background,
    },
    secondaryButton: {
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: border,
    },
    secondaryButtonText: {
      color: text,
    },
    iconButton: {
      width: r.ms(36),
      height: r.ms(36),
      borderRadius: r.ms(11),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: border,
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
    cancelButton: {
      paddingHorizontal: r.ms(10),
      paddingVertical: r.ms(8),
      borderRadius: r.ms(10),
      backgroundColor: `${primary}12`,
      borderWidth: 1,
      borderColor: border,
    },
    cancelButtonText: {
      fontSize: r.ms(10),
      fontWeight: "700",
      color: text,
    },
    disabledButton: {
      opacity: 0.5,
    },
    loadMoreButton: {
      minHeight: r.ms(42),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: r.ms(7),
      marginTop: r.ms(8),
      padding: r.ms(10),
      borderRadius: r.ms(12),
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
    },
    loadMoreText: {
      fontSize: r.ms(11),
      fontWeight: "700",
      color: primary,
    },
    stateContainer: {
      minHeight: r.ms(200),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(25),
      paddingVertical: r.ms(28),
    },
    emptyState: {
      minHeight: r.ms(210),
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: r.ms(25),
      paddingVertical: r.ms(25),
    },
    emptyIcon: {
      width: r.ms(60),
      height: r.ms(60),
      borderRadius: r.ms(19),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: cardBackground,
      borderWidth: 1,
      borderColor: border,
      marginBottom: r.ms(5),
    },
    stateTitle: {
      marginTop: r.ms(12),
      fontSize: r.ms(15),
      lineHeight: r.ms(20),
      fontWeight: "800",
      color: text,
      textAlign: "center",
    },
    stateSubtitle: {
      marginTop: r.ms(7),
      fontSize: r.ms(11),
      lineHeight: r.ms(17),
      color: text,
      opacity: 0.65,
      textAlign: "center",
    },
    primaryButton: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: r.ms(16),
      paddingHorizontal: r.ms(14),
      paddingVertical: r.ms(10),
      borderRadius: r.ms(11),
      backgroundColor: primary,
    },
    primaryButtonText: {
      fontSize: r.ms(11),
      fontWeight: "800",
      color: background,
    },
    footerText: {
      marginTop: r.ms(13),
      fontSize: r.ms(9),
      color: text,
      opacity: 0.5,
      textAlign: "center",
    },
  });
};
