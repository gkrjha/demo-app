import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactAudioPlayer from "react-audio-player";
import { FaPlay, FaPause, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./AudioPlaylist.css";

const AudioPlaylist = () => {
  const { state } = useLocation();
  const { trackList = [], currentTrackIndex = 0 } = state || {};
  const [index, setIndex] = useState(currentTrackIndex);
  const audioRef = useRef(null);
  const current = trackList[index];

  const handleNext = () => {
    if (index < trackList.length - 1) {
      setIndex(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <div className="audio-player-container">
      {current ? (
        <>
          <div className="playlist-info">
            <img
              className="playlist-avatar"
              src={
                current.author?.profile?.startsWith("http")
                  ? current.author.profile
                  : "https://icon-library.com/images/profile-icon-png/profile-icon-png-1.jpg"
              }
              alt="artist"
            />
            <div>
              <h2 className="playlist-title">{current.name}</h2>
              <p className="playlist-artist">
                {current.author?.name || "Unknown Artist"}
              </p>
            </div>
          </div>

          <div className="player-box">
            <ReactAudioPlayer
              src={
                Array.isArray(current.media) ? current.media[0] : current.media
              }
              autoPlay
              controls
              ref={audioRef}
              onEnded={handleNext}
            />
          </div>

          <div className="playlist-controls">
            <button onClick={handlePrevious} disabled={index === 0}>
              <FaArrowLeft />
            </button>
            <button onClick={() => audioRef.current?.audioEl.current?.play()}>
              <FaPlay />
            </button>
            <button onClick={() => audioRef.current?.audioEl.current?.pause()}>
              <FaPause />
            </button>
            <button
              onClick={handleNext}
              disabled={index === trackList.length - 1}
            >
              <FaArrowRight />
            </button>
          </div>
        </>
      ) : (
        <p className="no-track-msg">No track found</p>
      )}
    </div>
  );
};

export default AudioPlaylist;
