import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import HorizontalList from "./HorizontalList";
import { useBackgroudImage } from "@/providers/BackgroundImage";
import { useAudioContext } from "@/providers/AudioProvider";
import { H3, H4, Paragraph } from "tamagui";
import { useRouter } from "expo-router";
import { useGlobalContext } from "@/providers/GlobalProvider";

const ShowData = ({
  data,
  heading,
  type = "song",
}: {
  data: any;
  heading: string;
  type: string;
}) => {
  const router = useRouter();
  const { searchedSongList, setSongListToRender, setPage } = useGlobalContext();
  const length = data?.length;
  return (
    <View style={{ gap: 9 }}>
      <View
        style={{
          justifyContent: "space-between",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Heading heading={heading} />
        <TouchableOpacity
          onPress={() => {
            if (type === "song") {
              setSongListToRender(searchedSongList);
              router.push("/(dashboard)/home/songs");
              setPage(1);
            }
            if (type === "album") router.push("/(dashboard)/home/album");
            if (type === "playlist") router.push("/(dashboard)/home/playlist");
          }}
        >
          <Paragraph style={{ marginRight: 25, marginTop: 4 }} color={"white"}>
            See More ...
          </Paragraph>
        </TouchableOpacity>
      </View>
      {!length && (
        <View
          style={{
            height: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <H4 color={"white"}>Not Found</H4>
        </View>
      )}

      <HorizontalList data={data} type={type} />
    </View>
  );
};

const Heading = ({ heading }: { heading: string }) => {
  return (
    <H4
      style={{
        paddingLeft: 10,
      }}
      color={"white"}
    >
      {heading}{" "}
    </H4>
  );
};

export default ShowData;
