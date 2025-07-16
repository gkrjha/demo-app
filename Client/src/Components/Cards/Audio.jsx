import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactAudioPlayer from "react-audio-player";
import "./Audio.css";

const Audio = () => {
  const [tracks, setTracks] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/media/get-music/all?page=${page}&limit=3`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTracks((prev) => [...prev, ...response.data.data]);
      } catch (err) {
        console.error("Failed to load audio tracks:", err);
      }
    };

    loadTracks();
  }, [page]);

  const loadNextPage = () => setPage((prev) => prev + 1);

  const timeSince = (dateStr) => {
    const created = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return diffDays === 0
      ? "Today"
      : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="audio-wrapper-box">
      <div className="audio-grid-layout">
        {tracks.map((track) => (
          <div
            className="audio-tile"
            key={track._id}
            onClick={() => {
              navigate(`/audioplayer`, {
                state: {
                  trackList: tracks,
                  currentTrackIndex: tracks.findIndex(
                    (t) => t._id === track._id
                  ),
                },
              });
            }}
          >
            <div className="audio-header">
              <img
                className="audio-avatar"
                src={
                  track.author?.profile?.startsWith("http")
                    ? track.author.profile
                    : "https://icon-library.com/images/profile-icon-png/profile-icon-png-1.jpg"
                }
                alt="profile"
              />
              <div className="audio-meta">
                <h4 className="audio-title">{track.name || "Untitled"}</h4>
                <p className="audio-artist">
                  {track.author?.name || "Unknown Artist"}
                </p>
                <span className="audio-stats">
                  {timeSince(track.createdAt)} • {track.views || 0} views
                </span>
              </div>
            </div>
            <div className="audio-control-box">
              <ReactAudioPlayer
                src={Array.isArray(track.media) ? track.media[0] : track.media}
                controls
              />
            </div>
          </div>
        ))}
      </div>
      {tracks.length > 0 && (
        <div className="audio-load-btn" onClick={loadNextPage}>
          <p>Show More</p>
        </div>
      )}
    </div>
  );
};

export default Audio;
