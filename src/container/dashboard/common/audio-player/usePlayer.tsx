import { useEffect, useRef, useState } from "react";
import { useAudioContext } from "@/src/providers/AudioProvider";
import { Audio } from "expo-av";
import { useBackgroudImage } from "@/src/providers/BackgroundImage";

import { useGlobalContext } from "@/src/providers/GlobalProvider";

import { getValueInAsync } from "@/src/utilities/helpers";

import { useSocket } from "@/src/providers/socketProvider";
import useNotification from "@/src/utilities/showNotification";
import * as TaskManager from "expo-task-manager";
import * as BackgroundFetch1 from "expo-background-fetch";
import TrackPlayer, {
  Capability,
  Event,
  useTrackPlayerEvents,
  AppKilledPlaybackBehavior,
} from "react-native-track-player";
import service from "@/src/utilities/service";
import AsyncStorage from "@react-native-async-storage/async-storage";
const PLAYER_STATE_KEY = "@player_state";

const BackgroundFetch: any = BackgroundFetch1;

const BACKGROUND_FETCH_TASK = "BACKGROUND_FETCH_TASK";

async function setupAudio() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
}
export const usePlayer = () => {
  const {
    sound,
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
    // (async () => await setupAudio())();

    async function setupPlayer() {
      try {
        // Run in correct thread

        await TrackPlayer.setupPlayer({
          autoHandleInterruptions: true,
        }); // Initialize Track Player
        console.log("✅ Track Player Initialized");

        // Register playback service (only needs to be called once)
        TrackPlayer.registerPlaybackService(() => service);
        console.log("✅ Track Player Service Registered");

        await TrackPlayer.updateOptions({
          android: {
            appKilledPlaybackBehavior:
              AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          },
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

    // setupPlayer();

    const initializePlayer = async () => {
      await setupAudio();

      await restorePlayerState();

      await setupPlayer();
    };

    initializePlayer();

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
    if (!currentSong?.id) return;

    const loadSong = async () => {
      try {
        await TrackPlayer.reset();

        await TrackPlayer.add({
          id: currentSong._id || "",
          url: currentSong?.downloadUrl[4]?.url,
          title: currentSong.name,
          artwork: currentSong?.image[2]?.url,
        });

        setImage(currentSong?.image[2]?.url);

        if (isRestoringRef.current) {
          const savedPosition = restoredPositionRef.current;

          if (savedPosition > 0) {
            await TrackPlayer.seekTo(savedPosition / 1000);
            setPosition(savedPosition);
          }

          // IMPORTANT:
          // Do NOT call TrackPlayer.play() here.

          setIsPlaying(false);

          isRestoringRef.current = false;
          restoredPositionRef.current = 0;

          return;
        }

        // Normal song change
        await TrackPlayer.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error loading song:", error);
      }
    };

    loadSong();
  }, [currentSong]);

  // useEffect(() => {
  //   (async () => {
  //     if (setImage) {
  //       if (currentSong?.id)
  //         setImage(currentSong?.image[user?.imageQuality]?.url);
  //       else setImage(currentSong?.image[2]?.url);
  //     }
  //     // if (sound) {
  //     //   await sound.unloadAsync();
  //     // }
  //     // If a sound is playing, stop it before loading a new one
  //     if (sound && sound.stopAsync) {
  //       await sound.stopAsync();
  //     }

  //     if (Audio && currentSong?.id) {
  //       await TrackPlayer.reset();
  //       // const { sound: newSound } = await Audio?.Sound?.createAsync(
  //       //   {
  //       //     uri: currentSong?.id
  //       //       ? currentSong?.downloadUrl[4]?.url
  //       //       : currentSong?.downloadUrl[4],
  //       //   },
  //       //   { shouldPlay: true }
  //       // );

  //       // setSound(newSound);
  //       await TrackPlayer.add({
  //         id: currentSong._id || "",
  //         url: currentSong?.id
  //           ? currentSong?.downloadUrl[4]?.url
  //           : currentSong?.downloadUrl[4],
  //         title: currentSong.name,
  //         // artist: "Artist Name",
  //         artwork: currentSong?.image[2]?.url, // Optional artwork image
  //       });

  //       await TrackPlayer.play();
  //       setIsPlaying(true);
  //       const title = currentSong.name;
  //       const imageUrl = currentSong?.image[2]?.url;
  //       // showNowPlayingNotification(title, imageUrl);
  //     }
  //     if (currentSong?.type || currentSong?.downloadUrl[0]?.url) {
  //       try {
  //         const user: any = await getValueInAsync("user");
  //         const userId = JSON.parse(user)?._id;
  //         saveRecentlyPlayedSong(userId, currentSong);
  //       } catch (error) {}
  //     }
  //   })();
  // }, [currentSong]);

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

  const savePlayerState = async () => {
    try {
      const state = {
        currentSong,
        currentSongList,
        position,
        isPlaying: false,
      };

      await AsyncStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save player state:", error);
    }
  };

  const isRestoringRef = useRef(false);
  const restoredPositionRef = useRef(0);

  const restorePlayerState = async () => {
    try {
      const savedState = await AsyncStorage.getItem("@player_state");

      if (!savedState) return;

      const {
        currentSong: savedSong,
        currentSongList: savedSongList,
        position: savedPosition,
      } = JSON.parse(savedState);

      if (Array.isArray(savedSongList)) {
        setCurrentSongList(savedSongList);
      }

      if (savedSong) {
        isRestoringRef.current = true;
        restoredPositionRef.current = savedPosition || 0;

        setCurrentSong(savedSong);
      }
    } catch (error) {
      console.error("Restore player state error:", error);
    }
  };

  useEffect(() => {
    if (!currentSong) return;

    savePlayerState();
  }, [currentSong, currentSongList, position]);

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
      currenIndex = getCurrentIndex();
    }
    if (currenIndex || currenIndex === 0) {
      let length = currentSongList.length - 1;
      let newIndex = length === currenIndex ? 0 : currenIndex + 1;
      if (isShuffle) newIndex = currenIndex;
      console.log(newIndex, currentSongList.length, "dataTest");
      const newSong = currentSongList[newIndex];
      if (newSong) {
        setCurrentSong(newSong);
      }

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
      currenIndex = getCurrentIndex();
    }
    if (currenIndex || currenIndex === 0) {
      const length = currentSongList.length - 1;
      let newIndex = currenIndex === 0 ? length : currenIndex - 1;
      if (isShuffle) newIndex = currenIndex;
      console.log(newIndex, currentSongList.length, "dataTest");
      const newSong = currentSongList[newIndex];
      if (newSong) {
        setCurrentSong(newSong);
      }
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
    try {
      await TrackPlayer.play();

      setIsPlaying(true);

      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)._id;

      socket.emit("playPauseSong", {
        senderId: userId,
        isPlaying: true,
      });
    } catch (error) {
      console.error("Play error:", error);
    }
  };
  const handlePause = async () => {
    try {
      await TrackPlayer.pause();

      setIsPlaying(false);

      const user: any = await getValueInAsync("user");
      const userId = JSON.parse(user)._id;

      socket.emit("playPauseSong", {
        senderId: userId,
        isPlaying: false,
      });
    } catch (error) {
      console.error("Pause error:", error);
    }
  };
  // const handlePlay = async () => {
  //   setIsPlaying(true);
  //   const user: any = await getValueInAsync("user");
  //   const userId = JSON.parse(user)._id;
  //   socket.emit("playPauseSong", { senderId: userId, isPlaying: true });
  //   await TrackPlayer.play();
  //   if (sound) {
  //     await sound.playAsync();
  //   }
  // };

  // const handlePause = async () => {
  //   setIsPlaying(false);
  //   const user: any = await getValueInAsync("user");
  //   const userId = JSON.parse(user)._id;
  //   socket.emit("playPauseSong", { senderId: userId, isPlaying: false });
  //   await TrackPlayer.pause();
  //   if (sound) {
  //     await sound.pauseAsync();
  //   }
  // };

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
    },
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

  let lastRandomRef = useRef(null as any);

  const getCurrentIndex = () => {
    let currenIndex;
    if (isShuffle && currentSongList.length) {
      let random = getRandom();
      while (lastRandomRef.current == random) {
        random = getRandom();
      }
      lastRandomRef.current = random;
      return random;
    } else {
      currentSongList.some((item: any, idx: any) => {
        if (item.id === currentSong.id) {
          currenIndex = idx;
          return true;
        } else return false;
      });
      if (currenIndex || currenIndex == 0) {
        return currenIndex;
      }
    }
    return null;
  };

  const getRandom = () => {
    const random = Math.floor(Math.random() * currentSongList.length);
    return random;
  };

  // useEffect(() => {
  //   if (isShuffle === false && originalList.length) {
  //     setCurrentSongList(originalList);
  //   }

  //   if (isShuffle === true) {
  //     setCurrentSongList((prev: any) => {
  //       const or = JSON.parse(JSON.stringify(prev));
  //       setOriginalList(prev);
  //       shuffleArray(or);
  //       return or;
  //     });
  //   }
  // }, [isShuffle]);

  // useEffect(() => {
  //   if (originalList.length && currentSongList.length) {
  //     if (originalList.length !== currentSongList.length) {
  //       const v = JSON.parse(JSON.stringify(currentSongList));
  //       setOriginalList(v);
  //     }
  //   }
  // }, [currentSongList]);

  // function shuffleArray(array: any) {
  //   for (let i = array.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
  //     [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  //   }
  //   return array;
  // }

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
