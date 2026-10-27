import type { Request, Response, NextFunction } from "express";
import { rateLimit } from "express-rate-limit";

/**
 * Maximum 6 requests per second per client IP.
 *
 * Requests exceeding this limit receive HTTP 429.
 */
export const requestRateLimiter = rateLimit({
  windowMs: 1000,
  limit: 6,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },

  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests. Maximum 6 requests per second allowed.",
    });
  },
});

/**
 * Maximum 50 requests being processed simultaneously.
 */
let activeRequests = 0;

const MAX_CONCURRENT_REQUESTS = 50;

export const concurrencyLimiter = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    res.setHeader("Retry-After", "1");
    res.status(503).json({
      success: false,
      message: "Server is busy. Please try again later.",
    });
    return;
  }
  activeRequests++;
  let released = false;
  const release = () => {
    if (released) return;

    released = true;
    activeRequests--;
  };
  res.once("finish", release);
  res.once("close", release);
  next();
};

// Limit all OTP resend requests from the same IP.
export const resendOtpIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again later.",
  },
});

// Limit OTP resend requests for the same email.
export const resendOtpEmailLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 1,
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    // Invalid or missing emails share a bucket; body validation
    // should reject these requests before this limiter runs.
    return email || "invalid-email";
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Please wait 60 seconds before requesting another OTP.",
  },
});
