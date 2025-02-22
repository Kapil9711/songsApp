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
import { Button, Spinner } from "tamagui";
import SongsSmollCard from "@/container/dashboard/common/song-card/SongsSmollCard";

const Favorite = () => {
  const { setCurrentSong, setCurrentSongList, currentSong } = useAudioContext();
  const { localFilesAfterSearch, favorite, favFilter, friends } =
    useGlobalContext();

  const [page, setPage] = useState(1);
  const [active, setActive] = useState("my");
  let [filterData, setFilterData] = useState([]);
  let limit = 13;
  // useEffect(() => {
  //   let finaleData = [];
  //   if (active === "my") finaleData = favorite;
  //   else {
  //     let item = friends.find((item: any) => item?.user?.name === active);
  //     finaleData = item?.user?.favorite;
  //   }
  //   setFilterData(finaleData.slice(0, page * limit));
  // }, [page, friends, favorite, active]);

  let finaleData = [];
  if (active === "my") finaleData = favorite;
  else {
    let item = friends.find((item: any) => item?.user?.name === active);

    finaleData = item?.user?.favorite;
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Header active={active} setActive={setActive} />
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
          data={finaleData}
          keyExtractor={(item: any, idex: number) => item.id + idex}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                style={{ marginTop: 10 }}
                key={item.id + index}
                onPress={() => {
                  setCurrentSong(item);
                  setCurrentSongList(finaleData);
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

const Header = ({
  active,
  setActive,
  getFriends,
  getRequest,
  getUsers,
}: any) => {
  const { friends } = useGlobalContext();

  return (
    <View
      style={{
        height: 70,
        width: "100%",
        backgroundColor: "rgba(0,0,0,0)",
      }}
    >
      <View
        style={{
          height: "100%",
          width: "85%",
        }}
      >
        <ScrollView horizontal>
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              height: "100%",
              // width: "80%",
              paddingRight: 90,

              alignItems: "center",
              position: "relative",
              left: 40,
              justifyContent: "center",
            }}
          >
            <Button
              onPress={() => {
                setActive("my");
              }}
              style={{
                backgroundColor: active == "my" ? "#f5075e" : "white",
              }}
              color={active == "my" ? "white" : "default"}
            >
              MY
            </Button>

            {friends.map((item: any) => {
              return (
                <Button
                  key={item._id}
                  onPress={() => {
                    setActive(item?.user?.name);
                  }}
                  style={{
                    backgroundColor:
                      active == item?.user?.name ? "#f5075e" : "white",
                  }}
                  color={active == item?.user?.name ? "white" : "default"}
                >
                  {item?.user.name}
                </Button>
              );
            })}

            {/* <Button
            // onPress={() => {
            //   setActive("requests");
            //   getRequest();
            // }}
            style={{
              backgroundColor: active == "requests" ? "#f5075e" : "white",
            }}
            color={active == "requests" ? "white" : "default"}
          >
            Request
          </Button> */}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Favorite;
