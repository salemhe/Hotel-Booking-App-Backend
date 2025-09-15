// api/controllers/authController.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import Staff from "../models/Staff.js";
import { Vendor } from "../models/Vendor.js";

dotenv.config();

export const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find staff by email
    const staff = await Staff.findOne({ email }).populate("vendorId"); // populate vendor for dashboard link

    if (!staff) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Check if account is verified
    if (!staff.isVerified) {
      return res.status(403).json({ message: "Staff account not verified." });
    }

    // Check if account is active
    if (staff.status !== "active") {
      return res.status(403).json({ message: "Staff account is not active." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Sign JWT with staff role + vendor link
    const token = jwt.sign(
      { id: staff.id, type: "staff", vendorId: staff.vendorId._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const staffProfile = {
      id: staff.id,
      staffName: staff.staffName,
      email: staff.email,
      phone: staff.phone,
      staffId: staff.staffId,
      vendorId: staff.vendorId._id,
      vendorBusinessName: staff.vendorId.businessName,
      branch: staff.branch,
      jobTitle: staff.jobTitle,
      jobRole: staff.jobRole,
      profileImage: staff.profileImage,
      customPermissions: staff.customPermissions,
      token,
      type: "staff"
    };

    // Set cookie (optional, same as vendor login)
    res.cookie("vendor-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000 // 1h
    });

    return res.status(200).json({
      message: "Staff login successful.",
      profile: staffProfile
    });
  } catch (error) {
    console.error("Error logging in staff:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
