import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./Components/Home/Home";
import Profile from "./Components/Profile/Profile";
import LoginScreen from "./Components/Auth/Login";
import SignupScreen from "./Components/Auth/Signup";
import VideoPalyer from "./Components/VideoPlayer/VideoPalyer";
import Upload from "./Components/Uploads/Upload";
import EditProfile from "./Components/Profile/EditProfile";
import Layout from "./Layout";
import { ChatBox } from "./Components/Message/ChatBox";
import OtherUserProfile from "./Components/Profile/otherUserProfile";
import ProtectRoute from "./ProtectRoute";
import FollowersFollowingPage from "./Components/FollowList/FollowersFollowingPage";
import Trending from "./Components/Trending/Trending";
import AudioPlaylist from "./Components/VideoPlayer/AudioPlayer";
import ImageViewer from "./Components/VideoPlayer/ImageViewer";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <>
      <BrowserRouter>
        <Routes>
          {!token && (
            <>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
            </>
          )}

          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/player" element={<VideoPalyer />} />
            <Route path="/audioplayer" element={<AudioPlaylist />} />

            <Route path="/image-viewer" element={<ImageViewer />} />
            <Route element={<ProtectRoute />}>
              <Route path="/trending" element={<Trending />} />
              <Route path="/user-profile" element={<Profile />} />
              <Route path="/upload-media" element={<Upload />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/message" element={<ChatBox />} />
              <Route path="/message/:receiverId" element={<ChatBox />} />
              <Route path="/other-profile" element={<OtherUserProfile />} />
              <Route path="/follow" element={<FollowersFollowingPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default App;
