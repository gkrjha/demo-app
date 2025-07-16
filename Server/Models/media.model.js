import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    name: { type: String },
    caption: { type: String, default: "" },
    media: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    type: {
      type: String,
      enum: ["image", "video"],
    },
    thumbnailUrl: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
  },

  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
