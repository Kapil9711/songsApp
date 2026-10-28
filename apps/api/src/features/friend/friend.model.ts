import mongoose, { InferSchemaType, model } from "mongoose";

const friendSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Find requests sent by a user.
friendSchema.index({ senderId: 1, status: 1, createdAt: -1 });

// Find requests received by a user.
friendSchema.index({ receiverId: 1, status: 1, createdAt: -1 });

// Prevent duplicate requests in the same direction.
friendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export type Friend = InferSchemaType<typeof friendSchema>;

export const FriendModel = model<Friend>("Friend", friendSchema);
