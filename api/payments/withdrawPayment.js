import { Vendor } from "../models/Vendor.js";
import Transaction from "../models/Transaction.js";
import { v4 as uuidv4 } from "uuid";

function generateReference() {
  return "transfer_" + uuidv4();
}

export const makeWithdrawal = async (req, res) => {
  try {
    if (!req.vendor || !req.vendor._id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No vendor ID found" });
    }

    const vendorId = req.vendor._id;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const { amount } = req.body;

    if (vendor.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Paystack secret key not configured." });
    }

    const recipientCode = vendor.paymentDetails.recipientCode;

    const reference = generateReference();

    // Create transfer record in DB (optional, but recommended)
    const newTransactionRecord = new Transaction({
      vendor: vendorId,
      type: "withdrawal",
      amount: amount,
      reference,
    });
    await newTransactionRecord.save();

    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amount * 100,
        recipient: recipientCode,
        reason: `${vendor.businessName} withdrawal`,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Paystack Transfer Error:", responseData);
          newTransactionRecord.status = "cancelled";
          newTransactionRecord.save()
      console.error(
        "Paystack Transfer Failed Response:",
        JSON.stringify(responseData, null, 2)
      );
      return res.status(500).json({
        message: "Failed to initiate transfer.",
        error: responseData.message || "Unknown error",
      });
    }

    const withdrawalRecord = {
      amount: amount,
      total: amount,
      reference: responseData.data.reference,
      transactionCode: responseData.data.transaction_code,
      status: responseData.data.status,
    };
    newTransactionRecord.status = responseData.data.status;
    newTransactionRecord.transactionCode = responseData.data.transaction_code;
    await newTransactionRecord.save();

    vendor.balance -= amount;

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
