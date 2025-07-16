import React from "react";
import { Outlet, useLocation, matchPath } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import SideBar from "./Components/Home/SideBar";

const Layout = () => {
  const location = useLocation();

  
  const hiddenRoutes = [
    "/login",
    "/signup",
    "/other-user-profile",
    "/user-profile",
    "/upload-media",
    "/message",
  ];


  const isHidden =
    hiddenRoutes.includes(location.pathname) ||
    matchPath("/message/:receiverId", location.pathname);

  return (
    <>
      {!isHidden && <Navbar />}
      {!isHidden && <SideBar />}
      <Outlet />
    </>
  );
};

export default Layout;
