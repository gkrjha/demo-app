import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";

import { connectDB } from "./db/dbconfige.js";
import { userRoute } from "./Routes/user.routes.js";
import { mediaRoute } from "./Routes/media.routes.js";
import { messageRoute } from "./Routes/message.routes.js";

import User from "./Models/user.model.js";
import Post from "./Models/media.model.js";
import Music from "./Models/music.model.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const userSocketMap = new Map();
export const getReceiverSocketId = (receiverId) =>
  userSocketMap.get(receiverId);

io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);

  socket.on("addUser", (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`👤 User connected: ${userId} => ${socket.id}`);
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    if (!text || text.trim() === "") return;

    const message = {
      senderId,
      receiverId,
      text,
      createdAt: new Date().toISOString(),
    };

    const receiverSocketId = userSocketMap.get(receiverId);
    const senderSocketId = userSocketMap.get(senderId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    if (senderSocketId && senderSocketId !== receiverSocketId) {
      io.to(senderSocketId).emit("newMessage", message);
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
    console.log("❌ Socket disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/user", userRoute);
app.use("/api/media", mediaRoute);
app.use("/api/message", messageRoute);

app.get("/api/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ message: "Query required" });

  try {
    const [users, posts, media] = await Promise.all([
      User.find({ username: { $regex: query, $options: "i" } }).limit(5),
      Post.find({ name: { $regex: query, $options: "i" } }).limit(5),
      Music.find({ name: { $regex: query, $options: "i" } }).limit(5),
    ]);
    res.json({ users, posts, media });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

connectDB().then(() => {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
