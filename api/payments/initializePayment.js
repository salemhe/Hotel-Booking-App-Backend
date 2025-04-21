import Vendor from "../models/Vendor.js";

export const initializePayment = async (req, res) => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(403)
        .json({ message: "Unauthorized: No User ID found" });
    }

    const { amount, email, vendorId } = req.body;

    if (!amount || !email || !vendorId) {
      return res
        .status(400)
        .json({ message: "Amount and email are required." });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return res
        .status(500)
        .json({ message: "Paystack secret key not configured." });
    }

    // const paymentData = {
    //   amount: amount * 100, // Paystack expects the amount in kobo
    //   email: email,
    //   currency: "NGN",
    // };
    const vendor = await Vendor.findById(vendorId);
    if (!vendor || !vendor.paymentDetails || !vendor.paymentDetails.paystackSubAccount) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const paymentData = {
      email: email,
      amount: amount * 100, 
      currency: "NGN",
      subaccount: vendor.paymentDetails.paystackSubAccount, // vendor's subaccount
      percentage_charge: vendor.paymentDetails.percentageCharge,
      // callback_url: "https://yourdomain.com/verify-payment",
      metadata: {
        vendorId: vendorId
      }
    }
    

    const createPaymentOnPaystack = async (data) => {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return responseData;
    };

    const paystackResponse = await createPaymentOnPaystack(paymentData);

    if (paystackResponse.status === false) {
      return res.status(500).json({ message: paystackResponse.message });
    }

    res
      .status(200)
      .json({
        messaage: "success",
        data: {
          authorization_url: paystackResponse.data.authorization_url,
          ref: paystackResponse.data.reference,
        },
      });
  } catch (error) {
    console.error("Error Initializing Payment:", error);

    res.status(500).json({
      message: "Error Verifying Payment",
      error: error.message || "Unknown server error",
    });
  }
};
