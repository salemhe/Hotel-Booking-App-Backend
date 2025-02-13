import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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

