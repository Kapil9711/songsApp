import { View } from "react-native";
import React from "react";
import { Text, TextInput } from "@/providers/CustomText";

import { IconButton } from "react-native-paper";
import { Avatar, Button, Spinner } from "tamagui";

const FriendCard = ({
  index,
  data,
  sendFriendRequest,
  type,
  confirmFriendRequest,
  isActionLoading,
}: any) => {
  let name = data.name;
  if (type === "friends") name = data?.user?.name;
  if (type === "requests") name = data?.requester?.name;
  return (
    <View
      style={{
        flex: 1,
        gap: 20,
        flexDirection: "row",
        padding: 2,
        borderRadius: 14,
        backgroundColor: "rgba(0,0,0,.6)",
        borderColor: "#FF69B4",
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        alignItems: "center",
        elevation: 100,
        position: "relative",
      }}
    >
      <Avatar style={{ borderRadius: 10 }} size={56}>
        <Avatar.Image
          src={
            "https://images.unsplash.com/photo-1548142813-c348350df52b?&w=150&h=150&dpr=2&q=80"
          }
        />
      </Avatar>
      <Text style={{ color: "white", flex: 1 }}>
        {String(index + 1)} - {name?.slice(0, 20)}
      </Text>

      <View
        style={{
          position: "absolute",
          right: 8,
          flexDirection: "row",
          gap: 1,
        }}
      >
        {type === "users" && (
          <Button
            onPress={() => {
              if (type === "users") sendFriendRequest(data);
            }}
          >
            Request
          </Button>
        )}

        {type === "requests" && (
          <Button
            onPress={() => {
              confirmFriendRequest(data._id);
            }}
          >
            Confirm
          </Button>
        )}
      </View>

      {/* deleteFile */}
    </View>
  );
};

export default FriendCard;
