import { usePlayerProgressStore } from "@/store/player.progress.store";

export function usePlayerProgress() {
  const position = usePlayerProgressStore((state) => state.position);
  const duration = usePlayerProgressStore((state) => state.duration);
  const buffered = usePlayerProgressStore((state) => state.buffered);

  return { position, duration, buffered };
}
