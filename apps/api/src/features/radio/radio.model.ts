import mongoose, { InferSchemaType, model } from "mongoose";

const radioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    songId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: [{ quality: String, url: String }],
      required: true,
    },
    downloadUrl: {
      type: [{ quality: String, url: String }],
      required: true,
    },
    artist: {
      type: String,
    },
    radioType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Radio = InferSchemaType<typeof radioSchema>;

export const RadioModal = model<Radio>("Radio", radioSchema);

// Supports fetching a user's favorites, newest first.
radioSchema.index({ userId: 1, createdAt: -1 });

// Prevents duplicate favorites for the same user and song.
radioSchema.index({ userId: 1, songId: 1 }, { unique: true });
