// Controller for vendor-token cookie endpoints

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
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
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
