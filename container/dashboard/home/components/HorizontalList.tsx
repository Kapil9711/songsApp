import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import SongBigCard from "../../common/song-card/SongBigCard";
import { useAudioContext } from "@/providers/AudioProvider";
import { useGlobalContext } from "@/providers/GlobalProvider";
import { useRouter } from "expo-router";

const HorizontalList = ({
  data,
  type = "song",
}: {
  data: any;
  type?: string;
}) => {
  const { setCurrentSong, setCurrentSongList } = useAudioContext();
  const { handleSingleAlbumOrPlalist, setPage } = useGlobalContext();
  const router = useRouter();
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        horizontal
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 10,
          }}
        >
          {data.map((item: any, idx: number) => {
            return (
              <Pressable
                onPress={() => {
                  if (type === "song") {
                    setCurrentSong(item);
                    setCurrentSongList(data);
                  }
                  if (type === "album" || type === "playlist") {
                    handleSingleAlbumOrPlalist(item.id, type);
                    setPage(8);
                    router.push("/(dashboard)/home/songs");
                  }
                }}
                key={item.id + idx}
              >
                <SongBigCard
                  type={type}
                  key={item.id}
                  image={item.image[2]?.url}
                  title={item.name}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};

export default HorizontalList;
