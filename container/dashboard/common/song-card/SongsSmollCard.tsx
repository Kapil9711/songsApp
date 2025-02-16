import { View, Text } from "react-native";
import React from "react";
import { Avatar } from "tamagui";
import { IconButton } from "react-native-paper";
import { handleDownload } from "@/utilities/helpers";

const SongsSmollCard = ({
  image,
  title,
  isActive,
  number,
  song,
}: {
  image: string;
  title: string;
  isActive: boolean;
  number: Number;
  song?: any;
}) => {
  return (
    <>
      <View
        style={{
          flex: 1,
          gap: 20,
          flexDirection: "row",
          padding: 2,
          borderRadius: 3,
          backgroundColor: isActive ? "#fa0c5c" : "rgba(0,0,0,.6)",
          borderColor: isActive ? "white" : "#FF69B4",
          borderWidth: 1,
          alignItems: "center",
          elevation: 100,
          position: "relative",
        }}
      >
        <Avatar size={57}>
          <Avatar.Image src={image} />
        </Avatar>
        <Text style={{ color: "white", flex: 1 }}>
          {String(number)} - {title.slice(0, 30)}
        </Text>

        <View
          style={{
            position: "absolute",
            right: 8,
            flexDirection: "row",
            gap: 1,
          }}
        >
          <IconButton
            icon="heart" // Standard download icon
            size={24}
            iconColor="white"
            onPress={() => console.log("Download pressed")}
          />
          <IconButton
            icon="download" // Standard download icon
            size={24}
            iconColor="white"
            onPress={() =>
              handleDownload(song?.downloadUrl[4]?.url, song?.name)
            }
          />
        </View>
      </View>
    </>
  );
};

export default SongsSmollCard;
