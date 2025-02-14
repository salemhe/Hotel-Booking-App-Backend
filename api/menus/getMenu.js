import Menu from "../models/Menu.js";

export const getMenusByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params; // Get vendor ID from URL params

    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const menus = await Menu.find({ vendor: vendorId });

    if (!menus.length) {
      return res
        .status(404)
        .json({ message: "No menus found for this vendor" });
    }

    res.status(200).json({ success: true, menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res
      .status(500)
      .json({ message: "Error fetching menus.", error: error.message });
  }
};
