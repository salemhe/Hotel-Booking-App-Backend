import Menu from "../models/Menu.js"; 
import Vendor from "../models/Vendor.js"; 

export const createMenu = async (req, res) => {

  try {

    if (!req.user || !req.user.vendorId) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const { vendorId } = req.user; // Assuming authentication middleware sets req.user
    const { itemName, description, price, category } = req.body;
    const itemImage = req.file ? req.file.filename : null;

    // Check if the vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Validate required fields
    if (!itemName || !price || !category) {
      return res
        .status(400)
        .json({ message: "itemName, price, and category are required" });
    }

    // Create new menu item
    const newMenu = new Menu({
      vendor: vendorId,
      itemName,
      description,
      price,
      category,
      itemImage,
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
