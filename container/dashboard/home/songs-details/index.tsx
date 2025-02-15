import { View, Text, Pressable, ScrollView } from "react-native";
import React from "react";
import { useGlobalContext } from "@/providers/GlobalProvider";
import SongsSmollCard from "../../common/song-card/SongsSmollCard";
import { useAudioContext } from "@/providers/AudioProvider";

const SongsDetails = () => {
  const { songListToRender } = useGlobalContext();
  const { currentSong } = useAudioContext();
  console.log(songListToRender, "list");
  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          gap: 10,
          paddingBottom: 160,
          paddingTop: 10,
          paddingHorizontal: 5,
        }}
      >
        {songListToRender.map((item: any, idx: number) => {
          return (
            <Pressable>
              <SongsSmollCard
                isActive={currentSong.id === item.id}
                title={item.name}
                image={item?.image[2]?.url}
                song={item}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default SongsDetails;
