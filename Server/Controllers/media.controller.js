import { v2 as cloudinary } from "cloudinary";
import Post from "../Models/media.model.js";
import { getDataUri } from "../Middleware/BufferFile.js";
import User from "../Models/user.model.js";
import Comment from "../Models/comment.model.js";
import path from "path";
import fs from "fs";
import { v4 as uuid } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import Music from "../Models/music.model.js";
import { log } from "console";

cloudinary.config({
  api_key: process.env.API_KEY,
  cloud_name: process.env.CLOUD_NAME,
  api_secret: process.env.API_SECRET,
});
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const generateVideoThumbnail = async (buffer, originalName) => {
  const tempVideoPath = `./temp/${uuid()}-${originalName}`;
  fs.writeFileSync(tempVideoPath, buffer);

  const thumbnailPath = `./temp/${uuid()}.png`;
  return new Promise((resolve, reject) => {
    ffmpeg(tempVideoPath)
      .on("end", () => {
        fs.unlinkSync(tempVideoPath);
        resolve(thumbnailPath);
      })
      .on("error", (err) => {
        fs.unlinkSync(tempVideoPath);
        reject(err);
      })
      .screenshots({
        timestamps: ["2"],
        filename: path.basename(thumbnailPath),
        folder: path.dirname(thumbnailPath),
        size: "320x240",
      });
  });
};
export const uploads = async (req, res) => {
  try {
    const myId = req.user.existingUser._id;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (files.length > 1) {
      return res
        .status(400)
        .json({ message: "Only one file is allowed per upload" });
    }

    const { name, caption } = req.body;
    if (!name || !caption) {
      return res.status(400).json({
        message: "Missing required fields (name, caption)",
      });
    }
    const fileExtensions = {
      image: [
        ".jpeg",
        ".jpg",
        ".png",
        ".gif",
        ".bmp",
        ".tiff",
        ".tif",
        ".webp",
        ".heif",
        ".heic",
        ".svg",
      ],
      video: [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".flv", ".webm"],
      audio: [".mp3", ".aac", ".ogg", ".oga", ".wma"],
    };

    const file = files[0];
    const ext = path.extname(file.originalname).toLowerCase();

    const type = Object.entries(fileExtensions).find(([_, exts]) =>
      exts.includes(ext)
    )?.[0];

    if (!type) {
      return res
        .status(400)
        .json({ message: `Unsupported file extension: ${ext}` });
    }

    const fileUri = getDataUri(file);
    const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: "auto",
    });

    let thumbnailUrl = [];

    if (type === "video") {
      const thumbPath = await generateVideoThumbnail(
        file.buffer,
        file.originalname
      );

      const thumbUpload = await cloudinary.uploader.upload(thumbPath, {
        resource_type: "image",
      });

      thumbnailUrl.push(thumbUpload.secure_url);
      fs.unlinkSync(thumbPath);
    }

    if (type === "image") {
      thumbnailUrl.push(uploadResult.secure_url);
    }

    const media = new Post({
      name,
      caption,
      author: myId,
      media: [uploadResult.secure_url],
      type,
      thumbnailUrl,
    });

    await media.save();

    await User.findByIdAndUpdate(myId, {
      $push: { posts: media._id },
    });

    res.status(200).send({
      message: "Upload successful",
      path: uploadResult.secure_url,
      media,
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

export const getMediaByAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;

    const posts = await Post.find({ author: authorId });

    if (!posts || posts.length === 0) {
      return res
        .status(404)
        .json({ message: "No posts found for this author" });
    }

    return res.status(200).json({
      posts,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching posts", error: err.message });
  }
};

export const fetchFiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

    const total = await Post.countDocuments();
    const allData = await Post.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: allData,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const countPostsByAuthor = async (req, res) => {
  const authorId = req.params.id;

  try {
    const postCount = await Post.countDocuments({ author: authorId });

    return res.status(200).json({
      message: "Post count fetched successfully",
      totalPosts: postCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching post count",
      error,
    });
  }
};

export const likePost = async (req, res) => {
  const myId = req.user.existingUser._id;
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const isLiked = post.likes.includes(myId);

    if (isLiked) {
      post.likes.pull(myId);
      await post.save();
      res.status(200).json({ message: "Remove liked" });
    } else {
      post.likes.push(myId);
      await post.save();
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.log(error);
  }
};

export const countLikes = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({
      count: {
        likes: post.likes.length,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const postComment = async (req, res) => {
  const myId = req.user.existingUser._id;
  const postId = req.params.id;
  const { content } = req.body;
  try {
    const post = await Post.findById(postId);
    console.log(post);
    if (!post) {
      res.status(404).json("not found");
    }
    const comment = await Comment.create({
      author: myId,
      content: content,
      media: postId,
    });
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
    console.log(post);
  } catch (error) {
    console.log(error);
  }
};
export const getCommnet = async (req, res) => {
  const postId = req.params.id;
  try {
    const comments = await Comment.find({ media: postId })
      .populate("author")
      .sort({ createdAt: 1 });

    if (!comments || comments.length === 0) {
      return res.status(404).json({ message: "No comments found" });
    }

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};
export const uploadMusic = async (req, res) => {
  const myId = req.user.existingUser._id;
  const file = req.file;
  try {
    if (!file) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { name, singer } = req.body;
    if (!name || !singer) {
      return res.status(422).json({ message: "Missing name or singer field" });
    }

    const fileUri = getDataUri(file);
    if (!fileUri || !fileUri.content) {
      return res.status(400).json({ message: "Failed to get file URI" });
    }

    const uploadedFile = await cloudinary.uploader.upload(fileUri.content, {
      resource_type: "auto",
    });

    const media = new Music({
      name,
      singer,
      media: uploadedFile.secure_url,
      author: myId,
    });
    await media.save();
    await User.findByIdAndUpdate(myId, {
      $push: { posts: media._id },
    });
    console.log(media);
    return res.status(201).json({ message: "Upload successful", media });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getAllMusic = async (req, res) => {
  try {
    const musics = await Music.find()
      .populate("author")
      .sort({ createdAt: -1 });
    console.log("Fetched all music:", musics);
    res.status(200).json(musics);
  } catch (error) {
    console.error("Error fetching music:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMusicByAuthor = async (req, res) => {
  try {
    const authorId = req.params.id;

    const musics = await Music.find({ author: authorId }).populate(
      "author",
      "name username profile"
    );

    if (!musics || musics.length === 0) {
      return res
        .status(404)
        .json({ message: "No music found for this author" });
    }

    return res.status(200).json({
      musics,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error fetching music", error: err.message });
  }
};
export const viewsCalculate = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await Post.findById(postId);
    console.log(post.views);
    if (!post) {
      res.status(404).json(" post Not Found");
    }
    post.views = post.views + 1;
    await post.save();

    res.status(200).json({ message: `total views ${post.views}` });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
export const trending = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingData = await Post.find({
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1 })
      .limit(10);

    console.log(trendingData);
    res.status(200).json(trendingData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const getMusic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Music.countDocuments();
    const allData = await Music.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: allData,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getImage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({ type: "image" });
    const allData = await Post.find({ type: "image" })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: allData,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVideo = async (req, res) => {
  try {
    const isRandom = req.query.random === "true";
    const limit = parseInt(req.query.limit) || 5;

    if (isRandom) {
      const randomVideos = await Post.aggregate([
        { $match: { type: "video" } },
        { $sample: { size: limit } },
      ]);

      return res.status(200).json({
        data: randomVideos,
        total: randomVideos.length,
        random: true,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({ type: "video" });

    const allData = await Post.aggregate([
      { $match: { type: "video" } },
      { $sample: { size: total } }, // shuffle all videos
      { $skip: skip },
      { $limit: limit },
    ]);

    const populatedData = await Post.populate(allData, { path: "author" });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data: populatedData,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

