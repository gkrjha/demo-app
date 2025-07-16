import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Chat.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

export const ChatBox = () => {
  const navigate = useNavigate();
  const chatRef = useRef(null);
  const { receiverId } = useParams();

  const [socket, setSocket] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    const decoded = jwtDecode(token);
    const userId = decoded?.existingUser?._id;
    const fetchLoggedUser = async () => {
      const res = await axios.get(
        `http://localhost:3000/api/user/getuser/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLoggedUser(res.data.user);
    };
    fetchLoggedUser();
  }, [token]);

  useEffect(() => {
    if (!loggedUser?._id) return;

    const newSocket = io("http://localhost:3000", {
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit("addUser", loggedUser._id);
    });

    newSocket.on("newMessage", (msg) => {
      const relatedToMessage =
        (msg.senderId === loggedUser?._id && msg.receiverId === receiverId) ||
        (msg.receiverId === loggedUser?._id && msg.senderId === receiverId);
      if (relatedToMessage && msg.senderId !== loggedUser._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      console.log("Socket disconnected");
    };
  }, [loggedUser, receiverId]);

  useEffect(() => {
    if (!token) return;
    const fetchUsers = async () => {
      const res = await axios.get("http://localhost:3000/api/user/getother", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data || []);
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (!receiverId || !token) return;
    const fetchUserDetail = async () => {
      const res = await axios.get(
        `http://localhost:3000/api/user/getother/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserDetail(res.data.user);
    };
    fetchUserDetail();
  }, [receiverId, token]);

  useEffect(() => {
    if (!receiverId || !token) return;
    const fetchMessages = async () => {
      const res = await axios.get(
        `http://localhost:3000/api/message/getmessage/${receiverId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(res.data.messages);
      console.log("Fetched messages::::", res.data.messages);
    };
    fetchMessages();
  }, [receiverId, token]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim() || !receiverId) return;
    try {
      const res = await axios.post(
        `http://localhost:3000/api/message/send/${receiverId}`,
        { text },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newMsg = res.data.newMessage;

      socket.emit("sendMessage", {
        senderId: loggedUser._id,
        receiverId,
        text: newMsg.text,
      });

      setMessages((prev) => [...prev, newMsg]);
      setText("");
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  return (
    <div className="chat-container">
      <div className="user-info">
        <input type="text" placeholder="Search contact" />
        {users.map((user) => (
          <div
            key={user._id}
            className="user-detail"
            onClick={() => navigate(`/message/${user._id}`, { replace: true })}
          >
            <img src={user.profile} className="user-avatar" alt="avatar" />
            <span className="username">{user.name}</span>
          </div>
        ))}
      </div>

      {receiverId && (
        <div className="message-info">
          {userDetail && (
            <div
              className="user-detail-sections"
              onClick={() =>
                navigate(
                  "/other-profile",
                  { state: { user_id: receiverId } },
                  { replace: true }
                )
              }
            >
              <img
                src={userDetail.profile}
                className="user-avatar"
                alt="avatar"
              />
              <span className="username">{userDetail.name}</span>
            </div>
          )}

          <div className="chat-section">
            {messages.map((msg) => (
              <div
                className={`chat ${
                  msg.senderId === loggedUser?._id ? "chat-end" : "chat-start"
                }`}
                key={msg._id}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={
                        msg.senderId === loggedUser?._id
                          ? loggedUser?.profile
                          : userDetail?.profile
                      }
                      alt="avatar"
                    />
                  </div>
                </div>
                <div className="chat-header">
                  {msg.senderId === loggedUser?._id
                    ? loggedUser?.name
                    : userDetail?.name}
                  <time className="text-xs opacity-50">
                    {msg.createdAt?.slice(11, 16)}
                  </time>
                </div>
                <div className="chat-bubble">{msg.text}</div>
                <div className="chat-footer opacity-50">
                  {msg.senderId === loggedUser?._id ? "Delivered" : "Seen"}
                </div>
              </div>
            ))}
            <div ref={chatRef}></div>
          </div>

          <div className="sendInput">
            <input
              type="text"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};
