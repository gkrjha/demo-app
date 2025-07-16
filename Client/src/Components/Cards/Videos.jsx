import React, { useEffect, useState } from "react";
import "./Shorts.css";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Videos = () => {
  const [post, setPost] = useState([]);
  const [page, setPage] = useState(1);
  const [durations, setDurations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/media/get-video/all?limit=4&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPost((prev) => [...prev, ...response?.data?.data]);
        console.log("Fetched posts:", response);
      } catch (error) {
        console.error("Failed to fetch videos:", error.message);
      }
    };
    fetchPosts();
  }, [page]);

  const playVideo = (e) => e.target.play();
  const pauseVideo = (e) => e.target.pause();

  const formatDuration = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const calculateDaysAgo = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    return diffDays === 0
      ? "Today"
      : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const handleMetadataLoaded = (e, id) => {
    const duration = e.target.duration;
    setDurations((prev) => ({
      ...prev,
      [id]: formatDuration(duration),
    }));
  };

  const loadMore = () => setPage((prev) => prev + 1);

  return (
    <>
      {post.length === 0 ? (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          No videos available
        </p>
      ) : (
        post.map((media, index) => (
          <div className="main-video-containder" key={media._id || index}>
            <div className="videos-times">
              <video
                className="video-frame"
                src={Array.isArray(media.media) ? media.media[0] : media.media}
                onMouseEnter={playVideo}
                onMouseLeave={pauseVideo}
                muted
                loop
                onLoadedMetadata={(e) => handleMetadataLoaded(e, media._id)}
                onClick={() =>
                  navigate("/player", {
                    state: {
                      media_id: media._id,
                      media: Array.isArray(media.media)
                        ? media.media[0]
                        : media.media,
                      title: media.name,
                      username: media.author?.username || "Unknown",
                      profile: media.author?.profile || "",
                      views: media.views || 0,
                    },
                  })
                }
              />
              <div className="video-time">
                {durations[media._id] || "00:00"}
              </div>
            </div>

            <div className="video-details">
              <div className="video-title">
                <p>{media.name || "Untitled Video"}</p>
              </div>
              <div className="video-user-detail">
                <img
                  src={
                    media.author?.profile?.startsWith("http")
                      ? media.author.profile
                      : "https://icon-library.com/images/profile-icon-png/profile-icon-png-1.jpg"
                  }
                  alt="Profile"
                />
                <p>{media.author?.name || "Unknown User"}</p>
              </div>
              <div className="views-days">
                <p>{media.views || 0} views</p>
                <p>{calculateDaysAgo(media.createdAt)}</p>
              </div>
              <div className="likes">
                <p>{media.likes?.length || 0} Likes</p>
              </div>
            </div>
          </div>
        ))
      )}

      {post.length > 0 && (
        <div className="view-detail" onClick={loadMore}>
          <p>View more</p>
          <span>
            <FontAwesomeIcon icon={faAngleDown} />
          </span>
        </div>
      )}
    </>
  );
};

export default Videos;
