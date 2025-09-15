import { Vendor } from "../models/Vendor.js";
import { generateOTP } from "../utils/otpUtils.js";
import { sendOTPEmail } from "../utils/emailService.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();



cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const registerVendor = async (req, res) => {
  try {
    const {
      businessName,
      businessType,
      email,
      phone,
      address,
      branch,
      password,
      role,
      image,
      services,
    } = req.body;

    let profileImage = image || null;

   
    if (req.file) {
      const cloudinaryResponse = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "vendor-profiles",
        public_id: `vendor-${Date.now()}`,
        overwrite: true,
      });
      profileImage = cloudinaryResponse.secure_url;
    }

    // Validate input
    if (!businessName || !businessType || !email || !phone || !address || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // no duplicate email allowed
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      //       const hashedPassword = await bcrypt.hash(password, 10);
      // console.log("Hashed Password:", hashedPassword); // FOR TEST REHASING OLD PASSWORDS THAT DON'T LOGIN: WILL REMOVE LATER
      return res.status(409).json({ message: "Vendor with this email already exists." });
    }


    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // Hash the password
   
    //  OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000));

  
    const newVendor = new Vendor({
      businessName,
      businessType,
      email,
      phone,
      address,
      branch,
      password,
      role,
      profileImage, 
      services,
      otp,
      otpExpires,
      isVerified: false,
    });

    await newVendor.save();


    await sendOTPEmail(email, otp, minutesLeft);

    const { password: _, otp: otpField, ...vendorWithoutSensitiveData } = newVendor.toObject();

    res.status(201).json({
      message: "Vendor added successfully.",
      vendor: vendorWithoutSensitiveData,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {

      return res.status(409).json({ message: "Duplicate email error." });
    }
    res.status(500).json({
      
      message: "Error adding vendor.",
      error: error.message,
    });
  }
};
