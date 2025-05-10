import Vendor from "../models/Vendor.js";
import Transaction from "../models/Transaction.js";

export const makeWithdrawal = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res.status(403).json({ message: "Unauthorized: No vendor ID found" });
    }

    const vendorId = req.vendor._id;
    const vendor = await Vendor.findById(vendorId);
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
      console.error("Paystack Transfer Error:", responseData);
      console.error("Paystack Transfer Failed Response:", JSON.stringify(responseData, null, 2));
      return res.status(500).json({
        message: "Failed to initiate transfer.",
        error: responseData.message || "Unknown error",
      });
    }

    const withdrawalRecord = {
      amount: amount,
      reference: responseData.data.reference,
      status: responseData.data.status
    };

    const newTransactionRecord = new Transaction({
      vendor: vendorId,
      type: "withdrawal",
      amount: amount,
      reference: responseData.data.reference,
      status: responseData.data.status,
    });
    await newTransactionRecord.save();

    vendor.withdrawals.push(withdrawalRecord);
    await vendor.save();

 
    console.log("Withdrawal Record:", withdrawalRecord);

    res.status(200).json({
      message: "Transfer initiated successfully.",
      transfer: responseData.data,
    });

  } catch (err) {
    console.error("Withdrawal Error:", err);
    
    res.status(500).json({ error: "Failed to initiate transfer" });
  }
};
