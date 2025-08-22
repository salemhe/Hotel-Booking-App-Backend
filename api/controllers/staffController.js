import User from "../models/User.js";
import Staff from "../models/Staff.js";
import { generateOTP } from "../../utils/otpUtils.js";
import { sendOTPEmail } from "../../utils/emailService.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";
import dotenv from "dotenv";

// GET /api/staff?vendorId={vendorId}

dotenv.config();



cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createStaff = async (req, res) => {
  try {
    const {
      staffName,
      email,
      phone,
      staffId,
      branch,
      jobTitle,
      jobRole,
      image,
      customPermissions,
      password, // you missed this earlier
    } = req.body;

    let profileImage = image || null;

    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    // If file uploaded, push to cloudinary
    if (req.file) {
      const cloudinaryResponse = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "vendor-profiles",
        public_id: `staff-${Date.now()}`,
        overwrite: true,
      });
      profileImage = cloudinaryResponse.secure_url;
    }

    // Validate required fields
    if (!staffName || !staffId || !email || !phone || !branch || !jobRole) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    // Check duplicate email
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(409).json({ message: "Staff with this email already exists." });
    }


    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 min

    const newStaff = new Staff({
      staffName,
      email,
      phone,
      staffId,
      vendorId: req.vendor._id,
      branch,
      jobRole,
      jobTitle,
      password,
      customPermissions: customPermissions ? customPermissions.map((permission) => ({
        permissionModule: permission.permissionModule,
        permissions: permission.permissions || [],
      })) : [],
      profileImage,
      isVerified: false,
      otp,
      otpExpiry,
    });

    await newStaff.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    return res.status(201).json({
      message: "Staff created successfully. Verification OTP sent to email.",
      staff: {
        id: newStaff._id,
        vendorId: newStaff.vendorId,
        staffName: newStaff.staffName,
        email: newStaff.email,
        phone: newStaff.phone,
        branch: newStaff.branch,
        jobTitle: newStaff.jobTitle,
        jobRole: newStaff.jobRole,
        profileImage: newStaff.profileImage,
        isVerified: newStaff.isVerified,
      },
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


// POST /api/staff/verify


export const verifyStaff = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Check if already verified
    if (staff.isVerified) {
      return res.status(400).json({ message: "Staff is already verified." });
    }

    // Check OTP validity
    if (staff.otp !== otp) {
      console.log("Invalid OTP provided:", otp, "Expected:", staff.otp);
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check OTP expiry
    if (Date.now() > staff.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Update staff verification
    staff.isVerified = true;
    // staff.otp = undefined; // clear OTP
    // staff.otpExpiry = undefined;

    await staff.save();

    return res.status(200).json({
      message: "Staff account verified successfully.",
      staff: {
        id: staff._id,
        staffName: staff.staffName,
        email: staff.email,
        phone: staff.phone,
        branch: staff.branch,
        jobRole: staff.jobRole,
        jobTitle: staff.jobTitle,
        profileImage: staff.profileImage,
        isVerified: staff.isVerified,
      },
    });
  } catch (error) {
    console.error("Error verifying staff:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



export const getStaffByVendor = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ message: "vendorId query parameter is required" });
    }
    // Optionally, check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    // Assuming staff are users with a reference to vendorId
    const staff = await User.find({ vendor: vendorId })
      .select("_id name role branch status")
      .lean();
    // Format response to match example
    const formatted = staff.map(s => ({
      id: s._id,
      name: s.name,
      role: s.role,
      branch: s.branch || "-",
      status: s.status || "Active"
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching staff", error: err.message });
  }
};

export const getStaff = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }
    const staffs = await Staff.find({ vendorId: req.vendor._id }).select(
      "-password -otp -otpExpiry -__v" // exclude sensitive fields
    );

    return res.status(200).json({
      message: "Staff list fetched successfully.",
      count: staffs.length,
      staffs,
    });
  } catch (error) {
    console.error("Error fetching staff list:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

