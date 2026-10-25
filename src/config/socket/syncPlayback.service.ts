// src/services/syncPlayback.ts

import type { PlayerCommand, SyncSong } from "@/config/socket/syncServer";
import { syncSocketService } from "@/config/socket/syncServer";

// Change this import to your actual PlayerService path/export.
import { PlayerService } from "@/components/player/player.service";

let isStarted = false;
let unsubscribePlayerCommand: (() => void) | undefined;

function toPlayerTrack(song: SyncSong) {
  if (!song.url) {
    throw new Error(`Song "${song.title}" has no playable URL`);
  }

  return {
    id: song.id,
    url: song.url,
    title: song.title,
    artist: song.artist ?? "Unknown Artist",
    artwork: song.artwork,
  };
}

/**
 * Execute a command received from another device.
 *
 * IMPORTANT:
 * Never call syncSocketService.sendCommand() from this function.
 * Doing so would create a command echo loop.
 */
async function executeRemoteCommand(command: PlayerCommand) {
  try {
    switch (command.type) {
      case "PLAY":
        await PlayerService.play();
        break;

      case "PAUSE":
        await PlayerService.pause();
        break;

      case "NEXT":
        await PlayerService.next();
        break;

      case "PREVIOUS":
        await PlayerService.previous();
        break;

      case "SEEK":
        await PlayerService.seekTo(command.position);
        break;

      case "PLAY_SONG": {
        const track = toPlayerTrack(command.song);

        await PlayerService.playQueue([track], 0);
        break;
      }

      default: {
        const exhaustiveCheck: never = command;
        return exhaustiveCheck;
      }
    }
  } catch (error) {
    console.error("[SyncPlayback] Failed to execute remote command:", error);
  }
}

/**
 * Register once, for example from your root layout after the
 * socket service/store has connected.
 */
export function startPlaybackSync() {
  if (isStarted) return;

  isStarted = true;

  unsubscribePlayerCommand = syncSocketService.on(
    "playerCommand",
    (payload) => {
      void executeRemoteCommand(payload.command);
    },
  );
}

export function stopPlaybackSync() {
  unsubscribePlayerCommand?.();
  unsubscribePlayerCommand = undefined;
  isStarted = false;
}

/**
 * Run the action locally, then broadcast it to the connected group.
 */
async function runAndBroadcast(command: PlayerCommand) {
  try {
    switch (command.type) {
      case "PLAY":
        await PlayerService.play();
        break;

      case "PAUSE":
        await PlayerService.pause();
        break;

      case "NEXT":
        await PlayerService.next();
        break;

      case "PREVIOUS":
        await PlayerService.previous();
        break;

      case "SEEK":
        await PlayerService.seekTo(command.position);
        break;

      case "PLAY_SONG":
        await PlayerService.playQueue([toPlayerTrack(command.song)], 0);
        break;
    }

    // Broadcast only after the local operation succeeds.
    syncSocketService.sendCommand(command);
  } catch (error) {
    console.error("[SyncPlayback] Local playback failed:", error);
  }
}

export const syncedPlayback = {
  play: () => runAndBroadcast({ type: "PLAY" }),

  pause: () => runAndBroadcast({ type: "PAUSE" }),

  next: () => runAndBroadcast({ type: "NEXT" }),

  previous: () => runAndBroadcast({ type: "PREVIOUS" }),

  seek: (position: number) => runAndBroadcast({ type: "SEEK", position }),

  playSong: (song: SyncSong) => runAndBroadcast({ type: "PLAY_SONG", song }),
};
