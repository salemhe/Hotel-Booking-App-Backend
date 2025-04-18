import { CursorTimeoutMode } from "mongodb";
import Vendor from "../models/Vendor.js";

export const createPaymentDetails = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  if (!PAYSTACK_SECRET_KEY) {
    return res
      .status(500)
      .json({ message: "Paystack secret key not configured." });
  }
  
  const createAccountOnPaystack = async (data) => {
    const response = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log("Paystack API Error:", response.statusText);
      throw new Error(`Error: ${response.statusText}`);
    }
    const responseData = await response.json();
    return responseData;
  };

  try {
    if (!req.user || !req.user.vendorId) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No vendor ID found" });
    }

    const { vendorId } = req.user;

    const { bank_code, account_number, name } =
      req.body;

    if ( !bank_code || !account_number || !name) {
      return res
        .status(400)
        .json({ message: "All Account details are required." });
    }



    const accountData = {
      type: "nuban",
      name,
      account_number,
      bank_code,
      currency: "NGN",
    };

    const paystackResponse = await createAccountOnPaystack(accountData);
    if (paystackResponse.status === false) {
      return res.status(500).json({ message: paystackResponse.message });
    }

    const updatedUser = await Vendor.findByIdAndUpdate(
      vendorId,
      {
        paymentDetails: {
          bank_code,
          account_number,
          paystackCode: paystackResponse.data.recipient_code,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(201).json({
      message: "Payment Details Added successfully.",
      data: paystackResponse.data,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Payment Details Error:", error);

    res.status(500).json({
      message: "Error Adding your Payment Details.",
      error: error.message || "Unknown server error",
    });
  };
};
