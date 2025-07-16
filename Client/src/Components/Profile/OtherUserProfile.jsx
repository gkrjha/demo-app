import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import "./Profile.css";

const OtherUserProfile = () => {
  const [token, setToken] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [data, setData] = useState(null);
  const [userPost, setUserPost] = useState([]);
  const [musics, setMusics] = useState([]);
  const [filterMedia, setFilterMedia] = useState("video");

  const location = useLocation();
  const navigate = useNavigate();

  const profileId = location.state?.user_id;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      setCurrentUserId(decoded.existingUser._id);
    }
  }, []);

  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/user/getother/${profileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(res.data.user);
        console.log("Profile data fetched:", res.data.user._id);
      } catch (err) {
        console.error("User fetch error", err);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/media/author/${profileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserPost(res.data.posts);
      } catch (err) {
        console.error("Post fetch error", err);
      }
    };

    const fetchMusic = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/media/get-music/${profileId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMusics(res.data.musics);
      } catch (err) {
        console.error("Music fetch error", err);
      }
    };

    if (token && profileId) {
      fetchProfile();
      fetchPosts();
      fetchMusic();
    }
  }, [profileId, token]);

  const handleFollow = async () => {
    try {
      const res = await axios.put(
        `http://localhost:3000/api/user/follow/${data._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = res.data.message;

      if (message === "Followed user") {
        setData((prev) => ({
          ...prev,
          followers: [...prev.followers, currentUserId],
        }));
      } else if (message === "Unfollowed user") {
        setData((prev) => ({
          ...prev,
          followers: prev.followers.filter((id) => id !== currentUserId),
        }));
      }
    } catch (err) {
      console.error("Follow/Unfollow error", err);
    }
  };

  const handleMessage = () => {
    navigate(`/message/${data._id}`, {
      state: {
        partner: {
          _id: data._id,
          name: data.name,
          profile: data.profile,
        },
      },
    });
  };

  const isFollowing = data?.followers?.includes(currentUserId);

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
              {isFollowing ? (
                <button onClick={handleFollow}>Following</button>
              ) : (
                <button onClick={handleFollow}>Follow</button>
              )}
              <button onClick={handleMessage}>Message</button>
            </div>
            <div className="stats">
              <div>
                <strong>{data.posts?.length || 0}</strong> Posts
              </div>
              <div
                onClick={() => {
                  navigate(
                    "/follow",
                    {
                      state: {
                        user_id: data._id,
                        user_name: data.name,
                        user_profile: data.profile,
                        type: "followers",
                      },
                    },
                    { replace: true }
                  );
                }}
              >
                <strong>{data.followers?.length || 0}</strong> Followers
              </div>
              <div
                onClick={() => {
                  navigate(
                    "/follow",
                    {
                      state: {
                        user_id: data._id,
                        user_name: data.name,
                        user_profile: data.profile,
                        type: "followers",
                      },
                    },
                    { replace: true }
                  );
                }}
              >
                <strong>{data.following?.length || 0}</strong> Following
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
              if (filterMedia === "video") {
                return (
                  <div className="video-tile" key={`${i}-${j}`}>
                    <video
                      src={media}
                      onMouseEnter={(e) => e.target.play()}
                      onMouseLeave={(e) => e.target.pause()}
                      muted
                      height="200"
                      onClick={() =>
                        navigate("/player", {
                          state: {
                            media,
                            title: post.name,
                            username: data.username,
                            profile: data.profile,
                            views: post.views || 0,
                          },
                        })
                      }
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

export default OtherUserProfile;
