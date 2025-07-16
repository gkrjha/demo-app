import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "react-video-js-player";
import "./Profile.css";

const Profile = () => {
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState("");
  const [data, setData] = useState(null);
  const [userPost, setUserPost] = useState([]);
  const [musics, setMusics] = useState([]);
  const [filterMedia, setFilterMedia] = useState("video");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const payload = jwtDecode(storedToken);
      setUserId(payload.existingUser._id);
    }
  }, []);

  useEffect(() => {
    if (userId && token) {
      axios
        .get(`http://localhost:3000/api/user/getuser/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setData(res.data.user))
        .catch((err) => console.error("User fetch error", err));

      axios
        .get(`http://localhost:3000/api/media/author/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserPost(res.data.posts))
        .catch((err) => console.error("Post fetch error", err));
      axios
        .get(`http://localhost:3000/api/media/get-music/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setMusics(res.data.musics))
        .catch((err) => console.error("Music fetch error", err));
    }
  }, [userId, token]);
  console.log(data?._id);
  return (
    <div className="profile-container">
      {data && (
        <div className="profile-header">
          <div className="profile-left">
            <img src={data.profile} alt="Profile" className="profile-image" />
          </div>
          <div className="profile-right">
            <div className="username-section">
              <h2>{data.username}</h2>
              <button
                onClick={() =>
                  navigate("/edit-profile", {
                    state: {
                      _id: data?._id,
                      profile: data.profile,
                      name: data.name,
                      bio: data.bio,
                    },
                  })
                }
              >
                Edit Profile
              </button>
            </div>
            <div className="stats">
              <div>
                <strong>{data.posts?.length}</strong> Posts
              </div>
              <div
                onClick={() => {
                  navigate("/follow", {
                    state: {
                      user_id: data._id,
                      user_name: data.name,
                      user_profile: data.profile,
                      type: "followers",
                    },
                  });
                }}
              >
                <strong>{data.followers?.length}</strong> Followers
              </div>
              <div
                onClick={() => {
                  navigate("/follow", {
                    state: {
                      user_id: data._id,
                      user_name: data.name,
                      user_profile: data.profile,
                      type: "followers",
                    },
                  });
                }}
              >
                <strong>{data.following?.length}</strong> Following
              </div>
            </div>
            <p className="full-name">{data.name}</p>
            <p className="bio">{data.bio}</p>
          </div>
        </div>
      )}

      <div className="filter-buttons">
        <button onClick={() => setFilterMedia("video")}>Video</button>
        <button onClick={() => setFilterMedia("image")}>Image</button>
        <button onClick={() => setFilterMedia("audio")}>Audio</button>
      </div>

      <div className="media-grid">
        {userPost
          .filter((post) => post.type === filterMedia)
          .map((post, i) =>
            post.media.map((media, j) => {
              const thumb =
                Array.isArray(post.thumbnailUrl) && post.thumbnailUrl[j]
                  ? post.thumbnailUrl[j]
                  : media;

              if (filterMedia === "video") {
                return (
                  <div className="video-tile" key={`${i}-${j}`}>
                    <video
                      src={media}
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                      muted
                      width="auto"
                      height="200"
                      onClick={() => {
                        navigate("/player", {
                          state: {
                            media_id: media._id,
                            media: media,
                            title: post.name,
                            username: data.username,
                            profile: data.profile,
                            views: post.views || 0,
                          },
                        });
                        console.log(post.name, media);
                      }}
                    />
                    <p>{post.name || "Untitled Video"}</p>
                  </div>
                );
              } else if (filterMedia === "image") {
                return (
                  <div className="image-tile" key={`${i}-${j}`}>
                    <img src={media} alt="post" />
                  </div>
                );
              } else return null;
            })
          )}
      </div>

      {filterMedia === "audio" && (
        <div className="media-grid">
          {musics.map((music, index) => (
            <div className="audio-tile" key={index}>
              <img
                src={
                  music.thumbnailUrl?.[0] || "https://via.placeholder.com/100"
                }
                alt="Audio"
              />
              <p className="audio-title">{music.name}</p>
              <p className="audio-artist">
                {Array.isArray(music.singer)
                  ? music.singer.join(", ")
                  : "Unknown"}
              </p>
              <button onClick={() => navigate(`/music/${music._id}`)}>
                Play
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
