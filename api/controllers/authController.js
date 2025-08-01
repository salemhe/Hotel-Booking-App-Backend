// Controller for vendor-token cookie endpoints
export { loginUser } from "../users/login.js";

// Set vendor-token cookie
export const setVendorToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  // Always set Path=/, HttpOnly, SameSite=Lax, and Secure if HTTPS
  res.cookie("vendor-token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // domain: can be set if you want to restrict to a specific domain
  });
  return res.json({ message: "vendor-token cookie set" });
};

// Get vendor-token cookie
export const getVendorToken = (req, res) => {
  const token = req.cookies["vendor-token"] || null;
  return res.json({ token });
};

// Set user-token cookie
export const setUserToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  res.cookie("user-token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });
  return res.json({ success: true });
};

// Get user-token cookie
export const getUserToken = (req, res) => {
  const token = req.cookies["user-token"] || null;
  return res.json({ token });
};

// Clear user-token cookie
export const clearToken = (req, res) => {
  res.clearCookie("user-token", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https' || process.env.NODE_ENV === "production",
  });
  return res.json({ success: true });
};

// Vendor Dashboard (protected)
export const vendorDashboard = (req, res) => {
  // Check for vendor-token cookie
  const token = req.cookies["vendor-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No vendor-token cookie" });
  }
  // You can decode and verify the token here if needed
  // For now, just return a placeholder dashboard response
  return res.json({
    success: true,
    dashboard: "Vendor dashboard data goes here"
  });
};

// User Dashboard (protected)
export const userDashboard = (req, res) => {
  // Check for user-token cookie
  const token = req.cookies["user-token"];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No user-token cookie" });
  }
  // You can decode and verify the token here if needed
  // For now, just return a placeholder dashboard response
  return res.json({
    success: true,
    dashboard: "User dashboard data goes here"
  });
};
