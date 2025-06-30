// import Vendor from "../models/Vendor.js";
// import Hotel from "../models/Hotel.js";
// import Restaurant from "../models/Restaurant.js";
// import dotenv from "dotenv";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { v4 as uuidv4 } from "uuid";
// import cloudinary from "cloudinary";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config();

// // Cloudinary Configuration
// cloudinary.v2.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const uploadToCloudinary = async (filePath) => {
//   const uniqueId = uuidv4();
//   const response = await cloudinary.v2.uploader.upload(filePath, {
//     folder: "vendor-profiles",
//     public_id: `vendor-${uniqueId}`,
//     overwrite: true,
//   });
//   return {
//     id: uniqueId,
//     url: response.secure_url,
//   };
// };

// export const onboard = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const vendorId = req.vendor.id;
//     if (id !== vendorId) {
//       return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
//     }

//     const {
 
//       profileImage,
//       businessDescription,
//       address,
//       city,
//       state,
//       country,
//       openTime,
//       closeTime,
//       accountNumber,
//       bankCode,
//       website,


//       roomNumber, 
//       roomType,
//       price ,
//       capacity, 
//       feature,
//       amenities, 
//       roomImage ,
//       roomDescription, 
//       isAvailable,
//       maintenanceStatus,
//       stars,


//       addOns,
//       availabilityStatus, 
//       category,
//       cuisines,
//       cuisineType,
//       dietaryInfo,
//       discountPrice,
//       dishName,
//       description, 
//       dishImage,
//       itemImage ,
//       maxOrderPerCustomer,
//       portionSize ,
//       preparationTime,
//       spiceLevel,
//       stockQuality,
      
//     } = req.body;

//     const vendor = await Vendor.findById(vendorId);
        
//     if (!vendor) {
//       return res.status(404).json({ message: "Vendor not found" });
//     }

//     if (      
//       !businessDescription||
//       !address||
//       !city||
//       !state||
//       !country||
//       !openTime||
//       !closeTime||
//       !accountNumber||
//       !bankCode
//     ) {
//       return res.status(400).json({ message: "Fill all required fields." });
//     }

   


//     if (req.files && Array.isArray(req.files) && req.files.length > 0) {
//       const imageUrls = [];

//       for (const file of req.files) {
//         // Create a temporary path to save buffer
//         const tempFilePath = path.join(
//           __dirname,
//           `${uuidv4()}-${file.originalname}`
//         );

//         // Write the buffer to disk

//         fs.writeFileSync(tempFilePath, file.buffer);

//         try {
//           // Upload using your existing function
//           const cloudinaryUrl = await uploadToCloudinary(tempFilePath);
//           imageUrls.push(cloudinaryUrl);
//         } finally {
//           // Clean up the temp file
//           fs.unlinkSync(tempFilePath);
//         }
//       }

//       vendor.profileImages = imageUrls;
//     }

//     let subaccountUpdateData = null;
//     if (bankCode && (bankCode || accountNumber)) {
//       const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

//       if (!PAYSTACK_SECRET_KEY) {
//         return res
//           .status(500)
//           .json({ message: "Paystack secret key not configured." });
//       }
//       const recipientPayload = {
//         type: "nuban",
//         business_name: vendor.businessName,
//         account_number: accountNumber,
//         bank_code: bankCode,
//         currency: "NGN",
//         percentage_charge: 8,
//       };

//       const recipientResponse = await fetch(
//         "https://api.paystack.co/subaccount",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(recipientPayload),
//         }
//       );

//       const recipientData = await recipientResponse.json();
//       if (!recipientResponse.ok || recipientData.status === false) {
//         console.error("Recipient Error:", recipientData);
//         return res.status(500).json({
//           message: "Failed to create recipient.",
//           error: recipientData.message || "Unknown error",
//         });
//       }
//       subaccountUpdateData = recipientData.data;
//     }

