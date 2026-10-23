import TrackPlayer, { Event, PlayerCommand } from "@rntp/player";

TrackPlayer.registerPlaybackSession(() => {
  TrackPlayer.setupPlayer({
    contentType: "music",
    handleAudioBecomingNoisy: true,
    android: {
      wakeMode: "network",
      taskRemovedBehavior: "stop",
    },
  });

  TrackPlayer.setCommands({
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Next,
      PlayerCommand.Previous,
      PlayerCommand.Seek,
    ],
  });

  TrackPlayer.addEventListener(Event.PlaybackError, ({ code, message }) => {
    console.error("Background playback error:", code, message);
  });
});

import "expo-router/entry";
