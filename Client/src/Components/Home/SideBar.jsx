import React, { useEffect } from "react";
import "./Home.css";
import {
  faClock,
  faFireFlameCurved,
  faForward,
  faHeart,
  faHouse,
  faImage,
  faMusic,
  faStar,
  faUpload,
  faUsers,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Videos from "../Cards/Videos";
import Images from "../Cards/Images";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router";

const SideBar = () => {
  const token = localStorage.getItem("token");
  const [userId, setUserId] = React.useState("");
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      const payload = jwtDecode(token);
      console.log("User ID:", payload.existingUser._id);
      setUserId(payload.existingUser._id);
    }
  }, [token]);
  const navigate = useNavigate();
  return (
    <div className="media-container">
      <div className="media-sidebar">
        <div className="media-objecct">
          <span
            onClick={() => {
              navigate("/");
            }}
          >
            <FontAwesomeIcon icon={faHouse} />
            <p>Home</p>
          </span>
          <span
            onClick={() => {
              navigate("/trending");
            }}
          >
            <FontAwesomeIcon icon={faFireFlameCurved} />
            <p>Treanding</p>
          </span>
          <span>
            <FontAwesomeIcon icon={faMusic} />
            <p>Music</p>
          </span>

          <span>
            <FontAwesomeIcon icon={faImage} />
            <p>Image</p>
          </span>
          <span>
            <FontAwesomeIcon icon={faVideo} />
            <p>Live</p>
          </span>
          <span
            onClick={() => {
              navigate(
                "/follow",
                {
                  state: { user_id: userId },
                },
                { replace: true }
              );
            }}
          >
            <FontAwesomeIcon icon={faUsers} />
            <p>Following</p>
          </span>
          <span
            onClick={() => {
              navigate(
                "/follow",
                {
                  state: { user_id: userId },
                },
                { replace: true }
              );
            }}
          >
            <FontAwesomeIcon icon={faUsers} />
            <p>Follower</p>
          </span>
        </div>

        <div className="media-objecct">
          <h4>Your Library</h4>
          <span>
            <FontAwesomeIcon icon={faClock} />
            History
          </span>
          <span>
            <FontAwesomeIcon icon={faUpload} />
            <p>Your Upload</p>
          </span>
          <span>
            <FontAwesomeIcon icon={faHeart} />
            <p>Your favrouite</p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
