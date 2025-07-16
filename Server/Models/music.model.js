import mongoose from "mongoose";

const MusicSchem = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    singer: [
      {
        type: String,
        required: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    media: { type: String },
  },
  { timestamps: true }
);

const Music = mongoose.model("Music", MusicSchem);

export default Music;
