import mongoose, { InferSchemaType, model } from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  },
);

export type Favorite = InferSchemaType<typeof favoriteSchema>;

export const FavoriteModel = model<Favorite>("Favorite", favoriteSchema);

// Supports fetching a user's favorites, newest first.
favoriteSchema.index({ userId: 1, createdAt: -1 });

// Prevents duplicate favorites for the same user and song.
favoriteSchema.index({ userId: 1, songId: 1 }, { unique: true });