//     if (cuisines > 0) vendor.cuisines = cuisines;
//     if (businessDescription) vendor.businessDescription = businessDescription;
//     if (openTime) vendor.openTime = openTime;
//     if (closeTime) vendor.closeTime = closeTime;
//     if (availableSlots) vendor.availableSlots = availableSlots;
//     if (website) vendor.website = website;
//     if (priceRange) vendor.priceRange = priceRange;
//     vendor.percentageCharge = 8;

//     vendor.paymentDetails = {
//       ...vendor.paymentDetails,
//       ...(bankCode && { bankCode }),
//       ...(accountNumber && { accountNumber }),
//       ...(subaccountUpdateData?.subaccount_code && {
//         paystackSubAccount: subaccountUpdateData.subaccount_code,
//       }),
//     };
//     vendor.onboarded = true;

//     await vendor.save();

//     if (Vendor.businessType === "hotel") {
//           const newHotel = new Hotel({
//             vendorId: vendorId,
//             roomNumber, 
//             roomType,
//             price ,
//             capacity, 
//             feature,
//             amenities, 
//             roomImage ,
//             roomDescription, 
//             isAvailable,
//             maintenanceStatus,
//             stars,
//           })

//         await newHotel.save()
//     }



//     if (vendor.businessType === "restaurant") {
//           const newRestaurant = new Restaurant({
//             vendorId: vendorId,
//             addOns,
//             availabilityStatus, 
//             category,
//             cuisines,
//             cuisineType,
//             dietaryInfo,
//             discountPrice,
//             dishName,
//             description, 
//             dishImage,
//             itemImage ,
//             maxOrderPerCustomer,
//             portionSize ,
//             preparationTime,
//             price,
//             spiceLevel,
//             stockQuality,
//             stars
//           })

//         await newRestaurant.save()
//     }



//     return res.status(200).json({
//       message: "Vendor onboarded successfully.",
//       vendorId: id,
//     });
//   } catch (error) {
//     console.error("Error onboarding vendor:", error);
//     return res.status(500).json({ message: "Error onBoarding User.", error });
//   }
// };




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

      roomNumber,
      roomType,
      price,
      capacity,
      features,
      amenities,
      roomImages,
      roomDescription,
      isAvailable,
      maintenanceStatus,
      stars,

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
      spiceLevel,
      stockQuantity,
    } = req.body;

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
    if (uploadedImages.profileImage) vendor.profileImages = uploadedImages.profileImage;

    // Payment info via Paystack
    // const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    // if (!PAYSTACK_SECRET_KEY) {
    //   return res.status(500).json({ message: "Paystack key not configured." });
    // }

    // const recipientPayload = {
    //   type: "nuban",
    //   business_name: vendor.businessName,
    //   account_number: accountNumber,
    //   bank_code: bankCode,
    //   currency: "NGN",
    //   percentage_charge: 8,
    // };

    // const recipientResponse = await fetch("https://api.paystack.co/subaccount", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(recipientPayload),
    // });

    // const recipientData = await recipientResponse.json();
    // if (!recipientResponse.ok || !recipientData.status) {
    //   return res.status(500).json({ message: "Paystack error", error: recipientData.message });
    // }

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
      // paystackSubAccount: recipientData.data.subaccount_code,
    };

    if (cuisines?.length) vendor.cuisines = cuisines;

    await vendor.save();

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
          country
        },
        openTime,
        closeTime,
        website,
        rooms:[
            {
                roomNumber,
                roomType,
                price,
                capacity,
                features,
                amenities,
                roomImages: [uploadedImages.roomImages || null],
                roomDescription,
                isAvailable,
                maintenanceStatus,
            }
        ],
        stars
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
          country
        },
        openTime,
        closeTime,
        website,
        cuisines,
        menus:[
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
          }
        ],
        stars,
        dishImage: uploadedImages.dishImage || null,
        itemImage: uploadedImages.itemImage || null,
      });
      await restaurant.save();
    }

    return res.status(200).json({
      message: "Vendor onboarded successfully.",
      vendorId,
    });
  } catch (error) {
    console.error("Onboarding Error:", error);
    return res.status(500).json({ message: "Error onboarding vendor.", error });
  }
};

