import { View, Text } from "react-native";
import React from "react";
import VerticalList from "../components/VerticalList";
import { useGlobalContext } from "@/providers/GlobalProvider";

const Playlist = () => {
  const { playListToRender } = useGlobalContext();
  return (
    <View>
      <VerticalList data={playListToRender} type="playlist" />
    </View>
  );
};

export default Playlist;
