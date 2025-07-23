import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Branch Register (self-registration)
export const branchRegister = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, businessType } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      businessType: businessType || "restaurant",
    });
    return res.status(201).json({ success: true, message: "Branch registered successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error registering branch", error: error.message });
  }
};

// Branch Login
export const branchLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, businessType: "restaurant" });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    // Generate JWT
    const token = jwt.sign({ id: user._id, businessType: user.businessType }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ success: true, token, user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error logging in", error: error.message });
  }
};

// Branch Logout (for JWT, client just deletes token; for session, destroy session)
export const branchLogout = async (req, res) => {
  // For JWT, logout is handled client-side by deleting the token
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Branch Password Reset (OTP-based, simplified)
export const branchResetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    // Find user and check OTP (this assumes OTP is stored on user)
    const user = await User.findOne({ email, businessType: "restaurant" });
    if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error resetting password", error: error.message });
  }
};
