import Menu from "../models/Menu.js";

export const deleteMenu = async (req, res) => {
  try {
    const vendorId = req.vendor?.id;
    const vendorIdFromParams = req.params.id;

    if (vendorId !== vendorIdFromParams) {
      return res.status(403).json({ message: "Unauthorized: Wrong vendor ID" });
    }

    const menus = await Menu.deleteOne(vendorId);

    res.status(200).json({ success: true, menus, message: "Deleted Successfully" });
  } catch (error) {
    console.error("Error fetching menus:", error);
    res
      .status(500)
      .json({ message: "Error fetching menus.", error: error.message });
  }
};
