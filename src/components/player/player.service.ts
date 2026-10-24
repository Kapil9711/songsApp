import TrackPlayer, { Event, RepeatMode, type MediaItem } from "@rntp/player";

import { usePlayerProgressStore } from "@/store/player.progress.store";
import { usePlayerStore } from "@/store/player.store";

let initialization: Promise<void> | null = null;
let listenersRegistered = false;
let queueOperation: Promise<void> = Promise.resolve();

function requireReady() {
  if (usePlayerStore.getState().status !== "ready") {
    throw new Error("Player is not ready. Initialize it before playback.");
  }
}

function reportError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  usePlayerStore.getState().setError(message);
}

function syncQueue() {
  const queue = TrackPlayer.getQueue();
  const activeIndex = TrackPlayer.getActiveMediaItemIndex() ?? -1;
  const activeTrack = TrackPlayer.getActiveMediaItem();

  const store = usePlayerStore.getState();

  store.setQueue([...queue]);
  store.setActiveTrack(activeTrack, activeIndex);
}

function syncFromNative() {
  syncQueue();

  const store = usePlayerStore.getState();

  store.setPlayback(
    TrackPlayer.isPlaying(),
    String(TrackPlayer.getPlaybackState()),
  );

  store.setShuffled(TrackPlayer.isShuffleEnabled());

  const nativeRepeatMode = TrackPlayer.getRepeatMode();

  store.setRepeatMode(
    nativeRepeatMode === RepeatMode.One
      ? "track"
      : nativeRepeatMode === RepeatMode.All
        ? "queue"
        : "off",
  );
}

function registerListeners() {
  if (listenersRegistered) return;

  listenersRegistered = true;

  TrackPlayer.addEventListener(Event.IsPlayingChanged, ({ playing }) => {
    usePlayerStore.getState().setPlayback(playing);
  });

  TrackPlayer.addEventListener(Event.PlaybackStateChanged, ({ state }) => {
    usePlayerStore
      .getState()
      .setPlayback(TrackPlayer.isPlaying(), String(state));
  });

  TrackPlayer.addEventListener(Event.MediaItemTransition, ({ item, index }) => {
    usePlayerStore.getState().setActiveTrack(item, index ?? -1);
    usePlayerProgressStore.getState().reset();
  });

  TrackPlayer.addEventListener(Event.MediaMetadataChanged, () => {
    usePlayerStore
      .getState()
      .setActiveTrack(
        TrackPlayer.getActiveMediaItem(),
        TrackPlayer.getActiveMediaItemIndex() ?? -1,
      );
  });

  TrackPlayer.addEventListener(Event.QueueChanged, () => {
    try {
      syncQueue();
    } catch (error) {
      reportError(error, "Failed to synchronize queue");
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, ({ code, message }) => {
    reportError(new Error(`${code}: ${message}`), "Playback failed");
  });
}

export function initializePlayer(): Promise<void> {
  if (usePlayerStore.getState().status === "ready") {
    return Promise.resolve();
  }

  if (initialization) return initialization;

  usePlayerStore.getState().setStatus("loading");
  usePlayerStore.getState().setError(null);

  initialization = Promise.resolve()
    .then(() => {
      // Native setup belongs in registerPlaybackSession in index.js.
      registerListeners();
      syncFromNative();
      usePlayerStore.getState().setStatus("ready");
    })
    .catch((error: unknown) => {
      reportError(error, "Player initialization failed");
      usePlayerStore.getState().setStatus("error");
      throw error;
    })
    .finally(() => {
      initialization = null;
    });

  return initialization;
}

function runPlayerCommand(operation: () => void) {
  requireReady();

  try {
    operation();
  } catch (error) {
    reportError(error, "Playback command failed");
    throw error;
  }
}

function enqueueQueueOperation(operation: () => void): Promise<void> {
  const next = queueOperation.then(() => {
    requireReady();

    try {
      operation();
    } catch (error) {
      reportError(error, "Queue operation failed");
      throw error;
    }
  });

  // A failed operation must not block subsequent queue operations.
  queueOperation = next.catch(() => {});

  return next;
}

export const PlayerService = {
  syncFromNative,

  play() {
    runPlayerCommand(() => TrackPlayer.play());
  },

  pause() {
    runPlayerCommand(() => TrackPlayer.pause());
  },

  togglePlay() {
    runPlayerCommand(() => {
      if (TrackPlayer.isPlaying()) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
    });
  },

  next() {
    runPlayerCommand(() => TrackPlayer.skipToNext());
  },

  previous() {
    runPlayerCommand(() => TrackPlayer.skipToPrevious());
  },

  seekTo(position: number) {
    if (!Number.isFinite(position) || position < 0) return;

    runPlayerCommand(() => TrackPlayer.seekTo(position));
  },

  toggleShuffle() {
    requireReady();

    try {
      const enabled = !TrackPlayer.isShuffleEnabled();

      TrackPlayer.setShuffleEnabled(enabled);

      // Read back the native state instead of assuming it changed.
      usePlayerStore.getState().setShuffled(TrackPlayer.isShuffleEnabled());
    } catch (error) {
      reportError(error, "Failed to toggle shuffle");
      throw error;
    }
  },

  async toggleRepeat() {
    requireReady();

    try {
      const currentMode = TrackPlayer.getRepeatMode();

      const nextMode =
        currentMode === RepeatMode.Off
          ? RepeatMode.One
          : currentMode === RepeatMode.One
            ? RepeatMode.All
            : RepeatMode.Off;

      TrackPlayer.setRepeatMode(nextMode);

      const actualMode = TrackPlayer.getRepeatMode();

      usePlayerStore
        .getState()
        .setRepeatMode(
          actualMode === RepeatMode.One
            ? "track"
            : actualMode === RepeatMode.All
              ? "queue"
              : "off",
        );
    } catch (error) {
      reportError(error, "Failed to toggle repeat");
      throw error;
    }
  },

  playQueue(items: MediaItem[], startIndex = 0) {
    return enqueueQueueOperation(() => {
      if (items.length === 0) {
        TrackPlayer.clear();

        const store = usePlayerStore.getState();
        store.setQueue([]);
        store.setActiveTrack(null, -1);

        usePlayerProgressStore.getState().reset();
        return;
      }

      const index = Math.max(
        0,
        Math.min(Math.floor(startIndex), items.length - 1),
      );

      TrackPlayer.setMediaItems(items, index);

      syncQueue();
      usePlayerProgressStore.getState().reset();

      TrackPlayer.play();
    });
  },

  addToQueue(items: MediaItem[]) {
    return enqueueQueueOperation(() => {
      if (items.length === 0) return;

      TrackPlayer.addMediaItems(items);
      syncQueue();
    });
  },

  clearQueue() {
    return enqueueQueueOperation(() => {
      TrackPlayer.clear();

      const store = usePlayerStore.getState();
      store.setQueue([]);
      store.setActiveTrack(null, -1);

      usePlayerProgressStore.getState().reset();
    });
  },

  getQueue() {
    requireReady();
    return TrackPlayer.getQueue();
  },
};
