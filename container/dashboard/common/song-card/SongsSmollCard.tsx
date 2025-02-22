import { View, Alert, Pressable } from "react-native";
import React, { useEffect, useMemo } from "react";
import { Avatar } from "tamagui";
import { IconButton } from "react-native-paper";
import { Text } from "@/providers/CustomText";

import { useGlobalContext } from "@/providers/GlobalProvider";
import { getValueInAsync } from "@/utilities/helpers";

const showAlert = (deleteFile: any, fileName: string) => {
  Alert.alert(
    "Delete File",
    "Are you sure you want to delete this file?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("User cancelled"),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          const user: any = await getValueInAsync("user");

          deleteFile(fileName + "_" + JSON.parse(user || "")?._id);
        },
      },
    ],
    { cancelable: false }
  );
};

const SongsSmollCard = ({
  image,
  title,
  isActive,
  number,
  song,
  isShowButton = true,
}: {
  image: string;
  title: string;
  isActive: boolean;
  number: Number;
  song?: any;
  isShowButton?: boolean;
}) => {
  const { deleteFile, handleDownload, handleFavorite, favorite } =
    useGlobalContext();
  const isFav = useMemo(() => {
    return favorite.some((item: any) => song.id === item.id);
  }, [favorite, song]);
  return (
    <>
      <View
        style={{
          flex: 1,
          gap: 20,
          flexDirection: "row",
          padding: 2,
          borderRadius: 14,
          backgroundColor: isActive ? "#fa0c5c" : "rgba(0,0,0,.6)",
          borderColor: isActive ? "white" : "#FF69B4",
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
          <Avatar.Image src={image} />
        </Avatar>
        <Text style={{ color: "white", flex: 1 }}>
          {String(number)} - {title?.slice(0, 20)}
        </Text>

        <View
          style={{
            position: "absolute",
            right: 8,
            flexDirection: "row",
            gap: 1,
          }}
        >
          {!isShowButton ? (
            <IconButton
              icon="delete" // Standard download icon
              size={24}
              iconColor={isActive ? "white" : "red"}
              onPress={() => showAlert(deleteFile, title)}
            />
          ) : (
            <>
              <IconButton
                icon="heart" // Standard download icon
                size={24}
                style={{
                  borderWidth: isFav ? 2 : 0,
                  backgroundColor: isFav ? "white" : "rgba(0,0,0,1)",
                }}
                iconColor={isFav ? "red" : "white"}
                onPress={() => {
                  handleFavorite(song);
                }}
              />

              <IconButton
                icon="download" // Standard download icon
                size={24}
                iconColor="white"
                onPress={() =>
                  handleDownload(
                    song?.downloadUrl[4]?.url,
                    song?.image[2]?.url,
                    song?.name
                  )
                }
              />
            </>
          )}
        </View>

        {/* deleteFile */}
      </View>
    </>
  );
};

export default SongsSmollCard;
