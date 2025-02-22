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
import { Avatar, H4, H6, Image, Paragraph } from "tamagui";
// import {
//   GestureDetector,
//   Gesture,
//   GestureHandlerRootView,
//   Directions,
// } from "react-native-gesture-handler";
import { useRouter } from "expo-router";

const SongsDetails = () => {
  const { currentSong } = useAudioContext();
  const router = useRouter();
  // const swipeDown = Gesture.Fling()
  //   .direction(Directions.DOWN)
  //   .onEnd(() => {
  //     router.back();
  //   });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,.6)",
      }}
    >
      <Image
        source={{ uri: currentSong?.image[2]?.url }}
        style={{
          marginTop: 80,
          width: "85%",
          height: "40%",
          borderRadius: 16,
          marginHorizontal: "auto",
          elevation: 100,
        }}
      />
      <View style={{ marginTop: 20 }}>
        <H6 style={{ textAlign: "center" }} color={"white"}>
          {currentSong?.name}
        </H6>
        <View></View>
      </View>
    </View>
  );
};

export default SongsDetails;
