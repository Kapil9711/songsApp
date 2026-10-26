import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes, createHash } from "node:crypto";
import config from "../config/secret.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [5, "Password must be at least 5 characters long."],
  },
  songQuality: {
    type: Number,
    enum: {
      message: "Please select a valid songQuality",
      values: [0, 1, 2, 3, 4],
    },
    default: 4,
  },
  downloadQuality: {
    type: Number,
    enum: {
      message: "Please select a valid downloadQuality",
      values: [0, 1, 2, 3, 4],
    },
    default: 4,
  },
  imageQuality: {
    type: Number,
    enum: {
      message: "Please select a valid imageQuality",
      values: [0, 1, 2],
    },
    default: 2,
  },
  isFavouritePublic: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
  },
  numberOfSongLoad: {
    type: Number,
    enum: {
      values: [40, 60, 80, 100, 200],
      message: "Select a valid number of songs to load",
    },
    default: 40,
  },
  friend: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  friendRequest: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },

  // Password reset fields
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpire: {
    type: Number,
  },
});

/**
 * Hash password before saving.
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Return a JSON Web Token.
 */
userSchema.methods.getJwtToken = function () {
  const jwtSecret = config.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: this._id.toString() }, jwtSecret, {
    expiresIn: config.JWT_EXPIRES_TIME,
  });
};

/**
 * Compare a supplied password with the stored hash.
 *
 * @param {string} enterPassword
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (enterPassword) {
  return bcrypt.compare(enterPassword, this.password);
};

/**
 * Generate a password reset token and store its hash.
 *
 * @returns {string}
 */
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = randomBytes(20).toString("hex");

  this.resetPasswordToken = createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
