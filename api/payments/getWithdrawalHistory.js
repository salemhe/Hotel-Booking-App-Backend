// controllers/withdrawalHistory.js
import { Vendor } from "../models/Vendor.js";

export const getWithdrawalHistory = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor.id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const vendor = await Vendor.findById(req.vendor.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Withdrawal history fetched successfully.",
      withdrawals: vendor.withdrawals,
    });

  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({ message: "Error fetching withdrawal history" });
  }
};

