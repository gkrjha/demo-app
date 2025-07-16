import React, { useState, useEffect } from "react";
import axios from "axios";
import "./FollowersFollowingPage.css";
import { useNavigate, useLocation } from "react-router-dom";

const FollowersFollowingPage = () => {
  const [activeTab, setActiveTab] = useState("followers");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    const user_id = location.state?.user_id || "";
    setLoading(true);
    try {
      const url =
        activeTab === "followers"
          ? `http://localhost:3000/api/user/get-follower/${user_id}`
          : `http://localhost:3000/api/user/get-followeing/${user_id}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const key = activeTab === "followers" ? "followers" : "following";
      setUsers(res.data[key] || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, location.state?.user_id]); // refetch if tab or user_id changes

  return (
    <div className="follow-container">
      <div className="tab-buttons">
        <button
          className={activeTab === "followers" ? "active" : ""}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </button>
        <button
          className={activeTab === "following" ? "active" : ""}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
      </div>

      <div className="follow-content">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : users.length === 0 ? (
          <p className="empty">No {activeTab} found.</p>
        ) : (
          users.map((user) => (
            <div
              className="user-card"
              key={user._id}
              onClick={() =>
                navigate("/other-profile", {
                  state: { user_id: user._id },
                })
              }
            >
              <img
                src={user.profile || "https://via.placeholder.com/60"}
                alt="profile"
                className="profile-pic"
              />
              <div className="user-info">
                <h4>{user.name}</h4>
                <p>{user.gender}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowersFollowingPage;
