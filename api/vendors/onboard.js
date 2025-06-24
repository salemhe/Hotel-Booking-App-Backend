import Vendor from "../models/Vendor.js";
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

export const onboard = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    if (id !== vendorId) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const {
      bankName,
      bankCode,
      accountNumber,
      bankAccountName,
      percentageCharge,
      paystackSubAccount,
      cuisines,
      businessDescription,
      openingTime,
      closingTime,
      availableSlots,
      website,
      priceRange,
    } = req.body;

    if (
      !bankName ||
      !bankCode ||
      !accountNumber ||
      !bankAccountName ||
      !percentageCharge ||
      !paystackSubAccount ||
      !cuisines ||
      !businessDescription ||
      !openingTime ||
      !closingTime ||
      !availableSlots ||
      !website ||
      !priceRange
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

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

    let subaccountUpdateData = null;
    if (
      paystackSubAccount &&
      (bankCode || accountNumber || percentageCharge || businessName)
    ) {
      const payload = {
        ...(businessName && { business_name: vendor.businessName }),
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
        return res.status(400).json({
          message: "Paystack subaccount update failed",
          error: result.message,
        });
      }
      subaccountUpdateData = result.data;
    }

    if (cuisines > 0) vendor.cuisines = cuisines;
    if (businessDescription) vendor.businessDescription = businessDescription;
    if (openingTime) vendor.openingTime = openingTime;
    if (closingTime) vendor.closingTime = closingTime;
    if (availableSlots) vendor.availableSlots = availableSlots;
    if (website) vendor.website = website;
    if (priceRange) vendor.priceRange = priceRange;

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
    vendor.onboarded = true;

    await vendor.save();

    return res.status(200).json({
      message: "Vendor onboarded successfully.",
      vendorId: id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error onBoarding User.", error });
  }
};
