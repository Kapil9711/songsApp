import { useAuthStore } from "@/store/auth.store";
import { useSyncSocketStore } from "@/store/socket.store";
import { useEffect } from "react";

export function SyncSocketInitializer() {
  const userId = useAuthStore((state) => state.user?._id);
  const connect = useSyncSocketStore((state) => state.connect);
  const disconnect = useSyncSocketStore((state) => state.disconnect);

  useEffect(() => {
    if (userId) {
      connect(userId);
    } else {
      disconnect();
    }
  }, [userId, connect, disconnect]);

  return null;
}
