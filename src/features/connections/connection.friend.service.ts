import mongoose from "mongoose";
import { FriendModel } from "../friend/friend.model.js";

export async function areFriends(
  userId: string,
  friendId: string,
): Promise<boolean> {
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(friendId)
  ) {
    return false;
  }

  const friendship = await FriendModel.exists({
    status: "accepted",
    $or: [
      { senderId: userId, receiverId: friendId },
      { senderId: friendId, receiverId: userId },
    ],
  });

  return friendship !== null;
}

export async function getFriendIds(userId: string): Promise<string[]> {
  if (!mongoose.isValidObjectId(userId)) {
    return [];
  }

  const friendships = await FriendModel.find({
    status: "accepted",
    $or: [{ senderId: userId }, { receiverId: userId }],
  })
    .select("senderId receiverId")
    .lean();

  return friendships.map((friendship) => {
    const senderId = friendship.senderId.toString();
    const receiverId = friendship.receiverId.toString();

    return senderId === userId ? receiverId : senderId;
  });
}
