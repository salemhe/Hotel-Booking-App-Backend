// Controller for vendor-token cookie endpoints

// Set vendor-token cookie
export const setVendorToken = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }
  res.cookie("vendor-token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return res.json({ message: "vendor-token cookie set" });
};

// Get vendor-token cookie
export const getVendorToken = (req, res) => {
  const token = req.cookies["vendor-token"] || null;
  return res.json({ token });
};
