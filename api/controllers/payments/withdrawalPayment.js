import Vendor from '../../models/Vendor.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // ✅ Required for fetch to work in Node.js
import Transaction from '../../models/Transaction.js';


dotenv.config(); // Make sure environment variables are loaded

export const makeWithdrawal = async (req, res) => {
  try {
    if (!req.user || !req.user.vendorId) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const { vendorId } = req.user;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: "Paystack secret key not configured." });
    }

    const { recipientCode, amount } = req.body;

    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100, // Convert Naira to Kobo
        recipient: recipientCode,
        reason: "Vendor Payout",
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Paystack Transfer Error:", responseData);
      return res.status(500).json({
        message: "Failed to initiate transfer.",
        error: responseData.message || "Unknown error",
      });
    }

    res.status(200).json({
      message: "Transfer initiated successfully.",
      transfer: responseData.data,
    });

  } catch (err) {
    console.error("Withdrawal Error:", err);
    res.status(500).json({ error: "Failed to initiate transfer" });
  }
};
