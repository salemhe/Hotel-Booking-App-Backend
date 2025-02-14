import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config();

export const authorize = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { vendorId: decoded.id }; // Attach vendor ID
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// export const authenticateUser = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res
//       .status(401)
//       .json({ message: "Not authorized, no token provided." });
//   }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = { vendorId: decoded.id }; // Attach vendor ID
//       next();
//     } catch (error) {
//       res.status(403).json({ message: "Invalid or expired token." });
//     }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password"); // Get user details without password
//     if (!req.user) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "Invalid or expired token." });
//   }
// };

export const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      req.user = await User.findById(decoded.id).select("_id"); // Only store user ID

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message); // Debugging
      res.status(401).json({ message: "Invalid or expired token." });
    }
   
  } else {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided." });
  }


};


export const authenticateVendor = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    req.user = { vendorId: decoded.id }; // Attach vendorId to req.user

    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

