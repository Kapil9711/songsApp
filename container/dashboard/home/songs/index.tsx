import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Touchable,
  FlatList,
} from "react-native";
import React from "react";
import { useGlobalContext } from "@/providers/GlobalProvider";
import SongsSmollCard from "../../common/song-card/SongsSmollCard";
import { useAudioContext } from "@/providers/AudioProvider";
import { Spinner } from "tamagui";
import { getValueInAsync } from "@/utilities/helpers";
import { useSocket } from "@/providers/socketProvider";

const Songs = () => {
  const { songListToRender, isLoadingSongListToRender, fetchData, isLoading } =
    useGlobalContext();
  const { currentSong, setCurrentSong, setCurrentSongList } = useAudioContext();
  const { socket } = useSocket();
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          gap: 11,
          // paddingBottom: 134,
          paddingTop: 0,
          paddingHorizontal: 5,
        }}
      >
        {isLoading ? (
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
          <FlatList
            contentContainerStyle={{ paddingBottom: 160 }}
            // style={{ flex: 1, paddingBottom: 200 }}
            data={songListToRender}
            keyExtractor={(item, idex) => item.id + idex}
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  style={{ marginTop: 10 }}
                  key={item.id + index}
                  onPress={() => {
                    setCurrentSong(item);
                    if (item.type || item.downloadUrl[0]?.url) {
                      (async () => {
                        const user: any = await getValueInAsync("user");
                        const userId = JSON.parse(user)?._id;
                        socket?.emit("songPlaying", {
                          senderId: userId,
                          song: item,
                        });
                      })();
                    }
                    setCurrentSongList(songListToRender);
                  }}
                >
                  <SongsSmollCard
                    isActive={currentSong?.id === item.id}
                    title={item.name}
                    image={item?.image[2]?.url}
                    number={index + 1}
                    song={item}
                  />
                </Pressable>
              );
            }}
            onEndReached={fetchData}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() =>
              isLoadingSongListToRender && (
                <View
                  style={{
                    paddingTop: 40,
                    paddingBottom: 40,
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
              )
            }
          />

          // songListToRender.map((item: any, idx: number) => {
          //   return (
          //     <Pressable
          //       key={item.id}
          //       onPress={() => {
          //         setCurrentSong(item);
          //         setCurrentSongList(songListToRender);
          //       }}
          //     >
          //       <SongsSmollCard
          //         isActive={currentSong?.id === item.id}
          //         title={item.name}
          //         image={item?.image[2]?.url}
          //         number={idx + 1}
          //         song={item}
          //       />
          //     </Pressable>
          //   );
          // })
        )}
      </View>
    </View>
  );
};

export default Songs;
