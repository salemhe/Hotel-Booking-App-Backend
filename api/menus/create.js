import cloudinary from 'cloudinary';
import Menu from "../models/Menu.js";
import { Vendor } from "../models/Vendor.js";

export const createMenu = async (req, res) => {

  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const uploadToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        folder: 'menu_items',
        public_id: `menu-item-${Date.now()}`,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    stream.end(buffer);
  });
};


  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const vendorId = req.vendor._id; // Assuming authentication middleware sets req.user
    const { addOns, availabilityStatus, category, cuisineType, dietaryInfo, discountPrice, dishName, description, maxOrderPerCustomer, portionSize, preparationTime, price, spiceLevel, stockQuantity } = req.body;
    let itemImageUrl = null;

    // Check if the vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Validate required fields
    if (!price || !category || !cuisineType || !dishName || !description || !availabilityStatus || !maxOrderPerCustomer || !stockQuantity) {
      return res.status(400).json({ message: "price, category, and dishName are required" });
    }

    // Handle image upload to Cloudinary
    if (req.file) {
      const cloudinaryResponse = await uploadToCloudinary(req.file.buffer);

      itemImageUrl = cloudinaryResponse.secure_url; // This will be the URL of the uploaded image
    } else if (req.body.image) {
      itemImageUrl = req.body.image; // If there's already an image URL provided in the body
    }

    // Create new menu item with the Cloudinary image URL
    const newMenu = new Menu({
      vendor: vendorId,
      addOns,
      availabilityStatus,
      category,
      cuisineType,
      dietaryInfo,
      discountPrice,
      dishName,
      description,
      itemImage: itemImageUrl,
      maxOrderPerCustomer,
      portionSize,
      preparationTime,
      price,
      spiceLevel,
      stockQuantity,
    });

    await newMenu.save();

    res.status(201).json({ message: "Menu item created successfully", menu: newMenu });
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
