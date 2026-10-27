import { Router } from "express";

import * as userController from "./user.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { userIdExist } from "../../middleware/userIdExist.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { registerUserSchema } from "./user.validation.js";
import {
  resendOtpEmailLimiter,
  resendOtpIpLimiter,
} from "../../middleware/rateLimiter.middleware.js";

const router = Router();

// public routes
router.post(
  "/register",
  validateBody(registerUserSchema),
  userController.register,
);
router.post("/verify-otp", userController.verifyOtp);
router.post(
  "/resend-otp",
  //   resendOtpIpLimiter,
  //   resendOtpEmailLimiter,
  userController.resendOtp,
);
router.post("/login", userController.login);

// Protected routes
router.get("/me", authenticate, userIdExist, userController.getMe);
router.patch("/me", authenticate, userIdExist, userController.updateMe);
router.patch(
  "/me/password",
  authenticate,
  userIdExist,
  userController.changePassword,
);
router.delete("/me", authenticate, userIdExist, userController.deleteMe);

export default router;
