import type { Request } from "express";

export function assertAuthenticated(
  req: Request,
): asserts req is Request & { userId: string } {
  if (!req.userId) {
    throw new Error("Authentication required");
  }
}
