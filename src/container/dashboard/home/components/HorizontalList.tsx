import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { moderateScale } from "react-native-size-matters";

import SongBigCard from "../../common/song-card/SongBigCard";

import { useAudioContext } from "@/src/providers/AudioProvider";
import { useGlobalContext } from "@/src/providers/GlobalProvider";
import { useSocket } from "@/src/providers/socketProvider";
import { getValueInAsync } from "@/src/utilities/helpers";

const HorizontalList = ({
  data,
  type = "song",
}: {
  data: any[];
  type?: string;
}) => {
  const { setCurrentSong, setCurrentSongList } = useAudioContext();

  const { handleSingleAlbumOrPlalist, setPage } = useGlobalContext();

  const { socket } = useSocket();

  const router = useRouter();

  const handlePress = async (item: any) => {
    if (type === "song") {
      try {
        const user: any = await getValueInAsync("user");

        const userId = user ? JSON.parse(user)?._id : undefined;

        socket?.emit("songPlaying", {
          senderId: userId,
          song: item,
        });
      } catch (error) {
        console.log("Unable to get user:", error);
      }

      setCurrentSong(item);
      setCurrentSongList(data);

      return;
    }

    if (type === "album" || type === "playlist") {
      handleSingleAlbumOrPlalist(item.id, type);

      setPage(999);

      router.push("/(dashboard)/home/songs");
    }
  };

  if (!data?.length) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      bounces={false}
      decelerationRate="fast"
    >
      {data.map((item: any, idx: number) => {
        const image =
          item?.image?.[2]?.url ||
          item?.image?.[1]?.url ||
          item?.image?.[0]?.url;

        const artist =
          item?.artist?.name ||
          item?.artists?.[0]?.name ||
          item?.primaryArtists ||
          item?.subtitle ||
          item?.album?.name ||
          "";

        return (
          <Pressable
            key={`${item?.id ?? "item"}-${idx}`}
            onPress={() => handlePress(item)}
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && styles.cardPressed,
            ]}
          >
            <SongBigCard
              type={type}
              image={image}
              title={item?.name || "Unknown"}
              subtitle={artist}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingLeft: moderateScale(16),
    paddingRight: moderateScale(16),

    gap: moderateScale(12),
  },

  cardWrapper: {
    width: moderateScale(168),
  },

  cardPressed: {
    transform: [
      {
        scale: 0.97,
      },
    ],
    opacity: 0.9,
  },
});

export default HorizontalList;
