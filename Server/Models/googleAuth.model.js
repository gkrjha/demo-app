import mongoose from "mongoose";
import User from "./user.model";
const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: String,
    profilePicture: String,
    bio: String,
    gender: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    role: {
      type: String,
      enum: ["admin", "verified", "standard"],
      default: "standard",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
