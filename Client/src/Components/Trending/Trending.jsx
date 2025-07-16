import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Trending.css";

const Trending = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/media/trending");

        const filtered = res.data.filter((post) => post.type === "video")

        setPosts(res.data || filtered);
        console.log("Trending posts fetched:", res.data);
      } catch (error) {
        console.error("Error fetching trending posts:", error);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="trending-container">
      <h2>Trending This Week</h2>
      <div className="trending-list">
        {posts.map((post, index) => (
          <div className="trending-card" key={post._id}>
            <img
              src={post.thumbnailUrl?.[0] || "/default.jpg"}
              alt="thumbnail"
            />
            <div className="trending-info">
              <h4>
                {index + 1}. {post.name || "Untitled"}
              </h4>
              <p>{post.views} views</p>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
