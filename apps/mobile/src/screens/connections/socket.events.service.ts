import type { Socket } from "socket.io-client";

import { getGroupSocket } from "./socket.service";
import { ConnectionEvents } from "./socket.events";

type ServerEvent =
  | typeof ConnectionEvents.GROUP_CREATED
  | typeof ConnectionEvents.GROUP_UPDATED
  | typeof ConnectionEvents.GROUP_INVITATION
  | typeof ConnectionEvents.INVITATION_CANCELLED
  | typeof ConnectionEvents.INVITATION_REJECTED
  | typeof ConnectionEvents.GROUP_MEMBER_JOINED
  | typeof ConnectionEvents.GROUP_MEMBER_LEFT
  | typeof ConnectionEvents.GROUP_PERMISSION_UPDATED
  | typeof ConnectionEvents.GROUP_DESTROYED
  | typeof ConnectionEvents.ERROR;

export function emitGroupEvent<TPayload>(
  event: string,
  payload?: TPayload,
): void {
  const socket = getGroupSocket();

  if (!socket?.connected) {
    console.warn(`[GroupSocket] Cannot emit "${event}": socket disconnected`);
    return;
  }

  if (payload === undefined) {
    socket.emit(event);
  } else {
    socket.emit(event, payload);
  }
}

export function subscribeToGroupEvent<TPayload = unknown>(
  event: ServerEvent,
  listener: (payload: TPayload) => void,
): () => void {
  const socket: Socket | null = getGroupSocket();

  if (!socket) {
    console.warn(
      `[GroupSocket] Cannot subscribe to "${event}": socket not initialized`,
    );

    return () => {};
  }

  socket.on(event, listener);

  // Return a cleanup function for useEffect.
  return () => {
    socket.off(event, listener);
  };
}
