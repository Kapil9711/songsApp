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
        backgroundColor: "black",
        height: 50,
        paddingHorizontal: 25,
        width: width,
      }}
    >
      <Pressable onPress={() => router.push("/(dashboard)/home")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "black" }}
          icon={icons.home}
        />
      </Pressable>

      <Pressable onPress={() => router.push("/(dashboard)/favorites")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "black", marginLeft: 15 }}
          icon={icons.heart}
        />
      </Pressable>
      <Pressable onPress={() => router.push("/(dashboard)/friends")}>
        <Avatar.Icon
          size={45}
          style={{ backgroundColor: "black" }}
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
    explore: "account-group-outline",
  };
  console.log(currentPath);
  if (currentPath.includes("home")) {
    icons.home = "home";
  }
  if (currentPath.includes("favorites")) {
    icons.heart = "heart";
  }
  if (currentPath.includes("friends")) {
    icons.explore = "account-group";
  }

  return { router, icons };
};

export default BottomHeader;
