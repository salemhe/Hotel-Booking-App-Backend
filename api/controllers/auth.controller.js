import jwt from "jsonwebtoken";
import {
  Vendor,
  HotelVendor,
  RestaurantVendor,
  ClubVendor,
} from "../models/Vendor.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateOTP } from "../utils/otpUtils.js";
import { sendOTPEmail } from "../utils/emailService.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import cloudinaryModule from "cloudinary";
import fetch from "node-fetch";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (fileBuffer, filename) => {
  const tempFilePath = path.join(__dirname, `${uuidv4()}-${filename}`);
  fs.writeFileSync(tempFilePath, fileBuffer);

  try {
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "vendor-assets",
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    });
    return {
      url: result.secure_url,
      id: result.public_id,
    };
  } finally {
    fs.unlinkSync(tempFilePath);
  }
};

export const loginVendor = async (req, res) => {
  const { email, password } = req.body;
  // Try vendor login first
  const vendor = await Vendor.findOne({ email });

  try {
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    const token = jwt.sign(
      {
        id: vendor._id,
        role: vendor.role,
        vendorType: vendor.vendorType,
        isOnboarded: vendor.isOnboarded,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    // Set token cookie for cross-origin authentication
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ message: "Login successful.", vendor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Error adding vendor.",
      error: err.message,
    });
  }
};

