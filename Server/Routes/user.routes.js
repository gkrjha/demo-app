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
import {
  getFolloweing,
  getFolloweingById,
  getFollowerById,
  getFollowers,
  getOtherByid,
  getSocials,
  getother,
  getuser,
  login,
  signup,
  toggleFavorite,
  toggleFollow,
  update,
} from "../Controllers/user.controller.js";
donent.config();

userRoute.post("/signup", upload.single("profile"), signup);
userRoute.post("/login", login);
userRoute.get("/getother", isAuthenticated, getother);
userRoute.put("/update/:id", upload.single("profile"), update);
userRoute.get("/getuser/:id", isAuthenticated, getuser);
userRoute.get("/getother/:id", isAuthenticated, getOtherByid);
userRoute.put("/follow/:id", isAuthenticated, toggleFollow);
userRoute.put("/favorite/:id", isAuthenticated, toggleFavorite);
userRoute.get("/socials", isAuthenticated, getSocials);
userRoute.get("/get-follower", isAuthenticated, getFollowers);
userRoute.get("/get-followeing", isAuthenticated, getFolloweing);
userRoute.get("/get-follower/:id", isAuthenticated, getFollowerById);
userRoute.get("/get-followeing/:id", isAuthenticated, getFolloweingById);
