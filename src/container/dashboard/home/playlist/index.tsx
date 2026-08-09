import React from "react";
import { StyleSheet, View } from "react-native";

import VerticalList from "../components/VerticalList";
import { useGlobalContext } from "@/src/providers/GlobalProvider";

const Playlist = () => {
  const { playListToRender } = useGlobalContext();

  return (
    <View style={styles.container}>
      <VerticalList data={playListToRender} type="playlist" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    width: "100%",
  },
});

export default Playlist;
