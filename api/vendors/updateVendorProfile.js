import { Vendor } from "../models/Vendor.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function: Upload image to Cloudinary
const uploadToCloudinary = async (filePath) => {
  const uniqueId = uuidv4();
  const response = await cloudinary.v2.uploader.upload(filePath, {
    folder: "vendor-profiles",
    public_id: `vendor-${uniqueId}`,
    overwrite: true,
  });
  return {
    id: uniqueId,
    url: response.secure_url,
  };
};

// Vendor Profile Update
export const updateVendorProfile = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

  if (!PAYSTACK_SECRET_KEY) {
    return res
      .status(500)
      .json({ message: "Paystack secret key not configured." });
  }
  try {

    const { id } = req.params;
    const vendorId = req.vendor;


    if (id !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const {
      businessName,
      businessType,
      openingTime,
      closingTime,
      businessDescription,
      cuisines,
      availableSlots,
      rating,
      reviews,
      phone,
      address,
      branch,
      role,
      services,
      bankCode,
      accountNumber,
    } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Parse services
    let servicesArray = [];
    if (services) {
      try {
        servicesArray =
          typeof services === "string" ? JSON.parse(services) : services;
        if (!Array.isArray(servicesArray)) throw new Error();
      } catch {
        return res.status(400).json({
          message: "Invalid services format. Must be an array or JSON array.",
        });
      }
    }

    // Upload profile image to Cloudinary if provided
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const imageUrls = [];

      for (const file of req.files) {
        // Create a temporary path to save buffer
        const tempFilePath = path.join(
          __dirname,
          `${uuidv4()}-${file.originalname}`
        );

        // Write the buffer to disk
        fs.writeFileSync(tempFilePath, file.buffer);

        try {
          // Upload using your existing function
          const cloudinaryUrl = await uploadToCloudinary(tempFilePath);
          imageUrls.push(cloudinaryUrl);
        } finally {
          // Clean up the temp file
          fs.unlinkSync(tempFilePath);
        }
      }

      vendor.profileImages = imageUrls;
    }

    let recipientDatas = {};

    if (businessName && bankCode && accountNumber) {
      const recipientPayload = {
        type: "nuban",
        business_name: businessName,
        account_number: accountNumber,
        bank_code: bankCode,
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
      recipientDatas = recipientData;
      if (!recipientResponse.ok || recipientData.status === false) {
        console.error("Recipient Error:", recipientData);
        return res.status(500).json({
          message: "Failed to create recipient.",
          error: recipientData.message || "Unknown error",
        });
      }
    }

    // Update fields if provided
    if (businessName) vendor.businessName = businessName;
    if (businessType) vendor.businessType = businessType;
    if (openingTime) vendor.openingTime = openingTime;
    if (closingTime) vendor.closingTime = closingTime;
    if (businessDescription) vendor.businessDescription = businessDescription;
    if (cuisines) vendor.cuisines = cuisines;
    if (availableSlots) vendor.availableSlots = availableSlots;
    if (rating) vendor.rating = rating;
    if (reviews) vendor.reviews = reviews;
    if (phone) vendor.phone = phone;
    if (address) vendor.address = address;
    if (branch) vendor.branch = branch;
    if (role) vendor.role = role;
    if (servicesArray.length > 0) vendor.services = servicesArray;

    // Update payment details conditionally
    if (recipientDatas)
      (vendor.paymentDetails = {
          bankCode,
          accountNumber: recipientDatas.data.account_number,
          subaccountCode: recipientDatas.data.subaccount_code,
      }),
        await vendor.save();

    res.status(200).json({
      message: "Vendor record updated successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
