import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./VideoPlayer.css"; // Adjust if needed
import { useLocation } from "react-router-dom";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const commentEndRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/media/comment/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComments(res.data.comments || []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const commentPayload = {
      content: input.trim(),
    };

    try {
      await axios.post(
        `http://localhost:3000/api/media/comment/${postId}`,
        commentPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setInput("");
      fetchComments();
    } catch (error) {
      console.error("Failed to post comment:", error);
    }
  };

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  return (
    <div className="comment_container">
      <h4 className="comment_heading">Comments</h4>
      <div className="comment_list">
        {comments.map((c, i) => (
          <div className="comment_item" key={i}>
            {/* Optional Avatar */}
            {c.author?.profile && (
              <img
                src={c.author.profile}
                alt="avatar"
                className="comment_avatar"
              />
            )}
            <div className="comment_text_block">
              <span className="comment_user">
                {c.author?.name || c.author?.username || "User"}
              </span>
              <span className="comment_content">{c.content}</span>
              <span className="comment_time">
                {new Date(c.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={commentEndRef} />
      </div>
      <div className="comment_input_wrapper">
        <input
          type="text"
          className="comment_input"
          placeholder="Add a comment..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button className="comment_button" onClick={handleSend}>
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
