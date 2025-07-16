import React, { useEffect, useState } from "react";
import "./Shorts.css";
import Masonry from "react-masonry-css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Images = () => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/media/get-image/all?page=${page}&limit=8&type=image`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const newImages = res.data.data.filter((media) => media.type === "image");

      if (newImages.length === 0) {
        setHasMore(false);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error.message);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [page]);

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <>
      <div className="images-container">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {images.map((image, index) => (
            <div
              className="grid-item"
              key={image._id || index}
              onClick={() =>
                navigate("/image-viewer", {
                  state: {
                    images,
                    currentIndex: index,
                    media_id: image._id || image.media_id,
                  },
                })
              }
              style={{ cursor: "pointer" }}
            >
              <img
                src={image.media}
                alt={image.name || "Uploaded Image"}
                loading="lazy"
              />
            </div>
          ))}
        </Masonry>
      </div>

      {hasMore && (
        <div
          className="view-detail"
          role="button"
          tabIndex={0}
          onClick={loadMore}
          onKeyDown={(e) => e.key === "Enter" && loadMore()}
        >
          <p>View more</p>
          <span>
            <FontAwesomeIcon icon={faAngleDown} />
          </span>
        </div>
      )}
    </>
  );
};

export default Images;
