import React from "react";
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
import SideBar from "./SideBar";
import Audio from "../Cards/Audio";

const Home = () => {
  return (
    <>
      <div className="media-content">
        <div style={{ fontSize: "30px", fontWeight: "600" }}>Videos</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            marginTop: "10px",
          }}
        >
          <Videos />
        </div>
        <div style={{ fontSize: "30px", fontWeight: "600" }}>Images</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            marginTop: "10px",
          }}
        >
          <Images />
        </div>
      </div>

      <div className="media-video">
        <Audio />
      </div>
    </>
  );
};

export default Home;
