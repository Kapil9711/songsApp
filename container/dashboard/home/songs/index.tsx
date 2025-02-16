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
import { Spinner } from "tamagui";

const Songs = () => {
  const { songListToRender, isLoadingSongListToRender } = useGlobalContext();
  const { currentSong, setCurrentSong, setCurrentSongList } = useAudioContext();

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
            songListToRender.map((item: any, idx: number) => {
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setCurrentSong(item);
                    setCurrentSongList(songListToRender);
                  }}
                >
                  <SongsSmollCard
                    isActive={currentSong?.id === item.id}
                    title={item.name}
                    image={item?.image[2]?.url}
                    song={item}
                  />
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Songs;
