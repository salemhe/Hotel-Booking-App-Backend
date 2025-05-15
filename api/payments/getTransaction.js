
import Transaction from "../models/Transaction.js";
import mongoose from "mongoose";

export const getTransactions = async (req, res) => {
  try {
    const { vendorId, userId } = req.query;
    const query = {};

    if (vendorId?.trim() && mongoose.Types.ObjectId.isValid(vendorId.trim())) {
      query.vendor = vendorId.trim();
    }

    if (userId?.trim() && mongoose.Types.ObjectId.isValid(userId.trim())) {
      query.user = userId.trim();
    }

    const transactions = await Transaction.find(query);

    if (!transactions.length) {
      return res.status(404).json({ message: "No transactions found" });
    }

    res.status(200).json({ success: true, transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions.", error: error.message });
  }
};
