// Controller for vendor-token cookie endpoints

// Set vendor-token cookie
export const setVendorToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  // Set cookie (httpOnly for security, adjust options as needed)
  res.cookie("vendor-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return res.json({ message: "vendor-token cookie set" });
};

// Get vendor-token cookie
export const getVendorToken = (req, res) => {
  const token = req.cookies["vendor-token"];
  if (!token) {
    return res.status(404).json({ message: "vendor-token cookie not found" });
  }
  return res.json({ token });
};
