import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "./api";

// Query keys
export const FriendQueryKeys = {
  all: ["friends"] as const,

  friends: ["friends", "list"] as const,

  requests: ["friends", "requests"] as const,

  receivedRequests: ["friends", "requests", "received"] as const,

  sentRequests: ["friends", "requests", "sent"] as const,
};

// Get accepted friends
export const useGetFriendsQuery = () => {
  return useQuery({
    queryKey: FriendQueryKeys.friends,
    queryFn: getFriends,
  });
};

// Get received friend requests
export const useGetReceivedFriendRequestsQuery = () => {
  return useQuery({
    queryKey: FriendQueryKeys.receivedRequests,
    queryFn: getReceivedFriendRequests,
  });
};

// Get sent friend requests
export const useGetSentFriendRequestsQuery = () => {
  return useQuery({
    queryKey: FriendQueryKeys.sentRequests,
    queryFn: getSentFriendRequests,
  });
};

// Send a friend request
export const useSendFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.sentRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.receivedRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.friends,
        }),
      ]);
    },
  });
};

// Accept a friend request
export const useAcceptFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptFriendRequest,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.receivedRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.sentRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.friends,
        }),
      ]);
    },
  });
};

// Reject a friend request
export const useRejectFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectFriendRequest,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.receivedRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.sentRequests,
        }),
      ]);
    },
  });
};

// Cancel a sent friend request
export const useCancelFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelFriendRequest,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.sentRequests,
        }),
        queryClient.invalidateQueries({
          queryKey: FriendQueryKeys.receivedRequests,
        }),
      ]);
    },
  });
};

// Remove an accepted friend
export const useRemoveFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: FriendQueryKeys.friends,
      });
    },
  });
};
