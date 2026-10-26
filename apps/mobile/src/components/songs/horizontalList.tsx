import { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  type ListRenderItem,
} from "react-native";
import { moderateScale } from "react-native-size-matters";

import { usePlayerStore } from "@/store/player.store";
import { handleSongPlay } from "@/utils/handleSongPlay";
import { useRouter } from "expo-router";
import SongBigCard from "./songBigCard";

type HorizontalListProps = {
  data: any[];
  renderData: any[];
  type?: string;
};

const keyExtractor = (item: any, index: number) =>
  String(item?.id ?? `item-${index}`);

const HorizontalList = ({ data, type = "song" }: HorizontalListProps) => {
  const activeMediaId = usePlayerStore((state) => state.activeTrack?.mediaId);
  const router = useRouter();

  const handlePress = useCallback(
    (index: number, id?: string) => {
      if (type === "song") {
        handleSongPlay(index, data, true);
      }
      if (type === "playlist") {
        router.push({
          pathname: "/(drawer)/(tabs)/home/playlistAlbumSong",
          params: {
            id,
            isAlbum: 0,
          },
        });
      }
    },
    [data, type],
  );

  const renderItem: ListRenderItem<any> = useCallback(
    ({ item, index }) => (
      <SongCard
        item={item}
        type={type}
        isPlaying={activeMediaId === item?.id}
        onPress={() => handlePress(index, item?.id)}
      />
    ),
    [activeMediaId, handlePress, type],
  );

  const contentContainerStyle = useMemo(() => styles.contentContainer, []);

  if (!data?.length) {
    return null;
  }

  return (
    <FlatList
      horizontal
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
      bounces={false}
      decelerationRate="fast"
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      updateCellsBatchingPeriod={50}
      removeClippedSubviews
      extraData={activeMediaId}
    />
  );
};

type SongCardProps = {
  item: any;
  type: string;
  isPlaying: boolean;
  onPress: () => void;
};

const SongCard = memo(({ item, type, isPlaying, onPress }: SongCardProps) => {
  const image =
    item?.image?.[2]?.url ?? item?.image?.[1]?.url ?? item?.image?.[0]?.url;

  const artist = Array.isArray(item?.artists?.primary)
    ? item.artists.primary.map((artist: any) => artist.name).join(", ")
    : "Unknown";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardWrapper,
        pressed && styles.cardPressed,
      ]}
    >
      <SongBigCard
        type={type}
        image={image}
        title={item?.name ?? "Unknown"}
        subtitle={artist}
        isPlaying={isPlaying}
      />
    </Pressable>
  );
});

SongCard.displayName = "SongCard";

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(12),
  },
  cardWrapper: {
    // Set a fixed width here if SongBigCard doesn't already define one.
  },
  cardPressed: {
    opacity: 0.9,
  },
});

export default memo(HorizontalList);
