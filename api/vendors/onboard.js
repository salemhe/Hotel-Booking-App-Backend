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
    return {
      url: result.secure_url,
      id: result.public_id,
    };
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

    // const {
    //   profileImages,
    //   businessDescription,
    //   address,
    //   city,
    //   state,
    //   country,
    //   openTime,
    //   closeTime,
    //   accountNumber,
    //   bankCode,
    //   website,
    //   stars,
    //   rooms: [
    //     {
    //       roomNumber,
    //       roomType,
    //       price: roomPrice,
    //       capacity,
    //       features,
    //       amenities,
    //       roomImages,
    //       roomDescription,
    //       isAvailable,
    //       maintenanceStatus,
    //     },
    //   ],

    //   menus: [
    //     {
    //       addOns,
    //       availabilityStatus,
    //       category,
    //       cuisines,
    //       cuisineType,
    //       dietaryInfo,
    //       discountPrice,
    //       price,
    //       dishName,
    //       description,
    //       maxOrderPerCustomer,
    //       portionSize,
    //       preparationTime,
    //       spiceLevel,
    //       stockQuantity,
    //     }
    // ]

    // } = req.body;

    const {
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
      stars,
      cuisines,
      availableSlots,
      rooms,
      menus,
    } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });
    console.log("Vendor found:", vendor.businessType);

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

    let ParsedRooms = [];
    let ParsedMenus = [];
    let ParsedCuisines = [];
    let ParsedAvailablSlots = [];

    if (typeof rooms === "string") {
      try {
        ParsedRooms = JSON.parse(rooms);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'rooms' field" });
      }
    } else if (Array.isArray(rooms)) {
      ParsedRooms = rooms;
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

    if (typeof menus === "string") {
      try {
        ParsedMenus = JSON.parse(menus);
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid JSON in 'menus' field" });
      }
    } else if (Array.isArray(menus)) {
      ParsedMenus = menus;
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
    // Save profile image if provided
    if (uploadedImages.profileImages) vendor.profileImages = uploadedImages.profileImages;

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
    vendor.businessDescription = businessDescription;
    vendor.openingTime = openTime;
    vendor.closingTime = closeTime;
    vendor.address = address;
    // vendor.profileImages = uploadedImages.profileImages || null,
    vendor.branch = city;
    // vendor.state = state;
    // vendor.country = country;
    vendor.website = website;
    vendor.percentageCharge = 8;
    vendor.onboarded = true;
    vendor.paymentDetails = {
      bankCode,
      accountNumber,
      subaccountCode: recipientData.data.subaccount_code,
    };

    if (ParsedCuisines?.length) vendor.cuisines = ParsedCuisines;
    if (ParsedAvailablSlots?.length) vendor.availableSlots = ParsedAvailablSlots;

    // save to hotel model if businessType is hotel

    if (vendor.businessType === "hotel") {
      const hotel = new Hotel({
        vendorId,
        profileImages: uploadedImages.profileImages.map(image => (image.url)) || null,
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
        rooms: ParsedRooms,
        stars,
      });
      await hotel.save();
    }

    if (vendor.businessType === "restaurant") {
      const restaurant = new Restaurant({
        vendorId,
        profileImages: uploadedImages.profileImages.map(image => (image.url))  || null,
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
        menus: ParsedMenus,

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
    return res.status(500).json({
      message: "Error onboarding vendor. Can only onboard vendor once.",
      error,
    });
  }
};
