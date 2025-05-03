import Menu from "../models/Menu.js";

export const getMenusByVendor = async (req, res) => {
  try {
    const { vendorId, cuisineType, category, dishName } = req.params;
    const query =  {}

    if (vendorId) {
       query.vendorId = new RegExp(vendorId, "i")
    }
    if (cuisineType) {
       query.cuisineType = new RegExp(cuisineType, "i")
    }
    if (category) {
       query.category = new RegExp(category, "i")
    }
    if (dishName) {
       query.dishName = new RegExp(dishName, "i")
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
