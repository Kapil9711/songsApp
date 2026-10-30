import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

interface AccessTokenPayload {
  sub: string;
}

export function authenticateSocket(
  socket: Socket,
  next: (err?: Error) => void,
): void {
  const token = socket.handshake.auth?.token as string | undefined;

  const secret = process.env.JWT_SECRET;

  if (!token) {
    next(new Error("Authentication required"));
    return;
  }

  if (!secret) {
    next(new Error("JWT_SECRET is not configured"));
    return;
  }

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !mongoose.isValidObjectId(payload.sub)
    ) {
      next(new Error("Invalid access token"));
      return;
    }

    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid or expired access token"));
  }
}
