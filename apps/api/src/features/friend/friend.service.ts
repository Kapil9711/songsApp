import mongoose from "mongoose";

import { AppError } from "../../helper/app-error.js";
import { FriendModel } from "./friend.model.js";

export class FriendService {
  // Send a friend request.
  static async sendRequest(senderId: string, receiverId: string) {
    if (
      !mongoose.isValidObjectId(senderId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      throw new AppError(400, "Invalid user ID");
    }

    if (senderId === receiverId) {
      throw new AppError(400, "You cannot send a friend request to yourself");
    }

    const existing = await FriendModel.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existing) {
      if (existing.status === "accepted") {
        throw new AppError(400, "You are already friends");
      }

      if (existing.status === "pending") {
        throw new AppError(400, "A friend request already exists");
      }

      // Reuse a rejected request instead of creating a duplicate pair.
      existing.senderId = new mongoose.Types.ObjectId(senderId);
      existing.receiverId = new mongoose.Types.ObjectId(receiverId);
      existing.status = "pending";

      await existing.save();

      return existing;
    }

    try {
      return await FriendModel.create({
        senderId,
        receiverId,
        status: "pending",
      });
    } catch (error) {
      if (
        error instanceof mongoose.mongo.MongoServerError &&
        error.code === 11000
      ) {
        throw new AppError(400, "A friend request already exists");
      }

      throw error;
    }
  }

  // Get pending requests received by the user.
  static async getReceivedRequests(userId: string) {
    return FriendModel.find({
      receiverId: userId,
      status: "pending",
    })
      .populate("senderId", "name image")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Get pending requests sent by the user.
  static async getSentRequests(userId: string) {
    return FriendModel.find({
      senderId: userId,
      status: "pending",
    })
      .populate("receiverId", "name image")
      .sort({ createdAt: -1 })
      .lean();
  }

  // Accept a request.
  static async acceptRequest(requestId: string, userId: string) {
    if (!mongoose.isValidObjectId(requestId)) {
      throw new AppError(400, "Invalid request ID");
    }

    const request = await FriendModel.findOneAndUpdate(
      {
        _id: requestId,
        receiverId: userId,
        status: "pending",
      },
      {
        $set: { status: "accepted" },
      },
      { new: true, runValidators: true },
    );

    if (!request) {
      throw new AppError(
        404,
        "Pending friend request not found or you cannot accept it",
      );
    }

    return request;
  }

  // Reject a request.
  static async rejectRequest(requestId: string, userId: string) {
    if (!mongoose.isValidObjectId(requestId)) {
      throw new AppError(400, "Invalid request ID");
    }

    const request = await FriendModel.findOneAndUpdate(
      {
        _id: requestId,
        receiverId: userId,
        status: "pending",
      },
      {
        $set: { status: "rejected" },
      },
      { new: true, runValidators: true },
    );

    if (!request) {
      throw new AppError(
        404,
        "Pending friend request not found or you cannot reject it",
      );
    }

    return request;
  }

  // Cancel a request sent by the authenticated user.
  static async cancelRequest(requestId: string, userId: string) {
    if (!mongoose.isValidObjectId(requestId)) {
      throw new AppError(400, "Invalid request ID");
    }

    const request = await FriendModel.findOneAndDelete({
      _id: requestId,
      senderId: userId,
      status: "pending",
    });

    if (!request) {
      throw new AppError(404, "Pending sent request not found");
    }

    return request;
  }

  // Get accepted friends.
  static async getFriends(userId: string) {
    const friendships = await FriendModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "accepted",
    })
      .populate("senderId", "name image")
      .populate("receiverId", "name image")
      .sort({ updatedAt: -1 })
      .lean();

    return friendships.map((friendship) => ({
      friendshipId: friendship._id,
      friend:
        String(friendship.senderId._id) === userId
          ? friendship.receiverId
          : friendship.senderId,
      createdAt: friendship.createdAt,
    }));
  }

  // Remove an accepted friend.
  static async removeFriend(userId: string, friendId: string) {
    if (!mongoose.isValidObjectId(friendId)) {
      throw new AppError(400, "Invalid user ID");
    }

    if (userId === friendId) {
      throw new AppError(400, "You cannot remove yourself");
    }

    const friendship = await FriendModel.findOneAndDelete({
      status: "accepted",
      $or: [
        { senderId: userId, receiverId: friendId },
        { senderId: friendId, receiverId: userId },
      ],
    });

    if (!friendship) {
      throw new AppError(404, "Friendship not found");
    }

    return friendship;
  }
}
