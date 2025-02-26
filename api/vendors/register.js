
import Vendor from "../models/Vendor.js";
import { generateOTP } from "../../utils/otpUtils.js";
import { sendOTPEmail } from "../../utils/emailService.js";

import bcrypt from "bcrypt";

export const registerVendor = async (req, res) => {
  try {
    const {businessName,businessType, email, phone, address, branch, password, role, services } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    // Validate input
    if ( !businessName || !businessType || !email || !phone || !address || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check for duplicate email
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res
        .status(409)
        .json({ message: "Vendor with this email already exists." });
    }

    // Validate password length
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); //OTP expires in 
    const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000)); 

    // Create new vendor
    const newVendor = new Vendor({
    
      businessName,
      businessType,
      email,
      phone,
      address,
      branch,
      password: hashedPassword,
      role,
      profileImage,
      services,
      otp,
      otpExpires,
      isVerified: false,
    });

    // Save vendor to database
    await newVendor.save();

    // Send OTP email
    await sendOTPEmail(email, otp, minutesLeft);

    res
      .status(201)
      .json({ message: "Vendor added successfully.", vendor: newVendor });
  } catch (error) {
    console.log(error)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate email error." });
    }
    res.status(500).json({ message: "Error adding vendor.", error });
  }
};








