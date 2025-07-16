import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { store } from "./MediaStore.js";
import { Provider } from "react-redux";
import { SocketProvider } from "./Components/Message/SocketContext.jsx";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <Provider store={store}>
      <StrictMode>
        <App />
      </StrictMode>
    </Provider>
  </SocketProvider>
  
);
