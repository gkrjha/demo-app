import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();


export const SocketProvider = ({ children, user }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
   
    if (user?._id) {
      const newSocket = io("http://localhost:3000", {
        transports: ["websocket"],
        withCredentials: true,
      });

    
      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);
        newSocket.emit("addUser", user._id);
      });

      
      setSocket(newSocket);

      
      return () => {
        newSocket.disconnect();
        setSocket(null); 
        console.log("Socket disconnected");
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};


export const useSocket = () => useContext(SocketContext);
