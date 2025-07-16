import jwt from "jsonwebtoken";



 const isAuthenticated = (req, res, next) => {
   const token = req.header("Authorization")?.replace("Bearer ", "");
   if (!token) {
     return res.status(401).json({ message: "Authentication required" });
   }

  //  if (blacklistedTokens.has(token)) {
  //    return res.status(401).json({ message: "Token is invalid (logged out)" });
  //  }

   try {
     const decoded = jwt.verify(token, process.env.JWT_KEY);
     req.user = decoded;
     next();
   } catch (err) {
     return res.status(401).json({ message: "Invalid or expired token" });
   }
 };
 export default isAuthenticated;