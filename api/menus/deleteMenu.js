import Menu from "../models/Menu.js";

export const deleteMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    const menus = await Menu.deleteOne(menuId);

    res.status(200).json({ success: true, menus, message: "Deleted Successfully" });
  } catch (error) {
    console.error("Error Deleting menu:", error);
    res
      .status(500)
      .json({ message: "Error Deleting menu.", error: error.message });
  }
};
