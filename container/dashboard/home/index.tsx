import { View } from "react-native";
import React, { useState } from "react";
import { Button, ScrollView, Spinner } from "tamagui";
import ShowData from "./components/ShowData";
import { useGlobalContext } from "@/providers/GlobalProvider";

const Home = () => {
  const {
    searchedSongList,
    albumListToRender,
    playListToRender,
    isLoadingSongListToRender,
    active,
    setActive,
    hindi,
    punjabi,
    haryanvi,
    recentlyPlayed,
  } = useGlobalContext();

  // const [active, setActive] = useState("search");

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          height: 43,
          width: "100%",
          backgroundColor: "rgba(0,0,0,0)",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 20,
            height: "100%",

            alignItems: "center",
            position: "relative",

            justifyContent: "center",
          }}
        >
          <Button
            onPress={() => {
              setActive("search");
            }}
            style={{
              backgroundColor: active == "search" ? "#f5075e" : "white",
              width: 100,
              height: 30,
            }}
            color={active == "search" ? "white" : "default"}
          >
            Search
          </Button>

          <Button
            style={{
              backgroundColor: active == "trending" ? "#f5075e" : "white",
              width: 100,
              height: 30,
            }}
            color={active == "trending" ? "white" : "default"}
            onPress={() => {
              setActive("trending");
            }}
          >
            Trending
          </Button>
        </View>
      </View>
      {active === "search" ? (
        <ScrollView>
          <View
            style={{
              paddingHorizontal: 2,
              paddingTop: 5,
              paddingBottom: 190,
              gap: 20,
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
              <>
                <ShowData
                  data={searchedSongList.slice(0, 6)}
                  heading="Songs"
                  type="song"
                />
                <ShowData
                  isTrending={true}
                  data={albumListToRender.slice(0, 6)}
                  renderData={albumListToRender}
                  heading="Album"
                  type="album"
                />
                <ShowData
                  isTrending={true}
                  data={playListToRender.slice(0, 6)}
                  renderData={playListToRender}
                  heading="Playlist"
                  type="playlist"
                />
                {recentlyPlayed.length > 0 && (
                  <ShowData
                    isTrending={true}
                    data={recentlyPlayed.slice(0, 6)}
                    renderData={recentlyPlayed}
                    heading="Recently Played"
                    type="song"
                  />
                )}
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <View
            style={{
              paddingHorizontal: 2,
              paddingTop: 5,
              paddingBottom: 190,
              gap: 35,
            }}
          >
            {false ? (
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
              <>
                <ShowData
                  isTrending={true}
                  data={hindi.slice(0, 6)}
                  renderData={hindi}
                  heading="Hindi"
                  type="song"
                />
                <ShowData
                  isTrending={true}
                  data={haryanvi.slice(0, 6)}
                  renderData={haryanvi}
                  heading="Haryanvi"
                  type="song"
                />
                <ShowData
                  isTrending={true}
                  data={punjabi.slice(0, 6)}
                  renderData={punjabi}
                  heading="punjabi"
                  type="song"
                />

                {/* <ShowData
                data={albumListToRender}
                heading="Ablum"
                type="album"
              />
              <ShowData
                data={playListToRender}
                heading="Playlist"
                type="playlist"
              /> */}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default Home;
