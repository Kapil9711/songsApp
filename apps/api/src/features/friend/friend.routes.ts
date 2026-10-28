import { Router } from "express";

import { FriendController } from "./friend.controller.js";

import {
  friendUserParamsSchema,
  friendRequestParamsSchema,
} from "./friend.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validateParams } from "../../middleware/validate.middleware.js";

const router = Router();

// All friend routes require authentication.
router.use(authenticate);

// Friend requests
router.post(
  "/requests/:userId",
  validateParams(friendUserParamsSchema),
  FriendController.sendRequest,
);

router.get("/requests/received", FriendController.getReceivedRequests);

router.get("/requests/sent", FriendController.getSentRequests);

router.patch(
  "/requests/:requestId/accept",
  validateParams(friendRequestParamsSchema),
  FriendController.acceptRequest,
);

router.patch(
  "/requests/:requestId/reject",
  validateParams(friendRequestParamsSchema),
  FriendController.rejectRequest,
);

router.delete(
  "/requests/:requestId",
  validateParams(friendRequestParamsSchema),
  FriendController.cancelRequest,
);

// Accepted friendships
router.get("/", FriendController.getFriends);

router.delete(
  "/:userId",
  validateParams(friendUserParamsSchema),
  FriendController.removeFriend,
);

export default router;
