import type { Request, Response, NextFunction } from "express";
import { FriendService } from "./friend.service.js";
import { AppError } from "../../helper/app-error.js";
import { assertAuthenticated } from "../../helper/assertAuthenticated.js";

function getUserId(req: Request): string {
  assertAuthenticated(req);
  const userId = req.userId;

  if (!userId) {
    throw new AppError(401, "Authentication required");
  }

  return userId;
}

export class FriendController {
  static async sendRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = getUserId(req);
      const { userId: receiverId }: any = req.params;

      const request = await FriendService.sendRequest(senderId, receiverId);

      res.status(201).json({
        success: true,
        message: "Friend request sent successfully",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getReceivedRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = getUserId(req);

      const requests = await FriendService.getReceivedRequests(userId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSentRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = getUserId(req);

      const requests = await FriendService.getSentRequests(userId);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { requestId }: any = req.params;

      const request = await FriendService.acceptRequest(requestId, userId);

      res.status(200).json({
        success: true,
        message: "Friend request accepted",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { requestId }: any = req.params;

      const request = await FriendService.rejectRequest(requestId, userId);

      res.status(200).json({
        success: true,
        message: "Friend request rejected",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { requestId }: any = req.params;

      const request = await FriendService.cancelRequest(requestId, userId);

      res.status(200).json({
        success: true,
        message: "Friend request cancelled",
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFriends(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);

      const friends = await FriendService.getFriends(userId);

      res.status(200).json({
        success: true,
        data: friends,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFriend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      const { userId: friendId }: any = req.params;

      const friendship = await FriendService.removeFriend(userId, friendId);

      res.status(200).json({
        success: true,
        message: "Friend removed successfully",
        data: friendship,
      });
    } catch (error) {
      next(error);
    }
  }
}
