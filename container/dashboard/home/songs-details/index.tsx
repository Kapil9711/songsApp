import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Touchable,
} from "react-native";
import React from "react";
import { useGlobalContext } from "@/providers/GlobalProvider";
import SongsSmollCard from "../../common/song-card/SongsSmollCard";
import { useAudioContext } from "@/providers/AudioProvider";

const SongsDetails = () => {
  const { songListToRender } = useGlobalContext();
  const { currentSong, setCurrentSong } = useAudioContext();

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        style={{
          flex: 1,
        }}
      >
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
              <Pressable
                key={item.id}
                onPress={() => {
                  console.log("✅ Item Clicked:", item.name);
                  setCurrentSong(item);
                }}
              >
                <SongsSmollCard
                  isActive={currentSong.id === item.id}
                  title={item.name}
                  image={item?.image[2]?.url}
                  number={idx + 1}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default SongsDetails;
