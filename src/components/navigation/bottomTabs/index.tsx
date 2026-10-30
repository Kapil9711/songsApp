import PlayerDock from "@/components/player/components/playerDock";
import { useGroupStore } from "@/screens/connections/group.store";
import { useGetReceivedFriendRequestsQuery } from "@/screens/friends/api/api.queries";
import { useTheme } from "@/themes/theme.context";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-fluid-styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ROUTES = [
  {
    name: "home",
    path: "/home",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "search",
    path: "/search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    name: "favorite",
    path: "/favorite",
    label: "Favorite",
    icon: "heart-outline",
    activeIcon: "heart",
  },

  {
    name: "friends",
    path: "/friends",
    label: "Friends",
    icon: "person-outline",
    activeIcon: "person",
  },

  {
    name: "users",
    path: "/users",
    label: "Live Users",
    icon: "person-outline",
    activeIcon: "person",
  },
  {
    name: "library",
    path: "/library",
    label: "Library",
    icon: "library-outline",
    activeIcon: "library",
  },
] as const;

type User = {
  _id?: string;
  id?: string;
  name?: string;
  image?: string | null;
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

export default function CustomTabBar() {
  const { Theme } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const invitations = useGroupStore((state) => state.invitations);
  const receivedQuery = useGetReceivedFriendRequestsQuery();
  const receivedRequests = useMemo(
    () => getList<FriendRequest>(receivedQuery.data),
    [receivedQuery.data],
  );

  return (
    <>
      <PlayerDock />
      {/* <NowPlayingBackground /> */}

      <View
        style={[
          styles.container,
          {
            backgroundColor: Theme.colors.background,
            paddingBottom: Math.max(insets.bottom, moderateScale(14)),
            // borderTopColor: Theme.colors.text,
            // borderTopWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        {TAB_ROUTES.map((tab) => {
          const focused =
            pathname === tab.path || pathname.startsWith(`${tab.path}/`);

          const showIcon =
            (tab.path == "/users" && invitations?.length) ||
            (tab.path == "/friends" && receivedRequests?.length);

          return (
            <Pressable
              key={tab.name}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                if (!focused) {
                  router.navigate(tab.path);
                }
              }}
              style={styles.tab}
            >
              <Ionicons
                name={focused ? tab.activeIcon : tab.icon}
                size={moderateScale(22)}
                color={focused ? Theme.colors.accent : Theme.colors.text}
              />

              <Text
                style={[
                  styles.label,
                  {
                    color: focused ? Theme.colors.accent : Theme.colors.text,
                  },
                ]}
              >
                {tab.label}
              </Text>

              {showIcon && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: Theme.colors.primary,
                    borderRadius: 10,
                    position: "absolute",
                    top: 0,
                    right: moderateScale(14),
                  }}
                ></View>
              )}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingTop: moderateScale(10),
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: moderateScale(4),
  },
  label: {
    fontSize: moderateScale(10),
    fontWeight: "500",
  },
});
