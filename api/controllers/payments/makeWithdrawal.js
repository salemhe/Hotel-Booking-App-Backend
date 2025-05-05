
import Vendor from "../../models/Vendor.js";
import Transaction from '../../models/Transaction.js';
import fetch from "node-fetch"; // required for making the Paystack API call

export const makeWithdrawal = async (req, res) => {
  try {
    if (!req.user || !req.user.vendorId) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const vendor = await Vendor.findById(req.user.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return res.status(500).json({ message: "Paystack secret key not configured." });
    }

    const { amount } = req.body;
    const recipientCode = vendor.paymentDetails.recipientCode;

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
      return res.status(500).json({
        message: "Failed to initiate transfer.",
        error: responseData.message || "Unknown error",
      });
    }

    // ✅ The part you shared fits here:
    const withdrawalRecord = {
      amount: amount,
      transferId: responseData.data.reference,
      status: responseData.data.status, // "success" or "pending"
      recipientCode: recipientCode,
      createdAt: new Date(),
    };

    vendor.withdrawals.push(withdrawalRecord);
    await vendor.save();

    res.status(200).json({
      message: "Transfer initiated successfully.",
      transfer: responseData.data,
    });

  } catch (err) {
    console.error("Withdrawal Error:", err);
    res.status(500).json({ error: "Failed to initiate transfer" });
  }
};
