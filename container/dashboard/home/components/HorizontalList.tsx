import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import SongBigCard from "../../common/song-card/SongBigCard";
import { useAudioContext } from "@/providers/AudioProvider";

const HorizontalList = ({
  data,
  type = "song",
}: {
  data: any;
  type?: string;
}) => {
  const { setCurrentSong, setCurrentSongList } = useAudioContext();
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
