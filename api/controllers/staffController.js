import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

// GET /api/staff?vendorId={vendorId}
export const getStaffByVendor = async (req, res) => {
  try {
    const { vendorId } = req.query;
    if (!vendorId) {
      return res.status(400).json({ message: "vendorId query parameter is required" });
    }
    // Optionally, check if vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    // Assuming staff are users with a reference to vendorId
    const staff = await User.find({ vendor: vendorId })
      .select("_id name role branch status")
      .lean();
    // Format response to match example
    const formatted = staff.map(s => ({
      id: s._id,
      name: s.name,
      role: s.role,
      branch: s.branch || "-",
      status: s.status || "Active"
    }));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching staff", error: err.message });
  }
};
