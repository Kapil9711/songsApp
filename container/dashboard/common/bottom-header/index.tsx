import { View, Text, Dimensions, Pressable } from "react-native";
import React from "react";
import { Avatar } from "react-native-paper";
import { usePathname, useRouter } from "expo-router";
const { width } = Dimensions.get("window");

const BottomHeader = () => {
  const { router, icons } = useBottomHeader();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        backgroundColor: "rgba(0,0,0,.93)",
        height: 50,
        paddingHorizontal: 25,
        width: width,
      }}
    >
      <Pressable onPress={() => router.push("/(dashboard)/home")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "transparent" }}
          icon={icons.home}
        />
      </Pressable>

      <Pressable onPress={() => router.push("/(dashboard)/favorites")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "transparent", marginLeft: 5 }}
          icon={icons.heart}
        />
      </Pressable>
      <Pressable onPress={() => router.push("/(dashboard)/friends")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "transparent" }}
          icon={icons.friend}
        />
      </Pressable>
      <Pressable onPress={() => router.push("/(dashboard)/file")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "transparent" }}
          icon={icons.explore}
        />
      </Pressable>
    </View>
  );
};

const useBottomHeader = () => {
  const currentPath = usePathname();
  const router = useRouter();
  let icons = {
    home: "home-outline",
    heart: "heart-outline",
    friend: "account-group-outline",
    explore: "folder-open",
  };

  if (currentPath.includes("home")) {
    icons.home = "home";
  }
  if (currentPath.includes("favorites")) {
    icons.heart = "heart";
  }
  if (currentPath.includes("friends")) {
    icons.friend = "account-group"; //  "account-group";
  }
  if (currentPath.includes("/file")) {
    icons.explore = "folder";
  }
  return { router, icons };
};

export default BottomHeader;
