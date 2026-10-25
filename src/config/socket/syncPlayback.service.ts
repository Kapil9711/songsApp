// src/services/syncPlayback.ts

import type {
  PlayerCommand,
  PlayerCommandPayload,
  SyncSong,
} from "@/config/socket/syncServer";

import { PlayerService } from "@/components/player/player.service";
import { syncSocketService } from "@/config/socket/syncServer";

// --------------------------------------------------
// STATE
// --------------------------------------------------

let isStarted = false;

let unsubscribePlayerCommand: (() => void) | undefined;
let unsubscribeControllerUpdated: (() => void) | undefined;

let playbackControllerId: string | null = null;

// Prevent duplicate processing of the same socket command.
const processedCommandIds = new Set<string>();
const MAX_PROCESSED_COMMANDS = 500;

// Indicates that a command is currently being applied remotely.
// Useful if other playback-related code needs to avoid broadcasting
// in response to remote playback state changes.
let remoteCommandDepth = 0;

export function isApplyingRemoteCommand(): boolean {
  return remoteCommandDepth > 0;
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function toPlayerTrack(song: SyncSong) {
  if (!song.url) {
    throw new Error(`Song "${song.title}" has no playable URL`);
  }

  return {
    mediaId: song.id,
    url: song.url,
    title: song.title,
    artist: song.artist ?? "Unknown Artist",
    artworkUrl: song.artworkUrl,
  };
}

function isCurrentDeviceController(): boolean {
  const currentUserId = syncSocketService.getUserId();

  return (
    !!currentUserId &&
    !!playbackControllerId &&
    currentUserId === playbackControllerId
  );
}

function hasProcessedCommand(commandId?: string): boolean {
  if (!commandId) {
    // Without a command ID, we cannot reliably deduplicate events.
    return false;
  }

  if (processedCommandIds.has(commandId)) {
    return true;
  }

  processedCommandIds.add(commandId);

  if (processedCommandIds.size > MAX_PROCESSED_COMMANDS) {
    const oldestId = processedCommandIds.values().next().value;

    if (oldestId) {
      processedCommandIds.delete(oldestId);
    }
  }

  return false;
}

// --------------------------------------------------
// REMOTE COMMAND EXECUTION
// --------------------------------------------------

async function executeRemoteCommand(command: PlayerCommand): Promise<void> {
  remoteCommandDepth++;

  try {
    console.log("[SyncPlayback] Applying remote command:", command.type);

    switch (command.type) {
      case "PLAY": {
        await PlayerService.play();
        break;
      }

      case "PAUSE": {
        await PlayerService.pause();
        break;
      }

      case "SEEK": {
        await PlayerService.seekTo(command.position);
        break;
      }

      case "PLAY_SONG": {
        const track = toPlayerTrack(command.song);

        // This receiver plays the song without broadcasting it again.
        // Its local queue may be replaced by this one-song queue.
        await PlayerService.playQueue([track], 0);
        break;
      }

      default: {
        const exhaustiveCheck: never = command;
        return exhaustiveCheck;
      }
    }

    console.log("[SyncPlayback] Remote command completed:", command.type);
  } catch (error) {
    console.error(
      "[SyncPlayback] Failed to execute remote command:",
      command.type,
      error,
    );
  } finally {
    remoteCommandDepth--;
  }
}

// --------------------------------------------------
// INCOMING SOCKET EVENT
// --------------------------------------------------

function handleIncomingPlayerCommand(payload: PlayerCommandPayload): void {
  const currentUserId = syncSocketService.getUserId();

  // 1. Ignore commands sent by this same user/device identity.
  if (currentUserId && payload.senderId === currentUserId) {
    console.log("[SyncPlayback] Ignoring own command:", payload.command?.type);
    return;
  }

  // 2. Ignore duplicate delivery of the same command.
  if (hasProcessedCommand(payload.commandId)) {
    console.log(
      "[SyncPlayback] Ignoring duplicate command:",
      payload.commandId,
    );
    return;
  }

  // 3. Validate that the event contains a group ID.
  // If your app supports multiple groups simultaneously, compare
  // this against the currently active group ID as well.
  if (!payload.groupId) {
    console.warn("[SyncPlayback] Ignoring command without group ID.");
    return;
  }

  // 4. Execute directly through PlayerService.
  // Do NOT call UI handlers such as handleSongPlay, handleNext,
  // handlePrevious, or syncedPlayback.playSong here, because those
  // may broadcast the same action again.
  void executeRemoteCommand(payload.command);
}

// --------------------------------------------------
// START / STOP
// --------------------------------------------------

export function startPlaybackSync(): void {
  if (isStarted) {
    return;
  }

  if (!syncSocketService.getSocket()) {
    console.warn(
      "[SyncPlayback] Connect the socket before starting playback sync.",
    );
    return;
  }

  // Set this before registering listeners to prevent duplicate setup.
  isStarted = true;

  unsubscribePlayerCommand = syncSocketService.on(
    "playerCommand",
    handleIncomingPlayerCommand,
  );

  unsubscribeControllerUpdated = syncSocketService.on(
    "playbackControllerUpdated",
    (payload) => {
      playbackControllerId = payload.controllerId;

      console.log("[SyncPlayback] Controller updated:", playbackControllerId);
    },
  );

  console.log("[SyncPlayback] Playback synchronization started.");
}

export function stopPlaybackSync(): void {
  unsubscribePlayerCommand?.();
  unsubscribeControllerUpdated?.();

  unsubscribePlayerCommand = undefined;
  unsubscribeControllerUpdated = undefined;

  playbackControllerId = null;
  isStarted = false;

  // Clear old IDs when the sync lifecycle stops.
  processedCommandIds.clear();

  console.log("[SyncPlayback] Playback synchronization stopped.");
}

// --------------------------------------------------
// LOCAL PLAYBACK ACTIONS
// --------------------------------------------------

async function runAndBroadcast(command: PlayerCommand): Promise<void> {
  // Don't rebroadcast actions while applying a remote command.
  if (isApplyingRemoteCommand()) {
    console.log(
      "[SyncPlayback] Skipping broadcast during remote command:",
      command.type,
    );
    return;
  }

  try {
    switch (command.type) {
      case "PLAY": {
        await PlayerService.play();
        break;
      }

      case "PAUSE": {
        await PlayerService.pause();
        break;
      }

      case "SEEK": {
        await PlayerService.seekTo(command.position);
        break;
      }

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

    const sent = syncSocketService.sendCommand(command);

    if (!sent) {
      console.warn(
        "[SyncPlayback] Local playback succeeded, but broadcasting failed.",
      );
    }
  } catch (error) {
    console.error("[SyncPlayback] Local playback failed:", command.type, error);
  }
}

// --------------------------------------------------
// SONG BROADCASTING
// --------------------------------------------------

/**
 * Broadcast a song that is already playing locally.
 * Does not modify the local queue.
 */
export function broadcastSong(song: SyncSong): boolean {
  if (isApplyingRemoteCommand()) {
    console.log(
      "[SyncPlayback] Skipping song broadcast during remote playback.",
    );
    return false;
  }

  if (!song.url) {
    console.warn(
      "[SyncPlayback] Cannot broadcast a song without a playable URL.",
    );
    return false;
  }

  return syncSocketService.sendCommand({
    type: "PLAY_SONG",
    song,
  });
}

export function broadcastNextSong(song: SyncSong): boolean {
  return broadcastSong(song);
}

export function broadcastPreviousSong(song: SyncSong): boolean {
  return broadcastSong(song);
}

// --------------------------------------------------
// PUBLIC API
// --------------------------------------------------

export const syncedPlayback = {
  play: () =>
    runAndBroadcast({
      type: "PLAY",
    }),

  pause: () =>
    runAndBroadcast({
      type: "PAUSE",
    }),

  seek: (position: number) =>
    runAndBroadcast({
      type: "SEEK",
      position,
    }),

  playSong: (song: SyncSong) =>
    runAndBroadcast({
      type: "PLAY_SONG",
      song,
    }),

  broadcastSong,
  broadcastNextSong,
  broadcastPreviousSong,

  isController: isCurrentDeviceController,

  getControllerId: () => playbackControllerId,

  broadcastPlay: () =>
    syncSocketService.sendCommand({
      type: "PLAY",
    }),

  broadcastPause: () =>
    syncSocketService.sendCommand({
      type: "PAUSE",
    }),
};
