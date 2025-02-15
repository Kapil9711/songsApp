import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, ScrollView } from "tamagui";
import { useBackgroudImage } from "@/providers/BackgroundImage";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SongBigCard from "../common/song-card/SongBigCard";
import ShowData from "./components/ShowData";

const Home = () => {
  const [data, setData] = useState([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { setImage } = useBackgroudImage();
  useEffect(() => {
    (async () => {
      let songs = await AsyncStorage.getItem("song");
      console.log(songs);
      if (songs) {
        setData(JSON.parse(songs));
      } else {
        const { data }: any = await axios.get(
          "https://saavn.dev/api/search/songs?query=Arijit singh"
        );

        if (data) {
          await AsyncStorage.setItem("song", JSON.stringify(data.data.results));
          setData(data.data.results);
        }
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 2,
            paddingTop: 20,
            paddingBottom: 120,
            gap: 35,
          }}
        >
          {/* {[...data, ...data, ...data, ...data, ...data, ...data].map(
            (item: any, idx: number) => {
              return (
                <Pressable
                  onPress={async () => {
                    setImage(item?.image[2]?.url);
                    const { sound } = await Audio.Sound.createAsync(
                      {
                        uri: item.downloadUrl[3]?.url,
                      },
                      { shouldPlay: true }
                    );

                    setSound((prev: any) => {
                      if (prev) prev.stopAsync();
                      return sound;
                    });
                  }}
                  key={item.id + idx}
                >
                  <SongBigCard image={item.image[2]?.url} title={item.name} />
                  <View
                    style={{
                      flex: 1,
                      gap: 20,
                      flexDirection: "row",
                      padding: 2,
                      borderRadius: 100,
                      backgroundColor: "rgba(0,0,0,.52)",
                      borderColor: "pink",
                      borderWidth: 1,
                      alignItems: "center",
                    }}
                  >
                    <Avatar circular size={52}>
                      <Avatar.Image src={item?.image[2].url} />
                    </Avatar>
                    <Text style={{ color: "white", flex: 1 }}>{item.name}</Text>
                  </View>
                </Pressable>
              );
            }
          )} */}
          <ShowData data={data} heading="Songs" type="song" />
          <ShowData data={data} heading="Ablum" type="album" />
          <ShowData data={data} heading="Playlist" type="playlist" />

          {/* <HorizontalList
            data={data}
            type="song"
            setSound={setSound}
            setImage={setImage}
          /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const HorizontalList = ({ data, type = "song", setImage, setSound }: any) => {
  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false} // Hides vertical scrollbar
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
                onPress={async () => {
                  if (setImage) setImage(item?.image[2]?.url);
                  const { sound } = await Audio.Sound.createAsync(
                    {
                      uri: item.downloadUrl[3]?.url,
                    },
                    { shouldPlay: true }
                  );
                  if (setSound) {
                    setSound((prev: any) => {
                      if (prev) prev.stopAsync();
                      return sound;
                    });
                  }
                }}
                key={item.id + idx}
              >
                <SongBigCard
                  type={type}
                  key={item.id}
                  image={item.image[1]?.url}
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

export default Home;
