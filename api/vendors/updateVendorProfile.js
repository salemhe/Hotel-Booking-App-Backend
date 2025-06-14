import Vendor from "../models/Vendor.js";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from 'cloudinary';

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
  const response = await cloudinary.v2.uploader.upload(filePath, {
    folder: "vendor-profiles",
    public_id: `vendor-${Date.now()}`,
    overwrite: true,
  });
  return response.secure_url;
};

// Vendor Profile Update
export const updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.vendor?.id || req.body.id;
    const vendorIdFromParams = req.params.id;

    if (vendorId !== vendorIdFromParams) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const {
      businessName,
      businessType,
      phone,
      address,
      branch,
      role,
      services,
      bankName,
      bankCode,
      accountNumber,
      bankAccountName,
      percentageCharge,
      paystackSubAccount,
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
        return res
          .status(400)
          .json({
            message: "Invalid services format. Must be an array or JSON array.",
          });
      }
    }

    // Upload profile image to Cloudinary if provided
if (req.files && Array.isArray(req.files) && req.files.length > 0) {
  const imageUrls = [];

  for (const file of req.files) {
    // Create a temporary path to save buffer
    const tempFilePath = path.join(__dirname, `${uuidv4()}-${file.originalname}`);
    
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


    // Paystack subaccount update (optional)
    let subaccountUpdateData = null;
    if (
      paystackSubAccount &&
      (bankCode || accountNumber || percentageCharge || businessName)
    ) {
      const payload = {
        ...(businessName && { business_name: businessName }),
        ...(bankCode && { settlement_bank: bankCode }),
        ...(accountNumber && { account_number: accountNumber }),
        ...(percentageCharge && {
          percentage_charge: Number(percentageCharge),
        }),
      };

      const response = await fetch(
        `https://api.paystack.co/subaccount/${paystackSubAccount}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (!result.status) {
        return res
          .status(400)
          .json({
            message: "Paystack subaccount update failed",
            error: result.message,
          });
      }
      subaccountUpdateData = result.data;
    }

    // Update fields if provided
    if (businessName) vendor.businessName = businessName;
    if (businessType) vendor.businessType = businessType;
    if (phone) vendor.phone = phone;
    if (address) vendor.address = address;
    if (branch) vendor.branch = branch;
    if (role) vendor.role = role;
    if (servicesArray.length > 0) vendor.services = servicesArray;

    // Update payment details conditionally
    vendor.paymentDetails = {
      ...vendor.paymentDetails,
      ...(bankName && { bankName }),
      ...(bankCode && { bankCode }),
      ...(accountNumber && { accountNumber }),
      ...(bankAccountName && { bankAccountName }),
      ...(percentageCharge && { percentageCharge: Number(percentageCharge) }),
      ...(subaccountUpdateData?.subaccount_code && {
        paystackSubAccount: subaccountUpdateData.subaccount_code,
      }),
    };

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
