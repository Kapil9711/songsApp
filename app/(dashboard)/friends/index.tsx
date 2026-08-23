import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { setAuthHeader } from "@/src/network/api";
import axiosInstance from "@/src/network/api";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import FriendCard from "@/src/container/dashboard/common/song-card/friendCard";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "react-native-size-matters";

const Friends = () => {
  const {
    isActionLoading,
    getFriends,
    getRequest,
    getUsers,
    active,
    setActive,
    user,
    friends,
    requests,
    users,
    sendFriendRequest,
    confirmFriendRequest,
    isLoading,
  } = useFriend();

  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Friends<Text style={styles.dot}>.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Connect and share your favorite music
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </View>
      </View>

      {/* Tabs */}
      {/* <FriendsTabs
        active={active}
        setActive={setActive}
        getFriends={getFriends}
        getRequest={getRequest}
        getUsers={getUsers}
        requestCount={requests?.length ?? 0}
      /> */}

      {/* Content */}
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {active === "explore" && (
            <ShowFriend
              isActionLoading={isActionLoading}
              type="users"
              data={users}
              sendFriendRequest={sendFriendRequest}
            />
          )}

          {active === "requests" && (
            <ShowFriend
              isActionLoading={isActionLoading}
              confirmFriendRequest={confirmFriendRequest}
              type="requests"
              data={requests}
              sendFriendRequest={sendFriendRequest}
            />
          )}

          {active === "friends" && (
            <ShowFriend
              type="friends"
              data={friends}
              sendFriendRequest={sendFriendRequest}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

/* =========================================================
   TABS
========================================================= */

const FriendsTabs = ({
  active,
  setActive,
  getFriends,
  getRequest,
  getUsers,
  requestCount,
}: any) => {
  const tabs = [
    {
      key: "friends",
      label: "Friends",
      icon: "people-outline",
      activeIcon: "people",
      onPress: () => {
        setActive("friends");
        getFriends();
      },
    },
    {
      key: "explore",
      label: "Explore",
      icon: "search-outline",
      activeIcon: "search",
      onPress: () => {
        setActive("explore");
        getUsers();
      },
    },
    {
      key: "requests",
      label: "Requests",
      icon: "person-add-outline",
      activeIcon: "person-add",
      onPress: () => {
        setActive("requests");
        getRequest();
      },
    },
  ];

  return (
    <View style={styles.tabsWrapper}>
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const isActive = active === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={tab.onPress}
              style={({ pressed }) => [
                styles.tab,
                isActive && styles.activeTab,
                pressed && styles.tabPressed,
              ]}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : (tab.icon as any)}
                size={18}
                color={isActive ? colors.primary : colors.textMuted}
              />

              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>

              {tab.key === "requests" && requestCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {requestCount > 9 ? "9+" : requestCount}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

/* =========================================================
   LOADING
========================================================= */

const Loading = () => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingIcon}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>

      <Text style={styles.loadingTitle}>Loading...</Text>

      <Text style={styles.loadingSubtitle}>Finding your people</Text>
    </View>
  );
};

/* =========================================================
   FRIEND LIST
========================================================= */

const ShowFriend = ({
  data,
  sendFriendRequest,
  type,
  confirmFriendRequest,
  isActionLoading,
}: any) => {
  const list = data ?? [];

  if (list.length === 0) {
    return <EmptyFriends type={type} />;
  }

  return (
    <View style={styles.friendList}>
      {list.map((item: any, idx: number) => {
        return (
          <View
            key={item?._id ?? item?.user?._id ?? idx}
            style={styles.friendCardWrapper}
          >
            <FriendCard
              item={item}
              type={type}
              sendFriendRequest={sendFriendRequest}
              confirmFriendRequest={confirmFriendRequest}
              isActionLoading={isActionLoading}
            />
          </View>
        );
      })}
    </View>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyFriends = ({ type }: { type: string }) => {
  const config: Record<
    string,
    {
      icon: keyof typeof Ionicons.glyphMap;
      title: string;
      description: string;
    }
  > = {
    friends: {
      icon: "people-outline",
      title: "No friends yet",
      description: "Explore people and start building your music circle.",
    },

    users: {
      icon: "search-outline",
      title: "No users found",
      description: "There are no new people to discover right now.",
    },

    requests: {
      icon: "person-add-outline",
      title: "No requests",
      description: "Friend requests you receive will appear here.",
    },
  };

  const current = config[type] ?? config.friends;

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons name={current.icon} size={30} color={colors.primary} />
      </View>

      <Text style={styles.emptyTitle}>{current.title}</Text>

      <Text style={styles.emptyDescription}>{current.description}</Text>
    </View>
  );
};

/* =========================================================
   FRIEND HOOK
========================================================= */

const useFriend = () => {
  const [active, setActive] = useState("friends");

  const { user } = useGlobalContext();

  const [friends, setFriends] = useState<any[]>([]);

  const [requests, setRequests] = useState<any[]>([]);

  const [users, setUsers] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isActionLoading, setIsActionLoading] = useState(false);

  const { setFriends: setGlobalFriend } = useGlobalContext();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);

        await setAuthHeader();

        const [friendsResponse, requestsResponse, usersResponse] =
          await Promise.all([
            axiosInstance.get("/friend"),
            axiosInstance.get("/friend/request"),
            axiosInstance.get("/user/all"),
          ]);

        const friendsData = friendsResponse.data;

        const requestsData = requestsResponse.data;

        const usersData = usersResponse.data;

        if (friendsData.success) {
          setFriends(friendsData.friends);

          setGlobalFriend(friendsData.friends);
        }

        if (requestsData.success) {
          setRequests(requestsData.friendRequests);
        }

        if (usersData.success) {
          setUsers(usersData.users);
        }
      } catch (error) {
        console.error("Failed to load friends data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const getFriends = async () => {
    try {
      setIsLoading(true);

      await setAuthHeader();

      const { data } = await axiosInstance.get("/friend");

      if (data.success) {
        setFriends(data.friends);
        setGlobalFriend(data.friends);
      }
    } catch (error) {
      console.error("Failed to get friends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setIsLoading(true);

      await setAuthHeader();

      const { data } = await axiosInstance.get("/user/all");

      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to get users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequest = async () => {
    try {
      setIsLoading(true);

      await setAuthHeader();

      const { data } = await axiosInstance.get("/friend/request");

      if (data.success) {
        setRequests(data.friendRequests);
      }
    } catch (error) {
      console.error("Failed to get requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (targetUser: any) => {
    const payload = {
      requester: user?._id,
      recipient: targetUser?._id,
    };

    try {
      setIsActionLoading(true);

      await axiosInstance.post("friend", payload);

      await Promise.all([getFriends(), getUsers(), getRequest()]);
    } catch (error) {
      console.error("Failed to send friend request:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmFriendRequest = async (id: string) => {
    try {
      setIsActionLoading(true);

      await axiosInstance.put(`friend/${id}`, {
        status: "accepted",
      });

      await Promise.all([getFriends(), getUsers(), getRequest()]);
    } catch (error) {
      console.error("Failed to confirm friend request:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    isActionLoading,
    user,
    active,
    setActive,
    friends,
    requests,
    users,
    sendFriendRequest,
    confirmFriendRequest,
    getFriends,
    getRequest,
    getUsers,
    isLoading,
  };
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  header: {
    paddingHorizontal: moderateScale(8),
    paddingTop: 14,
    paddingBottom: 18,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.6,
  },

  dot: {
    color: colors.primary,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  tabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  tabs: {
    height: 52,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: colors.surface,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: colors.border,

    padding: 4,
  },

  tab: {
    flex: 1,
    height: 42,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: 13,

    gap: 6,
    position: "relative",
  },

  activeTab: {
    backgroundColor: "rgba(168, 85, 247, 0.12)",
  },

  tabPressed: {
    opacity: 0.65,
  },

  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },

  activeTabText: {
    color: colors.primary,
  },

  badge: {
    minWidth: 18,
    height: 18,

    paddingHorizontal: 5,

    borderRadius: 9,

    backgroundColor: colors.primary,

    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.text,
  },

  content: {
    paddingTop: 6,
    paddingHorizontal: 8,
    paddingBottom: 200,
  },

  friendList: {
    gap: 8,
  },

  friendCardWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },

  loadingContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingBottom: 100,
  },

  loadingIcon: {
    width: 58,
    height: 58,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,
  },

  loadingTitle: {
    marginTop: 14,

    fontSize: 15,
    fontWeight: "600",

    color: colors.text,
  },

  loadingSubtitle: {
    marginTop: 4,

    fontSize: 12,

    color: colors.textMuted,
  },

  emptyContainer: {
    minHeight: 400,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 40,
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 23,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: colors.border,

    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",

    color: colors.text,
  },

  emptyDescription: {
    marginTop: 7,

    fontSize: 13,
    lineHeight: 19,

    textAlign: "center",

    color: colors.textMuted,
  },
});

export default Friends;
