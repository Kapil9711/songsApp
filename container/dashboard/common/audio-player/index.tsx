import { View, Text, Dimensions, ImageBackground } from "react-native";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAudioContext } from "@/providers/AudioProvider";
import { Audio } from "expo-av";
import { useBackgroudImage } from "@/providers/BackgroundImage";
import { Avatar, Progress } from "tamagui";
import { IconButton, MD3Colors, ProgressBar } from "react-native-paper";
const { width } = Dimensions.get("window");
const PlayerContext = createContext(null as any);
const usePlayerConext = () => useContext(PlayerContext);

const AudioPlayer = () => {
  const audioData = usePlayer();
  return (
    <PlayerContext.Provider value={audioData}>
      <PlayerUi />
    </PlayerContext.Provider>
  );
};

const PlayerUi = () => {
  const { imageUrl, songUrl, title, currentSong } = usePlayerConext();

  return (
    <>
      {currentSong && (
        <View
          style={{
            width: width,
            backgroundColor: "rgba(0,0,0,.5)",
            height: 80,
            position: "absolute",
            bottom: 50,

            flexDirection: "row",
          }}
        >
          <Avatar size={80}>
            <Avatar.Image src={imageUrl} />
          </Avatar>

          <View
            style={{
              flex: 3,
              paddingHorizontal: 20,
              paddingVertical: 7,
            }}
          >
            <View style={{ gap: 3 }}>
              <Text
                style={{ color: "white", fontSize: 12, textAlign: "center" }}
              >
                {title}
              </Text>
              <ProgressBar
                style={{ height: 9, borderRadius: 5 }}
                progress={0.5}
                color={MD3Colors.error50}
              />
              <MediaControls />
            </View>
          </View>

          <View style={{ flex: 1 }}></View>
        </View>
      )}
    </>
  );
};

const MediaControls = () => {
  const { sound, handlePause, handlePlay, isPlaying, handleNext, handlePrev } =
    usePlayerConext();
  return (
    <View
      style={{ flexDirection: "row", marginTop: -9, justifyContent: "center" }}
    >
      {/* Previous Button */}
      <IconButton
        iconColor="white"
        icon="skip-previous"
        size={32}
        onPress={handlePrev}
      />

      {/* Play/Pause Button */}
      <IconButton
        iconColor="white"
        icon={isPlaying ? "pause" : "play"}
        size={36}
        onPress={() => {
          if (isPlaying) handlePause();
          else handlePlay();
        }}
      />

      {/* Next Button */}
      <IconButton
        iconColor="white"
        icon="skip-next"
        size={32}
        onPress={handleNext}
      />
    </View>
  );
};

const usePlayer = () => {
  const { sound, setSound, currentSong, setCurrentSong, currentSongList } =
    useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const { setImage } = useBackgroudImage();
  let imageUrl = "";
  let songUrl = "";
  let title = "";
  if (currentSong?.id) {
    imageUrl = currentSong?.image[2]?.url;
    songUrl = currentSong?.downloadUrl[4]?.url;
    title = currentSong?.name;
  }

  useEffect(() => {
    (async () => {
      if (setImage) setImage(currentSong?.image[2]?.url);
      if (Audio) {
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: currentSong.downloadUrl[3]?.url,
          },
          { shouldPlay: true }
        );
        if (setSound) {
          setSound((prev: any) => {
            if (prev) prev?.stopAsync();
            return sound;
          });
          setIsPlaying(true);
        }
      }
    })();
  }, [currentSong]);

  const handleNext = () => {
    let currenIndex = null;

    if (Array.isArray(currentSongList) && currentSongList.length) {
      currentSongList.some((item, idx) => {
        if (item.id === currentSong.id) {
          currenIndex = idx;
          return true;
        } else return false;
      });
    }
    if (currenIndex || currenIndex === 0) {
      const length = currentSongList.length - 1;
      let newIndex = length === currenIndex ? 0 : currenIndex + 1;
      setCurrentSong(currentSongList[newIndex]);
    }
  };
  const handlePrev = () => {
    let currenIndex = null;
    if (Array.isArray(currentSongList) && currentSongList.length) {
      currentSongList.some((item, idx) => {
        if (item.id === currentSong.id) {
          currenIndex = idx;
          return true;
        } else return false;
      });
    }
    if (currenIndex || currenIndex === 0) {
      const length = currentSongList.length - 1;
      let newIndex = currenIndex === 0 ? length : currenIndex - 1;
      setCurrentSong(currentSongList[newIndex]);
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    if (sound) {
      await sound.playAsync();
    }
  };

  const handlePause = async () => {
    setIsPlaying(false);
    if (sound) {
      await sound.pauseAsync();
    }
  };

  return {
    imageUrl,
    songUrl,
    title,
    sound,
    isPlaying,
    handlePause,
    handlePlay,
    handleNext,
    handlePrev,
    currentSong,
  };
};

export default AudioPlayer;
