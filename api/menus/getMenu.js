import Menu from "../models/Menu.js";

export const getMenusByVendor = async (req, res) => {
  try {
    const { vendorId, cuisineType, category, dishName } = req.params;
    const query =  {}


    if (vendorId && mongoose.Types.ObjectId.isValid(vendorId)) {
       query.vendor = vendorId
    }
    if (cuisineType) {
       query.cuisineType = { $regex: cuisineType, $options: "i" };
    }
    if (category) {
       query.category = { $regex: category, $options: "i" };
    }
    if (dishName) {
       query.dishName = { $regex: dishName, $options: "i" };
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
