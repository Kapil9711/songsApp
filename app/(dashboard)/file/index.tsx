import { View, Text, FlatList } from "react-native";
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

const Files = () => {
  const { setCurrentSong, setCurrentSongList, currentSong } = useAudioContext();
  const { localFilesAfterSearch } = useGlobalContext();
  const [page, setPage] = useState(1);

  let [filterData, setFilterData] = useState([]);
  let limit = 13;

  useEffect(() => {
    setFilterData(localFilesAfterSearch.slice(0, page * limit));
  }, [page, localFilesAfterSearch]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          gap: 10,
          // paddingBottom: 160,
          // paddingTop: 10,
          paddingHorizontal: 3,
        }}
      >
        <FlatList
          contentContainerStyle={{ paddingBottom: 170 }}
          // style={{ flex: 1, paddingBottom: 200 }}
          data={filterData}
          keyExtractor={(item: any, idex: number) => item.id + idex}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                style={{ marginTop: 10 }}
                key={item.id + index}
                onPress={() => {
                  setCurrentSong(item);
                  setCurrentSongList(filterData);
                }}
              >
                <SongsSmollCard
                  isActive={currentSong?.id === item.id}
                  title={item.name}
                  image={item?.image[2]?.url}
                  number={index + 1}
                  song={item}
                  isShowButton={false}
                />
              </Pressable>
            );
          }}
          onEndReached={() => {
            setPage((prev: number) => prev + 1);
          }}
          onEndReachedThreshold={0}
          // ListFooterComponent={() =>
          //   isLoading && (
          //     <View
          //       style={{
          //         paddingTop: 40,
          //         justifyContent: "center",
          //         alignItems: "center",
          //       }}
          //     >
          //       <Spinner
          //         style={{ height: 40, width: 40, scale: 1.6 }}
          //         size="large"
          //         color="#f5075e"
          //       />
          //     </View>
          //   )
          // }
        />
        {/* {localFilesAfterSearch.map((item: any, idx: number) => {
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
          })} */}
      </View>
    </View>
  );
};

export default Files;
