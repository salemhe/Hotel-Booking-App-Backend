import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Reservation from "../models/Reservation.js";
// import Order from "../models/Order.js"; // Not present, so profits will be a placeholder

// Get reservations for a branch (by vendorId)
export const getBranchReservations = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findOne({ vendorId: id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Branch not found or has no restaurant data" });
    }
    // If you want to fetch reservations for a hotel branch, adjust logic here
    // For now, return empty array for restaurant branches
    return res.status(200).json({ success: true, data: [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching reservations", error: error.message });
  }
};

// Get profits for a branch (placeholder, as no Order model)
export const getBranchProfits = async (req, res) => {
  try {
    // If you have an Order model, aggregate profits here
    return res.status(200).json({ success: true, profits: 0 });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching profits", error: error.message });
  }
};

// Get dashboard data for a branch (aggregate info)
export const getBranchDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    const restaurant = await Restaurant.findOne({ vendorId: id });
    // Add more aggregation as needed
    return res.status(200).json({
      success: true,
      data: {
        user,
        restaurant,
        reservations: [], // Placeholder
        profits: 0 // Placeholder
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching dashboard data", error: error.message });
  }
};

// Public branches listing (no auth, paginated)
export const getPublicBranches = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { businessType: "restaurant" };
    const branches = await User.find(query)
      .select("-password -otp -otpExpires")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(query);
    return res.status(200).json({ success: true, data: branches, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching public branches", error: error.message });
  }
};
