
import { configureStore } from "@reduxjs/toolkit";
import userDetail from "./Components/CreateSlice/userSclice.js"; 

export const store = configureStore({
  reducer: {
    userDetail
  },
});