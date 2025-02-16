import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { getDownloadedSongs } from "@/utilities/helpers";

import {
  ScrollView,
  TouchableOpacity,
  Pressable,
  Touchable,
} from "react-native";

import { useGlobalContext } from "@/providers/GlobalProvider";

import { useAudioContext } from "@/providers/AudioProvider";
import { Spinner } from "tamagui";
import SongsSmollCard from "@/container/dashboard/common/song-card/SongsSmollCard";

const Friends = () => {
  const { setCurrentSong, setCurrentSongList, currentSong } = useAudioContext();
  const { localFilesAfterSearch } = useGlobalContext();
  console.log(localFilesAfterSearch, "fielsfsfd");
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
          {localFilesAfterSearch.map((item: any, idx: number) => {
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setCurrentSong(item);
                  setCurrentSongList(localFilesAfterSearch);
                }}
              >
                <SongsSmollCard
                  isActive={currentSong?.id === item.id}
                  title={item.name}
                  image={item?.image[2]?.url}
                  number={idx + 1}
                  song={item}
                  isShowButton={false}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default Friends;
