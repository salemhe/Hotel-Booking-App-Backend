

import Vendor from "../models/Vendor.js";
import Hotel from "../models/Hotel.js";
import Restaurant from "../models/Restaurant.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import cloudinaryModule from "cloudinary";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Cloudinary Configuration
const cloudinary = cloudinaryModule.v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility function for image upload
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
    return result.secure_url;
  } finally {
    fs.unlinkSync(tempFilePath);
  }
};

export const onboard = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendor;

    if (id !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const {
      profileImages,
      businessDescription,
      address,
      city,
      state,
      country,
      openTime,
      closeTime,
      accountNumber,
      bankCode,
      website,
      // menuItems
    } = req.body;

    const menuItems = JSON.parse(req.body.menuItems);
    const rooms = JSON.parse(req.body.rooms);

    const {
      roomNumber,
      roomType,
      price: roomPrice,
      capacity,
      features,
      amenities,
      roomImages,
      roomDescription,
      isAvailable,
      maintenanceStatus,
      stars,
    } = rooms[0];

    const {
      addOns,
      availabilityStatus,
      category,
      cuisines,
      cuisineType,
      dietaryInfo,
      discountPrice,
      price,
      dishName,
      description,
      maxOrderPerCustomer,
      portionSize,
      preparationTime,
      spiceLevel,
      stockQuantity,
    } = menuItems[0];

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    if (
      !businessDescription ||
      !address ||
      !city ||
      !state ||
      !country ||
      !openTime ||
      !closeTime ||
      !accountNumber ||
      !bankCode
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Upload and assign images
    const uploadedImages = {};

    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        if (!Array.isArray(files)) continue;
        const imageFile = files[0]; // Take only the first image for each key
        if (imageFile?.buffer && imageFile?.originalname) {
          uploadedImages[key] = await uploadToCloudinary(
            imageFile.buffer,
            imageFile.originalname
          );
        }
      }
    }

    // Save profile image if provided
    if (uploadedImages.profileImage)
      vendor.profileImages = uploadedImages.profileImage;

    //Payment info via Paystack
    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: "Paystack key not configured." });
    }

    const recipientPayload = {
      type: "nuban",
      business_name: vendor.businessName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "NGN",
      percentage_charge: 8,
    };

    const recipientResponse = await fetch("https://api.paystack.co/subaccount", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipientPayload),
    });

    const recipientData = await recipientResponse.json();
    if (!recipientResponse.ok || !recipientData.status) {
      return res.status(500).json({ message: "Paystack error", error: recipientData.message });
    }

    // Update the vendor details
    vendor.businessDescription = businessDescription;
    vendor.openTime = openTime;
    vendor.closeTime = closeTime;
    vendor.address = address;
    vendor.city = city;
    vendor.state = state;
    vendor.country = country;
    vendor.website = website;
    vendor.percentageCharge = 8;
    vendor.onboarded = true;
    vendor.paymentDetails = {
      bankCode,
      accountNumber,
      paystackSubAccount: recipientData.data.subaccount_code,
    };

    if (cuisines?.length) vendor.cuisines = cuisines;

    // save to hotel model if businessType is hotel
    if (vendor.businessType === "hotel") {
      const hotel = new Hotel({
        vendorId,
        profileImages,
        businessDescription,
        location: {
          address,
          city,
          state,
          country,
        },
        openTime,
        closeTime,
        website,
        rooms: [
          {
            roomNumber,
            roomType,
            price: roomPrice,
            capacity,
            features,
            amenities,
            roomImages: [uploadedImages.roomImages || null],
            roomDescription,
            isAvailable,
            maintenanceStatus,
          },
        ],
        stars,
      });
      await hotel.save();
    }

    // save to restaurant model if businessType is restaurant
    if (vendor.businessType === "restaurant") {
      const restaurant = new Restaurant({
        vendorId,
        profileImages: uploadedImages.profileImages || null,
        businessDescription,
        location: {
          address,
          city,
          state,
          country,
        },
        openTime,
        closeTime,
        website,
        cuisines,
        menus: [
          {
            addOns,
            availabilityStatus,
            category,
            cuisines,
            cuisineType,
            dietaryInfo,
            discountPrice,
            dishName,
            description,
            maxOrderPerCustomer,
            portionSize,
            preparationTime,
            price,
            spiceLevel,
            stockQuantity,
          },
        ],
        stars,
        dishImage: uploadedImages.dishImage || null,
        itemImage: uploadedImages.itemImage || null,
      });
      await restaurant.save();
    }

    await vendor.save();

    return res.status(200).json({
      message: "Vendor onboarded successfully.",
      vendorId,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return res.status(500).json({ message: "Error onboarding vendor.", error });
  }
};
