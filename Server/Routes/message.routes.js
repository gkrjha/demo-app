import express from "express";
import { sendMessage, getMessage } from "../Controllers/message.controller.js";
import isAuthenticated from "../Middleware/IsAuthenticate.js";
export const messageRoute = express.Router();
messageRoute.post("/send/:id", isAuthenticated, sendMessage);
messageRoute.get("/getmessage/:id", isAuthenticated, getMessage);
