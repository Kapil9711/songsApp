import React, { createContext, useContext } from "react";
import { usePlayer } from "../container/dashboard/common/audio-player/usePlayer";

const PlayerContext = createContext<any>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const player = usePlayer();

  return (
    <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
  );
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayerContext must be used inside PlayerProvider");
  }

  return context;
};
