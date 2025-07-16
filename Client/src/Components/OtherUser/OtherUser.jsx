import React, { useState } from "react";
// import "./ProfileScreen.css";
import { FiVideo, FiMessageCircle, FiPlayCircle } from "react-icons/fi";
// import { Entypo } from "react-icons/entypo";
import { MdAudioFile } from "react-icons/md";
import "./Other.css";
const OtherUser = () => {
  const [filterMedia, setFilterMedia] = useState("Video");

  const imageList = Array(126).fill(
    "https://static.vecteezy.com/system/resources/thumbnails/019/896/012/small_2x/female-user-avatar-icon-in-flat-design-style-person-signs-illustration-png.png"
  );

  const videoList = Array(30).fill(
    "https://your-video-thumbnail-url-or-image-placeholder.png"
  );

  const audioList = Array(20).fill({
    title: "Audio Track",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/727/727245.png",
  });

  return (
    <div className="container">
      <div className="profileDetails">
        <div className="usernameContainer">
          <h2 className="username">username</h2>
        </div>

        <div className="profile">
          <img src={imageList[0]} className="profileImage" alt="Profile" />
          <div className="stat">
            <div className="statNumber">485</div>
            <div className="statLabel">Posts</div>
          </div>
          <div className="stat">
            <div className="statNumber">1.2K</div>
            <div className="statLabel">Followers</div>
          </div>
          <div className="stat">
            <div className="statNumber">300</div>
            <div className="statLabel">Following</div>
          </div>
        </div>

        <div className="fullName">Gaurav Kumar</div>

        <div className="actionButtons">
          <button className="followButton">Follow</button>
          <button className="messageButton">
            <FiMessageCircle size={18} color="#4A90E2" />
            <span>Message</span>
          </button>
        </div>
      </div>

      <div className="filterView">
        <div className="filterItem" onClick={() => setFilterMedia("Video")}>
          <FiVideo size={24} />
          <span>Video</span>
        </div>
        <div className="filterItem" onClick={() => setFilterMedia("Image")}>
          {/* <Entypo name="image" size={24} /> */}
          <span>Image</span>
        </div>
        <div className="filterItem" onClick={() => setFilterMedia("Audio")}>
          <MdAudioFile size={24} />
          <span>Audio</span>
        </div>
      </div>

      {/* Media Content */}
      <div className="imageGrid">
        {filterMedia === "Video" &&
          videoList.map((uri, index) => (
            <div className="imageTile" key={index}>
              <img src={uri} alt="Video Thumbnail" className="postImage" />
              <div className="playIconContainer">
                <FiPlayCircle size={32} color="rgba(255,255,255,0.8)" />
              </div>
            </div>
          ))}

        {filterMedia === "Image" &&
          imageList.map((uri, index) => (
            <div className="imageTile" key={index}>
              <img src={uri} alt="Image" className="postImage" />
            </div>
          ))}

        {filterMedia === "Audio" &&
          audioList.map((audio, index) => (
            <div className="audioTile" key={index}>
              <img src={audio.thumbnail} className="audioImage" alt="Audio" />
              <div className="audioTitle">{audio.title}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default OtherUser;
