import Message from "../Models/message.model.js";
import { Conversation } from "../Models/convertations.model.js";
import { getReceiverSocketId } from "../server.js";
import User from "../Models/user.model.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.existingUser._id;
    const receiverId = req.params.id;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Message text is required." });
    }

    const me = await User.findById(senderId);
    const user = await User.findById(receiverId);

    if (
      !me.following.includes(receiverId) ||
      !user.followers.includes(senderId)
    ) {
      return res
        .status(403)
        .json({ message: "Users must follow each other to send messages." });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    return res.status(201).json({ newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ message: "Error sending message." });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.user.existingUser._id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        messages: [],
        message: "No conversation yet.",
      });
    }

    return res.status(200).json({
      messages: conversation.messages,
    });
  } catch (error) {
    console.error(" Error in getMessage:", error);
    return res.status(500).json({
      message: "An error occurred while fetching messages.",
    });
  }
};
