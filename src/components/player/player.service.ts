import TrackPlayer, { Event, RepeatMode, type MediaItem } from "@rntp/player";

import { usePlayerProgressStore } from "@/store/player.progress.store";
import { usePlayerStore } from "@/store/player.store";

let initialization: Promise<void> | null = null;
let listenersRegistered = false;
let queueOperation: Promise<void> = Promise.resolve();

// Prevent stale native events from overwriting the requested index
// while a new queue is being installed.
let pendingActiveIndex: number | null = null;

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
  const nativeIndex = TrackPlayer.getActiveMediaItemIndex() ?? -1;
  const nativeTrack: any = TrackPlayer.getActiveMediaItem();

  const store = usePlayerStore.getState();
  store.setQueue(queue);

  // While a new queue is loading, don't replace the intended index
  // with a stale native index from the previous queue.
  if (pendingActiveIndex !== null) {
    const intendedIndex = pendingActiveIndex;
    const intendedTrack: any = queue[intendedIndex];

    if (
      intendedTrack &&
      nativeTrack &&
      String(intendedTrack.mediaId ?? intendedTrack.id) ===
        String(nativeTrack.mediaId ?? nativeTrack.id)
    ) {
      store.setActiveTrack(nativeTrack, nativeIndex);
      pendingActiveIndex = null;
    } else {
      store.setActiveTrack(intendedTrack ?? null, intendedIndex);
    }

    return;
  }

  store.setActiveTrack(nativeTrack, nativeIndex);
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
    const nextIndex = index ?? -1;

    usePlayerStore.getState().setActiveTrack(item, nextIndex);
    usePlayerProgressStore.getState().reset();

    if (pendingActiveIndex !== null && nextIndex === pendingActiveIndex) {
      pendingActiveIndex = null;
      TrackPlayer.play();
    }
  });

  TrackPlayer.addEventListener(Event.MediaMetadataChanged, () => {
    const activeIndex = TrackPlayer.getActiveMediaItemIndex() ?? -1;
    const activeTrack = TrackPlayer.getActiveMediaItem();

    // Ignore stale metadata updates during queue replacement.
    if (pendingActiveIndex !== null && activeIndex !== pendingActiveIndex) {
      return;
    }

    usePlayerStore.getState().setActiveTrack(activeTrack, activeIndex);
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
      TrackPlayer.setShuffleEnabled(!TrackPlayer.isShuffleEnabled());

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
        pendingActiveIndex = null;
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

      const currentQueue = TrackPlayer.getQueue();

      const isSameQueue =
        currentQueue.length === items.length &&
        currentQueue.every((current: any, i) => {
          const next: any = items[i];

          return (
            String(current.mediaId ?? current.id) ===
              String(next.mediaId ?? next.id) && current.url === next.url
          );
        });

      if (isSameQueue) {
        const activeIndex = TrackPlayer.getActiveMediaItemIndex() ?? -1;

        if (activeIndex === index) {
          if (!TrackPlayer.isPlaying()) {
            TrackPlayer.play();
          }
          return;
        }

        pendingActiveIndex = index;
        TrackPlayer.skipToIndex(index);
        TrackPlayer.play();
        return;
      }

      // Set the desired index before changing the native queue so
      // synchronous QueueChanged events cannot flash the old index.
      pendingActiveIndex = index;

      const intendedTrack = items[index];
      usePlayerStore.getState().setActiveTrack(intendedTrack, index);
      usePlayerProgressStore.getState().reset();

      // Set the native queue once, at the requested index.
      TrackPlayer.setMediaItems(items, index);

      // Do not immediately read back the queue or active index here.
      // Native events will synchronize the store when ready.
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
      pendingActiveIndex = null;
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
