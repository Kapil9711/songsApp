import { View, Text, Animated, Easing, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { Avatar } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { useAudioContext } from "@/providers/AudioProvider";

const SongsSmollCard = ({
  image,
  title,
  isActive,
  song,
}: {
  image: string;
  title: string;
  isActive: boolean;
  song?: any;
}) => {
  const { setCurrentSong } = useAudioContext();
  return (
    <Pressable
      onPress={() => {
        if (song) setCurrentSong(song);
      }}
    >
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
          elevation: 20,
        }}
      >
        <Avatar size={57}>
          <Avatar.Image src={image} />
        </Avatar>
        <Text style={{ color: "white", flex: 1 }}>{title}</Text>
      </View>
    </Pressable>
  );
};

export default SongsSmollCard;
