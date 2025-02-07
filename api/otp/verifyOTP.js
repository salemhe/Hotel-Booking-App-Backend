import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

export const verifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found." });

    // Check if OTP is valid
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP.", error });
  }
};


export const verifyVendorOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find vendor by email
    const vendor = await Vendor.findOne({ email });

    if (!vendor) return res.status(400).json({ message: "User not found." });

    // Check if OTP is valid
    if (vendor.otp !== otp || vendor.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Mark user as verified
    vendor.isVerified = true;
    vendor.otp = null;
    vendor.otpExpires = null;
    await vendor.save();

    res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error verifying OTP.", error });
  }
};
