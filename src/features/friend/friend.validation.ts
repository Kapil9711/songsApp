import { z } from "zod";

export const friendUserParamsSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user ID"),
});

export const friendRequestParamsSchema = z.object({
  requestId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid request ID"),
});

export type FriendUserParams = z.infer<typeof friendUserParamsSchema>;
export type FriendRequestParams = z.infer<typeof friendRequestParamsSchema>;
