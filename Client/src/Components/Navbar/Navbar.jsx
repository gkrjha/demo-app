import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import { AutoComplete } from "primereact/autocomplete";
import {
  faBell,
  faMessage,
  faUser,
  faRightFromBracket,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { setUploadOption } from "../CreateSlice/userSclice";
import { useNavigate } from "react-router";

const Navbar = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [navShow, setNavShow] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uploadOption = useSelector((state) => state.userDetail.viewUpload);

  const uploadRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setNavShow(!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        if (uploadOption) {
          dispatch(setUploadOption());
        }
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch, uploadOption]);

  const search = async (e) => {
    const query = e.query;
    if (!query) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/api/search?query=${query}`
      );
      const { users, posts, media } = res.data;

      const results = [
        ...users.map((u) => ({
          label: `👤 ${u.username}`,
          type: "user",
          data: u,
        })),
        ...posts.map((p) => ({ label: `📝 ${p.name}`, type: "post", data: p })),
        ...media.map((m) => ({
          label: `🎬 ${m.name}`,
          type: "media",
          data: m,
        })),
      ];

      setItems(results);
    } catch (err) {
      console.error("Search error", err);
      setItems([]);
    }
  };

  const handleSelect = (item) => {
    setValue(item.label);
    console.log("Selected item:", item.data.role);

    if (item.data.role === "user") {
      setValue("");
      navigate(`/other-profile`, { state: { user_id: item.data._id } });
    } else if (item.data.type === "video") {
      console.log("Selected item::::", item.data.media[0]);
      navigate("/player", {
        state: { media: item.data.media[0], media_id: item.data._id },
      });
    } else if (item.data.type === "image") {
      navigate("/image-viewer", {
        state: { imageUri: item.data.media[0], media_id: item.data._id },
      });
    } else if (item.data.type === "audio") {
      navigate("/music-player", { state: { media_id: item.data._id } });
    }
  };

  return (
    <header>
      <nav className="nav-container">
        <div className="logo">
          h<span>!</span>media
        </div>

        <div className="seacrh-bar">
          <AutoComplete
            value={value}
            suggestions={items}
            completeMethod={search}
            onChange={(e) => setValue(e.value)}
            onSelect={(e) => handleSelect(e.value)}
            placeholder="Search audio, video, image..."
            field="label"
            dropdown
          />
        </div>

        <div className="nav-button">
          {navShow ? (
            <button
              style={{
                background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 20px",
                borderRadius: "30px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
              }}
              onClick={() => {
                navigate("/signup");
              }}
            >
              <span style={{ marginRight: "8px" }}>Signup</span>
            </button>
          ) : (
            <>
              <FontAwesomeIcon
                icon={faBell}
                style={{
                  cursor: "pointer",
                  padding: "7px",
                  borderRadius: "50%",
                }}
              />
              <FontAwesomeIcon
                icon={faMessage}
                style={{
                  cursor: "pointer",
                  padding: "7px",
                  borderRadius: "50%",
                }}
              />

              <div className="upload-media" ref={uploadRef}>
                <button onClick={() => dispatch(setUploadOption())}>
                  Upload
                </button>
                {uploadOption && (
                  <ul>
                    <li
                      onClick={() => {
                        navigate(
                          "/upload-media",
                          {
                            state: { acceptMedia: "image" },
                          },
                          { replace: true }
                        );
                      }}
                    >
                      Image
                    </li>
                    <li
                      onClick={() => {
                        navigate(
                          "/upload-media",
                          {
                            state: { acceptMedia: "video" },
                          },
                          { replace: true }
                        );
                      }}
                    >
                      Video
                    </li>
                    <li
                      onClick={() => {
                        navigate(
                          "/upload-media",
                          {
                            state: { acceptMedia: "audio" },
                          },
                          { replace: true }
                        );
                      }}
                    >
                      Music
                    </li>
                  </ul>
                )}
              </div>

              <div className="profile-menu" ref={profileRef}>
                <FontAwesomeIcon
                  icon={faUser}
                  onClick={() => setShowProfile((prev) => !prev)}
                  style={{
                    cursor: "pointer",
                    padding: "7px",
                    borderRadius: "50%",
                  }}
                />

                {showProfile && (
                  <div className="profile-info">
                    <ul>
                      <li
                        onClick={() => {
                          navigate("/user-profile");
                          setShowProfile(false);
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faUser}
                          style={{ marginRight: "10px" }}
                        />
                        Profile
                      </li>
                      <li>
                        <FontAwesomeIcon
                          icon={faGear}
                          style={{ marginRight: "10px" }}
                        />
                        Setting
                      </li>
                      <li
                        onClick={() => {
                          localStorage.removeItem("token");
                          localStorage.setItem("isLogedin", false);
                          window.location.reload();
                        }}
                      >
                        <FontAwesomeIcon
                          icon={faRightFromBracket}
                          style={{ marginRight: "10px" }}
                        />
                        Logout
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>

      {!navShow && (
        <div
          style={{
            position: "fixed",
            right: "40px",
            bottom: "20px",
            backgroundColor: "black",
            padding: "15px",
            borderRadius: "50%",
            cursor: "pointer",
            opacity: "0.6",
          }}
          onClick={() => {
            navigate("/message");
          }}
        >
          <FontAwesomeIcon icon={faMessage} style={{ color: "white" }} />
        </div>
      )}
    </header>
  );
};

export default Navbar;