export const registerVendor = async (req, res) => {
  try {
    const { businessName, vendorType, email, phone, address, password } =
      req.body;

    // Validate input
    if (
      !businessName ||
      !vendorType ||
      !email ||
      !phone ||
      !address ||
      !password
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // no duplicate email allowed
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res
        .status(409)
        .json({ message: "Vendor with this email already exists." });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    //  OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000));

    const data = {
      businessName,
      email,
      phone,
      address,
      password,
      otp,
      otpExpires,
    };

    let newVendor;

    switch (vendorType) {
      case "hotel":
        newVendor = await HotelVendor.create(data);
        break;
      case "restaurant":
        newVendor = await RestaurantVendor.create(data);
        break;
      case "club":
        newVendor = await ClubVendor.create(data);
        break;
      default:
        return res.status(400).json({ message: "Invalid vendor type" });
    }

    await sendOTPEmail(email, otp, minutesLeft);

    const {
      password: _,
      otp: otpField,
      ...vendorWithoutSensitiveData
    } = newVendor.toObject();

    const token = jwt.sign(
      {
        id: newVendor._id,
        role: newVendor.role,
        vendorType: newVendor.vendorType,
        isOnboarded: newVendor.isOnboarded,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    // Set token cookie for cross-origin authentication
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: "Vendor created successfully",
      vendor: vendorWithoutSensitiveData,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate email error." });
    }
    return res.status(500).json({
      message: "Error adding vendor.",
      error: error.message,
    });
  }
};

export const onboardVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorId, vendorType } = req.vendor;

    if (id !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const {
      businessDescription,
      openingTime,
      closingTime,
      accountNumber,
      bankCode,
      subaccountCode,
      website,
      cuisines,
      availableSlots,
      categories,
      slots,
      bankName,
      priceRange,
      offer,
      dressCode,
      ageLimit,
      branch,
    } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    console.log("Vendor found:", vendor.businessType);

    if (
      !businessDescription ||
      !accountNumber ||
      !bankCode ||
      !bankName ||
      !subaccountCode ||
      !priceRange ||
      !branch
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (vendorType === "hotel") {
      if (!offer)
        return res
          .status(400)
          .json({ message: "Missing Hotel required fields." });
    }
    if (vendorType === "restaurant") {
      if (!openingTime || !closingTime || !cuisines || !availableSlots)
        return res
          .status(400)
          .json({ message: "Missing Restaurant required fields." });
    }
    if (vendorType === "club") {
      if (
        !openingTime ||
        !closingTime ||
        !slots ||
        !categories ||
        !offer ||
        !dressCode ||
        !ageLimit
      )
        return res
          .status(400)
          .json({ message: "Missing Club required fields." });
    }

    let ParsedCategories = [];
    let ParsedDressCodes = [];
    let ParsedCuisines = [];
    let ParsedAvailablSlots = [];

    if (typeof categories === "string") {
      try {
        ParsedCategories = JSON.parse(categories);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'categories' field" });
      }
    } else if (Array.isArray(categories)) {
      ParsedCategories = categories;
    }

    if (typeof cuisines === "string") {
      try {
        ParsedCuisines = JSON.parse(cuisines);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'cuisines' field" });
      }
    } else if (Array.isArray(cuisines)) {
      ParsedCuisines = cuisines;
    }

    if (typeof availableSlots === "string") {
      try {
        ParsedAvailablSlots = JSON.parse(availableSlots);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'availableSlots' field" });
      }
    } else if (Array.isArray(availableSlots)) {
      ParsedAvailablSlots = availableSlots;
    }

    if (typeof dressCode === "string") {
      try {
        ParsedDressCodes = JSON.parse(dressCode);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'dressCode' field" });
      }
    } else if (Array.isArray(dressCode)) {
      ParsedDressCodes = dressCode;
    }

    // Upload and assign images
    const uploadedImages = {};

    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (!Array.isArray(files)) continue;

        for (const imageFile of files) {
          if (imageFile?.buffer && imageFile?.originalname) {
            const uploaded = await uploadToCloudinary(
              imageFile.buffer,
              imageFile.originalname
            );

            // Initialize the array if it doesn't exist
            if (!uploadedImages[key]) {
              uploadedImages[key] = [];
            }

            uploadedImages[key].push({
              url: uploaded.url,
              id: uploaded.id,
            });
          }
        }
      }
    }

    //Payment info via Paystack
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: "Paystack key not configured." });
    }

    const recipientPayload = {
      type: "nuban",
      business_name: vendor.businessName,
      account_number: accountNumber,
      settlement_bank: bankCode,
      currency: "NGN",
      percentage_charge: 8,
    };

    const recipientResponse = await fetch(
      "https://api.paystack.co/subaccount",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipientPayload),
      }
    );

    const recipientData = await recipientResponse.json();
    if (!recipientResponse.ok || !recipientData.status) {
      return res
        .status(500)
        .json({ message: "Paystack error", error: recipientData.message });
    }

    // Update the vendor details
    // Save profile image if provided
    if (uploadedImages.profileImages)
      vendor.profileImages = uploadedImages.profileImages;
    vendor.businessDescription = businessDescription;
    vendor.address = address;
    vendor.branch = branch;
    vendor.website = website;
    vendor.percentageCharge = 8;
    vendor.onboarded = true;
    vendor.paymentDetails = {
      bankCode,
      accountNumber,
      subaccountCode: recipientData.data.subaccount_code,
      bankName,
    };

    switch (vendorType) {
      case "hotel":
        updatedVendor = await HotelVendor.findById(id);
        updatedVendor.offer = offer;
        break;

      case "restaurant":
        updatedVendor = await RestaurantVendor.findById(id);
        if (ParsedCuisines?.length) updatedVendor.cuisines = ParsedCuisines;
        if (ParsedAvailablSlots?.length)
          updatedVendor.availableSlots = ParsedAvailablSlots;
        updatedVendor.openingTime = openingTime;
        updatedVendor.closingTime = closingTime;
        break;

      case "club":
        updatedVendor = await ClubVendor.findById(id);
        if (ParsedDressCodes?.length)
          updatedVendor.dressCode = ParsedDressCodes;
        if (ParsedCategories?.length)
          updatedVendor.categories = ParsedCategories;
        updatedVendor.openingTime = openingTime;
        updatedVendor.closingTime = closingTime;
        break;

      default:
        return res.status(400).json({ message: "Invalid vendor type" });
    }
    await updatedVendor.save();
    await vendor.save();

    return res.status(200).json({
      message: "Vendor onboarded successfully.",
      updatedVendor,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return res.status(500).json({
      message: "Error onboarding vendor. Can only onboard vendor once.",
      error,
    });
  }
};

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Checking if user already exists here
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); //OTP expires in 10min
    const minutesLeft = Math.round((otpExpires - Date.now()) / (60 * 1000));

    // Create the user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      profileImage,
      otp,
      otpExpires,
      isVerified: false,
    });
    await newUser.save();

    // Send OTP email
    await sendOTPEmail(email, otp, minutesLeft);

    const token = jwt.sign(
      {
        id: newUser._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user.", error });
  }
};


export const loginUser = (req, res, next) => {
  passport.authenticate("user-login", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ message: info ? info.message : "Login failed." });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: "user",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return res.status(200).json({ message: "Login successful.", user });
  })(req, res, next);
};
