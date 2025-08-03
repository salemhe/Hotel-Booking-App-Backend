import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const loginVendor = async (req, res, next) => {
  const { email, password } = req.body;
  // Try vendor login first
  let vendor = await Vendor.findOne({ email });
  if (vendor) {
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: vendor.id, type: "vendor" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const vendorProfile = {
      id: vendor.id,
      businessName: vendor.businessName,
      businessType: vendor.businessType,
      email: vendor.email,
      address: vendor.address,
      branch: vendor.branch,
      profileImage: vendor.profileImage,
      role: vendor.role,
      services: vendor.services,
      paymentDetails: vendor.paymentDetails,
      token: token,
      onboarded: vendor.onboarded,
      type: "vendor"
    };
    // Set vendor-token cookie for cross-origin authentication
    res.cookie("vendor-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    return res.status(200).json({ message: "Login successful.", profile: vendorProfile });
  }
  // Try branch login (User with businessType: "restaurant" or "hotel")
  let branch = await User.findOne({ email, businessType: { $in: ["restaurant", "hotel"] } });
  if (branch) {
    const isMatch = await bcrypt.compare(password, branch.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign({ id: branch.id, type: "branch" }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const branchProfile = {
      id: branch.id,
      email: branch.email,
      businessType: branch.businessType,
      firstName: branch.firstName,
      lastName: branch.lastName,
      phone: branch.phone,
      token: token,
      type: "branch"
    };
    // Set vendor-token cookie for cross-origin authentication
    res.cookie("vendor-token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    return res.status(200).json({ message: "Login successful.", profile: branchProfile });
  }
  // If neither found
  return res.status(400).json({ message: "Invalid email or password." });
};


