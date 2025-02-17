import {
  View,
  Text,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
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
import { Avatar } from "tamagui";
import { Icon, IconButton, ProgressBar } from "react-native-paper";
import { useGlobalContext } from "@/providers/GlobalProvider";
import { usePathname } from "expo-router";

const { width } = Dimensions.get("window");
const PlayerContext = createContext(null as any);
const usePlayerConext = () => useContext(PlayerContext);

async function setupAudio() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    // interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    // interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  });
  console.log("✅ Audio Mode Set!");
}

const AudioPlayer = () => {
  const audioData = usePlayer();
  return (
    <PlayerContext.Provider value={audioData}>
      <PlayerUi />
    </PlayerContext.Provider>
  );
};

const PlayerUi = () => {
  const {
    imageUrl,
    sound,
    title,
    currentSong,
    position,
    setPosition,
    duration,
  } = usePlayerConext();

  return (
    <>
      {currentSong && (
        <View
          style={{
            width: width,
            backgroundColor: "rgba(0,0,0,1)",
            borderRightWidth: 5,
            borderLeftWidth: 5,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderRadius: 10,
            borderColor: "#ff268b",
            height: 87,
            position: "absolute",
            bottom: 50,
            flexDirection: "row",
          }}
        >
          <Avatar style={{ marginTop: 2, marginLeft: 1 }} size={80}>
            <Avatar.Image src={imageUrl} />
          </Avatar>

          <View
            style={{
              flex: 3,

              paddingHorizontal: 20,
              paddingVertical: 4,
              alignItems: "center",
            }}
          >
            <View style={{ gap: 5 }}>
              <Text
                style={{ color: "white", fontSize: 12, textAlign: "center" }}
              >
                {title?.slice(0, 16)}
              </Text>
              <ProgressBarComponent
                sound={sound}
                setPosition={setPosition}
                duration={duration}
                position={position}
              />
              <MediaControls />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 15, marginTop: 9 }}>
            <ShowTime duration={duration} position={position} />
            {/* <TouchableOpacity
              onPress={() => {
                handleDownload(currentSong.downloadUrl[4]?.url, title);
              }}
            >
              <Button
                onPress={() => {
                  handleDownload(currentSong.downloadUrl[4]?.url, title);
                }}
              >
                Download
              </Button>
            </TouchableOpacity> */}
          </View>
        </View>
      )}
    </>
  );
};

const ShowTime = ({ duration, position }: any) => {
  const remainingTime = Math.max(0, duration - position);
  const { handleDownload } = useGlobalContext();
  const { currentSong } = usePlayerConext();
  const currentPath = usePathname();
  return (
    <View>
      {/* 🕒 Display Remaining Time (e.g., 1:33) */}
      <Text
        style={{
          fontSize: 16,
          fontWeight: "bold",
          marginVertical: 10,
          color: "white",
        }}
      >
        {formatTime(remainingTime)}
      </Text>
      {currentPath.includes("home") && (
        <TouchableOpacity
          onPress={() => {
            handleDownload(
              currentSong?.downloadUrl[4]?.url,
              currentSong?.image[2]?.url,
              currentSong?.name
            );
          }}
        >
          <IconButton
            icon={"download"}
            size={22}
            style={{ marginTop: -10, marginLeft: -8 }}
            iconColor="white"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
const ProgressBarComponent = ({
  sound,
  setPosition,
  duration,
  position,
}: any) => {
  const seekAudio = async (event: any) => {
    if (!sound || duration <= 1) return;

    const touchX = event.nativeEvent.locationX; // Get touch position
    const progressWidth = 230; // Subtract padding/margins
    const seekTo = (touchX / progressWidth) * duration;

    await sound.setPositionAsync(seekTo); // Seek to new position
    setPosition(seekTo); // Update UI immediately
  };

  return (
    <TouchableOpacity onPress={seekAudio} activeOpacity={0.7}>
      <ProgressBar
        style={{ height: 10, width: 218, borderRadius: 3 }}
        progress={Math.min(1, Math.max(0, position / duration))}
        color={"#f5075e"}
      />
    </TouchableOpacity>
  );
};

const MediaControls = () => {
  const { sound, handlePause, handlePlay, isPlaying, handleNext, handlePrev } =
    usePlayerConext();
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: 8,
        justifyContent: "center",
        gap: 22,
      }}
    >
      {/* Previous Button */}

      <TouchableOpacity activeOpacity={0.5} onPress={handlePrev}>
        <Icon source="skip-previous" size={26} color="white" />
      </TouchableOpacity>

      {/* Play/Pause Button */}
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          if (isPlaying) handlePause();
          else handlePlay();
        }}
      >
        <Icon source={isPlaying ? "pause" : "play"} size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.5} onPress={handleNext}>
        <Icon source="skip-next" size={26} color="white" />
      </TouchableOpacity>

      {/* Next Button */}
    </View>
  );
};

const usePlayer = () => {
  const { sound, setSound, currentSong, setCurrentSong, currentSongList } =
    useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const { setImage } = useBackgroudImage();
  const [position, setPosition] = useState(0); // Current playback time (ms)
  const [duration, setDuration] = useState(1);

  let imageUrl = "";
  let songUrl = "";
  let title = "";
  if (currentSong?.id) {
    imageUrl = currentSong?.image[2]?.url;
    songUrl = currentSong?.downloadUrl[4]?.url;
    title = currentSong?.name;
  }

  useEffect(() => {
    (async () => await setupAudio())();
  }, []);

  useEffect(() => {
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis); // Update current time
          setDuration(status.durationMillis || 1); // Set duration (prevent divide by zero)
        }
        if (status.didJustFinish) {
          handleNext(); // Play next song when current ends
        }
      });
    }
  }, [sound]);

  useEffect(() => {
    (async () => {
      if (setImage) setImage(currentSong?.image[2]?.url);
      if (sound) {
        await sound.unloadAsync();
      }
      if (Audio) {
        const { sound } = await Audio.Sound.createAsync(
          {
            uri: currentSong.downloadUrl[4]?.url,
          },
          { shouldPlay: true }
        );
        if (setSound) {
          setSound((prev: any) => {
            if (prev) prev?.stopAsync();
            return sound;
          });
          setIsPlaying(true);
          // showNowPlayingNotification(title, imageUrl);
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
    position,
    setPosition,
    duration,
    setDuration,
  };
};

export default AudioPlayer;
