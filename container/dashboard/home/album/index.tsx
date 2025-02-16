import { View, Text } from "react-native";
import React from "react";
import VerticalList from "../components/VerticalList";
import { useGlobalContext } from "@/providers/GlobalProvider";

const Album = () => {
  const { albumListToRender } = useGlobalContext();
  return (
    <View>
      <VerticalList data={albumListToRender} type="album" />
    </View>
  );
};

export default Album;
