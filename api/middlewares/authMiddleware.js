
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

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

export const authenticateUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("_id role"); // Add role to selection
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

export const authenticateVendor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from Authorization header
    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    const vendor = await Vendor.findById(decoded.id).select("_id");
    
    if (!vendor) {
      return res.status(401).json({ message: "Unauthorized: Vendor not found" });
    }
    req.vendor = vendor._id;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};




// New middleware for role-based authorization
export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }
    
    try {
      // If we need to fetch full user details including role
      const user = await User.findById(req.user._id).select("role");
      
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          message: `Forbidden: Role ${user.role} is not authorized to access this resource` 
        });
      }
      
      // Add full user with role to req for further use
      req.user.role = user.role;
      next();
    } catch (error) {
      console.error("Authorization Error:", error.message);
      return res.status(500).json({ message: "Server error during authorization" });
    }
  };
};

// Middleware to authenticate super admin
export const authenticateSuperAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticateUser(req, res, async () => {
      // Then check if they have super-admin role
      const user = await User.findById(req.user._id).select("role");
      
      if (!user || user.role !== 'super-admin') {
        return res.status(403).json({ 
          message: "Forbidden: Super Admin access required" 
        });
      }
      
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

// Middleware to authenticate hotel owner
export const authenticateHotelOwner = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticateUser(req, res, async () => {
      const hotelId = req.params.hotelId;
      
      // If there's no hotelId in the params, we can't verify ownership
      if (!hotelId) {
        return res.status(400).json({ message: "Hotel ID is required" });
      }
      
      const Hotel = require("../models/Hotel");
      const hotel = await Hotel.findById(hotelId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      // Check if the authenticated user is the hotel owner or has admin/super-admin role
      const user = await User.findById(req.user._id).select("role");
      
      if (hotel.owner.toString() !== req.user._id.toString() && 
          user.role !== 'admin' && 
          user.role !== 'super-admin') {
        return res.status(403).json({ 
          message: "Forbidden: You are not authorized to manage this hotel" 
        });
      }
      
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error during authentication" });
  }
};