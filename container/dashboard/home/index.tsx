import { View } from "react-native";
import React from "react";

import { ScrollView, Spinner } from "tamagui";

import ShowData from "./components/ShowData";
import { useGlobalContext } from "@/providers/GlobalProvider";

const Home = () => {
  const {
    searchedSongList,
    albumListToRender,
    playListToRender,
    isLoadingSongListToRender,
  } = useGlobalContext();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 2,
            paddingTop: 20,
            paddingBottom: 190,
            gap: 35,
          }}
        >
          {isLoadingSongListToRender ? (
            <View
              style={{
                paddingTop: 150,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spinner
                style={{ height: 40, width: 40, scale: 1.6 }}
                size="large"
                color="#f5075e"
              />
            </View>
          ) : (
            <>
              <ShowData data={searchedSongList} heading="Songs" type="song" />
              <ShowData data={albumListToRender} heading="Ablum" type="album" />
              <ShowData
                data={playListToRender}
                heading="Playlist"
                type="playlist"
              />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
