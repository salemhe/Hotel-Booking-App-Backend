import User from "../models/User.js";
import Staff from "../models/Staff.js";
import { generateOTP } from "../../utils/otpUtils.js";
import { sendOTPEmail, sendStaffOTPEmail} from "../../utils/emailService.js";
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
      customPermissions
    } = req.body;

    let profileImage = "" || null;

    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    if (!req.file) {
      return res.status(400).json({message: "nO file"})
    }

    // If file uploaded, push to cloudinary
    // if (req.file) {
    //   const cloudinaryResponse = await cloudinary.v2.uploader.upload(req.file.path, {
    //     folder: "vendor-profiles",
    //     public_id: `staff-${Date.now()}`,
    //     overwrite: true,
    //   });
    //   profileImage = cloudinaryResponse.secure_url;
    //   console.log("Uploaded image to Cloudinary:", profileImage);
    // }

    if (req.file) {
      const streamUpload = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            {
              folder: "vendor-profiles",
              public_id: `staff-${Date.now()}`,
              overwrite: true,
            },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          stream.end(fileBuffer); // ⬅️ send buffer instead of path
        });
      };

      const cloudinaryResponse = await streamUpload(req.file.buffer);
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


    let parsedPermissions = [];
    if (customPermissions) {
      try {
        parsedPermissions = JSON.parse(customPermissions);
      } catch (err) {
        console.error("Invalid customPermissions JSON:", err);
      }
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
      customPermissions: parsedPermissions.map((p) => ({
        permissionModule: p.permissionModule,
        permissions: p.permissions || [],
      })),

      profileImage,
      isVerified: false,
      otp,
      otpExpiry,
    });

    await newStaff.save();

    // Send OTP email
    await sendStaffOTPEmail(email, otp);
    
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
        status: newStaff.status,
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
    const { email, otp, password } = req.body;

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
     
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check OTP expiry
    if (Date.now() > staff.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Update staff verification
    staff.isVerified = true;
    staff.password = password;
    staff.status = "active";
    staff.otp = undefined;
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
        status: staff.status,
      },
    });
  } catch (error) {
    console.error("Error verifying staff:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};




// GET /api/staff?search=John


export const getStaff = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }
    const { search } = req.query;

    let query = {};

    if (search) {
      const regex = new RegExp(search, "i"); // case-insensitive match
      query = {
        $or: [
          { staffName: regex },
          { email: regex },
          { jobRole: regex },
          { staffId: regex },
        ],
      };
    }

    const staffs = await Staff.find({ vendorId: req.vendor._id, ...query }).select(
      "-password -otp -otpExpiry -__v"
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



export const getStaffStats = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    // Current totals
    const totalStaff = await Staff.countDocuments({ vendorId: req.vendor._id });
    const activeStaff = await Staff.countDocuments({ status: "active", vendorId: req.vendor._id });
    const inactiveStaff = await Staff.countDocuments({ status: "inactive", vendorId: req.vendor._id });
    const noShowStaff = await Staff.countDocuments({ status: "no-show", vendorId: req.vendor._id });

    // Last week's totals
    const lastWeekTotal = await Staff.countDocuments({ createdAt: { $lt: lastWeek }, vendorId: req.vendor._id });
    const lastWeekActive = await Staff.countDocuments({ status: "active", createdAt: { $lt: lastWeek }, vendorId: req.vendor._id });
    const lastWeekInactive = await Staff.countDocuments({ status: "inactive", createdAt: { $lt: lastWeek }, vendorId: req.vendor._id });
    const lastWeekNoShow = await Staff.countDocuments({ status: "no-show", createdAt: { $lt: lastWeek }, vendorId: req.vendor._id });

    // Utility fn to calculate % change + trend direction
    const getChange = (current, previous) => {
      if (previous === 0 && current > 0) return { change: 100, trend: "up" };
      if (previous === 0 && current === 0) return { change: 0, trend: "neutral" };

      const diff = current - previous;
      const percent = ((diff / previous) * 100).toFixed(2);
      return {
        change: percent,
        trend: diff > 0 ? "up" : diff < 0 ? "down" : "neutral"
      };
    };

    return res.status(200).json({
      message: "Staff stats fetched successfully.",
      stats: {
        totalStaff: {
          count: totalStaff,
          ...getChange(totalStaff, lastWeekTotal)
        },
        activeStaff: {
          count: activeStaff,
          ...getChange(activeStaff, lastWeekActive)
        },
        inactiveStaff: {
          count: inactiveStaff,
          ...getChange(inactiveStaff, lastWeekInactive)
        },
        noShowStaff: {
          count: noShowStaff,
          ...getChange(noShowStaff, lastWeekNoShow)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


