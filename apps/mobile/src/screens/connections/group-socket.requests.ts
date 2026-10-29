import type { Socket } from "socket.io-client";

import { getGroupSocket } from "./socket.service";
import type { SocketResponse } from "./socket.events";

const ACK_TIMEOUT_MS = 10_000;

export class GroupSocketError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "GroupSocketError";
  }
}

export function emitWithAck<T>(event: string, payload?: unknown): Promise<T> {
  const socket: Socket | null = getGroupSocket();

  if (!socket?.connected) {
    return Promise.reject(
      new GroupSocketError(
        "Not connected to the group server",
        "SOCKET_DISCONNECTED",
      ),
    );
  }

  return new Promise<T>((resolve, reject) => {
    const callback = (
      timeoutError: Error | null,
      response?: SocketResponse<T>,
    ) => {
      if (timeoutError) {
        reject(
          new GroupSocketError(
            "The server did not respond in time",
            "ACK_TIMEOUT",
          ),
        );
        return;
      }

      if (!response) {
        reject(
          new GroupSocketError(
            "The server returned an empty response",
            "EMPTY_RESPONSE",
          ),
        );
        return;
      }

      if (!response.success) {
        reject(
          new GroupSocketError(
            response.error?.message ?? "Group request failed",
            response.error?.code ?? "GROUP_REQUEST_FAILED",
          ),
        );
        return;
      }

      resolve(response.data as T);
    };

    const timedSocket = socket.timeout(ACK_TIMEOUT_MS);

    if (payload === undefined) {
      timedSocket.emit(event, callback);
    } else {
      timedSocket.emit(event, payload, callback);
    }
  });
}
