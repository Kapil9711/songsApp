import {
  View,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { Text } from "@/providers/CustomText";

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
import { usePathname, useRouter } from "expo-router";
import { getValueInAsync } from "@/utilities/helpers";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import { useSocket } from "@/providers/socketProvider";
import useNotification from "@/utilities/showNotification";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch1 from "expo-background-fetch";
import TrackPlayer, {
  Capability,
  Event,
  useProgress,
  useTrackPlayerEvents,
} from "react-native-track-player";
import service from "../../../../service";

const BackgroundFetch: any = BackgroundFetch1;

const BACKGROUND_FETCH_TASK = "BACKGROUND_FETCH_TASK";

const { width } = Dimensions.get("window");
const PlayerContext = createContext(null as any);
const usePlayerConext = () => useContext(PlayerContext);

async function setupAudio() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
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
  const router = useRouter();

  return (
    <>
      {currentSong && (
        <View
          style={{
            width: width,
            backgroundColor: "rgba(0,0,0,.93)",
            // borderRightWidth: 5,
            // borderLeftWidth: 5,
            // borderTopWidth: 2,
            borderBottomWidth: 0.52,
            // borderRadius: 10,
            // borderColor: "#ff268b",
            borderColor: "gray",
            height: 87,
            position: "absolute",
            bottom: 50,
            flexDirection: "row",
            gap: 14,
            elevation: 100,
          }}
        >
          <Pressable
            onPress={() => {
              router.push("/(dashboard)/home/songs-details");
            }}
          >
            <Avatar style={{ marginTop: 2, marginLeft: 1, flex: 1 }} size={80}>
              <Avatar.Image src={imageUrl} />
            </Avatar>
          </Pressable>

          <View
            style={{
              flex: 4,
              flexDirection: "row",

              paddingVertical: 4,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <View style={{ gap: 5, width: "100%" }}>
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
  const { user } = useGlobalContext();
  let downloadUrl = currentSong?.downloadUrl[4]?.url;
  if (user) {
    downloadUrl = currentSong?.downloadUrl[4]?.url;
  }
  // console.log(duration, position, "remaningTime", remainingTime);
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
}: // duration,
// position,
any) => {
  const { socket } = useSocket();
  const seekAudio = async (event: any) => {
    if (duration <= 1) return;

    const touchX = event.nativeEvent.locationX; // Get touch position
    const progressWidth = 230; // Subtract padding/margins
    const seekTo = (touchX / progressWidth) * duration;

    // await sound.setPositionAsync(seekTo); // Seek to new position
    console.log(seekTo / 1000, "seekTo");

    await TrackPlayer.seekTo(seekTo / 1000);
    setPosition(seekTo);
    const user: any = await getValueInAsync("user");
    const userId = JSON.parse(user)?._id;
    console.log(userId, "seekSong");
    socket.emit("seekSong", {
      senderId: userId,
      newTime: seekTo,
    });

    // Update UI immediately
  };

  // const { position, duration } = useProgress();

  useEffect(() => {
    socket.on("syncSeek", async ({ newTime, receiverId }: any) => {
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)?._id;
      console.log(userId, receiverId, newTime, "ids");
      if (receiverId === userId) {
        await sound.setPositionAsync(Number(newTime));
      }
    });
  }, [sound]);

  return (
    <TouchableOpacity onPress={seekAudio} activeOpacity={0.7}>
      <ProgressBar
        style={{
          height: 12,
          width: "100%",
          borderRadius: 3,
        }}
        progress={Math.min(1, Math.max(0, position / duration))}
        color={"#f5075e"}
      />
    </TouchableOpacity>
  );
};

const MediaControls = () => {
  const {
    sound,
    handlePause,
    handlePlay,
    isPlaying,
    handleNext,
    handlePrev,
    isLoop,
    setIsLoop,
    isShuffle,
    setIsShuffle,
  } = usePlayerConext();

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

      <TouchableOpacity
        style={{ position: "absolute", left: -5 }}
        activeOpacity={0.5}
        onPress={() => {
          setIsLoop((prev: boolean) => !prev);
        }}
      >
        <Icon source="repeat" size={20} color={isLoop ? "red" : "white"} />
      </TouchableOpacity>

      <TouchableOpacity
        style={{ position: "absolute", left: 20 }}
        activeOpacity={0.5}
        onPress={() => {
          setIsShuffle((prev: boolean) => !prev);
        }}
      >
        <Icon source="shuffle" size={20} color={isShuffle ? "red" : "white"} />
      </TouchableOpacity>

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
  const {
    sound,
    setSound,
    currentSong,
    setCurrentSong,
    currentSongList,
    setCurrentSongList,
  } = useAudioContext();
  const { user, saveRecentlyPlayedSong } = useGlobalContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const { setImage } = useBackgroudImage();
  const [position, setPosition] = useState(0); // Current playback time (ms)
  const [duration, setDuration] = useState(1);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const { socket } = useSocket();
  const { showNowPlayingNotification } = useNotification();
  const [originalList, setOriginalList] = useState([]);

  const [shuffledList, setShuffledList] = useState([]);

  // const isLoop = useRef(false);

  let imageUrl = "";
  let songUrl = "";
  let title = "";
  if (currentSong) {
    if (currentSong.id) {
      imageUrl = currentSong?.image[user?.imageQuality]?.url;
      songUrl = currentSong?.downloadUrl[4]?.url;
      title = currentSong?.name;
    } else {
      imageUrl = currentSong?.image[2]?.url;
      songUrl = currentSong?.downloadUrl[4]?.url;
      title = currentSong?.name;
    }
  }

  useEffect(() => {
    (async () => await setupAudio())();
    // Run this once to set the audio mode and register the background task
    registerBackgroundFetch();

    // Cleanup when the component is unmounted

    async function setupPlayer() {
      try {
        // Run in correct thread

        await TrackPlayer.setupPlayer({ autoHandleInterruptions: true }); // Initialize Track Player
        console.log("✅ Track Player Initialized");

        // Register playback service (only needs to be called once)
        TrackPlayer.registerPlaybackService(() => service);
        console.log("✅ Track Player Service Registered");

        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
            Capability.SeekTo,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
            Capability.Stop,
          ],
        });

        console.log("✅ Track Player Options Updated");
      } catch (error) {
        console.error("❌ Error setting up Track Player:", error);
      }
    }

    setupPlayer();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
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
  }, [sound, isLoop]);

  useEffect(() => {
    const updateProgress = async () => {
      const progress = await TrackPlayer.getProgress(); // ✅ New API method
      setPosition(progress.position * 1000);
      setDuration(progress.duration * 1000 || 1);
    };

    // Set interval to update progress
    const intervalId = setInterval(updateProgress, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.nextTrack === null) {
      handleNext(); // Call handleNext when the last track finishes
    }
  });

  // Send song details to a friend

  useEffect(() => {
    (async () => {
      if (setImage) {
        if (currentSong?.id)
          setImage(currentSong?.image[user?.imageQuality]?.url);
        else setImage(currentSong?.image[2]?.url);
      }
      // if (sound) {
      //   await sound.unloadAsync();
      // }
      // If a sound is playing, stop it before loading a new one
      if (sound && sound.stopAsync) {
        await sound.stopAsync();
      }

      if (Audio && currentSong?.id) {
        await TrackPlayer.reset();
        // const { sound: newSound } = await Audio?.Sound?.createAsync(
        //   {
        //     uri: currentSong?.id
        //       ? currentSong?.downloadUrl[4]?.url
        //       : currentSong?.downloadUrl[4],
        //   },
        //   { shouldPlay: true }
        // );

        // setSound(newSound);
        await TrackPlayer.add({
          id: currentSong._id || "",
          url: currentSong?.id
            ? currentSong?.downloadUrl[4]?.url
            : currentSong?.downloadUrl[4],
          title: currentSong.name,
          // artist: "Artist Name",
          artwork: currentSong?.image[2]?.url, // Optional artwork image
        });

        await TrackPlayer.play();
        setIsPlaying(true);
        const title = currentSong.name;
        const imageUrl = currentSong?.image[2]?.url;
        showNowPlayingNotification(title, imageUrl);
      }
      if (currentSong?.type || currentSong?.downloadUrl[0]?.url) {
        try {
          const user: any = await getValueInAsync("user");
          const userId = JSON.parse(user)?._id;
          saveRecentlyPlayedSong(userId, currentSong);
        } catch (error) {}
      }
    })();
  }, [currentSong]);

  useEffect(() => {
    socket?.on("syncSong", async ({ song, receiverId }: any) => {
      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)?._id;
      console.log(receiverId, userId);
      if (receiverId === userId) {
        setCurrentSong(song);
      }
    });
    socket?.on("syncPlayPause", async ({ isPlaying, receiverId }: any) => {
      const user: any = await getValueInAsync("user");
      console.log(isPlaying, "syncPlay");
      const userId = JSON.parse(user)?._id;
      if (userId === receiverId) {
        if (isPlaying == true) {
          await sound?.playAsync();
          setIsPlaying(true);
        }
        if (isPlaying == false) {
          await sound?.pauseAsync();
          setIsPlaying(false);
        }
      }
    });
  }, [socket, currentSong, sound]);

  const handleNext = () => {
    let currenIndex = null;

    if (isLoop === true) {
      let prev1 = {};
      setCurrentSong((prev: any) => {
        prev1 = prev;
        return { ...prev };
      })(async () => {
        const user: any = await getValueInAsync("user");
        const userId = JSON.parse(user)?._id;
        socket?.emit("songPlaying", { senderId: userId, song: prev1 });
      })();
      return;
    }

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
      (async () => {
        const user: any = await getValueInAsync("user");
        const userId = JSON.parse(user)?._id;
        socket?.emit("songPlaying", {
          senderId: userId,
          song: currentSongList[newIndex],
        });
      })();
    }
  };
  const handlePrev = () => {
    let currenIndex = null;
    let prev1 = {};
    if (isLoop === true) {
      setCurrentSong((prev: any) => {
        prev1 = prev;
        return { ...prev };
      });
      return;
    }
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
      (async () => {
        const user: any = await getValueInAsync("user");
        const userId = JSON.parse(user)?._id;
        socket?.emit("songPlaying", {
          senderId: userId,
          song: currentSongList[newIndex],
        });
      })();
    }
  };

  const handlePlay = async () => {
    setIsPlaying(true);
    const user: any = await getValueInAsync("user");
    const userId = JSON.parse(user)._id;
    socket.emit("playPauseSong", { senderId: userId, isPlaying: true });
    await TrackPlayer.play();
    if (sound) {
      await sound.playAsync();
    }
  };

  const handlePause = async () => {
    setIsPlaying(false);
    const user: any = await getValueInAsync("user");
    const userId = JSON.parse(user)._id;
    socket.emit("playPauseSong", { senderId: userId, isPlaying: false });
    await TrackPlayer.pause();
    if (sound) {
      await sound.pauseAsync();
    }
  };

  // Register event listeners for remote controls
  useTrackPlayerEvents(
    [
      Event.RemotePlay,
      Event.RemotePause,
      Event.RemoteNext,
      Event.RemotePrevious,
    ],
    async (event) => {
      if (event.type === Event.RemotePlay) {
        handlePlay(); // Toggle play/pause
      } else if (event.type === Event.RemotePause) {
        handlePause();
      } else if (event.type === Event.RemoteNext) {
        handleNext(); // Play next track
      } else if (event.type === Event.RemotePrevious) {
        handlePrev(); // Play previous track
      }
    }
  );

  useTrackPlayerEvents([Event.PlaybackQueueEnded], async () => {
    handleNext(); // Call handleNext when the last track finishes
  });

  useTrackPlayerEvents([Event.RemoteSeek], async (event: any) => {
    if (event) {
      // Extract the position from the event object, assuming `event.position` is the correct field
      const position = event.position;

      // Ensure position is a number before calling seekTo
      if (typeof position === "number") {
        await TrackPlayer.seekTo(position);
      } else {
        console.warn("Invalid position data:", position);
      }
    }
  });

  useTrackPlayerEvents([Event.RemoteStop], async (event: any) => {
    try {
      await TrackPlayer.reset();
      setCurrentSong(null);
    } catch (error) {
      console.log(error, "RemoteStop Error");
    }
  });

  // Initialize the background fetch task
  TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
      // Your background task logic: Check if the song is still playing and resume playback
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isPlaying) {
          // If the song is still playing, continue it
          console.log("Continuing playback in the background...");
        } else {
          // If not playing, maybe do something like play the next song
          handlePlay();
          // handleNext();
          console.log("Playback stopped in the background...");
        }
      }
      return BackgroundFetch.Result.NewData;
    } catch (error) {
      console.error(error);
      return BackgroundFetch.Result.Failed;
    }
  });

  // Register the background task to keep running even when the app is backgrounded or terminated
  const registerBackgroundFetch = async () => {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 1, // Time interval in seconds to perform the background task
      stopOnTerminate: false, // Keep running after app is terminated
      startOnBoot: true, // Start the task again after a device reboot
    });
  };

  useEffect(() => {
    if (isShuffle === false && originalList.length) {
      setCurrentSongList(originalList);
    }

    if (isShuffle === true) {
      setCurrentSongList((prev: any) => {
        const or = JSON.parse(JSON.stringify(prev));
        setOriginalList(prev);
        shuffleArray(or);
        return or;
      });
    }
  }, [isShuffle]);

  useEffect(() => {
    if (originalList.length && currentSongList.length) {
      if (originalList.length !== currentSongList.length) {
        const v = JSON.parse(JSON.stringify(currentSongList));
        setOriginalList(v);
      }
    }
  }, [currentSongList]);

  function shuffleArray(array: any) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  }

  return {
    isLoop,
    setIsLoop,
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
    isShuffle,
    setIsShuffle,
  };
};

export default AudioPlayer;
