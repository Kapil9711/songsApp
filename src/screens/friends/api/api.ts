import { api } from "@/config/network/api.config";
import { endpoints } from "@/config/network/endpoints";

// Types

export type FriendUser = {
  _id: string;
  name: string;
  image?: string | null;
};

export type FriendRequest = {
  _id: string;
  senderId: FriendUser | string;
  receiverId: FriendUser | string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: string;
  updatedAt?: string;
};

export type Friend = {
  friendshipId: string;
  friend: FriendUser;
  createdAt?: string;
};

// Send a friend request
export const sendFriendRequest = async (userId: string) => {
  const { data } = await api.post(
    `${endpoints.api.friends.requests}/${userId}`,
  );

  return data;
};

// Get received friend requests
export const getReceivedFriendRequests = async () => {
  const { data } = await api.get(endpoints.api.friends.receivedRequests);

  return data;
};

// Get sent friend requests
export const getSentFriendRequests = async () => {
  const { data } = await api.get(endpoints.api.friends.sentRequests);

  return data;
};

// Accept a friend request
export const acceptFriendRequest = async (requestId: string) => {
  const { data } = await api.patch(
    `${endpoints.api.friends.requests}/${requestId}/accept`,
  );

  return data;
};

// Reject a friend request
export const rejectFriendRequest = async (requestId: string) => {
  const { data } = await api.patch(
    `${endpoints.api.friends.requests}/${requestId}/reject`,
  );

  return data;
};

// Cancel a sent friend request
export const cancelFriendRequest = async (requestId: string) => {
  const { data } = await api.delete(
    `${endpoints.api.friends.requests}/${requestId}`,
  );

  return data;
};

// Get accepted friends
export const getFriends = async () => {
  const { data } = await api.get(endpoints.api.friends.friends);

  return data;
};

// Remove an accepted friend
export const removeFriend = async (userId: string) => {
  const { data } = await api.delete(
    `${endpoints.api.friends.friends}/${userId}`,
  );

  return data;
};
