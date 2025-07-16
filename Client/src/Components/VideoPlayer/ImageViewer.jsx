import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import "./VideoPlayer.css";
import axios from "axios";

const ImageViewer = () => {
  const { state } = useLocation();
  const { images = [], currentIndex = 0 } = state || {};
  const location = useLocation();
  const media_id = location.state?.media_id;
  const [views, setViews] = useState(0);
  const imageUri = location.state?.imageUri;
  const [index, setIndex] = useState(currentIndex);
  const current = images[index] || imageUri;
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
  const handleNext = () => {
    if (index < images.length - 1) setIndex(index + 1);
  };

  const handlePrevious = () => {
    if (index > 0) setIndex(index - 1);
  };

  return (
    <div className="image-viewer-wrapper">
      {current ? (
        <>
          <div className="image-box">
            <img
              src={
                Array.isArray(current.media)
                  ? current.media[0]
                  : current.media || imageUri
              }
              alt={current.name}
              className="viewer-image"
            />
          </div>

          <div className="image-details">
            <h2>{current.name}</h2>
            <p>{current.author?.name || "Unknown Author"}</p>
            <span>{current.views || 0} views</span>
          </div>

          <div className="image-controls">
            <button onClick={handlePrevious} disabled={index === 0}>
              <FaArrowLeft />
            </button>
            <button onClick={handleNext} disabled={index === images.length - 1}>
              <FaArrowRight />
            </button>
          </div>
        </>
      ) : (
        <p>No image found</p>
      )}
    </div>
  );
};

export default ImageViewer;
