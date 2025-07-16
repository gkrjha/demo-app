import React, { useEffect, useState } from "react";
import "./VideoPlayer.css";
import { useLocation } from "react-router-dom";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";
import { FaHeart, FaEye } from "react-icons/fa";
import CommentSection from "./CommentSections";
import axios from "axios";

const VideoPlayerComponent = () => {
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const location = useLocation();
  const videoUri = location.state?.media;
  const title = location.state?.title;
  const profile = location.state?.profile;
  const username = location.state?.username;
  const media_id = location.state?.media_id;
  console.log("Video URI:", videoUri);

  useEffect(() => {
    const calculateViews = async () => {
      try {
        const res = await axios.put(
          `http://localhost:3000/api/media/views/${media_id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const match = res.data.message?.match(/\d+/);
        const viewsCount = match ? parseInt(match[0]) : 0;
        setViews(viewsCount);
      } catch (error) {
        console.error("Error updating views:", error);
      }
    };
    if (media_id) calculateViews();
  }, [media_id]);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/media/likes/${media_id}`
        );
        setLikes(res.data.likes || 0);
        setLiked(res.data.liked || false);
      } catch (err) {
        console.error("Error fetching likes:", err);
      }
    };
    if (media_id) fetchLikes();
  }, [media_id]);

  const handleLike = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/media/like/${media_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Error liking media:", err);
    }
  };

  return (
    <>
      <div className="fullscreen-wrapper">
        <MediaController className="fullscreen-player">
          <video
          
            slot="media"
            src={videoUri}
            playsInline
            preload="metadata"
            controls={false}
            autoPlay
            width="100%"
            height="100%"
            poster="https://dummyimage.com/720x420/000/fff&text=Video+Poster"
          ></video>

          <MediaControlBar>
            <MediaPlayButton />
            <MediaSeekBackwardButton seekoffset={10} />
            <MediaSeekForwardButton seekoffset={10} />
            <MediaTimeRange />
            <MediaTimeDisplay showduration />
            <MediaMuteButton />
            <MediaVolumeRange />
            <MediaPlaybackRateButton />
            <MediaFullscreenButton />
          </MediaControlBar>
        </MediaController>

        <div className="video-title-bar">
          <p className="video-title">{title}</p>
          <div className="video-actions">
            <span className="views">
              <FaEye /> {views}
            </span>
            <span className="favorite" onClick={handleLike}>
              <FaHeart color={liked ? "red" : "#555"} /> {likes}
            </span>
          </div>
        </div>
      </div>

      <div className="video-info-bar">
        <div className="profile-section">
          <img src={profile} alt="Profile" className="profile-thumb" />
          <div>
            <h4 className="video-username">{username}</h4>
          </div>
        </div>
      </div>

      <CommentSection postId={media_id} />
    </>
  );
};

export default VideoPlayerComponent;
