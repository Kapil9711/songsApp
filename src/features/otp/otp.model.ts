import { Schema, model, Types, type InferSchemaType } from "mongoose";

export const OTP_PURPOSES = ["registration", "password_reset"] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

const otpSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: OTP_PURPOSES,
      required: true,
    },

    codeHash: {
      type: String,
      required: true,
      select: false,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Efficiently find the latest OTP for a user and purpose.
otpSchema.index({
  userId: 1,
  purpose: 1,
  createdAt: -1,
});

export type Otp = InferSchemaType<typeof otpSchema>;

export const OtpModel = model<Otp>("Otp", otpSchema);
