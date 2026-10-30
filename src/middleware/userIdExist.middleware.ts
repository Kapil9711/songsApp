import type { Request, Response, NextFunction } from "express";

export function userIdExist(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
