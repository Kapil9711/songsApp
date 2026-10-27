import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { AppError } from "../helper/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (
  error: unknown,
  req,
  res,
  _next,
) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: { field: string; message: string }[] | undefined;

  // Application errors intentionally thrown by your code
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  // Mongoose schema validation errors
  else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";

    errors = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // Invalid MongoDB ObjectId or failed type casting
  else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  }

  // MongoDB duplicate-key error (e.g. duplicate email)
  else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = "A record with this value already exists";
  } else if (error instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Authentication token has expired";
  } else if (error instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  // Malformed JSON sent to express.json()
  else if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  ) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  // Log the full error internally for debugging
  console.error("API error:", {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    error,
  });

  // Return a consistent API response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(error instanceof AppError && error.details !== undefined
      ? { errors: error.details }
      : {}),
  });
};
