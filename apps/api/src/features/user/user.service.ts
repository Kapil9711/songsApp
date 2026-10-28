import argon2 from "argon2";
import { createHash, randomInt } from "node:crypto";
import jwt from "jsonwebtoken";

// import { sendOtpEmail } from "../../services/email.service.js";
import { OtpModel, OtpPurpose } from "../otp/otp.model.js";
import { UserModel } from "./user.model.js";
import { sendRegistrationOtpEmail } from "../../services/otp-email.service.js";
import { AppError } from "../../helper/app-error.js";

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function hashOtp(userId: string, purpose: OtpPurpose, otp: string) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new AppError(400, "OTP_SECRET is not configured");
  }

  return createHash("sha256")
    .update(`${secret}:${userId}:${purpose}:${otp}`)
    .digest("hex");
}

function generateOtp(): string {
  return randomInt(100000, 1000000).toString();
}

function createAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(400, "JWT_SECRET is not configured");
  }
  const expireTime: any = process.env.JWT_EXPIRES_TIME || "30d";
  return jwt.sign({ sub: userId }, secret, {
    expiresIn: expireTime,
  });
}

async function issueOtp(
  userName: string,
  userId: string,
  email: string,
  purpose: OtpPurpose,
): Promise<void> {
  const latestOtp = await OtpModel.findOne({
    userId,
    purpose,
  }).sort({ createdAt: -1 });

  if (
    latestOtp &&
    Date.now() - latestOtp.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS
  ) {
    throw new AppError(400, "Please wait before requesting another OTP");
  }

  const otp = generateOtp();

  // Invalidate older OTPs before issuing a new one.
  await OtpModel.deleteMany({ userId, purpose });

  await OtpModel.create({
    userId,
    purpose,
    codeHash: hashOtp(userId, purpose, otp),
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    attempts: 0,
  });

  try {
    if (purpose == "registration") {
      await sendRegistrationOtpEmail(email, otp, userName);
    }
  } catch (error) {
    // Do not leave a usable OTP behind if email delivery fails.
    await OtpModel.deleteMany({
      userId,
      purpose,
    });

    throw error;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const email = input.email.trim().toLowerCase();

  const existingUser = await UserModel.findOne({ email });

  if (existingUser?.isVerified) {
    throw new AppError(400, "An account with this email already exists");
  }

  let userId: string;

  if (existingUser) {
    // Allow an unverified account to request registration again.
    userId = existingUser._id.toString();
  } else {
    const passwordHash = await argon2.hash(input.password);

    const user = await UserModel.create({
      name: input.name,
      email,
      password: passwordHash,
      isVerified: false,
      isFavoritePublic: false,
    });

    userId = user._id.toString();
  }

  const name = existingUser?.name || input.name;

  await issueOtp(name, userId, email, "registration");

  return {
    userId,
    email,
    message: "OTP sent. Verify your email to activate your account.",
  };
}

export async function verifyRegistrationOtp(input: {
  userId: string;
  otp: string;
}) {
  const purpose = "registration";
  const now = new Date();
  const otpRecord = await OtpModel.findOne({
    userId: input.userId,
    purpose,
    expiresAt: { $gt: now },
    verifiedAt: null,
    attempts: { $lt: MAX_OTP_ATTEMPTS },
  })
    .sort({ createdAt: -1 })
    .select("+codeHash");
  if (!otpRecord) {
    throw new AppError(400, "OTP is invalid, expired, or no longer available");
  }
  const expectedHash = hashOtp(input.userId, purpose, input.otp);
  if (otpRecord.codeHash !== expectedHash) {
    await OtpModel.updateOne(
      {
        _id: otpRecord._id,
        verifiedAt: null,
      },
      {
        $inc: { attempts: 1 },
      },
    );

    throw new AppError(400, "Invalid OTP");
  }
  // Atomically claim the OTP so it cannot be reused concurrently.
  const claimedOtp = await OtpModel.findOneAndUpdate(
    {
      _id: otpRecord._id,
      verifiedAt: null,
      expiresAt: { $gt: now },
      attempts: { $lt: MAX_OTP_ATTEMPTS },
    },
    {
      $set: { verifiedAt: now },
    },
    { new: true },
  );
  if (!claimedOtp) {
    throw new AppError(400, "OTP is invalid, expired, or already used");
  }
  const user = await UserModel.findOneAndUpdate(
    {
      _id: input.userId,
      isVerified: false,
    },
    {
      $set: { isVerified: true },
    },
    { new: true },
  );

  if (!user) {
    throw new AppError(400, "User not found or already verified");
  }

  return {
    userId: user._id.toString(),
    email: user.email,
    isVerified: user.isVerified,
  };
}

export async function resendRegistrationOtp(userId: string) {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(400, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(400, "Email is already verified");
  }

  await issueOtp(user.name, user._id.toString(), user.email, "registration");

  return {
    message: "A new OTP has been sent",
  };
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();

  const user = await UserModel.findOne({ email }).select("+password");

  if (!user || !(await argon2.verify(user.password, input.password))) {
    throw new AppError(400, "Invalid email or password");
  }

  if (!user.isVerified) {
    throw new AppError(400, "Please verify your email before logging in");
  }

  const accessToken = createAccessToken(user._id.toString());

  return {
    accessToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      isFavoritePublic: user.isFavoritePublic,
      isVerified: user.isVerified,
    },
  };
}

export async function getUserById(userId: string) {
  const user = await UserModel.findById(userId).lean();

  if (!user) {
    throw new AppError(400, "User not found");
  }

  if (!user.isVerified) {
    throw new AppError(400, "Email verification required");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    isFavoritePublic: user.isFavoritePublic,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export interface UpdateUserInput {
  name?: string;
  image?: string | null;
  isFavoritePublic?: boolean;
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const updates: Record<string, unknown> = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.image !== undefined) {
    updates.image = input.image;
  }

  if (input.isFavoritePublic !== undefined) {
    updates.isFavoritePublic = input.isFavoritePublic;
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, "At least one field must be provided");
  }

  const user = await UserModel.findOneAndUpdate(
    {
      _id: userId,
      isVerified: true,
    },
    {
      $set: updates,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!user) {
    throw new AppError(400, "User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image,
    isFavoritePublic: user.isFavoritePublic,
    isVerified: user.isVerified,
    updatedAt: user.updatedAt,
  };
}

export async function changeUserPassword(
  userId: string,
  input: {
    currentPassword: string;
    newPassword: string;
  },
) {
  const user = await UserModel.findOne({
    _id: userId,
    isVerified: true,
  }).select("+password");

  if (!user) {
    throw new AppError(400, "User not found");
  }

  const isCurrentPasswordValid = await argon2.verify(
    user.password,
    input.currentPassword,
  );

  if (!isCurrentPasswordValid) {
    throw new AppError(400, "Current password is incorrect");
  }

  if (input.currentPassword === input.newPassword) {
    throw new AppError(
      400,
      "New password must be different from the current password",
    );
  }

  user.password = await argon2.hash(input.newPassword);

  await user.save();

  return {
    message: "Password changed successfully",
  };
}

export async function deleteUser(userId: string) {
  const user = await UserModel.findOneAndDelete({
    _id: userId,
  });

  if (!user) {
    throw new AppError(400, "User not found");
  }

  // Remove outstanding OTPs associated with the deleted user.
  await OtpModel.deleteMany({
    userId: user._id,
  });

  return {
    message: "Account deleted successfully",
  };
}
