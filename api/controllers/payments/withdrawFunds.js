import Vendor from "../../models/Vendor.js";
import Transaction from '../../models/Transaction.js';

import fetch from "node-fetch";

export const withdrawFunds = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  const { amount } = req.body;

  if (!req.user || !req.user.vendorId) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  try {
    const vendor = await Vendor.findById(req.user.vendorId);
    if (!vendor || !vendor.paymentDetails?.recipientCode) {
      return res.status(404).json({ message: "Vendor or recipient info not found." });
    }

    if (vendor.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const transferPayload = {
      source: "balance",
      amount: amount * 100,
      recipient: vendor.paymentDetails.recipientCode,
      reason: "Vendor withdrawal",
    };

    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transferPayload),
    });

    const result = await response.json();

    if (!result.status) {
      return res.status(500).json({ message: result.message || "Transfer failed" });
    }

    // Optionally deduct from vendor balance
    vendor.balance -= amount;
    vendor.withdrawals.push({
      amount,
      date: new Date(),
      reference: result.data.reference,
    });
    await vendor.save();

    res.status(200).json({ message: "Withdrawal successful", data: result.data });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
