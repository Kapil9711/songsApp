import { View, Text } from "react-native";
import React from "react";
import { Avatar } from "tamagui";

const SongsSmollCard = ({ image, title }: { image: string; title: string }) => {
  return (
    <View
      style={{
        flex: 1,
        gap: 20,
        flexDirection: "row",
        padding: 2,
        borderRadius: 100,
        backgroundColor: "rgba(0,0,0,.52)",
        borderColor: "pink",
        borderWidth: 1,
        alignItems: "center",
      }}
    >
      <Avatar circular size={52}>
        <Avatar.Image src={image} />
      </Avatar>
      <Text style={{ color: "white", flex: 1 }}>{title}</Text>
    </View>
  );
};

export default SongsSmollCard;
