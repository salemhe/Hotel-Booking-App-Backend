import Menu from "../models/Menu.js";

export const editMenu = async (req, res) => {
  try {
    const menuId = req.params.id;

    const { category } = req.body;

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }

    if (category) menu.category = category;
    await menu.save();

    res
      .status(200)
      .json({ success: true, menu, message: "Updated Menu Successfully" });
  } catch (error) {
    console.error("Error editing menu:", error);
    res
      .status(500)
      .json({ message: "Error editing menu.", error: error.message });
  }
};
