import express from "express";
import cors from "cors";
import {
  concurrencyLimiter,
  requestRateLimiter,
} from "./middleware/rateLimiter.middleware.js";
const app = express();
import routes from "./features/index.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Reject requests exceeding the concurrency limit.
app.use(concurrencyLimiter);

// Reject clients exceeding 6 requests per second.
app.use(requestRateLimiter);

app.use("/api/v1", routes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Riffly API is running",
  });
});

app.use(errorMiddleware);

export default app;
