import Menu from "../models/Menu.js"; 
import Vendor from "../models/Vendor.js"; 

export const createMenu = async (req, res) => {

  try {

    if (!req.user || !req.user.vendorId) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const { vendorId } = req.user; // Assuming authentication middleware sets req.user
    const { addOns, availabilityStatus, category, cuisineType, dietaryInfo, discountPrice, dishName, description, image, maxOrderPerCustomer, portionSize, preparationTime, price, spiceLevel, stockQuantity } = req.body;
    const itemImage = req.file ? req.file.filename : image || null;  

    // Check if the vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Validate required fields
    if (!price || !category || !cuisineType || !dishName || !description || !availabilityStatus || !maxOrderPerCustomer || !stockQuantity) {
      return res
        .status(400)
        .json({ message: "itemName, price, and category are required" });
    }

    // Create new menu item
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
      dishImage: `https://hotel-booking-app-backend-30q1.onrender.com/uploads/${itemImage}`,
      maxOrderPerCustomer,
      portionSize,
      preparationTime,
      price,
      spiceLevel,
      stockQuantity,
    });

    await newMenu.save();

    res
      .status(201)
      .json({ message: "Menu item created successfully", menu: newMenu });
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
