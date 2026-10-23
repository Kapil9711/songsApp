import mongoose from "mongoose";

const MAX_CONNECT_ATTEMPTS = 5;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  for (let attempt = 1; attempt <= MAX_CONNECT_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(uri, {
        // Connection pool
        maxPoolSize: 10,
        minPoolSize: 0,
        maxIdleTimeMS: 30_000,
        maxConnecting: 2,
        waitQueueTimeoutMS: 2_000,

        // Connection timeouts
        connectTimeoutMS: 10_000,
        serverSelectionTimeoutMS: 5_000,

        // Avoid automatic index creation in production
        autoIndex: process.env.NODE_ENV !== "production",
      });

      console.log("MongoDB connected successfully");
      break;
    } catch (error: unknown) {
      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed`,
        error,
      );

      if (attempt === MAX_CONNECT_ATTEMPTS) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s
      const delay = 1_000 * 2 ** (attempt - 1);
      await sleep(delay);
    }
  }
}

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

mongoose.connection.on("error", (error: Error) => {
  console.error("MongoDB connection error:", error.message);
});
