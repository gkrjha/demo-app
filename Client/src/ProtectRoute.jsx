import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectRoute = () => {
  const token = localStorage.getItem("token");
  console.log("ProtectRoute token:", token);
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectRoute;
