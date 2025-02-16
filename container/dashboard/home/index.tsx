import { View } from "react-native";
import React from "react";

import { ScrollView } from "tamagui";

import ShowData from "./components/ShowData";
import { useGlobalContext } from "@/providers/GlobalProvider";

const Home = () => {
  const { searchedSongList, albumListToRender, playListToRender } =
    useGlobalContext();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 2,
            paddingTop: 20,
            paddingBottom: 120,
            gap: 35,
          }}
        >
          {/* {[...data, ...data, ...data, ...data, ...data, ...data].map(
            (item: any, idx: number) => {
              return (
                <Pressable
                  onPress={async () => {
                    setImage(item?.image[2]?.url);
                    const { sound } = await Audio.Sound.createAsync(
                      {
                        uri: item.downloadUrl[3]?.url,
                      },
                      { shouldPlay: true }
                    );

                    setSound((prev: any) => {
                      if (prev) prev.stopAsync();
                      return sound;
                    });
                  }}
                  key={item.id + idx}
                >
                  <SongBigCard image={item.image[2]?.url} title={item.name} />
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
                      <Avatar.Image src={item?.image[2].url} />
                    </Avatar>
                    <Text style={{ color: "white", flex: 1 }}>{item.name}</Text>
                  </View>
                </Pressable>
              );
            }
          )} */}
          <ShowData data={searchedSongList} heading="Songs" type="song" />
          <ShowData data={albumListToRender} heading="Ablum" type="album" />
          <ShowData
            data={playListToRender}
            heading="Playlist"
            type="playlist"
          />

          {/* <HorizontalList
            data={data}
            type="song"
            setSound={setSound}
            setImage={setImage}
          /> */}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;
