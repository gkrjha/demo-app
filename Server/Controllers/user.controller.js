import cloudinary from "cloudinary";
import express, { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../Models/user.model.js";
import JWT from "jsonwebtoken";
export const userRoute = Router();
import donent from "dotenv";
import isAuthenticated from "../Middleware/IsAuthenticate.js";
import { upload } from "../utils/multer.js";
import { getDataUri } from "../Middleware/BufferFile.js";
import Post from "../Models/media.model.js";
donent.config();

export const signup = async (req, res) => {
  try {
    const file = req.file;
    let profileUri = "";
    if (file) {
      const fileUri = getDataUri(file);
      console.log(fileUri.content);
      const fileUpload = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "auto",
      });
      profileUri = fileUpload.secure_url;
    }
    const { username, email, password, name, profile, bio, gender } = req.body;

    if (!username || !email || !password || !name || !gender || !profileUri) {
      return res.status(400).json({ message: "Each field is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(402).json({ message: "User already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      profile: profileUri,
      bio,
      gender,
    });
    
    await newUser.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        username,
        email,
        name,
        bio,
        gender,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: username }],
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    if (!existingUser.password) {
      return res
        .status(500)
        .json({ message: "Password not found in database" });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = JWT.sign({ existingUser }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      existingUser,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};



export const getother = async (req, res) => {
  try {
    const loggedInUserId = req.user.existingUser._id;
    const otherUsers = await User.find({ _id: { $ne: loggedInUserId } }).select(
      "-password"
    );
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.log(error);
  }
};


export const update = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const { id } = req.params;
    const file = req.file;

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (file) {
      const fileUri = getDataUri(file);
      const fileUpload = await cloudinary.uploader.upload(fileUri.content, {
        resource_type: "auto",
      });
      existingUser.profile = fileUpload.secure_url;
    }

    if (name) existingUser.name = name;
    if (bio) existingUser.bio = bio;

    await existingUser.save();
    console.log(existingUser);
    return res.status(200).json({
      message: "User updated successfully",
      existingUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



export const getuser = async (req, res) => {
  const id = req.user.existingUser._id;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(201).json({ message: "User found", user });
};

export const getOtherByid = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id).select("-password").select("-username");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(201).json({ message: "User found", user });
};

export const toggleFollow = async (req, res) => {
  const myId = req.user.existingUser._id;
  const userId = req.params.id;

  try {
    const me = await User.findById(myId);
    const otherUser = await User.findById(userId);
    if (myId === userId) {
      return res.status(404).json({ message: "You Cant Follow yourSelf" });
    }

    if (!otherUser) return res.status(404).json({ message: "User not found" });

    const isFollowing = me.following.includes(userId);

    if (isFollowing) {
      me.following.pull(userId);
      otherUser.followers.pull(myId);
    } else {
      me.following.push(userId);
      otherUser.followers.push(myId);
    }

    await me.save();
    await otherUser.save();

    return res.status(200).json({
      message: isFollowing ? "Unfollowed user" : "Followed user",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const toggleFavorite = async (req, res) => {
  const userId = req.user.existingUser._id;
  const postId = req.params.id;
  console.log(postId, userId);

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isFavorited = user.favorite.includes(postId);

    if (isFavorited) {
      user.favorite.pull(postId);
    } else {
      user.favorite.push(postId);
    }

    await user.save();

    return res.status(200).json({
      message: isFavorited ? "Removed from favorites" : "Added to favorites",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getSocials = async (req, res) => {
  const id = req.user.existingUser._id;

  try {
    const user = await User.findById(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      following: user?.following,
      follower: user?.followers,
      count: {
        followers: user.followers.length,
        following: user.following.length,
        favorites: user.favorite.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const userId = req.user.existingUser._id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.followers) || user.followers.length === 0) {
      return res
        .status(200)
        .json({ followers: [], message: "No followers found" });
    }

    const followersDetails = await User.find({ _id: { $in: user.followers } })
      .select("-password -username -email -bio") // Modify fields as needed
      .lean();

    return res.status(200).json({ followers: followersDetails });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getFolloweing = async (req, res) => {
  try {
    const userId = req.user.existingUser._id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.following) || user.following.length === 0) {
      return res
        .status(200)
        .json({ following: [], message: "No following found" });
    }

    const followingDetails = await User.find({ _id: { $in: user.following } })
      .select("-password -username -email -bio")
      .lean();

    return res.status(200).json({ following: followingDetails });
  } catch (error) {
    console.error("Error fetching following:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getFolloweingById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.following) || user.following.length === 0) {
      return res
        .status(200)
        .json({ following: [], message: "No following found" });
    }

    const followingDetails = await User.find({ _id: { $in: user.following } })
      .select("-password -username -email -bio")
      .lean();

    return res.status(200).json({ following: followingDetails });
  } catch (error) {
    console.error("Error fetching following:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getFollowerById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.followers) || user.followers.length === 0) {
      return res
        .status(200)
        .json({ followers: [], message: "No followers found" });
    }

    const followersDetails = await User.find({ _id: { $in: user.followers } })
      .select("-password -username -email -bio")
      .lean();

    return res.status(200).json({ followers: followersDetails });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
