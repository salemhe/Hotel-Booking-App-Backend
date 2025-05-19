import Menu from "../models/Menu.js";

export const getMenusByVendor = async (req, res) => {
  try {
    const { vendorId, cuisineType, category, dishName } = req.query;
    const query = {};

    if (vendorId?.trim()) {
      query.vendor = vendorId.trim();
    }

    if (cuisineType?.trim()) {
      query.cuisineType = { $regex: cuisineType.trim(), $options: "i" };
    }

    if (category?.trim()) {
      query.category = { $regex: category.trim(), $options: "i" };
    }

    if (dishName?.trim()) {
      query.dishName = { $regex: dishName.trim(), $options: "i" };
    }

    const menus = await Menu.find(query);

    if (!menus.length) {
      return res.status(404).json({ message: "No menus found" });
    }
    res.status(200).json({ success: true, menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res.status(500).json({ message: "Error fetching menus.", error: error.message });
  }
};
