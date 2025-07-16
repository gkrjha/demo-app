import express from "express";
import { upload } from "../utils/multer.js";
import {
  countLikes,
  countPostsByAuthor,
  fetchFiles,
  getAllMusic,
  getCommnet,
  getImage,
  getMediaByAuthor,
  getMusic,
  getMusicByAuthor,
  getVideo,
  likePost,
  postComment,
  trending,
  uploadMusic,
  uploads,
  viewsCalculate,
} from "../Controllers/media.controller.js";
import isAuthenticated from "../Middleware/IsAuthenticate.js";

export const mediaRoute = express.Router();

mediaRoute.post("/upload", isAuthenticated, upload.array("media"), uploads);
mediaRoute.get("/author/:id", isAuthenticated, getMediaByAuthor);
mediaRoute.get("/getall", fetchFiles);
mediaRoute.get("/count/:id", isAuthenticated, countPostsByAuthor);
mediaRoute.put("/islike/:id", isAuthenticated, likePost);
mediaRoute.get("/countlikes/:id", isAuthenticated, countLikes);
mediaRoute.post("/comment/:id", isAuthenticated, postComment);
mediaRoute.get("/comment/:id", isAuthenticated, getCommnet);
mediaRoute.post(
  "/upload-music",
  isAuthenticated,
  upload.single("media"),
  uploadMusic
);
mediaRoute.get("/get-allmusic", getAllMusic);
mediaRoute.put("/views/:id", viewsCalculate);
mediaRoute.get("/trending", trending);
mediaRoute.get("/get-music/all", getMusic);
mediaRoute.get("/get-music/:id", isAuthenticated, getMusicByAuthor);
mediaRoute.get("/get-video/all", getVideo);
mediaRoute.get("/get-image/all", getImage);
